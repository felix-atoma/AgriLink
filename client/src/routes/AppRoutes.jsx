import React, { lazy, Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import ProtectedRoute from "../components/layout/ProtectedRoute";
import Spinner from "../components/shared/Spinner";
import RootLayout from "../components/layout/RootLayout";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Lazy-loaded components
const Home = lazy(() => import("../pages/Home"));
const Login = lazy(() => import("../pages/Login"));
const Register = lazy(() => import("../pages/Register"));
const Cart = lazy(() => import("../pages/Cart"));
const BuyerDashboard = lazy(() =>
  import("../pages/Dashboard/Buyer/BuyerDashboard")
);
const MyOrders = lazy(() => import("../pages/Dashboard/Buyer/MyOrders"));
const OrderDetails = lazy(() =>
  import("../pages/Dashboard/Buyer/OrderDetails")
);
const NearbyFarms = lazy(() => import("../pages/Dashboard/Buyer/NearbyFarms"));
const FarmerDashboard = lazy(() =>
  import("../pages/Dashboard/Farmer/FarmerDashboard")
);
const MyProducts = lazy(() => import("../pages/Dashboard/Farmer/MyProducts"));
const AddProduct = lazy(() => import("../pages/Dashboard/Farmer/AddProduct"));
const EditProduct = lazy(() => import("../pages/Dashboard/Farmer/EditProduct"));
const OrdersReceived = lazy(() =>
  import("../pages/Dashboard/Farmer/OrdersReceived")
);

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
    <>
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
      <Suspense fallback={<Spinner size="xl" />}>
        <Routes>
          <Route element={<RootLayout />}>
            {/* Public Routes */}
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            {/* Protected Cart Page */}
            <Route
              path="/cart"
              element={<ProtectedRoute allowedRoles={["buyer"]} />}
            >
              <Route index element={<Cart />} />
            </Route>
            {/* Buyer Dashboard */}
            <Route
              path="/dashboard/buyer"
              element={<ProtectedRoute allowedRoles={["buyer"]} />}
            >
              <Route element={<BuyerDashboard />}>
                <Route index element={<Navigate to="orders" replace />} />
                <Route path="orders">
                  <Route index element={<MyOrders />} />
                  <Route path=":orderId" element={<OrderDetails />} />
                </Route>
                <Route path="nearby-farms" element={<NearbyFarms />} />
              </Route>
            </Route>
            {/* Farmer Dashboard */}
            // In your Farmer Dashboard routes section
            <Route
              path="/dashboard/farmer"
              element={<ProtectedRoute allowedRoles={["farmer"]} />}
            >
              <Route index element={<FarmerDashboard />} />
              <Route path="my-products" element={<MyProducts />} />
              <Route path="add-product" element={<AddProduct />} />
              <Route path="edit-product/:productId" element={<EditProduct />} />
              <Route path="orders-received" element={<OrdersReceived />} />
            </Route>
            {/* Catch-All */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </Suspense>
    </>
  );
};

export default AppRoutes;
