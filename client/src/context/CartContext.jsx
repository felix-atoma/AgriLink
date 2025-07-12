import React from 'react';
import { createContext, useContext, useState, useEffect } from 'react'
import  useLocalStorage  from '../hooks/useLocalStorage'
import {
  createOrder as apiCreateOrder,
  getOrders as apiGetOrders
} from '../services/orderService'

const CartContext = createContext()

export const CartProvider = ({ children }) => {
  const [storedCart, setStoredCart] = useLocalStorage('cart', [])
  const [cart, setCart] = useState(storedCart)
  const [orders, setOrders] = useState([])
  const [loadingOrders, setLoadingOrders] = useState(false)

  // Sync cart with localStorage
  useEffect(() => {
    setStoredCart(cart)
  }, [cart, setStoredCart])

  // Add product to cart
  const addToCart = (product, quantity = 1) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find((item) => item._id === product._id)

      if (existingItem) {
        return prevCart.map((item) =>
          item._id === product._id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        )
      }

      return [...prevCart, { ...product, quantity }]
    })
  }

  // Remove product
  const removeFromCart = (productId) => {
    setCart((prevCart) => prevCart.filter((item) => item._id !== productId))
  }

  // Update quantity
  const updateQuantity = (productId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(productId)
      return
    }

    setCart((prevCart) =>
      prevCart.map((item) =>
        item._id === productId ? { ...item, quantity } : item
      )
    )
  }

  // Clear all
  const clearCart = () => {
    setCart([])
  }

  // Total cost & count
  const cartTotal = cart.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  )

  const cartCount = cart.reduce((count, item) => count + item.quantity, 0)

  // ✅ Create order from cart
  const createOrder = async (shippingAddress) => {
    try {
      const products = cart.map((item) => ({
        product: item._id,
        quantity: item.quantity
      }))

      const result = await apiCreateOrder({ products, shippingAddress })

      if (result.success) {
        clearCart()
        return { success: true, data: result.data }
      } else {
        return { success: false, message: result.message }
      }
    } catch (error) {
      return { success: false, message: error.message }
    }
  }

  // ✅ Fetch user orders
  const fetchOrders = async () => {
    try {
      setLoadingOrders(true)
      const result = await apiGetOrders()
      setOrders(result.data || [])
    } catch (error) {
      console.error('Failed to fetch orders', error)
    } finally {
      setLoadingOrders(false)
    }
  }

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        cartTotal,
        cartCount,
        createOrder,
        orders,
        fetchOrders,
        loadingOrders
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

// Hook
export const useCart = () => {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return context
}
