import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';
import Sidebar from '../../../components/layout/Sidebar';
import BuyerStats from '../../../components/buyer/BuyerStats';

const BuyerDashboard = () => {
  const { t } = useTranslation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-gray-50">
      {/* Sidebar */}
      <div className={`${isSidebarOpen ? 'block' : 'hidden'} lg:block`}>
        <Sidebar role="buyer" />
      </div>

      {/* Toggle button for small screens */}
      <button
        onClick={toggleSidebar}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white border border-gray-300 rounded-md shadow-md"
      >
        {isSidebarOpen ? (
          <XMarkIcon className="h-6 w-6 text-gray-700" />
        ) : (
          <Bars3Icon className="h-6 w-6 text-gray-700" />
        )}
      </button>

      {/* Main Content */}
      <main
        className={`flex-grow p-4 sm:p-6 lg:p-8 transition-all duration-300 ${
          isSidebarOpen ? 'lg:ml-64' : ''
        }`}
      >
        <header className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">
            {t('dashboard.buyer') || 'Buyer Dashboard'}
          </h1>
        </header>

        {/* Stats & Page Content */}
        <section className="overflow-x-auto mb-8">
          <BuyerStats />
        </section>

        <Outlet />
      </main>
    </div>
  );
};

export default BuyerDashboard;
