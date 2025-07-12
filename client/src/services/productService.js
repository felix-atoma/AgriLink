import apiClient from './apiClient'

/**
 * Fetch all products (public).
 */
export const getProducts = async () => {
  try {
    const response = await apiClient.get('/products')
    return response.data
  } catch (error) {
    throw new Error(error?.response?.data?.message || 'Failed to fetch products')
  }
}

/**
 * Fetch products created by the currently logged-in farmer.
 */
export const getFarmerProducts = async () => {
  try {
    const response = await apiClient.get('/products/my-products')
    return response.data
  } catch (error) {
    throw new Error(error?.response?.data?.message || 'Failed to fetch your products')
  }
}

/**
 * Create a new product.
 * @param {Object} productData - Includes name, price, quantity, etc.
 */
export const createProduct = async (productData) => {
  try {
    const response = await apiClient.post('/products', productData)
    return response.data
  } catch (error) {
    throw new Error(error?.response?.data?.message || 'Failed to create product')
  }
}

/**
 * Update an existing product.
 * @param {string} id - Product ID
 * @param {Object} productData - Updated product fields
 */
export const updateProduct = async (id, productData) => {
  try {
    const response = await apiClient.put(`/products/${id}`, productData)
    return response.data
  } catch (error) {
    throw new Error(error?.response?.data?.message || 'Failed to update product')
  }
}

/**
 * Delete a product by ID.
 * @param {string} id - Product ID
 */
export const deleteProduct = async (id) => {
  try {
    const response = await apiClient.delete(`/products/${id}`)
    return response.data
  } catch (error) {
    throw new Error(error?.response?.data?.message || 'Failed to delete product')
  }
}
