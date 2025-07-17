import React from 'react';
import { useTranslation } from 'react-i18next';
import { useCart } from '../../context/CartContext';
import CartItem from './CartItem';

const CartItemsList = ({ items }) => {
  const { t } = useTranslation();
  const { updateQuantity, removeFromCart } = useCart();

  const handleQuantityChange = (productId, newQuantity, variantId = null) => {
    updateQuantity(productId, newQuantity, variantId);
  };

  const handleRemoveItem = (productId, variantId = null) => {
    removeFromCart(productId, variantId);
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h2 className="text-xl font-semibold mb-4">
        {t('cart.items') || 'Your Items'}
      </h2>
      
      {items.length === 0 ? (
        <div className="text-center py-4">
          <p className="text-gray-500">{t('cart.empty') || 'Your cart is empty'}</p>
        </div>
      ) : (
        <div className="space-y-4" data-testid="cart-items-list">
          {items.map((item) => (
            <CartItem
              key={`${item.product._id}-${item.variantId || 'base'}-${item.addedAt}`}
              item={item}
              onQuantityChange={(newQuantity) => 
                handleQuantityChange(item.product._id, newQuantity, item.variantId)
              }
              onRemove={() => 
                handleRemoveItem(item.product._id, item.variantId)
              }
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default CartItemsList;