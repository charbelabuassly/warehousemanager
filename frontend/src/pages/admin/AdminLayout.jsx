import React, { useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  Package,
  Users,
  ShoppingCart,
  Tags,
  UserCheck,
  TrendingUp,
  BarChart2,
  LogOut,
  Menu,
} from 'lucide-react';

const AdminLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  const logout = () => {
    localStorage.clear();
    navigate('/login');
  };

  const menuItems = [
    { path: '/admin/dashboard', label: 'Dashboard', icon: BarChart2 },
    { path: '/admin/users', label: 'Users', icon: Users },
    { path: '/admin/products', label: 'Products', icon: Package },
    { path: '/admin/categories', label: 'Categories', icon: Tags },
    { path: '/admin/orders', label: 'Orders', icon: ShoppingCart },
    { path: '/admin/roles', label: 'Roles', icon: UserCheck },
    { path: '/admin/reports', label: 'Reports', icon: TrendingUp },
  ];

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--background)' }}>
      {/* Sidebar */}
      <div style={{
        width: sidebarOpen ? '250px' : '70px',
        background: 'var(--surface)',
        borderRight: '1px solid var(--border)',
        transition: 'width 0.3s ease',
        display: 'flex',
        flexDirection: 'column'
      }}>
        <div style={{
          padding: '1.5rem',
          borderBottom: '1px solid var(--border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          {sidebarOpen && <h3 style={{ margin: 0, color: 'var(--text)' }}>Admin Panel</h3>}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="btn-ghost"
            style={{ padding: '0.5rem' }}
            aria-label="Toggle sidebar"
          >
            <Menu size={20} />
          </button>
        </div>

        <nav style={{ flex: 1, padding: '1rem 0' }}>
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: '0.75rem 1.5rem',
                  color: 'var(--text)',
                  textDecoration: 'none',
                  borderRadius: '8px',
                  margin: '0.25rem 1rem',
                  transition: 'background 0.2s ease',
                  background: isActive ? 'rgba(99, 102, 241, 0.14)' : 'transparent'
                }}
                onMouseEnter={(e) => { if (!isActive) e.currentTarget.style.background = 'rgba(99, 102, 241, 0.10)'; }}
                onMouseLeave={(e) => { if (!isActive) e.currentTarget.style.background = 'transparent'; }}
              >
                <Icon size={20} />
                {sidebarOpen && <span>{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        <div style={{ padding: '1rem', borderTop: '1px solid var(--border)' }}>
          <button
            onClick={logout}
            className="btn-ghost"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              width: '100%',
              justifyContent: sidebarOpen ? 'flex-start' : 'center'
            }}
          >
            <LogOut size={20} />
            {sidebarOpen && <span>Logout</span>}
          </button>
        </div>
      </div>

      {/* Content */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <Outlet />
      </div>
    </div>
  );
};

export default AdminLayout;

