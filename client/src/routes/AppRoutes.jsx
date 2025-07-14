// src/routes/AppRoutes.jsx
import React, { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ProtectedRoute from '../components/layout/ProtectedRoute';
import Spinner from '../components/shared/Spinner';
import RootLayout from '../components/layout/RootLayout';

// Public Pages
const Home = lazy(() => import('../pages/Home'));
const Login = lazy(() => import('../pages/Login'));
const Register = lazy(() => import('../pages/Register'));

// Protected Public Page for Buyers Only
const Cart = lazy(() => import('../pages/Cart'));

// Buyer Pages
const BuyerDashboard = lazy(() => import('../pages/Dashboard/Buyer/BuyerDashboard'));
const MyOrders = lazy(() => import('../pages/dashboard/buyer/MyOrders'));
const OrderDetails = lazy(() => import('../pages/dashboard/buyer/OrderDetails'));
const NearbyFarms = lazy(() => import('../pages/dashboard/buyer/NearbyFarms'));

// Farmer Pages
const FarmerDashboard = lazy(() => import('../pages/Dashboard/Farmer/FarmerDashboard'));
const MyProducts = lazy(() => import('../pages/Dashboard/Farmer/MyProducts'));
const EditProducts = lazy(() => import('../pages/Dashboard/Farmer/EditProduct'));
const OrderReceived = lazy(() => import('../pages/Dashboard/Farmer/OrdersReceived'));

const AppRoutes = () => {
  const { loading } = useAuth();

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Spinner size="xl" />
      </div>
    );
  }

  return (
    <Suspense fallback={<Spinner size="xl" />}>
      <Routes>
        <Route element={<RootLayout />}>

          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected Cart Page (Buyer Only) */}
          <Route path="/cart" element={<ProtectedRoute allowedRoles={['buyer']} />}>
            <Route index element={<Cart />} />
          </Route>

          {/* Buyer Dashboard */}
          <Route path="/dashboard/buyer" element={<ProtectedRoute allowedRoles={['buyer']} />}>
            <Route index element={<BuyerDashboard />} />
            <Route path="my-orders" element={<MyOrders />} />
            <Route path="order-details/:id" element={<OrderDetails />} />
            <Route path="nearby-farms" element={<NearbyFarms />} />
          </Route>

          {/* Farmer Dashboard */}
          <Route path="/dashboard/farmer" element={<ProtectedRoute allowedRoles={['farmer']} />}>
            <Route index element={<FarmerDashboard />} />
            <Route path="my-products" element={<MyProducts />} />
            <Route path="edit-product/:id" element={<EditProducts />} />
            <Route path="orders-received" element={<OrderReceived />} />
          </Route>

          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/" replace />} />

        </Route>
      </Routes>
    </Suspense>
  );
};

export default AppRoutes;
