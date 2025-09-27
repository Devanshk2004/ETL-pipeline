import React, { useState, useEffect, useRef } from 'react';
import { Pie } from 'react-chartjs-2';
// NOTE: For Pie charts, we need to register the 'ArcElement'
import { Chart as ChartJS, ArcElement, Title, Tooltip, Legend } from 'chart.js';
import { Download, Expand, X } from 'lucide-react';

ChartJS.register(ArcElement, Title, Tooltip, Legend);

const PieChart = ({ cleanedFilePath }) => {
    const [columns, setColumns] = useState([]);
    const [numericColumns, setNumericColumns] = useState([]);
    const [nameColumn, setNameColumn] = useState(''); // "Name" axis (labels)
    const [basisColumn, setBasisColumn] = useState(''); // "Basis of" axis (values)
    const [chartData, setChartData] = useState(null);
    const [error, setError] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const chartRef = useRef(null);

    const chartOptions = {
        maintainAspectRatio: false,
        responsive: true,
        plugins: {
            legend: { position: 'top', labels: { color: '#e2e8f0' } },
            title: { display: true, text: basisColumn && nameColumn ? `Distribution of ${basisColumn} by ${nameColumn}` : 'Pie Chart', color: '#e2e8f0', font: { size: 16 } }
        }
    };

    useEffect(() => {
        const fetchColumnInfo = async () => {
            if (!cleanedFilePath) return;
            setError('');
            try {
                const response = await fetch(`http://127.0.0.1:8000/api/get_cleaned_data_info?filepath=${cleanedFilePath}`);
                if (!response.ok) throw new Error('Failed to fetch column info.');
                const data = await response.json();
                setColumns(data.columns);
                setNumericColumns(data.numeric_columns);
            } catch (err) {
                setError('Failed to fetch: Could not load column data from the server.');
            }
        };
        fetchColumnInfo();
    }, [cleanedFilePath]);

    useEffect(() => {
        const fetchGraphData = async () => {
            if (nameColumn && basisColumn) {
                setError('');
                setChartData(null);
                try {
                    // We can reuse the same endpoint, as it provides labels and data
                    const response = await fetch(`http://127.0.0.1:8000/api/get_graph_data?filepath=${cleanedFilePath}&x_axis=${nameColumn}&y_axis=${basisColumn}`);
                    
                    if (!response.ok) {
                        const errData = await response.json().catch(() => null);
                        throw new Error(errData?.detail || `Server error: ${response.statusText}`);
                    }
                    
                    const data = await response.json();
                    setChartData({
                        labels: data.labels,
                        datasets: [{
                            label: basisColumn,
                            data: data.data,
                            // Add multiple background colors for the pie slices
                            backgroundColor: [
                                'rgba(255, 99, 132, 0.5)', 'rgba(54, 162, 235, 0.5)',
                                'rgba(255, 206, 86, 0.5)', 'rgba(75, 192, 192, 0.5)',
                                'rgba(153, 102, 255, 0.5)', 'rgba(255, 159, 64, 0.5)',
                            ],
                            borderColor: [
                                'rgba(255, 99, 132, 1)', 'rgba(54, 162, 235, 1)',
                                'rgba(255, 206, 86, 1)', 'rgba(75, 192, 192, 1)',
                                'rgba(153, 102, 255, 1)', 'rgba(255, 159, 64, 1)',
                            ],
                            borderWidth: 1,
                        }],
                    });
                } catch (err) {
                    if (err.message.includes('Failed to fetch')) {
                         setError('Failed to fetch: Cannot connect to the backend server.');
                    } else {
                         setError(err.message);
                    }
                }
            }
        };
        fetchGraphData();
    }, [nameColumn, basisColumn, cleanedFilePath]);

    const handleDownload = () => {
        if (chartRef.current) {
            const link = document.createElement('a');
            link.href = chartRef.current.toBase64Image('image/jpeg', 1);
            link.download = `pie_chart_${basisColumn}_by_${nameColumn}.jpg`;
            link.click();
        }
    };

    // NOTE: This renders a <Pie /> component
    const renderChart = () => (
        chartData ? <Pie ref={chartRef} data={chartData} options={chartOptions} /> : 
        <div className="flex items-center justify-center h-full text-slate-500">Please select Name and Basis of to generate the chart.</div>
    );

    return (
        <div className="bg-slate-800/50 border border-slate-700 p-4 rounded-b-xl">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                {/* "Name" Selector */}
                <div>
                    <label htmlFor="name-select" className="block text-sm font-medium text-slate-400 mb-1">Name</label>
                    <select id="name-select" value={nameColumn} onChange={e => setNameColumn(e.target.value)} className="w-full bg-slate-700 border border-slate-600 rounded-md p-2 text-slate-200">
                        <option value="" disabled>Select Column for Labels</option>
                        {columns.map(col => <option key={col} value={col}>{col}</option>)}
                    </select>
                </div>
                {/* "Basis of" Selector */}
                <div>
                    <label htmlFor="basis-select" className="block text-sm font-medium text-slate-400 mb-1">Basis of</label>
                    <select id="basis-select" value={basisColumn} onChange={e => setBasisColumn(e.target.value)} className="w-full bg-slate-700 border border-slate-600 rounded-md p-2 text-slate-200">
                        <option value="" disabled>Select Column for Values</option>
                        {numericColumns.map(col => <option key={col} value={col}>{col}</option>)}
                    </select>
                </div>
            </div>

            {error && <p className="mb-4 text-center text-red-400 bg-red-900/50 py-2 rounded-md">{error}</p>}
            
            <div className="mt-4 h-96 bg-slate-900 p-4 rounded-lg relative group">
                {renderChart()}
                {chartData && (
                    <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={handleDownload} className="p-2 bg-slate-700/80 rounded-md hover:bg-slate-600 transition-colors" title="Download as JPG"><Download size={16}/></button>
                        <button onClick={() => setIsModalOpen(true)} className="p-2 bg-slate-700/80 rounded-md hover:bg-slate-600 transition-colors" title="View Fullscreen"><Expand size={16}/></button>
                    </div>
                )}
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="w-full h-full p-8 relative">
                         <button onClick={() => setIsModalOpen(false)} className="absolute top-2 right-2 p-2 bg-slate-700/80 rounded-full hover:bg-slate-600 transition-colors z-10" title="Close Fullscreen"><X size={20}/></button>
                         {renderChart()}
                    </div>
                </div>
            )}
        </div>
    );
};

export default PieChart;