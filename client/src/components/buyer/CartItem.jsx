import React from 'react';
import { useCart } from '../../context/CartContext';
import { useTranslation } from 'react-i18next';
import Button from '../ui/Button';
import { TrashIcon } from '@heroicons/react/24/outline';

const CartItem = ({ item }) => {
  const { t } = useTranslation();
  const { updateQuantity, removeFromCart } = useCart();

  const productId = item?.product?._id;
  if (!productId) return null;

  const displayPrice = item.variantId ? (item.price || item.product?.price) : item.product?.price;
  const displayName = item.variantName
    ? `${item.product?.name} - ${item.variantName}`
    : item.product?.name;

  const handleQuantityChange = (newQuantity) => {
    if (newQuantity < 1) return;
    updateQuantity(productId, newQuantity);
  };

  const handleRemove = () => {
    removeFromCart(productId);
  };

  return (
    <div className="flex items-center gap-4 p-4 border-b border-gray-200 bg-white rounded-md shadow-sm">
      <div className="w-20 h-20 overflow-hidden rounded-md border">
        <img
          src={item.product?.images?.[0] || '/images/placeholder-product.jpg'}
          alt={displayName || t('product.unknown')}
          className="w-full h-full object-cover"
          onError={(e) => {
            e.target.src = '/images/placeholder-product.jpg';
          }}
        />
      </div>

      <div className="flex-1">
        <h3 className="text-base font-semibold text-gray-800">
          {displayName || t('product.unknown')}
        </h3>
        <p className="text-sm text-gray-500">
          ${displayPrice?.toFixed(2) || '0.00'}
        </p>
        {item.variantId && (
          <p className="text-xs text-gray-400 mt-1">
            {t('cart.variant')}: {item.variantName}
          </p>
        )}
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
          <Button
            onClick={() => handleQuantityChange(item.quantity - 1)}
            variant="ghost"
            size="sm"
            className="px-3 py-1 hover:bg-gray-100"
            aria-label={t('cart.decrease_quantity')}
          >
            −
          </Button>
          <span className="px-4 font-medium min-w-[2rem] text-center" aria-label={t('cart.quantity')}>
            {item.quantity}
          </span>
          <Button
            onClick={() => handleQuantityChange(item.quantity + 1)}
            variant="ghost"
            size="sm"
            className="px-3 py-1 hover:bg-gray-100"
            aria-label={t('cart.increase_quantity')}
          >
            +
          </Button>
        </div>

        <Button
          onClick={handleRemove}
          variant="ghost"
          size="icon"
          className="text-red-500 hover:text-red-700"
          aria-label={t('cart.remove_item')}
        >
          <TrashIcon className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
};

export default CartItem;
