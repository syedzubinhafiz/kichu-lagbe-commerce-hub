import { Request, Response } from 'express';
import UserModel, { IUser } from '../models/User';
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken
} from '../utils/jwtUtils';
import { z } from 'zod';

// Zod Schema for Registration
const registerSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters long'),
  role: z.enum(['buyer', 'seller']).optional(), // Allow specifying role, default is buyer in model
});

// Zod Schema for Login
const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
export const registerUser = async (req: Request, res: Response) => {
  try {
    const validatedData = registerSchema.parse(req.body);
    const { name, email, password, role } = validatedData;

    // Check if user already exists
    const userExists = await UserModel.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Create new user (password hashing is handled by pre-save hook)
    const user = await UserModel.create({
      name,
      email,
      password,
      role: role || 'buyer', // Default to buyer if not provided
    });

    if (user) {
      // Don't send password back, even hashed
      const { password: _, ...userResponseWithoutPassword } = user.toObject();

      res.status(201).json({
        message: 'User registered successfully',
        user: userResponseWithoutPassword,
        // Optionally, log the user in immediately by sending tokens
        // accessToken: generateAccessToken(user),
        // refreshToken: generateRefreshToken(user)
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: 'Validation failed', errors: error.errors });
    }
    console.error('Registration Error:', error);
    res.status(500).json({ message: 'Server error during registration' });
  }
};

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
export const loginUser = async (req: Request, res: Response) => {
  try {
    const validatedData = loginSchema.parse(req.body);
    const { email, password } = validatedData;

    // Find user by email
    // Explicitly select password as it's excluded by default in the model
    const user = await UserModel.findOne({ email }).select('+password');

    if (!user) {
        return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check if user account is active
    if (!user.isActive) {
        return res.status(403).json({ message: 'Account is inactive or banned' });
    }

    // Compare password
    const isMatch = await user.comparePassword(password);

    if (user && isMatch) {
      // Generate tokens
      const accessToken = generateAccessToken(user);
      const refreshToken = generateRefreshToken(user);

      // Store refresh token in HTTP-Only cookie (more secure)
      res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production', // Use secure cookies in production
        sameSite: 'strict', // Mitigate CSRF
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days (matches refresh token expiry)
      });

      // Don't send password or refresh token in the main response body
      const { password: _, ...userResponseWithoutPassword } = user.toObject();

      res.json({
        message: 'Login successful',
        user: userResponseWithoutPassword,
        accessToken,
      });
    } else {
      res.status(401).json({ message: 'Invalid credentials' });
    }
  } catch (error: any) {
     if (error instanceof z.ZodError) {
      return res.status(400).json({ message: 'Validation failed', errors: error.errors });
    }
    console.error('Login Error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
};

// @desc    Logout user (clear refresh token cookie)
// @route   POST /api/auth/logout
// @access  Public (or Protected, depending on strategy)
export const logoutUser = (req: Request, res: Response) => {
  // Clear the refresh token cookie
  res.cookie('refreshToken', '', {
    httpOnly: true,
    expires: new Date(0), // Set expiry date to the past
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
  });
  res.status(200).json({ message: 'Logged out successfully' });
};


// @desc    Refresh access token using refresh token
// @route   POST /api/auth/refresh
// @access  Public (requires valid refresh token cookie)
export const refreshToken = async (req: Request, res: Response) => {
    const incomingRefreshToken = req.cookies.refreshToken;

    if (!incomingRefreshToken) {
        return res.status(401).json({ message: 'Refresh token not found' });
    }

    try {
        const decoded = verifyRefreshToken(incomingRefreshToken);
        if (!decoded || !decoded.userId) {
            // Clear potentially invalid cookie
            res.cookie('refreshToken', '', { httpOnly: true, expires: new Date(0), secure: process.env.NODE_ENV === 'production', sameSite: 'strict' });
            return res.status(403).json({ message: 'Invalid refresh token' });
        }

        // Find user based on refresh token payload
        const user = await UserModel.findById(decoded.userId);

        if (!user) {
            // Clear potentially invalid cookie
            return res.status(403).json({ message: 'User not found for refresh token' });
        }

         // Check if user account is active
        if (!user.isActive) {
            // Optionally clear the invalid cookie
            res.cookie('refreshToken', '', { httpOnly: true, expires: new Date(0), secure: process.env.NODE_ENV === 'production', sameSite: 'strict' });
            return res.status(403).json({ message: 'Account is inactive or banned' });
        }

        // Issue a new access token
        const newAccessToken = generateAccessToken(user);

        res.json({ accessToken: newAccessToken });

    } catch (error) {
        console.error("Refresh Token Error:", error);
        // Clear potentially invalid cookie
        res.cookie('refreshToken', '', { httpOnly: true, expires: new Date(0), secure: process.env.NODE_ENV === 'production', sameSite: 'strict' });
        return res.status(403).json({ message: 'Invalid refresh token' });
    }
}; 