import { useParams, useNavigate } from 'react-router-dom'
import ResultsPanel from '../../components/ResultsPanel'
import InputForm from '../../components/inputForm'
import axios from 'axios'
import { useState, useEffect } from 'react'
import ExcelJS from 'exceljs'
import { calculateBeam } from '../../utils/beamCalc'

const ReportSection = ({ title, children }) => (
    <div className="mb-6 last:mb-0">
        <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 pb-2 border-b border-gray-100">{title}</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3">
            {children}
        </div>
    </div>
);

const ReportRow = ({ label, value }) => (
    <div className="flex flex-col sm:flex-row sm:justify-between py-1 px-2 rounded-md hover:bg-gray-50 border-b border-gray-50 last:border-0 transition-colors">
        <span className="text-sm text-gray-500 whitespace-nowrap">{label}</span>
        <span className="text-sm font-medium text-gray-900 text-right">{value ?? '—'}</span>
    </div>
);

const ReportInputs = ({ inputs }) => {
    return (
        <div className="section-card flex flex-col gap-2">
            <h2 className="section-title">
                <span className="w-2 h-5 rounded-full bg-blue-500 inline-block"></span>
                Input Parameters
            </h2>

            <div className="mt-4">
                <ReportSection title="Beam Identification">
                    <ReportRow label="Beam Marking" value={inputs?.beamName} />
                    <ReportRow label="Moment Direction" value={inputs?.bendingMomentDirection} />
                </ReportSection>

                <ReportSection title="Loading">
                    <ReportRow label="Moment Mu (kN·m)" value={inputs?.Mu} />
                    <ReportRow label="Shear Vu (kN)" value={inputs?.Vu} />
                </ReportSection>

                <ReportSection title="Section Geometry">
                    <ReportRow label="Width b (mm)" value={inputs?.b} />
                    <ReportRow label="Depth D (mm)" value={inputs?.D} />
                    <ReportRow label="Eff. Cover (mm)" value={inputs.cover} />
                </ReportSection>

                <ReportSection title="Material Grades">
                    <ReportRow label="Concrete fck" value={inputs.fck ? `${inputs.fck} MPa` : ''} />
                    <ReportRow label="Steel fy" value={inputs.fy ? `${inputs.fy} MPa` : ''} />
                </ReportSection>

                <ReportSection title="Main Reinforcement">
                    <ReportRow label="Bar 1" value={inputs.bar1Count && inputs.bar1Dia ? `${inputs.bar1Count} - ${inputs.bar1Dia} mm` : '-'} />
                    <ReportRow label="Bar 2" value={inputs.bar2Count && inputs.bar2Dia ? `${inputs.bar2Count} - ${inputs.bar2Dia} mm` : '-'} />
                </ReportSection>

                <ReportSection title="Side Face Reinforcement">
                    <ReportRow label="SFR" value={inputs.sfrCount > 0 && inputs.sfrDia ? `${inputs.sfrCount} - ${inputs.sfrDia} mm` : 'None'} />
                </ReportSection>

                <ReportSection title="Shear Reinforcement">
                    <ReportRow label="Stirrups" value={inputs.stirrupLegs && inputs.stirrupDia ? `${inputs.stirrupLegs}-Legged ${inputs.stirrupDia} mm` : '-'} />
                    <ReportRow label="Provided Spacing" value={inputs.providedStirrupSpacing ? `${inputs.providedStirrupSpacing} mm` : '-'} />
                </ReportSection>
            </div>
        </div>
    );
};

const BeamDetailedView = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [design, setDesign] = useState(null);
    const [error, setError] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    // ── Edit-mode state ──────────────────────────────────────
    const [isEditing, setIsEditing] = useState(false);
    const [editInputs, setEditInputs] = useState(null);
    const [isSaving, setIsSaving] = useState(false);
    const [saveStatus, setSaveStatus] = useState(null); // 'ok' | 'error' | null

    useEffect(() => {
        fetchDesign();
    }, [id]);

    const fetchDesign = async () => {
        try {
            const response = await axios.get(`/api/saved-designs/${id}`, { withCredentials: true });
            setDesign(response.data.data);
        } catch (err) {
            console.error('Fetch error:', err);
            setError('Failed to load saved design.');
        } finally {
            setIsLoading(false);
        }
    };

    // Enter edit mode — clone the current inputs into local state
    const handleStartEdit = () => {
        setEditInputs({ ...design.inputs });
        setIsEditing(true);
        setSaveStatus(null);
    };

    // Cancel — discard edits
    const handleCancelEdit = () => {
        setIsEditing(false);
        setEditInputs(null);
        setSaveStatus(null);
    };

    // Save — recalculate client-side and PUT the full inputs + results
    const handleSaveEdit = async () => {
        const newResults = calculateBeam(editInputs);
        if (!newResults) {
            setSaveStatus('error');
            setTimeout(() => setSaveStatus(null), 3000);
            return;
        }

        setIsSaving(true);
        setSaveStatus(null);

        try {
            const response = await axios.put(
                `/api/saveddesigns/${id}`,
                { inputs: editInputs, results: newResults },
                { withCredentials: true }
            );
            // Update local design state with the returned data
            setDesign(response.data.data);
            setIsEditing(false);
            setEditInputs(null);
            setSaveStatus('ok');
            setTimeout(() => setSaveStatus(null), 3000);
        } catch (err) {
            console.error('Update failed:', err.message);
            setSaveStatus('error');
            setTimeout(() => setSaveStatus(null), 3000);
        } finally {
            setIsSaving(false);
        }
    };

    // Live-recalculated results when in edit mode
    const liveResults = isEditing ? calculateBeam(editInputs) : null;

    const exportToExcel = async (design) => {
        const response = await fetch("/beam_temp4.xlsx");
        const arrayBuffer = await response.arrayBuffer();

        const workbook = new ExcelJS.Workbook();
        await workbook.xlsx.load(arrayBuffer);
        const worksheet = workbook.worksheets[0];

        const cellMap = {
            // ── INPUTS
            C10: design.inputs.Mu,
            C11: design.inputs.cover,
            C12: design.inputs.fck,
            C13: design.inputs.fy,
            C14: design.inputs.b,
            C15: design.inputs.D,
            C16: design.results.d,
            C17: design.results.mulimFactor,

            // ── FLEXURE ──
            C19: design.results.Mulim.toFixed(2),
            D20: design.results.muCheck,
            C23: design.results.PtReq.toFixed(3),
            C24: design.results.AstReq.toFixed(2),
            C27: design.results.AstMin,
            C28: design.results.PtMin,
            A29: design.results.steelCheck,

            // ── REINFORCEMENT PROVIDED ──
            A34: design.inputs.bar1Count, B34: design.inputs.bar1Dia, C34: design.results.Ast1.toFixed(2),
            A35: design.inputs.bar2Count, B35: design.inputs.bar2Dia, C35: design.results.Ast2.toFixed(2),
            C37: design.results.AstProv.toFixed(2),
            E33: design.results.PtProv.toFixed(3),
            E37: design.results.steelCheck,

            // ── SPACING ──
            B40: design.results.SvMax1, B41: design.results.SvMax2, B42: design.results.minSpacing,

            // ── SIDE FACE REINFORCEMENT ──
            A46: design.results.sfrRequired ? 'Yes' : 'No',
            B47: design.inputs.b,
            B48: design.inputs.D,
            B49: design.results.sfrAreaReq, B50: design.results.sfrOneSideAreaReq,
            A54: design.inputs.sfrCount, B54: design.inputs.sfrDia, C54: design.results.sfrAreaProv.toFixed(2),
            E53: design.results.sfrCheck,

            // ── SHEAR ──
            B58: design.inputs.Vu, B59: design.results.tv.toFixed(2), B60: design.results.tcMax,
            B61: design.results.AstProv.toFixed(2),
            B62: design.results.As.toFixed(2),
            B64: design.inputs.tcRatio1, C64: design.results.tcHi,
            B65: design.inputs.tcRatio2, C65: design.results.tcLo,
            B66: design.results.tc.toFixed(2),
            A68: design.results.stirrupCheck,
            B70: design.results.Vuc, B73: design.inputs.stirrupDia,
            B74: design.inputs.stirrupLegs, B75: design.results.Asv.toFixed(2),
            B78: design.results.Vus.toFixed(2),
            B81: design.results.Vusmin.toFixed(2), B83: design.results.Sv,
            B86: design.results.SvMin1,
            B87: design.results.d * 0.75,
            B88: design.inputs.providedStirrupSpacing,
            B90: design.inputs.providedStirrupSpacing,
            D81: design.results.shearCheck,

            //L4 SECTION
            N9: design.results.O28, R9: design.results.L4,
            N10: design.inputs.cover,
            N11: design.inputs.fck,
            N12: design.inputs.fy,
            N13: design.inputs.b,
            N14: design.inputs.D,
            N15: design.results.d,
            N16: design.results.mulimFactor,
            N17: design.results.lenOfBeam,
            N18: design.results.Mulim,
            O19: design.results.muCheck,
            N22: design.results.ptPercent.toFixed(3),
            N23: design.results.astPercent.toFixed(2),

            //FIGURE
            L29: design.results.L29,
            R27: design.results.R27,
            M32: design.results.M32,
            O28: design.results.O28,
            O32: design.results.O32,
            M34: design.results.M34,
            M37: design.results.bar1CountL4, N37: design.results.bar1DiaL4, O37: design.results.O37.toFixed(2),
            M38: design.results.bar2CountL4, N38: design.results.bar2DiaL4, O38: design.results.O38,
            O40: design.results.O40.toFixed(2)
        };

        for (const [cellRef, value] of Object.entries(cellMap)) {
            if (value !== undefined && value !== null) {
                const cell = worksheet.getCell(cellRef);
                cell.value = value;
            }
        }

        const buffer = await workbook.xlsx.writeBuffer();
        const blob = new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
        const url = window.URL.createObjectURL(blob);
        const anchor = document.createElement("a");
        anchor.href = url;
        anchor.download = `Beam_Design_${design.beam_name}.xlsx`;
        anchor.click();
        window.URL.revokeObjectURL(url);
    }

    // Displayed inputs / results (either live-edited or saved)
    const displayInputs = isEditing ? editInputs : design?.inputs;
    const displayResults = isEditing ? liveResults : design?.results;

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="border-b border-gray-200 bg-white/80 backdrop-blur sticky top-0 z-10">
                <div className="max-w-7xl mx-auto pl-14 pr-4 sm:pl-16 sm:pr-6 lg:px-8 py-4 flex items-center gap-3 sm:gap-4">
                    <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                        RC
                    </div>
                    <div>
                        <h1 className="text-base font-semibold text-gray-900 leading-tight">{design?.beam_name}</h1>
                        <p className="text-xs text-gray-500">Beam ID : {id}</p>
                    </div>

                    <div className="ml-auto flex items-center gap-2 sm:gap-3">
                        {/* Save-status toast */}
                        {saveStatus === 'ok' && (
                            <span className="text-xs font-medium text-emerald-600 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-lg">
                                ✓ Saved!
                            </span>
                        )}
                        {saveStatus === 'error' && (
                            <span className="text-xs font-medium text-red-600 bg-red-50 border border-red-200 px-3 py-1.5 rounded-lg">
                                ✗ Save failed
                            </span>
                        )}

                        {!isEditing ? (
                            <>
                                {/* Edit button */}
                                <button
                                    id="edit-design-btn"
                                    onClick={handleStartEdit}
                                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-blue-600 hover:bg-blue-500 text-white transition-all duration-200 shadow-sm"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                    </svg>
                                    <span className="hidden sm:inline">Edit</span>
                                </button>

                                {/* Export button */}
                                <button onClick={() => exportToExcel(design)}
                                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-white hover:bg-gray-50 text-gray-700 transition-all duration-200 border border-gray-200 shadow-sm">
                                    Export to Excel
                                </button>
                            </>
                        ) : (
                            <>
                                {/* Cancel button */}
                                <button
                                    id="cancel-edit-btn"
                                    onClick={handleCancelEdit}
                                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-white hover:bg-gray-50 text-gray-700 transition-all duration-200 border border-gray-200 shadow-sm"
                                >
                                    Cancel
                                </button>

                                {/* Save Changes button */}
                                <button
                                    id="save-changes-btn"
                                    onClick={handleSaveEdit}
                                    disabled={isSaving || !liveResults}
                                    className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 text-white shadow-sm disabled:opacity-40 disabled:cursor-not-allowed
                                        ${isSaving ? 'bg-blue-500' : 'bg-emerald-600 hover:bg-emerald-500'}`}
                                >
                                    {isSaving ? (
                                        <>
                                            <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin flex-shrink-0"></span>
                                            <span className="hidden sm:inline">Saving…</span>
                                        </>
                                    ) : (
                                        <>
                                            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M8 4H6a2 2 0 00-2 2v12a2 2 0 002 2h12a2 2 0 002-2V8l-4-4H8z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M16 4v4H8V4" />
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 12a2 2 0 100 4 2 2 0 000-4z" />
                                            </svg>
                                            <span className="hidden sm:inline">Save Changes</span>
                                        </>
                                    )}
                                </button>
                            </>
                        )}

                        <button onClick={() => navigate(-1)}
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-white hover:bg-gray-50 text-gray-700 transition-all duration-200 border border-gray-200 shadow-sm">
                            ← Back
                        </button>
                    </div>
                </div>

                {/* Edit-mode banner */}
                {isEditing && (
                    <div className="bg-amber-50 border-b border-amber-200 px-4 py-2 text-center text-xs text-amber-700 font-medium">
                        ✏️ Editing mode — modify the inputs on the left. The results panel updates live. Click <strong>Save Changes</strong> to persist.
                    </div>
                )}
            </header>

            {/* Main content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {isLoading ? (
                    <div className="flex justify-center items-center py-20">
                        <span className="w-8 h-8 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin"></span>
                    </div>
                ) : error ? (
                    <div className="bg-red-50 text-red-600 p-4 rounded-xl text-center shadow-sm max-w-2xl mx-auto">
                        {error}
                    </div>
                ) : design ? (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
                        {/* Left Side: Inputs */}
                        {isEditing
                            ? <InputForm inputs={editInputs} onChange={setEditInputs} />
                            : <ReportInputs inputs={design.inputs} />
                        }

                        {/* Right Side: Results Panel */}
                        {displayResults
                            ? <ResultsPanel inputs={displayInputs} results={displayResults} />
                            : (
                                <div className="section-card flex flex-col items-center justify-center gap-4 py-16 text-center">
                                    <div className="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center text-2xl border border-gray-200">📐</div>
                                    <div>
                                        <p className="text-gray-900 font-semibold text-sm">Invalid inputs</p>
                                        <p className="text-gray-500 text-xs mt-1">Please check the input values to generate results.</p>
                                    </div>
                                </div>
                            )
                        }
                    </div>
                ) : (
                    <div className="text-center py-10 text-gray-500">No design data available.</div>
                )}
            </main>

            {/* Footer */}
            <footer className="border-t border-gray-200 mt-12 py-6 text-center text-xs text-gray-500">
                IS 456 : 2000 · Limit State Method · Detail Report
            </footer>
        </div>
    );
};

export default BeamDetailedView;