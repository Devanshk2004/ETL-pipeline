import React from 'react';
import DataTable from '../components/DataTable';
import { Save, Rocket } from 'lucide-react';

const CleanView = ({ columns, badRows, isLoading, isDirty, handleDeleteRow, handleSaveOrExecute, resetState }) => {
    return (
        <div className="bg-slate-800/50 border border-slate-700 p-6 rounded-xl shadow-lg">
            <h2 className="text-2xl font-bold mb-2 text-slate-100">Rows with Missing Values</h2>
            <p className="mb-6 text-slate-400">Review the rows below. You can manually delete rows or execute a bulk removal.</p>
            <DataTable columns={columns} rows={badRows} onRowDelete={handleDeleteRow} showDelete={true} />
            <div className="mt-6 flex flex-col md:flex-row gap-4 justify-end items-center border-t border-slate-700 pt-6">
                <button onClick={resetState} className="text-slate-400 hover:text-slate-200 transition-colors mr-auto">Start Over</button>
                <button onClick={() => handleSaveOrExecute(false)} disabled={!isDirty || isLoading} className="flex justify-center items-center gap-2 bg-green-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-green-500 disabled:bg-green-800 disabled:text-slate-400 transition-colors">
                    <Save size={18} /> {isLoading ? 'Saving...' : 'Save Changes'}
                </button>
                <button onClick={() => handleSaveOrExecute(true)} disabled={isLoading} className="flex justify-center items-center gap-2 bg-blue-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-blue-500 transition-colors">
                   <Rocket size={18} /> {isLoading ? 'Executing...' : 'Execute Bulk Clean'}
                </button>
            </div>
        </div>
    );
};

export default CleanView;