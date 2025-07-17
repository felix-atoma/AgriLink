import apiClient from './apiClient';

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

// Create a new order
export const createOrder = async (orderData) => {
  try {
    // Validate order data structure
    if (!orderData || typeof orderData !== 'object') {
      throw new Error('Invalid order data');
    }

    // Validate items array
    if (!Array.isArray(orderData.items) || orderData.items.length === 0) {
      throw new Error('Order must contain at least one item');
    }

    // Validate each item
    const validatedItems = orderData.items.map((item, index) => {
      if (!item?.productId) {
        throw new Error(`Item ${index + 1} is missing product ID`);
      }
      const quantity = Number(item.quantity);
      if (isNaN(quantity) || quantity < 1) {
        throw new Error(`Invalid quantity for product ${item.productId}`);
      }
      return {
        product: item.productId,
        quantity,
        price: item.price,
        ...(item.variantId && { variantId: item.variantId })
      };
    });

    // Validate shipping address
    const requiredAddressFields = ['street', 'city', 'country'];
    const missingFields = requiredAddressFields.filter(
      field => !orderData.shippingAddress?.[field]
    );
    if (missingFields.length > 0) {
      throw new Error(`Missing shipping fields: ${missingFields.join(', ')}`);
    }

    // Validate payment method
    const validPaymentMethods = ['cash', 'card', 'mobile'];
    if (!validPaymentMethods.includes(orderData.paymentMethod)) {
      throw new Error(`Invalid payment method: ${orderData.paymentMethod}`);
    }

    const payload = {
      items: validatedItems,
      shippingAddress: orderData.shippingAddress,
      paymentMethod: orderData.paymentMethod,
      totalAmount: orderData.items.reduce((sum, item) => sum + (item.price * item.quantity), 0)
    };

    const response = await apiClient.post('/orders', payload);
    return {
      success: true,
      data: response.data,
      message: response.data?.message || 'Order created successfully'
    };
  } catch (error) {
    return handleError(error, 'Failed to create order');
  }
};

// Process payment for an order
export const processPayment = async (paymentData) => {
  try {
    // Basic validation
    if (!paymentData?.orderId || !paymentData?.amount || paymentData.amount <= 0) {
      throw new Error('Invalid payment data');
    }

    // Method-specific validation
    if (paymentData.method === 'card') {
      if (!paymentData.cardNumber || !paymentData.expiry || !paymentData.cvv) {
        throw new Error('Incomplete card details');
      }
      // Basic card validation
      if (!/^\d{16}$/.test(paymentData.cardNumber.replace(/\s/g, ''))) {
        throw new Error('Invalid card number');
      }
      if (!/^\d{3,4}$/.test(paymentData.cvv)) {
        throw new Error('Invalid CVV');
      }
    } 
    else if (paymentData.method === 'mobile') {
      if (!paymentData.provider || !paymentData.phone) {
        throw new Error('Incomplete mobile money details');
      }
      // Basic phone validation
      if (!/^\d{10}$/.test(paymentData.phone)) {
        throw new Error('Invalid phone number');
      }
    }

    const response = await apiClient.post('/payments/process', paymentData);
    return {
      success: true,
      data: response.data,
      message: response.data?.message || 'Payment processed successfully'
    };
  } catch (error) {
    return handleError(error, 'Payment processing failed');
  }
};

// Other order-related functions...
export const getOrders = async () => {
  try {
    const response = await apiClient.get('/orders');
    return {
      success: true,
      data: response.data,
      message: response.data?.message || 'Orders fetched successfully'
    };
  } catch (error) {
    return handleError(error, 'Failed to fetch orders');
  }
};