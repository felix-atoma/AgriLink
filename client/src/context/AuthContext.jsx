import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import apiClient from '../services/apiClient';
import { toast } from 'react-toastify';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  // Helper function to get dashboard path
  const getDashboardPath = (role) => {
    switch (role) {
      case 'farmer':
        return '/dashboard/farmer';
      case 'buyer':
        return '/dashboard/buyer/orders';
      case 'admin':
        return '/admin';
      default:
        return '/';
    }
  };

  // Initialize auth state
  const initializeAuth = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      if (token) {
        const response = await apiClient.get('/auth/me');
        
        // Updated to match your backend response
        if (!response.data?.success || !response.data?.data) {
          throw new Error('Invalid user data from server');
        }
        
        setUser(response.data.data);
      }
    } catch (err) {
      console.error('Auth initialization error:', err);
      localStorage.removeItem('token');
      setUser(null);
      
      if (location.pathname !== '/login') {
        navigate('/login', {
          state: { from: location, sessionExpired: true }
        });
      }
    } finally {
      setLoading(false);
    }
  }, [navigate, location]);

  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  // Login function
  const login = async (credentials) => {
    try {
      setLoading(true);
      setError(null);

      // Basic validation
      if (!credentials.email?.trim() || !credentials.password?.trim()) {
        throw new Error('Email and password are required');
      }

      const response = await apiClient.post('/auth/login', credentials);
      
      // Updated to match your backend response
      if (!response.data?.success || !response.data?.data?.token || !response.data?.data?.user) {
        throw new Error('Invalid server response structure');
      }

      const { user, token } = response.data.data;
      
      // Store token and set user
      localStorage.setItem('token', token);
      setUser(user);

      // Get and navigate to dashboard path
      const dashboardPath = getDashboardPath(user.role);
      navigate(dashboardPath, { replace: true });

      // Show success toast
      toast.success('Login Successful', {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });

      return { success: true, user };
    } catch (err) {
      let errorMessage = 'Login failed';
      
      // Enhanced error handling
      if (err.response) {
        switch (err.response.status) {
          case 401:
            errorMessage = err.response.data?.message || 'Invalid email or password';
            break;
          case 403:
            errorMessage = 'Account not verified. Please check your email';
            break;
          case 429:
            errorMessage = 'Too many attempts. Please try again later';
            break;
          default:
            errorMessage = err.response.data?.message || errorMessage;
        }
      } else {
        errorMessage = err.message;
      }

      console.error('Login error:', errorMessage);
      setError(errorMessage);

      // Show error toast
      toast.error(errorMessage, {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });

      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  // Register function
  const register = async (userData) => {
    try {
      setLoading(true);
      setError(null);

      // Basic validation
      if (!userData.email?.trim() || !userData.password?.trim()) {
        throw new Error('Email and password are required');
      }

      const response = await apiClient.post('/auth/register', userData);
      
      // Updated to match your backend response
      if (!response.data?.success || !response.data?.data?.token || !response.data?.data?.user) {
        throw new Error('Invalid server response structure');
      }

      const { user, token } = response.data.data;
      
      // Store token and set user
      localStorage.setItem('token', token);
      setUser(user);

      // Verify token immediately
      try {
        await apiClient.get('/auth/me');
      } catch (verifyErr) {
        console.error('Token verification failed:', verifyErr);
        throw new Error('Session validation failed');
      }

      // Get and navigate to dashboard path
      const dashboardPath = getDashboardPath(user.role);
      navigate(dashboardPath, { 
        state: { welcome: true }, 
        replace: true 
      });

      // Show success toast
      toast.success('Registration Successful', {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });

      return { success: true, user };
    } catch (err) {
      let errorMessage = 'Registration failed';
      
      if (err.response) {
        switch (err.response.status) {
          case 400:
            errorMessage = 'Validation error: ' + 
              (err.response.data?.errors?.join(', ') || 'Invalid data provided');
            break;
          case 409:
            errorMessage = 'Account already exists with this email';
            break;
          default:
            errorMessage = err.response.data?.message || errorMessage;
        }
      } else {
        errorMessage = err.message;
      }

      console.error('Registration error:', errorMessage);
      setError(errorMessage);

      // Show error toast
      toast.error(errorMessage, {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });

      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  // Logout function
  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    navigate('/login', {
      state: { loggedOut: true }
    });
  };

  // Context value
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