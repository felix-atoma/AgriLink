import React from 'react';
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import Spinner from '@/components/shared/Spinner';
import apiClient from '@/services/apiClient';

const MyOrders = () => {
  const { t, i18n } = useTranslation();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const { data } = await apiClient.get('/orders/my-orders');
        setOrders(data);
      } catch (err) {
        setError(err.response?.data?.message || err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const formatDate = (dateStr) =>
    new Intl.DateTimeFormat(i18n.language, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(new Date(dateStr));

  const getStatusBadgeStyle = (status) => {
    const base = 'inline-block px-2 py-1 rounded text-xs font-semibold';
    switch (status) {
      case 'pending':
        return `${base} bg-yellow-100 text-yellow-800`;
      case 'processing':
        return `${base} bg-blue-100 text-blue-800`;
      case 'shipped':
        return `${base} bg-green-100 text-green-800`;
      case 'cancelled':
        return `${base} bg-red-100 text-red-800`;
      default:
        return `${base} bg-gray-100 text-gray-700`;
    }
  };

  if (loading) return <Spinner />;
  if (error)
    return (
      <div className="text-red-600 bg-red-100 p-4 rounded mt-4">
        {error}
      </div>
    );

  return (
    <section className="max-w-4xl mx-auto px-4 py-8">
      <h2 className="text-2xl font-bold mb-6">{t('orders.my_orders')}</h2>

      {orders.length === 0 ? (
        <p className="text-gray-600">{t('orders.no_orders')}</p>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div
              key={order._id}
              className="bg-white border rounded-lg p-4 shadow-sm"
            >
              <div className="flex justify-between items-center mb-2">
                <span className="font-medium">
                  {t('orders.order')} #{order._id?.slice(0, 8)}
                </span>
                <span className="text-sm text-gray-500">
                  {formatDate(order.createdAt)}
                </span>
              </div>

              <div className="text-sm text-gray-700">
                <p>
                  <span className="font-medium">{t('orders.total')}:</span>{' '}
                  ${order.total?.toFixed(2)}
                </p>
                <p className="mt-1">
                  <span className="font-medium">{t('orders.status')}:</span>{' '}
                  <span className={getStatusBadgeStyle(order.status)}>
                    {order.status}
                  </span>
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
};

export default MyOrders;
