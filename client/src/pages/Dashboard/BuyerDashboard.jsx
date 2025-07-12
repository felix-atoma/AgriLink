import React from 'react';
import { useTranslation } from 'react-i18next';
import { Outlet } from 'react-router-dom';
import Sidebar from '../../components/layout/Sidebar';
import BuyerStats from '../../components/buyer/BuyerStats';

const BuyerDashboard = () => {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col lg:flex-row min-h-screen">
      {/* Sidebar for Buyer */}
      <Sidebar role="buyer" />

      {/* Main Content Area */}
      <main className="flex-grow p-6 lg:p-8 bg-gray-50" aria-label="Buyer dashboard">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">
          {t('dashboard.buyer')}
        </h1>

        {/* Top Dashboard Stats */}
        <section className="overflow-x-auto mb-6">
          <BuyerStats />
        </section>

        {/* Nested Routes (e.g. MyOrders) will render here */}
        <Outlet />
      </main>
    </div>
  );
};

export default BuyerDashboard;
