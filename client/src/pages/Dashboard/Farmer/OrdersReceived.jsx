import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import Spinner from '../../../components/shared/Spinner';
import apiClient from '../../../services/apiClient';

const OrdersReceived = () => {
  const { t } = useTranslation();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updatingOrderId, setUpdatingOrderId] = useState(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const { data } = await apiClient.get('/orders/received');
        setOrders(data?.data?.docs || []); // Handle paginated response
      } catch (err) {
        setError(err?.response?.data?.message || 'Failed to load orders.');
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const updateOrderStatus = async (orderId, status) => {
    try {
      setUpdatingOrderId(orderId);
      await apiClient.patch(`/orders/${orderId}`, { status });
      setOrders((prev) =>
        prev.map((order) =>
          order._id === orderId ? { ...order, status } : order
        )
      );
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to update order status.');
    } finally {
      setUpdatingOrderId(null);
    }
  };

  const getAnalytics = () => {
    const total = orders.length;
    const byStatus = {
      processing: 0,
      shipped: 0,
      delivered: 0,
      cancelled: 0
    };
    let totalRevenue = 0;

    orders.forEach((order) => {
      if (byStatus[order.status] !== undefined) {
        byStatus[order.status]++;
      }
      totalRevenue += order.total || 0;
    });

    return { total, byStatus, totalRevenue };
  };

  const { total, byStatus, totalRevenue } = getAnalytics();

  if (loading) return <Spinner />;
  if (error) return <div className="text-red-600 text-sm">{error}</div>;

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">{t('farmer.orders_received')}</h2>

      {/* 📊 Analytics Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-white p-4 rounded shadow text-center">
          <h4 className="text-gray-500 text-sm">{t('order.total_orders')}</h4>
          <p className="text-xl font-bold">{total}</p>
        </div>
        <div className="bg-white p-4 rounded shadow text-center">
          <h4 className="text-gray-500 text-sm">{t('order.total_revenue')}</h4>
          <p className="text-xl font-bold">${totalRevenue.toFixed(2)}</p>
        </div>
        <div className="bg-white p-4 rounded shadow text-center">
          <h4 className="text-gray-500 text-sm">{t('order.by_status')}</h4>
          <div className="mt-2 space-y-1 text-sm">
            {Object.entries(byStatus).map(([key, value]) => (
              <div key={key} className="flex justify-between">
                <span className="capitalize">{t(`orderStatus.${key}`)}</span>
                <span>{value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Orders List */}
      {orders.length === 0 ? (
        <p className="text-gray-600">{t('farmer.no_orders')}</p>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order._id} className="border rounded-lg p-4 shadow-sm">
              <div className="flex justify-between text-sm text-gray-700">
                <span>
                  {t('order.order')} #{order._id.slice(0, 8)}
                </span>
                <span>
                  {new Date(order.createdAt).toLocaleDateString() || 'N/A'}
                </span>
              </div>

              <div className="mt-2 text-sm">
                <p>
                  <span className="font-medium">{t('order.customer')}:</span>{' '}
                  {order.buyer?.name || 'N/A'}
                </p>
                <p>
                  <span className="font-medium">{t('order.total')}:</span>{' '}
                  ${order.total?.toFixed(2) || '0.00'}
                </p>
                <p>
                  <span className="font-medium">{t('order.status')}:</span>{' '}
                  <span className="capitalize">{order.status}</span>
                </p>
              </div>

              <div className="mt-3 flex space-x-2">
                <button
                  onClick={() => updateOrderStatus(order._id, 'processing')}
                  disabled={order.status !== 'pending' || updatingOrderId === order._id}
                  className={`px-3 py-1 text-sm rounded transition ${
                    order.status !== 'pending'
                      ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                      : 'bg-blue-100 text-blue-800 hover:bg-blue-200'
                  }`}
                >
                  {updatingOrderId === order._id
                    ? t('common.loading')
                    : t('order.process')}
                </button>

                <button
                  onClick={() => updateOrderStatus(order._id, 'shipped')}
                  disabled={order.status !== 'processing' || updatingOrderId === order._id}
                  className={`px-3 py-1 text-sm rounded transition ${
                    order.status !== 'processing'
                      ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                      : 'bg-green-100 text-green-800 hover:bg-green-200'
                  }`}
                >
                  {updatingOrderId === order._id
                    ? t('common.loading')
                    : t('order.ship')}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default OrdersReceived;
