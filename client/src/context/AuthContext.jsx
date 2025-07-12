import React from 'react';
import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../services/apiClient'

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

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
    const res = await apiClient.post('/auth/login', credentials);
    const { user, token } = res.data.data;

    localStorage.setItem('token', token);
    setUser(user);

    navigate(user.role === 'farmer' ? '/dashboard/farmer' : '/dashboard');
  } catch (err) {
    setError(err.response?.data?.message || 'Login failed');
    throw err;
  } finally {
    setLoading(false);
  }
};


 const register = async (userData) => {
  try {
    setLoading(true);
    const res = await apiClient.post('/auth/register', userData);

    const { user, token } = res.data.data; // ✅ Access the nested data
    localStorage.setItem('token', token);
    setUser(user);

    navigate(user.role === 'farmer' ? '/dashboard/farmer' : '/dashboard');
  } catch (err) {
    setError(err.response?.data?.message || 'Registration failed');
    throw err;
  } finally {
    setLoading(false);
  }
};



  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    navigate('/login');
  };

  const value = {
    user,
    loading,
    error,
    login,
    register,
    logout,
    isAuthenticated: !!user
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