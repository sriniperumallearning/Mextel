import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// Layout & Guards
import MainLayout from './components/layout/MainLayout';
import ProtectedRoute from './components/layout/ProtectedRoute';

// Pages
import Login from './pages/Login';
import CustomerDashboard from './pages/customer/Dashboard';
import BrowsePlans from './pages/customer/Plans';
import AdminDashboard from './pages/admin/Dashboard';
import ManagePlans from './pages/admin/ManagePlans';

import useAuthStore from './store/authStore';

const App = () => {
  const { isAuthenticated, user } = useAuthStore();

  return (
    <BrowserRouter>
      <Routes>
        {/* Public Route */}
        <Route
          path="/login"
          element={
            isAuthenticated ? (
              <Navigate to={user?.role === 'ADMIN' ? '/admin/dashboard' : '/dashboard'} replace />
            ) : (
              <Login />
            )
          }
        />

        {/* Redirect Root based on auth */}
        <Route
          path="/"
          element={
            <Navigate to={isAuthenticated ? (user?.role === 'ADMIN' ? '/admin/dashboard' : '/dashboard') : '/login'} replace />
          }
        />

        {/* Customer Routes */}
        <Route element={<ProtectedRoute allowedRoles={['CUSTOMER']} />}>
          <Route element={<MainLayout />}>
            <Route path="/dashboard" element={<CustomerDashboard />} />
            <Route path="/plans" element={<BrowsePlans />} />
            <Route path="/settings" element={
              <div className="p-12 text-center text-muted">
                <h2 className="text-2xl font-bold font-display text-primary mb-2">Account Settings</h2>
                <p>This page is under construction.</p>
              </div>
            } />
          </Route>
        </Route>

        {/* Admin Routes */}
        <Route element={<ProtectedRoute allowedRoles={['ADMIN']} />}>
          <Route element={<MainLayout />}>
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/plans" element={<ManagePlans />} />
          </Route>
        </Route>

        {/* Fallback 404 */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
