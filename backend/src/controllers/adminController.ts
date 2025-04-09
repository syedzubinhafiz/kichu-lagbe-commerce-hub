import { Response } from 'express';
import UserModel from '../models/User';
import { AuthRequest } from '../middlewares/authMiddleware';
import mongoose from 'mongoose';

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private/Admin
export const getAllUsers = async (req: AuthRequest, res: Response) => {
  try {
    // Optionally add filtering/pagination later
    const users = await UserModel.find({}).select('-password'); // Exclude passwords
    res.json(users);
  } catch (error: any) {
    console.error('Get All Users Error:', error);
    res.status(500).json({ message: 'Server error fetching users' });
  }
};

// @desc    Get user by ID
// @route   GET /api/admin/users/:id
// @access  Private/Admin
export const getUserById = async (req: AuthRequest, res: Response) => {
  try {
    const user = await UserModel.findById(req.params.id).select('-password');
    if (user) {
      res.json(user);
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error: any) {
    if (error.name === 'CastError') {
        return res.status(404).json({ message: 'User not found (invalid ID format)' });
    }
    console.error('Get User By ID Error:', error);
    res.status(500).json({ message: 'Server error fetching user' });
  }
};

// @desc    Ban/Suspend or Unban a user (toggle isActive flag)
// @route   PUT /api/admin/users/:id/status
// @access  Private/Admin
export const updateUserStatus = async (req: AuthRequest, res: Response) => {
    // Added check for req.user existence first
    if (!req.user?._id) {
        return res.status(401).json({ message: 'Not authorized, user information missing' });
    }

    const { isActive } = req.body;
    const userId = req.params.id;

    if (typeof isActive !== 'boolean') {
        return res.status(400).json({ message: 'Invalid input: isActive must be a boolean' });
    }

    if (!mongoose.Types.ObjectId.isValid(userId)){
         return res.status(400).json({ message: 'Invalid User ID format' });
    }

    // Prevent admin from deactivating themselves (now req.user._id type is known)
    if (req.user._id.toString() === userId && !isActive) {
        return res.status(400).json({ message: 'Admin cannot deactivate their own account.' });
    }

    try {
        const user = await UserModel.findById(userId);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        user.isActive = isActive;
        await user.save();

        res.json({ message: `User status updated successfully. User is now ${isActive ? 'active' : 'inactive'}.`, user: { _id: user._id, name: user.name, email: user.email, role: user.role, isActive: user.isActive } });

    } catch (error: any) {
        if (error.name === 'CastError') {
           return res.status(404).json({ message: 'User not found (invalid ID format)' });
       }
       console.error('Update User Status Error:', error);
       res.status(500).json({ message: 'Server error updating user status' });
    }
}; 