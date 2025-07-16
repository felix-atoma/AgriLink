import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Spinner from '../../../components/shared/Spinner';
import OrderTracker from '../../../components/buyer/OrderTracker';
import apiClient from '../../../services/apiClient';
import { useToast } from '../../../components/ui/Toast';
import { isValidObjectId } from '../../../utils/validateForm';

const OrderDetails = () => {
  const { t } = useTranslation();
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { toast } = useToast();

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        // Validate orderId before fetching
        if (!isValidObjectId(orderId)) {
          throw new Error(t('errors.invalidOrderId'));
        }

        const { data } = await apiClient.get(`/orders/${orderId}`);
        
        if (!data?.data?._id) {
          throw new Error(t('errors.orderNotFound'));
        }

        setOrder(data.data);
      } catch (err) {
        console.error('[OrderDetails] Error:', err);
        setError(err.response?.data?.message || err.message);
        toast({
          title: t('errors.orderFetchFailed'),
          description: err.response?.data?.message || err.message,
          status: 'error',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderId, t, toast]);

  const formatDate = (dateString) => {
    return new Intl.DateTimeFormat(t('locale'), {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(dateString));
  };

  if (loading) return <Spinner className="mt-8" />;

  if (error) {
    return (
      <div className="max-w-4xl mx-auto p-4">
        <div className="bg-red-50 text-red-600 p-4 rounded-md mb-4">
          {error}
        </div>
        <Link 
          to="/dashboard/buyer/orders" 
          className="text-blue-600 hover:underline"
        >
          {t('backToOrders')}
        </Link>
      </div>
    );
  }

  if (!order) return null;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex justify-between items-start mb-6">
        <h1 className="text-2xl font-bold">
          {t('orderDetails.title')} #{order._id.slice(-8).toUpperCase()}
        </h1>
        <span className="text-sm text-gray-500">
          {formatDate(order.createdAt)}
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Order Items */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4">
              {t('orderDetails.items')}
            </h2>
            
            {order.products.map((item, index) => (
              <div 
                key={`${item.product?._id || index}`} 
                className="flex justify-between py-3 border-b last:border-b-0"
              >
                <div>
                  <p className="font-medium">
                    {item.product?.name || item.name}
                  </p>
                  <p className="text-sm text-gray-500">
                    {t('quantity')}: {item.quantity}
                  </p>
                </div>
                <p className="font-medium">
                  ${((item.product?.price || item.price) * item.quantity).toFixed(2)}
                </p>
              </div>
            ))}

            <div className="flex justify-between mt-6 pt-4 border-t font-bold text-lg">
              <span>{t('orderDetails.total')}</span>
              <span>${order.total?.toFixed(2)}</span>
            </div>
          </div>

          {/* Shipping Information */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4">
              {t('orderDetails.shippingInfo')}
            </h2>
            <p className="mb-1">
              <span className="font-medium">{t('orderDetails.address')}:</span> {order.shippingAddress.street}
            </p>
            <p className="mb-1">
              <span className="font-medium">{t('orderDetails.city')}:</span> {order.shippingAddress.city}
            </p>
            <p className="mb-1">
              <span className="font-medium">{t('orderDetails.country')}:</span> {order.shippingAddress.country}
            </p>
            {order.shippingAddress.postalCode && (
              <p>
                <span className="font-medium">{t('orderDetails.postalCode')}:</span> {order.shippingAddress.postalCode}
              </p>
            )}
          </div>
        </div>

        {/* Order Status */}
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4">
              {t('orderDetails.status')}
            </h2>
            <OrderTracker status={order.status} />
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4">
              {t('orderDetails.payment')}
            </h2>
            <p className="capitalize">
              {order.paymentMethod.replace('_', ' ')}
            </p>
            <p className="text-sm text-gray-500 mt-2">
              {t('orderDetails.paymentStatus')}: {order.paymentStatus}
            </p>
          </div>

          <Link
            to="/dashboard/buyer/orders"
            className="block w-full text-center py-2 px-4 border border-gray-300 rounded-md hover:bg-gray-50 transition"
          >
            {t('backToOrders')}
          </Link>
        </div>
      </div>
    </div>
  );
};

export default OrderDetails;