import { useTranslation } from 'react-i18next';

const OrderList = ({ orders }) => {
  const { t } = useTranslation();

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              {t('order.id')}
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              {t('order.customer')}
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              {t('order.total')}
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              {t('order.status')}
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {orders.map((order) => (
            <tr key={order.id}>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                #{order.id.slice(0, 8)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-900">{order.customer.name}</div>
                <div className="text-sm text-gray-500">{order.customer.email}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                ${order.total.toFixed(2)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800 capitalize">
                  {order.status}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default OrderList;