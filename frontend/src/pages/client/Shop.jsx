import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { ShoppingCart, User, LogOut, Package, Search } from 'lucide-react';

function ClientShop() {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [qtyOpen, setQtyOpen] = useState(false);
  const [qtyProduct, setQtyProduct] = useState(null);
  const [qtyValue, setQtyValue] = useState(1);
  const [placingOrder, setPlacingOrder] = useState(false);
  const [orderError, setOrderError] = useState('');
  const [address, setAddress] = useState({ street: '', city: '', country: '' });
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
    setQtyProduct(product);
    setQtyValue(1);
    setQtyOpen(true);
  };

  const confirmAddToCart = () => {
    if (!qtyProduct) return;
    const maxQty = Number(getProductQty(qtyProduct) ?? 0);
    const qty = Math.max(1, Math.min(Number(qtyValue) || 1, maxQty || 1));
    setCart((prev) => [...prev, ...Array.from({ length: qty }, () => qtyProduct)]);
    setQtyOpen(false);
    setQtyProduct(null);
  };

  const removeFromCart = (productId) => {
    setCart((prev) => {
      const idx = prev.findIndex((p) => getProductId(p) === productId);
      if (idx === -1) return prev;
      const copy = prev.slice();
      copy.splice(idx, 1);
      return copy;
    });
  };

  const clearCart = () => setCart([]);

  const cartLines = cart.reduce((acc, p) => {
    const id = getProductId(p);
    if (id == null) return acc;
    const existing = acc.get(id) || { product: p, quantity: 0 };
    existing.quantity += 1;
    acc.set(id, existing);
    return acc;
  }, new Map());

  const cartItems = Array.from(cartLines.values());
  const cartTotal = cartItems.reduce((sum, line) => sum + Number(getProductPrice(line.product) || 0) * line.quantity, 0);

  const placeOrder = async () => {
    if (cartItems.length === 0) return;
    if (!address.street.trim() || !address.city.trim() || !address.country.trim()) {
      setOrderError('Please fill in delivery address (street, city, country).');
      return;
    }

    try {
      setOrderError('');
      setPlacingOrder(true);

      const payload = {
        address: {
          street: address.street.trim(),
          city: address.city.trim(),
          country: address.country.trim(),
        },
        items: cartItems.map((line) => ({
          productId: getProductId(line.product),
          quantity: line.quantity,
        })),
      };

      await api.post('/Order', payload);
      clearCart();
      setCartOpen(false);
    } catch (err) {
      console.error('Error placing order:', err);
      setOrderError(
        err?.response?.data?.message ||
          err?.response?.data?.Message ||
          err?.response?.data?.title ||
          err?.response?.data?.Title ||
          'Failed to place order.'
      );
    } finally {
      setPlacingOrder(false);
    }
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
          <button className="btn-ghost" style={{ position: 'relative' }} onClick={() => setCartOpen(true)} title="Open cart">
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

      {/* Quantity modal (shown when adding to cart) */}
      {qtyOpen && qtyProduct && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '1rem',
          }}
          onClick={() => !placingOrder && setQtyOpen(false)}
        >
          <div
            className="glass-card"
            style={{ width: 'min(520px, 100%)', padding: '1.5rem' }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ marginTop: 0, fontSize: '1.25rem', fontWeight: 800 }}>Add to Cart</h3>
            <div style={{ color: 'var(--text-muted)', marginBottom: '1rem' }}>
              {getProductName(qtyProduct)}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
              <button
                className="btn-outline"
                onClick={() => setQtyValue((v) => Math.max(1, (Number(v) || 1) - 1))}
              >
                -
              </button>
              <input
                type="number"
                min={1}
                max={Math.max(1, Number(getProductQty(qtyProduct) ?? 1))}
                value={qtyValue}
                onChange={(e) => setQtyValue(e.target.value)}
                style={{ width: '120px', textAlign: 'center' }}
              />
              <button
                className="btn-outline"
                onClick={() => setQtyValue((v) => {
                  const max = Math.max(1, Number(getProductQty(qtyProduct) ?? 1));
                  return Math.min(max, (Number(v) || 1) + 1);
                })}
              >
                +
              </button>
              <div style={{ marginLeft: 'auto', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                In stock: {getProductQty(qtyProduct)}
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
              <button className="btn-ghost" onClick={() => setQtyOpen(false)}>Cancel</button>
              <button className="btn-primary" onClick={confirmAddToCart}>Add</button>
            </div>
          </div>
        </div>
      )}

      {/* Cart modal */}
      {cartOpen && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '1rem',
          }}
          onClick={() => !placingOrder && setCartOpen(false)}
        >
          <div
            className="glass-card"
            style={{ width: 'min(820px, 100%)', padding: '1.5rem' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <ShoppingCart size={20} /> Cart
              </h3>
              <button className="btn-ghost" onClick={() => !placingOrder && setCartOpen(false)}>
                Close
              </button>
            </div>

            {cartItems.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                Your cart is empty.
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: '1.25fr 0.75fr', gap: '1rem' }}>
                <div style={{ border: '1px solid var(--border)', borderRadius: '12px', overflow: 'hidden' }}>
                  <div style={{ padding: '0.75rem 1rem', borderBottom: '1px solid var(--border)', fontWeight: 700 }}>
                    Items
                  </div>
                  <div style={{ padding: '0.75rem 1rem', display: 'grid', gap: '0.75rem' }}>
                    {cartItems.map((line) => {
                      const id = getProductId(line.product);
                      return (
                        <div key={id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div style={{ minWidth: 0 }}>
                            <div style={{ fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              {getProductName(line.product)}
                            </div>
                            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                              Qty: {line.quantity} • ${Number(getProductPrice(line.product) || 0).toFixed(2)} each
                            </div>
                          </div>
                          <button className="btn-ghost danger" onClick={() => removeFromCart(id)} title="Remove 1">
                            Remove
                          </button>
                        </div>
                      );
                    })}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '0.75rem', borderTop: '1px solid var(--border)' }}>
                      <div style={{ fontWeight: 800 }}>Total</div>
                      <div style={{ fontWeight: 900, color: 'var(--primary)' }}>${cartTotal.toFixed(2)}</div>
                    </div>
                    <button className="btn-outline" onClick={clearCart} disabled={placingOrder}>
                      Clear cart
                    </button>
                  </div>
                </div>

                <div style={{ border: '1px solid var(--border)', borderRadius: '12px', overflow: 'hidden' }}>
                  <div style={{ padding: '0.75rem 1rem', borderBottom: '1px solid var(--border)', fontWeight: 700 }}>
                    Delivery Address
                  </div>
                  <div style={{ padding: '0.75rem 1rem', display: 'grid', gap: '0.75rem' }}>
                    <input
                      placeholder="Street"
                      value={address.street}
                      onChange={(e) => setAddress({ ...address, street: e.target.value })}
                      disabled={placingOrder}
                    />
                    <input
                      placeholder="City"
                      value={address.city}
                      onChange={(e) => setAddress({ ...address, city: e.target.value })}
                      disabled={placingOrder}
                    />
                    <input
                      placeholder="Country"
                      value={address.country}
                      onChange={(e) => setAddress({ ...address, country: e.target.value })}
                      disabled={placingOrder}
                    />

                    {orderError && (
                      <div style={{ color: 'var(--error)', fontSize: '0.875rem' }}>
                        {orderError}
                      </div>
                    )}

                    <button className="btn-primary" onClick={placeOrder} disabled={placingOrder || cartItems.length === 0}>
                      {placingOrder ? 'Placing order...' : 'Place Order'}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default ClientShop;
