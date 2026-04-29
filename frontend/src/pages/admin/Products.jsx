import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Package, Edit, Trash, Search, Plus, TrendingUp } from 'lucide-react';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [revenueData, setRevenueData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchFilters, setSearchFilters] = useState({
    categoryId: '',
    minPrice: '',
    maxPrice: '',
    minQty: '',
    maxQty: ''
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState({});
  const [isStockModalOpen, setIsStockModalOpen] = useState(false);
  const [stockProduct, setStockProduct] = useState(null);
  const [stockAmount, setStockAmount] = useState('');
  const [stockLoading, setStockLoading] = useState(false);

  useEffect(() => {
    fetchProducts();
    fetchCategories();
    fetchRevenueData();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await api.get('/Product');
      let normalizedData = Array.isArray(res.data) ? res.data : 
        (res.data?.$values ? res.data.$values : []);
      setProducts(normalizedData);
    } catch (err) {
      console.error('Error fetching products:', err);
      setError('Failed to fetch products');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await api.get('/Category');
      let normalizedData = Array.isArray(res.data) ? res.data : 
        (res.data?.$values ? res.data.$values : []);
      setCategories(normalizedData);
    } catch (err) {
      console.error('Error fetching categories:', err);
    }
  };

  const fetchRevenueData = async () => {
    try {
      const res = await api.get('/Report/all-products-report');
      let normalizedData = Array.isArray(res.data) ? res.data : 
        (res.data?.$values ? res.data.$values : []);
      setRevenueData(normalizedData);
    } catch (err) {
      console.error('Error fetching revenue data:', err);
    }
  };

  const handleSearch = async () => {
    try {
      setLoading(true);
      const params = {};
      
      if (searchQuery.trim()) params.name = searchQuery.trim();
      if (searchFilters.categoryId) params.categoryId = searchFilters.categoryId;
      if (searchFilters.minPrice) params.minPrice = searchFilters.minPrice;
      if (searchFilters.maxPrice) params.maxPrice = searchFilters.maxPrice;
      if (searchFilters.minQty) params.minQty = searchFilters.minQty;
      if (searchFilters.maxQty) params.maxQty = searchFilters.maxQty;

      const res = await api.get('/Product/search', { params });
      let normalizedData = Array.isArray(res.data) ? res.data : 
        (res.data?.$values ? res.data.$values : []);
      setProducts(normalizedData);
    } catch (err) {
      console.error('Error searching products:', err);
      setError('Failed to search products');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    try {
      await api.delete(`/Product/${id}`);
      fetchProducts();
      fetchRevenueData();
    } catch (err) {
      console.error('Error deleting product:', err);
      alert('Error deleting product');
    }
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setFormData(product);
    setIsModalOpen(true);
  };

  const handleAddNew = () => {
    setEditingProduct(null);
    setFormData({});
    setIsModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      if (editingProduct) {
        const id = editingProduct.productsId || editingProduct.ProductsId || editingProduct.id || editingProduct.Id;
        await api.put(`/Product/${id}`, formData);
      } else {
        await api.post('/Product', formData);
      }
      setIsModalOpen(false);
      setEditingProduct(null);
      setFormData({});
      fetchProducts();
      fetchRevenueData();
    } catch (err) {
      console.error('Error saving product:', err);
      alert('Error saving product');
    }
  };

  const getProductId = (product) => {
    return product.productsId || product.ProductsId || product.id || product.Id;
  };

  const getProductField = (product, field) => {
    const fieldMap = {
      name: product.name || product.Name,
      price: product.price || product.Price,
      quantity: product.quantity || product.Quantity,
      description: product.description || product.Description,
      categoryId: product.categoryId || product.CategoryId
    };
    return fieldMap[field];
  };

  const getCategoryName = (categoryId) => {
    const category = categories.find(cat => 
      (cat.categoryId || cat.CategoryId || cat.id || cat.Id) === categoryId
    );
    return category ? (category.name || category.Name) : 'Uncategorized';
  };

  const getRevenueForProduct = (productId) => {
    const match = revenueData.find((r) => (r.productId || r.ProductId) === productId);
    return match ? (match.revenue || match.Revenue || 0) : 0;
  };

  const handleOpenStockModal = (product) => {
    setStockProduct(product);
    setStockAmount('');
    setIsStockModalOpen(true);
  };

  const handleAddStock = async (e) => {
    e.preventDefault();
    try {
      if (!stockProduct) return;
      const id = getProductId(stockProduct);
      const amount = parseInt(stockAmount, 10);
      if (!Number.isFinite(amount) || amount <= 0) {
        alert('Please enter a positive stock amount.');
        return;
      }

      setStockLoading(true);
      await api.patch(`/Product/${id}/stock`, { amount });
      setIsStockModalOpen(false);
      setStockProduct(null);
      setStockAmount('');
      fetchProducts();
      fetchRevenueData();
    } catch (err) {
      console.error('Error adding stock:', err);
      alert('Error adding stock');
    } finally {
      setStockLoading(false);
    }
  };

  if (loading) return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading products...</div>;
  if (error) return <div style={{ padding: '2rem', color: 'red' }}>Error: {error}</div>;

  return (
    <div style={{ padding: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: '700' }}>Product Management</h2>
        <button className="btn-primary" onClick={handleAddNew}>
          <Plus size={16} style={{ marginRight: '0.5rem' }} />
          Add Product
        </button>
      </div>

      {/* Revenue Performance Section */}
      {revenueData.length > 0 && (
        <div className="glass-card animate-fade-in" style={{ marginBottom: '2rem', padding: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
            <div style={{ background: 'var(--success)', padding: '0.5rem', borderRadius: '8px', color: 'white' }}>
              <TrendingUp size={20} />
            </div>
            <h3 style={{ fontWeight: '700' }}>Product Revenue Performance (Top Sellers)</h3>
          </div>
          <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem' }}>
            {revenueData.slice(0, 4).map((item) => (
              <div key={item.productId || item.ProductId} style={{ background: 'rgba(255,255,255,0.03)', padding: '1rem', borderRadius: '12px', border: '1px solid var(--border)' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {item.productName || item.ProductName}
                </div>
                <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
                  <div style={{ fontSize: '1.25rem', fontWeight: '800', color: 'var(--primary)' }}>
                    ${Number(item.revenue || item.Revenue || 0).toFixed(2)}
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

      {/* Search and Filters */}
      <div style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap' }}>
          <input
            type="text"
            placeholder="Search products..."
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
          <select
            value={searchFilters.categoryId}
            onChange={(e) => setSearchFilters({ ...searchFilters, categoryId: e.target.value })}
            style={{
              padding: '0.75rem 1rem',
              border: '1px solid var(--border)',
              borderRadius: '8px',
              background: 'var(--background)',
              color: 'var(--text)',
              fontSize: '0.875rem'
            }}
          >
            <option value="">All Categories</option>
            {categories.map(cat => (
              <option key={getProductId(cat)} value={getProductId(cat)}>
                {cat.name || cat.Name}
              </option>
            ))}
          </select>
          <input
            type="number"
            placeholder="Min Price"
            value={searchFilters.minPrice}
            onChange={(e) => setSearchFilters({ ...searchFilters, minPrice: e.target.value })}
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
            placeholder="Max Price"
            value={searchFilters.maxPrice}
            onChange={(e) => setSearchFilters({ ...searchFilters, maxPrice: e.target.value })}
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
          <button className="btn-outline" onClick={handleSearch}>
            <Search size={16} style={{ marginRight: '0.5rem' }} />
            Search
          </button>
          <button 
            className="btn-ghost" 
            onClick={() => { 
              setSearchQuery(''); 
              setSearchFilters({ categoryId: '', minPrice: '', maxPrice: '', minQty: '', maxQty: '' });
              fetchProducts(); 
            }}
          >
            Clear
          </button>
        </div>
      </div>

      {/* Products Table */}
      <div className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: 'rgba(255,255,255,0.02)' }}>
              <th style={{ textAlign: 'left', padding: '1.25rem 1.5rem', color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase' }}>Product</th>
              <th style={{ textAlign: 'left', padding: '1.25rem 1.5rem', color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase' }}>Category</th>
              <th style={{ textAlign: 'left', padding: '1.25rem 1.5rem', color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase' }}>Price</th>
              <th style={{ textAlign: 'left', padding: '1.25rem 1.5rem', color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase' }}>Quantity</th>
              <th style={{ textAlign: 'right', padding: '1.25rem 1.5rem', color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase' }}>Revenue</th>
              <th style={{ textAlign: 'right', padding: '1.25rem 1.5rem', color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>
                  <div style={{ opacity: 0.5, marginBottom: '1rem' }}>
                    <Package size={48} style={{ margin: '0 auto' }} />
                  </div>
                  No products found
                </td>
              </tr>
            ) : (
              products.map((product) => (
                <tr key={getProductId(product)} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '1.25rem 1.5rem' }}>
                    <div style={{ fontWeight: '600' }}>{getProductField(product, 'name')}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      ID: #{getProductId(product)}
                    </div>
                  </td>
                  <td style={{ padding: '1.25rem 1.5rem' }}>
                    <span className="badge badge-warning">
                      {getCategoryName(getProductField(product, 'categoryId'))}
                    </span>
                  </td>
                  <td style={{ padding: '1.25rem 1.5rem', fontWeight: '600' }}>
                    ${Number(getProductField(product, 'price') || 0).toFixed(2)}
                  </td>
                  <td style={{ padding: '1.25rem 1.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span>{getProductField(product, 'quantity') || 0}</span>
                      {(getProductField(product, 'quantity') || 0) < 10 && (
                        <span style={{ fontSize: '0.75rem', color: 'var(--warning)' }}>Low Stock</span>
                      )}
                    </div>
                  </td>
                  <td style={{ padding: '1.25rem 1.5rem', textAlign: 'right', fontWeight: '700', color: 'var(--success)' }}>
                    ${Number(getRevenueForProduct(getProductId(product)) || 0).toFixed(2)}
                  </td>
                  <td style={{ padding: '1.25rem 1.5rem', textAlign: 'right' }}>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                      <button className="btn-icon" title="Add Stock" onClick={() => handleOpenStockModal(product)}>
                        <TrendingUp size={16} />
                      </button>
                      <button className="btn-icon" onClick={() => handleEdit(product)}>
                        <Edit size={16} />
                      </button>
                      <button className="btn-icon btn-danger" onClick={() => handleDelete(getProductId(product))}>
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

      {/* Modal for Add/Edit Product */}
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
              {editingProduct ? 'Edit Product' : 'Add New Product'}
            </h3>
            <form onSubmit={handleSave}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: '600' }}>Name</label>
                  <input
                    type="text"
                    value={formData.name || formData.Name || ''}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
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
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: '600' }}>Category</label>
                  <select
                    value={formData.categoryId || formData.CategoryId || ''}
                    onChange={(e) => setFormData({ ...formData, categoryId: parseInt(e.target.value) })}
                    required
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: '1px solid var(--border)',
                      borderRadius: '8px',
                      background: 'var(--background)',
                      color: 'var(--text)'
                    }}
                  >
                    <option value="">Select Category</option>
                    {categories.map(cat => (
                      <option key={getProductId(cat)} value={getProductId(cat)}>
                        {cat.name || cat.Name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: '600' }}>Price</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.price || formData.Price || ''}
                    onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
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
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: '600' }}>Quantity</label>
                  <input
                    type="number"
                    value={formData.quantity || formData.Quantity || ''}
                    onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) })}
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
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: '600' }}>Description</label>
                <textarea
                  value={formData.description || formData.Description || ''}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid var(--border)',
                    borderRadius: '8px',
                    background: 'var(--background)',
                    color: 'var(--text)',
                    resize: 'vertical'
                  }}
                />
              </div>
              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                <button type="button" className="btn-ghost" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  {editingProduct ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isStockModalOpen && (
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
          <div className="glass-card" style={{ padding: '2rem', minWidth: '420px', maxWidth: '520px' }}>
            <h3 style={{ marginBottom: '1rem', fontSize: '1.25rem', fontWeight: '700' }}>
              Add Stock
            </h3>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '1.25rem' }}>
              {stockProduct ? (getProductField(stockProduct, 'name') || `#${getProductId(stockProduct)}`) : 'Product'}
            </div>
            <form onSubmit={handleAddStock}>
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: '600' }}>Amount</label>
                <input
                  type="number"
                  min="1"
                  value={stockAmount}
                  onChange={(e) => setStockAmount(e.target.value)}
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
              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  className="btn-ghost"
                  onClick={() => { setIsStockModalOpen(false); setStockProduct(null); setStockAmount(''); }}
                  disabled={stockLoading}
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary" disabled={stockLoading}>
                  {stockLoading ? 'Adding…' : 'Add Stock'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Products;
