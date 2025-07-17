import express from 'express';
import {
  createProduct,
  getProducts,
  getProduct,
  updateProduct,
  deleteProduct,
  getMyProducts
} from '../controllers/productController.js';
import { protect, authorize } from '../middleware/auth.js';
import upload from '../middleware/upload.js';

const router = express.Router();

router.route('/')
  .get(getProducts)
  .post(
    protect,
    authorize('farmer'),
    upload.single('image'),
    createProduct
  );

router.route('/my-products')
  .get(
    protect,
    authorize('farmer'),
    getMyProducts
  );

router.route('/:id')
  .get(getProduct)
  .put(
    protect,
    authorize('farmer'),
    upload.single('image'),
    updateProduct
  )
  .delete(
    protect,
    authorize('farmer'),
    deleteProduct
  );

export default router;