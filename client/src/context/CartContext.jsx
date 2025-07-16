import React, { createContext, useContext, useState, useEffect } from 'react';
import useLocalStorage from '../hooks/useLocalStorage';
import {
  createOrder as apiCreateOrder,
  getOrders as apiGetOrders
} from '../services/orderService';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [storedCart, setStoredCart] = useLocalStorage('cart', []);
  const [cart, setCart] = useState(storedCart);
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Sync cart with localStorage
  useEffect(() => {
    try {
      setStoredCart(cart);
    } catch (storageError) {
      console.error('Failed to save cart to localStorage:', storageError);
      setError('Failed to save your cart. Your changes may not persist.');
    }
  }, [cart, setStoredCart]);

  const addToCart = (product, quantity = 1) => {
    try {
      if (!product?._id) {
        throw new Error('Cannot add invalid product to cart - missing product ID');
      }

      setCart((prevCart) => {
        const existingItem = prevCart.find((item) => item?.product?._id === product._id);
        
        if (existingItem) {
          return prevCart.map((item) =>
            item?.product?._id === product._id
              ? { ...item, quantity: item.quantity + quantity }
              : item
          );
        }

        return [...prevCart, { product, quantity }];
      });
    } catch (error) {
      console.error('Failed to add item to cart:', error);
      setError(error.message);
    }
  };

  const removeFromCart = (productId) => {
    try {
      if (!productId) {
        throw new Error('Cannot remove item - missing product ID');
      }
      setCart((prevCart) => prevCart.filter((item) => item.product?._id !== productId));
    } catch (error) {
      console.error('Failed to remove item from cart:', error);
      setError(error.message);
    }
  };

  const updateQuantity = (productId, quantity) => {
    try {
      if (!productId) {
        throw new Error('Cannot update quantity - missing product ID');
      }
      
      const numQuantity = Number(quantity);
      if (isNaN(numQuantity)) {
        throw new Error('Quantity must be a number');
      }

      if (numQuantity <= 0) {
        removeFromCart(productId);
      } else {
        setCart((prevCart) =>
          prevCart.map((item) =>
            item.product?._id === productId ? { ...item, quantity: numQuantity } : item
          )
        );
      }
    } catch (error) {
      console.error('Failed to update quantity:', error);
      setError(error.message);
    }
  };

  const clearCart = () => {
    setCart([]);
    setError(null);
  };

  const cartTotal = cart.reduce(
    (total, item) => total + (item.product?.price || 0) * item.quantity,
    0
  );

  const cartCount = cart.reduce((count, item) => count + item.quantity, 0);

  const createOrder = async (orderData) => {
    try {
      setLoading(true);
      setError(null);

      // Validate input structure
      if (!orderData?.products || !Array.isArray(orderData.products)) {
        throw new Error(
          'Invalid order data format. Expected { products: [...] } but got: ' + 
          JSON.stringify(orderData, null, 2)
        );
      }

      if (orderData.products.length === 0) {
        throw new Error('Cannot create order - your cart is empty');
      }

      // Transform and validate each product
      const products = orderData.products.map((item, index) => {
        if (!item?.product) {
          throw new Error(
            `Missing product reference in item ${index + 1}. ` +
            `Expected { product: "id", quantity: number } but got: ` +
            JSON.stringify(item, null, 2)
          );
        }

        const quantity = Number(item.quantity);
        if (isNaN(quantity) || quantity < 1) {
          throw new Error(
            `Invalid quantity for product ${item.product}. ` +
            `Expected positive number but got: ${item.quantity}`
          );
        }

        return {
          product: item.product,
          quantity: quantity
        };
      });

      // Validate shipping address
      if (!orderData.shippingAddress?.street || 
          !orderData.shippingAddress?.city || 
          !orderData.shippingAddress?.country) {
        throw new Error(
          'Complete shipping address required (street, city, country). ' +
          `Received: ${JSON.stringify(orderData.shippingAddress, null, 2)}`
        );
      }

      const payload = {
        products,
        shippingAddress: orderData.shippingAddress,
        paymentMethod: orderData.paymentMethod || 'cash'
      };

      console.debug('Submitting order with payload:', payload);
      const response = await apiCreateOrder(payload);

      if (!response?.success) {
        throw new Error(
          response?.message || 
          'Order creation failed. Please try again later.'
        );
      }

      clearCart();
      return {
        success: true,
        data: response.data,
        message: response.message || 'Order created successfully!'
      };

    } catch (error) {
      console.error('[CartContext] Order creation failed:', {
        error: error.message,
        stack: error.stack,
        orderData
      });

      setError(error.message);
      return {
        success: false,
        message: error.response?.data?.message || error.message,
        errors: error.response?.data?.errors || [],
        status: error.response?.status
      };
    } finally {
      setLoading(false);
    }
  };

  const fetchOrders = async () => {
    try {
      setLoadingOrders(true);
      setError(null);
      
      const response = await apiGetOrders();
      const orders = response.data?.orders || response.orders || [];
      
      if (!Array.isArray(orders)) {
        throw new Error(
          'Invalid orders data received. Expected array but got: ' +
          JSON.stringify(orders, null, 2)
        );
      }

      setOrders(orders);
      return orders;

    } catch (error) {
      console.error('Failed to fetch orders:', {
        error: error.message,
        stack: error.stack
      });

      setError(
        error.response?.data?.message || 
        'Failed to load your orders. Please try again later.'
      );
      throw error;
    } finally {
      setLoadingOrders(false);
    }
  };

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
        loading,
        loadingOrders,
        error,
        setError // Allow consumers to clear errors
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  
  if (!context) {
    const error = new Error(
      'useCart must be used within a CartProvider.\n\n' +
      'Possible solutions:\n' +
      '1. Wrap your root component with <CartProvider>\n' +
      '2. If using Next.js, add "use client" directive\n' +
      '3. Check for multiple versions of the context'
    );
    
    console.error(error.message);
    throw error;
  }

  return context;
};