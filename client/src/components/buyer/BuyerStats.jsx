import { useTranslation } from 'react-i18next';

const stats = [
  { name: 'total_orders', value: 12 },
  { name: 'pending_orders', value: 2 },
  { name: 'completed_orders', value: 10 }
];

const BuyerStats = () => {
  const { t } = useTranslation();

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {stats.map((stat) => (
        <div key={stat.name} className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-gray-500 text-sm">{t(`buyer.${stat.name}`)}</h3>
          <p className="text-2xl font-bold mt-2">{stat.value}</p>
        </div>
      ))}
    </div>
  );
};

export default BuyerStats;