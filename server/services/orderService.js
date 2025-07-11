import Order from '../models/Order.js';
import { messages } from '../constants/messages.js';

export const createOrder = async (orderData) => {
  return await Order.create(orderData);
};

export const getOrdersForUser = async (userId) => {
  return await Order.find({ user: userId });
};

export const getOrdersForFarmer = async (farmerId) => {
  return await Order.find({
    'products.product': { $in: await Product.find({ farmer: farmerId }).distinct('_id') }
  });
};

export const updateOrderStatus = async (orderId, status) => {
  const order = await Order.findById(orderId);
  if (!order) {
    throw new Error(messages.ORDER.NOT_FOUND);
  }
  order.status = status;
  return await order.save();
};