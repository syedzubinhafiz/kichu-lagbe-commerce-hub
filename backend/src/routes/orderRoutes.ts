import express, { RequestHandler } from 'express';
import {
  createOrder,
  getOrderById,
  getMyOrders,
  getSellerOrders,
  updateOrderStatus,
} from '../controllers/orderController';
import { protect, authorize } from '../middlewares/authMiddleware';
import { UserRole } from '../models/User';

const router = express.Router();

// Buyer Routes
router.post(
    '/',
    protect as RequestHandler, // Must be logged in
    authorize(UserRole.Buyer) as RequestHandler, // Must be a Buyer
    createOrder as RequestHandler
);
router.get(
    '/myorders',
    protect as RequestHandler,
    authorize(UserRole.Buyer) as RequestHandler,
    getMyOrders as RequestHandler
);

// Seller Routes
router.get(
    '/sellerorders',
    protect as RequestHandler,
    authorize(UserRole.Seller) as RequestHandler, // Must be Seller
    getSellerOrders as RequestHandler
);

// Shared/Specific Routes
router.get(
    '/:id', // View specific order (Buyer, Seller involved, or Admin)
    protect as RequestHandler,
    getOrderById as RequestHandler // Authorization handled within controller
);

// Seller/Admin Routes
router.put(
    '/:id/status', // Update order status
    protect as RequestHandler,
    authorize(UserRole.Seller, UserRole.Admin) as RequestHandler, // Seller or Admin
    updateOrderStatus as RequestHandler
);

export default router; 