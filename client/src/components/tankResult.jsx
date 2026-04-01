import React, { useState } from 'react';
const formatVal = (val, suffix = '', precision = 2) => {
    if (val === null || val === undefined || isNaN(val)) return '-';
    return `${val.toFixed(precision)} ${suffix}`.trim();
};

const CheckRow = ({ label, passed, details }) => {
    const [expanded, setExpanded] = useState(false);
    return (
        <div className="border-b border-gray-200/60 last:border-0 hover:bg-gray-50/50 transition-colors duration-200">
            <button
                type="button"
                onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setExpanded((prev) => !prev);
                }}
                className="w-full flex items-center justify-between p-3.5 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 rounded-xl transition-all cursor-pointer relative z-10 select-none"
            >
                <div className="flex items-center gap-2.5 pointer-events-none">
                    <div className={`p-1 rounded-md transition-colors ${expanded ? 'bg-indigo-50 text-indigo-600' : 'text-gray-400 hover:bg-gray-100'}`}>
                        <svg className={`w-4 h-4 transition-transform duration-300 ${expanded ? 'rotate-90' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" />
                        </svg>
                    </div>
                    <span className={`text-sm font-semibold transition-colors ${expanded ? 'text-indigo-900' : 'text-gray-700'}`}>{label}</span>
                </div>
                {passed ? (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-700 text-xs font-bold shadow-sm border border-emerald-100/50">
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                        Pass
                    </span>
                ) : (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-red-50 text-red-700 text-xs font-bold shadow-sm border border-red-100/50">
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                        Fail
                    </span>
                )}
            </button>

            {expanded && details && (
                <div className="px-10 pb-4 pt-1 text-xs animate-in slide-in-from-top-2 fade-in duration-200">
                    <div className="space-y-2 bg-gradient-to-b from-gray-50/80 to-gray-50/30 p-3.5 rounded-xl border border-gray-100 shadow-inner">
                        {details.map((detail, idx) => (
                            <div key={idx} className="flex justify-between items-center bg-white px-3.5 py-2 rounded-lg border border-gray-100/80 shadow-sm relative overflow-hidden">
                                <span className="text-gray-500 font-medium z-10">{detail.label}</span>
                                <span className={`font-mono font-bold z-10 ${detail.value.toString().includes('Fail') ? 'text-red-500' : 'text-indigo-600'}`}>{detail.value}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

const DetailRow = ({ label, value }) => (
    <div className="flex justify-between items-center py-2.5 border-b border-indigo-100/30 last:border-0">
        <span className="text-sm font-medium text-indigo-900/60">{label}</span>
        <span className="text-sm font-bold text-indigo-900">{value}</span>
    </div>
);

const TankResult = ({ result, inputs }) => {
    if (!result) return null;

    const { conclusion } = result;
    const allPassed = conclusion?.allChecksPass;

    return (
        <div className="bg-white shadow-xl shadow-gray-200/40 rounded-3xl border border-gray-100 flex flex-col ">

            {/* Header Area */}
            <div className={`px-6 pt-6 pb-5 border-b shrink-0 ${allPassed ? 'bg-emerald-50/50 border-emerald-100' : 'bg-red-50/50 border-red-100'}`}>
                <div className="flex items-center justify-between mb-2">
                    <h2 className="text-lg font-bold text-gray-900">Design Results</h2>
                    <span className={`inline-flex px-3 py-1 rounded-full text-xs font-bold shadow-sm ${allPassed ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                        {allPassed ? 'SAFE' : 'UNSAFE'}
                    </span>
                </div>
                <p className={`text-sm font-medium ${allPassed ? 'text-emerald-600' : 'text-red-500'}`}>
                    {allPassed ? 'All geometric and safety constraints met.' : 'Some calculations failed the safety limits.'}
                </p>
            </div>

            {/* Scrollable Content */}
            <div className="p-6 flex-1 scroll-smooth">

                {/* Check Summary */}
                <div className="mb-8">
                    <h3 className="text-xs font-bold tracking-wider text-gray-400 uppercase mb-3 px-1">Safety Checks</h3>
                    <div className="bg-gray-50/30 rounded-2xl border border-gray-100/80 p-1.5 shadow-sm">
                        <CheckRow
                            label="Soil Pressure (Op + WL)"
                            passed={result.check1_ring_OK && result.check1_inside_OK}
                            details={[
                                { label: "Permissible SBC (w/ WL)", value: formatVal(result.sbcAfterWL, 'kN/m²') },
                                { label: "P max (Ring)", value: result.check1_Pmax_ring.toFixed(0) + ' kN/m²' },
                                { label: "P min (Ring)", value: result.check1_Pmin_ring.toFixed(0) + ' kN/m²' },
                                { label: "P max (Inside)", value: result.check1_Pmax_inside.toFixed(0) + ' kN/m²' },
                                { label: "P min (Inside)", value: result.check1_Pmin_inside.toFixed(0) + ' kN/m²' },
                            ]}
                        />
                        <CheckRow
                            label="Soil Pressure (Op + EQ)"
                            passed={result.check2_ring_OK && result.check2_inside_OK}
                            details={[
                                { label: "Permissible SBC (w/ EQ)", value: formatVal(result.sbcAfterEQ, 'kN/m²') },
                                { label: "P max (Ring)", value: formatVal(result.check2_Pmax_ring, 'kN/m²') },
                                { label: "P min (Ring)", value: formatVal(result.check2_Pmin_ring, 'kN/m²') },
                                { label: "P max (Inside)", value: formatVal(result.check2_Pmax_inside, 'kN/m²') },
                                { label: "P min (Inside)", value: formatVal(result.check2_Pmin_inside, 'kN/m²') },
                            ]}
                        />
                        <CheckRow
                            label="Soil Pressure (Hydrotest)"
                            passed={result.check3_inside_OK}
                            details={[
                                { label: "Permissible SBC", value: formatVal(result.sbcAfterWL, 'kN/m²') },
                                { label: "P max (Inside)", value: formatVal(result.check3_Pmax_inside, 'kN/m²') },
                                { label: "P min (Inside)", value: formatVal(result.check3_Pmin_inside, 'kN/m²') },
                            ]}
                        />
                        <CheckRow
                            label="Sliding Check"
                            passed={result.sliding_OK}
                            details={[
                                { label: "Disturbing Force", value: formatVal(result.disturbingForce, 'kN') },
                                { label: "Restoring Force", value: formatVal(result.restoringForceSliding, 'kN') },
                                { label: "Total Restoring Wt", value: formatVal(result.totalRestoringWt, 'kN') },
                                { label: "FOS Sliding", value: `${formatVal(result.FOS_sliding, '')} (Req: >1.5)` },
                            ]}
                        />
                        <CheckRow
                            label="Overturning Check"
                            passed={result.overturning_OK}
                            details={[
                                { label: "Overturning Moment", value: formatVal(result.overturnMoment, 'kN.m') },
                                { label: "Restoring Moment", value: formatVal(result.restoringMoment, 'kN.m') },
                                { label: "FOS Overturning", value: `${formatVal(result.FOS_overturning, '')} (Req: >1.5)` },
                            ]}
                        />
                        <CheckRow
                            label="Ring Wall Thickness Check"
                            passed={result.wallThk_OK}
                            details={[
                                { label: "Hoop Tension", value: formatVal(result.hoopTension, 'kN') },
                                { label: "Thickness Calculated", value: formatVal(result.wallThkCalc, 'mm') },
                                { label: "Thickness Provided", value: formatVal(result.wallThkProvided, 'mm') },
                            ]}
                        />
                        <CheckRow
                            label="Design of ring wall"
                            passed={result.raft_OK}
                            details={[
                                { label: "Raft Max BM", value: formatVal(result.raftBM, 'kN.m') },
                                { label: "Depth Required", value: formatVal(result.raftDeReq, 'mm') },
                                { label: "Depth Provided", value: formatVal(result.raftDeProvided, 'mm') },
                            ]}
                        />
                    </div>
                </div>

                {/* Geometry Summary */}
                <div className="mb-8">
                    <h3 className="text-xs font-bold tracking-wider text-gray-400 uppercase mb-3 px-1">Adopted Geometry</h3>
                    <div className="bg-indigo-50/50 rounded-2xl p-5 border border-indigo-100/50 shadow-sm">
                        <DetailRow label="Dia Of Ring Wall" value={formatVal(conclusion.bcd, 'm')} />
                        <DetailRow label="Ring Wall Thickness" value={formatVal(conclusion.thkRingWall_m, 'm')} />
                        <DetailRow label="Ring Raft Width" value={formatVal(conclusion.widthRingRaft_m, 'm')} />
                        <DetailRow label="Total Raft Thickness" value={formatVal(conclusion.thkRingRaft_m * 1000, 'mm', 0)} />
                        <DetailRow label="Foundation Depth" value={formatVal(conclusion.depthFdn_m, 'm')} />
                    </div>
                </div>

                {/* Reinforcement Output */}
                <div className="mb-2">
                    <h3 className="text-xs font-bold tracking-wider text-gray-400 uppercase mb-3 px-1">Reinforcement Details</h3>
                    <div className="bg-gray-900 rounded-2xl p-5 text-gray-100 shadow-xl border border-gray-800 relative overflow-hidden">
                        {/* decorative background element */}
                        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 blur-3xl rounded-full"></div>
                        <div className="absolute bottom-0 left-0 w-32 h-32 bg-emerald-500/10 blur-3xl rounded-full"></div>

                        <div className="mb-5 relative z-10">
                            <span className="block text-xs text-gray-400 font-semibold mb-1.5 tracking-wide">Hoop (Horizontal) Steel</span>
                            <span className="text-sm font-mono font-bold text-emerald-400 bg-emerald-400/10 px-3 py-1.5 rounded border border-emerald-400/20 shadow-sm">{conclusion.horizReinf}</span>
                        </div>
                        <div className="mb-5 relative z-10">
                            <span className="block text-xs text-gray-400 font-semibold mb-1.5 tracking-wide">Vertical Ring Steel</span>
                            <span className="text-sm font-mono font-bold text-blue-400 bg-blue-400/10 px-3 py-1.5 rounded border border-blue-400/20 shadow-sm">{conclusion.vertReinf}</span>
                        </div>
                        <div className="relative z-10">
                            <span className="block text-xs text-gray-400 font-semibold mb-1.5 tracking-wide">Raft Steel (Top & Bottom)</span>
                            <span className="text-sm font-mono font-bold text-amber-300 bg-amber-400/10 px-3 py-1.5 rounded border border-amber-400/20 shadow-sm">{conclusion.raftReinf}</span>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default TankResult;