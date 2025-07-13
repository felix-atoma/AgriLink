import React from 'react';
import { Outlet } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Sidebar from '../../components/layout/Sidebar';
import BuyerStats from '../../components/buyer/BuyerStats';

const BuyerDashboard = () => {
  const { t } = useTranslation();

  return (
    <div className="flex min-h-screen">
      <Sidebar role="buyer" />

      <main className="flex-grow p-6 lg:p-8 bg-gray-50 ml-64">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">
          {t('dashboard.buyer') || 'Buyer Dashboard'}
        </h1>

        <section className="overflow-x-auto mb-8">
          <BuyerStats />
        </section>

        <Outlet />
      </main>
    </div>
  );
};

export default BuyerDashboard;
