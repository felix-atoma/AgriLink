import apiClient from './apiClient'

/**
 * Login user with credentials.
 * @param {Object} credentials - { email, password }
 */
export const login = async (credentials) => {
  try {
    const response = await apiClient.post('/auth/login', credentials)
    return response.data
  } catch (error) {
    throw new Error(error?.response?.data?.message || 'Login failed')
  }
}

/**
 * Register a new user.
 * @param {Object} userData - Includes name, email, password, role, etc.
 */
export const register = async (userData) => {
  try {
    const response = await apiClient.post('/auth/register', userData)
    return response.data
  } catch (error) {
    throw new Error(error?.response?.data?.message || 'Registration failed')
  }
}

/**
 * Fetch the currently logged-in user.
 */
export const getCurrentUser = async () => {
  try {
    const response = await apiClient.get('/auth/me')
    return response.data
  } catch (error) {
    throw new Error(error?.response?.data?.message || 'Failed to fetch user')
  }
}

/**
 * Logout the current user.
 */
export const logout = async () => {
  try {
    const response = await apiClient.post('/auth/logout')
    return response.data
  } catch (error) {
    throw new Error(error?.response?.data?.message || 'Logout failed')
  }
}
