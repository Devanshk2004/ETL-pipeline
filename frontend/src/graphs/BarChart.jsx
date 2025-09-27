import React, { useState, useEffect, useRef } from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { Download, Expand, X } from 'lucide-react';

// NOTE: We register BarElement here instead of LineElement
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const BarChart = ({ cleanedFilePath }) => {
    const [columns, setColumns] = useState([]);
    const [numericColumns, setNumericColumns] = useState([]);
    const [xAxis, setXAxis] = useState('');
    const [yAxis, setYAxis] = useState('');
    const [chartData, setChartData] = useState(null);
    const [error, setError] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const chartRef = useRef(null);

    const chartOptions = {
        maintainAspectRatio: false,
        responsive: true,
        plugins: {
            legend: { labels: { color: '#e2e8f0' } },
            title: { display: true, text: yAxis && xAxis ? `${yAxis} by ${xAxis}` : 'Bar Chart', color: '#e2e8f0', font: { size: 16 } }
        },
        scales: {
            x: { ticks: { color: '#94a3b8' }, grid: { color: '#475569' } },
            y: { ticks: { color: '#94a3b8' }, grid: { color: '#475569' } }
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
            if (xAxis && yAxis) {
                setError('');
                setChartData(null);
                try {
                    const response = await fetch(`http://127.0.0.1:8000/api/get_graph_data?filepath=${cleanedFilePath}&x_axis=${xAxis}&y_axis=${yAxis}`);
                    
                    if (!response.ok) {
                        const errData = await response.json().catch(() => null);
                        throw new Error(errData?.detail || `Server error: ${response.statusText}`);
                    }
                    
                    const data = await response.json();
                    setChartData({
                        labels: data.labels,
                        datasets: [{
                            label: `${yAxis} by ${xAxis}`,
                            data: data.data,
                            // Different colors for the bar chart
                            borderColor: 'rgb(34, 197, 94)',
                            backgroundColor: 'rgba(34, 197, 94, 0.5)',
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
    }, [xAxis, yAxis, cleanedFilePath]);

    const handleDownload = () => {
        if (chartRef.current) {
            const link = document.createElement('a');
            link.href = chartRef.current.toBase64Image('image/jpeg', 1);
            link.download = `bar_chart_${yAxis}_by_${xAxis}.jpg`;
            link.click();
        }
    };

    // NOTE: This renders a <Bar /> component instead of <Line />
    const renderChart = () => (
        chartData ? <Bar ref={chartRef} data={chartData} options={chartOptions} /> : 
        <div className="flex items-center justify-center h-full text-slate-500">Please select X and Y axes to generate the chart.</div>
    );

    return (
        <div className="bg-slate-800/50 border border-slate-700 p-4 rounded-b-xl">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                    <label htmlFor="x-axis-select" className="block text-sm font-medium text-slate-400 mb-1">X Axis</label>
                    <select id="x-axis-select" value={xAxis} onChange={e => setXAxis(e.target.value)} className="w-full bg-slate-700 border border-slate-600 rounded-md p-2 text-slate-200">
                        <option value="" disabled>Select Column</option>
                        {columns.map(col => <option key={col} value={col}>{col}</option>)}
                    </select>
                </div>
                <div>
                    <label htmlFor="y-axis-select" className="block text-sm font-medium text-slate-400 mb-1">Y Axis</label>
                    <select id="y-axis-select" value={yAxis} onChange={e => setYAxis(e.target.value)} className="w-full bg-slate-700 border border-slate-600 rounded-md p-2 text-slate-200">
                        <option value="" disabled>Select Numeric Column</option>
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

export default BarChart;