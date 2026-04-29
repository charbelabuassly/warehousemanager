import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { ShoppingCart, User, LogOut, Package, Search } from 'lucide-react';

function ClientShop() {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');

  const getProductId = (p) => p?.productsId ?? p?.ProductsId ?? p?.id ?? p?.Id;
  const getProductName = (p) => p?.name ?? p?.Name ?? 'Unnamed product';
  const getProductDescription = (p) => p?.description ?? p?.Description ?? '';
  const getProductPrice = (p) => p?.price ?? p?.Price ?? 0;
  const getProductQty = (p) => p?.quantity ?? p?.Quantity ?? 0;

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setError('');
      const { data } = await api.get('/Shop');
      const list = Array.isArray(data) ? data : (Array.isArray(data?.$values) ? data.$values : []);
      setProducts(list);
    } catch (err) {
      console.error('Error fetching shop items:', err);
      const message =
        err?.response?.data?.detail ||
        err?.response?.data?.Detail ||
        err?.response?.data?.title ||
        err?.response?.data?.Title ||
        err?.response?.data?.message ||
        err?.response?.data?.Message ||
        (err?.message === 'Network Error'
          ? 'Cannot reach the backend API. If you are running locally, start the .NET backend and use the Vite proxy (/api).'
          : 'Failed to load products.');
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const addToCart = (product) => {
    setCart([...cart, product]);
  };

  const logout = () => {
    localStorage.clear();
    window.location.reload();
  };

  const filtered = products.filter((p) => {
    const q = query.trim().toLowerCase();
    if (!q) return true;
    return (
      String(getProductName(p)).toLowerCase().includes(q) ||
      String(getProductDescription(p)).toLowerCase().includes(q)
    );
  });

  return (
    <div style={{ background: 'var(--background)', minHeight: '100vh' }}>
      {/* Navbar */}
      <nav style={{ 
        background: 'var(--surface)', 
        borderBottom: '1px solid var(--border)',
        padding: '1rem 2rem',
        position: 'sticky',
        top: 0,
        zIndex: 10,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Package color="var(--primary)" />
          <h1 style={{ fontWeight: '800', fontSize: '1.25rem' }}>LogiStore</h1>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <div style={{ position: 'relative' }}>
            <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input 
              placeholder="Search products..." 
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              style={{ width: '300px', paddingLeft: '2.5rem', background: 'var(--background)' }}
            />
          </div>
          <button className="btn-ghost" style={{ position: 'relative' }}>
            <ShoppingCart />
            {cart.length > 0 && (
              <span style={{ 
                position: 'absolute', 
                top: '-8px', 
                right: '-8px', 
                background: 'var(--primary)', 
                color: 'white', 
                borderRadius: '50%', 
                width: '20px', 
                height: '20px', 
                fontSize: '0.75rem', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center' 
              }}>
                {cart.length}
              </span>
            )}
          </button>
          <button onClick={logout} className="btn-ghost danger" title="Logout">
            <LogOut />
          </button>
        </div>
      </nav>

      {/* Hero */}
      <header style={{ 
        padding: '4rem 2rem', 
        textAlign: 'center', 
        background: 'linear-gradient(rgba(99, 102, 241, 0.1), transparent)' 
      }}>
        <h2 style={{ fontSize: '3rem', fontWeight: '800', marginBottom: '1rem' }}>Premium Logistics Solutions</h2>
        <p style={{ color: 'var(--text-muted)', maxWidth: '600px', margin: '0 auto' }}>
          Order your supplies with ease and track them in real-time.
        </p>
      </header>

      {/* Product Grid */}
      <main className="container">
        {loading ? (
          <div style={{ textAlign: 'center', padding: '4rem' }}>Loading products...</div>
        ) : error ? (
          <div className="glass-card" style={{ padding: '2rem', textAlign: 'center', borderColor: 'rgba(239, 68, 68, 0.35)' }}>
            <h3 style={{ marginBottom: '0.5rem' }}>Unable to load products</h3>
            <p style={{ color: 'var(--text-muted)', marginBottom: '1.25rem' }}>{error}</p>
            <button className="btn-outline" onClick={() => { setLoading(true); fetchProducts(); }}>
              Retry
            </button>
          </div>
        ) : filtered.length === 0 ? (
          <div className="glass-card" style={{ padding: '3rem', textAlign: 'center' }}>
            <div style={{ opacity: 0.35, marginBottom: '1rem' }}><Package size={56} /></div>
            <h3 style={{ marginBottom: '0.5rem' }}>No products found</h3>
            <p style={{ color: 'var(--text-muted)' }}>
              {query ? 'Try a different search.' : 'Ask an admin to add products in the dashboard.'}
            </p>
          </div>
        ) : (
          <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))' }}>
            {filtered.map(product => (
              <div key={getProductId(product) ?? JSON.stringify(product)} className="glass-card animate-fade-in" style={{ padding: '1rem' }}>
                <div style={{ 
                  height: '200px', 
                  background: 'var(--surface)', 
                  borderRadius: '8px', 
                  marginBottom: '1rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Package size={64} style={{ opacity: 0.2 }} />
                </div>
                <h3 style={{ fontWeight: '700', marginBottom: '0.5rem' }}>{getProductName(product)}</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '1rem', height: '3rem', overflow: 'hidden' }}>
                  {getProductDescription(product) || 'No description available for this item.'}
                </p>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '1.25rem', fontWeight: '800', color: 'var(--primary)' }}>
                    ${Number(getProductPrice(product) ?? 0).toFixed(2)}
                  </span>
                  <button
                    onClick={() => addToCart(product)}
                    className="btn-primary"
                    style={{ padding: '0.5rem 1rem' }}
                    disabled={Number(getProductQty(product) ?? 0) <= 0}
                    title={Number(getProductQty(product) ?? 0) <= 0 ? 'Out of stock' : 'Add to Cart'}
                  >
                    Add to Cart
                  </button>
                </div>
                <div style={{ marginTop: '0.75rem', display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                  <span>{Number(getProductQty(product) ?? 0) > 0 ? `${getProductQty(product)} in stock` : 'Out of stock'}</span>
                  <span>Product #{getProductId(product) ?? '—'}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

export default ClientShop;
