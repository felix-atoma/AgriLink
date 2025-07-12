import { useTranslation } from 'react-i18next';

const statusSteps = ['pending', 'processing', 'shipped', 'delivered'];

const OrderTracker = ({ status }) => {
  const { t } = useTranslation();
  const currentIndex = statusSteps.indexOf(status);

  return (
    <div className="space-y-4">
      <h3 className="font-medium">{t('order.tracking')}</h3>
      <div className="flex justify-between">
        {statusSteps.map((step, index) => (
          <div
            key={step}
            className={`flex flex-col items-center ${
              index < currentIndex ? 'text-green-600' : 'text-gray-400'
            }`}
          >
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center ${
                index <= currentIndex ? 'bg-green-100' : 'bg-gray-100'
              }`}
            >
              {index + 1}
            </div>
            <span className="text-xs mt-1 capitalize">{t(`order.${step}`)}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default OrderTracker;