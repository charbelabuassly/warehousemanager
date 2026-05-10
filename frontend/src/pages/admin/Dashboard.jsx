import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { Package, Users, ShoppingCart, Tags, TrendingUp } from 'lucide-react';

const Dashboard = () => {
  const [stats, setStats] = useState({
    products: 0,
    categories: 0,
    users: 0,
    orders: 0,
    roles: 0,
  });
  const [revenueData, setRevenueData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      const requests = {
        products: api.get('/Product'),
        categories: api.get('/Category'),
        users: api.get('/AccountManagement'),
        orders: api.get('/admin/Order'),
        roles: api.get('/Role'),
      };

      const settled = await Promise.allSettled(
        Object.entries(requests).map(([key, promise]) =>
          promise
            .then((res) => ({
              key,
              data: Array.isArray(res.data) ? res.data : (res.data?.$values || []),
            }))
            .catch((err) => ({ key, error: err }))
        )
      );

      const newStats = { products: 0, categories: 0, users: 0, orders: 0, roles: 0 };
      settled.forEach((result) => {
        if (result.status === 'fulfilled' && result.value.data) {
          newStats[result.value.key] = result.value.data.length;
        }
      });
      setStats(newStats);

      try {
        const revRes = await api.get('/Report/all-products-report');
        const normalizedRevenue = Array.isArray(revRes.data) ? revRes.data : (revRes.data?.$values || []);
        setRevenueData(normalizedRevenue);
      } catch (revErr) {
        console.error('Error fetching revenue report:', revErr);
      }
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading dashboard...</div>;
  if (error) return <div style={{ padding: '2rem', color: 'red' }}>Error: {error}</div>;

  return (
    <div style={{ padding: '2rem' }}>
      <h2 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '1.5rem' }}>Dashboard</h2>

      <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        <div className="glass-card" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ background: 'var(--primary)', padding: '0.75rem', borderRadius: '12px', color: 'white' }}>
              <Package size={24} />
            </div>
            <div>
              <div style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--text)' }}>{stats.products}</div>
              <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Products</div>
            </div>
          </div>
        </div>

        <div className="glass-card" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ background: 'var(--success)', padding: '0.75rem', borderRadius: '12px', color: 'white' }}>
              <Users size={24} />
            </div>
            <div>
              <div style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--text)' }}>{stats.users}</div>
              <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Users</div>
            </div>
          </div>
        </div>

        <div className="glass-card" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ background: 'var(--warning)', padding: '0.75rem', borderRadius: '12px', color: 'white' }}>
              <ShoppingCart size={24} />
            </div>
            <div>
              <div style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--text)' }}>{stats.orders}</div>
              <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Orders</div>
            </div>
          </div>
        </div>

        <div className="glass-card" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ background: 'var(--info)', padding: '0.75rem', borderRadius: '12px', color: 'white' }}>
              <Tags size={24} />
            </div>
            <div>
              <div style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--text)' }}>{stats.categories}</div>
              <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Categories</div>
            </div>
          </div>
        </div>
      </div>

      {revenueData.length > 0 && (
        <div className="glass-card animate-fade-in" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
            <div style={{ background: 'var(--success)', padding: '0.75rem', borderRadius: '12px', color: 'white' }}>
              <TrendingUp size={24} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: '700', margin: 0 }}>Revenue Performance</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', margin: 0 }}>Top performing products</p>
            </div>
          </div>
          <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
            {revenueData.slice(0, 4).map((item) => (
              <div
                key={item.productId || item.ProductId}
                style={{
                  background: 'rgba(255,255,255,0.03)',
                  padding: '1rem',
                  borderRadius: '12px',
                  border: '1px solid var(--border)',
                }}
              >
                <div
                  style={{
                    fontSize: '0.75rem',
                    color: 'var(--text-muted)',
                    marginBottom: '0.5rem',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {item.productName || item.ProductName}
                </div>
                <div style={{ fontSize: '1.25rem', fontWeight: '800', color: 'var(--primary)' }}>
                  ${Number(item.revenue || item.Revenue || 0).toFixed(2)}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="glass-card" style={{ padding: '1.5rem', marginTop: '2rem' }}>
        <h3 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '1rem' }}>Quick Actions</h3>
        <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem' }}>
          <Link to="/admin/users" className="btn-primary" style={{ textDecoration: 'none', textAlign: 'center' }}>
            Manage Users
          </Link>
          <Link to="/admin/products" className="btn-primary" style={{ textDecoration: 'none', textAlign: 'center' }}>
            Manage Products
          </Link>
          <Link to="/admin/orders" className="btn-primary" style={{ textDecoration: 'none', textAlign: 'center' }}>
            View Orders
          </Link>
          <Link to="/admin/categories" className="btn-primary" style={{ textDecoration: 'none', textAlign: 'center' }}>
            Manage Categories
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
