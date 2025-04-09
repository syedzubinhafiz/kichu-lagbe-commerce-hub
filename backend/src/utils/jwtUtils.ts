import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { IUser } from '../models/User'; // Assuming User model exports IUser

dotenv.config();

const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET;
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;

if (!ACCESS_SECRET || !REFRESH_SECRET) {
  console.error('FATAL ERROR: JWT secrets are not defined in .env file.');
  process.exit(1);
}

// Generate Access Token (short-lived)
export const generateAccessToken = (user: Pick<IUser, '_id' | 'role'>): string => {
  const payload = {
    userId: user._id,
    role: user.role,
  };
  return jwt.sign(payload, ACCESS_SECRET, {
    expiresIn: '15m', // Example: 15 minutes validity
  });
};

// Generate Refresh Token (longer-lived)
export const generateRefreshToken = (user: Pick<IUser, '_id'>): string => {
  const payload = {
    userId: user._id,
  };
  // Store refresh tokens securely (e.g., in DB associated with user) for better security
  // For simplicity here, we generate a longer-lived token
  return jwt.sign(payload, REFRESH_SECRET, {
    expiresIn: '7d', // Example: 7 days validity
  });
};

// Verify Access Token
export const verifyAccessToken = (token: string): any | null => {
  try {
    return jwt.verify(token, ACCESS_SECRET);
  } catch (error) {
    return null; // Token is invalid or expired
  }
};

// Verify Refresh Token
export const verifyRefreshToken = (token: string): any | null => {
  try {
    return jwt.verify(token, REFRESH_SECRET);
  } catch (error) {
    return null; // Token is invalid or expired
  }
}; 