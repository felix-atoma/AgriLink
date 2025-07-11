import express from 'express';
import {
  createOrder,
  getOrders,
  getOrder,
  updateOrderStatus
} from '../controllers/orderController.js';
import { protect, authorize } from '../middleware/auth.js';
import { validateOrder } from '../validators/orderValidator.js';

const router = express.Router();

router.route('/')
  .get(protect, getOrders)
  .post(protect, authorize('buyer'), validateOrder, createOrder);

router.route('/:id')
  .get(protect, getOrder)
  .patch(protect, authorize('farmer', 'admin'), updateOrderStatus);

export default router;