import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { ShoppingCart, Edit, Trash, Search, Plus, Calendar } from 'lucide-react';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchFilters, setSearchFilters] = useState({
    clientId: '',
    deliveryPersonId: '',
    from: '',
    to: ''
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingOrder, setEditingOrder] = useState(null);
  const [formData, setFormData] = useState({});

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await api.get('/Order');
      let normalizedData = Array.isArray(res.data) ? res.data : 
        (res.data?.$values ? res.data.$values : []);
      setOrders(normalizedData);
    } catch (err) {
      console.error('Error fetching orders:', err);
      setError('Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    try {
      setLoading(true);
      const params = {};
      
      if (searchQuery.trim()) params.q = searchQuery.trim();
      if (searchFilters.clientId) params.clientId = searchFilters.clientId;
      if (searchFilters.deliveryPersonId) params.deliveryPersonId = searchFilters.deliveryPersonId;
      if (searchFilters.from) params.from = searchFilters.from;
      if (searchFilters.to) params.to = searchFilters.to;

      const res = await api.get('/Order/search', { params });
      let normalizedData = Array.isArray(res.data) ? res.data : 
        (res.data?.$values ? res.data.$values : []);
      setOrders(normalizedData);
    } catch (err) {
      console.error('Error searching orders:', err);
      setError('Failed to search orders');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this order?')) return;
    try {
      await api.delete(`/Order/${id}`);
      fetchOrders();
    } catch (err) {
      console.error('Error deleting order:', err);
      alert('Error deleting order');
    }
  };

  const handleEdit = (order) => {
    setEditingOrder(order);
    setFormData(order);
    setIsModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      if (editingOrder) {
        const id = editingOrder.ordersId || editingOrder.OrdersId || editingOrder.id || editingOrder.Id;
        await api.put(`/Order/${id}`, formData);
      } else {
        await api.post('/Order', formData);
      }
      setIsModalOpen(false);
      setEditingOrder(null);
      setFormData({});
      fetchOrders();
    } catch (err) {
      console.error('Error saving order:', err);
      alert('Error saving order');
    }
  };

  const getOrderId = (order) => {
    return order.ordersId || order.OrdersId || order.id || order.Id;
  };

  const getOrderField = (order, field) => {
    const fieldMap = {
      schedule: order.schedule || order.Schedule,
      status: order.status || order.Status,
      clientId: order.clientId || order.ClientId,
      deliveryPersonId: order.deliveryPersonId || order.DeliveryPersonId,
      clientName: order.client?.name || order.client?.Name || order.Client?.name || order.Client?.Name,
      deliveryPersonName: order.deliveryPerson?.name || order.deliveryPerson?.Name || order.DeliveryPerson?.name || order.DeliveryPerson?.Name
    };
    return fieldMap[field];
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString();
    } catch {
      return dateString;
    }
  };

  if (loading) return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading orders...</div>;
  if (error) return <div style={{ padding: '2rem', color: 'red' }}>Error: {error}</div>;

  return (
    <div style={{ padding: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: '700' }}>Order Management</h2>
        <button className="btn-primary" onClick={handleEdit}>
          <Plus size={16} style={{ marginRight: '0.5rem' }} />
          Add Order
        </button>
      </div>

      <div style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap' }}>
          <input
            type="text"
            placeholder="Search orders..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            style={{
              padding: '0.75rem 1rem',
              border: '1px solid var(--border)',
              borderRadius: '8px',
              background: 'var(--background)',
              color: 'var(--text)',
              fontSize: '0.875rem',
              minWidth: '300px'
            }}
          />
          <input
            type="number"
            placeholder="Client ID"
            value={searchFilters.clientId}
            onChange={(e) => setSearchFilters({ ...searchFilters, clientId: e.target.value })}
            style={{
              padding: '0.75rem 1rem',
              border: '1px solid var(--border)',
              borderRadius: '8px',
              background: 'var(--background)',
              color: 'var(--text)',
              fontSize: '0.875rem',
              width: '120px'
            }}
          />
          <input
            type="number"
            placeholder="Delivery Person ID"
            value={searchFilters.deliveryPersonId}
            onChange={(e) => setSearchFilters({ ...searchFilters, deliveryPersonId: e.target.value })}
            style={{
              padding: '0.75rem 1rem',
              border: '1px solid var(--border)',
              borderRadius: '8px',
              background: 'var(--background)',
              color: 'var(--text)',
              fontSize: '0.875rem',
              width: '160px'
            }}
          />
          <input
            type="date"
            value={searchFilters.from}
            onChange={(e) => setSearchFilters({ ...searchFilters, from: e.target.value })}
            style={{
              padding: '0.75rem 1rem',
              border: '1px solid var(--border)',
              borderRadius: '8px',
              background: 'var(--background)',
              color: 'var(--text)',
              fontSize: '0.875rem'
            }}
          />
          <input
            type="date"
            value={searchFilters.to}
            onChange={(e) => setSearchFilters({ ...searchFilters, to: e.target.value })}
            style={{
              padding: '0.75rem 1rem',
              border: '1px solid var(--border)',
              borderRadius: '8px',
              background: 'var(--background)',
              color: 'var(--text)',
              fontSize: '0.875rem'
            }}
          />
          <button className="btn-outline" onClick={handleSearch}>
            <Search size={16} style={{ marginRight: '0.5rem' }} />
            Search
          </button>
          <button 
            className="btn-ghost" 
            onClick={() => { 
              setSearchQuery(''); 
              setSearchFilters({ clientId: '', deliveryPersonId: '', from: '', to: '' });
              fetchOrders(); 
            }}
          >
            Clear
          </button>
        </div>
      </div>

      <div className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: 'rgba(255,255,255,0.02)' }}>
              <th style={{ textAlign: 'left', padding: '1.25rem 1.5rem', color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase' }}>Order ID</th>
              <th style={{ textAlign: 'left', padding: '1.25rem 1.5rem', color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase' }}>Client</th>
              <th style={{ textAlign: 'left', padding: '1.25rem 1.5rem', color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase' }}>Delivery Person</th>
              <th style={{ textAlign: 'left', padding: '1.25rem 1.5rem', color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase' }}>Schedule</th>
              <th style={{ textAlign: 'left', padding: '1.25rem 1.5rem', color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase' }}>Status</th>
              <th style={{ textAlign: 'right', padding: '1.25rem 1.5rem', color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {orders.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>
                  <div style={{ opacity: 0.5, marginBottom: '1rem' }}>
                    <ShoppingCart size={48} style={{ margin: '0 auto' }} />
                  </div>
                  No orders found
                </td>
              </tr>
            ) : (
              orders.map((order) => (
                <tr key={getOrderId(order)} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '1.25rem 1.5rem', fontWeight: '600' }}>
                    #{getOrderId(order)}
                  </td>
                  <td style={{ padding: '1.25rem 1.5rem' }}>
                    <div>
                      <div style={{ fontWeight: '600' }}>{getOrderField(order, 'clientName') || 'N/A'}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        ID: #{getOrderField(order, 'clientId')}
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '1.25rem 1.5rem' }}>
                    <div>
                      <div style={{ fontWeight: '600' }}>{getOrderField(order, 'deliveryPersonName') || 'N/A'}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        ID: #{getOrderField(order, 'deliveryPersonId')}
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '1.25rem 1.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Calendar size={16} style={{ color: 'var(--text-muted)' }} />
                      {formatDate(getOrderField(order, 'schedule'))}
                    </div>
                  </td>
                  <td style={{ padding: '1.25rem 1.5rem' }}>
                    <span className="badge" style={{
                      background: getOrderField(order, 'status') === 'Delivered' ? 'rgba(34, 197, 94, 0.1)' : 
                                 getOrderField(order, 'status') === 'Pending' ? 'rgba(250, 204, 21, 0.1)' : 
                                 'rgba(239, 68, 68, 0.1)',
                      color: getOrderField(order, 'status') === 'Delivered' ? 'var(--success)' : 
                             getOrderField(order, 'status') === 'Pending' ? 'var(--warning)' : 
                             'var(--error)'
                    }}>
                      {getOrderField(order, 'status') || 'Unknown'}
                    </span>
                  </td>
                  <td style={{ padding: '1.25rem 1.5rem', textAlign: 'right' }}>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                      <button className="btn-icon" onClick={() => handleEdit(order)}>
                        <Edit size={16} />
                      </button>
                      <button className="btn-icon btn-danger" onClick={() => handleDelete(getOrderId(order))}>
                        <Trash size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div className="glass-card" style={{ padding: '2rem', minWidth: '500px', maxWidth: '600px' }}>
            <h3 style={{ marginBottom: '1.5rem', fontSize: '1.25rem', fontWeight: '700' }}>
              {editingOrder ? 'Edit Order' : 'Add New Order'}
            </h3>
            <form onSubmit={handleSave}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: '600' }}>Client ID</label>
                  <input
                    type="number"
                    value={formData.clientId || formData.ClientId || ''}
                    onChange={(e) => setFormData({ ...formData, clientId: parseInt(e.target.value) })}
                    required
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: '1px solid var(--border)',
                      borderRadius: '8px',
                      background: 'var(--background)',
                      color: 'var(--text)'
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: '600' }}>Delivery Person ID</label>
                  <input
                    type="number"
                    value={formData.deliveryPersonId || formData.DeliveryPersonId || ''}
                    onChange={(e) => setFormData({ ...formData, deliveryPersonId: parseInt(e.target.value) })}
                    required
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: '1px solid var(--border)',
                      borderRadius: '8px',
                      background: 'var(--background)',
                      color: 'var(--text)'
                    }}
                  />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: '600' }}>Schedule Date</label>
                  <input
                    type="datetime-local"
                    value={formData.schedule || formData.Schedule || ''}
                    onChange={(e) => setFormData({ ...formData, schedule: e.target.value })}
                    required
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: '1px solid var(--border)',
                      borderRadius: '8px',
                      background: 'var(--background)',
                      color: 'var(--text)'
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: '600' }}>Status</label>
                  <select
                    value={formData.status || formData.Status || 'Pending'}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: '1px solid var(--border)',
                      borderRadius: '8px',
                      background: 'var(--background)',
                      color: 'var(--text)'
                    }}
                  >
                    <option value="Pending">Pending</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Delivered">Delivered</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                <button type="button" className="btn-ghost" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  {editingOrder ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Orders;
