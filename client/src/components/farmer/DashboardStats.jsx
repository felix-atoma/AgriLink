import React from 'react';
import { useTranslation } from 'react-i18next';

const stats = [
  { name: 'total_products', value: 24 },
  { name: 'total_orders', value: 12 },
  { name: 'pending_orders', value: 3 },
  { name: 'revenue', value: 1250 }
];

const DashboardStats = () => {
  const { t } = useTranslation();

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      {stats.map((stat) => (
        <div key={stat.name} className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-gray-500 text-sm">{t(`farmer.${stat.name}`)}</h3>
          <p className="text-2xl font-bold mt-2">
            {stat.name === 'revenue' ? '$' : ''}{stat.value}
          </p>
        </div>
      ))}
    </div>
  );
};

export default DashboardStats;