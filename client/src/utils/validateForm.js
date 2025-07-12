export const validateEmail = (email = '') => {
  const re = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i
  return re.test(email.trim())
}

export const validatePassword = (password = '') => {
  return password.trim().length >= 6
}

export const validateProduct = (product = {}) => {
  const errors = {}

  if (!product.name?.trim()) errors.name = 'Product name is required'
  if (typeof product.price !== 'number' || product.price <= 0)
    errors.price = 'Price must be greater than 0'
  if (typeof product.quantity !== 'number' || product.quantity < 0)
    errors.quantity = 'Quantity must be 0 or more'

  return errors
}

export const validateOrder = (order = {}) => {
  const errors = {}

  if (!Array.isArray(order.items) || order.items.length === 0)
    errors.items = 'Order must contain at least one item'

  if (!order.shippingAddress?.trim())
    errors.shippingAddress = 'Shipping address is required'

  return errors
}
