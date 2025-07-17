import React from 'react';
import { useTranslation } from 'react-i18next';

const CartSummary = ({ total, itemCount, onCheckout, isProcessing, onClearCart }) => {
  const { t } = useTranslation();

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h2 className="text-xl font-semibold mb-4">
        {t('cart.summary') || 'Order Summary'}
      </h2>
      
      <div className="space-y-4">
        <div className="flex justify-between">
          <span>{t('cart.items') || 'Items'}</span>
          <span>{itemCount}</span>
        </div>
        
        <div className="flex justify-between font-semibold text-lg">
          <span>{t('cart.total') || 'Total'}</span>
          <span className="text-green-600">
            {total.toLocaleString(undefined, {
              style: 'currency',
              currency: 'GHS'
            })}
          </span>
        </div>
        
        <div className="pt-4 space-y-2">
          <button
            onClick={onCheckout}
            disabled={isProcessing || itemCount === 0}
            className={`w-full py-2 px-4 rounded-md text-white ${isProcessing || itemCount === 0 ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'}`}
          >
            {isProcessing ? (
              <span>{t('cart.processing') || 'Processing...'}</span>
            ) : (
              <span>{t('cart.checkout') || 'Proceed to Checkout'}</span>
            )}
          </button>
          
          {itemCount > 0 && (
            <button
              onClick={onClearCart}
              className="w-full py-2 px-4 rounded-md text-red-600 border border-red-600 hover:bg-red-50"
            >
              {t('cart.clearCart') || 'Clear Cart'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default CartSummary;