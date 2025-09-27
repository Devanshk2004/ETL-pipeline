import React, { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const LineChart = ({ cleanedFilePath }) => {
    const [columns, setColumns] = useState([]);
    const [numericColumns, setNumericColumns] = useState([]);
    const [xAxis, setXAxis] = useState('');
    const [yAxis, setYAxis] = useState('');
    const [chartData, setChartData] = useState(null);
    const [error, setError] = useState('');

    // 1. Fetch column information when the component mounts
    useEffect(() => {
        const fetchColumnInfo = async () => {
            if (!cleanedFilePath) return;
            try {
                const response = await fetch(`http://127.0.0.1:8000/api/get_cleaned_data_info?filepath=${cleanedFilePath}`);
                if (!response.ok) throw new Error('Failed to fetch column info.');
                const data = await response.json();
                setColumns(data.columns);
                setNumericColumns(data.numeric_columns);
            } catch (err) {
                setError(err.message);
            }
        };
        fetchColumnInfo();
    }, [cleanedFilePath]);

    // 2. Fetch graph data when both axes are selected
    useEffect(() => {
        const fetchGraphData = async () => {
            if (xAxis && yAxis) {
                try {
                    const response = await fetch(`http://127.0.0.1:8000/api/get_graph_data?filepath=${cleanedFilePath}&x_axis=${xAxis}&y_axis=${yAxis}`);
                    if (!response.ok) throw new Error('Failed to fetch graph data.');
                    const data = await response.json();
                    setChartData({
                        labels: data.labels,
                        datasets: [{
                            label: `${yAxis} by ${xAxis}`,
                            data: data.data,
                            borderColor: 'rgb(129, 140, 248)',
                            backgroundColor: 'rgba(129, 140, 248, 0.5)',
                        }],
                    });
                } catch (err) {
                    setError(err.message);
                }
            }
        };
        fetchGraphData();
    }, [xAxis, yAxis, cleanedFilePath]);

    return (
        <div className="bg-slate-800/50 border border-slate-700 p-4 rounded-b-xl">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                {/* X-Axis Selector */}
                <div>
                    <label htmlFor="x-axis-select" className="block text-sm font-medium text-slate-400 mb-1">X Axis</label>
                    <select id="x-axis-select" value={xAxis} onChange={e => setXAxis(e.target.value)} className="w-full bg-slate-700 border border-slate-600 rounded-md p-2 text-slate-200">
                        <option value="" disabled>Select Column</option>
                        {columns.map(col => <option key={col} value={col}>{col}</option>)}
                    </select>
                </div>
                {/* Y-Axis Selector */}
                <div>
                    <label htmlFor="y-axis-select" className="block text-sm font-medium text-slate-400 mb-1">Y Axis</label>
                    <select id="y-axis-select" value={yAxis} onChange={e => setYAxis(e.target.value)} className="w-full bg-slate-700 border border-slate-600 rounded-md p-2 text-slate-200">
                        <option value="" disabled>Select Numeric Column</option>
                        {numericColumns.map(col => <option key={col} value={col}>{col}</option>)}
                    </select>
                </div>
            </div>
            <div className="mt-4 h-96 bg-slate-900 p-2 rounded-lg">
                {chartData ? <Line data={chartData} options={{ maintainAspectRatio: false, color: '#e2e8f0' }} /> : <div className="flex items-center justify-center h-full text-slate-500">Please select X and Y axes to generate the chart.</div>}
            </div>
            {error && <p className="mt-2 text-red-400">{error}</p>}
        </div>
    );
};

export default LineChart;