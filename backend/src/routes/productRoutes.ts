import express, { RequestHandler } from 'express';
import {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
} from '../controllers/productController';
import { protect, authorize } from '../middlewares/authMiddleware';
import { UserRole } from '../models/User';

const router = express.Router();

// Public routes
router.get('/', getProducts as RequestHandler); // Anyone can view products
router.get('/:id', getProductById as RequestHandler); // Anyone can view a single product

// Seller-only routes
router.post(
  '/',
  protect as RequestHandler, // Must be logged in
  authorize(UserRole.Seller) as RequestHandler, // Must be a Seller
  createProduct as RequestHandler
);

router.put(
  '/:id',
  protect as RequestHandler,
  authorize(UserRole.Seller) as RequestHandler, // Only Seller can update
  updateProduct as RequestHandler
);

router.delete(
  '/:id',
  protect as RequestHandler,
  authorize(UserRole.Seller) as RequestHandler, // Only Seller can delete
  deleteProduct as RequestHandler
);

export default router; 