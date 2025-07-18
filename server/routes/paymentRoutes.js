import express from 'express';
import {
  initializePayment,
  verifyPayment
} from '../controllers/paymentController.js';

const router = express.Router();

router.post('/initialize', initializePayment);
router.get('/verify', verifyPayment);

export default router;
