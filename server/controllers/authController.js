// controllers/authController.js
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { successResponse, errorResponse } from '../utils/apiResponse.js';
import i18n from '../config/i18n.js';

// Ensure JWT env values are set
const generateToken = (user) => {
  if (!process.env.JWT_SECRET) {
    throw new Error('Missing JWT_SECRET in environment variables');
  }

  return jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
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

    console.log("📥 Incoming register request:", req.body);

    // Validate required fields
    if (!name || !email || !password || !role || !contact) {
      console.log("❌ Missing required fields");
      return errorResponse(res, 'Missing required fields', 400);
    }

    // Check for existing user
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      console.log("⚠️ Email already exists");
      return errorResponse(res, i18n.__('auth.emailExists'), 400);
    }

    // Build user data
    const userData = {
      name,
      email,
      password,
      role,
      contact
    };

    // Farmer-specific fields
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

    console.log("✅ Creating user with data:", userData);

    const user = await User.create(userData);
    const token = generateToken(user);

    return successResponse(res, { user, token }, 201);
  } catch (error) {
    console.error("❌ REGISTER ERROR:", error);
    return errorResponse(res, error.message || 'Unknown error');
  }
};


export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log('🔑 Login attempt for:', email);

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
