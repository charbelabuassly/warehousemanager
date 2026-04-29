import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Tags, Edit, Trash, Search, Plus } from 'lucide-react';

const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [formData, setFormData] = useState({});

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const res = await api.get('/Category');
      let normalizedData = Array.isArray(res.data) ? res.data : 
        (res.data?.$values ? res.data.$values : []);
      setCategories(normalizedData);
    } catch (err) {
      console.error('Error fetching categories:', err);
      setError('Failed to fetch categories');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    try {
      setLoading(true);
      const params = searchQuery.trim() ? { name: searchQuery.trim() } : {};
      const res = await api.get('/Category/search', { params });
      let normalizedData = Array.isArray(res.data) ? res.data : 
        (res.data?.$values ? res.data.$values : []);
      setCategories(normalizedData);
    } catch (err) {
      console.error('Error searching categories:', err);
      setError('Failed to search categories');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this category?')) return;
    try {
      await api.delete(`/Category/${id}`);
      fetchCategories();
    } catch (err) {
      console.error('Error deleting category:', err);
      alert('Error deleting category');
    }
  };

  const handleEdit = (category) => {
    setEditingCategory(category);
    setFormData(category);
    setIsModalOpen(true);
  };

  const handleAddNew = () => {
    setEditingCategory(null);
    setFormData({});
    setIsModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      if (editingCategory) {
        const id = editingCategory.categoryId || editingCategory.CategoryId || editingCategory.id || editingCategory.Id;
        await api.put(`/Category/${id}`, formData);
      } else {
        await api.post('/Category', formData);
      }
      setIsModalOpen(false);
      setEditingCategory(null);
      setFormData({});
      fetchCategories();
    } catch (err) {
      console.error('Error saving category:', err);
      alert('Error saving category');
    }
  };

  const getCategoryId = (category) => {
    return category.categoryId || category.CategoryId || category.id || category.Id;
  };

  const getCategoryField = (category, field) => {
    const fieldMap = {
      name: category.name || category.Name,
      description: category.description || category.Description
    };
    return fieldMap[field];
  };

  if (loading) return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading categories...</div>;
  if (error) return <div style={{ padding: '2rem', color: 'red' }}>Error: {error}</div>;

  return (
    <div style={{ padding: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: '700' }}>Category Management</h2>
        <button className="btn-primary" onClick={handleAddNew}>
          <Plus size={16} style={{ marginRight: '0.5rem' }} />
          Add Category
        </button>
      </div>

      <div style={{ marginBottom: '1.5rem', display: 'flex', gap: '1rem', alignItems: 'center' }}>
        <input
          type="text"
          placeholder="Search categories..."
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
        <button className="btn-outline" onClick={handleSearch}>
          <Search size={16} style={{ marginRight: '0.5rem' }} />
          Search
        </button>
        <button 
          className="btn-ghost" 
          onClick={() => { setSearchQuery(''); fetchCategories(); }}
        >
          Clear
        </button>
      </div>

      <div className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: 'rgba(255,255,255,0.02)' }}>
              <th style={{ textAlign: 'left', padding: '1.25rem 1.5rem', color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase' }}>Name</th>
              <th style={{ textAlign: 'left', padding: '1.25rem 1.5rem', color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase' }}>Description</th>
              <th style={{ textAlign: 'right', padding: '1.25rem 1.5rem', color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {categories.length === 0 ? (
              <tr>
                <td colSpan={3} style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>
                  <div style={{ opacity: 0.5, marginBottom: '1rem' }}>
                    <Tags size={48} style={{ margin: '0 auto' }} />
                  </div>
                  No categories found
                </td>
              </tr>
            ) : (
              categories.map((category) => (
                <tr key={getCategoryId(category)} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '1.25rem 1.5rem', fontWeight: '600' }}>
                    {getCategoryField(category, 'name')}
                  </td>
                  <td style={{ padding: '1.25rem 1.5rem' }}>
                    <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                      {getCategoryField(category, 'description') || 'No description'}
                    </div>
                  </td>
                  <td style={{ padding: '1.25rem 1.5rem', textAlign: 'right' }}>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                      <button className="btn-icon" onClick={() => handleEdit(category)}>
                        <Edit size={16} />
                      </button>
                      <button className="btn-icon btn-danger" onClick={() => handleDelete(getCategoryId(category))}>
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
          <div className="glass-card" style={{ padding: '2rem', minWidth: '400px', maxWidth: '500px' }}>
            <h3 style={{ marginBottom: '1.5rem', fontSize: '1.25rem', fontWeight: '700' }}>
              {editingCategory ? 'Edit Category' : 'Add New Category'}
            </h3>
            <form onSubmit={handleSave}>
              <div style={{ marginBottom: '1rem' }}>
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
                  {editingCategory ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Categories;
