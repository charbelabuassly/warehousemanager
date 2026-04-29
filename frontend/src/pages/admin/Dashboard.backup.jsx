import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { 
  LayoutDashboard, Package, Tag, Users as UsersIcon, 
  Settings, ShoppingCart, LogOut, Plus, Edit, Trash, CheckCircle, XCircle, X,
  TrendingUp, DollarSign, BarChart2
} from 'lucide-react';

function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [data, setData] = useState({
    products: [],
    categories: [],
    users: [],
    orders: [],
    roles: []
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [dashboardErrors, setDashboardErrors] = useState({});
  const [tabQuery, setTabQuery] = useState({
    products: { q: '', page: 1, pageSize: 20, total: 0, items: [] },
    categories: { q: '', page: 1, pageSize: 20, total: 0, items: [] },
    users: { q: '', page: 1, pageSize: 20, total: 0, items: [] },
    orders: { q: '', page: 1, pageSize: 20, total: 0, items: [] },
    roles: { q: '', page: 1, pageSize: 20, total: 0, items: [] },
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({});
  const [revenueData, setRevenueData] = useState([]);

  const normalizeList = (value) =>
    Array.isArray(value) ? value : (Array.isArray(value?.$values) ? value.$values : []);

  const normalizePaged = (value) => {
    if (!value) return { page: 1, pageSize: 20, totalCount: 0, items: [] };
    const items = value.items ?? value.Items ?? value?.data?.items ?? value?.data?.Items;
    return {
      page: value.page ?? value.Page ?? 1,
      pageSize: value.pageSize ?? value.PageSize ?? 20,
      totalCount: value.totalCount ?? value.TotalCount ?? 0,
      items: Array.isArray(items) ? items : normalizeList(items)
    };
  };

  const formatAxiosError = (err) => {
    const status = err?.response?.status;
    const data = err?.response?.data;
    const msg =
      data?.detail || data?.Detail ||
      data?.title || data?.Title ||
      data?.message || data?.Message ||
      err?.message ||
      'Request failed';

    return status ? `${status}: ${msg}` : msg;
  };

  const getAnyId = (item) =>
    item?.productsId ?? item?.ProductsId ??
    item?.categoryId ?? item?.CategoryId ??
    item?.usersId ?? item?.UsersId ??
    item?.roleId ?? item?.RoleId ??
    item?.ordersId ?? item?.OrdersId ??
    item?.id ?? item?.Id;

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const updateTabQuery = (tab, patch) => {
    setTabQuery((prev) => ({
      ...prev,
      [tab]: { ...prev[tab], ...patch }
    }));
  };

  const fetchTabSearch = async (tab, override = {}) => {
    const endpoint = getEndpoint(tab);
    if (!endpoint) return;

    const state = { ...(tabQuery[tab] || {}), ...override };
    const params = {
      q: state.q?.trim() ? state.q.trim() : undefined,
      page: state.page,
      pageSize: state.pageSize,
    };

    setLoading(true);
    setError('');
    try {
      const res = await api.get(`${endpoint}/search`, { params });
      const items = normalizeList(res.data);
      updateTabQuery(tab, {
        page: 1,
        pageSize: 20,
        total: items.length,
        items: items,
      });
    } catch (err) {
      console.error('Error fetching tab data:', err);
      setError(formatAxiosError(err));
    } finally {
      setLoading(false);
    }
  };

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      if (activeTab === 'dashboard') {
        setDashboardErrors({});
        const requests = {
          products: api.get('/Product'),
          categories: api.get('/Category'),
          users: api.get('/AccountManagement'),
          orders: api.get('/Order'),
          roles: api.get('/Role'),
        };

        const entries = Object.entries(requests);
        const settled = await Promise.allSettled(
          entries.map(([key, promise]) => promise.then((res) => {
            console.log(`Dashboard fetch success [${key}]:`, res.data);
            if (key === 'users') {
              console.log('Users response details:', res);
              console.log('Users data type:', typeof res.data);
              console.log('Users data array check:', Array.isArray(res.data));
            }
            return { key, res };
          }).catch((err) => {
            console.error(`Dashboard fetch error [${key}]:`, err);
            console.error(`Error response [${key}]:`, err.response);
            return { key, error: err };
          }))
        );

        const next = {};
        const nextErrors = {};
        for (let i = 0; i < settled.length; i++) {
          const result = settled[i];
          const key = entries[i]?.[0] || 'unknown';
          if (result.status === 'fulfilled') {
            const normalizedData = normalizeList(result.value.res.data);
            if (result.value.key === 'users') {
              console.log('Users normalized data:', normalizedData);
              console.log('Users normalized length:', normalizedData.length);
            }
            next[result.value.key] = normalizedData;
          } else {
            console.error(`Dashboard fetch failed [${key}]:`, result.reason);
            nextErrors[key] = formatAxiosError(result.reason);
          }
        }

        setData((prev) => ({ ...prev, ...next }));
        setDashboardErrors(nextErrors);
      } else if (activeTab === 'products' || activeTab === 'reports') {
        if (activeTab === 'products') await fetchTabSearch(activeTab);
        try {
          console.log('Fetching revenue report...');
          const revRes = await api.get('/Report/all-products-report');
          console.log('Revenue response:', revRes);
          console.log('Revenue data:', revRes.data);
          const normalizedData = normalizeList(revRes.data);
          console.log('Normalized data:', normalizedData);
          setRevenueData(normalizedData);
        } catch (revErr) {
          console.error('Error fetching revenue report:', revErr);
          console.error('Error response:', revErr.response);
          console.error('Error status:', revErr.response?.status);
        }
      } else {
        await fetchTabSearch(activeTab);
      }
    } catch (err) {
      console.error('Error fetching data:', err);
      setError(formatAxiosError(err));
    } finally {
      setLoading(false);
    }
  };

  const getEndpoint = (tab) => {
    switch (tab) {
      case 'products': return '/Product';
      case 'categories': return '/Category';
      case 'users': return '/AccountManagement';
      case 'orders': return '/Order';
      case 'roles': return '/Role';
      default: return '';
    }
  };

  const logout = () => {
    localStorage.clear();
    window.location.href = '/login';
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setFormData(item);
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this item?')) return;
    try {
      const endpoint = getEndpoint(activeTab);
      await api.delete(`${endpoint}/${id}`);
      fetchData();
    } catch (err) {
      alert('Error deleting item');
    }
  };

  const handleAddNew = () => {
    setEditingItem(null);
    setFormData({});
    setIsModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      const endpoint = getEndpoint(activeTab);
      if (editingItem) {
        const id = getAnyId(editingItem);
        await api.put(`${endpoint}/${id}`, formData);
      } else {
        await api.post(endpoint, formData);
      }
      setIsModalOpen(false);
      fetchData();
    } catch (err) {
      alert('Error saving item');
    }
  };

  const SidebarItem = ({ icon: Icon, label, id }) => (
    <button 
      onClick={() => setActiveTab(id)}
      className={`sidebar-link ${activeTab === id ? 'active' : ''}`}
      style={{
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        gap: '1rem',
        padding: '0.75rem 1rem',
        borderRadius: '12px',
        background: activeTab === id ? 'rgba(99, 102, 241, 0.1)' : 'transparent',
        color: activeTab === id ? 'var(--primary)' : 'var(--text-muted)',
        marginBottom: '0.5rem',
        textAlign: 'left',
        border: 'none',
        cursor: 'pointer'
      }}
    >
      <Icon size={20} />
      <span style={{ fontWeight: '500' }}>{label}</span>
    </button>
  );

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--background)' }}>
      {/* Sidebar */}
      <aside style={{ 
        width: '280px', 
        background: 'var(--surface)', 
        padding: '1.5rem', 
        borderRight: '1px solid var(--border)',
        display: 'flex',
        flexDirection: 'column',
        position: 'sticky',
        top: 0,
        height: '100vh'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2.5rem', paddingLeft: '0.5rem' }}>
          <div style={{ background: 'var(--primary)', padding: '0.5rem', borderRadius: '10px', boxShadow: 'var(--shadow-sm)' }}>
            <Package size={24} color="white" />
          </div>
          <h1 style={{ fontSize: '1.1rem', fontWeight: '800', letterSpacing: '-0.02em' }}>Warehouse Admin</h1>
        </div>

        <nav style={{ flex: 1 }}>
          <SidebarItem icon={LayoutDashboard} label="Overview" id="dashboard" />
          <SidebarItem icon={Package} label="Products" id="products" />
          <SidebarItem icon={Tag} label="Categories" id="categories" />
          <SidebarItem icon={UsersIcon} label="Users" id="users" />
          <SidebarItem icon={Settings} label="Roles" id="roles" />
          <SidebarItem icon={ShoppingCart} label="Orders" id="orders" />
          <SidebarItem icon={BarChart2} label="Reports" id="reports" />
        </nav>

        <button onClick={logout} className="btn-outline" style={{ width: '100%', justifyContent: 'flex-start', gap: '1rem' }}>
          <LogOut size={20} />
          <span>Logout</span>
        </button>
      </aside>

      {/* Main Content */}
        <main style={{ flex: 1, padding: '2.5rem', overflowY: 'auto' }}>
          <header style={{ marginBottom: '2.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h2 style={{ fontSize: '1.875rem', fontWeight: '800', marginBottom: '0.25rem' }}>
                {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
              </h2>
              <p style={{ color: 'var(--text-muted)' }}>Manage your warehouse assets and operations</p>
            </div>
            {activeTab !== 'dashboard' && activeTab !== 'orders' && (
              <button className="btn-primary" onClick={handleAddNew}>
                <Plus size={20} />
                Add {activeTab.slice(0, -1)}
              </button>
            )}
          </header>
        {error && (
          <div className="glass-card" style={{ padding: '1rem 1.25rem', borderColor: 'rgba(239, 68, 68, 0.35)', marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
              <XCircle size={18} color="var(--error)" style={{ marginTop: '2px' }} />
              <div>
                <div style={{ fontWeight: '700', marginBottom: '0.25rem' }}>Request failed</div>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>{error}</div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'dashboard' ? (
            <>
              {Object.keys(dashboardErrors).length ? (
                <div className="glass-card" style={{ padding: '1rem 1.25rem', borderColor: 'rgba(245, 158, 11, 0.35)', marginBottom: '1.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                    <XCircle size={18} color="var(--warning)" style={{ marginTop: '2px' }} />
                    <div>
                      <div style={{ fontWeight: '700', marginBottom: '0.25rem' }}>Some dashboard calls failed</div>
                      <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                        {Object.entries(dashboardErrors).map(([k, v]) => (
                          <div key={k}><strong style={{ color: 'var(--text)' }}>{k}</strong>: {v}</div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ) : null}
              <div className="grid animate-fade-in" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))' }}>
                <StatCard label="Total Products" value={data.products.length} icon={Package} color="var(--primary)" />
                <StatCard label="Categories" value={data.categories.length} icon={Tag} color="var(--accent)" />
                <StatCard label="Active Users" value={data.users.filter(u => u.isActive ?? u.IsActive ?? true).length} icon={UsersIcon} color="var(--success)" />
                <StatCard label="Orders" value={data.orders.length} icon={ShoppingCart} color="var(--warning)" />
                <StatCard label="Roles" value={data.roles.length} icon={Settings} color="var(--text-muted)" />
              </div>
            </>
        ) : (
          <>
            {activeTab === 'products' && revenueData.length > 0 && (
              <div className="glass-card animate-fade-in" style={{ marginBottom: '2rem', padding: '1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
                  <div style={{ background: 'var(--success)', padding: '0.5rem', borderRadius: '8px', color: 'white' }}>
                    <TrendingUp size={20} />
                  </div>
                  <h3 style={{ fontWeight: '700' }}>Product Revenue Performance (Top Sellers)</h3>
                </div>
                <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem' }}>
                  {revenueData.slice(0, 4).map((item) => (
                    <div key={item.productId} style={{ background: 'rgba(255,255,255,0.03)', padding: '1rem', borderRadius: '12px', border: '1px solid var(--border)' }}>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {item.productName}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
                        <div style={{ fontSize: '1.25rem', fontWeight: '800', color: 'var(--primary)' }}>
                          ${Number(item.revenue).toFixed(2)}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--success)', fontWeight: '600', padding: '0.25rem 0.5rem', background: 'rgba(34, 197, 94, 0.1)', borderRadius: '6px' }}>
                          Revenue
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'reports' ? (
              <div className="animate-fade-in">
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2rem' }}>
                  <div style={{ background: 'var(--primary)', padding: '0.5rem', borderRadius: '10px', color: 'white' }}>
                    <BarChart2 size={24} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: '800' }}>Revenue Analysis</h3>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Detailed breakdown of earnings per product</p>
                  </div>
                </div>

                <div className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ background: 'rgba(255,255,255,0.02)' }}>
                        <th style={{ textAlign: 'left', padding: '1.25rem 1.5rem', color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase' }}>Product</th>
                        <th style={{ textAlign: 'left', padding: '1.25rem 1.5rem', color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase' }}>Product ID</th>
                        <th style={{ textAlign: 'right', padding: '1.25rem 1.5rem', color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase' }}>Revenue</th>
                      </tr>
                    </thead>
                    <tbody>
                      {console.log('Rendering revenue data:', revenueData) || revenueData.map((item) => (
                        <tr key={item.productId} style={{ borderBottom: '1px solid var(--border)' }}>
                          <td style={{ padding: '1.25rem 1.5rem', fontWeight: '600' }}>{item.productName}</td>
                          <td style={{ padding: '1.25rem 1.5rem' }}>
                            <span className="badge" style={{ background: 'rgba(99, 102, 241, 0.1)', color: 'var(--primary)' }}>
                              #{item.productId}
                            </span>
                          </td>
                          <td style={{ padding: '1.25rem 1.5rem', textAlign: 'right', fontWeight: '800', fontSize: '1.1rem', color: 'var(--success)' }}>
                            ${Number(item.revenue).toFixed(2)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div className="glass-card animate-fade-in" style={{ padding: 0, overflow: 'hidden' }}>
            <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid var(--border)', display: 'flex', gap: '0.75rem', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flex: 1 }}>
                <input
                  value={tabQuery[activeTab]?.q ?? ''}
                  onChange={(e) => updateTabQuery(activeTab, { q: e.target.value })}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      fetchTabSearch(activeTab, { page: 1 });
                      updateTabQuery(activeTab, { page: 1 });
                    }
                  }}
                  placeholder={`Search ${activeTab}...`}
                  style={{ maxWidth: '420px' }}
                />
                <button
                  className="btn-outline"
                  onClick={() => {
                    updateTabQuery(activeTab, { page: 1 });
                    fetchTabSearch(activeTab, { page: 1 });
                  }}
                >
                  Search
                </button>
                <button
                  className="btn-ghost"
                  onClick={() => {
                    updateTabQuery(activeTab, { q: '', page: 1 });
                    fetchTabSearch(activeTab, { q: '', page: 1 });
                  }}
                >
                  Clear
                </button>
              </div>

              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Rows</span>
                <select
                  value={tabQuery[activeTab]?.pageSize ?? 20}
                  onChange={(e) => {
                    const nextSize = parseInt(e.target.value, 10);
                    updateTabQuery(activeTab, { pageSize: nextSize, page: 1 });
                    fetchTabSearch(activeTab, { pageSize: nextSize, page: 1 });
                  }}
                  style={{ width: '96px' }}
                >
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                </select>
              </div>
            </div>

            <Table 
              type={activeTab} 
              data={tabQuery[activeTab]?.items ?? []} 
              onEdit={handleEdit} 
              onDelete={handleDelete} 
              loading={loading}
            />

            <div style={{ padding: '0.9rem 1.25rem', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                Total: <span style={{ color: 'var(--text)', fontWeight: 700 }}>{tabQuery[activeTab]?.total ?? 0}</span>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <button
                  className="btn-outline"
                  disabled={(tabQuery[activeTab]?.page ?? 1) <= 1 || loading}
                  onClick={() => {
                    const current = tabQuery[activeTab];
                    const nextPage = Math.max(1, (current.page || 1) - 1);
                    updateTabQuery(activeTab, { page: nextPage });
                    fetchTabSearch(activeTab, { page: nextPage });
                  }}
                >
                  Prev
                </button>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                  Page <span style={{ color: 'var(--text)', fontWeight: 700 }}>{tabQuery[activeTab]?.page ?? 1}</span>
                </span>
                <button
                  className="btn-outline"
                  disabled={
                    loading ||
                    ((tabQuery[activeTab]?.page ?? 1) * (tabQuery[activeTab]?.pageSize ?? 20) >= (tabQuery[activeTab]?.total ?? 0))
                  }
                  onClick={() => {
                    const current = tabQuery[activeTab];
                    const nextPage = (current.page || 1) + 1;
                    updateTabQuery(activeTab, { page: nextPage });
                    fetchTabSearch(activeTab, { page: nextPage });
                  }}
                >
                  Next
                </button>
              </div>
            </div>
            </div>
            )}
          </>
        )}
      </main>

      {/* Modal */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 style={{ fontSize: '1.25rem', fontWeight: '700' }}>
                {editingItem ? 'Edit' : 'Add New'} {activeTab.slice(0, -1)}
              </h3>
              <button className="btn-icon" onClick={() => setIsModalOpen(false)}><X size={20} /></button>
            </div>
            <form onSubmit={handleSave}>
              {activeTab === 'products' && (
                <>
                  <div className="form-group">
                    <label>Product Name</label>
                    <input 
                      required
                      value={formData.name || ''} 
                      onChange={e => setFormData({...formData, name: e.target.value})} 
                      placeholder="e.g. Industrial Drill"
                    />
                  </div>
                  <div className="form-group">
                    <label>Description</label>
                    <textarea 
                      value={formData.description || ''} 
                      onChange={e => setFormData({...formData, description: e.target.value})}
                      placeholder="Product details..."
                    />
                  </div>
                  <div className="grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
                    <div className="form-group">
                      <label>Price ($)</label>
                      <input 
                        type="number" step="0.01" required
                        value={formData.price || ''} 
                        onChange={e => setFormData({...formData, price: parseFloat(e.target.value)})}
                      />
                    </div>
                    <div className="form-group">
                      <label>Stock Quantity</label>
                      <input 
                        type="number" required
                        value={formData.quantity || ''} 
                        onChange={e => setFormData({...formData, quantity: parseInt(e.target.value)})}
                      />
                    </div>
                  </div>
                  <div className="form-group">
                    <label>Category ID</label>
                    <input 
                      type="number" required
                      value={formData.categoryId || ''} 
                      onChange={e => setFormData({...formData, categoryId: parseInt(e.target.value)})}
                    />
                  </div>
                </>
              )}

              {activeTab === 'categories' && (
                <div className="form-group">
                  <label>Category Name</label>
                  <input 
                    required
                    value={formData.name || ''} 
                    onChange={e => setFormData({...formData, name: e.target.value})}
                  />
                </div>
              )}

              {activeTab === 'roles' && (
                <div className="form-group">
                  <label>Role Name</label>
                  <input 
                    required
                    value={formData.roleName || ''} 
                    onChange={e => setFormData({...formData, roleName: e.target.value})}
                  />
                </div>
              )}

              {activeTab === 'users' && (
                <>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div className="form-group">
                      <label>First Name</label>
                      <input required value={formData.fname || ''} onChange={e => setFormData({...formData, fname: e.target.value})} />
                    </div>
                    <div className="form-group">
                      <label>Last Name</label>
                      <input required value={formData.lname || ''} onChange={e => setFormData({...formData, lname: e.target.value})} />
                    </div>
                  </div>
                  <div className="form-group">
                    <label>Email Address</label>
                    <input type="email" required value={formData.email || ''} onChange={e => setFormData({...formData, email: e.target.value})} />
                  </div>
                  {!editingItem && (
                    <div className="form-group">
                      <label>Password</label>
                      <input type="password" required value={formData.password || ''} onChange={e => setFormData({...formData, password: e.target.value})} />
                    </div>
                  )}
                  <div className="form-group">
                    <label>Street Address</label>
                    <input required value={formData.street || ''} onChange={e => setFormData({...formData, street: e.target.value})} />
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div className="form-group">
                      <label>City</label>
                      <input required value={formData.city || ''} onChange={e => setFormData({...formData, city: e.target.value})} />
                    </div>
                    <div className="form-group">
                      <label>Country</label>
                      <input required value={formData.country || ''} onChange={e => setFormData({...formData, country: e.target.value})} />
                    </div>
                  </div>
                  <div className="form-group">
                    <label>Role ID</label>
                    <input type="number" required value={formData.roleId || ''} onChange={e => setFormData({...formData, roleId: parseInt(e.target.value)})} />
                  </div>
                  <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <input 
                      type="checkbox" 
                      style={{ width: 'auto' }}
                      checked={formData.isActive || false} 
                      onChange={e => setFormData({...formData, isActive: e.target.checked})} 
                    />
                    <label style={{ marginBottom: 0 }}>Active Account</label>
                  </div>
                </>
              )}

              <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem' }}>
                <button type="button" className="btn-outline" style={{ flex: 1 }} onClick={() => setIsModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn-primary" style={{ flex: 1 }}>{editingItem ? 'Update' : 'Create'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value, icon: Icon, color, trend }) {
  return (
    <div className="glass-card" style={{ padding: '1.5rem', border: '1px solid var(--border)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
        <div style={{ padding: '0.75rem', borderRadius: '12px', background: `${color}15`, color }}>
          <Icon size={24} />
        </div>
        {trend ? (
          <span style={{ fontSize: '0.75rem', fontWeight: '600', color: 'var(--success)', padding: '0.25rem 0.5rem', background: 'rgba(34, 197, 94, 0.1)', borderRadius: '6px' }}>{trend}</span>
        ) : null}
      </div>
      <div>
        <span style={{ color: 'var(--text-muted)', fontWeight: '500', fontSize: '0.875rem' }}>{label}</span>
        <div style={{ fontSize: '2rem', fontWeight: '800', marginTop: '0.25rem' }}>{value}</div>
      </div>
    </div>
  );
}

function Table({ type, data, onEdit, onDelete, loading }) {
  if (loading) return <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>Loading records...</div>;

  const getAnyId = (item) =>
    item?.productsId ?? item?.ProductsId ??
    item?.categoryId ?? item?.CategoryId ??
    item?.usersId ?? item?.UsersId ??
    item?.roleId ?? item?.RoleId ??
    item?.ordersId ?? item?.OrdersId ??
    item?.id ?? item?.Id;

  const getHeaders = () => {
    switch (type) {
      case 'products': return ['Product', 'Category', 'Price', 'Stock'];
      case 'categories': return ['ID', 'Category Name'];
      case 'users': return ['Full Name', 'Email', 'Role', 'Status'];
      case 'orders': return ['Order ID', 'Client', 'Delivery', 'Schedule'];
      case 'roles': return ['ID', 'Role Name'];
      default: return [];
    }
  };

  const headers = getHeaders();

  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ background: 'rgba(255,255,255,0.02)' }}>
            {headers.map(h => (
              <th key={h} style={{ textAlign: 'left', padding: '1.25rem 1.5rem', color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
            ))}
            <th style={{ textAlign: 'right', padding: '1.25rem 1.5rem', color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase' }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr><td colSpan={headers.length + 1} style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>
              <div style={{ opacity: 0.5, marginBottom: '1rem' }}><Package size={48} style={{ margin: '0 auto' }} /></div>
              No records found in this category
            </td></tr>
          ) : data.map((item) => {
            const id = getAnyId(item);
            return (
            <tr key={id} style={{ borderBottom: '1px solid var(--border)' }}>
              {type === 'products' && (
                <>
                  <td style={{ padding: '1.25rem 1.5rem' }}>
                    <div style={{ fontWeight: '600' }}>{item.name ?? item.Name}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>ID: #{item.productsId ?? item.ProductsId}</div>
                  </td>
                  <td style={{ padding: '1.25rem 1.5rem' }}><span className="badge badge-warning">{item.category?.name ?? item.category?.Name ?? 'Uncategorized'}</span></td>
                  <td style={{ padding: '1.25rem 1.5rem', fontWeight: '600' }}>${Number(item.price ?? item.Price ?? 0).toFixed(2)}</td>
                  <td style={{ padding: '1.25rem 1.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: Number(item.quantity ?? item.Quantity ?? 0) > 10 ? 'var(--success)' : 'var(--error)' }}></div>
                      {item.quantity ?? item.Quantity ?? 0} units
                    </div>
                  </td>
                </>
              )}
              {type === 'categories' && (
                <>
                  <td style={{ padding: '1.25rem 1.5rem', color: 'var(--text-muted)' }}>#{item.categoryId ?? item.CategoryId}</td>
                  <td style={{ padding: '1.25rem 1.5rem', fontWeight: '600' }}>{item.name ?? item.Name}</td>
                </>
              )}
              {type === 'roles' && (
                <>
                  <td style={{ padding: '1.25rem 1.5rem', color: 'var(--text-muted)' }}>#{item.roleId ?? item.RoleId}</td>
                  <td style={{ padding: '1.25rem 1.5rem', fontWeight: '600' }}>{item.roleName ?? item.RoleName}</td>
                </>
              )}
              {type === 'users' && (
                <>
                  <td style={{ padding: '1.25rem 1.5rem' }}>
                    <div style={{ fontWeight: '600' }}>{item.fname ?? item.Fname} {item.lname ?? item.Lname}</div>
                  </td>
                  <td style={{ padding: '1.25rem 1.5rem', color: 'var(--text-muted)' }}>{item.email ?? item.Email}</td>
                  <td style={{ padding: '1.25rem 1.5rem' }}><span className="badge" style={{ background: 'rgba(99, 102, 241, 0.1)', color: 'var(--primary)' }}>Role ID: {item.roleId ?? item.RoleId}</span></td>
                  <td style={{ padding: '1.25rem 1.5rem' }}>
                    {(item.isActive ?? item.IsActive) ? <span className="badge badge-success">Active</span> : <span className="badge badge-error">Disabled</span>}
                  </td>
                </>
              )}
              {type === 'orders' && (
                <>
                  <td style={{ padding: '1.25rem 1.5rem' }}>
                    <div style={{ fontWeight: '600' }}>#{item.ordersId ?? item.OrdersId}</div>
                  </td>
                  <td style={{ padding: '1.25rem 1.5rem' }}>
                    <div style={{ fontWeight: '600' }}>{item.client?.fname ?? item.client?.Fname} {item.client?.lname ?? item.client?.Lname}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>ID: {item.clientId ?? item.ClientId}</div>
                  </td>
                  <td style={{ padding: '1.25rem 1.5rem' }}>
                    <div style={{ fontWeight: '600' }}>{item.deliveryPerson?.fname ?? item.deliveryPerson?.Fname} {item.deliveryPerson?.lname ?? item.deliveryPerson?.Lname}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>ID: {item.deliveryPersonId ?? item.DeliveryPersonId}</div>
                  </td>
                  <td style={{ padding: '1.25rem 1.5rem' }}>{(item.schedule ?? item.Schedule) ? new Date(item.schedule ?? item.Schedule).toLocaleDateString() : 'TBD'}</td>
                </>
              )}
              
              <td style={{ padding: '1.25rem 1.5rem', textAlign: 'right' }}>
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                  <button className="btn-icon" onClick={() => onEdit(item)}><Edit size={16} /></button>
                  <button className="btn-icon btn-danger" onClick={() => onDelete(getAnyId(item))}><Trash size={16} /></button>
                </div>
              </td>
            </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export default AdminDashboard;
