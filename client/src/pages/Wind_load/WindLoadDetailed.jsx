import React, { useState, useEffect, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import axios from 'axios'
import WindLoadResult from '../../components/windLoadResult'
import WindLoadInput from '../../components/windLoadInput'
import { calculateWindLoad } from '../../utils/windLoadCalc'
import ExcelJS from 'exceljs'

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
        <div className="flex flex-col gap-2 bg-white shadow-xl shadow-gray-200/40 rounded-3xl border border-gray-100 overflow-hidden">
            <div className="px-5 pt-5 pb-3 border-b border-gray-100 bg-gray-50/50">
                <h2 className="text-base font-semibold text-gray-800 flex items-center gap-2">
                    <span className="w-1.5 h-5 rounded-full bg-indigo-500 inline-block shrink-0"></span>
                    Input Parameters
                </h2>
            </div>

            <div className="p-5">
                <ReportSection title="Project Details">
                    <ReportRow label="Project Name" value={inputs?.projectName || 'Untitled Design'} />
                    <ReportRow label="City" value={inputs?.city} />
                </ReportSection>

                <ReportSection title="Building Geometry">
                    <ReportRow label="Height H (m)" value={inputs?.H} />
                    <ReportRow label="Width W (m)" value={inputs?.W} />
                    <ReportRow label="Length L (m)" value={inputs?.L} />
                </ReportSection>

                <ReportSection title="Terrain & Structure">
                    <ReportRow label="Terrain Category" value={inputs?.terrainCategory} />
                    <ReportRow label="Structure Class" value={inputs?.structureType} />
                    <ReportRow label="Design Life" value={inputs?.designLife ? `${inputs.designLife} Years` : '—'} />
                </ReportSection>

                <ReportSection title="Risk Factors">
                    <ReportRow label="K2 (Terrain)" value={inputs?.k2Custom} />
                    <ReportRow label="K3 (Topography)" value={inputs?.k3Type === 'flat' ? 'Flat (1.0)' : inputs?.k3Custom} />
                    <ReportRow label="K4 (Importance)" value={inputs?.k4Type} />
                </ReportSection>

                <ReportSection title="Directionality & Combination">
                    <ReportRow label="Kd (Directionality)" value={inputs?.kd} />
                    <ReportRow label="Kc (Combination)" value={inputs?.kcType} />
                </ReportSection>

                <ReportSection title="Internal Pressure (Cpi)">
                    <ReportRow label="Cpi" value={inputs?.cpi} />
                </ReportSection>

                <ReportSection title="External Pressure (Cpe)">
                    <ReportRow label="Wall A" value={inputs?.cpeA} />
                    <ReportRow label="Wall B" value={inputs?.cpeB} />
                    <ReportRow label="Wall C" value={inputs?.cpeC} />
                    <ReportRow label="Wall D" value={inputs?.cpeD} />
                </ReportSection>
            </div>
        </div>
    );
};

const WindLoadDetailed = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [design, setDesign] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

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
            setIsLoading(true);
            const response = await axios.get(`/api/saved-windloads/${id}`, { withCredentials: true });
            setDesign(response.data.data);
            setError(null);
        } catch (error) {
            console.error('Error fetching design:', error);
            setError('Failed to load saved wind load design.');
        } finally {
            setIsLoading(false);
        }
    }

    const handleStartEdit = () => {
        setEditInputs({ ...design.inputs });
        setIsEditing(true);
        setSaveStatus(null);
    };

    const handleCancelEdit = () => {
        setIsEditing(false);
        setEditInputs(null);
        setSaveStatus(null);
    };

    // WindLoadInput uses onChange(key, value) — adapter to keep editInputs in sync
    const handleEditChange = (key, value) => {
        setEditInputs(prev => ({ ...prev, [key]: value }));
    };

    const handleSaveEdit = async () => {
        const newResults = calculateWindLoad(editInputs);
        if (!newResults) {
            setSaveStatus('error');
            setTimeout(() => setSaveStatus(null), 3000);
            return;
        }

        setIsSaving(true);
        setSaveStatus(null);

        try {
            const response = await axios.put(
                `/api/windload/${id}`,
                { inputs: editInputs, results: newResults },
                { withCredentials: true }
            );
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
    const liveResults = useMemo(() => {
        if (!isEditing || !editInputs) return null;
        return calculateWindLoad(editInputs);
    }, [isEditing, editInputs]);

    const displayInputs = isEditing ? editInputs : design?.inputs;
    const displayResults = isEditing ? liveResults : design?.results;

    async function getBase64(url) {
        const response = await fetch(url);
        const blob = await response.blob();

        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => {
                const base64 = reader.result.split(',')[1];
                resolve(base64);
            };
            reader.onerror = reject;
            reader.readAsDataURL(blob);
        });
    }

    const exportToExcel = async (design) => {
        try {
            const response = await fetch("/wind_load_temp5.xlsx");
            const arrayBuffer = await response.arrayBuffer();

            const workbook = new ExcelJS.Workbook();
            await workbook.xlsx.load(arrayBuffer);
            const worksheet = workbook.worksheets[0];

            const cellMap = {
                // INPUTS
                I3: design.inputs.H,
                I4: design.inputs.W,
                I5: design.inputs.L,
                I8: design.results.vb,
                I9: design.results.k1,
                I10: design.results.k2,
                I11: design.results.k3,
                I12: design.results.k4,
                I13: design.results.kdVal,
                I14: design.results.ka,
                I15: design.results.kcVal,
                B19: design.results.cpiVal,
                C37: -design.results.cpiVal,
                H37: -design.results.cpiVal,
                M37: -design.results.cpiVal,
                R37: -design.results.cpiVal,
                C53: design.results.cpiVal,
                H53: design.results.cpiVal,
                M53: design.results.cpiVal,
                R53: design.results.cpiVal,

                //Results
                B6: design.results.vz,
                B10: design.results.pz,
                B14: design.results.pd,
                B24: design.results.hwRatio,
                B25: design.results.lwRatio,

                //walls — pressure
                A36: design.inputs.cpeA,
                D38: design.inputs.cpeB,
                C33: design.inputs.cpeC,
                C42: design.inputs.cpeD,
                A38: design.results.walls[0].pressure,
                D36: design.results.walls[1].pressure,
                C34: design.results.walls[2].pressure,
                C41: design.results.walls[3].pressure,
                I38: design.inputs.cpeA,
                F38: design.inputs.cpeB,
                H33: design.inputs.cpeC,
                H42: design.inputs.cpeD,
                I36: design.results.walls[0].pressure,
                F36: design.results.walls[1].pressure,
                H34: design.results.walls[2].pressure,
                H41: design.results.walls[3].pressure,
                M41: design.inputs.cpeA,
                M32: design.inputs.cpeB,
                K38: design.inputs.cpeC,
                N38: design.inputs.cpeD,
                M42: design.results.walls[0].pressure,
                M33: design.results.walls[1].pressure,
                K36: design.results.walls[2].pressure,
                N36: design.results.walls[3].pressure,
                R32: design.inputs.cpeA,
                R41: design.inputs.cpeB,
                S38: design.inputs.cpeC,
                P38: design.inputs.cpeD,
                R33: design.results.walls[0].pressure,
                R42: design.results.walls[1].pressure,
                S36: design.results.walls[2].pressure,
                P36: design.results.walls[3].pressure,

                //suction
                A52: design.inputs.cpeA,
                D54: design.inputs.cpeB,
                C49: design.inputs.cpeC,
                C58: design.inputs.cpeD,
                A54: design.results.walls[0].suction,
                D52: design.results.walls[1].suction,
                C50: design.results.walls[2].suction,
                C57: design.results.walls[3].suction,
                I54: design.inputs.cpeA,
                F54: design.inputs.cpeB,
                H49: design.inputs.cpeC,
                H58: design.inputs.cpeD,
                I52: design.results.walls[0].suction,
                F52: design.results.walls[1].suction,
                H50: design.results.walls[2].suction,
                H57: design.results.walls[3].suction,
                M57: design.inputs.cpeA,
                M48: design.inputs.cpeB,
                N54: design.inputs.cpeC,
                K54: design.inputs.cpeD,
                M58: design.results.walls[0].suction,
                M49: design.results.walls[1].suction,
                N52: design.results.walls[2].suction,
                K52: design.results.walls[3].suction,
                R48: design.inputs.cpeA,
                R57: design.inputs.cpeB,
                P54: design.inputs.cpeC,
                S54: design.inputs.cpeD,
                R49: design.results.walls[0].suction,
                R58: design.results.walls[1].suction,
                P52: design.results.walls[2].suction,
                S52: design.results.walls[3].suction,
            }

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
            anchor.download = `Wind_Load_Design_${design.project_name}.xlsx`;
            anchor.click();
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error("Export failed", error);
        }
    }

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
            {/* Header */}
            <header className="border-b border-gray-200 bg-white/80 backdrop-blur sticky top-0 z-10 shadow-sm">
                <div className="max-w-7xl mx-auto pl-14 pr-4 sm:pl-16 sm:pr-6 lg:px-8 py-4 flex items-center gap-3 sm:gap-4">
                    <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                        WL
                    </div>
                    <div>
                        <h1 className="text-base font-semibold text-gray-900 leading-tight">{design?.project_name}</h1>
                        <p className="text-xs text-gray-500">Design ID : {id}</p>
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
                                    id="edit-windload-btn"
                                    onClick={handleStartEdit}
                                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-indigo-600 hover:bg-indigo-500 text-white transition-all duration-200 shadow-sm"
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
                                    id="cancel-windload-edit-btn"
                                    onClick={handleCancelEdit}
                                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-white hover:bg-gray-50 text-gray-700 transition-all duration-200 border border-gray-200 shadow-sm"
                                >
                                    Cancel
                                </button>

                                {/* Save Changes button */}
                                <button
                                    id="save-windload-changes-btn"
                                    onClick={handleSaveEdit}
                                    disabled={isSaving || !liveResults}
                                    className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 text-white shadow-sm disabled:opacity-40 disabled:cursor-not-allowed
                                        ${isSaving ? 'bg-indigo-500' : 'bg-emerald-600 hover:bg-emerald-500'}`}
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
            <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {isLoading ? (
                    <div className="flex justify-center items-center py-20">
                        <span className="w-8 h-8 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin"></span>
                    </div>
                ) : error ? (
                    <div className="bg-red-50 text-red-600 p-4 rounded-xl text-center shadow-sm max-w-2xl mx-auto font-medium">
                        {error}
                    </div>
                ) : design ? (
                    <div className="flex flex-col lg:flex-row gap-8 items-start">
                        {/* Left Side: Inputs */}
                        <div className="w-full lg:w-1/2">
                            {isEditing
                                ? <WindLoadInput inputs={editInputs} onChange={handleEditChange} results={liveResults} />
                                : <ReportInputs inputs={{ ...design.inputs, projectName: design.project_name }} />
                            }
                        </div>

                        {/* Right Side: Results Panel */}
                        <div className="w-full lg:w-1/2 lg:sticky lg:top-24">
                            {displayResults
                                ? <WindLoadResult results={displayResults} inputs={displayInputs} />
                                : (
                                    <div className="bg-white border-2 border-dashed border-gray-200 rounded-2xl p-12 flex flex-col items-center justify-center text-center shadow-sm">
                                        <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center text-3xl mb-4 border border-gray-100">💨</div>
                                        <p className="text-gray-900 font-semibold text-sm">Invalid inputs</p>
                                        <p className="text-gray-500 text-xs mt-1">Please check the input values to generate results.</p>
                                    </div>
                                )
                            }
                        </div>
                    </div>
                ) : (
                    <div className="text-center py-10 text-gray-500">No design data available.</div>
                )}
            </main>

            {/* Footer */}
            <footer className="border-t border-gray-200 mt-auto py-6 text-center text-xs text-gray-500">
                IS 875 (Part 3) : 2015 · Wind Load Method · Detail Report
            </footer>
        </div>
    )
}

export default WindLoadDetailed