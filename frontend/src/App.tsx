import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';

// Pages
import { Home } from './pages/Home';
import { Catalog } from './pages/Catalog';
import { ProductDetails } from './pages/ProductDetails';
import { Checkout } from './pages/Checkout';
import { MyRentals } from './pages/MyRentals';
import { MaintenanceRequests } from './pages/MaintenanceRequests';
import { VendorDashboard } from './pages/VendorDashboard';
import { AdminDashboard } from './pages/AdminDashboard';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { EaseVerify } from './pages/EaseVerify';
import { ShiftEase } from './pages/ShiftEase';

// Protected Route Guard
const ProtectedRoute: React.FC<{ children: React.ReactNode; allowedRoles?: string[] }> = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

const AppRoutes: React.FC = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/catalog" element={<Catalog />} />
          <Route path="/product/:id" element={<ProductDetails />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          {/* Customer Protected Routes */}
          <Route
            path="/checkout"
            element={
              <ProtectedRoute allowedRoles={['customer']}>
                <Checkout />
              </ProtectedRoute>
            }
          />
          <Route
            path="/my-rentals"
            element={
              <ProtectedRoute allowedRoles={['customer', 'admin']}>
                <MyRentals />
              </ProtectedRoute>
            }
          />
          <Route
            path="/maintenance"
            element={
              <ProtectedRoute allowedRoles={['customer', 'admin']}>
                <MaintenanceRequests />
              </ProtectedRoute>
            }
          />
          <Route
            path="/ease-verify"
            element={
              <ProtectedRoute allowedRoles={['customer', 'admin']}>
                <EaseVerify />
              </ProtectedRoute>
            }
          />
          <Route
            path="/shiftease"
            element={
              <ProtectedRoute allowedRoles={['customer', 'admin']}>
                <ShiftEase />
              </ProtectedRoute>
            }
          />

          {/* Vendor Protected Route */}
          <Route
            path="/vendor-dashboard"
            element={
              <ProtectedRoute allowedRoles={['vendor', 'admin']}>
                <VendorDashboard />
              </ProtectedRoute>
            }
          />

          {/* Admin Protected Route */}
          <Route
            path="/admin-dashboard"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
};

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <CartProvider>
          <AppRoutes />
        </CartProvider>
      </AuthProvider>
    </Router>
  );
}
