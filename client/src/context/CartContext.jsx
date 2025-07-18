import React, { createContext, useContext, useState, useEffect } from "react";
import useLocalStorage from "../hooks/useLocalStorage";
import apiClient from '../services/apiClient'
import { toast } from "react-toastify";

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [storedCart, setStoredCart] = useLocalStorage("cart", []);
  const [cart, setCart] = useState(storedCart);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Sync cart with localStorage
  useEffect(() => {
    try {
      setStoredCart(cart);
    } catch (err) {
      console.error("Failed to persist cart:", err);
    }
  }, [cart, setStoredCart]);

  // Calculate cart totals
  const cartTotal = cart.reduce(
    (total, item) => total + (item.product.price * item.quantity),
    0
  );
  const cartCount = cart.reduce((count, item) => count + item.quantity, 0);

  // Add item to cart with proper variant handling
  const addToCart = (product, quantity = 1, variantId = null) => {
    if (!product?._id) {
      toast.error("Invalid product");
      return;
    }

    setCart((prevCart) => {
      const existingIndex = prevCart.findIndex(
        (item) => item.product._id === product._id && item.variantId === variantId
      );

      // Update existing item
      if (existingIndex >= 0) {
        const updatedCart = [...prevCart];
        updatedCart[existingIndex] = {
          ...updatedCart[existingIndex],
          quantity: updatedCart[existingIndex].quantity + quantity,
        };
        toast.success("Item quantity updated");
        return updatedCart;
      }

      // Add new item
      toast.success("Item added to cart");
      return [
        ...prevCart,
        {
          product,
          quantity,
          variantId,
          addedAt: new Date().toISOString(),
        },
      ];
    });
  };

  // Remove item from cart completely
  const removeFromCart = (productId, variantId = null) => {
    setCart((prevCart) => {
      const newCart = prevCart.filter((item) => {
        const sameProduct = item.product._id === productId;
        const sameVariant = (item.variantId ?? null) === (variantId ?? null);
        return !(sameProduct && sameVariant);
      });

      toast.success("Item removed from cart");
      return newCart;
    });
  };

  // Update quantity with validation
  const updateQuantity = (productId, newQuantity, variantId = null) => {
    const quantity = Number(newQuantity);
    if (isNaN(quantity)) {
      toast.error("Invalid quantity");
      return;
    }

    if (quantity < 1) {
      removeFromCart(productId, variantId);
      return;
    }

    setCart((prevCart) =>
      prevCart.map((item) =>
        item.product._id === productId && item.variantId === variantId
          ? { ...item, quantity }
          : item
      )
    );
  };

  // Clear entire cart
  const clearCart = () => {
    setCart([]);
    toast.success("Cart cleared");
  };

  // Create new order
  const createOrder = async (orderData) => {
  try {
    const transformedProducts = cart.map(item => ({
      product: item.product._id,
      quantity: item.quantity
    }));

    const finalPayload = {
      products: transformedProducts,
      shippingAddress: orderData.shippingAddress,
      paymentMethod: orderData.paymentMethod
    };

    const response = await apiClient.post('/orders', finalPayload);

    console.log("✅ Order created:", response.data);
    return response.data;
  } catch (error) {
    console.error("Order creation failed:", error);
    throw error;
  }
};


  // Process payment
  const processPayment = async (paymentData) => {
    try {
      setLoading(true);
      setError(null);

      if (!paymentData?.orderId || !paymentData?.amount || paymentData.amount <= 0) {
        throw new Error("Invalid payment data");
      }

      const response = await apiClient.post('/payments/process', paymentData);

      if (!response.data.success) {
        throw new Error(response.data.message || "Payment processing failed");
      }

      return {
        success: true,
        data: response.data,
        message: response.data.message || "Payment processed successfully",
      };
    } catch (error) {
      console.error("Payment failed:", error);
      const errorMessage = error.response?.data?.message || error.message;
      setError(errorMessage);
      toast.error(errorMessage);

      return {
        success: false,
        message: errorMessage,
      };
    } finally {
      setLoading(false);
    }
  };

  // Fetch user's orders
  const fetchOrders = async (queryParams = {}) => {
    try {
      setLoading(true);
      setError(null);

      const response = await apiClient.get('/orders', {
        params: queryParams
      });

      if (!response.data.success) {
        throw new Error(response.data.message || "Failed to fetch orders");
      }

      setOrders(response.data.orders || []);
      return response.data.orders || [];
    } catch (error) {
      console.error("Failed to fetch orders:", error);
      const errorMessage = error.response?.data?.message || error.message;
      setError(errorMessage);
      toast.error(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return (
    <CartContext.Provider
      value={{
        // Cart state
        cart,
        cartTotal,
        cartCount,
        loading,
        error,
        
        // Cart actions
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        
        // Order actions
        createOrder,
        processPayment,
        
        // Orders state
        orders,
        fetchOrders
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};