import User from '../models/User.js';
import { compare } from 'bcryptjs';
import { messages } from '../constants/messages.js';

export const registerUser = async (userData) => {
  const existingUser = await User.findOne({ email: userData.email });
  if (existingUser) {
    throw new Error(messages.AUTH.EMAIL_EXISTS);
  }
  return await User.create(userData);
};

export const loginUser = async (email, password) => {
  const user = await User.findOne({ email }).select('+password');
  if (!user || !(await compare(password, user.password))) {
    throw new Error(messages.AUTH.INVALID_CREDENTIALS);
  }
  return user;
};

export const getUserProfile = async (userId) => {
  return await User.findById(userId);
};