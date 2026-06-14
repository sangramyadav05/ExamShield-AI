import React from 'react';

const Table = ({ headers, children, className = '' }) => {
  return (
    <div className={`w-full overflow-x-auto rounded-xl border border-slate-800/80 custom-scrollbar ${className}`}>
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-slate-900/60 border-b border-slate-800/80">
            {headers.map((h, i) => (
              <th key={i} className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-400">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-800/40 bg-slate-950/20">
          {children}
        </tbody>
      </table>
    </div>
  );
};

export default Table;
