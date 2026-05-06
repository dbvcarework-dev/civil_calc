import React, { useState, useEffect } from 'react'
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';

const SavedTankDesigns = () => {
    const navigate = useNavigate();
    const [tankDesigns, setTankDesigns] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const pageSize = 6;
    const totalPages = Math.ceil(tankDesigns.length / pageSize);
    const currentTankDesigns = tankDesigns.slice((currentPage - 1) * pageSize, currentPage * pageSize);

    const COLUMNS = [
        { label: 'Tank Name', key: 'tank_name' },
        {
            label: 'Geometry (D×H)',
            render: (item) => `${item.inputs?.tankID || 0} × ${item.inputs?.totalHeightEqpt || 0} m`
        },
        {
            label: 'Operating Weight',
            render: (item) => item.inputs?.operatingWtTank != null ? `${item.inputs.operatingWtTank} kN` : '-'
        },
        {
            label: 'Max Soil Pressure',
            render: (item) => item.results?.check1_Pmax_ring != null ? `${Number(item.results.check1_Pmax_ring).toFixed(2)} kN/m²` : '-'
        },
        {
            label: 'Status',
            render: (item) => {
                const isOk = item.results?.conclusion?.allChecksPass;
                return (
                    <span className={isOk ? 'badge-ok' : 'badge-fail'}>
                        {isOk ? '✓ OK' : '✗ Failed'}
                    </span>
                );
            }
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
            lable: 'User id',
            key: 'user_id'
        }

    ];

    useEffect(() => {
        fetchTankDesigns();
    }, []);

    const fetchTankDesigns = async () => {
        try {
            setIsLoading(true);
            const response = await axios.get('/api/tankdesigns');
            setTankDesigns(response.data.data || []);
            setError(null);
        } catch (error) {
            console.error('Error fetching tank designs:', error);
            setError('Failed to load saved tank foundation designs.');
        } finally {
            setIsLoading(false);
        }
    }

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this design?')) return;

        try {
            await axios.delete(`/api/tankdesigns/${id}`);
            setTankDesigns(tankDesigns.filter(d => d.id !== id));
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
                        TF
                    </div>
                    <div>
                        <h1 className="text-base font-semibold text-gray-900 leading-tight">Tank Foundation</h1>
                        <p className="text-xs text-gray-500">Saved Design History</p>
                    </div>

                    <div className="ml-auto">
                        <Link to="/app/tank-foundation"
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
                            <button onClick={fetchTankDesigns} className="mt-4 text-indigo-600 text-sm font-medium hover:underline">Try Again</button>
                        </div>
                    ) : tankDesigns.length === 0 ? (
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
                                            <th key={idx} className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                                {col.label}
                                            </th>
                                        ))}
                                        <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {currentTankDesigns.map((item) => (
                                        <tr onClick={() => navigate(`/app/tank-foundation/${item.id}`)} key={item.id} className="hover:bg-gray-100/50 transition-colors group">
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
                            {totalPages > 1 && (
                                <div className="flex justify-between items-center px-4 py-4 bg-white border-t border-gray-100">
                                    <div className="text-sm text-gray-500">
                                        Showing <span className="font-medium text-gray-900">{(currentPage - 1) * pageSize + 1}</span> to <span className="font-medium text-gray-900">{Math.min(currentPage * pageSize, tankDesigns.length)}</span> of <span className="font-medium text-gray-900">{tankDesigns.length}</span> results
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                            disabled={currentPage === 1}
                                            className="px-3 py-1 text-sm border rounded-lg text-gray-600 disabled:opacity-50 hover:bg-gray-50 transition-colors"
                                        >
                                            Previous
                                        </button>
                                        <button
                                            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                            disabled={currentPage === totalPages}
                                            className="px-3 py-1 text-sm border rounded-lg text-gray-600 disabled:opacity-50 hover:bg-gray-50 transition-colors"
                                        >
                                            Next
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </main>

            <footer className="border-t border-gray-200 mt-12 py-4 text-center text-xs text-gray-500">
                IS 456 : 2000 · Ring Beam Foundation · Records are private to your session
            </footer>
        </div>
    )
}

export default SavedTankDesigns