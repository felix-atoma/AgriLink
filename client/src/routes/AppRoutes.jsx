import React, { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext'
import ProtectedRoute from '../components/layout/ProtectedRoute';
import Spinner from '../components/shared/Spinner';
import RootLayout from '../components/layout/RootLayout';

// Lazy-loaded pages
const Home = lazy(() => import('../pages/Home'));
const Login = lazy(() => import('../pages/Login'));
const Register = lazy(() => import('../pages/Register'));
const BuyerDashboard = lazy(() => import('../pages/Dashboard/BuyerDashboard'));
const FarmerDashboard = lazy(() => import('../pages/Dashboard/FarmerDashboard'));
const MyOrders = lazy(() => import('../pages/Dashboard/Buyer/MyOrders'));
const MyProducts = lazy(() => import('../pages/Dashboard/Farmer/MyProducts'));

const AppRoutes = () => {
  const { user, loading } = useAuth();

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

          {/* Protected Buyer Routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute allowedRoles={['buyer']}>
                <BuyerDashboard />
              </ProtectedRoute>
            }
          >
            <Route path="my-orders" element={<MyOrders />} />
          </Route>

          {/* Protected Farmer Routes */}
          <Route
            path="/dashboard/farmer"
            element={
              <ProtectedRoute allowedRoles={['farmer']}>
                <FarmerDashboard />
              </ProtectedRoute>
            }
          >
            <Route path="my-products" element={<MyProducts />} />
          </Route>

          {/* Catch-all Route */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </Suspense>
  );
};

export default AppRoutes;