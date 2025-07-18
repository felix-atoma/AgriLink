import mongoose from 'mongoose';
import Order from '../models/Order.js';
import Product from '../models/Product.js';
import { successResponse, errorResponse } from '../utils/apiResponse.js';

// Constants
const PAYMENT_METHODS = {
  CASH: 'cash',
  CREDIT_CARD: 'credit_card',
  MOBILE_MONEY: 'mobile_money',
  PAYPAL: 'paypal'
};

const ORDER_STATUS = {
  PROCESSING: 'processing',
  SHIPPED: 'shipped',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled'
};

const PAYMENT_STATUS = {
  PENDING: 'pending',
  PAID: 'paid',
  FAILED: 'failed',
  REFUNDED: 'refunded'
};

// Helper function to validate order products
const validateOrderProducts = async (products, session) => {
  if (!products || !Array.isArray(products) || products.length === 0) {
    throw new Error('Products array is required with at least one item');
  }

  const validatedProducts = [];
  let total = 0;

  for (const item of products) {
    if (!item.product || !item.quantity || item.quantity <= 0) {
      throw new Error('Each product must have valid product ID and positive quantity');
    }

    if (!mongoose.Types.ObjectId.isValid(item.product)) {
      throw new Error(`Invalid product ID format: ${item.product}`);
    }

    const product = await Product.findById(item.product).session(session);
    if (!product) {
      throw new Error(`Product not found: ${item.product}`);
    }

    if (product.quantity < item.quantity) {
      throw new Error(`Insufficient quantity for ${product.name}. Available: ${product.quantity}`);
    }

    // Calculate item price and add to total
    const itemPrice = product.price * item.quantity;
    total += itemPrice;

    validatedProducts.push({
      product: product._id,
      name: product.name,
      image: product.image || '',
      quantity: item.quantity,
      price: product.price,
      farmer: product.farmer || product.user
    });

    // Update product quantity
    product.quantity -= item.quantity;
    await product.save({ session });
  }

  return { products: validatedProducts, total };
};

// CREATE ORDER
export const createOrder = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { products, shippingAddress, paymentMethod } = req.body;
    const buyer = req.user.id;

    // Validate payment method
    if (!paymentMethod || !Object.values(PAYMENT_METHODS).includes(paymentMethod)) {
      throw new Error(`Invalid payment method. Valid methods are: ${Object.values(PAYMENT_METHODS).join(', ')}`);
    }

    // Validate shipping address
    if (!shippingAddress?.street || !shippingAddress?.city || !shippingAddress?.country) {
      throw new Error('Complete shipping address (street, city, country) is required');
    }

    // Validate and process products
    const { products: orderProducts, total } = await validateOrderProducts(products, session);

    // Create the order
    const [order] = await Order.create([{
      buyer,
      products: orderProducts,
      total,
      shippingAddress,
      paymentMethod,
      status: ORDER_STATUS.PROCESSING,
      paymentStatus: PAYMENT_STATUS.PENDING
    }], { session });

    // Populate order details
    const populatedOrder = await Order.findById(order._id)
      .populate('products.product', 'name price image')
      .populate('buyer', 'name email')
      .session(session);

    await session.commitTransaction();

    return successResponse(res, populatedOrder, 201, 'Order created successfully');
  } catch (error) {
    await session.abortTransaction();
    console.error('Order creation error:', error.message);
    return errorResponse(res, error.message || 'Failed to create order', 400);
  } finally {
    session.endSession();
  }
};

// GET MY ORDERS (Buyer)
export const getOrders = async (req, res) => {
  try {
    const { status, page = 1, limit = 10, paymentMethod, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;
    const query = { buyer: req.user.id };

    // Build query filters
    if (status && Object.values(ORDER_STATUS).includes(status)) {
      query.status = status;
    }
    if (paymentMethod && Object.values(PAYMENT_METHODS).includes(paymentMethod)) {
      query.paymentMethod = paymentMethod;
    }

    // Validate pagination parameters
    const pageNumber = parseInt(page);
    const limitNumber = parseInt(limit);
    if (isNaN(pageNumber) || isNaN(limitNumber)) {
      return errorResponse(res, 'Invalid pagination parameters', 400);
    }

    const options = {
      page: pageNumber,
      limit: limitNumber,
      sort: { [sortBy]: sortOrder === 'desc' ? -1 : 1 },
      populate: [
        { path: 'products.product', select: 'name price image' },
        { path: 'buyer', select: 'name email' }
      ]
    };

    const orders = await Order.paginate(query, options);
    return successResponse(res, orders);
  } catch (error) {
    console.error('Get orders error:', error);
    return errorResponse(res, 'Failed to retrieve orders', 500);
  }
};

// GET RECEIVED ORDERS (Farmer)
export const getReceivedOrders = async (req, res) => {
  try {
    const { page = 1, limit = 10, status, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;

    const query = { 'products.farmer': req.user.id };
    if (status && Object.values(ORDER_STATUS).includes(status)) {
      query.status = status;
    }

    // Validate pagination parameters
    const pageNumber = parseInt(page);
    const limitNumber = parseInt(limit);
    if (isNaN(pageNumber) || isNaN(limitNumber)) {
      return errorResponse(res, 'Invalid pagination parameters', 400);
    }

    const options = {
      page: pageNumber,
      limit: limitNumber,
      sort: { [sortBy]: sortOrder === 'desc' ? -1 : 1 },
      populate: [
        { path: 'products.product', select: 'name price image' },
        { path: 'buyer', select: 'name email' }
      ]
    };

    const orders = await Order.paginate(query, options);
    return successResponse(res, orders);
  } catch (error) {
    console.error('Get received orders error:', error);
    return errorResponse(res, 'Failed to retrieve received orders', 500);
  }
};

// GET SINGLE ORDER BY ID
export const getOrder = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return errorResponse(res, 'Invalid order ID format', 400);
  }

  try {
    const order = await Order.findById(id)
      .populate('products.product', 'name price image description')
      .populate('buyer', 'name email phone')
      .populate('products.farmer', 'name email');

    if (!order) {
      return errorResponse(res, 'Order not found', 404);
    }

    // Authorization check
    const isBuyer = order.buyer._id.toString() === req.user.id;
    const isFarmer = order.products.some(p => p.farmer && p.farmer._id.toString() === req.user.id);
    const isAdmin = req.user.role === 'admin';

    if (!isBuyer && !isFarmer && !isAdmin) {
      return errorResponse(res, 'Not authorized to view this order', 403);
    }

    return successResponse(res, order);
  } catch (error) {
    console.error('Get order error:', error);
    return errorResponse(res, 'Failed to retrieve order', 500);
  }
};

// UPDATE ORDER STATUS (Admin or Farmer)
export const updateOrderStatus = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { status, notes } = req.body;
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      await session.abortTransaction();
      return errorResponse(res, 'Invalid order ID format', 400);
    }

    if (!status || !Object.values(ORDER_STATUS).includes(status)) {
      await session.abortTransaction();
      return errorResponse(res, `Invalid order status. Valid statuses: ${Object.values(ORDER_STATUS).join(', ')}`, 400);
    }

    const order = await Order.findById(id).session(session);
    if (!order) {
      await session.abortTransaction();
      return errorResponse(res, 'Order not found', 404);
    }

    // Authorization check
    const isFarmer = order.products.some(p => 
      p.farmer && p.farmer.toString() === req.user.id
    );
    const isAdmin = req.user.role === 'admin';

    if (!isFarmer && !isAdmin) {
      await session.abortTransaction();
      return errorResponse(res, 'Not authorized to update this order', 403);
    }

    // Status transition validation
    if ([ORDER_STATUS.CANCELLED, ORDER_STATUS.DELIVERED].includes(order.status)) {
      await session.abortTransaction();
      return errorResponse(res, `Cannot update ${order.status} orders`, 400);
    }

    // Special case: when cancelling, use cancelOrder instead
    if (status === ORDER_STATUS.CANCELLED) {
      await session.abortTransaction();
      return errorResponse(res, 'Use the cancel order endpoint to cancel orders', 400);
    }

    // Update order status
    order.status = status;
    order.updatedAt = new Date();
    order.statusHistory = order.statusHistory || [];
    order.statusHistory.push({
      status,
      changedAt: new Date(),
      changedBy: req.user.id,
      notes: notes || ''
    });

    await order.save({ session });
    await session.commitTransaction();

    const updatedOrder = await Order.findById(order._id)
      .populate('products.product', 'name price')
      .populate('buyer', 'name email');

    return successResponse(res, updatedOrder, 200, 'Order status updated successfully');
  } catch (error) {
    await session.abortTransaction();
    console.error('Update order error:', error);
    return errorResponse(res, 'Failed to update order status', 500);
  } finally {
    session.endSession();
  }
};

// CANCEL ORDER (Buyer or Admin/Farmer with restrictions)
export const cancelOrder = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { id } = req.params;
    const { reason } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      await session.abortTransaction();
      return errorResponse(res, 'Invalid order ID format', 400);
    }

    const order = await Order.findById(id).session(session);
    if (!order) {
      await session.abortTransaction();
      return errorResponse(res, 'Order not found', 404);
    }

    // Authorization and validation checks
    const isBuyer = order.buyer.toString() === req.user.id;
    const isFarmer = order.products.some(p => 
      p.farmer && p.farmer.toString() === req.user.id
    );
    const isAdmin = req.user.role === 'admin';

    if (!isBuyer && !isFarmer && !isAdmin) {
      await session.abortTransaction();
      return errorResponse(res, 'Not authorized to cancel this order', 403);
    }

    // Only buyer can cancel processing orders
    if (isBuyer && order.status !== ORDER_STATUS.PROCESSING) {
      await session.abortTransaction();
      return errorResponse(res, 'Only processing orders can be cancelled by buyer', 400);
    }

    // Admin/farmer can cancel orders in more states
    if (!isBuyer && [ORDER_STATUS.CANCELLED, ORDER_STATUS.DELIVERED].includes(order.status)) {
      await session.abortTransaction();
      return errorResponse(res, `Cannot cancel ${order.status} orders`, 400);
    }

    // Update order status
    order.status = ORDER_STATUS.CANCELLED;
    order.updatedAt = new Date();
    order.statusHistory = order.statusHistory || [];
    order.statusHistory.push({
      status: ORDER_STATUS.CANCELLED,
      changedAt: new Date(),
      changedBy: req.user.id,
      reason: reason || (isBuyer ? 'Buyer requested cancellation' : 'Seller requested cancellation')
    });

    await order.save({ session });

    // Restore product quantities if order was processing or shipped
    if ([ORDER_STATUS.PROCESSING, ORDER_STATUS.SHIPPED].includes(order.status)) {
      const productUpdates = order.products.map((item) => ({
        updateOne: {
          filter: { _id: item.product },
          update: { $inc: { quantity: item.quantity } },
          session
        }
      }));

      if (productUpdates.length > 0) {
        await Product.bulkWrite(productUpdates, { session });
      }
    }

    await session.commitTransaction();
    return successResponse(res, null, 200, 'Order cancelled successfully');
  } catch (error) {
    await session.abortTransaction();
    console.error('Cancel order error:', error);
    return errorResponse(res, 'Failed to cancel order', 500);
  } finally {
    session.endSession();
  }
};

// UPDATE PAYMENT STATUS
export const updatePaymentStatus = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { id } = req.params;
    const { paymentStatus, transactionId } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      await session.abortTransaction();
      return errorResponse(res, 'Invalid order ID format', 400);
    }

    if (!paymentStatus || !Object.values(PAYMENT_STATUS).includes(paymentStatus)) {
      await session.abortTransaction();
      return errorResponse(res, `Invalid payment status. Valid statuses: ${Object.values(PAYMENT_STATUS).join(', ')}`, 400);
    }

    const order = await Order.findById(id).session(session);
    if (!order) {
      await session.abortTransaction();
      return errorResponse(res, 'Order not found', 404);
    }

    // Authorization check (admin or payment processor only)
    if (req.user.role !== 'admin' && req.user.role !== 'payment_processor') {
      await session.abortTransaction();
      return errorResponse(res, 'Not authorized to update payment status', 403);
    }

    // Update payment status
    order.paymentStatus = paymentStatus;
    if (transactionId) order.transactionId = transactionId;
    order.updatedAt = new Date();
    order.paymentHistory = order.paymentHistory || [];
    order.paymentHistory.push({
      status: paymentStatus,
      changedAt: new Date(),
      changedBy: req.user.id,
      transactionId: transactionId || null
    });

    await order.save({ session });
    await session.commitTransaction();

    const updatedOrder = await Order.findById(order._id)
      .populate('buyer', 'name email');

    return successResponse(res, updatedOrder, 200, 'Payment status updated successfully');
  } catch (error) {
    await session.abortTransaction();
    console.error('Update payment status error:', error);
    return errorResponse(res, 'Failed to update payment status', 500);
  } finally {
    session.endSession();
  }
};