import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { successResponse, errorResponse } from '../utils/apiResponse.js';
import i18n from '../config/i18n.js';
import { sendWelcomeEmail } from '../utils/sendEmail.js'; // ✅ Import the mailer

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

// ✅ Register Controller with Email Notification
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

    // Basic field validation
    if (!name || !email || !password || !role || !contact) {
      console.log("❌ Missing required fields");
      return errorResponse(res, 'Missing required fields', 400);
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      console.log("⚠️ Email already exists");
      return errorResponse(res, i18n.__('auth.emailExists'), 400);
    }

    const userData = { name, email, password, role, contact };

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

    // ✅ Send welcome email
    try {
      await sendWelcomeEmail(user.email, user.name);
      console.log('📧 Welcome email sent to', user.email);
    } catch (emailError) {
      console.error('⚠️ Email send failed:', emailError.message);
    }

    return successResponse(res, {
      message: 'User registered successfully',
      user,
      token
    }, 201);
  } catch (error) {
    console.error("❌ REGISTER ERROR:", error);
    return errorResponse(res, error.message || 'Unknown error');
  }
};

// ✅ Login Controller
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
    return errorResponse(res, error.message || 'Login failed', 500);
  }
};

// ✅ Get Current Logged-in User
export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return errorResponse(res, 'User not found', 404);
    }
    return successResponse(res, user);
  } catch (error) {
    console.error('❌ GETME ERROR:', error);
    return errorResponse(res, error.message || 'Failed to fetch user', 500);
  }
};
