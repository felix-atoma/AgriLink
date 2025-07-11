import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { successResponse, errorResponse } from '../utils/apiResponse.js';
import i18n from '../config/i18n.js';

const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN }
  );
};

export const register = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      role,
      contact,
      farmName,
      lat,
      lng
    } = req.body;

    // Validate required fields
    if (!name || !email || !password || !role || !contact) {
      return errorResponse(res, 'Missing required fields', 400);
    }

    // Check for existing user
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return errorResponse(res, i18n.__('auth.emailExists'), 400);
    }

    // Build user payload based on role
    const userData = {
      name,
      email,
      password,
      role,
      contact
    };

    if (role === 'farmer') {
      if (!farmName || !lat || !lng) {
        return errorResponse(res, 'Farm name and location are required for farmers', 400);
      }

      userData.farmName = farmName;
      userData.location = {
        type: 'Point',
        coordinates: [parseFloat(lng), parseFloat(lat)],
      };
    }

    const user = await User.create(userData);
    const token = generateToken(user);

    return successResponse(res, { user, token }, 201);
  } catch (error) {
    console.error('❌ REGISTER ERROR:', error);
    return errorResponse(res, error?.message || 'Registration failed', 500);
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return errorResponse(res, 'Email and password are required', 400);
    }

    const user = await User.findOne({ email }).select('+password');

    if (!user || !(await user.comparePassword(password))) {
      return errorResponse(res, i18n.__('auth.invalidCredentials'), 401);
    }

    const token = generateToken(user);
    return successResponse(res, { user, token });
  } catch (error) {
    console.error('❌ LOGIN ERROR:', error);
    return errorResponse(res, error?.message || 'Login failed', 500);
  }
};

export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return errorResponse(res, 'User not found', 404);
    }
    return successResponse(res, user);
  } catch (error) {
    console.error('❌ GETME ERROR:', error);
    return errorResponse(res, error?.message || 'Failed to fetch user', 500);
  }
};
