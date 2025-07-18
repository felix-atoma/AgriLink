import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTranslation } from 'react-i18next';
import {
  HomeIcon,
  ShoppingBagIcon,
  PlusCircleIcon,
  ChartBarIcon,
  ArrowLeftOnRectangleIcon,
  MapPinIcon,
} from '@heroicons/react/24/outline';

const Sidebar = () => {
  const { user, logout } = useAuth();
  const { t } = useTranslation();

  if (!user) return null;

  const navItems = user.role === 'farmer'
    ? [
        { key: 'dashboard', icon: HomeIcon, to: '/dashboard/farmer' },
        { key: 'myProducts', icon: ShoppingBagIcon, to: '/dashboard/farmer/my-products' },
        { key: 'addProduct', icon: PlusCircleIcon, to: '/dashboard/farmer/add-product' },
        { key: 'ordersReceived', icon: ChartBarIcon, to: '/dashboard/farmer/orders-received' },
      ]
    : [
        { key: 'dashboard', icon: HomeIcon, to: '/dashboard/buyer' },
        { key: 'myOrders', icon: ChartBarIcon, to: '/dashboard/buyer/orders' },
        { key: 'nearbyFarms', icon: MapPinIcon, to: '/dashboard/buyer/nearby-farms' },
      ];

  return (
    <aside className="w-64 bg-gradient-to-b from-amber-300 to-green-200 shadow-md h-screen fixed top-0 left-0 z-20 flex flex-col">
      <div className="p-4 border-b border-gray-200 bg-white bg-opacity-30">
        <h1 className="text-xl font-bold text-gray-800">
          {t('appName')}
        </h1>
        <p className="text-xs text-gray-700">
          {user.role === 'farmer' ? t('farmer') : t('buyer')}
        </p>
      </div>

      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to.endsWith('/farmer') || item.to.endsWith('/buyer')}
            className={({ isActive }) =>
              `flex items-center px-4 py-2 text-sm font-medium rounded-md transition ${
                isActive
                  ? 'bg-white bg-opacity-50 text-gray-900 shadow-sm'
                  : 'text-gray-700 hover:bg-white hover:bg-opacity-30 hover:text-gray-900'
              }`
            }
          >
            <item.icon className="h-5 w-5 mr-3" />
            {t(item.key)}
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-gray-200 bg-white bg-opacity-30">
        <button
          onClick={logout}
          className="w-full flex items-center px-4 py-2 text-sm font-medium text-gray-700 hover:bg-white hover:bg-opacity-50 hover:text-red-600 rounded-md transition"
        >
          <ArrowLeftOnRectangleIcon className="h-5 w-5 mr-3" />
          {t('logout')}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;