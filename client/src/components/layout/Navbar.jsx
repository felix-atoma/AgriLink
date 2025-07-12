import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { useTranslation } from 'react-i18next';

const Navbar = () => {
  const { user, logout } = useAuth();
  const { t } = useTranslation();
  const { language, changeLanguage } = useLanguage();

  return (
    <nav className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* App Logo / Brand */}
          <Link to="/" className="text-xl font-bold text-primary-600">
            {t('appName')}
          </Link>

          {/* Navigation Links */}
          <div className="flex items-center space-x-4">
            <select
              value={language}
              onChange={(e) => changeLanguage(e.target.value)}
              className="border border-gray-300 rounded px-2 py-1 text-sm"
            >
              <option value="en">EN</option>
              <option value="es">ES</option>
              <option value="fr">FR</option>
            </select>

            {user ? (
              <>
                <Link
                  to={user.role === 'farmer' ? '/dashboard/farmer' : '/dashboard/buyer'}
                  className="text-gray-700 hover:text-primary-600"
                >
                  {t('dashboard')}
                </Link>

                <button
                  onClick={logout}
                  className="text-gray-700 hover:text-primary-600"
                >
                  {t('logout')}
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="text-gray-700 hover:text-primary-600">
                  {t('login')}
                </Link>
                <Link to="/register" className="text-gray-700 hover:text-primary-600">
                  {t('register')}
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
