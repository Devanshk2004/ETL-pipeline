import React, { useMemo } from 'react';

const CsvView = ({ columns, rows }) => {
    const csvContent = useMemo(() => {
        const header = columns.join(',');
        const body = rows.map(row => columns.map(col => `"${String(row.data[col] ?? '')}"`).join(',')).join('\n');
        return `${header}\n${body}`;
    }, [columns, rows]);

    return (
        <pre className="bg-slate-900 border border-slate-700 rounded-lg p-4 overflow-auto text-xs text-slate-300 max-h-[60vh]">
            {csvContent}
        </pre>
    );
};

export default CsvView;
