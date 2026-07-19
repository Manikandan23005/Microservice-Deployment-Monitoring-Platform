import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { Loading } from '../../components/Loading';
import { Grid, Save, Check, X } from 'lucide-react';

export const PermissionsMatrixPage: React.FC = () => {
  const [roles, setRoles] = useState<any[]>([]);
  const [selectedRoleName, setSelectedRoleName] = useState<string>('Developer');
  const [currentRole, setCurrentRole] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const resources = [
    'pods', 'deployments', 'replicasets', 'services', 'ingress',
    'namespaces', 'nodes', 'events', 'metrics', 'logs',
    'alerts', 'gitops', 'ai', 'settings', 'secrets', 'pvc'
  ];

  const actions = [
    'view', 'create', 'update', 'delete',
    'restart_deployment', 'scale_deployment', 'sync_application', 'rollback_application', 'ai_chat', 'ai_incident'
  ];

  const fetchRoles = async () => {
    setLoading(true);
    try {
      const data = await api.getRoles();
      setRoles(data);
      const sel = data.find((r: any) => r.name === selectedRoleName) || data[0];
      if (sel) {
        setSelectedRoleName(sel.name);
        setCurrentRole(JSON.parse(JSON.stringify(sel)));
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoles();
  }, []);

  const handleRoleChange = (name: string) => {
    setSelectedRoleName(name);
    const sel = roles.find((r: any) => r.name === name);
    if (sel) {
      setCurrentRole(JSON.parse(JSON.stringify(sel)));
    }
  };

  const togglePermission = (resource: string, action: string) => {
    if (!currentRole) return;
    const perms = { ...currentRole.permissions };
    if (!perms[resource]) perms[resource] = {};
    perms[resource][action] = !perms[resource][action];
    setCurrentRole({ ...currentRole, permissions: perms });
  };

  const handleSaveMatrix = async () => {
    if (!currentRole) return;
    setSaving(true);
    try {
      await api.updateRole(currentRole.name, currentRole);
      alert(`Permission Matrix for role '${currentRole.name}' saved successfully!`);
      fetchRoles();
    } catch (err: any) {
      alert(err.response?.data?.error?.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-800 dark:text-white flex items-center gap-3">
            <Grid className="h-8 w-8 text-emerald-500" />
            Enterprise Permission Matrix
          </h1>
          <p className="text-sm text-slate-400 mt-1">Visually adjust resource and action permission bounds per role.</p>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={selectedRoleName}
            onChange={(e) => handleRoleChange(e.target.value)}
            className="px-4 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-sm font-bold text-slate-800 dark:text-white focus:outline-none cursor-pointer"
          >
            {roles.map(r => (
              <option key={r.name} value={r.name}>Role: {r.name}</option>
            ))}
          </select>

          <button
            onClick={handleSaveMatrix}
            disabled={saving}
            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-lg shadow-emerald-500/20 flex items-center gap-2 transition-all"
          >
            <Save className="h-4 w-4" />
            {saving ? 'Saving...' : 'Save Matrix'}
          </button>
        </div>
      </div>

      {/* Permission Matrix Table */}
      {loading || !currentRole ? (
        <Loading />
      ) : (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/60 font-bold uppercase tracking-wider text-slate-400 border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="px-4 py-3 sticky left-0 bg-slate-50 dark:bg-slate-800 z-10">Resource</th>
                  {actions.map(act => (
                    <th key={act} className="px-3 py-3 text-center min-w-[90px]">
                      {act.replace('_', '\n')}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
                {resources.map(res => (
                  <tr key={res} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                    <td className="px-4 py-3 font-bold text-slate-800 dark:text-white uppercase tracking-wider sticky left-0 bg-white dark:bg-slate-900 z-10 border-r border-slate-100 dark:border-slate-800">
                      {res}
                    </td>

                    {actions.map(act => {
                      const isAllowed = !!(currentRole.permissions?.[res]?.[act]);
                      return (
                        <td key={act} className="px-3 py-3 text-center">
                          <button
                            type="button"
                            onClick={() => togglePermission(res, act)}
                            className={`h-7 w-7 rounded-lg inline-flex items-center justify-center transition-all ${
                              isAllowed 
                                ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/30 hover:bg-emerald-500/20' 
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                            }`}
                          >
                            {isAllowed ? <Check className="h-4 w-4" /> : <X className="h-3 w-3 opacity-30" />}
                          </button>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
