import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { Loading } from '../../components/Loading';
import { Shield, Copy, Download, Trash2, Lock } from 'lucide-react';

export const RolesPage: React.FC = () => {
  const [roles, setRoles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Clone Modal State
  const [cloneModalRole, setCloneModalRole] = useState<string | null>(null);
  const [newRoleName, setNewRoleName] = useState('');

  const fetchRoles = async () => {
    setLoading(true);
    try {
      const data = await api.getRoles();
      setRoles(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoles();
  }, []);

  const handleClone = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cloneModalRole || !newRoleName) return;
    try {
      await api.cloneRole(cloneModalRole, newRoleName);
      setCloneModalRole(null);
      setNewRoleName('');
      fetchRoles();
    } catch (err: any) {
      alert(err.response?.data?.error?.message || 'Clone failed');
    }
  };

  const handleDelete = async (name: string) => {
    if (!confirm(`Are you sure you want to delete role '${name}'?`)) return;
    const ok = await api.deleteRole(name);
    if (ok) fetchRoles();
  };

  const handleExport = (role: any) => {
    const jsonStr = JSON.stringify(role, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `role-${role.name.toLowerCase().replace(/\s+/g, '-')}.json`;
    a.click();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-800 dark:text-white flex items-center gap-3">
            <Shield className="h-8 w-8 text-indigo-500" />
            Role & Template Management
          </h1>
          <p className="text-sm text-slate-400 mt-1">Configure dynamic roles, permission matrices, and workspace access bounds.</p>
        </div>
      </div>

      {/* Roles Grid */}
      {loading ? (
        <Loading />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {roles.map((r) => (
            <div key={r.name} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
                    {r.name}
                    {r.is_system && <Lock className="h-4 w-4 text-amber-500" />}
                  </span>
                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase ${
                    r.is_system ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20' : 'bg-blue-500/10 text-blue-500 border border-blue-500/20'
                  }`}>
                    {r.is_system ? 'Template' : 'Custom'}
                  </span>
                </div>

                <p className="text-xs text-slate-400 min-h-[36px]">{r.description}</p>

                <div className="space-y-1.5 pt-2 border-t border-slate-100 dark:border-slate-800/80 text-xs">
                  <div>
                    <strong className="text-slate-600 dark:text-slate-300">Allowed NS:</strong>{' '}
                    <span className="text-slate-400">{(r.allowed_namespaces || []).join(', ')}</span>
                  </div>
                  <div>
                    <strong className="text-slate-600 dark:text-slate-300">Allowed Apps:</strong>{' '}
                    <span className="text-slate-400">{(r.allowed_apps || []).join(', ')}</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setCloneModalRole(r.name);
                      setNewRoleName(`${r.name} Copy`);
                    }}
                    className="p-2 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-all"
                    title="Clone Role"
                  >
                    <Copy className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleExport(r)}
                    className="p-2 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-all"
                    title="Export JSON"
                  >
                    <Download className="h-4 w-4" />
                  </button>
                </div>

                {!r.is_system && (
                  <button
                    onClick={() => handleDelete(r.name)}
                    className="p-2 rounded-lg border border-rose-500/20 text-rose-500 bg-rose-500/5 hover:bg-rose-500/15 transition-all"
                    title="Delete Role"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Clone Modal */}
      {cloneModalRole && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4">
            <h3 className="text-xl font-bold text-slate-800 dark:text-white">Clone Role: {cloneModalRole}</h3>
            
            <form onSubmit={handleClone} className="space-y-4 text-sm">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-400 mb-1">New Role Name</label>
                <input
                  type="text"
                  required
                  value={newRoleName}
                  onChange={e => setNewRoleName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-blue-500 text-slate-800 dark:text-white"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setCloneModalRole(null)}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-500 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-indigo-600 text-white font-bold"
                >
                  Create Cloned Role
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
