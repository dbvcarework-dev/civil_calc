import { useEffect, useState } from 'react'
import axios from 'axios';
import * as XLSX from 'xlsx';


// ── Helper: format date ───────────────────────────────────
function fmtDate(iso) {
    return new Date(iso).toLocaleDateString('en-IN', {
        day: '2-digit', month: 'short', year: 'numeric',
        hour: '2-digit', minute: '2-digit'
    })
}

// ── Helper: bars string ───────────────────────────────────
function barsStr(count, dia) {
    if (!count || !dia) return '—'
    return `${count} * T${dia}`
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
    { label: 'Beam', tag: 'INPUT', render: r => r.beam_name },
    { label: 'Position', tag: 'INPUT', render: r => r.beam_type },
    { label: 'b × D (mm)', tag: 'INPUT', render: r => `${r.b} × ${r.d_total}` },
    { label: 'Mu (kN·m)', tag: 'INPUT', render: r => r.mu },
    { label: 'Mulim (kN·m)', tag: 'RESULT', render: r => r.mulim != null ? Number(r.mulim).toFixed(1) : '-' },
    { label: 'Pt req', tag: 'RESULT', render: r => r.pt_req != null ? Number(r.pt_req).toFixed(3) : '-' },
    { label: 'Ast Req (mm²)', tag: 'RESULT', render: r => r.ast_req != null ? Number(r.ast_req).toFixed(1) : '-' },
    { label: 'Bar 1 Count', tag: 'INPUT', render: r => `${r.bar1_count || 0}` },
    { label: 'Bar 1 Dia', tag: 'INPUT', render: r => `${r.bar1_dia || 0}` },
    { label: 'Bar 2 Count', tag: 'INPUT', render: r => `${r.bar2_count || 0}` },
    { label: 'Bar 2 Dia', tag: 'INPUT', render: r => `${r.bar2_dia || 0}` },
    { label: 'Ast Prov (mm²)', tag: 'RESULT', render: r => r.ast_prov != null ? Number(r.ast_prov).toFixed(1) : '-' },
    { label: 'Pt Prov', tag: 'RESULT', render: r => r.pt_prov != null ? Number(r.pt_prov).toFixed(3) : '-' },
    { label: 'Vu (kN)', tag: 'INPUT', render: r => r.vu },
    { label: 'Stirrup Sp.', tag: 'RESULT', render: r => `${r.stirrup_spacing} mm` },
    { label: 'Moment', tag: 'RESULT', render: r => <CheckBadge ok={r.mu_check === 'OK'} /> },
    { label: 'Steel', tag: 'RESULT', render: r => <CheckBadge ok={r.steel_check === 'OK'} /> },
    { label: 'Shear', tag: 'RESULT', render: r => <CheckBadge ok={r.stirrup_check === 'OK'} /> },
    { label: 'Section', tag: 'RESULT', render: r => <CheckBadge ok={r.shear_section_ok} /> },
    { label: 'User ID', render: r => r.user_id },
    { label: 'Saved At', render: r => fmtDate(r.created_at) },

]



// ── Excel column definitions (plain-text values only) ────────
const EXCEL_COLUMNS = [
    { header: 'Beam Name', value: r => r.beam_name },
    { header: 'Position', value: r => r.beam_type },
    { header: 'b (mm)', value: r => r.b },
    { header: 'D Total (mm)', value: r => r.d_total },
    { header: 'Mu (kN·m)', value: r => r.mu },
    { header: 'Mulim (kN·m)', value: r => r.mulim != null ? Number(r.mulim).toFixed(1) : '' },
    { header: 'Pt Req', value: r => r.pt_req != null ? Number(r.pt_req).toFixed(3) : '' },
    { header: 'Ast Req (mm²)', value: r => r.ast_req != null ? Number(r.ast_req).toFixed(1) : '' },
    { header: 'Bar 1 Count', value: r => r.bar1_count ?? '' },
    { header: 'Bar 1 Dia (mm)', value: r => r.bar1_dia ?? '' },
    { header: 'Bar 2 Count', value: r => r.bar2_count ?? '' },
    { header: 'Bar 2 Dia (mm)', value: r => r.bar2_dia ?? '' },
    { header: 'Ast Prov (mm²)', value: r => r.ast_prov != null ? Number(r.ast_prov).toFixed(1) : '' },
    { header: 'Pt Prov', value: r => r.pt_prov != null ? Number(r.pt_prov).toFixed(3) : '' },
    { header: 'Vu (kN)', value: r => r.vu },
    { header: 'Stirrup Sp. (mm)', value: r => r.stirrup_spacing },
    { header: 'Moment Check', value: r => r.mu_check === 'OK' ? 'OK' : 'Fail' },
    { header: 'Steel Check', value: r => r.steel_check === 'OK' ? 'OK' : 'Fail' },
    { header: 'Shear Check', value: r => r.stirrup_check === 'OK' ? 'OK' : 'Fail' },
    { header: 'Section Check', value: r => r.shear_section_ok ? 'OK' : 'Fail' },
    { header: 'Saved At', value: r => fmtDate(r.created_at) },
];

// ── Page ──────────────────────────────────────────────────
export default function SavedDesign() {
    const [designs, setDesigns] = useState([]);
    const [loading, setLoading] = useState(true);

    // Edit and Delete states
    const [deletingId, setDeletingId] = useState(null);
    const [editingDesign, setEditingDesign] = useState(null);
    const [editForm, setEditForm] = useState({ beam_name: '', beam_type: '', Mu: '', Mulim: '', AstReq: '', AstProv: '', Vu: '', StirrupSpacing: '', MuCheck: '', SteelCheck: '', ShearCheck: '', ShearSectionOk: '', Bar1Count: '', Bar1Dia: '', Bar2Count: '', Bar2Dia: '' });
    const [isSaving, setIsSaving] = useState(false);

    // Pagination states
    const [currentPage, setCurrentPage] = useState(1);
    const ITEMS_PER_PAGE = 8;

    useEffect(() => {
        axios.get('/api/saved-designs')
            .then(res => {
                if (res.data && res.data.data) {
                    setDesigns(res.data.data);
                }
                setLoading(false);
            })
            .catch(err => {
                console.error('Failed to fetch designs', err);
                setLoading(false);
            })
    }, []);


    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this design?')) return;
        setDeletingId(id);
        try {
            await axios.delete(`/api/saveddesigns/${id}`);
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
        setEditForm({
            beam_name: row.beam_name || '',
            beam_type: row.beam_type || '',
            Mu: row.mu || '',
            Mulim: row.mulim || '',
            AstReq: row.ast_req || '',
            AstProv: row.ast_prov || '',
            Vu: row.vu || '',
            StirrupSpacing: row.stirrup_spacing || '',
            MuCheck: row.mu_check || '',
            SteelCheck: row.steel_check || '',
            ShearCheck: row.stirrup_check || '',
            ShearSectionOk: row.shear_section_ok !== undefined ? String(row.shear_section_ok) : '',
            Bar1Count: row.bar1_count || '',
            Bar1Dia: row.bar1_dia || '',
            Bar2Count: row.bar2_count || '',
            Bar2Dia: row.bar2_dia || ''
        });
    };

    const handleEditSubmit = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            const res = await axios.put(`/api/saveddesigns/${editingDesign.id}`, editForm);
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
                    fill: { patternType: 'solid', fgColor: { rgb: '7C3AED' } },
                    alignment: { horizontal: 'center' },
                };
            }
        });

        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Beam Designs');

        const today = new Date().toISOString().slice(0, 10);
        XLSX.writeFile(wb, `Beam_Designs_${today}.xlsx`);
    };


    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-gray-900 text-xl font-medium">Loading designs...</div>
            </div>
        );
    }

    // Derived pagination logic
    const totalPages = Math.ceil(designs.length / ITEMS_PER_PAGE);
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const currentData = designs.slice(startIndex, startIndex + ITEMS_PER_PAGE);

    return (
        <div className="min-h-screen bg-gray-50">

            {/* Header */}
            <header className="border-b border-gray-200 bg-white/80 backdrop-blur sticky top-0 z-10">
                <div className="max-w-7xl mx-auto pl-14 pr-4 sm:pl-16 sm:pr-6 lg:px-8 py-4 flex items-center gap-3 sm:gap-4">
                    <div className="w-8 h-8 rounded-lg bg-purple-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                        SD
                    </div>
                    <div>
                        <h1 className="text-base font-semibold text-gray-900 leading-tight">Saved Designs</h1>
                        <p className="text-xs text-gray-500">All beam designs saved to database</p>
                    </div>
                    <div className="ml-auto flex items-center gap-3">
                        {/* Export to Excel */}
                        <button
                            onClick={handleExportExcel}
                            disabled={designs.length === 0}
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed text-white transition-all duration-200 shadow-sm"
                            title="Export all saved designs to Excel"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                            </svg>
                            Export Excel
                        </button>
                        <a href="/app/beam-design"
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
                            {designs.filter(d => d.mu_check === 'OK' && d.steel_check === 'OK' && d.stirrup_check === 'OK').length}
                        </span>
                        <span className="text-xs text-gray-500">All Checks Passed</span>
                    </div>
                    <div className="bg-white border border-gray-200 shadow-sm rounded-xl px-5 py-3 flex items-center gap-3">
                        <span className="text-2xl font-bold text-red-600">
                            {designs.filter(d => d.mu_check !== 'OK' || d.steel_check !== 'OK' || d.stirrup_check !== 'OK').length}
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
                                            No designs saved yet.
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
                                                        title="Edit Calculation"
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

                    {/* Pagination Controls */}
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

                    {/* Footer note */}
                    <div className="px-4 py-3 border-t border-gray-200 text-xs text-gray-500 bg-gray-50/50">
                        Each row = one saved beam design · IS 456 : 2000 · For academic / verification use only
                    </div>
                </div>

            </main>

            {/* Edit Modal */}
            {editingDesign && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
                            <h3 className="font-semibold text-gray-900">Edit Design Details</h3>
                            <button
                                onClick={() => setEditingDesign(null)}
                                className="text-gray-400 hover:text-gray-600 transition-colors"
                            >
                                ✕
                            </button>
                        </div>
                        <form onSubmit={(e) => handleEditSubmit(e)} className="p-5 max-h-[85vh] overflow-y-auto">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-1">Beam Name</label>
                                    <input
                                        type="text"
                                        required
                                        value={editForm.beam_name}
                                        onChange={e => setEditForm({ ...editForm, beam_name: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-colors"
                                        placeholder="e.g. B1"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-1">Bending Moment Direction</label>
                                    <input
                                        type="text"
                                        required
                                        value={editForm.beam_type}
                                        onChange={e => setEditForm({ ...editForm, beam_type: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-colors"
                                        placeholder="e.g. Ground Floor Main"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-1">Mu</label>
                                    <input
                                        type="text"

                                        value={editForm.Mu}
                                        onChange={e => setEditForm({ ...editForm, Mu: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-colors"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-1">Mulim</label>
                                    <input
                                        type="text"

                                        value={editForm.Mulim}
                                        onChange={e => setEditForm({ ...editForm, Mulim: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-colors"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-1">Ast Req</label>
                                    <input
                                        type="text"

                                        value={editForm.AstReq}
                                        onChange={e => setEditForm({ ...editForm, AstReq: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-colors"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-1">Ast Prov</label>
                                    <input
                                        type="text"

                                        value={editForm.AstProv}
                                        onChange={e => setEditForm({ ...editForm, AstProv: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-colors"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-1">Vu</label>
                                    <input
                                        type="text"

                                        value={editForm.Vu}
                                        onChange={e => setEditForm({ ...editForm, Vu: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-colors"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-1">Stirrup Spacing</label>
                                    <input
                                        type="text"
                                        value={editForm.StirrupSpacing}
                                        onChange={e => setEditForm({ ...editForm, StirrupSpacing: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-colors"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-1">Bar 1 Count</label>
                                    <input
                                        type="text"
                                        value={editForm.Bar1Count}
                                        onChange={e => setEditForm({ ...editForm, Bar1Count: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-colors"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-1">Bar 1 Dia</label>
                                    <input
                                        type="text"
                                        value={editForm.Bar1Dia}
                                        onChange={e => setEditForm({ ...editForm, Bar1Dia: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-colors"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-1">Bar 2 Count</label>
                                    <input
                                        type="text"
                                        value={editForm.Bar2Count}
                                        onChange={e => setEditForm({ ...editForm, Bar2Count: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-colors"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-1">Bar 2 Dia</label>
                                    <input
                                        type="text"
                                        value={editForm.Bar2Dia}
                                        onChange={e => setEditForm({ ...editForm, Bar2Dia: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-colors"
                                    />
                                </div>

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
                                    className="px-4 py-2 text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors flex items-center gap-2"
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