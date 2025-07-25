import React from 'react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LoginForm from '../components/auth/LoginForm';
import { useTranslation } from 'react-i18next';

const Login = () => {
  const { t } = useTranslation();
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState(null);

  // ✅ Auto-redirect if already logged in
  useEffect(() => {
    if (user?.role) {
      redirectToDashboard(user.role);
    }
  }, [user]);

 const redirectToDashboard = (role) => {
  if (role === 'farmer') {
    navigate('/dashboard/farmer');
  } else if (role === 'buyer') {
    navigate('/dashboard/buyer');
  } else {
    navigate('/');
  }
};


  const handleSubmit = async (email, password) => {
    setError(null);
    const result = await login(email, password);

    if (!result.success) {
      setError(result.message || t('auth.login_error'));
      return;
    }

    const role = result.user?.role || user?.role;
    redirectToDashboard(role);
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-4">{t('auth.login_title')}</h1>
      <p className="text-gray-600 mb-6">{t('auth.login_subtitle')}</p>

      {error && (
        <div className="mb-4 bg-red-100 text-red-700 px-4 py-2 rounded">
          {error}
        </div>
      )}

      <LoginForm onSubmit={handleSubmit} />

      <p className="mt-4 text-center">
        {t('auth.no_account')}{' '}
        <a href="/register" className="text-green-600 hover:underline">
          {t('auth.register_here')}
        </a>
      </p>
    </div>
  );
};

export default Login;
