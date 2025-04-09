import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '../utils/jwtUtils';
import UserModel, { IUser, UserRole } from '../models/User';

// Extend Express Request interface to include user property
// Export the interface
export interface AuthRequest extends Request {
  user?: Pick<IUser, '_id' | 'role' | 'isActive'>; // Add user info to request object
}

export const protect = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  let token;

  // Check for token in Authorization header (Bearer token)
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];

      // Verify token
      const decoded = verifyAccessToken(token);

      if (!decoded || !decoded.userId) {
          return res.status(401).json({ message: 'Not authorized, token failed' });
      }

      // Get user from the token payload (excluding password)
      // Ensure user exists and is active
      const user = await UserModel.findById(decoded.userId).select('-password');

      if (!user) {
        return res.status(401).json({ message: 'Not authorized, user not found' });
      }

      // Check if account is active
      if (!user.isActive) {
        return res.status(403).json({ message: 'Account is inactive or banned' });
      }

      // Attach user object to the request
      req.user = {
        _id: user._id,
        role: user.role,
        isActive: user.isActive
      };
      next();
    } catch (error) {
      console.error('Token verification error:', error);
      return res.status(401).json({ message: 'Not authorized, token failed' });
    }
  } else {
    return res.status(401).json({ message: 'Not authorized, no token provided' });
  }
};

// Middleware to restrict access to specific roles
export const authorize = (...roles: UserRole[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user || !req.user.role) {
      // This should ideally not happen if `protect` middleware runs first
      return res.status(401).json({ message: 'Not authorized' });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        message: `Forbidden: User role '${req.user.role}' is not authorized to access this route`,
      });
    }
    next();
  };
}; 