import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useCart } from '../context/CartContext';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import PaymentMethodSelector from '../components/buyer/PaymentMethodSelector';
import AddressForm from '../components/buyer/AddressForm';
import CartItemsList from '../components/buyer/CartItemsList';
import CartSummary from '../components/buyer/CartSummary';
import Spinner from '../components/shared/Spinner';

const Cart = () => {
  const { t } = useTranslation();
  const {
    cart,
    cartTotal,
    loading,
    createOrder,
    clearCart
  } = useCart();
  const navigate = useNavigate();

  const [address, setAddress] = useState({
    street: '',
    city: '',
    country: '',
    postalCode: ''
  });
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [cardDetails, setCardDetails] = useState({
    cardNumber: '',
    expiry: '',
    cvv: ''
  });
  const [mobileDetails, setMobileDetails] = useState({
    provider: '',
    phone: ''
  });
  const [isProcessing, setIsProcessing] = useState(false);

  const handleCheckout = async () => {
    // Validate cart is not empty
    if (!cart || cart.length === 0) {
      toast.error(t('cart.empty') || 'Your cart is empty');
      return;
    }

    // Validate address
    if (!address.street || !address.city || !address.country) {
      toast.error(t('checkout.addressIncomplete') || 'Please complete your shipping address');
      return;
    }

    setIsProcessing(true);
    try {
      // Prepare order items to match backend expectations
      const products = cart.map(item => ({
        product: item.product._id,
        quantity: item.quantity,
        price: item.product.price,
        variantId: item.variantId || undefined,
        name: item.product.name,
        image: item.product.image || ''
      }));

      // Prepare complete order data
      const orderData = {
        products,
        shippingAddress: {
          street: address.street,
          city: address.city,
          country: address.country,
          postalCode: address.postalCode || ''
        },
        paymentMethod,
        totalAmount: cartTotal,
        ...(paymentMethod === 'card' && { 
          paymentDetails: {
            cardNumber: cardDetails.cardNumber,
            expiry: cardDetails.expiry,
            cvv: cardDetails.cvv
          }
        }),
        ...(paymentMethod === 'mobile' && {
          paymentDetails: {
            provider: mobileDetails.provider,
            phone: mobileDetails.phone
          }
        })
      };

      // Create order
      const result = await createOrder(orderData);

      if (result.success) {
        toast.success(t('checkout.success') || 'Order placed successfully!');
        clearCart();
        setTimeout(() => {
          navigate("/order-success");
        }, 1500);
      } else {
        toast.error(result.message || t('checkout.error') || 'Order failed');
      }
    } catch (error) {
      console.error("Checkout error:", error);
      toast.error(error.message || t('checkout.error') || 'Failed to place order');
    } finally {
      setIsProcessing(false);
    }
  };

  if (loading) return <Spinner />;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">
        {t('cart.title') || 'Your Shopping Cart'}
      </h1>

      {cart.length === 0 ? (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 text-yellow-800 p-4 rounded">
          <p>{t('cart.empty') || 'Your cart is currently empty'}</p>
          <button
            onClick={() => navigate('/products')}
            className="mt-2 px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
          >
            {t('cart.continueShopping') || 'Continue Shopping'}
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <CartItemsList items={cart} />

            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-xl font-semibold mb-4">
                {t('checkout.shipping') || 'Shipping Information'}
              </h2>
              <AddressForm address={address} onChange={setAddress} />
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-xl font-semibold mb-4">
                {t('checkout.payment') || 'Payment Method'}
              </h2>
              <PaymentMethodSelector
                method={paymentMethod}
                onMethodChange={setPaymentMethod}
                cardDetails={cardDetails}
                onCardChange={(e) =>
                  setCardDetails({
                    ...cardDetails,
                    [e.target.name]: e.target.value
                  })
                }
                mobileDetails={mobileDetails}
                onMobileChange={(e) =>
                  setMobileDetails({
                    ...mobileDetails,
                    [e.target.name]: e.target.value
                  })
                }
              />
            </div>
          </div>

          <div>
            <CartSummary
              total={cartTotal}
              itemCount={cart.reduce((count, item) => count + item.quantity, 0)}
              onCheckout={handleCheckout}
              isProcessing={isProcessing}
              onClearCart={clearCart}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default Cart;