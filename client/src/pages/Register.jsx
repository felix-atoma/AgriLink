import React from 'react';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import RegisterForm from '../components/auth/RegisterForm';
import { useTranslation } from 'react-i18next';

const Register = () => {
  const { t } = useTranslation();
  const { register } = useAuth();
  const [error, setError] = useState(null);

  const handleSubmit = async (userData) => {
    setError(null);
    try {
      await register(userData); // ✅ handles navigation internally
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-4">{t('auth.register_title')}</h1>
      <p className="text-gray-600 mb-6">{t('auth.register_subtitle')}</p>

      {error && (
        <div className="mb-4 bg-red-100 text-red-700 px-4 py-2 rounded">
          {error}
        </div>
      )}

      <RegisterForm onSubmit={handleSubmit} />

      <p className="mt-4 text-center">
        {t('auth.have_account')}{' '}
        <a href="/login" className="text-green-600 hover:underline">
          {t('auth.login_here')}
        </a>
      </p>
    </div>
  );
};

export default Register;
