import express, { RequestHandler } from 'express';
import {
  createProduct,
  getProducts,
  // getProductById, // Replaced
  getProductByIdOrSlug, // Use new function
  updateProduct,
  deleteProduct,
} from '../controllers/productController';
import { protect, authorize } from '../middlewares/authMiddleware';
import { UserRole } from '../models/User';

const router = express.Router();

// Public routes
router.get('/', getProducts as RequestHandler);
// Use :identifier for ID or slug
router.get('/:identifier', getProductByIdOrSlug as RequestHandler); 

// Seller-only routes
router.post(
  '/',
  protect as RequestHandler, 
  authorize(UserRole.Seller) as RequestHandler, 
  createProduct as RequestHandler
);

// Use :id specifically for updates/deletes where ID is expected
router.put(
  '/:id',
  protect as RequestHandler,
  authorize(UserRole.Seller) as RequestHandler,
  updateProduct as RequestHandler
);

router.delete(
  '/:id',
  protect as RequestHandler,
  authorize(UserRole.Seller) as RequestHandler,
  deleteProduct as RequestHandler
);

export default router; 