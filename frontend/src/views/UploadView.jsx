import React from 'react';
import { UploadCloud, FileSpreadsheet } from 'lucide-react';

const UploadView = ({ file, isLoading, error, handleFileChange, handleAnalyze }) => {
    return (
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
    );
};

export default UploadView;