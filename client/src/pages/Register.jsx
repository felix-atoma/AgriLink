import React from 'react';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import RegisterForm from '../components/auth/RegisterForm';
import Spinner from '../components/shared/Spinner';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';

const Register = () => {
  const { t } = useTranslation();
  const { register, loading: authLoading } = useAuth();
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (userData) => {
    setError(null);
    setIsSubmitting(true);
    
    try {
      await register(userData);
      // On success, AuthContext will handle navigation
    } catch (err) {
      const errorMessage = err.response?.data?.message || t('auth.registration_error');
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBackToLogin = () => {
    navigate('/login');
  };

  if (authLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Spinner size="xl" />
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto my-10 p-6 bg-white rounded-lg shadow-md">
      <button
        onClick={handleBackToLogin}
        className="flex items-center text-gray-600 hover:text-gray-800 mb-4"
      >
        <ArrowLeftIcon className="h-5 w-5 mr-2" />
        {t('auth.back_to_login')}
      </button>

      <h1 className="text-2xl font-bold mb-2 text-gray-800">
        {t('auth.register_title')}
      </h1>
      <p className="text-gray-600 mb-6">{t('auth.register_subtitle')}</p>

      {error && (
        <div className="mb-4 p-3 bg-red-50 text-red-600 rounded border border-red-100">
          {error}
        </div>
      )}

      <RegisterForm 
        onSubmit={handleSubmit} 
        isSubmitting={isSubmitting}
      />

      <div className="mt-6 pt-4 border-t border-gray-100 text-center">
        <p className="text-gray-600">
          {t('auth.have_account')}{' '}
          <button
            onClick={handleBackToLogin}
            className="text-green-600 hover:text-green-800 font-medium"
          >
            {t('auth.login_here')}
          </button>
        </p>
      </div>
    </div>
  );
};

export default Register;