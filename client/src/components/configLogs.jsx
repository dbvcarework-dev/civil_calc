import React, { useState, useEffect } from 'react';
import axios from 'axios';

const ConfigLogs = ({ isOpen, onClose, apiUrl, title = 'Configuration Change History' }) => {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!isOpen) return;
        setLoading(true);
        axios.get(apiUrl, { withCredentials: true })
            .then(res => {
                setLogs(res.data);
                console.log(res.data);
            })
            .catch(err => console.error('Failed to fetch logs:', err))
            .finally(() => setLoading(false));
    }, [isOpen, apiUrl]);

    if (!isOpen) return null;

    // Group logs by change_group_id
    const grouped = logs.reduce((acc, log) => {
        const key = log.change_group_id || log.id;
        if (!acc[key]) acc[key] = [];
        acc[key].push(log);
        return acc;
    }, {});

    const groups = Object.values(grouped);

    return (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm" onClick={onClose} />

            <div className="relative bg-white w-full max-w-2xl max-h-[80vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-gray-100">
                {/* Header */}
                <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50 shrink-0">
                    <h2 className="text-lg font-bold text-gray-900">{title}</h2>
                    <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-xl transition-colors text-gray-500">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
                    {loading ? (
                        <p className="text-center text-gray-400 py-8">Loading logs...</p>
                    ) : groups.length === 0 ? (
                        <p className="text-center text-gray-400 py-8">No configuration changes recorded yet.</p>
                    ) : (
                        <div className="space-y-4">
                            {groups.map((group, i) => {
                                const first = group[0];
                                const ts = first.changed_at || first.created_at;
                                return (
                                    <div key={first.change_group_id || i} className="bg-gray-50 rounded-xl border border-gray-100 overflow-hidden">
                                        {/* Group Header */}
                                        <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between bg-gray-100/60">
                                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                                <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                                </svg>
                                                {first.user_id ? (
                                                    <span className="font-semibold text-gray-800">{first.user_id}</span>
                                                ) : first.user_name ? (
                                                    <span className="font-semibold text-gray-800">{first.user_name}</span>
                                                ) : (
                                                    <span className="font-semibold text-gray-800">User</span>
                                                )}
                                                <span className="text-gray-300">•</span>
                                                <span className="text-gray-500 font-medium">{group.length} change{group.length > 1 ? 's' : ''}</span>
                                            </div>
                                            {ts && (
                                                <time className="text-xs text-gray-400 font-medium">
                                                    {new Date(ts).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                                                </time>
                                            )}
                                        </div>

                                        {/* Changes List */}
                                        <div className="divide-y divide-gray-100">
                                            {group.map((log) => (
                                                <div key={log.id} className="px-5 py-2.5 text-sm text-gray-700">
                                                    {'changed '}
                                                    <span className="font-mono text-xs bg-gray-200/70 px-1.5 py-0.5 rounded text-gray-800">{log.field}</span>
                                                    {' from '}
                                                    <span className="text-gray-400 line-through">{log.old_value}</span>
                                                    <span className="text-gray-400 mx-1">→</span>
                                                    <span className="font-semibold text-emerald-600">{log.new_value}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ConfigLogs;
