import Order from '../models/Order.js';
import Product from '../models/Product.js';
import { successResponse, errorResponse } from '../utils/apiResponse.js';

// Create a new order
export const createOrder = async (req, res) => {
  try {
    const { products, shippingAddress, paymentMethod } = req.body;

    // Validate products array
    if (!products || !Array.isArray(products) || products.length === 0) {
      return errorResponse(res, 'Products array is required and must not be empty', 400);
    }

    let total = 0;
    const productUpdates = [];

    // Validate each product and calculate total
    for (const item of products) {
      if (!item.product || !item.quantity) {
        return errorResponse(res, 'Each product must have product ID and quantity', 400);
      }

      const product = await Product.findById(item.product);
      if (!product) {
        return errorResponse(res, `Product ${item.product} not found`, 404);
      }
      if (product.quantity < item.quantity) {
        return errorResponse(res, `Insufficient quantity for ${product.name}`, 400);
      }

      total += product.price * item.quantity;
      productUpdates.push({
        updateOne: {
          filter: { _id: item.product },
          update: { $inc: { quantity: -item.quantity } }
        }
      });
    }

    // Create the order
    const order = await Order.create({
      buyer: req.user.id,
      products: products.map(async item => ({
        product: item.product,
        quantity: item.quantity,
        price: (await Product.findById(item.product)).price
      })),
      total,
      shippingAddress,
      paymentMethod,
      status: 'processing'
    });

    // Update product quantities in bulk
    if (productUpdates.length > 0) {
      await Product.bulkWrite(productUpdates);
    }

    // Populate product details in response
    const populatedOrder = await Order.findById(order._id)
      .populate('products.product', 'name price image');

    successResponse(res, populatedOrder, 201, 'Order created successfully');

  } catch (error) {
    console.error('Order creation error:', error);
    errorResponse(res, 'Failed to create order', 500);
  }
};

// Get all orders for current user
export const getOrders = async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    const query = { buyer: req.user.id };

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

    successResponse(res, orders);
  } catch (error) {
    console.error('Get orders error:', error);
    errorResponse(res, 'Failed to retrieve orders', 500);
  }
};

// Get a specific order by ID
export const getOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('products.product', 'name price image description')
      .populate('buyer', 'name email phone');

    if (!order) {
      return errorResponse(res, 'Order not found', 404);
    }

    // Authorization check
    if (order.buyer._id.toString() !== req.user.id && req.user.role !== 'admin') {
      return errorResponse(res, 'Not authorized to view this order', 403);
    }

    successResponse(res, order);
  } catch (error) {
    console.error('Get order error:', error);
    if (error.name === 'CastError') {
      return errorResponse(res, 'Invalid order ID format', 400);
    }
    errorResponse(res, 'Failed to retrieve order', 500);
  }
};

// Update order status (Admin only)
export const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ['processing', 'shipped', 'delivered', 'cancelled'];

    if (!validStatuses.includes(status)) {
      return errorResponse(res, 'Invalid order status', 400);
    }

    const order = await Order.findById(req.params.id);
    if (!order) {
      return errorResponse(res, 'Order not found', 404);
    }

    // Prevent status updates for cancelled or delivered orders
    if (['cancelled', 'delivered'].includes(order.status)) {
      return errorResponse(res, `Cannot update ${order.status} orders`, 400);
    }

    order.status = status;
    order.updatedAt = new Date();

    // Add status history
    order.statusHistory = order.statusHistory || [];
    order.statusHistory.push({
      status,
      changedAt: new Date(),
      changedBy: req.user.id
    });

    await order.save();

    const populatedOrder = await Order.findById(order._id)
      .populate('products.product', 'name price');

    successResponse(res, populatedOrder, 200, 'Order status updated successfully');

  } catch (error) {
    console.error('Update order error:', error);
    errorResponse(res, 'Failed to update order status', 500);
  }
};

// Cancel an order (Buyer only)
export const cancelOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return errorResponse(res, 'Order not found', 404);
    }

    // Authorization check
    if (order.buyer.toString() !== req.user.id) {
      return errorResponse(res, 'Not authorized to cancel this order', 403);
    }

    // Only allow cancellation of processing orders
    if (order.status !== 'processing') {
      return errorResponse(res, 'Only processing orders can be cancelled', 400);
    }

    order.status = 'cancelled';
    order.updatedAt = new Date();
    order.statusHistory.push({
      status: 'cancelled',
      changedAt: new Date(),
      changedBy: req.user.id,
      reason: req.body.reason || 'Buyer requested cancellation'
    });

    await order.save();

    // Restore product quantities
    const productUpdates = order.products.map(item => ({
      updateOne: {
        filter: { _id: item.product },
        update: { $inc: { quantity: item.quantity } }
      }
    }));

    if (productUpdates.length > 0) {
      await Product.bulkWrite(productUpdates);
    }

    successResponse(res, null, 200, 'Order cancelled successfully');

  } catch (error) {
    console.error('Cancel order error:', error);
    errorResponse(res, 'Failed to cancel order', 500);
  }
};