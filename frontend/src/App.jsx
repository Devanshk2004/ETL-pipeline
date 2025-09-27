import React, { useState, useMemo } from 'react';
import { Trash2, UploadCloud, Save, Rocket, FileSpreadsheet } from 'lucide-react';

// A simple component for displaying tables in dark mode
const DataTable = ({ columns, rows, onRowDelete, showDelete = false }) => (
    <div className="overflow-x-auto rounded-lg border border-slate-700">
        <table className="min-w-full divide-y divide-slate-700 bg-slate-800 text-sm">
            <thead className="bg-slate-900">
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

function App() {
    const [file, setFile] = useState(null);
    const [columns, setColumns] = useState([]);
    const [badRows, setBadRows] = useState([]);
    const [cleanedData, setCleanedData] = useState([]);
    const [view, setView] = useState('upload'); // 'upload', 'clean', 'result'
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [isDirty, setIsDirty] = useState(false); // Tracks manual deletions

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile && selectedFile.type === 'text/csv') {
            setFile(selectedFile);
            setError('');
        } else {
            setFile(null);
            setError('Please select a valid .csv file.');
        }
    };

    const handleAnalyze = async () => {
        if (!file) return;
        setIsLoading(true);
        setError('');

        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await fetch('http://127.0.0.1:8000/api/analyze', {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                const errData = await response.json();
                throw new Error(errData.detail || `Server error: ${response.statusText}`);
            }

            const result = await response.json();
            setColumns(result.columns);
            setBadRows(result.bad_rows);
            setView('clean');
        } catch (err) {
            setError(err.message || 'An error occurred during analysis.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleDeleteRow = (indexToDelete) => {
        setBadRows(prevRows => prevRows.filter(row => row.index !== indexToDelete));
        setIsDirty(true);
    };
    
    const originalRowCount = useMemo(() => {
        const maxIndex = badRows.reduce((max, row) => Math.max(max, row.index), 0);
        return maxIndex + 1;
    }, [badRows]);


    const handleSave = () => {
        alert(`Simulating Save: You have ${originalRowCount - badRows.length} clean rows. In a real app, this would be saved.`);
        // setView('result');
    };

    const handleExecuteAll = () => {
         alert(`Simulating Execute: You have ${originalRowCount - badRows.length} clean rows after removing all identified issues.`);
        // setView('result');
    };

    const resetState = () => {
        setFile(null);
        setColumns([]);
        setBadRows([]);
        setCleanedData([]);
        setView('upload');
        setIsLoading(false);
        setError('');
        setIsDirty(false);
    };

    return (
        <div className="bg-slate-900 min-h-screen font-sans text-slate-300">
            <div className="container mx-auto p-4 md:p-8">
                <header className="text-center mb-10">
                    <h1 className="text-4xl font-bold text-slate-100">Data Cleaner and Visualizer</h1>
                    <p className="text-slate-400 mt-2">Upload, analyze, and clean your CSV data in a few simple steps.</p>
                </header>

                {view === 'upload' && (
                    <div className="max-w-xl mx-auto bg-slate-800/50 border border-slate-700 p-8 rounded-xl shadow-lg">
                        <div className="flex flex-col items-center justify-center w-full">
                            <label htmlFor="dropzone-file" className="flex flex-col items-center justify-center w-full h-64 border-2 border-slate-600 border-dashed rounded-lg cursor-pointer bg-slate-800 hover:bg-slate-700 transition">
                                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                    <UploadCloud className="w-10 h-10 mb-4 text-slate-500" />
                                    <p className="mb-2 text-sm text-slate-400"><span className="font-semibold text-indigo-400">Click to upload</span> or drag and drop</p>
                                    <p className="text-xs text-slate-500">CSV files only</p>
                                </div>
                                <input id="dropzone-file" type="file" className="hidden" accept=".csv" onChange={handleFileChange} />
                            </label>
                            {file && <div className="mt-4 text-sm text-slate-400 flex items-center gap-2 bg-slate-700 px-3 py-2 rounded-md">
                                <FileSpreadsheet size={16} className="text-indigo-400" />
                                <span className="font-medium text-slate-300">{file.name}</span>
                            </div>}
                        </div>
                        <div className="mt-6">
                            <button onClick={handleAnalyze} disabled={!file || isLoading} className="w-full flex justify-center items-center gap-2 bg-indigo-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-indigo-500 disabled:bg-indigo-800 disabled:text-slate-400 transition-all duration-300 shadow-indigo-900/50 shadow-lg">
                                {isLoading ? 'Analyzing...' : 'Analyze File'}
                            </button>
                        </div>
                        {error && <p className="mt-4 text-center text-red-400">{error}</p>}
                    </div>
                )}

                {view === 'clean' && (
                    <div className="bg-slate-800/50 border border-slate-700 p-6 rounded-xl shadow-lg">
                        <h2 className="text-2xl font-bold mb-2 text-slate-100">Rows with Missing Values</h2>
                        <p className="mb-6 text-slate-400">Review the rows below. You can manually delete rows or execute a bulk removal.</p>
                        <DataTable columns={columns} rows={badRows} onRowDelete={handleDeleteRow} showDelete={true} />
                        <div className="mt-6 flex flex-col md:flex-row gap-4 justify-end items-center border-t border-slate-700 pt-6">
                            <button onClick={resetState} className="text-slate-400 hover:text-slate-200 transition-colors mr-auto">Start Over</button>
                            <button onClick={handleSave} disabled={!isDirty} className="flex justify-center items-center gap-2 bg-green-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-green-500 disabled:bg-green-800 disabled:text-slate-400 transition-colors">
                                <Save size={18} /> Save Changes
                            </button>
                            <button onClick={handleExecuteAll} className="flex justify-center items-center gap-2 bg-blue-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-blue-500 transition-colors">
                               <Rocket size={18} /> Execute Bulk Clean
                            </button>
                        </div>
                    </div>
                )}
                
                {view === 'result' && (
                     <div className="bg-slate-800/50 border border-slate-700 p-6 rounded-xl shadow-lg">
                         <h2 className="text-2xl font-bold mb-4 text-slate-100">Cleaned Data</h2>
                         <DataTable columns={columns} rows={cleanedData} />
                         <div className="mt-6 text-right">
                             <button onClick={resetState} className="bg-indigo-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-indigo-500">Start Over</button>
                         </div>
                     </div>
                )}
            </div>
        </div>
    );
}

export default App;