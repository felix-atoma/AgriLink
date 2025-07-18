import React from 'react';
import { useTranslation } from 'react-i18next';

const InventoryAlerts = ({ inventoryStatus, cart, onAdjustQuantity }) => {
  const { t } = useTranslation();
  
  const getAlertItems = () => {
    return Object.entries(inventoryStatus)
      .filter(([_, status]) => status.available < status.requested)
      .map(([productId, status]) => {
        const item = cart.find(i => i.product._id === productId);
        return {
          productId,
          name: status.name,
          available: status.available,
          requested: status.requested,
          variant: item?.variantId
        };
      });
  };

  const alertItems = getAlertItems();

  if (alertItems.length === 0) return null;

  return (
    <div className="mb-6 space-y-3">
      {alertItems.map((item) => (
        <div key={item.productId} className="bg-red-50 border-l-4 border-red-400 p-4 rounded">
          <div className="flex justify-between items-center">
            <div>
              <p className="font-medium">
                {t('cart.insufficientStock') || 'Insufficient stock'}:
                <span className="font-semibold ml-1">{item.name}</span>
              </p>
              <p className="text-sm text-gray-600 mt-1">
                {t('cart.available') || 'Available'}: {item.available} | 
                {t('cart.requested') || 'Requested'}: {item.requested}
              </p>
            </div>
            <button
              onClick={() => onAdjustQuantity(item.productId, item.available, item.variant)}
              className="text-sm bg-red-100 hover:bg-red-200 px-3 py-1 rounded whitespace-nowrap"
            >
              {t('cart.adjustToAvailable') || 'Adjust to available'}
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default InventoryAlerts;