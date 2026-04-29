import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { BarChart2, TrendingUp, Download } from 'lucide-react';

const Reports = () => {
  const [revenueData, setRevenueData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchRevenueData();
  }, []);

  const fetchRevenueData = async () => {
    try {
      setLoading(true);
      console.log('Fetching revenue report...');
      const res = await api.get('/Report/all-products-report');
      console.log('Revenue response:', res);
      console.log('Revenue data:', res.data);
      
      let normalizedData = [];
      if (Array.isArray(res.data)) {
        normalizedData = res.data;
      } else if (res.data?.$values && Array.isArray(res.data.$values)) {
        normalizedData = res.data.$values;
      } else if (res.data?.data && Array.isArray(res.data.data)) {
        normalizedData = res.data.data;
      }
      
      console.log('Normalized revenue data:', normalizedData);
      setRevenueData(normalizedData);
    } catch (err) {
      console.error('Error fetching revenue report:', err);
      setError('Failed to fetch revenue report');
    } finally {
      setLoading(false);
    }
  };

  const totalRevenue = revenueData.reduce((sum, item) => sum + (item.revenue || item.Revenue || 0), 0);
  const topProduct = revenueData.length > 0 ? revenueData.reduce((max, item) => 
    (item.revenue || item.Revenue || 0) > (max.revenue || max.Revenue || 0) ? item : max
  ) : null;

  const exportToCSV = () => {
    const headers = ['Product ID', 'Product Name', 'Revenue'];
    const csvContent = [
      headers.join(','),
      ...revenueData.map(item => [
        item.productId || item.ProductId || '',
        `"${item.productName || item.ProductName || ''}"`,
        item.revenue || item.Revenue || 0
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `revenue-report-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  if (loading) return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading reports...</div>;
  if (error) return <div style={{ padding: '2rem', color: 'red' }}>Error: {error}</div>;

  return (
    <div style={{ padding: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: '700' }}>Revenue Reports</h2>
        <button className="btn-outline" onClick={exportToCSV}>
          <Download size={16} style={{ marginRight: '0.5rem' }} />
          Export CSV
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        <div className="glass-card" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ background: 'var(--success)', padding: '0.75rem', borderRadius: '12px', color: 'white' }}>
              <TrendingUp size={24} />
            </div>
            <div>
              <div style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--text)' }}>
                ${totalRevenue.toFixed(2)}
              </div>
              <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Total Revenue</div>
            </div>
          </div>
        </div>

        <div className="glass-card" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ background: 'var(--primary)', padding: '0.75rem', borderRadius: '12px', color: 'white' }}>
              <BarChart2 size={24} />
            </div>
            <div>
              <div style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--text)' }}>
                {revenueData.length}
              </div>
              <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Products Sold</div>
            </div>
          </div>
        </div>

        {topProduct && (
          <div className="glass-card" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ background: 'var(--warning)', padding: '0.75rem', borderRadius: '12px', color: 'white' }}>
                <TrendingUp size={24} />
              </div>
              <div>
                <div style={{ fontSize: '1rem', fontWeight: '700', color: 'var(--text)' }}>
                  {topProduct.productName || topProduct.ProductName}
                </div>
                <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                  Top Performer: ${(topProduct.revenue || topProduct.Revenue || 0).toFixed(2)}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Revenue Table */}
      <div className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border)' }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: '700', margin: 0 }}>Revenue Analysis</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', margin: '0.5rem 0 0 0' }}>
            Detailed breakdown of earnings per product
          </p>
        </div>
        
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: 'rgba(255,255,255,0.02)' }}>
              <th style={{ textAlign: 'left', padding: '1.25rem 1.5rem', color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase' }}>Product</th>
              <th style={{ textAlign: 'left', padding: '1.25rem 1.5rem', color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase' }}>Product ID</th>
              <th style={{ textAlign: 'right', padding: '1.25rem 1.5rem', color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase' }}>Revenue</th>
            </tr>
          </thead>
          <tbody>
            {console.log('Rendering revenue data:', revenueData) || revenueData.length === 0 ? (
              <tr>
                <td colSpan={3} style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>
                  <div style={{ opacity: 0.5, marginBottom: '1rem' }}>
                    <BarChart2 size={48} style={{ margin: '0 auto' }} />
                  </div>
                  No revenue data available
                </td>
              </tr>
            ) : (
              revenueData
                .sort((a, b) => (b.revenue || b.Revenue || 0) - (a.revenue || a.Revenue || 0))
                .map((item) => (
                  <tr key={item.productId || item.ProductId} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '1.25rem 1.5rem', fontWeight: '600' }}>
                      {item.productName || item.ProductName}
                    </td>
                    <td style={{ padding: '1.25rem 1.5rem' }}>
                      <span className="badge" style={{ background: 'rgba(99, 102, 241, 0.1)', color: 'var(--primary)' }}>
                        #{item.productId || item.ProductId}
                      </span>
                    </td>
                    <td style={{ padding: '1.25rem 1.5rem', textAlign: 'right', fontWeight: '800', fontSize: '1.1rem', color: 'var(--success)' }}>
                      ${Number(item.revenue || item.Revenue || 0).toFixed(2)}
                    </td>
                  </tr>
                ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Reports;
