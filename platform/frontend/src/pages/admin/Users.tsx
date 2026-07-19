import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { Loading } from '../../components/Loading';
import { Users as UsersIcon, UserPlus, Trash2, Search, Shield, CheckCircle, XCircle } from 'lucide-react';

export const UsersPage: React.FC = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [roles, setRoles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  
  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState<any | null>(null);
  const [formData, setFormData] = useState({
    username: '',
    full_name: '',
    email: '',
    role_name: 'Developer',
    status: 'active',
    assigned_namespaces: 'devops-nexus-prod',
    assigned_apps: 'payment-service, auth-service',
    password_hash: 'password123'
  });

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const [uData, rData] = await Promise.all([
        api.getUsers(search),
        api.getRoles()
      ]);
      setUsers(uData);
      setRoles(rData);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [search]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        assigned_namespaces: formData.assigned_namespaces.split(',').map(s => s.trim()),
        assigned_apps: formData.assigned_apps.split(',').map(s => s.trim())
      };
      if (editingUser) {
        await api.updateUser(editingUser.username, payload);
      } else {
        await api.createUser(payload);
      }
      setShowModal(false);
      fetchUsers();
    } catch (err: any) {
      alert(err.response?.data?.error?.message || 'Operation failed');
    }
  };

  const handleDelete = async (username: string) => {
    if (!confirm(`Are you sure you want to delete user '${username}'?`)) return;
    const ok = await api.deleteUser(username);
    if (ok) fetchUsers();
  };

  const handleToggleStatus = async (user: any) => {
    const newStatus = user.status === 'active' ? 'disabled' : 'active';
    await api.updateUser(user.username, { status: newStatus });
    fetchUsers();
  };

  const openCreateModal = () => {
    setEditingUser(null);
    setFormData({
      username: '',
      full_name: '',
      email: '',
      role_name: 'Developer',
      status: 'active',
      assigned_namespaces: 'devops-nexus-prod',
      assigned_apps: 'payment-service, auth-service',
      password_hash: 'password123'
    });
    setShowModal(true);
  };

  const openEditModal = (user: any) => {
    setEditingUser(user);
    setFormData({
      username: user.username,
      full_name: user.full_name || '',
      email: user.email || '',
      role_name: user.role_name,
      status: user.status,
      assigned_namespaces: (user.assigned_namespaces || []).join(', '),
      assigned_apps: (user.assigned_apps || []).join(', '),
      password_hash: user.password_hash || ''
    });
    setShowModal(true);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-800 dark:text-white flex items-center gap-3">
            <UsersIcon className="h-8 w-8 text-blue-500" />
            User Management
          </h1>
          <p className="text-sm text-slate-400 mt-1">Manage user identities, workspace assignments, and security roles.</p>
        </div>

        <button
          onClick={openCreateModal}
          className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm shadow-lg shadow-blue-500/20 flex items-center gap-2 transition-all"
        >
          <UserPlus className="h-4 w-4" />
          Create User
        </button>
      </div>

      {/* Search Input */}
      <div className="flex items-center gap-3 bg-white dark:bg-slate-900 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800">
        <Search className="h-4 w-4 text-slate-400" />
        <input
          type="text"
          placeholder="Search users by name, email, or role..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="bg-transparent text-sm text-slate-800 dark:text-white focus:outline-none w-full"
        />
      </div>

      {/* Users Table */}
      {loading ? (
        <Loading />
      ) : (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600 dark:text-slate-300">
              <thead className="bg-slate-50 dark:bg-slate-800/50 text-xs font-bold uppercase tracking-wider text-slate-400 border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="px-6 py-4">User</th>
                  <th className="px-6 py-4">Role</th>
                  <th className="px-6 py-4">Assigned Workspaces</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
                {users.map((u) => (
                  <tr key={u.username} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center font-bold text-xs">
                          {u.username.substring(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-bold text-slate-800 dark:text-white">{u.full_name || u.username}</div>
                          <div className="text-xs text-slate-400">@{u.username} • {u.email}</div>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <span className="px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-500 text-xs font-bold inline-flex items-center gap-1.5">
                        <Shield className="h-3 w-3" />
                        {u.role_name}
                      </span>
                    </td>

                    <td className="px-6 py-4 text-xs space-y-1">
                      <div><strong className="text-slate-700 dark:text-slate-200">NS:</strong> { (u.assigned_namespaces || []).join(', ') }</div>
                      <div><strong className="text-slate-700 dark:text-slate-200">Apps:</strong> { (u.assigned_apps || []).join(', ') }</div>
                    </td>

                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleToggleStatus(u)}
                        className={`px-3 py-1 rounded-full text-xs font-bold inline-flex items-center gap-1.5 ${
                          u.status === 'active' 
                            ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' 
                            : 'bg-rose-500/10 text-rose-500 border border-rose-500/20'
                        }`}
                      >
                        {u.status === 'active' ? <CheckCircle className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
                        {u.status.toUpperCase()}
                      </button>
                    </td>

                    <td className="px-6 py-4 text-right space-x-2">
                      <button
                        onClick={() => openEditModal(u)}
                        className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-bold hover:bg-slate-100 dark:hover:bg-slate-800"
                      >
                        Edit
                      </button>
                      {u.username !== 'admin' && (
                        <button
                          onClick={() => handleDelete(u.username)}
                          className="px-2.5 py-1.5 rounded-lg border border-rose-500/20 text-rose-500 bg-rose-500/5 hover:bg-rose-500/15 text-xs font-bold"
                        >
                          <Trash2 className="h-3.5 w-3.5 inline" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal Dialog */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-lg p-6 shadow-2xl space-y-4">
            <h3 className="text-xl font-bold text-slate-800 dark:text-white">
              {editingUser ? `Edit User @${editingUser.username}` : 'Create New User Account'}
            </h3>
            
            <form onSubmit={handleSave} className="space-y-4 text-sm">
              {!editingUser && (
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-400 mb-1">Username</label>
                  <input
                    type="text"
                    required
                    value={formData.username}
                    onChange={e => setFormData({ ...formData, username: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-blue-500"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-bold uppercase text-slate-400 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={formData.full_name}
                  onChange={e => setFormData({ ...formData, full_name: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-400 mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={e => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-400 mb-1">Assigned Role</label>
                <select
                  value={formData.role_name}
                  onChange={e => setFormData({ ...formData, role_name: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-blue-500"
                >
                  {roles.map(r => (
                    <option key={r.name} value={r.name}>{r.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-400 mb-1">Assigned Namespaces (Comma Separated)</label>
                <input
                  type="text"
                  value={formData.assigned_namespaces}
                  onChange={e => setFormData({ ...formData, assigned_namespaces: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-400 mb-1">Assigned Applications (Comma Separated)</label>
                <input
                  type="text"
                  value={formData.assigned_apps}
                  onChange={e => setFormData({ ...formData, assigned_apps: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-500 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-blue-600 text-white font-bold"
                >
                  Save User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
