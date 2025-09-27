import React from 'react';
import { Trash2 } from 'lucide-react';

const DataTable = ({ columns, rows, onRowDelete, showDelete = false }) => (
    <div className="overflow-auto rounded-lg border border-slate-700 max-h-[60vh]">
        <table className="min-w-full divide-y divide-slate-700 bg-slate-800 text-sm">
            <thead className="bg-slate-900 sticky top-0">
                <tr>
                    {showDelete && <th className="whitespace-nowrap px-4 py-3 text-left font-medium text-slate-300">Row #</th>}
                    {columns.map((col) => (
                        <th key={col} className="whitespace-nowrap px-4 py-3 text-left font-medium text-slate-300">{col}</th>
                    ))}
                    {showDelete && <th className="px-4 py-3"></th>}
                </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
                {rows.map((row, idx) => (
                    <tr key={showDelete ? row.index : idx} className="hover:bg-slate-700/50">
                        {showDelete && <td className="whitespace-nowrap px-4 py-3 font-medium text-slate-300">{row.index}</td>}
                        {columns.map((col) => (
                            <td key={col} className={`whitespace-nowrap px-4 py-3 ${row.data[col] === null ? 'text-amber-500' : 'text-slate-400'}`}>
                                {String(row.data[col] === null || row.data[col] === undefined ? 'NULL' : row.data[col])}
                            </td>
                        ))}
                        {showDelete && (
                            <td className="whitespace-nowrap px-4 py-3">
                                <button onClick={() => onRowDelete(row.index)} className="text-red-500 hover:text-red-400 transition-colors">
                                    <Trash2 size={18} />
                                </button>
                            </td>
                        )}
                    </tr>
                ))}
            </tbody>
        </table>
    </div>
);

export default DataTable;