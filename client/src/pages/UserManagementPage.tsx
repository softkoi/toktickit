import React, { useState, useEffect } from 'react';
import { useAuth, UserProfile } from '../context/AuthContext';
import { Search, Plus, Edit2, Key, UserCheck, UserX, AlertCircle, RefreshCw } from 'lucide-react';

interface PaginatedUsers {
  data: UserProfile[];
  pagination: {
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  };
}

export const UserManagementPage: React.FC = () => {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, pageSize: 10, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingUser, setEditingUser] = useState<UserProfile | null>(null);
  const [resettingUser, setResettingUser] = useState<UserProfile | null>(null);

  // Form states
  const [createForm, setCreateForm] = useState({
    name: '',
    email: '',
    role: 'REQUESTER' as 'REQUESTER' | 'IT_STAFF' | 'ADMINISTRATOR',
    isActive: true,
    initialPassword: 'Password123!'
  });

  const [editForm, setEditForm] = useState({
    name: '',
    email: '',
    role: 'REQUESTER' as 'REQUESTER' | 'IT_STAFF' | 'ADMINISTRATOR',
    isActive: true
  });

  const [newInitialPassword, setNewInitialPassword] = useState('Password123!');
  const [submitting, setSubmitting] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);

  const fetchUsers = async (page = 1) => {
    setLoading(true);
    setErrorMessage(null);
    try {
      const query = new URLSearchParams({
        page: String(page),
        pageSize: '10',
        search,
        ...(roleFilter ? { role: roleFilter } : {})
      });

      const res = await fetch(`/api/admin/users?${query.toString()}`, { credentials: 'include' });
      if (!res.ok) {
        const err = await res.json();
        setErrorMessage(err.error?.message || 'Failed to fetch users');
        return;
      }

      const data: PaginatedUsers = await res.json();
      setUsers(data.data || []);
      setPagination(data.pagination);
    } catch {
      setErrorMessage('Network error fetching users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers(1);
  }, [search, roleFilter]);

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalError(null);
    setSubmitting(true);

    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          ...createForm,
          mustChangePassword: true
        })
      });

      const data = await res.json();
      if (!res.ok) {
        setModalError(data.error?.message || 'Failed to create user');
      } else {
        setSuccessMessage(`User "${data.user.name}" created successfully`);
        setShowCreateModal(false);
        setCreateForm({ name: '', email: '', role: 'REQUESTER', isActive: true, initialPassword: 'Password123!' });
        fetchUsers(pagination.page);
      }
    } catch {
      setModalError('Network error creating user');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    setModalError(null);
    setSubmitting(true);

    try {
      const res = await fetch(`/api/admin/users/${editingUser.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(editForm)
      });

      const data = await res.json();
      if (!res.ok) {
        setModalError(data.error?.message || 'Failed to update user');
      } else {
        setSuccessMessage(`User "${data.user.name}" updated successfully`);
        setEditingUser(null);
        fetchUsers(pagination.page);
      }
    } catch {
      setModalError('Network error updating user');
    } finally {
      setSubmitting(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resettingUser) return;
    setModalError(null);
    setSubmitting(true);

    try {
      const res = await fetch(`/api/admin/users/${resettingUser.id}/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ newInitialPassword })
      });

      const data = await res.json();
      if (!res.ok) {
        setModalError(data.error?.message || 'Failed to reset password');
      } else {
        setSuccessMessage(`Initial password for "${resettingUser.name}" reset successfully`);
        setResettingUser(null);
        setNewInitialPassword('Password123!');
      }
    } catch {
      setModalError('Network error resetting password');
    } finally {
      setSubmitting(false);
    }
  };

  const openEditModal = (u: UserProfile) => {
    setEditingUser(u);
    setEditForm({
      name: u.name,
      email: u.email,
      role: u.role,
      isActive: u.isActive
    });
    setModalError(null);
  };

  const getRoleBadgeStyle = (role: string) => {
    switch (role) {
      case 'ADMINISTRATOR': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'IT_STAFF': return 'bg-amber-100 text-amber-800 border-amber-200';
      default: return 'bg-emerald-100 text-emerald-800 border-emerald-200';
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">User Management</h1>
          <p className="text-sm text-slate-500">Administrator controls for user accounts, roles, and password resets</p>
        </div>
        <button
          onClick={() => { setShowCreateModal(true); setModalError(null); }}
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-medium text-sm rounded-xl transition-all shadow-sm"
        >
          <Plus size={18} />
          <span>Create New User</span>
        </button>
      </div>

      {/* Banners */}
      {successMessage && (
        <div className="mb-4 p-4 bg-emerald-50 border-l-4 border-emerald-500 text-emerald-800 text-sm rounded-lg flex items-center justify-between">
          <span>{successMessage}</span>
          <button onClick={() => setSuccessMessage(null)} className="text-emerald-700 font-bold">&times;</button>
        </div>
      )}

      {errorMessage && (
        <div className="mb-4 p-4 bg-red-50 border-l-4 border-red-500 text-red-800 text-sm rounded-lg flex items-center justify-between">
          <span>{errorMessage}</span>
          <button onClick={() => setErrorMessage(null)} className="text-red-700 font-bold">&times;</button>
        </div>
      )}

      {/* Toolbar Filters */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 mb-6 flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3.5 top-3 text-slate-400" size={18} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or email..."
            className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
          />
        </div>

        <div className="w-full md:w-56">
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 outline-none bg-white"
          >
            <option value="">All Roles</option>
            <option value="REQUESTER">Requester</option>
            <option value="IT_STAFF">IT Staff</option>
            <option value="ADMINISTRATOR">Administrator</option>
          </select>
        </div>

        <button
          onClick={() => fetchUsers(1)}
          className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-sm flex items-center justify-center gap-1.5"
          title="Refresh table"
        >
          <RefreshCw size={16} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Users Data Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-500">Loading users...</div>
        ) : users.length === 0 ? (
          <div className="p-12 text-center text-slate-500">No users found matching search criteria.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  <th className="py-3.5 px-4">User</th>
                  <th className="py-3.5 px-4">Role</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Password Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-800">{u.name}</div>
                      <div className="text-xs text-slate-500">{u.email}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`inline-block px-2.5 py-1 text-xs font-semibold rounded-full border ${getRoleBadgeStyle(u.role)}`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      {u.isActive ? (
                        <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                          <UserCheck size={12} /> Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs font-medium text-red-700 bg-red-50 px-2.5 py-1 rounded-full border border-red-200">
                          <UserX size={12} /> Inactive
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      {u.mustChangePassword ? (
                        <span className="text-xs text-amber-700 bg-amber-50 px-2 py-0.5 rounded font-medium border border-amber-200">
                          Must Change Password
                        </span>
                      ) : (
                        <span className="text-xs text-slate-500">Normal</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right space-x-2">
                      <button
                        onClick={() => openEditModal(u)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-medium transition-colors"
                      >
                        <Edit2 size={13} /> Edit
                      </button>
                      <button
                        onClick={() => { setResettingUser(u); setModalError(null); setNewInitialPassword('Password123!'); }}
                        className="inline-flex items-center gap-1 px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 rounded-lg text-xs font-medium transition-colors"
                      >
                        <Key size={13} /> Reset Password
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Bar */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-600">
          <div>
            Showing {users.length} of {pagination.total} users
          </div>
          <div className="flex gap-2">
            <button
              disabled={pagination.page <= 1}
              onClick={() => fetchUsers(pagination.page - 1)}
              className="px-3 py-1.5 bg-white border border-slate-300 rounded hover:bg-slate-100 disabled:opacity-40 font-medium"
            >
              Previous
            </button>
            <span className="px-3 py-1.5 font-semibold text-slate-700">Page {pagination.page} of {pagination.totalPages}</span>
            <button
              disabled={pagination.page >= pagination.totalPages}
              onClick={() => fetchUsers(pagination.page + 1)}
              className="px-3 py-1.5 bg-white border border-slate-300 rounded hover:bg-slate-100 disabled:opacity-40 font-medium"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* Create User Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 border border-emerald-100">
            <h2 className="text-lg font-bold text-slate-800 mb-4">Create New User</h2>

            {modalError && (
              <div className="mb-4 p-3 bg-red-50 border-l-4 border-red-500 text-red-700 text-xs rounded">
                {modalError}
              </div>
            )}

            <form onSubmit={handleCreateUser} className="space-y-4 text-sm">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Full Name</label>
                <input
                  type="text"
                  value={createForm.name}
                  onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                  placeholder="e.g. Sarah Connor"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Email Address</label>
                <input
                  type="email"
                  value={createForm.email}
                  onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                  placeholder="user@toktickit.com"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Role</label>
                <select
                  value={createForm.role}
                  onChange={(e) => setCreateForm({ ...createForm, role: e.target.value as any })}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none bg-white"
                >
                  <option value="REQUESTER">REQUESTER</option>
                  <option value="IT_STAFF">IT_STAFF</option>
                  <option value="ADMINISTRATOR">ADMINISTRATOR</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Initial Password</label>
                <input
                  type="password"
                  value={createForm.initialPassword}
                  onChange={(e) => setCreateForm({ ...createForm, initialPassword: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                  placeholder="Initial Password"
                  required
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="createIsActive"
                  checked={createForm.isActive}
                  onChange={(e) => setCreateForm({ ...createForm, isActive: e.target.checked })}
                  className="w-4 h-4 text-emerald-600 rounded border-slate-300"
                />
                <label htmlFor="createIsActive" className="text-slate-700">Account Active</label>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 border border-slate-300 rounded-lg text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-medium rounded-lg disabled:opacity-50"
                >
                  {submitting ? 'Creating...' : 'Create User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {editingUser && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 border border-emerald-100">
            <h2 className="text-lg font-bold text-slate-800 mb-4">Edit User Account</h2>

            {modalError && (
              <div className="mb-4 p-3 bg-red-50 border-l-4 border-red-500 text-red-700 text-xs rounded">
                {modalError}
              </div>
            )}

            <form onSubmit={handleEditUser} className="space-y-4 text-sm">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Full Name</label>
                <input
                  type="text"
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Email Address</label>
                <input
                  type="email"
                  value={editForm.email}
                  onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Role</label>
                <select
                  value={editForm.role}
                  onChange={(e) => setEditForm({ ...editForm, role: e.target.value as any })}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none bg-white"
                >
                  <option value="REQUESTER">REQUESTER</option>
                  <option value="IT_STAFF">IT_STAFF</option>
                  <option value="ADMINISTRATOR">ADMINISTRATOR</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="editIsActive"
                  checked={editForm.isActive}
                  onChange={(e) => setEditForm({ ...editForm, isActive: e.target.checked })}
                  className="w-4 h-4 text-emerald-600 rounded border-slate-300"
                />
                <label htmlFor="editIsActive" className="text-slate-700">Account Active</label>
              </div>

              {currentUser?.id === editingUser.id && !editForm.isActive && (
                <div className="p-2.5 bg-amber-50 text-amber-800 text-xs rounded border border-amber-200">
                  <AlertCircle size={14} className="inline mr-1" />
                  Warning: You cannot deactivate your own account.
                </div>
              )}

              <div className="flex justify-end gap-2 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="px-4 py-2 border border-slate-300 rounded-lg text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-medium rounded-lg disabled:opacity-50"
                >
                  {submitting ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reset Password Modal */}
      {resettingUser && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 border border-emerald-100">
            <h2 className="text-lg font-bold text-slate-800 mb-2">Reset Initial Password</h2>
            <p className="text-xs text-slate-500 mb-4">
              Setting a new initial password for <strong>{resettingUser.name}</strong> will force them to change it on their next login.
            </p>

            {modalError && (
              <div className="mb-4 p-3 bg-red-50 border-l-4 border-red-500 text-red-700 text-xs rounded">
                {modalError}
              </div>
            )}

            <form onSubmit={handleResetPassword} className="space-y-4 text-sm">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">New Initial Password</label>
                <input
                  type="password"
                  value={newInitialPassword}
                  onChange={(e) => setNewInitialPassword(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                  placeholder="New Initial Password"
                  required
                />
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setResettingUser(null)}
                  className="px-4 py-2 border border-slate-300 rounded-lg text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-medium rounded-lg disabled:opacity-50"
                >
                  {submitting ? 'Resetting...' : 'Reset Password'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
