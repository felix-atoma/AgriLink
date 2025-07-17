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

// CREATE ORDER
export const createOrder = async (req, res) => {
  try {
    const { products, shippingAddress, paymentMethod } = req.body;
    const buyer = req.user.id;

    if (!products || !Array.isArray(products) || products.length === 0) {
      return errorResponse(res, 'Products array is required with at least one item', 400);
    }

    if (!paymentMethod || !Object.values(PAYMENT_METHODS).includes(paymentMethod)) {
      return errorResponse(res, `Invalid payment method. Valid methods are: ${Object.values(PAYMENT_METHODS).join(', ')}`, 400);
    }

    if (!shippingAddress?.street || !shippingAddress?.city || !shippingAddress?.country) {
      return errorResponse(res, 'Complete shipping address (street, city, country) is required', 400);
    }

    let total = 0;
    const orderProducts = [];

    for (const item of products) {
      if (!item.product || !item.quantity) {
        return errorResponse(res, 'Each product must have product ID and quantity', 400);
      }

      if (!mongoose.Types.ObjectId.isValid(item.product)) {
        return errorResponse(res, `Invalid product ID format: ${item.product}`, 400);
      }

      const product = await Product.findById(item.product);
      if (!product) {
        return errorResponse(res, `Product not found: ${item.product}`, 404);
      }

      if (product.quantity < item.quantity) {
        return errorResponse(res, `Insufficient quantity for ${product.name}. Available: ${product.quantity}`, 400);
      }

      total += product.price * item.quantity;

      product.quantity -= item.quantity;
      await product.save();

      orderProducts.push({
        product: product._id,
        name: product.name,
        image: product.image || '',
        quantity: item.quantity,
        price: product.price,
        farmer: product.farmer || product.user // ensure farmer/user is saved
      });
    }

    const order = await Order.create({
      buyer,
      products: orderProducts,
      total,
      shippingAddress,
      paymentMethod,
      status: ORDER_STATUS.PROCESSING,
      paymentStatus: 'pending'
    });

    const populatedOrder = await Order.findById(order._id)
      .populate('products.product', 'name price image')
      .populate('buyer', 'name email');

    return res.status(201).json({
      success: true,
      message: 'Order created successfully',
      order: populatedOrder
    });
  } catch (error) {
    console.error('Order creation error:', error);
    return errorResponse(res, 'Failed to create order', 500);
  }
};


// GET MY ORDERS (Buyer)
export const getOrders = async (req, res) => {
  try {
    const { status, page = 1, limit = 10, paymentMethod } = req.query;
    const query = { buyer: req.user.id };

    if (status) query.status = status;
    if (paymentMethod) query.paymentMethod = paymentMethod;

    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      sort: { createdAt: -1 },
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
// GET RECEIVED ORDERS (Farmer)
export const getReceivedOrders = async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;

    const query = { 'products.farmer': req.user.id };
    if (status) {
      query.status = status;
    }

    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      sort: { createdAt: -1 },
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
      .populate('buyer', 'name email phone');

    if (!order) return errorResponse(res, 'Order not found', 404);

    if (order.buyer._id.toString() !== req.user.id && req.user.role !== 'admin') {
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
    const { status } = req.body;

    if (!Object.values(ORDER_STATUS).includes(status)) {
      await session.abortTransaction();
      return errorResponse(res, `Invalid order status. Valid statuses: ${Object.values(ORDER_STATUS).join(', ')}`, 400);
    }

    const order = await Order.findById(req.params.id).session(session);
    if (!order) {
      await session.abortTransaction();
      return errorResponse(res, 'Order not found', 404);
    }

    if ([ORDER_STATUS.CANCELLED, ORDER_STATUS.DELIVERED].includes(order.status)) {
      await session.abortTransaction();
      return errorResponse(res, `Cannot update ${order.status} orders`, 400);
    }

    order.status = status;
    order.updatedAt = new Date();
    order.statusHistory = order.statusHistory || [];
    order.statusHistory.push({
      status,
      changedAt: new Date(),
      changedBy: req.user.id
    });

    await order.save({ session });
    await session.commitTransaction();

    const updated = await Order.findById(order._id)
      .populate('products.product', 'name price');

    return successResponse(res, updated, 200, 'Order status updated successfully');
  } catch (error) {
    await session.abortTransaction();
    console.error('Update order error:', error);
    return errorResponse(res, 'Failed to update order status', 500);
  } finally {
    session.endSession();
  }
};

// CANCEL ORDER (Buyer Only)
export const cancelOrder = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const order = await Order.findById(req.params.id).session(session);
    if (!order) {
      await session.abortTransaction();
      return errorResponse(res, 'Order not found', 404);
    }

    if (order.buyer.toString() !== req.user.id) {
      await session.abortTransaction();
      return errorResponse(res, 'Not authorized to cancel this order', 403);
    }

    if (order.status !== ORDER_STATUS.PROCESSING) {
      await session.abortTransaction();
      return errorResponse(res, 'Only processing orders can be cancelled', 400);
    }

    order.status = ORDER_STATUS.CANCELLED;
    order.updatedAt = new Date();
    order.statusHistory = order.statusHistory || [];
    order.statusHistory.push({
      status: ORDER_STATUS.CANCELLED,
      changedAt: new Date(),
      changedBy: req.user.id,
      reason: req.body.reason || 'Buyer requested cancellation'
    });

    await order.save({ session });

    // Restore product quantities
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
    const { paymentStatus, transactionId } = req.body;
    const validStatuses = ['pending', 'paid', 'failed', 'refunded'];

    if (!validStatuses.includes(paymentStatus)) {
      await session.abortTransaction();
      return errorResponse(res, `Invalid payment status. Valid statuses: ${validStatuses.join(', ')}`, 400);
    }

    const order = await Order.findById(req.params.id).session(session);
    if (!order) {
      await session.abortTransaction();
      return errorResponse(res, 'Order not found', 404);
    }

    order.paymentStatus = paymentStatus;
    if (transactionId) order.transactionId = transactionId;
    order.updatedAt = new Date();

    await order.save({ session });
    await session.commitTransaction();

    return successResponse(res, order, 200, 'Payment status updated successfully');
  } catch (error) {
    await session.abortTransaction();
    console.error('Update payment status error:', error);
    return errorResponse(res, 'Failed to update payment status', 500);
  } finally {
    session.endSession();
  }
};
