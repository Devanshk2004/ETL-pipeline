import React, { useState } from 'react';
import LineChart from '../graphs/LineChart';
import BarChart from '../graphs/BarChart'; // Import the new BarChart component
import { TrendingUp, BarChart3, PieChart } from 'lucide-react';

const DashboardView = ({ cleanedFilePath, resetState }) => {
    const [activeGraph, setActiveGraph] = useState(null); // 'line', 'bar', or 'pie'

    const renderGraphConfig = () => {
        switch (activeGraph) {
            case 'line':
                return <LineChart cleanedFilePath={cleanedFilePath} />;
            case 'bar':
                // Add the case to render the BarChart component
                return <BarChart cleanedFilePath={cleanedFilePath} />;
            case 'pie':
                 return <div className="bg-slate-800/50 border border-slate-700 p-4 rounded-b-xl text-center text-slate-400">Pie chart configuration coming soon!</div>;
            default:
                return null;
        }
    };

    return (
        <div className="w-full">
            <h2 className="text-2xl font-bold text-slate-100 text-center mb-8">Select a Chart to Visualize Your Data</h2>
            <div className="space-y-4 max-w-2xl mx-auto">
                {/* Line Chart Option */}
                <div className="rounded-xl overflow-hidden">
                    <button onClick={() => setActiveGraph(activeGraph === 'line' ? null : 'line')} className="w-full h-40 bg-slate-800 hover:bg-slate-700/50 transition-colors p-6 flex items-end justify-end relative border border-slate-700">
                         <TrendingUp size={80} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-slate-700" />
                        <span className="text-xl font-semibold text-slate-200 z-10">Line Chart</span>
                    </button>
                    {activeGraph === 'line' && renderGraphConfig()}
                </div>
                
                {/* Bar Chart Option */}
                 <div className="rounded-xl overflow-hidden">
                    <button onClick={() => setActiveGraph(activeGraph === 'bar' ? null : 'bar')} className="w-full h-40 bg-slate-800 hover:bg-slate-700/50 transition-colors p-6 flex items-end justify-end relative border border-slate-700">
                        <BarChart3 size={80} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-slate-700" />
                        <span className="text-xl font-semibold text-slate-200 z-10">Bar Chart</span>
                    </button>
                    {activeGraph === 'bar' && renderGraphConfig()}
                </div>

                {/* Pie Chart Option */}
                 <div className="rounded-xl overflow-hidden">
                    <button onClick={() => setActiveGraph(activeGraph === 'pie' ? null : 'pie')} className="w-full h-40 bg-slate-800 hover:bg-slate-700/50 transition-colors p-6 flex items-end justify-end relative border border-slate-700">
                        <PieChart size={80} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-slate-700" />
                        <span className="text-xl font-semibold text-slate-200 z-10">Pie Chart</span>
                    </button>
                    {activeGraph === 'pie' && renderGraphConfig()}
                </div>
            </div>
             <div className="text-center mt-8">
                <button onClick={resetState} className="text-slate-400 hover:text-slate-200">or Start Over</button>
            </div>
        </div>
    );
};

export default DashboardView;