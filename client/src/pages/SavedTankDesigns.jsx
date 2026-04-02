import { useEffect, useState } from 'react'
import axios from 'axios';
import * as XLSX from 'xlsx';

// ── Helper: format date ───────────────────────────────────
function fmtDate(iso) {
    if (!iso) return '—';
    return new Date(iso).toLocaleDateString('en-IN', {
        day: '2-digit', month: 'short', year: 'numeric',
        hour: '2-digit', minute: '2-digit'
    })
}

// ── Status Badge ──────────────────────────────────────────
const CheckBadge = ({ ok, label }) => (
    ok
        ? <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-400/60 text-emerald-900 border border-emerald-700">✓ {label ?? 'OK'}</span>
        : <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-red-400/60 text-red-900 border border-red-700">✗ {label ?? 'Fail'}</span>
)

// ── Column Header Badge ───────────────────────────────────
const Tag = ({ type }) => (
    <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded mr-1
        ${type === 'INPUT' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'}`}>
        {type}
    </span>
)

// ── COLUMNS definition ────────────────────────────────────
const COLUMNS = [
    { label: 'Tank Name', tag: 'INPUT', render: r => r.tank_name },
    { label: 'B.C.D (m)', tag: 'INPUT', render: r => r.inputs?.bcd },
    { label: 'Eqpt Height (m)', tag: 'INPUT', render: r => r.inputs?.totalHeightEqpt },
    { label: 'FDN Depth (m)', tag: 'INPUT', render: r => r.inputs?.depthFdnRaft },
    { label: 'Max Ring Soil', tag: 'RESULT', render: r => r.results?.check1_Pmax_ring != null ? Number(r.results.check1_Pmax_ring).toFixed(1) : '-' },
    { label: 'Max Inside Soil', tag: 'RESULT', render: r => r.results?.check1_Pmax_inside != null ? Number(r.results.check1_Pmax_inside).toFixed(1) : '-' },
    { label: 'FOS Sliding', tag: 'RESULT', render: r => r.results?.FOS_sliding != null ? Number(r.results.FOS_sliding).toFixed(2) : '-' },
    { label: 'FOS Overturning', tag: 'RESULT', render: r => r.results?.FOS_overturning != null ? Number(r.results.FOS_overturning).toFixed(2) : '-' },
    { label: 'Soil Check', tag: 'RESULT', render: r => <CheckBadge ok={r.results?.check1_ring_OK && r.results?.check1_inside_OK} /> },
    { label: 'Sliding', tag: 'RESULT', render: r => <CheckBadge ok={r.results?.sliding_OK} /> },
    { label: 'Overturning', tag: 'RESULT', render: r => <CheckBadge ok={r.results?.overturning_OK} /> },
    { label: 'Overall', tag: 'RESULT', render: r => <CheckBadge ok={r.results?.conclusion?.allChecksPass} label={r.results?.conclusion?.allChecksPass ? 'SAFE' : 'UNSAFE'} /> },
    { label: 'Saved At', tag: 'INPUT', render: r => fmtDate(r.created_at) },
]

// ── Excel column definitions (plain-text values only) ────────
const EXCEL_COLUMNS = [
    { header: 'Tank Name', value: r => r.tank_name },
    { header: 'B.C.D (m)', value: r => r.inputs?.bcd },
    { header: 'Eqpt Height (m)', value: r => r.inputs?.totalHeightEqpt },
    { header: 'FDN Depth (m)', value: r => r.inputs?.depthFdnRaft },
    { header: 'Max Ring Soil', value: r => r.results?.check1_Pmax_ring != null ? Number(r.results.check1_Pmax_ring).toFixed(1) : '' },
    { header: 'Max Inside Soil', value: r => r.results?.check1_Pmax_inside != null ? Number(r.results.check1_Pmax_inside).toFixed(1) : '' },
    { header: 'FOS Sliding', value: r => r.results?.FOS_sliding != null ? Number(r.results.FOS_sliding).toFixed(2) : '' },
    { header: 'FOS Overturning', value: r => r.results?.FOS_overturning != null ? Number(r.results.FOS_overturning).toFixed(2) : '' },
    { header: 'Soil Check', value: r => (r.results?.check1_ring_OK && r.results?.check1_inside_OK) ? 'OK' : 'Fail' },
    { header: 'Sliding Check', value: r => r.results?.sliding_OK ? 'OK' : 'Fail' },
    { header: 'Overturning Check', value: r => r.results?.overturning_OK ? 'OK' : 'Fail' },
    { header: 'Overall Status', value: r => r.results?.conclusion?.allChecksPass ? 'SAFE' : 'UNSAFE' },
    { header: 'Saved At', value: r => fmtDate(r.created_at) },
];

export default function SavedTankDesigns() {
    const [designs, setDesigns] = useState([]);
    const [loading, setLoading] = useState(true);

    // Edit and Delete states
    const [deletingId, setDeletingId] = useState(null);
    const [editingDesign, setEditingDesign] = useState(null);
    const [editForm, setEditForm] = useState({ tank_name: '' });
    const [isSaving, setIsSaving] = useState(false);

    // Pagination states
    const [currentPage, setCurrentPage] = useState(1);
    const ITEMS_PER_PAGE = 8;

    useEffect(() => {
        axios.get('/api/tankdesigns')
            .then(res => {
                if (res.data && res.data.data) {
                    setDesigns(res.data.data);
                }
                setLoading(false);
            })
            .catch(err => {
                console.error('Failed to fetch tank designs', err);
                setLoading(false);
            })
    }, []);

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this tank design?')) return;
        setDeletingId(id);
        try {
            await axios.delete(`/api/tankdesigns/${id}`);
            setDesigns(prev => prev.filter(d => d.id !== id));
        } catch (err) {
            console.error('Failed to delete design', err);
            alert('Failed to delete design');
        } finally {
            setDeletingId(null);
        }
    };

    const handleEditClick = (row) => {
        setEditingDesign(row);
        setEditForm({ tank_name: row.tank_name || '' });
    };

    const handleEditSubmit = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            const res = await axios.put(`/api/tankdesigns/${editingDesign.id}`, editForm);
            setDesigns(prev => prev.map(d => d.id === editingDesign.id ? res.data.data : d));
            setEditingDesign(null);
        } catch (err) {
            console.error('Failed to update design', err);
            alert('Failed to save changes');
        } finally {
            setIsSaving(false);
        }
    };

    // ── Export to Excel ───────────────────────────────────────
    const handleExportExcel = () => {
        if (designs.length === 0) {
            alert('No designs to export.');
            return;
        }

        // Build rows
        const headers = EXCEL_COLUMNS.map(c => c.header);
        const rows = designs.map(r => EXCEL_COLUMNS.map(c => c.value(r)));

        const wsData = [headers, ...rows];
        const ws = XLSX.utils.aoa_to_sheet(wsData);

        // Column widths
        ws['!cols'] = EXCEL_COLUMNS.map(() => ({ wch: 18 }));

        // Bold header row style
        headers.forEach((_, ci) => {
            const cellRef = XLSX.utils.encode_cell({ r: 0, c: ci });
            if (ws[cellRef]) {
                ws[cellRef].s = {
                    font: { bold: true, color: { rgb: 'FFFFFF' } },
                    fill: { patternType: 'solid', fgColor: { rgb: '4F46E5' } }, // indigo-600
                    alignment: { horizontal: 'center' },
                };
            }
        });

        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Tank Designs');

        const today = new Date().toISOString().slice(0, 10);
        XLSX.writeFile(wb, `Tank_Designs_${today}.xlsx`);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center">
                <div className="text-gray-900 text-xl font-medium">Loading tank designs...</div>
            </div>
        );
    }

    const totalPages = Math.ceil(designs.length / ITEMS_PER_PAGE);
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const currentData = designs.slice(startIndex, startIndex + ITEMS_PER_PAGE);

    return (
        <div className="min-h-screen bg-[#f8fafc]">
            {/* Header */}
            <header className="border-b border-gray-200 bg-white/80 backdrop-blur sticky top-0 z-10">
                <div className="max-w-7xl mx-auto pl-14 pr-4 sm:pl-16 sm:pr-6 lg:px-8 py-4 flex items-center gap-3 sm:gap-4">
                    <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                        TD
                    </div>
                    <div>
                        <h1 className="text-base font-semibold text-gray-900 leading-tight">Saved Tank Designs</h1>
                        <p className="text-xs text-gray-500">All tank foundations saved to database</p>
                    </div>
                    <div className="ml-auto flex items-center gap-3">
                        {/* Export to Excel */}
                        <button
                            onClick={handleExportExcel}
                            disabled={designs.length === 0}
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed text-white transition-all duration-200 shadow-sm"
                            title="Export all saved tank designs to Excel"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                            </svg>
                            Export Excel
                        </button>
                        <a href="/app/tank-foundation"
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-white hover:bg-gray-50 text-gray-700 transition-all duration-200 border border-gray-200 shadow-sm">
                            ← Calculator
                        </a>
                    </div>
                </div>
            </header>

            {/* Main */}
            <main className="max-w-full px-4 sm:px-6 lg:px-8 py-8">
                {/* Stats bar */}
                <div className="flex flex-wrap gap-4 mb-6">
                    <div className="bg-white border border-gray-200 shadow-sm rounded-xl px-5 py-3 flex items-center gap-3">
                        <span className="text-2xl font-bold text-gray-900">{designs.length}</span>
                        <span className="text-xs text-gray-500">Total Designs</span>
                    </div>
                    <div className="bg-white border border-gray-200 shadow-sm rounded-xl px-5 py-3 flex items-center gap-3">
                        <span className="text-2xl font-bold text-emerald-600">
                            {designs.filter(d => d.results?.conclusion?.allChecksPass).length}
                        </span>
                        <span className="text-xs text-gray-500">All Checks Passed</span>
                    </div>
                    <div className="bg-white border border-gray-200 shadow-sm rounded-xl px-5 py-3 flex items-center gap-3">
                        <span className="text-2xl font-bold text-red-600">
                            {designs.filter(d => !d.results?.conclusion?.allChecksPass).length}
                        </span>
                        <span className="text-xs text-gray-500">Needs Attention</span>
                    </div>
                </div>

                {/* Table */}
                <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left whitespace-nowrap">
                            <thead>
                                <tr className="border-b border-gray-200 bg-gray-50/80">
                                    {COLUMNS.map(col => (
                                        <th key={col.label} className="px-4 py-3 text-xs font-medium text-gray-500 tracking-wide">
                                            <Tag type={col.tag} />
                                            {col.label}
                                        </th>
                                    ))}
                                    <th className="px-4 py-3 text-xs font-medium text-gray-500 tracking-wide text-right sticky right-0 bg-gray-50/80">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {designs.length === 0 ? (
                                    <tr>
                                        <td colSpan={COLUMNS.length + 1} className="px-4 py-8 text-center text-gray-500">
                                            No tank designs saved yet.
                                        </td>
                                    </tr>
                                ) : (
                                    currentData.map((row, i) => (
                                        <tr key={row.id}
                                            className={`border-b border-gray-100 transition-colors hover:bg-gray-50/60
                                                ${i % 2 === 0 ? 'bg-white' : 'bg-gray-50/40'}`}>
                                            {COLUMNS.map(col => (
                                                <td key={col.label} className="px-4 py-3 text-gray-700">
                                                    {col.render(row)}
                                                </td>
                                            ))}
                                            <td className="px-4 py-3 text-right sticky right-0 bg-inherit shadow-[-4px_0_8px_rgba(0,0,0,0.02)]">
                                                <div className="flex items-center justify-end gap-1">
                                                    <button
                                                        onClick={() => handleEditClick(row)}
                                                        className="p-1.5 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                                                        title="Edit Design Name"
                                                    >
                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                            <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                                        </svg>
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(row.id)}
                                                        disabled={deletingId === row.id}
                                                        className={`p-1.5 text-red-600 hover:bg-red-100 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-red-500/40 ${deletingId === row.id ? 'opacity-50 cursor-not-allowed' : ''}`}
                                                        title="Delete Design"
                                                    >
                                                        {deletingId === row.id ? (
                                                            <span className="w-4 h-4 border-2 border-red-600/40 border-t-red-600 rounded-full animate-spin flex-shrink-0 flex"></span>
                                                        ) : (
                                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                                <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                            </svg>
                                                        )}
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200 bg-white">
                            <span className="text-sm text-gray-700">
                                Showing <span className="font-medium">{startIndex + 1}</span> to{' '}
                                <span className="font-medium">{Math.min(startIndex + ITEMS_PER_PAGE, designs.length)}</span> of{' '}
                                <span className="font-medium">{designs.length}</span> results
                            </span>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                    disabled={currentPage === 1}
                                    className="px-3 py-1 text-sm bg-white border border-gray-300 rounded-md disabled:opacity-50 hover:bg-gray-50 transition-colors"
                                >
                                    Previous
                                </button>
                                <button
                                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                    disabled={currentPage === totalPages}
                                    className="px-3 py-1 text-sm bg-white border border-gray-300 rounded-md disabled:opacity-50 hover:bg-gray-50 transition-colors"
                                >
                                    Next
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </main>

            {/* Edit Modal */}
            {editingDesign && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
                            <h3 className="font-semibold text-gray-900">Edit Tank Name</h3>
                            <button
                                onClick={() => setEditingDesign(null)}
                                className="text-gray-400 hover:text-gray-600 transition-colors"
                            >
                                ✕
                            </button>
                        </div>
                        <form onSubmit={handleEditSubmit} className="p-5">
                            <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">Tank/Design Name</label>
                                <input
                                    type="text"
                                    required
                                    value={editForm.tank_name}
                                    onChange={e => setEditForm({ ...editForm, tank_name: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-colors"
                                    placeholder="e.g. Tank 1"
                                />
                            </div>
                            <div className="mt-6 flex justify-end gap-2">
                                <button
                                    type="button"
                                    onClick={() => setEditingDesign(null)}
                                    className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSaving}
                                    className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors flex items-center gap-2"
                                >
                                    {isSaving ? (
                                        <><span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin"></span> Saving...</>
                                    ) : 'Save Changes'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}
