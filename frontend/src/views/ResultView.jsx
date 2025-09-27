import React from 'react';
import DataTable from '../components/DataTable';
import CsvView from '../components/CsvView';
import { Monitor, FileText, Bot } from 'lucide-react';

const ResultView = ({ columns, cleanedData, tableView, setTableView, resetState, setView }) => {
    return (
        <div className="w-full">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-slate-100">Final Cleaned Data</h2>
                <div className="flex items-center gap-2 rounded-lg p-1 bg-slate-800 border border-slate-700">
                    <button onClick={() => setTableView('modern')} className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${tableView === 'modern' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:bg-slate-700'}`}>
                        <Monitor size={16} className="inline mr-2"/>Modern
                    </button>
                    <button onClick={() => setTableView('csv')} className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${tableView === 'csv' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:bg-slate-700'}`}>
                        <FileText size={16} className="inline mr-2"/>CSV
                    </button>
                </div>
            </div>

            {tableView === 'modern' ? (
                <DataTable columns={columns} rows={cleanedData} />
            ) : (
                <CsvView columns={columns} rows={cleanedData} />
            )}
            
             <div className="mt-8 flex flex-col md:flex-row gap-4 justify-center items-center">
                {/* This button now changes the view to 'dashboard' */}
                <button onClick={() => setView('dashboard')} className="flex items-center gap-2 text-white font-bold py-3 px-8 rounded-lg bg-purple-600 hover:bg-purple-500 transition-colors shadow-lg shadow-purple-900/50">
                    <Bot size={20}/> Visualize
                </button>
                <button onClick={resetState} className="text-slate-400 hover:text-slate-200">or Start Over</button>
             </div>
        </div>
    );
};

export default ResultView;