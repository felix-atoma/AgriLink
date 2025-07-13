import React from 'react';
import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../services/apiClient';
import { useToast } from '../components/ui/Toast';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  const initializeAuth = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      if (token) {
        const { data } = await apiClient.get('/auth/me');
        setUser(data);
      }
    } catch (err) {
      localStorage.removeItem('token');
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  const login = async (credentials) => {
    try {
      setLoading(true);
      setError(null);

      const response = await apiClient.post('/auth/login', credentials);
      console.log('Login response:', response);

      if (!response.data?.data?.token || !response.data?.data?.user) {
        throw new Error('Invalid login response structure');
      }

      const { token, user } = response.data.data;
      localStorage.setItem('token', token);
      setUser(user);

      const dashboardPath = user.role === 'farmer'
        ? '/dashboard/farmer'
        : user.role === 'buyer'
        ? '/dashboard/buyer'
        : '/';

      navigate(dashboardPath, { replace: true });

      toast({
        title: 'Login Successful',
        status: 'success',
      });

      return { success: true, user };
    } catch (err) {
      const errorMessage =
        err.response?.data?.message ||
        err.response?.data?.error ||
        err.message ||
        'Login failed';

      console.error('Login error:', errorMessage);
      setError(errorMessage);

      toast({
        title: 'Login Error',
        description: errorMessage,
        status: 'error',
      });

      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    try {
      setLoading(true);
      setError(null);
      localStorage.removeItem('token');

      const response = await apiClient.post('/auth/register', userData);
      console.log('Registration response:', response);

      if (!response.data?.data?.token || !response.data?.data?.user) {
        throw new Error('Invalid response structure from server');
      }

      const { token, user } = response.data.data;

      localStorage.setItem('token', token);
      setUser(user);

      // Optional token verification
      try {
        const meResponse = await apiClient.get('/auth/me');
        console.log('Token verification response:', meResponse.data);
      } catch (verifyErr) {
        console.error('Token verification failed:', verifyErr);
        throw new Error('Received token is invalid');
      }

      const dashboardPath = user.role === 'farmer'
        ? '/dashboard/farmer'
        : user.role === 'buyer'
        ? '/dashboard/buyer'
        : '/';

      navigate(dashboardPath, { state: { welcome: true }, replace: true });

      toast({
        title: 'Registration Successful',
        description: 'Welcome to our platform!',
        status: 'success',
      });

      return { success: true, user };
    } catch (err) {
      let errorMessage = 'Registration failed';
      if (err.response) {
        errorMessage = err.response.data?.message || err.response.data?.error || errorMessage;
      } else if (err.message) {
        errorMessage = err.message;
      }

      console.error('Registration error:', errorMessage);
      setError(errorMessage);

      toast({
        title: 'Registration Error',
        description: errorMessage,
        status: 'error',
      });

      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    navigate('/login', {
      state: { loggedOut: true }
    });
  };

  const value = {
    user,
    loading,
    error,
    login,
    register,
    logout,
    isAuthenticated: !!user,
    refreshAuth: initializeAuth
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
