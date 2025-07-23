import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { useTranslation } from 'react-i18next';
import { ShoppingCartIcon } from '@heroicons/react/24/outline';
import { useCart } from '../../context/CartContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const { t } = useTranslation();
  const { language, changeLanguage } = useLanguage();
  const { cartCount } = useCart();

  return (
    <nav className="bg-gradient-to-r from-amber-300 to-green-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* App Logo / Brand */}
          <Link 
            to="/" 
            className="text-xl font-bold text-gray-800 hover:text-amber-700 transition-colors"
          >
            {t('appName')}
          </Link>

          {/* Navigation Links */}
          <div className="flex items-center space-x-6">
            {/* Language Switcher */}
            <select
              value={language}
              onChange={(e) => changeLanguage(e.target.value)}
              className="border border-amber-500 bg-white bg-opacity-70 rounded px-2 py-1 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-amber-400"
            >
              <option value="en">EN</option>
              <option value="es">ES</option>
              <option value="fr">FR</option>
            </select>

            {/* Cart Icon (Visible for buyers only) */}
            {user?.role === 'buyer' && (
              <Link to="/cart" className="relative group">
                <ShoppingCartIcon className="w-6 h-6 text-gray-800 group-hover:text-amber-700 transition-colors" />
                {cartCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-amber-600 text-white rounded-full text-xs px-1.5 py-0.5">
                    {cartCount}
                  </span>
                )}
              </Link>
            )}

            {/* Auth Links */}
            {user ? (
              <>
                <Link
                  to={user.role === 'farmer' ? '/dashboard/farmer' : '/dashboard/buyer'}
                  className="text-gray-800 hover:text-amber-700 transition-colors font-medium"
                >
                  {t('dashboard')}
                </Link>

                <button
                  onClick={logout}
                  className="text-gray-800 hover:text-amber-700 transition-colors font-medium"
                >
                  {t('logout')}
                </button>
              </>
            ) : (
              <>
                <Link 
                  to="/login" 
                  className="text-gray-800 hover:text-amber-700 transition-colors font-medium"
                >
                  {t('login')}
                </Link>
                <Link 
                  to="/register" 
                  className="bg-amber-500 hover:bg-amber-600 text-white px-3 py-1 rounded-md font-medium transition-colors"
                >
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