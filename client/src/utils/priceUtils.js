export const formatPrice = (price, currency = 'USD') => {
  return new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(price)
}

export const calculateTotal = (items) => {
  return items.reduce((total, item) => {
    return total + (item.price * item.quantity)
  }, 0)
}

export const applyDiscount = (total, discountPercentage) => {
  return total * (1 - discountPercentage / 100)
}