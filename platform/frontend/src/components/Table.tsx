import React from 'react';

interface Column<T> {
  header: string;
  accessor: keyof T | ((item: T) => React.ReactNode);
}

interface TableProps<T> {
  columns: Column<T>[];
  data: T[];
  emptyMessage?: string;
}

export function Table<T>({ columns, data, emptyMessage = "No data records found." }: TableProps<T>) {
  return (
    <div className="overflow-hidden border border-slate-200 dark:border-slate-800 bg-white/40 dark:bg-slate-900/40 rounded-2xl backdrop-blur-md shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-100/50 dark:bg-slate-900/50">
              {columns.map((col, index) => (
                <th 
                  key={index}
                  className="px-6 py-4 text-xs font-semibold tracking-wider text-slate-500 dark:text-slate-400 uppercase"
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
            {data.length > 0 ? (
              data.map((item, rowIndex) => (
                <tr 
                  key={rowIndex}
                  className="hover:bg-slate-500/5 dark:hover:bg-slate-500/3 transition-colors"
                >
                  {columns.map((col, colIndex) => (
                    <td 
                      key={colIndex}
                      className="px-6 py-4.5 text-sm text-slate-700 dark:text-slate-200 font-medium"
                    >
                      {typeof col.accessor === 'function'
                        ? col.accessor(item)
                        : (item[col.accessor] as React.ReactNode)
                      }
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td 
                  colSpan={columns.length} 
                  className="px-6 py-8 text-sm text-center text-slate-400 dark:text-slate-500 font-medium"
                >
                  {emptyMessage}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
