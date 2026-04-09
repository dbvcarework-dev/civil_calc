import React, { useState, useEffect } from 'react'
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';

const SavedWindLoad = () => {
    const navigate = useNavigate();
    const [windLoads, setWindLoads] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    const COLUMNS = [
        { label: 'Project Name', key: 'project_name' },
        { label: 'City', render: (item) => item.inputs?.city || '-' },
        { 
            label: 'Dimensions (H×W×L)', 
            render: (item) => `${item.inputs?.H || 0} × ${item.inputs?.W || 0} × ${item.inputs?.L || 0}` 
        },
        { 
            label: 'Design Pressure (Pd)', 
            render: (item) => item.results?.pd != null ? `${Number(item.results.pd).toFixed(3)} kN/m²` : '-' 
        },
        {
            label: 'Date Saved',
            render: (item) => new Date(item.created_at).toLocaleDateString('en-GB', {
                day: '2-digit',
                month: 'short',
                year: 'numeric'
            })
        },
        {
            label: 'User ID',
            key: 'user_id'
        }
    ];

    useEffect(() => {
        fetchWindLoads();
    }, []);

    const fetchWindLoads = async () => {
        try {
            setIsLoading(true);
            const response = await axios.get('/api/windload');
            setWindLoads(response.data.data || []);
            setError(null);
        } catch (error) {
            console.error('Error fetching wind loads:', error);
            setError('Failed to load saved wind load designs.');
        } finally {
            setIsLoading(false);
        }
    }

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this design?')) return;

        try {
            await axios.delete(`/api/windload/${id}`);
            setWindLoads(windLoads.filter(d => d.id !== id));
        } catch (err) {
            console.error('Delete error:', err);
            alert('Failed to delete design.');
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="border-b border-gray-200 bg-white/80 backdrop-blur sticky top-0 z-10">
                <div className="max-w-7xl mx-auto pl-14 pr-4 sm:pl-16 sm:pr-6 lg:px-8 py-4 flex items-center gap-3 sm:gap-4">
                    <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                        WL
                    </div>
                    <div>
                        <h1 className="text-base font-semibold text-gray-900 leading-tight">Wind Load Calculator</h1>
                        <p className="text-xs text-gray-500">Saved Design History</p>
                    </div>

                    <div className="ml-auto">
                        <Link to="/app/wind-load-calc"
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-white hover:bg-gray-50 text-gray-700 transition-all duration-200 border border-gray-200 shadow-sm">
                            ← Back to Calculator
                        </Link>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto h-[75vh] px-4 sm:px-6 lg:px-8 py-8">
                <div className="section-card">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-lg font-semibold text-gray-900">Recent Saved Designs</h2>
                    </div>

                    {isLoading ? (
                        <div className="py-20 flex flex-col items-center justify-center gap-3">
                            <div className="w-8 h-8 border-2 border-indigo-600/20 border-t-indigo-600 rounded-full animate-spin"></div>
                            <p className="text-sm text-gray-500 font-medium">Fetching history...</p>
                        </div>
                    ) : error ? (
                        <div className="py-20 text-center">
                            <p className="text-red-500 text-sm font-medium">{error}</p>
                            <button onClick={fetchWindLoads} className="mt-4 text-indigo-600 text-sm font-medium hover:underline">Try Again</button>
                        </div>
                    ) : windLoads.length === 0 ? (
                        <div className="py-20 text-center">
                            <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center text-2xl mx-auto mb-4 grayscale">📂</div>
                            <p className="text-gray-900 font-semibold text-sm">No saved designs found</p>
                            <p className="text-gray-500 text-xs mt-1">Designs you save in the calculator will appear here.</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse cursor-pointer">
                                <thead>
                                    <tr className="border-b border-gray-100 bg-gray-50/50">
                                        {COLUMNS.map((col, idx) => (
                                            <th key={idx} className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider uppercase">
                                                {col.label}
                                            </th>
                                        ))}
                                        <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {windLoads.map((item) => (
                                        <tr onClick={() => navigate(`/app/wind-load-calc/${item.id}`)} key={item.id} className="hover:bg-gray-100/50 transition-colors group">
                                            {COLUMNS.map((col, idx) => (
                                                <td key={idx} className="px-4 py-4 text-sm whitespace-nowrap">
                                                    {col.render ? col.render(item) : (
                                                        <span className={idx === 0 ? "font-semibold text-gray-900" : "text-gray-600"}>
                                                            {item[col.key]}
                                                        </span>
                                                    )}
                                                </td>
                                            ))}
                                            <td className="px-4 py-4 text-right whitespace-nowrap">
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); handleDelete(item.id); }}
                                                    className="inline-flex items-center justify-center w-8 h-8 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-all duration-200"
                                                    title="Delete Design"
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                    </svg>
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </main>

            <footer className="border-t border-gray-200 mt-12 py-4 text-center text-xs text-gray-500">
                IS 875 (Part 3) : 2015 · Wind Load Method · Records are private to your session
            </footer>
        </div>
    )
}

export default SavedWindLoad