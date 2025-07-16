// routes/orderRoutes.js
import express from 'express';
import {
  createOrder,
  getOrders,
  getOrder,
  getReceivedOrders,
  updateOrderStatus,
  cancelOrder,
  updatePaymentStatus
} from '../controllers/orderController.js';

import { protect, authorize } from '../middleware/auth.js';
import { validateOrder } from '../validators/orderValidator.js';

const router = express.Router();

// ✅ Farmer: Get received orders (place this first)
router.get('/received', protect, authorize('farmer'), getReceivedOrders);

// ✅ Buyer: My orders
router.get('/my-orders', protect, authorize('buyer'), getOrders);

// ✅ Create a new order
router.post('/', protect, authorize('buyer'), validateOrder, createOrder);

// ✅ Buyer cancel order
router.patch('/:id/cancel', protect, authorize('buyer'), cancelOrder);

// ✅ Admin or Farmer update order status
router.patch('/:id/status', protect, authorize('farmer', 'admin'), updateOrderStatus);

// ✅ Update payment status
router.patch('/:id/payment', protect, authorize('buyer', 'admin'), updatePaymentStatus);

// ✅ Get a single order
router.get('/:id', protect, getOrder);

export default router;
