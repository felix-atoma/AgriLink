import apiClient from './apiClient'

/**
 * Fetch all orders for the logged-in buyer.
 */
export const getOrders = async () => {
  try {
    const response = await apiClient.get('/orders/my-orders')
    return response.data
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch orders')
  }
}

/**
 * Fetch orders received (for farmers).
 */
export const getReceivedOrders = async () => {
  try {
    const response = await apiClient.get('/orders/received')
    return response.data
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch received orders')
  }
}

/**
 * Get full details of a specific order by ID.
 * @param {string} id - Order ID
 */
export const getOrderDetails = async (id) => {
  try {
    const response = await apiClient.get(`/orders/${id}`)
    return response.data
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch order details')
  }
}

/**
 * Create a new order.
 * @param {Object} orderData - Payload including products, shippingAddress, etc.
 */
export const createOrder = async (orderData) => {
  try {
    const response = await apiClient.post('/orders', orderData)
    return response.data
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to create order')
  }
}

/**
 * Update the status of an order.
 * @param {string} id - Order ID
 * @param {string} status - New status (e.g., "shipped", "delivered")
 */
export const updateOrderStatus = async (id, status) => {
  try {
    const response = await apiClient.patch(`/orders/${id}`, { status })
    return response.data
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to update order status')
  }
}
