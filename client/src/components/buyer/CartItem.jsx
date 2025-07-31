import React from 'react';
import { useTranslation } from 'react-i18next';

const CartItem = ({ item, onQuantityChange, onRemove }) => {
  const { t } = useTranslation();

  const handleQuantityUpdate = (newQuantity) => {
    const num = Math.max(1, Math.min(99, Number(newQuantity)));
    onQuantityChange(num);
  };

  const increment = () => handleQuantityUpdate(item.quantity + 1);
  const decrement = () => handleQuantityUpdate(item.quantity - 1);

  return (
    <div className="flex items-center justify-between border-b pb-4" data-testid="cart-item">
      <div className="flex items-center space-x-4 flex-1 min-w-0">
        <div className="w-20 h-20 bg-gray-100 rounded-md overflow-hidden flex-shrink-0">
          {item.product.images?.[0] ? (
            <img
              src={
                typeof item.product.images[0] === 'object' && item.product.images[0].url
                  ? item.product.images[0].url
                  : item.product.images[0]
              }
              alt={item.product.name}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400">
              {t('products:product.noImage') || 'No Image'}
            </div>
          )}
        </div>

        <div className="min-w-0">
          <h3 className="font-medium text-gray-800 truncate">{item.product.name}</h3>
          {item.variantId && (
            <p className="text-sm text-gray-500 truncate">
              {item.product.variants?.find(v => v._id === item.variantId)?.name || ''}
            </p>
          )}
          <p className="text-lg font-semibold text-green-600">
            {(item.product.price * item.quantity).toLocaleString(undefined, {
              style: 'currency',
              currency: 'GHS'
            })}
          </p>
        </div>
      </div>

      <div className="flex items-center space-x-4">
        <div className="flex items-center border rounded-md">
          <button
            onClick={decrement}
            className="px-3 py-1 text-gray-600 hover:bg-gray-100 transition-colors"
            aria-label="Decrease quantity"
            disabled={item.quantity <= 1}
          >
            -
          </button>
          <input
            type="number"
            min="1"
            max="99"
            value={item.quantity}
            onChange={(e) => handleQuantityUpdate(e.target.value)}
            onBlur={() => handleQuantityUpdate(item.quantity)} // Validate on blur
            className="w-12 px-1 py-1 text-center border-0 focus:ring-0 bg-transparent"
            aria-label="Quantity"
          />
          <button
            onClick={increment}
            className="px-3 py-1 text-gray-600 hover:bg-gray-100 transition-colors"
            aria-label="Increase quantity"
          >
            +
          </button>
        </div>

        <button
          onClick={onRemove}
          className="text-red-500 hover:text-red-700 transition-colors p-1"
          aria-label={t('cart.removeItem') || 'Remove item'}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default CartItem;
