import React from 'react';
import { useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import Spinner from '../../../components/shared/Spinner';
import OrderTracker from '../../../components/buyer/OrderTracker';
import apiClient from '../../../services/apiClient';
import { useToast } from '../../../components/ui/Toast';

const OrderDetails = () => {
  const { t } = useTranslation();
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { toast } = useToast();

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const { data } = await apiClient.get(`/orders/${id}`);
        setOrder(data);
        toast({
          title: t('order.loaded_success'),
          status: 'success',
        });
      } catch (err) {
        const errorMsg = err.response?.data?.message || err.message;
        setError(errorMsg);
        toast({
          title: t('errors.order_fetch_failed'),
          description: errorMsg,
          status: 'error',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [id, t, toast]);

  if (loading) return <Spinner />;
  if (error)
    return (
      <div className="text-red-600 bg-red-100 p-4 rounded-md mt-4">
        {error}
      </div>
    );

  if (!order) return null;

  return (
    <section className="max-w-5xl mx-auto px-4 py-8">
      <h2 className="text-2xl font-bold mb-6">
        {t('order.details')} #{order._id?.slice(0, 8)}
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Side: Items */}
        <div className="md:col-span-2">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4">
              {t('order.items')}
            </h3>

            {order.products?.length > 0 ? (
              order.products.map((item) => (
                <div
                  key={item.product?._id}
                  className="flex justify-between items-center border-b py-3"
                >
                  <div>
                    <p className="font-medium">{item.product?.name}</p>
                    <p className="text-sm text-gray-500">
                      {item.quantity} × ${item.product?.price?.toFixed(2)}
                    </p>
                  </div>
                  <p className="text-right font-semibold">
                    ${(item.quantity * item.product?.price).toFixed(2)}
                  </p>
                </div>
              ))
            ) : (
              <p className="text-gray-500">{t('order.no_items')}</p>
            )}

            <div className="flex justify-between mt-6 pt-4 border-t font-bold text-lg">
              <span>{t('order.total')}</span>
              <span>${order.total?.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Right Side: Tracker */}
        <aside>
          <div className="bg-white rounded-lg shadow p-6 h-full">
            <h3 className="text-lg font-semibold mb-3">
              {t('order.status')}
            </h3>
            <OrderTracker status={order.status} />
            <div className="mt-6">
              <h4 className="text-sm text-gray-600 font-medium mb-1">
                {t('order.shipping_address')}
              </h4>
              <p className="text-gray-700">
                {order.shippingAddress || t('order.no_address')}
              </p>
            </div>
          </div>
        </aside>
      </div>
    </section>
  );
};

export default OrderDetails;