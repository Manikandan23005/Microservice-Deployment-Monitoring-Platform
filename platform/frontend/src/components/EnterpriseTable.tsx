import React, { useState } from 'react';
import { ChevronUp, ChevronDown, Search, ChevronLeft, ChevronRight } from 'lucide-react';

export interface ColumnDef<T> {
  key: string;
  header: string;
  render?: (row: T) => React.ReactNode;
  sortable?: boolean;
  width?: string;
}

interface EnterpriseTableProps<T> {
  columns: ColumnDef<T>[];
  data: T[];
  searchPlaceholder?: string;
  onRowClick?: (row: T) => void;
  actions?: (row: T) => React.ReactNode;
  pageSize?: number;
}

export function EnterpriseTable<T extends Record<string, any>>({
  columns,
  data,
  searchPlaceholder = 'Filter rows...',
  onRowClick,
  actions,
  pageSize = 10
}: EnterpriseTableProps<T>) {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [currentPage, setCurrentPage] = useState(1);

  // Search filtering
  const filteredData = data.filter(row => {
    if (!searchTerm) return true;
    const searchLower = searchTerm.toLowerCase();
    return columns.some(col => {
      const val = row[col.key];
      return val && String(val).toLowerCase().includes(searchLower);
    });
  });

  // Sorting
  const sortedData = [...filteredData].sort((a, b) => {
    if (!sortKey) return 0;
    const aVal = a[sortKey];
    const bVal = b[sortKey];
    if (aVal === bVal) return 0;
    if (aVal === null || aVal === undefined) return 1;
    if (bVal === null || bVal === undefined) return -1;
    const res = aVal > bVal ? 1 : -1;
    return sortOrder === 'asc' ? res : -res;
  });

  // Pagination
  const totalPages = Math.ceil(sortedData.length / pageSize) || 1;
  const paginatedData = sortedData.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const handleSort = (key: string) => {
    if (sortKey === key) {
      if (sortOrder === 'asc') setSortOrder('desc');
      else { setSortKey(null); setSortOrder('asc'); }
    } else {
      setSortKey(key);
      setSortOrder('asc');
    }
  };

  return (
    <div className="space-y-4">
      {/* Table Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder={searchPlaceholder}
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
            className="pl-9 pr-4 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-800 dark:text-white focus:outline-none focus:border-indigo-500 w-full font-medium"
          />
        </div>

        <div className="text-xs text-slate-400 font-mono flex items-center gap-2">
          Showing <strong>{sortedData.length > 0 ? (currentPage - 1) * pageSize + 1 : 0}</strong> - <strong>{Math.min(currentPage * pageSize, sortedData.length)}</strong> of <strong>{sortedData.length}</strong> records
        </div>
      </div>

      {/* Main Table Container */}
      <div className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden bg-white dark:bg-slate-900/60 shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-950/80 border-b border-slate-200 dark:border-slate-800 text-slate-400 uppercase font-bold tracking-wider font-mono select-none">
                {columns.map((col) => (
                  <th
                    key={col.key}
                    onClick={() => col.sortable && handleSort(col.key)}
                    style={{ width: col.width }}
                    className={`px-4 py-3.5 ${col.sortable ? 'cursor-pointer hover:text-slate-200' : ''}`}
                  >
                    <div className="flex items-center gap-1.5">
                      <span>{col.header}</span>
                      {col.sortable && sortKey === col.key && (
                        sortOrder === 'asc' ? <ChevronUp className="h-3.5 w-3.5 text-indigo-400" /> : <ChevronDown className="h-3.5 w-3.5 text-indigo-400" />
                      )}
                    </div>
                  </th>
                ))}
                {actions && <th className="px-4 py-3.5 text-right">Actions</th>}
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-200 dark:divide-slate-800/60 font-medium">
              {paginatedData.length === 0 ? (
                <tr>
                  <td colSpan={columns.length + (actions ? 1 : 0)} className="p-8 text-center text-slate-400 text-xs">
                    No matching records found.
                  </td>
                </tr>
              ) : (
                paginatedData.map((row, idx) => (
                  <tr
                    key={idx}
                    onClick={() => onRowClick && onRowClick(row)}
                    className={`transition-colors ${onRowClick ? 'cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800/40' : 'hover:bg-slate-50 dark:hover:bg-slate-900/40'}`}
                  >
                    {columns.map((col) => (
                      <td key={col.key} className="px-4 py-3 text-slate-800 dark:text-slate-200">
                        {col.render ? col.render(row) : String(row[col.key] ?? '')}
                      </td>
                    ))}
                    {actions && (
                      <td className="px-4 py-3 text-right" onClick={(e) => e.stopPropagation()}>
                        {actions(row)}
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 text-xs">
            <span className="text-slate-400 font-mono text-[11px]">
              Page {currentPage} of {totalPages}
            </span>

            <div className="flex items-center gap-1">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-400 hover:text-white disabled:opacity-30 disabled:hover:text-slate-400"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>

              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-400 hover:text-white disabled:opacity-30 disabled:hover:text-slate-400"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
