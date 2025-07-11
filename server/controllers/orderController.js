import Order from '../models/Order.js';
import Product from '../models/Product.js';
import { successResponse, errorResponse } from '../utils/apiResponse.js';

// Create a new order
export const createOrder = async (req, res) => {
  try {
    const { products, shippingAddress } = req.body;

    let total = 0;

    for (const item of products) {
      const product = await Product.findById(item.product);
      if (!product) {
        return errorResponse(res, `Product ${item.product} not found`, 404);
      }
      if (product.quantity < item.quantity) {
        return errorResponse(res, `Insufficient quantity for ${product.name}`, 400);
      }
      total += product.price * item.quantity;
    }

    const order = await Order.create({
      buyer: req.user.id,
      products,
      total,
      shippingAddress,
      status: 'pending'
    });

    for (const item of products) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { quantity: -item.quantity }
      });
    }

    successResponse(res, order, 201);
  } catch (error) {
    errorResponse(res, error.message);
  }
};

// Get all orders for current user
export const getOrders = async (req, res) => {
  try {
    const orders = await Order.find({ buyer: req.user.id })
      .populate('products.product', 'name price')
      .populate('buyer', 'name email');

    successResponse(res, orders);
  } catch (error) {
    errorResponse(res, error.message);
  }
};

// ✅ Get a specific order by ID
export const getOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('products.product', 'name price')
      .populate('buyer', 'name email');

    if (!order) {
      return errorResponse(res, 'Order not found', 404);
    }

    if (order.buyer.toString() !== req.user.id && req.user.role !== 'admin') {
      return errorResponse(res, 'Not authorized to view this order', 403);
    }

    successResponse(res, order);
  } catch (error) {
    errorResponse(res, error.message);
  }
};

// Update order status
export const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const order = await Order.findById(req.params.id);
    if (!order) return errorResponse(res, 'Order not found', 404);

    order.status = status;
    await order.save();

    successResponse(res, order);
  } catch (error) {
    errorResponse(res, error.message);
  }
};

// Delete an order
export const deleteOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return errorResponse(res, 'Order not found', 404);

    await order.deleteOne();
    successResponse(res, { message: 'Order deleted successfully' });
  } catch (error) {
    errorResponse(res, error.message);
  }
};
