"use client"

import React, { useState, useEffect } from 'react';
import "../dashboard.css"
import api from '../../lib/api';
import { Truck, Calendar, MapPin, CheckCircle, LogOut, User, Package, XCircle, RefreshCw } from 'lucide-react';

const ORDER_STATUS = {
  Pending: 0,
  Assigned: 1,
  Delivered: 2,
  Cancelled: 3,
};

function normalizeArray(data) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.$values)) return data.$values;
  return [];
}

function formatFullDate(value) {
  if (!value) return '';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return String(value);
  return d.toLocaleString([], {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function DeliveryDashboard() {
  const [deliveries, setDeliveries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);
  const [error, setError] = useState('');
  const [expandedId, setExpandedId] = useState(null);
  const [view, setView] = useState('assigned'); // assigned | delivered

  useEffect(() => {
    fetchDeliveries();
  }, []);

  const fetchDeliveries = async () => {
    try {
      setError('');
      setLoading(true);
      const { data } = await api.get('/DeliveryOrder/my-orders');
      setDeliveries(normalizeArray(data));
    } catch (err) {
      console.error('Error fetching deliveries:', err);
      setError(err?.response?.data?.message || err?.response?.data?.Message || 'Failed to load deliveries.');
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (orderId, statusValue) => {
    try {
      setError('');
      setBusyId(orderId);
      await api.patch(`/DeliveryOrder/${orderId}/status`, { status: statusValue });
      await fetchDeliveries();
    } catch (err) {
      console.error('Error updating delivery:', err);
      const statusCode = err?.response?.status;
      const serverMsg = err?.response?.data?.message || err?.response?.data?.Message;

      if (statusValue === ORDER_STATUS.Cancelled && statusCode === 400) {
        // e.g. "More than one day has passed, cannot cancel anymore"
        const msg = serverMsg || 'Cannot cancel this order.';
        setError(msg);
        alert(msg);
        return;
      }

      setError(serverMsg || 'Failed to update order.');
    } finally {
      setBusyId(null);
    }
  };

  const getAssigned = async () => {
    setView('assigned');
    await fetchDeliveries();
  };

  const getDelivered = async () => {
    try {
      setError('');
      setLoading(true);
      setView('delivered');
      const { data } = await api.get('/DeliveryOrder/delivered');
      setDeliveries(normalizeArray(data));
    } catch (err) {
      console.error('Error fetching delivered:', err);
      setError(err?.response?.data?.message || err?.response?.data?.Message || 'Failed to load delivered orders.');
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.clear();
    window.location.href = "/";
  };

  const filteredDeliveries = deliveries;

  return (
    <div style={{ background: 'var(--background)', minHeight: '100vh', padding: '1rem' }}>
      <header style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: '2rem',
        padding: '1rem',
        background: 'var(--surface)',
        borderRadius: '16px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Truck color="var(--primary)" size={32} />
          <div>
            <h1 style={{ fontWeight: '800', fontSize: '1.25rem' }}>Delivery Driver</h1>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Daily Schedule</p>
          </div>
        </div>
        <button onClick={logout} style={{ color: 'var(--error)', background: 'transparent' }}>
          <LogOut />
        </button>
      </header>

      <main className="container" style={{ maxWidth: '800px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
          <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Calendar size={20} color="var(--primary)" />
            {view === 'delivered' ? 'Delivered Orders' : 'Assigned Orders'}
          </h2>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
            <button onClick={getAssigned} className="btn-secondary">Assigned</button>
            <button onClick={getDelivered} className="btn-secondary">Delivered</button>
            <button onClick={fetchDeliveries} className="btn-secondary" style={{ gap: '0.5rem' }}>
              <RefreshCw size={16} />
              Refresh
            </button>
          </div>
        </div>

        {error && (
          <div style={{
            padding: '0.75rem',
            background: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.2)',
            borderRadius: '12px',
            color: 'var(--error)',
            fontSize: '0.875rem',
            textAlign: 'center',
            marginBottom: '1rem'
          }}>
            {error}
          </div>
        )}

        {loading ? (
          <div style={{ textAlign: 'center', padding: '4rem' }}>Loading schedule...</div>
        ) : filteredDeliveries.length === 0 ? (
          <div className="glass-card" style={{ textAlign: 'center', padding: '4rem' }}>
            <CheckCircle size={48} color="var(--success)" style={{ marginBottom: '1rem', opacity: 0.5 }} />
            <h3>All caught up!</h3>
            <p style={{ color: 'var(--text-muted)' }}>No pending deliveries for today.</p>
          </div>
        ) : (
          <div className="grid">
            {filteredDeliveries.map(delivery => (
              <div key={delivery.ordersId} className="glass-card animate-fade-in" style={{ padding: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                  <div>
                    <span className="badge badge-warning" style={{ marginBottom: '0.5rem', display: 'inline-block' }}>
                      {delivery.status === ORDER_STATUS.Delivered ? 'Delivered' :
                       delivery.status === ORDER_STATUS.Cancelled ? 'Cancelled' :
                       delivery.status === ORDER_STATUS.Assigned ? 'Assigned' : 'Pending'}
                    </span>
                    <h3 style={{ fontWeight: '700' }}>Order #{delivery.ordersId}</h3>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <p style={{ fontSize: '0.875rem', fontWeight: '600', color: 'var(--primary)' }}>
                      Scheduled: {formatFullDate(delivery.schedule)}
                    </p>
                    {delivery.dateDelivered && (
                      <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                        Delivered: {formatFullDate(delivery.dateDelivered)}
                      </p>
                    )}
                  </div>
                </div>

                <div style={{ display: 'grid', gap: '0.75rem', marginBottom: '1.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--text-muted)' }}>
                    <User size={18} />
                    <span>
                      {delivery.clientFirstName} {delivery.clientLastName} ({delivery.clientEmail})
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--text-muted)' }}>
                    <MapPin size={18} />
                    <span>{delivery.street}, {delivery.city}, {delivery.country}</span>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  <button
                    onClick={() => setExpandedId(expandedId === delivery.ordersId ? null : delivery.ordersId)}
                    className="btn-secondary"
                    style={{ flex: 1, gap: '0.5rem' }}
                  >
                    <Package size={18} />
                    {expandedId === delivery.ordersId ? 'Hide Items' : 'View Items'}
                  </button>
                  <button
                    onClick={() => updateStatus(delivery.ordersId, ORDER_STATUS.Delivered)}
                    className="btn-primary"
                    style={{ flex: 1, gap: '0.5rem' }}
                    disabled={busyId === delivery.ordersId || delivery.status === ORDER_STATUS.Delivered || delivery.status === ORDER_STATUS.Cancelled}
                  >
                    <CheckCircle size={18} />
                    {busyId === delivery.ordersId ? 'Saving...' : 'Delivered'}
                  </button>
                </div>

                <button
                  onClick={() => {
                    const ok = window.confirm('Are you sure you want to cancel this order?');
                    if (!ok) return;
                    updateStatus(delivery.ordersId, ORDER_STATUS.Cancelled);
                  }}
                  style={{
                    width: '100%',
                    marginTop: '0.75rem',
                    background: 'rgba(239, 68, 68, 0.12)',
                    border: '1px solid rgba(239, 68, 68, 0.25)',
                    color: 'var(--error)',
                    gap: '0.5rem'
                  }}
                  disabled={busyId === delivery.ordersId || delivery.status === ORDER_STATUS.Delivered || delivery.status === ORDER_STATUS.Cancelled}
                >
                  <XCircle size={18} />
                  {busyId === delivery.ordersId ? 'Saving...' : 'Cancel (within 1 day)'}
                </button>

                {expandedId === delivery.ordersId && (
                  <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--border)' }}>
                    <h4 style={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                      <Package size={16} color="var(--primary)" />
                      Items
                    </h4>
                    {normalizeArray(delivery.items).length === 0 ? (
                      <div style={{ color: 'var(--text-muted)' }}>No items</div>
                    ) : (
                      <div style={{ display: 'grid', gap: '0.5rem' }}>
                        {normalizeArray(delivery.items).map((it, idx) => (
                          <div key={`${delivery.ordersId}-${idx}`} style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
                            <span>{it.name}</span>
                            <span style={{ fontWeight: 700, color: 'var(--text)' }}>x{it.quantity}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

export default DeliveryDashboard;
