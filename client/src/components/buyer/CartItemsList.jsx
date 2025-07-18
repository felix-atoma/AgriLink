import React from 'react';
import { useTranslation } from 'react-i18next';
import { useCart } from '../../context/CartContext';
import CartItem from './CartItem';

const CartItemsList = ({ items = [] }) => {  // Default to empty array
  const { t } = useTranslation();
  const { updateQuantity, removeFromCart } = useCart();

  const handleQuantityChange = (productId, newQuantity, variantId = null) => {
    updateQuantity(productId, newQuantity, variantId);
  };

  const handleRemoveItem = (productId, variantId = null) => {
    removeFromCart(productId, variantId);
  };

  // Early return if items is null or undefined (extra safety)
  if (!items) {
    return (
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="text-center py-4">
          <p className="text-gray-500">
            {t('cart.loading') || 'Loading cart items...'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h2 className="text-xl font-semibold mb-4">
        {t('cart.items') || 'Your Items'}
      </h2>
      
      {items.length === 0 ? (
        <div className="text-center py-4">
          <p className="text-gray-500">
            {t('cart.empty') || 'Your cart is empty'}
          </p>
        </div>
      ) : (
        <div className="space-y-4" data-testid="cart-items-list">
          {items.map((item) => {
            // Additional safety check for item.product
            if (!item?.product) return null;
            
            return (
              <CartItem
                key={`${item.product._id}-${item.variantId || 'base'}`}
                item={item}
                onQuantityChange={(newQuantity) => 
                  handleQuantityChange(item.product._id, newQuantity, item.variantId)
                }
                onRemove={() => 
                  handleRemoveItem(item.product._id, item.variantId)
                }
              />
            );
          })}
        </div>
      )}
    </div>
  );
};

export default CartItemsList;