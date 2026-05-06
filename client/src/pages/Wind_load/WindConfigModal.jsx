import React, { useState } from 'react';
import axios from 'axios';
import ConfigLogs from '../../components/configLogs.jsx';


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

const WindConfigModal = ({ isOpen, onClose, windTable, setWindTable, isReadOnly }) => {
    if (!isOpen) return null;

    const vbSpeeds = [33, 39, 44, 47, 50, 55];
    const designLives = [5, 25, 50, 100];
    const terrainCats = [1, 2, 3, 4];

    const [k1Table, setK1Table] = useState(windTable.k1Table);
    const [k2Table, setK2Table] = useState(windTable.k2Table);
    const [kdMap, setKdMap] = useState(windTable.kdMap);
    const [kcMap, setKcMap] = useState(windTable.kcMap);
    const [cityWindSpeeds, setCityWindSpeeds] = useState(windTable.cityWindSpeeds);

    const [showPopup, setShowPopup] = useState(false);
    const [changes, setChanges] = useState([]);
    const [open, setOpen] = useState(false);




    function getChanges(oldConfig, newConfig) {
        const changes = [];

        // k1Table
        for (const life in newConfig.k1Table) {
            for (const vb in newConfig.k1Table[life].vbValues) {
                const oldVal = oldConfig?.k1Table?.[life]?.vbValues?.[vb];
                const newVal = newConfig.k1Table[life].vbValues[vb];
                if (oldVal !== newVal) {
                    changes.push({
                        field: `k1Table[${life}][${vb}]`,
                        oldValue: oldVal,
                        newValue: newVal
                    });
                }
            }
        }

        // k2Table
        for (const cat in newConfig.k2Table.terrainCategories) {
            for (let i = 0; i < newConfig.k2Table.terrainCategories[cat].length; i++) {
                const oldVal = oldConfig?.k2Table?.terrainCategories?.[cat]?.[i];
                const newVal = newConfig.k2Table.terrainCategories[cat][i];
                if (oldVal !== newVal) {
                    changes.push({
                        field: `k2Table.terrainCategories[${cat}][${i}]`,
                        oldValue: oldVal,
                        newValue: newVal
                    });
                }
            }
        }

        // kdMap
        for (const key in newConfig.kdMap) {
            const oldVal = oldConfig?.kdMap?.[key];
            const newVal = newConfig.kdMap[key];
            if (oldVal !== newVal) {
                changes.push({
                    field: `kdMap[${key}]`,
                    oldValue: oldVal,
                    newValue: newVal
                });
            }
        }

        // kcMap
        for (const key in newConfig.kcMap) {
            const oldVal = oldConfig?.kcMap?.[key];
            const newVal = newConfig.kcMap[key];
            if (oldVal !== newVal) {
                changes.push({
                    field: `kcMap[${key}]`,
                    oldValue: oldVal,
                    newValue: newVal
                });
            }
        }

        // cityWindSpeeds
        for (let i = 0; i < newConfig.cityWindSpeeds.length; i++) {
            const oldVal = oldConfig?.cityWindSpeeds?.[i]?.vb;
            const newVal = newConfig.cityWindSpeeds[i].vb;
            if (oldVal !== newVal) {
                changes.push({
                    field: `cityWindSpeeds[${i}].vb`,
                    oldValue: oldVal,
                    newValue: newVal
                });
            }
        }

        return changes;
    }

    const handleConfirmChanges = () => {
        const changes = getChanges(windTable, {
            k1Table,
            k2Table,
            kdMap,
            kcMap,
            cityWindSpeeds
        });

        setChanges(changes);
        setShowPopup(true);
    };

    const updateK1 = (life, vb, val) => {
        setK1Table(prev => ({
            ...prev,
            [life]: {
                ...prev[life],
                vbValues: {
                    ...prev[life].vbValues,
                    [vb]: val
                }
            }
        }));
    };

    const updateK2 = (cat, idx, val) => {
        setK2Table(prev => {
            const newCatArray = [...prev.terrainCategories[cat]];
            newCatArray[idx] = val;
            return {
                ...prev,
                terrainCategories: {
                    ...prev.terrainCategories,
                    [cat]: newCatArray
                }
            };
        });
    };

    const updateKd = (shape, val) => {
        setKdMap(prev => ({ ...prev, [shape]: val }));
    };

    const updateKc = (cat, val) => {
        setKcMap(prev => ({ ...prev, [cat]: val }));
    };

    const updateCityVb = (idx, val) => {
        setCityWindSpeeds(prev => {
            const newArr = [...prev];
            newArr[idx] = { ...newArr[idx], vb: val };
            return newArr;
        });
    };

    const handleSave = async () => {
        try {
            await axios.post("/api/windconfig", {
                moduleName: "wind-load",
                k1Table,
                k2Table,
                kdMap,
                kcMap,
                cityWindSpeeds,
                changes
            }, { withCredentials: true });
            const res = await axios.get("http://localhost:3000/api/windconfig", { withCredentials: true });
            setWindTable(res.data);
            setShowPopup(false);
        } catch (error) {
            console.error("Error saving configuration:", error);
            alert("Failed to save configuration!");
        }
    };

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
                    <div>
                        {isReadOnly ? (
                            <h2 className="text-xl font-bold text-gray-900">Lookup Tables & Constants Used</h2>
                        ) : (
                            <h2 className="text-xl font-bold text-gray-900">Lookup Tables & Constants</h2>
                        )}
                        <p className="text-xs text-gray-500">IS 875 (Part 3) : 2015 Reference Values</p>
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

                    {/* K1 Table */}
                    <section>
                        <h3 className="text-sm font-bold text-blue-600 uppercase tracking-widest mb-4 flex items-center gap-2">
                            <span className="w-1.5 h-4 bg-blue-500 rounded-full"></span>
                            Table 1: Risk Coefficient (k1)
                        </h3>
                        <div className="overflow-x-auto rounded-2xl border border-gray-100">
                            <table className="w-full text-sm text-left border-collapse">
                                <thead>
                                    <tr className="bg-gray-50 border-b border-gray-100">
                                        <th className="px-4 py-3 font-semibold text-gray-600 sticky left-0 bg-gray-50">Design Life (yrs)</th>
                                        <th className="px-4 py-3 font-semibold text-gray-600">Structure Type</th>
                                        {vbSpeeds.map(vb => (
                                            <th key={vb} className="px-4 py-3 font-semibold text-gray-600 text-center">{vb} m/s</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {designLives.map(life => {
                                        const data = k1Table[life.toString()];
                                        return (
                                            <tr key={life} className="hover:bg-blue-50/30 transition-colors">
                                                <td className="px-4 py-2 font-medium text-gray-900 sticky left-0 bg-white border-r border-gray-50">{life}</td>
                                                <td className="px-4 py-2 text-gray-700 border-r border-gray-50 min-w-[150px]">{data.structureType}</td>
                                                {vbSpeeds.map(vb => (
                                                    <td key={vb} className="px-4 py-2 text-center text-gray-700">
                                                        <EditableInput
                                                            value={data.vbValues[vb.toString()]}
                                                            onChange={(val) => updateK1(life.toString(), vb.toString(), val)}
                                                            isReadOnly={isReadOnly}
                                                        />
                                                    </td>
                                                ))}
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </section>

                    {/* K2 Table */}
                    <section>
                        <h3 className="text-sm font-bold text-emerald-600 uppercase tracking-widest mb-4 flex items-center gap-2">
                            <span className="w-1.5 h-4 bg-emerald-500 rounded-full"></span>
                            Table 2: Terrain, Height and Structure Size Factor (k2)
                        </h3>
                        <div className="overflow-x-auto rounded-2xl border border-gray-100 max-h-64 overflow-y-auto">
                            <table className="w-full text-sm text-left border-collapse">
                                <thead className="sticky top-0 bg-gray-50 shadow-sm ">
                                    <tr className="bg-gray-50 border-b border-gray-100">
                                        <th className="px-4 py-3 font-semibold text-gray-600 sticky left-0 bg-gray-50 z-20">Height (m)</th>
                                        {terrainCats.map(cat => (
                                            <th key={cat} className="px-4 py-3 font-semibold text-gray-600 text-center">Category {cat}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {k2Table.heights.map((h, idx) => (
                                        <tr key={h} className="hover:bg-emerald-50/30 transition-colors">
                                            <td className="px-4 py-2 font-medium text-gray-900 sticky left-0 bg-white border-r border-gray-50">{h}</td>
                                            {terrainCats.map(cat => (
                                                <td key={cat} className="px-4 py-2 text-center text-gray-700">
                                                    <EditableInput
                                                        value={k2Table.terrainCategories[cat.toString()][idx]}
                                                        onChange={(val) => updateK2(cat.toString(), idx, val)}
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

                        {/* Kd Table */}
                        <section>
                            <h3 className="text-sm font-bold text-purple-600 uppercase tracking-widest mb-4 flex items-center gap-2">
                                <span className="w-1.5 h-4 bg-purple-500 rounded-full"></span>
                                Directionality (kd)
                            </h3>
                            <div className="overflow-hidden rounded-2xl border border-gray-100">
                                <table className="w-full text-sm text-left border-collapse">
                                    <thead>
                                        <tr className="bg-gray-50 border-b border-gray-100">
                                            <th className="px-4 py-3 font-semibold text-gray-600">Shape</th>
                                            <th className="px-4 py-3 font-semibold text-gray-600 text-center">kd</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50">
                                        {Object.entries(kdMap).map(([shape, value]) => (
                                            <tr key={shape} className="hover:bg-purple-50/30 transition-colors">
                                                <td className="px-4 py-2 font-medium text-gray-900 capitalize">{shape.replace('_', ' ')}</td>
                                                <td className="px-4 py-2 text-center text-gray-700">
                                                    <EditableInput
                                                        value={value}
                                                        onChange={(val) => updateKd(shape, val)}
                                                        isReadOnly={isReadOnly}
                                                    />
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </section>

                        {/* Kc Table */}
                        <section>
                            <h3 className="text-sm font-bold text-rose-600 uppercase tracking-widest mb-4 flex items-center gap-2">
                                <span className="w-1.5 h-4 bg-rose-500 rounded-full"></span>
                                Category (kc)
                            </h3>
                            <div className="overflow-hidden rounded-2xl border border-gray-100">
                                <table className="w-full text-sm text-left border-collapse">
                                    <thead>
                                        <tr className="bg-gray-50 border-b border-gray-100">
                                            <th className="px-4 py-3 font-semibold text-gray-600">Category</th>
                                            <th className="px-4 py-3 font-semibold text-gray-600 text-center">kc</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50">
                                        {Object.entries(kcMap).map(([cat, value]) => (
                                            <tr key={cat} className="hover:bg-rose-50/30 transition-colors">
                                                <td className="px-4 py-2 font-medium text-gray-900">{cat === '3plus' ? '3 or more' : cat}</td>
                                                <td className="px-4 py-2 text-center text-gray-700">
                                                    <EditableInput
                                                        value={value}
                                                        onChange={(val) => updateKc(cat, val)}
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

                    {/* City Wind Speeds */}
                    <section>
                        <h3 className="text-sm font-bold text-cyan-600 uppercase tracking-widest mb-4 flex items-center gap-2">
                            <span className="w-1.5 h-4 bg-cyan-500 rounded-full"></span>
                            Appendix A: Basic Wind Speeds (Vb)
                        </h3>
                        <div className="overflow-x-auto rounded-2xl border border-gray-100 max-h-64 overflow-y-auto">
                            <table className="w-full text-sm text-left border-collapse">
                                <thead className="sticky top-0 bg-gray-50 shadow-sm ">
                                    <tr className="border-b border-gray-100">
                                        <th className="px-4 py-3 font-semibold text-gray-600">City / Location</th>
                                        <th className="px-4 py-3 font-semibold text-gray-600 text-center">Wind Speed (m/s)</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {cityWindSpeeds.map((item, idx) => (
                                        <tr key={idx} className="hover:bg-cyan-50/30 transition-colors">
                                            <td className="px-4 py-2 font-medium text-gray-900">{item.city}</td>
                                            <td className="px-4 py-2 text-center text-gray-700 font-medium">
                                                <EditableInput
                                                    value={item.vb}
                                                    onChange={(val) => updateCityVb(idx, val)}
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

                {/* Footer */}
                <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/50 flex justify-end">
                    <button
                        onClick={handleConfirmChanges}
                        className="px-6 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-gray-800 font-semibold rounded-xl transition-all duration-200 active:scale-95"
                    >
                        Save
                    </button>
                </div>
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
                                <p className="text-xs text-red-600 font-medium">Warning: Modifying IS:875 Part 3 reference values impacts calculations, please dont change values without your manager's permission.</p>
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
                            <button onClick={handleSave} disabled={changes.length === 0} className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-semibold rounded-xl  transition-all duration-200 active:scale-95">
                                Confirm Save
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <ConfigLogs isOpen={open} onClose={() => setOpen(false)} apiUrl="/api/windconfig/logs" title="Wind Config Change History" />
        </div>
    );
};

export default WindConfigModal;