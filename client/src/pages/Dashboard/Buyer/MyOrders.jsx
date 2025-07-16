import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import Spinner from '../../../components/shared/Spinner';
import apiClient from '../../../services/apiClient';

// Inline validator for ObjectId
const isValidObjectId = (id) => /^[a-f\d]{24}$/i.test(id);

const MyOrders = () => {
  const { t, i18n } = useTranslation();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        const { data } = await apiClient.get('/orders/my-orders');

        const rawOrders = data?.data?.docs || [];

        const validOrders = rawOrders.filter(order =>
          isValidObjectId(order._id) && order.products?.length > 0
        );

        console.log('[MyOrders] Valid orders:', validOrders.length);
        setOrders(validOrders);
      } catch (err) {
        console.error('[MyOrders] Fetch error:', err);
        setError(err.response?.data?.message || t('errors.order_fetch_failed'));
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [t]);

  const formatDate = (dateString) => {
    return new Intl.DateTimeFormat(i18n.language, {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }).format(new Date(dateString));
  };

  const getStatusClass = (status) => {
    const base = 'px-3 py-1 rounded-full text-xs font-semibold';
    switch (status) {
      case 'processing': return `${base} bg-blue-100 text-blue-800`;
      case 'shipped': return `${base} bg-green-100 text-green-800`;
      case 'delivered': return `${base} bg-purple-100 text-purple-800`;
      case 'cancelled': return `${base} bg-red-100 text-red-800`;
      default: return `${base} bg-gray-100 text-gray-800`;
    }
  };

  if (loading) return <Spinner className="mt-8" />;

  if (error) {
    return (
      <div className="max-w-4xl mx-auto p-4 text-red-600 bg-red-50 rounded-md">
        {error}
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">{t('myOrders.title')}</h1>

      {orders.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500">{t('myOrders.noOrders')}</p>
          <Link 
            to="/" 
            className="mt-4 inline-block text-blue-600 hover:underline"
          >
            {t('myOrders.continueShopping')}
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map(order => (
            <Link
              key={order._id}
              to={`/dashboard/buyer/orders/${order._id}`}
              className="block border rounded-lg overflow-hidden hover:shadow-md transition-shadow"
            >
              <div className="p-4 bg-white">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium">
                      {t('myOrders.order')} #{order._id.slice(-8).toUpperCase()}
                    </h3>
                    <p className="text-sm text-gray-500 mt-1">
                      {formatDate(order.createdAt)}
                    </p>
                  </div>
                  <span className={getStatusClass(order.status)}>
                    {t(`orderStatus.${order.status}`)}
                  </span>
                </div>

                <div className="mt-4 pt-4 border-t">
                  <div className="flex justify-between">
                    <span className="text-gray-600">{t('myOrders.items')}</span>
                    <span>{order.products.length}</span>
                  </div>
                  <div className="flex justify-between mt-2">
                    <span className="text-gray-600">{t('myOrders.total')}</span>
                    <span className="font-medium">
                      ${order.total?.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyOrders;
