import React from 'react';

// ── Shared result row ─────────────────────────────────────────────────────────
const ResultRow = ({ label, value, unit }) => (
    <div className="flex items-center justify-between py-2.5 border-b border-gray-100 last:border-0">
        <span className="text-sm text-gray-600">{label}</span>
        <span className="text-sm font-semibold text-gray-900 tabular-nums">
            {value != null ? `${value}${unit ? ' ' + unit : ''}` : <span className="text-gray-300">—</span>}
        </span>
    </div>
);

// Section card matching the app's `section-card` pattern
const ResultCard = ({ title, accent = 'bg-indigo-500', children }) => (
    <div className="bg-white shadow-xl shadow-gray-200/40 rounded-3xl border border-gray-100 overflow-hidden">
        <div className="px-5 pt-5 pb-3 border-b border-gray-100 bg-gray-50/50">
            <h3 className="text-base font-semibold text-gray-800 flex items-center gap-2">
                <span className={`w-1.5 h-5 rounded-full ${accent} inline-block shrink-0`} />
                {title}
            </h3>
        </div>
        <div className="px-5 py-4">{children}</div>
    </div>
);

const BigValue = ({ value, unit, color = 'text-indigo-700' }) => (
    <div className="flex items-end gap-2 mb-4">
        <span className={`text-4xl font-black font-mono tabular-nums ${color}`}>{value}</span>
        <span className="text-base font-semibold text-gray-400 mb-1">{unit}</span>
    </div>
);

// ── Main Component ────────────────────────────────────────────────────────────
const WindLoadResult = ({ results }) => {
    if (!results) return null;

    const { vz, pz, pd, pdMinimumGoverns, k1Invalid, walls, cpiVal, hwRatio, lwRatio } = results;

    return (
        <div className="space-y-5">

            {/* ── Vz Result ── */}
            <ResultCard title="Design Wind Speed — Vz" accent="bg-blue-500">
                {k1Invalid ? (
                    <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700 font-medium">
                        <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                        Invalid K1 combination — calculation blocked
                    </div>
                ) : vz != null ? (
                    <>
                        <BigValue value={vz.toFixed(2)} unit="m/s" color="text-blue-700" />
                        <div>
                            <ResultRow label="Vb" value={results.vb} unit="m/s" />
                            <ResultRow label="K1 (Risk Coefficient)" value={results.k1} />
                            <ResultRow label="K2 (Terrain & Height)" value={results.k2?.toFixed(3)} />
                            <ResultRow label="K3 (Topography)" value={results.k3?.toFixed(3)} />
                            <ResultRow label="K4 (Importance)" value={results.k4?.toFixed(3)} />
                        </div>
                    </>
                ) : (
                    <p className="text-sm text-gray-400 italic py-2">Fill in all inputs…</p>
                )}
            </ResultCard>

            {/* ── Pz Result ── */}
            <ResultCard title="Wind Pressure — Pz" accent="bg-teal-500">
                {pz != null ? (
                    <BigValue value={pz.toFixed(4)} unit="kN/m²" color="text-teal-700" />
                ) : (
                    <p className="text-sm text-gray-400 italic">Awaiting Vz…</p>
                )}
            </ResultCard>

            {/* ── Pd Result ── */}
            <ResultCard title="Design Wind Pressure — Pd" accent="bg-violet-500">
                {pd != null ? (
                    <>
                        <BigValue value={pd.toFixed(4)} unit="kN/m²" color="text-violet-700" />
                        <div>
                            <ResultRow label="Kd (Directionality)" value={results.kdVal} />
                            <ResultRow label="Ka (Area Averaging)" value={results.ka?.toFixed(4)} />
                            <ResultRow label="Kc (Combination)" value={results.kcVal} />
                        </div>
                        {pdMinimumGoverns && (
                            <div className="mt-3 flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2 text-xs font-semibold text-amber-700">
                                <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                Min pressure (0.7 × Pz = {(0.7 * pz).toFixed(4)} kN/m²) governs
                            </div>
                        )}
                    </>
                ) : (
                    <p className="text-sm text-gray-400 italic">Awaiting Pz…</p>
                )}
            </ResultCard>

            {/* ── Net Pressure Coefficients Table ── */}
            {walls && (
                <ResultCard title="Net Pressure Coefficients" accent="bg-amber-500">
                    <p className="text-xs text-gray-500 mb-3">Cpi = {cpiVal}</p>
                    <div className="overflow-x-auto rounded-xl border border-gray-100">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="bg-gray-50">
                                    <th className="text-left px-4 py-3 text-xs font-bold uppercase tracking-wider text-gray-500">Wall</th>
                                    <th className="text-center px-4 py-3 text-xs font-bold uppercase tracking-wider text-gray-500">Cpe</th>
                                    <th className="text-center px-4 py-3 text-xs font-bold uppercase tracking-wider text-red-500">
                                        Suction<br /><span className="font-normal normal-case tracking-normal text-gray-400">Cpe − Cpi</span>
                                    </th>
                                    <th className="text-center px-4 py-3 text-xs font-bold uppercase tracking-wider text-blue-500">
                                        Pressure<br /><span className="font-normal normal-case tracking-normal text-gray-400">Cpe + Cpi</span>
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {walls.map((w, i) => (
                                    <tr key={i} className="border-t border-gray-100 hover:bg-gray-50/50 transition-colors">
                                        <td className="px-4 py-3 font-medium text-gray-700 text-xs">{w.name}</td>
                                        <td className="px-4 py-3 text-center font-bold font-mono text-gray-700">{w.cpe.toFixed(2)}</td>
                                        <td className={`px-4 py-3 text-center font-bold font-mono ${w.suction < 0 ? 'text-red-600' : 'text-blue-600'}`}>
                                            {w.suction.toFixed(3)}
                                        </td>
                                        <td className={`px-4 py-3 text-center font-bold font-mono ${w.pressure < 0 ? 'text-red-600' : 'text-blue-600'}`}>
                                            {w.pressure.toFixed(3)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-4 text-xs">
                        <span className="flex items-center gap-1.5">
                            <span className="inline-block w-2.5 h-2.5 rounded-full bg-blue-500" />
                            <span className="text-gray-600">Positive (toward wall)</span>
                        </span>
                        <span className="flex items-center gap-1.5">
                            <span className="inline-block w-2.5 h-2.5 rounded-full bg-red-500" />
                            <span className="text-gray-600">Negative (away from wall)</span>
                        </span>
                    </div>
                </ResultCard>
            )}

            {/* ── Final Summary Card ── */}
            <div className="bg-white shadow-xl shadow-gray-200/40 rounded-3xl border border-gray-100 overflow-hidden">
                <div className="px-5 pt-5 pb-3 border-b border-gray-100 bg-gray-50/50">
                    <h3 className="text-base font-semibold text-gray-800 flex items-center gap-2">
                        <span className="w-1.5 h-5 rounded-full bg-gray-800 inline-block shrink-0" />
                        Summary — IS:875 (Part-3)
                    </h3>
                </div>
                <div className="px-5 py-4 grid grid-cols-2 gap-3">
                    {[
                        { label: 'Vz', value: vz != null ? `${vz.toFixed(2)} m/s` : '—' },
                        { label: 'Pz', value: pz != null ? `${pz.toFixed(4)} kN/m²` : '—' },
                        { label: 'Pd', value: pd != null ? `${pd.toFixed(4)} kN/m²` : '—' },
                        { label: 'Cpi', value: cpiVal != null ? String(cpiVal) : '—' },
                        { label: 'H/W Ratio', value: hwRatio != null ? String(hwRatio) : '—' },
                        { label: 'L/W Ratio', value: lwRatio != null ? String(lwRatio) : '—' },
                    ].map(({ label, value }) => (
                        <div key={label} className="bg-gray-50 border border-gray-100 rounded-xl p-3 flex flex-col">
                            <span className="text-xs text-gray-500 font-medium mb-1">{label}</span>
                            <span className="text-sm font-bold text-gray-800 font-mono tabular-nums">{value}</span>
                        </div>
                    ))}
                </div>
            </div>

        </div>
    );
};

export default WindLoadResult;
