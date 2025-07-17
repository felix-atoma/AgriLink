import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Outlet } from 'react-router-dom';
import Sidebar from '../../../components/layout/Sidebar';
import DashboardStats from '../../../components/farmer/DashboardStats';
import { Bars3Icon } from '@heroicons/react/24/outline'; // Heroicon

const FarmerDashboard = () => {
  const { t } = useTranslation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  return (
    <div className="flex h-screen overflow-hidden bg-gray-100">

      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex lg:flex-shrink-0 lg:w-64 bg-white border-r shadow-md">
        <Sidebar role="farmer" />
      </aside>

      {/* Mobile Sidebar */}
      <div className={`fixed inset-0 z-40 flex lg:hidden transition-transform duration-300 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="w-64 bg-white shadow-md">
          <Sidebar role="farmer" />
        </div>
        <div
          className="flex-1 bg-black bg-opacity-30"
          onClick={toggleSidebar}
        />
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col w-0 overflow-hidden">
        {/* Top bar (mobile only) */}
        <div className="flex items-center px-4 py-3 bg-white border-b shadow-sm lg:hidden">
          <button onClick={toggleSidebar} className="text-gray-700 focus:outline-none">
            <Bars3Icon className="h-6 w-6" />
          </button>
          <h1 className="ml-4 text-lg font-semibold text-gray-800">
            {t('dashboard.farmer')}
          </h1>
        </div>

        {/* Main area */}
        <main className="flex-1 p-4 sm:p-6 md:p-8 overflow-y-auto">
          {/* Title (desktop) */}
          <header className="mb-6 hidden lg:block">
            <h1 className="text-2xl font-bold text-gray-800">
              {t('dashboard.farmer')}
            </h1>
          </header>

          {/* Dashboard metrics */}
          <section className="mb-6">
            <DashboardStats />
          </section>

          {/* Nested route content */}
          <section>
            <Outlet />
          </section>
        </main>
      </div>
    </div>
  );
};

export default FarmerDashboard;
