import React, { useState, useEffect, Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Lazy load components for better performance
const Login = lazy(() => import('./pages/Login'));
const AdminLayout = lazy(() => import('./pages/admin/AdminLayout'));
const AdminDashboard = lazy(() => import('./pages/admin/Dashboard'));
const Users = lazy(() => import('./pages/admin/Users'));
const Products = lazy(() => import('./pages/admin/Products'));
const Categories = lazy(() => import('./pages/admin/Categories'));
const Orders = lazy(() => import('./pages/admin/Orders'));
const Roles = lazy(() => import('./pages/admin/Roles'));
const Reports = lazy(() => import('./pages/admin/Reports'));
const ClientShop = lazy(() => import('./pages/client/Shop'));
const DeliveryDashboard = lazy(() => import('./pages/delivery/Dashboard'));

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');
    if (token && role) {
      setUser({ role: parseInt(role) });
    }
    setLoading(false);
  }, []);

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <Router>
      <Suspense fallback={
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '100vh',
          background: 'var(--background)',
          color: 'var(--text)'
        }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ 
              width: '40px', 
              height: '40px', 
              border: '4px solid var(--border)', 
              borderTop: '4px solid var(--primary)', 
              borderRadius: '50%', 
              animation: 'spin 1s linear infinite',
              margin: '0 auto 1rem'
            }} />
            <div>Loading...</div>
          </div>
        </div>
      }>
        <Routes>
          <Route path="/login" element={!user ? <Login setUser={setUser} /> : <Navigate to="/" />} />
          
          {/* Admin Routes */}
          <Route path="/admin" element={user?.role === 2 ? <AdminLayout /> : <Navigate to="/login" />}>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="users" element={<Users />} />
            <Route path="products" element={<Products />} />
            <Route path="categories" element={<Categories />} />
            <Route path="orders" element={<Orders />} />
            <Route path="roles" element={<Roles />} />
            <Route path="reports" element={<Reports />} />
          </Route>

          {/* Default Routes */}
          <Route path="/" element={
            !user ? <Navigate to="/login" /> :
            user.role === 2 ? <Navigate to="/admin/dashboard" /> : // Admin
            user.role === 3 ? <DeliveryDashboard /> : // Deliveryman
            <ClientShop /> // Client/Default
          } />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Suspense>
    </Router>
  );
}

export default App;
