import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import User from '../models/User.js';
import { errorResponse } from '../utils/apiResponse.js';

// Authentication middleware
export const protect = async (req, res, next) => {
  let token;

  // Get token from header
  if (req.headers.authorization?.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return errorResponse(res, 'Not authorized, no token', 401);
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Validate user ID
    if (!decoded.id || !mongoose.Types.ObjectId.isValid(decoded.id)) {
      return errorResponse(res, 'Invalid user ID in token', 400);
    }

    // Get user from database
    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      return errorResponse(res, 'User not found', 401);
    }

    // Attach user to request
    req.user = user;
    next();
  } catch (error) {
    console.error('Token verification error:', error.message);
    return errorResponse(res, 'Not authorized, token failed', 401);
  }
};

// Role authorization middleware
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return errorResponse(res, 'Not authorized to access this route', 403);
    }
    next();
  };
};