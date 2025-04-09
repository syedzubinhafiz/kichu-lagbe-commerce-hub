import express, { RequestHandler } from 'express';
import {
  getAllUsers,
  getUserById,
  updateUserStatus,
} from '../controllers/adminController';
import { protect, authorize } from '../middlewares/authMiddleware';
import { UserRole } from '../models/User';

const router = express.Router();

// Apply protect and admin authorization middleware to all routes in this file
router.use(protect as RequestHandler);
router.use(authorize(UserRole.Admin) as RequestHandler);

// Routes (already protected and authorized by middleware above)
router.get('/users', getAllUsers as RequestHandler);
router.get('/users/:id', getUserById as RequestHandler);
router.put('/users/:id/status', updateUserStatus as RequestHandler);

export default router; 