import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Truck, Calendar, MapPin, CheckCircle, LogOut, Package, User } from 'lucide-react';

function DeliveryDashboard() {
  const [deliveries, setDeliveries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDeliveries();
  }, []);

  const fetchDeliveries = async () => {
    try {
      const { data } = await api.get('/Delivery/orders');
      const list = Array.isArray(data) ? data : (Array.isArray(data?.$values) ? data.$values : []);
      setDeliveries(list);
    } catch (err) {
      console.error('Error fetching deliveries:', err);
    } finally {
      setLoading(false);
    }
  };

  const markAsDelivered = async (orderId) => {
    try {
      // Logic to update delivery status
      alert(`Order ${orderId} marked as delivered!`);
      setDeliveries(deliveries.filter(d => d.ordersId !== orderId));
    } catch (err) {
      console.error('Error updating delivery:', err);
    }
  };

  const logout = () => {
    localStorage.clear();
    window.location.reload();
  };

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
        <h2 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Calendar size={20} color="var(--primary)" />
          Today's Deliveries
        </h2>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '4rem' }}>Loading schedule...</div>
        ) : deliveries.length === 0 ? (
          <div className="glass-card" style={{ textAlign: 'center', padding: '4rem' }}>
            <CheckCircle size={48} color="var(--success)" style={{ marginBottom: '1rem', opacity: 0.5 }} />
            <h3>All caught up!</h3>
            <p style={{ color: 'var(--text-muted)' }}>No pending deliveries for today.</p>
          </div>
        ) : (
          <div className="grid">
            {deliveries.map(delivery => (
              <div key={delivery.ordersId} className="glass-card animate-fade-in" style={{ padding: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                  <div>
                    <span className="badge badge-warning" style={{ marginBottom: '0.5rem', display: 'inline-block' }}>Pending</span>
                    <h3 style={{ fontWeight: '700' }}>Order #{delivery.ordersId}</h3>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <p style={{ fontSize: '0.875rem', fontWeight: '600', color: 'var(--primary)' }}>
                      {new Date(delivery.schedule).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>

                <div style={{ display: 'grid', gap: '0.75rem', marginBottom: '1.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--text-muted)' }}>
                    <User size={18} />
                    <span>Customer ID: {delivery.clientId}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--text-muted)' }}>
                    <MapPin size={18} />
                    <span>Destination: Warehouse Zone A</span>
                  </div>
                </div>

                <button 
                  onClick={() => markAsDelivered(delivery.ordersId)}
                  className="btn-primary" 
                  style={{ width: '100%', gap: '0.75rem' }}
                >
                  <CheckCircle size={18} />
                  Complete Delivery
                </button>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

export default DeliveryDashboard;
