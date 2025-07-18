import React from 'react';
import { useTranslation } from 'react-i18next';

const PaymentMethodSelector = ({
  method,
  onMethodChange,
  cardDetails,
  onCardChange,
  mobileDetails,
  onMobileChange
}) => {
  const { t } = useTranslation();

  return (
    <div className="space-y-4">
      <div className="space-y-3">
        {/* Cash on Delivery */}
        <div className="flex items-center">
          <input
            id="payment-cash"
            name="paymentMethod"
            type="radio"
            checked={method === 'cash'}
            onChange={() => onMethodChange('cash')}
            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500"
          />
          <label htmlFor="payment-cash" className="ml-3 text-sm font-medium text-gray-700">
            {t('payment.cash') || 'Cash on Delivery'}
          </label>
        </div>

        {/* Credit/Debit Card */}
        <div className="flex items-center">
          <input
            id="payment-credit_card"
            name="paymentMethod"
            type="radio"
            checked={method === 'credit_card'}
            onChange={() => onMethodChange('credit_card')}
            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500"
          />
          <label htmlFor="payment-credit_card" className="ml-3 text-sm font-medium text-gray-700">
            {t('payment.card') || 'Credit/Debit Card'}
          </label>
        </div>

        {/* Mobile Money */}
        <div className="flex items-center">
          <input
            id="payment-mobile_money"
            name="paymentMethod"
            type="radio"
            checked={method === 'mobile_money'}
            onChange={() => onMethodChange('mobile_money')}
            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500"
          />
          <label htmlFor="payment-mobile_money" className="ml-3 text-sm font-medium text-gray-700">
            {t('payment.mobile') || 'Mobile Money'}
          </label>
        </div>
      </div>

      {/* Card Details */}
      {method === 'credit_card' && (
        <div className="mt-4 p-4 bg-gray-50 rounded-lg space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('payment.cardNumber') || 'Card Number'}
            </label>
            <input
              type="text"
              name="cardNumber"
              value={cardDetails.cardNumber}
              onChange={onCardChange}
              placeholder="1234 5678 9012 3456"
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('payment.expiry') || 'Expiry Date'}
              </label>
              <input
                type="text"
                name="expiry"
                value={cardDetails.expiry}
                onChange={onCardChange}
                placeholder="MM/YY"
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('payment.cvv') || 'CVV'}
              </label>
              <input
                type="text"
                name="cvv"
                value={cardDetails.cvv}
                onChange={onCardChange}
                placeholder="123"
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none"
              />
            </div>
          </div>
        </div>
      )}

      {/* Mobile Money Details */}
      {method === 'mobile_money' && (
        <div className="mt-4 p-4 bg-gray-50 rounded-lg space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('payment.provider') || 'Mobile Provider'}
            </label>
            <select
              name="provider"
              value={mobileDetails.provider}
              onChange={onMobileChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none"
            >
              <option value="">{t('payment.selectProvider') || 'Select Provider'}</option>
              <option value="mtn">MTN Mobile Money</option>
              <option value="vodafone">Vodafone Cash</option>
              <option value="airteltigo">AirtelTigo Money</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('payment.phone') || 'Phone Number'}
            </label>
            <input
              type="tel"
              name="phone"
              value={mobileDetails.phone}
              onChange={onMobileChange}
              placeholder="0551234567"
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentMethodSelector;
