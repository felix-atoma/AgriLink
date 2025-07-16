import apiClient from './apiClient';

// Helper to extract errors
const handleError = (error, fallbackMessage = 'Request failed') => {
  const res = error?.response;
  const message = res?.data?.message || error.message || fallbackMessage;

  console.error('[OrderService Error]', {
    status: res?.status,
    message,
    errors: res?.data?.errors,
    url: error?.config?.url,
    sentPayload: error?.config?.data,
  });

  return {
    success: false,
    status: res?.status || 500,
    message,
    errors: res?.data?.errors || [],
  };
};

// ✅ Create Order
export const createOrder = async (orderData) => {
  try {
    if (!orderData || !Array.isArray(orderData.products)) {
      throw new Error('Invalid order data: products must be an array');
    }

    const payload = {
      products: orderData.products.map((item, i) => {
        if (!item.product) throw new Error(`Missing product ID at index ${i}`);
        const quantity = Number(item.quantity);
        if (!quantity || quantity < 1) throw new Error(`Invalid quantity for product ${item.product}`);
        return { product: item.product, quantity };
      }),
      shippingAddress: {
        street: orderData.shippingAddress?.street || '',
        city: orderData.shippingAddress?.city || '',
        country: orderData.shippingAddress?.country || '',
        ...(orderData.shippingAddress?.postalCode && {
          postalCode: orderData.shippingAddress.postalCode,
        }),
      },
      paymentMethod: orderData.paymentMethod || 'cash',
    };

    // Final shipping validation
    const { street, city, country } = payload.shippingAddress;
    if (!street || !city || !country) {
      throw new Error('Complete shipping address is required');
    }

    console.log('[createOrder] Payload:', payload);
    const res = await apiClient.post('/orders', payload);

    return {
      success: true,
      data: res.data?.data,
      message: res.data?.message || 'Order created successfully',
    };
  } catch (error) {
    return handleError(error, 'Order creation failed');
  }
};

// ✅ Get My Orders
export const getOrders = async (queryParams = {}) => {
  try {
    const res = await apiClient.get('/orders/my-orders', { params: queryParams });

    return {
      success: true,
      orders: res.data?.data,
      pagination: res.data?.pagination,
    };
  } catch (error) {
    return handleError(error, 'Failed to fetch orders');
  }
};

// ✅ Get Orders Received (for sellers)
export const getReceivedOrders = async (queryParams = {}) => {
  try {
    const res = await apiClient.get('/orders/received', { params: queryParams });

    return {
      success: true,
      orders: res.data?.data,
      pagination: res.data?.pagination,
    };
  } catch (error) {
    return handleError(error, 'Failed to fetch received orders');
  }
};

// ✅ Get Order by ID
export const getOrderDetails = async (id) => {
  try {
    const res = await apiClient.get(`/orders/${id}`);

    return {
      success: true,
      order: res.data?.data,
    };
  } catch (error) {
    return handleError(error, 'Failed to fetch order details');
  }
};

// ✅ Update Order Status
export const updateOrderStatus = async (id, statusData) => {
  try {
    const res = await apiClient.patch(`/orders/${id}/status`, statusData);

    return {
      success: true,
      order: res.data?.data,
      message: res.data?.message || 'Order status updated',
    };
  } catch (error) {
    return handleError(error, 'Failed to update order status');
  }
};

// ✅ Cancel Order
export const cancelOrder = async (id, reason) => {
  try {
    const res = await apiClient.delete(`/orders/${id}`, {
      data: { reason },
    });

    return {
      success: true,
      message: res.data?.message || 'Order cancelled successfully',
    };
  } catch (error) {
    return handleError(error, 'Failed to cancel order');
  }
};
