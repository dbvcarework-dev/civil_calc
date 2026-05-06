import React, { useState, useEffect } from 'react';
import beamTables from '../../config/beamTables';
import axios from 'axios';
import ConfigLogs from '../../components/configLogs';

// Reusable Editable Input component for consistent styling and behavior
const EditableInput = ({ value, onChange, isReadOnly }) => {
    if (isReadOnly) {
        return <span className="tabular-nums text-gray-900 font-medium">{value}</span>;
    }
    return (
        <input
            type="number"
            step="0.01"
            value={value}
            onChange={(e) => {
                const val = e.target.value;
                onChange(val === "" ? "" : parseFloat(val));
            }}
            className="w-16 px-1 py-0.5 border border-gray-200 rounded text-center focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all tabular-nums text-gray-700 bg-gray-50/30 hover:bg-white"
        />
    );
};



const BeamConfigModal = ({ isOpen, onClose, beamTable, setBeamTable, isReadOnly }) => {
    if (!isOpen) return null;

    const grades = ['15', '20', '25', '30', '35', '40'];
    const [tcTable, setTcTable] = useState(beamTable.tcTable);
    const [tcMax, setTcMax] = useState(beamTable.tcMax);
    const [mulimFactor, setMulimFactor] = useState(beamTable.mulimFactor);


    const [showPopup, setShowPopup] = useState(false);
    const [changes, setChanges] = useState([]);
    const [open, setOpen] = useState(false);

    const updateTcTable = (r, g, val) => {
        setTcTable(prev => ({
            ...prev,
            [r]: { ...prev[r], [g]: val }
        }));
    };

    const updateTcMax = (g, val) => {
        setTcMax(prev => ({ ...prev, [g]: val }));
    };

    const updateMulimFactor = (fy, val) => {
        setMulimFactor(prev => ({ ...prev, [fy]: val }));
    };

    function getChanges(oldConfig, newConfig) {
        const changes = [];

        // TC TABLE
        for (const ratio in newConfig.tcTable) {
            for (const grade in newConfig.tcTable[ratio]) {
                const oldVal = oldConfig?.tcTable?.[ratio]?.[grade];
                const newVal = newConfig.tcTable[ratio][grade];

                if (oldVal !== newVal) {
                    changes.push({
                        field: `tcTable[${ratio}][${grade}]`,
                        oldValue: oldVal,
                        newValue: newVal
                    });
                }
            }
        }

        // TC MAX
        for (const key in newConfig.tcMax) {
            const oldVal = oldConfig?.tcMax?.[key];
            const newVal = newConfig.tcMax[key];

            if (oldVal !== newVal) {
                changes.push({
                    field: `tcMax[${key}]`,
                    oldValue: oldVal,
                    newValue: newVal
                });
            }
        }

        // MULIM FACTOR
        for (const key in newConfig.mulimFactor) {
            const oldVal = oldConfig?.mulimFactor?.[key];
            const newVal = newConfig.mulimFactor[key];

            if (oldVal !== newVal) {
                changes.push({
                    field: `mulimFactor[${key}]`,
                    oldValue: oldVal,
                    newValue: newVal
                });
            }
        }

        return changes;
    }
    const handleConfirmChanges = () => {
        const changes = getChanges(beamTable, {
            tcTable, tcMax, mulimFactor
        });

        setChanges(changes);
        setShowPopup(true);
    }

    //saving the config to db
    const handleSave = async () => {
        try {
            await axios.post(
                "/api/beamconfig",
                { tcTable, tcMax, mulimFactor, changes, moduleName: "beam-design" },
                { withCredentials: true }
            );

            // Fetch updated config immediately
            const res = await axios.get(
                "http://localhost:3000/api/beamconfig",
                { withCredentials: true }
            );
            setBeamTable(res.data);
            setShowPopup(false);
            alert("Configuration saved successfully!");
        } catch (err) {
            console.error("Failed to save:", err.message);
            alert("Failed to save configuration.");
        }
    };


    const ratios = Object.keys(tcTable).sort((a, b) => parseFloat(a) - parseFloat(b));


    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
            {/* Overlay */}
            <div
                className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            />

            {/* Modal Card */}
            <div className="relative bg-white w-full max-w-4xl max-h-[90vh] overflow-hidden rounded-3xl shadow-2xl flex flex-col border border-gray-100 animate-in fade-in zoom-in duration-200">

                {/* Header */}
                <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                    <div>{isReadOnly ? (
                        <h2 className="text-xl font-bold text-gray-900">Lookup Tables & Constants Used</h2>) :
                        (
                            <h2 className="text-xl font-bold text-gray-900">Lookup Tables & Constants</h2>)}
                        <p className="text-xs text-gray-500">IS 456 : 2000 Reference Values</p>
                    </div>
                    <div className="flex items-center gap-3">
                        {!isReadOnly && (
                            <button
                                onClick={() => setOpen(true)}
                                className="px-4 py-1.5 text-sm font-semibold text-blue-600 bg-blue-50 border border-blue-100 rounded-xl hover:bg-blue-100 transition-colors"
                            >
                                Show Logs
                            </button>
                        )}
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-gray-200 rounded-xl transition-colors text-gray-500"
                        >
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">

                    {/* Table 19: Design Shear Strength (tc) */}
                    <section>
                        <h3 className="text-sm font-bold text-blue-600 uppercase tracking-widest mb-4 flex items-center gap-2">
                            <span className="w-1.5 h-4 bg-blue-500 rounded-full"></span>
                            Table 19: Design Shear Strength τc (N/mm²)
                        </h3>
                        <div className="overflow-x-auto rounded-2xl border border-gray-100">
                            <table className="w-full text-sm text-left border-collapse">
                                <thead>
                                    <tr className="bg-gray-50 border-b border-gray-100">
                                        <th className="px-4 py-3 font-semibold text-gray-600 sticky left-0 bg-gray-50">100As/bd (%)</th>
                                        {grades.map(g => (
                                            <th key={g} className="px-4 py-3 font-semibold text-gray-600 text-center">M{g}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {ratios.map(r => (
                                        <tr key={r} className="hover:bg-blue-50/30 transition-colors">
                                            <td className="px-4 py-2 font-medium text-gray-900 sticky left-0 bg-white border-r border-gray-50">{r}</td>
                                            {grades.map(g => (
                                                <td key={g} className="px-4 py-2 text-center">
                                                    <EditableInput
                                                        value={tcTable[r][g]}
                                                        onChange={(val) => updateTcTable(r, g, val)}
                                                        isReadOnly={isReadOnly}
                                                    />
                                                </td>
                                            ))}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </section>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Table 20: Max Shear Strength (tcMax) */}
                        <section>
                            <h3 className="text-sm font-bold text-emerald-600 uppercase tracking-widest mb-4 flex items-center gap-2">
                                <span className="w-1.5 h-4 bg-emerald-500 rounded-full"></span>
                                Table 20: Max Shear Strength τc max
                            </h3>
                            <div className="overflow-hidden rounded-2xl border border-gray-100">
                                <table className="w-full text-sm text-left border-collapse">
                                    <thead>
                                        <tr className="bg-gray-50 border-b border-gray-100">
                                            <th className="px-4 py-3 font-semibold text-gray-600">Grade</th>
                                            <th className="px-4 py-3 font-semibold text-gray-600 text-center">τc max (N/mm²)</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50">
                                        {grades.map(g => (
                                            <tr key={g} className="hover:bg-emerald-50/30 transition-colors">
                                                <td className="px-4 py-2 font-medium text-gray-900">M{g}</td>
                                                <td className="px-4 py-2 text-center">
                                                    <EditableInput
                                                        value={tcMax[g]}
                                                        onChange={(val) => updateTcMax(g, val)}
                                                        isReadOnly={isReadOnly}
                                                    />
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </section>

                        {/* Limiting Moment Factor (MuLim) */}
                        <section>
                            <h3 className="text-sm font-bold text-amber-600 uppercase tracking-widest mb-4 flex items-center gap-2">
                                <span className="w-1.5 h-4 bg-amber-500 rounded-full"></span>
                                Limiting Moment Factor (Mu lim)
                            </h3>
                            <div className="overflow-hidden rounded-2xl border border-gray-100">
                                <table className="w-full text-sm text-left border-collapse">
                                    <thead>
                                        <tr className="bg-gray-50 border-b border-gray-100">
                                            <th className="px-4 py-3 font-semibold text-gray-600">Steel Grade (fy)</th>
                                            <th className="px-4 py-3 font-semibold text-gray-600 text-center">Factor</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50">
                                        {Object.entries(mulimFactor).map(([fy, factor]) => (
                                            <tr key={fy} className="hover:bg-amber-50/30 transition-colors">
                                                <td className="px-4 py-2 font-medium text-gray-900">Fe{fy}</td>
                                                <td className="px-4 py-2 text-center">
                                                    <EditableInput
                                                        value={factor}
                                                        onChange={(val) => updateMulimFactor(fy, val)}
                                                        isReadOnly={isReadOnly}
                                                    />
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </section>
                    </div>
                </div>

                {/* Footer */}
                {!isReadOnly && (
                    <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/50 flex justify-end">
                        <button
                            onClick={handleConfirmChanges}
                            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl shadow-lg shadow-blue-600/20 transition-all duration-200 active:scale-95"
                        >
                            Save
                        </button>
                    </div>
                )}
            </div>

            {showPopup && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 sm:p-6">
                    <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm transition-opacity" onClick={() => setShowPopup(false)} />
                    <div className="relative bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-gray-100 flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200">
                        {/* Header */}
                        <div className="px-6 py-4 border-b border-gray-100 bg-red-50/50 flex items-center gap-3">
                            <div className="p-2 bg-red-100 text-red-600 rounded-full">
                                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                </svg>
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-gray-900">Confirm Changes</h2>
                                <p className="text-xs text-red-600 font-medium">Warning: Modifying IS 456:2000 reference values impacts calculations, please don&apos;t change values without your manager&apos;s permission.</p>
                            </div>
                        </div>

                        {/* Content */}
                        <div className="p-6 max-h-[60vh] overflow-y-auto custom-scrollbar bg-gray-50/30">
                            {changes.length === 0 ? (
                                <p className="text-gray-500 text-center py-4">No changes detected.</p>
                            ) : (
                                <div className="space-y-3">
                                    {changes.map((c, i) => (
                                        <div key={i} className="flex items-center justify-between p-3 bg-white border border-gray-100 rounded-xl shadow-sm">
                                            <span className="text-sm font-medium text-gray-700">{c.field}</span>
                                            <div className="flex items-center gap-2 text-sm">
                                                <span className="text-gray-500 line-through decoration-red-400">{c.oldValue ?? "None"}</span>
                                                <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                                </svg>
                                                <span className="font-semibold text-emerald-600">{c.newValue}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/50 flex justify-end gap-3">
                            <button onClick={() => setShowPopup(false)} className="px-5 py-2 text-gray-600 font-medium hover:bg-gray-200 rounded-xl transition-colors">
                                Cancel
                            </button>
                            <button onClick={handleSave} disabled={changes.length === 0} className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold rounded-xl shadow-lg shadow-blue-600/20 transition-all duration-200 active:scale-95">
                                Confirm Save
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {/* Config Logs Modal */}
            <ConfigLogs isOpen={open} onClose={() => setOpen(false)} apiUrl="/api/beamconfig/logs" title="Beam Config Change History" />

        </div>
    );
};

export default BeamConfigModal;
