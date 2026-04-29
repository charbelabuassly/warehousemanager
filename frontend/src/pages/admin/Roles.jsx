import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { UserCheck, Edit, Trash, Search, Plus } from 'lucide-react';

const Roles = () => {
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRole, setEditingRole] = useState(null);
  const [formData, setFormData] = useState({});

  useEffect(() => {
    fetchRoles();
  }, []);

  const fetchRoles = async () => {
    try {
      setLoading(true);
      const res = await api.get('/Role');
      let normalizedData = Array.isArray(res.data) ? res.data : 
        (res.data?.$values ? res.data.$values : []);
      setRoles(normalizedData);
    } catch (err) {
      console.error('Error fetching roles:', err);
      setError('Failed to fetch roles');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    try {
      setLoading(true);
      const params = searchQuery.trim() ? { roleName: searchQuery.trim() } : {};
      const res = await api.get('/Role/search', { params });
      let normalizedData = Array.isArray(res.data) ? res.data : 
        (res.data?.$values ? res.data.$values : []);
      setRoles(normalizedData);
    } catch (err) {
      console.error('Error searching roles:', err);
      setError('Failed to search roles');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this role?')) return;
    try {
      await api.delete(`/Role/${id}`);
      fetchRoles();
    } catch (err) {
      console.error('Error deleting role:', err);
      alert('Error deleting role');
    }
  };

  const handleEdit = (role) => {
    setEditingRole(role);
    setFormData(role);
    setIsModalOpen(true);
  };

  const handleAddNew = () => {
    setEditingRole(null);
    setFormData({});
    setIsModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      if (editingRole) {
        const id = editingRole.roleId || editingRole.RoleId || editingRole.id || editingRole.Id;
        await api.put(`/Role/${id}`, formData);
      } else {
        await api.post('/Role', formData);
      }
      setIsModalOpen(false);
      setEditingRole(null);
      setFormData({});
      fetchRoles();
    } catch (err) {
      console.error('Error saving role:', err);
      alert('Error saving role');
    }
  };

  const getRoleId = (role) => {
    return role.roleId || role.RoleId || role.id || role.Id;
  };

  const getRoleField = (role, field) => {
    const fieldMap = {
      roleName: role.roleName || role.RoleName,
      description: role.description || role.Description
    };
    return fieldMap[field];
  };

  if (loading) return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading roles...</div>;
  if (error) return <div style={{ padding: '2rem', color: 'red' }}>Error: {error}</div>;

  return (
    <div style={{ padding: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: '700' }}>Role Management</h2>
        <button className="btn-primary" onClick={handleAddNew}>
          <Plus size={16} style={{ marginRight: '0.5rem' }} />
          Add Role
        </button>
      </div>

      <div style={{ marginBottom: '1.5rem', display: 'flex', gap: '1rem', alignItems: 'center' }}>
        <input
          type="text"
          placeholder="Search roles..."
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
          onClick={() => { setSearchQuery(''); fetchRoles(); }}
        >
          Clear
        </button>
      </div>

      <div className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: 'rgba(255,255,255,0.02)' }}>
              <th style={{ textAlign: 'left', padding: '1.25rem 1.5rem', color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase' }}>Role Name</th>
              <th style={{ textAlign: 'left', padding: '1.25rem 1.5rem', color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase' }}>Description</th>
              <th style={{ textAlign: 'right', padding: '1.25rem 1.5rem', color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {roles.length === 0 ? (
              <tr>
                <td colSpan={3} style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>
                  <div style={{ opacity: 0.5, marginBottom: '1rem' }}>
                    <UserCheck size={48} style={{ margin: '0 auto' }} />
                  </div>
                  No roles found
                </td>
              </tr>
            ) : (
              roles.map((role) => (
                <tr key={getRoleId(role)} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '1.25rem 1.5rem', fontWeight: '600' }}>
                    {getRoleField(role, 'roleName')}
                  </td>
                  <td style={{ padding: '1.25rem 1.5rem' }}>
                    <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                      {getRoleField(role, 'description') || 'No description'}
                    </div>
                  </td>
                  <td style={{ padding: '1.25rem 1.5rem', textAlign: 'right' }}>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                      <button className="btn-icon" onClick={() => handleEdit(role)}>
                        <Edit size={16} />
                      </button>
                      <button className="btn-icon btn-danger" onClick={() => handleDelete(getRoleId(role))}>
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
              {editingRole ? 'Edit Role' : 'Add New Role'}
            </h3>
            <form onSubmit={handleSave}>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: '600' }}>Role Name</label>
                <input
                  type="text"
                  value={formData.roleName || formData.RoleName || ''}
                  onChange={(e) => setFormData({ ...formData, roleName: e.target.value })}
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
                  {editingRole ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Roles;
