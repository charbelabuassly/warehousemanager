"use client"

import React, { useState, useEffect } from 'react';
import api from '../../lib/api';
import { Package, Edit, Trash, Search, Plus } from 'lucide-react';

const Users = () => {
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    roleId: '',
    isActive: '',
    city: '',
    country: '',
  });
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [totalCount, setTotalCount] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({});

  const pickFirstDefined = (...values) => values.find((v) => v !== undefined && v !== null);

  const normalizeUserForUI = (user) => {
    if (!user || typeof user !== 'object') return user;

    const usersId = pickFirstDefined(user.usersId, user.UsersId, user.userId, user.UserId, user.id, user.Id);
    const fname = pickFirstDefined(user.fname, user.Fname, user.fName, user.firstName, user.FirstName, '');
    const lname = pickFirstDefined(user.lname, user.Lname, user.lName, user.lastName, user.LastName, '');
    const email = pickFirstDefined(user.email, user.Email, '');

    const roleName = pickFirstDefined(
      user.role?.roleName,
      user.role?.RoleName,
      user.Role?.roleName,
      user.Role?.RoleName,
      user.roleName,
      user.RoleName,
      ''
    );

    return {
      ...user,
      usersId,
      fname,
      lname,
      email,
      roleName,
    };
  };

  const toEditFormPayload = (user) => {
    const normalized = normalizeUserForUI(user || {});
    const { Password, password, ...rest } = user || {};
    return {
      ...rest,
      UsersId: normalized.usersId ?? user?.UsersId,
      Fname: normalized.fname ?? user?.Fname,
      Lname: normalized.lname ?? user?.Lname,
      Email: normalized.email ?? user?.Email,
      RoleId: user?.RoleId ?? user?.roleId,
      IsActive: user?.IsActive ?? user?.isActive,
      Street: user?.Street ?? user?.street,
      City: user?.City ?? user?.city,
      Country: user?.Country ?? user?.country,
    };
  };

  const toUpdatePayload = (data) => {
    return {
      Fname: data?.Fname ?? data?.fname ?? '',
      Lname: data?.Lname ?? data?.lname ?? '',
      Email: data?.Email ?? data?.email ?? '',
      RoleId: data?.RoleId ?? data?.roleId ?? 1,
      IsActive: data?.IsActive ?? data?.isActive ?? true,
      Street: data?.Street ?? data?.street ?? '',
      City: data?.City ?? data?.city ?? '',
      Country: data?.Country ?? data?.country ?? '',
    };
  };

  useEffect(() => {
    fetchRoles();
    fetchUsers(1);
  }, []);

  const fetchRoles = async () => {
    try {
      const res = await api.get('/Role');
      const rolesData = Array.isArray(res.data)
        ? res.data
        : (Array.isArray(res.data?.$values) ? res.data.$values : []);
      setRoles(rolesData);
    } catch (err) {
      console.error('Error fetching roles:', err);
    }
  };

  const fetchUsers = async (requestedPage = page, requestedPageSize = pageSize) => {
    try {
      setLoading(true);
      const params = {
        page: requestedPage,
        pageSize: requestedPageSize,
      };

      if (searchQuery.trim()) params.q = searchQuery.trim();
      if (filters.roleId) params.roleId = filters.roleId;
      if (filters.isActive !== '') params.isActive = filters.isActive;
      if (filters.city.trim()) params.city = filters.city.trim();
      if (filters.country.trim()) params.country = filters.country.trim();

      const res = await api.get('/AccountManagement/search', { params });
      
      console.log('Raw response:', res);
      console.log('Response data:', res.data);
      console.log('Response data type:', typeof res.data);
      console.log('Is array:', Array.isArray(res.data));
      
      const items = res.data?.Items || res.data?.items;
      const usersData = Array.isArray(items)
        ? items
        : (Array.isArray(items?.$values) ? items.$values : []);

      setUsers(usersData.map(normalizeUserForUI));
      setTotalCount(res.data?.TotalCount ?? res.data?.totalCount ?? usersData.length);
      setPage(res.data?.Page ?? res.data?.page ?? requestedPage);
      setPageSize(res.data?.PageSize ?? res.data?.pageSize ?? requestedPageSize);
    } catch (err) {
      console.error('Error fetching users:', err);
      setError(err.response?.data?.message || 'Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    try {
      setLoading(true);
      await fetchUsers(1);
    } catch (err) {
      console.error('Error searching users:', err);
      setError(err.response?.data?.message || 'Failed to search users');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    try {
      await api.delete(`/AccountManagement/${id}`);
      fetchUsers(page);
    } catch (err) {
      console.error('Error deleting user:', err);
      alert('Error deleting user');
    }
  };

  const handleEdit = (user) => {
    setEditingUser(user);
    setFormData(toEditFormPayload(user));
    setIsModalOpen(true);
  };

  const handleAddNew = () => {
    setEditingUser(null);
    setFormData({});
    setIsModalOpen(true);
  };

  const handleRoleChange = async (user, newRoleId) => {
    try {
      const id = getUserId(user);
      if (!id) return;
      await api.patch(`/AccountManagement/${id}/role`, { roleId: newRoleId });
      fetchUsers(page);
    } catch (err) {
      console.error('Error updating role:', err);
      alert('Error updating role');
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      if (editingUser) {
        const id = editingUser.id || editingUser.Id || editingUser.userId || editingUser.UserId || editingUser.usersId || editingUser.UsersId;
        await api.put(`/AccountManagement/${id}`, toUpdatePayload(formData));
      } else {
        alert('Creating users from admin is not supported yet.');
        return;
      }
      setIsModalOpen(false);
      setEditingUser(null);
      setFormData({});
      fetchUsers(page);
    } catch (err) {
      console.error('Error saving user:', err);
      alert('Error saving user');
    }
  };

  const getUserId = (user) => {
    return user.usersId || user.UsersId || user.userId || user.UserId || user.id || user.Id;
  };

  const getUserField = (user, field) => {
    const u = normalizeUserForUI(user);
    const fieldMap = {
      name: `${u.fname || 'undefined'} ${u.lname || 'undefined'}`,
      email: u.email || 'undefined',
      role: u.roleName || 'undefined',
      phone: u.phone || u.Phone || 'N/A'
    };
    
    return fieldMap[field] || 'N/A';
  };

  if (loading) return (
    <div style={{ padding: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: '700' }}>User Management</h2>
        <div className="btn-primary" style={{ opacity: 0.7 }}>
          <Plus size={16} style={{ marginRight: '0.5rem' }} />
          Add User
        </div>
      </div>
      
      <div style={{ marginBottom: '1.5rem', display: 'flex', gap: '1rem', alignItems: 'center' }}>
        <div style={{ 
          padding: '0.75rem 1rem', 
          border: '1px solid var(--border)', 
          borderRadius: '8px', 
          background: 'var(--background)', 
          width: '300px',
          height: '44px'
        }} />
        <div className="btn-outline" style={{ opacity: 0.7 }}>
          <Search size={16} style={{ marginRight: '0.5rem' }} />
          Search
        </div>
      </div>

      <div className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: 'rgba(255,255,255,0.02)' }}>
              <th style={{ textAlign: 'left', padding: '1.25rem 1.5rem', color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase' }}>Name</th>
              <th style={{ textAlign: 'left', padding: '1.25rem 1.5rem', color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase' }}>Email</th>
              <th style={{ textAlign: 'left', padding: '1.25rem 1.5rem', color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase' }}>Role</th>
              <th style={{ textAlign: 'left', padding: '1.25rem 1.5rem', color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase' }}>Status</th>
              <th style={{ textAlign: 'right', padding: '1.25rem 1.5rem', color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {[1, 2, 3, 4, 5].map((i) => (
              <tr key={i} style={{ borderBottom: '1px solid var(--border)' }}>
                <td style={{ padding: '1.25rem 1.5rem' }}>
                  <div style={{ 
                    width: '120px', 
                    height: '20px', 
                    background: 'var(--border)', 
                    borderRadius: '4px',
                    animation: 'pulse 1.5s ease-in-out infinite'
                  }} />
                </td>
                <td style={{ padding: '1.25rem 1.5rem' }}>
                  <div style={{ 
                    width: '180px', 
                    height: '20px', 
                    background: 'var(--border)', 
                    borderRadius: '4px',
                    animation: 'pulse 1.5s ease-in-out infinite'
                  }} />
                </td>
                <td style={{ padding: '1.25rem 1.5rem' }}>
                  <div style={{ 
                    width: '80px', 
                    height: '24px', 
                    background: 'var(--border)', 
                    borderRadius: '12px',
                    animation: 'pulse 1.5s ease-in-out infinite'
                  }} />
                </td>
                <td style={{ padding: '1.25rem 1.5rem', textAlign: 'right' }}>
                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                    <div style={{ 
                      width: '32px', 
                      height: '32px', 
                      background: 'var(--border)', 
                      borderRadius: '6px',
                      animation: 'pulse 1.5s ease-in-out infinite'
                    }} />
                    <div style={{ 
                      width: '32px', 
                      height: '32px', 
                      background: 'var(--border)', 
                      borderRadius: '6px',
                      animation: 'pulse 1.5s ease-in-out infinite'
                    }} />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
  
  if (error) return (
    <div style={{ padding: '2rem' }}>
      <div style={{ 
        padding: '1.5rem', 
        background: 'rgba(239, 68, 68, 0.1)', 
        border: '1px solid var(--error)', 
        borderRadius: '8px',
        color: 'var(--error)',
        textAlign: 'center'
      }}>
        <h3 style={{ margin: '0 0 0.5rem 0' }}>Error Loading Users</h3>
        <p style={{ margin: 0, opacity: 0.8 }}>{error}</p>
        <button 
          className="btn-primary" 
          onClick={() => fetchUsers(1)}
          style={{ marginTop: '1rem' }}
        >
          Retry
        </button>
      </div>
    </div>
  );

  const totalPages = Math.max(1, Math.ceil((totalCount || 0) / (pageSize || 1)));

  return (
    <div style={{ padding: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: '700' }}>User Management</h2>
        <button className="btn-primary" onClick={handleAddNew} disabled title="User creation not wired (no backend route)">
          <Plus size={16} style={{ marginRight: '0.5rem' }} />
          Add User
        </button>
      </div>

      <div style={{ marginBottom: '1.5rem', display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
        <input
          type="text"
          placeholder="Search users..."
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
          value={filters.roleId}
          onChange={(e) => setFilters({ ...filters, roleId: e.target.value })}
          style={{
            padding: '0.75rem 1rem',
            border: '1px solid var(--border)',
            borderRadius: '8px',
            background: 'var(--background)',
            color: 'var(--text)',
            fontSize: '0.875rem',
          }}
        >
          <option value="">All Roles</option>
          {roles.map((r) => (
            <option key={r.roleId || r.RoleId} value={r.roleId || r.RoleId}>
              {r.roleName || r.RoleName}
            </option>
          ))}
        </select>
        <select
          value={filters.isActive}
          onChange={(e) => setFilters({ ...filters, isActive: e.target.value })}
          style={{
            padding: '0.75rem 1rem',
            border: '1px solid var(--border)',
            borderRadius: '8px',
            background: 'var(--background)',
            color: 'var(--text)',
            fontSize: '0.875rem',
          }}
        >
          <option value="">All Status</option>
          <option value="true">Active</option>
          <option value="false">Inactive</option>
        </select>
        <input
          type="text"
          placeholder="City"
          value={filters.city}
          onChange={(e) => setFilters({ ...filters, city: e.target.value })}
          style={{
            padding: '0.75rem 1rem',
            border: '1px solid var(--border)',
            borderRadius: '8px',
            background: 'var(--background)',
            color: 'var(--text)',
            fontSize: '0.875rem',
            minWidth: '160px'
          }}
        />
        <input
          type="text"
          placeholder="Country"
          value={filters.country}
          onChange={(e) => setFilters({ ...filters, country: e.target.value })}
          style={{
            padding: '0.75rem 1rem',
            border: '1px solid var(--border)',
            borderRadius: '8px',
            background: 'var(--background)',
            color: 'var(--text)',
            fontSize: '0.875rem',
            minWidth: '160px'
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
            setFilters({ roleId: '', isActive: '', city: '', country: '' });
            fetchUsers(1);
          }}
        >
          Clear
        </button>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <button
            className="btn-ghost"
            disabled={page <= 1}
            onClick={() => fetchUsers(page - 1)}
            style={{ opacity: page <= 1 ? 0.5 : 1 }}
          >
            Prev
          </button>
          <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
            Page {page} / {totalPages} ({totalCount} users)
          </div>
          <button
            className="btn-ghost"
            disabled={page >= totalPages}
            onClick={() => fetchUsers(page + 1)}
            style={{ opacity: page >= totalPages ? 0.5 : 1 }}
          >
            Next
          </button>
          <select
            value={pageSize}
            onChange={(e) => fetchUsers(1, parseInt(e.target.value, 10))}
            style={{
              padding: '0.5rem 0.75rem',
              border: '1px solid var(--border)',
              borderRadius: '8px',
              background: 'var(--background)',
              color: 'var(--text)',
              fontSize: '0.875rem',
            }}
          >
            {[10, 20, 50].map((size) => (
              <option key={size} value={size}>{size} / page</option>
            ))}
          </select>
        </div>
      </div>

      <div className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: 'rgba(255,255,255,0.02)' }}>
              <th style={{ textAlign: 'left', padding: '1.25rem 1.5rem', color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase' }}>Name</th>
              <th style={{ textAlign: 'left', padding: '1.25rem 1.5rem', color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase' }}>Email</th>
              <th style={{ textAlign: 'left', padding: '1.25rem 1.5rem', color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase' }}>Role</th>
              <th style={{ textAlign: 'right', padding: '1.25rem 1.5rem', color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.length === 0 ? (
              <tr>
                <td colSpan={5} style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>
                  <div style={{ opacity: 0.5, marginBottom: '1rem' }}>
                    <Package size={48} style={{ margin: '0 auto' }} />
                  </div>
                  No users found
                </td>
              </tr>
            ) : (
              users.map((user) => (
                <tr key={getUserId(user)} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '1.25rem 1.5rem', fontWeight: '600' }}>
                    {getUserField(user, 'name')}
                  </td>
                  <td style={{ padding: '1.25rem 1.5rem' }}>
                    {getUserField(user, 'email')}
                  </td>
                  <td style={{ padding: '1.25rem 1.5rem' }}>
                    <select
                      value={user.RoleId || user.roleId || ''}
                      onChange={(e) => handleRoleChange(user, parseInt(e.target.value, 10))}
                      style={{
                        padding: '0.5rem 0.75rem',
                        border: '1px solid var(--border)',
                        borderRadius: '8px',
                        background: 'var(--background)',
                        color: 'var(--text)',
                        fontSize: '0.875rem',
                        minWidth: '160px'
                      }}
                    >
                      <option value="" disabled>Select Role</option>
                      {roles.map((r) => (
                        <option key={r.roleId || r.RoleId} value={r.roleId || r.RoleId}>
                          {r.roleName || r.RoleName}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td style={{ padding: '1.25rem 1.5rem' }}>
                    {(user.IsActive ?? user.isActive ?? true) ? (
                      <span className="badge" style={{ background: 'rgba(16, 185, 129, 0.12)', color: 'var(--success)' }}>
                        Active
                      </span>
                    ) : (
                      <span className="badge" style={{ background: 'rgba(239, 68, 68, 0.12)', color: 'var(--danger)' }}>
                        Inactive
                      </span>
                    )}
                  </td>
                  <td style={{ padding: '1.25rem 1.5rem', textAlign: 'right' }}>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                      <button className="btn-icon" onClick={() => handleEdit(user)}>
                        <Edit size={16} />
                      </button>
                      <button className="btn-icon btn-danger" onClick={() => handleDelete(getUserId(user))}>
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
              {editingUser ? 'Edit User' : 'Add New User'}
            </h3>
            <form onSubmit={handleSave}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: '600' }}>First Name</label>
                  <input
                    type="text"
                    value={formData.Fname || formData.fname || ''}
                    onChange={(e) => setFormData({ ...formData, Fname: e.target.value, fname: e.target.value })}
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
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: '600' }}>Last Name</label>
                  <input
                    type="text"
                    value={formData.Lname || formData.lname || ''}
                    onChange={(e) => setFormData({ ...formData, Lname: e.target.value, lname: e.target.value })}
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
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: '600' }}>Email</label>
                <input
                  type="email"
                  value={formData.Email || formData.email || ''}
                  onChange={(e) => setFormData({ ...formData, Email: e.target.value, email: e.target.value })}
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
                <button type="button" className="btn-ghost" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  {editingUser ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Users;
