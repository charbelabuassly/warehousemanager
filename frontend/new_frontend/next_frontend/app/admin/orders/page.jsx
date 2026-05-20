"use client"

import React, { useState, useEffect } from 'react';
import api from '../../lib/api';
import { ShoppingCart, Edit, Trash, Search, Plus, Calendar } from 'lucide-react';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [view, setView] = useState('pendingCancelled'); // pending/cancelled | assigned | delivered
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
  }, [view]);

  const getOrdersEndpoint = () => {
    if (view === 'assigned') return '/admin/Order';
    if (view === 'delivered') return '/admin/Order/delivered';
    return '/admin/Order/pending-cancelled';
  };

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await api.get(getOrdersEndpoint());
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

      // Keep search results scoped to the current view
      if (view === 'assigned') params.status = 'Assigned';
      if (view === 'delivered') params.status = 'Delivered';
      if (view === 'pendingCancelled') params.statusGroup = 'pending-cancelled';

      if (searchFilters.clientId) params.clientId = searchFilters.clientId;
      if (searchFilters.deliveryPersonId) params.deliveryPersonId = searchFilters.deliveryPersonId;
      if (searchFilters.from) params.from = searchFilters.from;
      if (searchFilters.to) params.to = searchFilters.to;

      const res = await api.get('/admin/Order/search', { params });
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
      await api.delete(`/admin/Order/${id}`);
      fetchOrders();
    } catch (err) {
      console.error('Error deleting order:', err);
      alert('Error deleting order');
    }
  };

  const handleEdit = (order) => {
    if (!order) {
      setEditingOrder(null);
      setFormData({});
      setIsModalOpen(true);
      return;
    }

    const s = normalizeStatus(order.status ?? order.Status);
    if (s === 'Cancelled' || s === 'Assigned') {
      alert('Only pending orders can be modified.');
      return;
    }

    setEditingOrder(order);
    setFormData(order || {});
    setIsModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      if (editingOrder) {
        const id = editingOrder.ordersId || editingOrder.OrdersId || editingOrder.id || editingOrder.Id;
        const normalized = {
          clientId: formData.clientId ?? formData.ClientId,
          deliveryPersonId: (() => {
            const raw = formData.deliveryPersonId ?? formData.DeliveryPersonId;
            const num = typeof raw === 'string' ? parseInt(raw, 10) : raw;
            return Number.isFinite(num) ? num : undefined;
          })(),
          schedule: formData.schedule ?? formData.Schedule
        };

        // Status is patched (only for pending/cancelled + assigned views)
        const nextStatus = normalizeStatus(formData.status ?? formData.Status);
        if (view !== 'delivered' && nextStatus) {
          if (nextStatus === 'Assigned' && !Number.isFinite(normalized.deliveryPersonId)) {
            alert('Delivery Person ID is required to assign an order');
            return;
          }

          await api.patch(`/admin/Order/${id}/status`, {
            status: nextStatus,
            deliveryPersonId: normalized.deliveryPersonId
          });
        }

        // Persist other editable fields (keep it after status patch so assignment rules apply)
        const desiredDeliveryPersonId =
          nextStatus === 'Pending' || nextStatus === 'Cancelled'
            ? -1
            : (normalized.deliveryPersonId ?? (editingOrder.deliveryPersonId ?? editingOrder.DeliveryPersonId));

        await api.put(`/admin/Order/${id}`, {
          clientId: normalized.clientId,
          deliveryPersonId: desiredDeliveryPersonId,
          schedule: normalized.schedule
        });
      } else {
        await api.post('/admin/Order', formData);
      }
      setIsModalOpen(false);
      setEditingOrder(null);
      setFormData({});
      fetchOrders();
    } catch (err) {
      console.error('Error saving order:', err);
      alert(err?.response?.data?.message || 'Error saving order');
    }
  };

  const getOrderId = (order) => {
    return order.ordersId || order.OrdersId || order.id || order.Id;
  };

  const getOrderField = (order, field) => {
    const fieldMap = {
      schedule: order.schedule || order.Schedule,
      status: order.status ?? order.Status,
      clientId: order.clientId || order.ClientId,
      deliveryPersonId: order.deliveryPersonId || order.DeliveryPersonId,
      clientName:
        order.client?.fname || order.client?.Fname || order.Client?.fname || order.Client?.Fname
          ? `${order.client?.fname || order.client?.Fname || order.Client?.fname || order.Client?.Fname} ${order.client?.lname || order.client?.Lname || order.Client?.lname || order.Client?.Lname || ''}`.trim()
          : (order.client?.email || order.client?.Email || order.Client?.email || order.Client?.Email),
      deliveryPersonName:
        order.deliveryPerson?.fname || order.deliveryPerson?.Fname || order.DeliveryPerson?.fname || order.DeliveryPerson?.Fname
          ? `${order.deliveryPerson?.fname || order.deliveryPerson?.Fname || order.DeliveryPerson?.fname || order.DeliveryPerson?.Fname} ${order.deliveryPerson?.lname || order.deliveryPerson?.Lname || order.DeliveryPerson?.lname || order.DeliveryPerson?.Lname || ''}`.trim()
          : (order.deliveryPerson?.email || order.deliveryPerson?.Email || order.DeliveryPerson?.email || order.DeliveryPerson?.Email)
    };
    return fieldMap[field];
  };

  const normalizeStatus = (status) => {
    if (status === null || status === undefined) return '';
    if (typeof status === 'string') return status;
    // Backend may send numeric enums (0..3)
    const map = ['Pending', 'Assigned', 'Delivered', 'Cancelled'];
    if (typeof status === 'number' && map[status]) return map[status];
    return String(status);
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

  const currentFormStatus = normalizeStatus(formData.status ?? formData.Status) || 'Pending';

  return (
    <div style={{ padding: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: '700' }}>Order Management</h2>
        {view !== 'delivered' && (
          <button className="btn-primary" onClick={handleEdit}>
            <Plus size={16} style={{ marginRight: '0.5rem' }} />
            Add Order
          </button>
        )}
      </div>

      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
        <button
          className={view === 'pendingCancelled' ? 'btn-primary' : 'btn-outline'}
          onClick={() => setView('pendingCancelled')}
        >
          Pending / Cancelled
        </button>
        <button
          className={view === 'assigned' ? 'btn-primary' : 'btn-outline'}
          onClick={() => setView('assigned')}
        >
          Assigned
        </button>
        <button
          className={view === 'delivered' ? 'btn-primary' : 'btn-outline'}
          onClick={() => setView('delivered')}
        >
          Delivered
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
              <th style={{ textAlign: 'left', padding: '1.25rem 1.5rem', color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase' }}>Scheduled Date</th>
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
                      background: normalizeStatus(getOrderField(order, 'status')) === 'Delivered' ? 'rgba(34, 197, 94, 0.1)' : 
                                 normalizeStatus(getOrderField(order, 'status')) === 'Pending' ? 'rgba(250, 204, 21, 0.1)' : 
                                  'rgba(239, 68, 68, 0.1)',
                      color: normalizeStatus(getOrderField(order, 'status')) === 'Delivered' ? 'var(--success)' : 
                             normalizeStatus(getOrderField(order, 'status')) === 'Pending' ? 'var(--warning)' : 
                              'var(--error)'
                    }}>
                      {normalizeStatus(getOrderField(order, 'status')) || 'Unknown'}
                    </span>
                  </td>
                  <td style={{ padding: '1.25rem 1.5rem', textAlign: 'right' }}>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                      {view !== 'delivered' &&
                        normalizeStatus(getOrderField(order, 'status')) !== 'Cancelled' &&
                        normalizeStatus(getOrderField(order, 'status')) !== 'Assigned' && (
                        <button className="btn-icon" onClick={() => handleEdit(order)} title="Update / Assign">
                          <Edit size={16} />
                        </button>
                      )}
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
            {editingOrder && (normalizeStatus(editingOrder.status ?? editingOrder.Status) === 'Cancelled' || normalizeStatus(editingOrder.status ?? editingOrder.Status) === 'Assigned') && (
              <div style={{ marginBottom: '1rem', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                Cancelled/Assigned orders are read-only.
              </div>
            )}
            <form onSubmit={handleSave}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: '600' }}>Client ID</label>
                  <input
                    type="number"
                    value={formData.clientId || formData.ClientId || ''}
                    onChange={(e) => setFormData({ ...formData, clientId: parseInt(e.target.value) })}
                    required
                    disabled={!!editingOrder && (normalizeStatus(editingOrder.status ?? editingOrder.Status) === 'Cancelled' || normalizeStatus(editingOrder.status ?? editingOrder.Status) === 'Assigned')}
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
                    required={currentFormStatus === 'Assigned'}
                    disabled={!!editingOrder && (normalizeStatus(editingOrder.status ?? editingOrder.Status) === 'Cancelled' || normalizeStatus(editingOrder.status ?? editingOrder.Status) === 'Assigned')}
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
                    disabled={!!editingOrder && (normalizeStatus(editingOrder.status ?? editingOrder.Status) === 'Cancelled' || normalizeStatus(editingOrder.status ?? editingOrder.Status) === 'Assigned')}
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
                    onChange={(e) => {
                      const v = e.target.value;
                      const next = { ...formData, status: v };
                      if (v === 'Pending' || v === 'Cancelled') next.deliveryPersonId = '';
                      setFormData(next);
                    }}
                    disabled={
                      view === 'delivered' ||
                      (!!editingOrder && (normalizeStatus(editingOrder.status ?? editingOrder.Status) === 'Cancelled' || normalizeStatus(editingOrder.status ?? editingOrder.Status) === 'Assigned'))
                    }
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: '1px solid var(--border)',
                      borderRadius: '8px',
                      background: 'var(--background)',
                      color: 'var(--text)'
                    }}
                  >
                    {view === 'delivered' ? (
                      <option value="Delivered">Delivered</option>
                    ) : (
                      <>
                        <option value="Pending">Pending</option>
                        <option value="Assigned" disabled={normalizeStatus(editingOrder?.status ?? editingOrder?.Status) === 'Cancelled'}>
                          Assigned
                        </option>
                        <option value="Cancelled">Cancelled</option>
                      </>
                    )}
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
