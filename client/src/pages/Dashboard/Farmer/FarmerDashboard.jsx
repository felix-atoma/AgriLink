import React from 'react';
import { useTranslation } from 'react-i18next';
import { Outlet } from 'react-router-dom';
import Sidebar from '../../../components/layout/Sidebar';
import DashboardStats from '../../../components/farmer/DashboardStats';

const FarmerDashboard = () => {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col lg:flex-row min-h-screen">
      {/* Sidebar */}
      <Sidebar role="farmer" />

      {/* Main Dashboard Content */}
      <main className="flex-grow p-6 lg:p-8 lg:pl-64 bg-gray-50" aria-label="Farmer dashboard">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">
          {t('dashboard.farmer')}
        </h1>

        {/* Stats Section */}
        <section className="overflow-x-auto mb-6">
          <DashboardStats />
        </section>

        {/* Nested Routes (e.g. MyProducts) will render here */}
        <Outlet />
      </main>
    </div>
  );
};

export default FarmerDashboard;
