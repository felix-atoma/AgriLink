import React from 'react';
import { useTranslation } from 'react-i18next';
import { useCart } from '../context/CartContext';
import CartItem from '../components/buyer/CartItem';
import CartSummary from '../components/buyer/CartSummary';
import Spinner from '../components/shared/Spinner';
import toast from '../components/ui/toast'; // if it's a default export


import { useNavigate } from 'react-router-dom';

const Cart = () => {
  const { t } = useTranslation();
  const { cart, loading, createOrder, clearCart } = useCart();
  const navigate = useNavigate();

  const handleCheckout = async () => {
    // Sample hardcoded shipping address & paymentMethod
    const shippingAddress = 'Accra, Ghana';
    const paymentMethod = 'cash'; // You can replace this with a form later

    const result = await createOrder(shippingAddress, paymentMethod);

    if (result.success) {
      toast.success('Order placed successfully!');
      navigate('/dashboard/buyer/my-orders');
    } else {
      toast.error(result.message || 'Failed to place order');
    }
  };

  const handleClearCart = () => {
    clearCart();
    toast.info('Cart cleared');
  };

  if (loading) return <Spinner />;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">
        {t('cart.title') || 'Your Cart'}
      </h1>

      {cart.length === 0 ? (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 text-yellow-800 p-4 rounded">
          <p>{t('cart.empty') || 'Your cart is currently empty.'}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <section className="lg:col-span-2 space-y-4" aria-label="Cart items">
            {cart.map((item) => (
              <CartItem key={item._id || item.id} item={item} />
            ))}
          </section>

          <aside aria-label="Cart summary">
            <CartSummary onCheckout={handleCheckout} onClearCart={handleClearCart} />
          </aside>
        </div>
      )}
    </div>
  );
};

export default Cart;
