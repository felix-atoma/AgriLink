// src/components/layout/Sidebar.jsx
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
  MapPinIcon
} from '@heroicons/react/24/outline';

const Sidebar = () => {
  const { user, logout } = useAuth();
  const { t } = useTranslation();

  if (!user) return null;

  const navItems = user.role === 'farmer'
    ? [
        { key: 'common.dashboard', icon: HomeIcon, to: '/dashboard/farmer' },
        { key: 'products.myProducts', icon: ShoppingBagIcon, to: '/dashboard/farmer/my-products' },
        { key: 'products.editProduct', icon: PlusCircleIcon, to: '/dashboard/farmer/edit-product/:id' },
        { key: 'orders.received', icon: ChartBarIcon, to: '/dashboard/farmer/orders-received' }
      ]
    : [
        { key: 'common.dashboard', icon: HomeIcon, to: '/dashboard/buyer' },
        { key: 'products.OrderDetails', icon: ShoppingBagIcon, to: '/dashboard/buyer/order-details/:id' },
        { key: 'orders.myOrders', icon: ChartBarIcon, to: '/dashboard/buyer/my-orders' },
        { key: 'nearby.farms', icon: MapPinIcon, to: '/dashboard/buyer/nearby-farms' }
      ];

  return (
    <aside className="w-64 bg-white shadow-md h-screen fixed top-0 left-0 z-20 flex flex-col">
      <div className="p-4 border-b border-gray-200">
        <h1 className="text-xl font-bold text-primary-600">
          {t('common.appName')}
        </h1>
        <p className="text-xs text-gray-500">
          {user.role === 'farmer' ? t('auth.farmer') : t('auth.buyer')}
        </p>
      </div>

      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex items-center px-4 py-2 text-sm font-medium rounded-md transition ${
                isActive
                  ? 'bg-primary-100 text-primary-700'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`
            }
          >
            <item.icon className="h-5 w-5 mr-3" />
            {t(item.key)}
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-gray-200">
        <button
          onClick={logout}
          className="w-full flex items-center px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-red-600 rounded-md"
        >
          <ArrowLeftOnRectangleIcon className="h-5 w-5 mr-3" />
          {t('common.logout')}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
