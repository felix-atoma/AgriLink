import React from 'react';
import { useTranslation } from 'react-i18next';
import { useCart } from '../context/CartContext';
import CartItem from '../components/buyer/CartItem';
import CartSummary from '../components/buyer/CartSummary';
import Spinner from '../components/shared/Spinner';
import { useToast } from '../components/ui/Toast'
import { useNavigate } from 'react-router-dom';

const Cart = () => {
  const { t } = useTranslation();
  const { cart, loading, clearCart, createOrder } = useCart();
  const { toast } = useToast(); // ✅ FIXED: destructure correctly
  const navigate = useNavigate();

  const handleCheckout = async () => {
    try {
      const validCartItems = cart.filter(
        (item) => item?.product?._id && item.quantity > 0
      );

      if (!validCartItems.length) {
        throw new Error(t('cart.empty_checkout') || 'Your cart has no valid products');
      }

      const orderData = {
        products: validCartItems.map(item => ({
          product: item.product._id,
          quantity: item.quantity
        })),
        shippingAddress: {
          street: '123 Main St',
          city: 'Accra',
          country: 'Ghana'
        },
        paymentMethod: 'cash'
      };

      console.log('[handleCheckout] Sending orderData:', orderData);

      const result = await createOrder(orderData);

      if (!result.success) {
        throw new Error(result.message || 'Failed to create order');
      }

      toast({
        title: t('order.success') || 'Order placed successfully',
        status: 'success'
      });

      navigate('/dashboard/buyer/my-orders');
    } catch (error) {
      toast({
        title: error.message || 'Checkout failed',
        status: 'error'
      });
    }
  };

  const handleClearCart = () => {
    clearCart();
    toast({
      title: t('cart.cleared') || 'Cart cleared',
      status: 'info'
    });
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
            {cart.map((item, idx) =>
              item?.product?._id ? (
                <CartItem
                  key={`${item.product._id}-${item.variantId || idx}`}
                  item={item}
                />
              ) : null
            )}
          </section>

          <aside aria-label="Cart summary">
            <CartSummary
              onCheckout={handleCheckout}
              onClearCart={handleClearCart}
            />
          </aside>
        </div>
      )}
    </div>
  );
};

export default Cart;
