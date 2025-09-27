import React, { useState } from 'react';

// Import the new views
import UploadView from './views/UploadView.jsx';
import CleanView from './views/CleanView.jsx';
import ResultView from './views/ResultView.jsx';

function App() {
    // --- STATE MANAGEMENT ---
    // All state now lives in the main App component
    const [file, setFile] = useState(null);
    const [columns, setColumns] = useState([]);
    const [goodRows, setGoodRows] = useState([]);
    const [badRows, setBadRows] = useState([]);
    const [cleanedData, setCleanedData] = useState([]);
    const [view, setView] = useState('upload'); // 'upload', 'clean', 'result'
    const [tableView, setTableView] = useState('modern'); // 'modern', 'csv'
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [isDirty, setIsDirty] = useState(false);

    // --- HANDLER FUNCTIONS ---
    // All logic functions also live here and are passed down as props
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
            const response = await fetch('http://127.0.0.1:8000/api/analyze', { method: 'POST', body: formData });
            if (!response.ok) {
                const errData = await response.json();
                throw new Error(errData.detail || `Server error: ${response.statusText}`);
            }
            const result = await response.json();
            setColumns(result.columns);
            setBadRows(result.bad_rows);
            setGoodRows(result.good_rows.map((row, index) => ({ index, data: row })));
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

    const handleSaveOrExecute = async (isBulkExecute) => {
        setIsLoading(true);
        const finalBadRows = isBulkExecute ? [] : badRows;
        
        const finalCleanedRows = [...goodRows, ...finalBadRows]
            .sort((a, b) => a.index - b.index)
            .map(row => row.data);

        setCleanedData(finalCleanedRows.map((row, index) => ({ index, data: row })));

        try {
            const response = await fetch('http://127.0.0.1:8000/api/save_cleaned_data', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ columns, cleaned_rows: finalCleanedRows }),
            });

            if (!response.ok) {
                throw new Error('Failed to save the cleaned data.');
            }
            
            await response.json();
            setView('result');
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    const resetState = () => {
        setFile(null);
        setColumns([]);
        setGoodRows([]);
        setBadRows([]);
        setCleanedData([]);
        setView('upload');
        setTableView('modern');
        setIsLoading(false);
        setError('');
        setIsDirty(false);
    };

    // --- RENDER LOGIC ---
    // Decides which view component to show based on the 'view' state
    const renderView = () => {
        switch (view) {
            case 'clean':
                return <CleanView 
                    columns={columns} 
                    badRows={badRows} 
                    isLoading={isLoading}
                    isDirty={isDirty}
                    handleDeleteRow={handleDeleteRow}
                    handleSaveOrExecute={handleSaveOrExecute}
                    resetState={resetState}
                />;
            case 'result':
                return <ResultView
                    columns={columns}
                    cleanedData={cleanedData}
                    tableView={tableView}
                    setTableView={setTableView}
                    resetState={resetState}
                />;
            case 'upload':
            default:
                return <UploadView 
                    file={file} 
                    isLoading={isLoading} 
                    error={error} 
                    handleFileChange={handleFileChange} 
                    handleAnalyze={handleAnalyze} 
                />;
        }
    };

    return (
        <div className="bg-slate-900 min-h-screen font-sans text-slate-300">
            <div className="container mx-auto p-4 md:p-8">
                <header className="text-center mb-10">
                    <h1 className="text-4xl font-bold text-slate-100">ETL Data Cleaner</h1>
                    <p className="text-slate-400 mt-2">Upload, analyze, and clean your CSV data in a few simple steps.</p>
                </header>
                <main>
                    {renderView()}
                </main>
            </div>
        </div>
    );
}

export default App;