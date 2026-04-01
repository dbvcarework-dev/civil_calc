import React, { useState } from 'react';

const Field = ({ label, id, value, onChange, options, type }) => (
    <div>
        <label htmlFor={id} className="text-sm font-medium text-gray-700 mb-1.5 inline-block">{label}</label>
        {type === 'select' ? (
            <select
                id={id}
                value={value ?? ''}
                onChange={onChange}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all duration-200 text-gray-700 sm:text-sm"
            >
                {options?.map((opt) => {
                    const val = typeof opt === 'object' ? opt.value : opt;
                    const lbl = typeof opt === 'object' ? opt.label : opt;
                    return (
                        <option key={val} value={val}>
                            {lbl}
                        </option>
                    );
                })}
            </select>
        ) : type === 'text' ? (
            <input
                id={id}
                type="text"
                value={value ?? ''}
                onChange={onChange}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all duration-200 text-gray-700 sm:text-sm"
                placeholder="Enter text..."
            />
        ) : (
            <input
                id={id}
                type="text"
                inputMode="decimal"
                value={value ?? ''}
                onChange={onChange}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all duration-200 text-gray-700 sm:text-sm"
                placeholder="—"
            />
        )}
    </div>
);

const TankInput = ({ setInputs, inputs }) => {
    const [activeTab, setActiveTab] = useState(0);

    const set = (key, isText = false) => (e) => {
        if (isText) {
            setInputs({ ...inputs, [key]: e.target.value });
            return;
        }
        const val = e.target.value;
        if (val !== '' && isNaN(Number(val))) return; // Ensure valid number
        if (val !== '' && Number(val) < 0) return; // Prevent negative values
        setInputs({ ...inputs, [key]: val });
    };

    const tabs = [
        "Tank Details",
        "Load Details",
        "Plate & Layer",
        "Foundation Geometry",
        "Material & Soil",
        "Advanced Params"
    ];

    return (
        <div className="flex flex-col gap-8 h-full">
            <div className="bg-white shadow-xl shadow-gray-200/40 rounded-3xl border border-gray-100 overflow-hidden flex flex-col shrink-0">

                {/* Tabs Header */}
                <div className="bg-gray-50/50 border-b border-gray-100 px-6 pt-6">
                    <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                        <span className="w-1.5 h-6 rounded-full bg-indigo-500 inline-block mr-3"></span>
                        Parameter Configuration
                    </h2>
                    <div className="flex overflow-x-auto hide-scrollbar gap-2 pb-px">
                        {tabs.map((tab, idx) => (
                            <button
                                key={idx}
                                onClick={() => setActiveTab(idx)}
                                className={`py-2.5 px-5 rounded-t-lg whitespace-nowrap text-sm font-medium transition-all duration-200 
                                ${activeTab === idx
                                        ? 'bg-white text-indigo-600 border-x border-t border-gray-100 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.02)] relative after:absolute after:bottom-[-1px] after:left-0 after:right-0 after:h-[1px] after:bg-white'
                                        : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100/50 border-transparent'}
                            `}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Tab Content */}
                <div className="p-6 sm:p-8 flex-1 flex flex-col">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-6 flex-1 min-h-[360px]">

                        {/* 1. Tank Details */}
                        {activeTab === 0 && (
                            <>
                                <Field label="Design/Tank Name" id="tankName" type="text" value={inputs.tankName} onChange={set('tankName', true)} />
                                <Field label="Tank Internal Diameter (m)" id="tankID" value={inputs.tankID} onChange={set('tankID')} />
                                <Field label="B.C.D (m)" id="bcd" value={inputs.bcd} onChange={set('bcd')} />
                                <Field label="Total Height of Equipment (m)" id="totalHeightEqpt" value={inputs.totalHeightEqpt} onChange={set('totalHeightEqpt')} />
                                <Field label="Liquid Level in Tank (m)" id="liquidLevel" value={inputs.liquidLevel} onChange={set('liquidLevel')} />
                            </>
                        )}

                        {/* 2. Load Details */}
                        {activeTab === 1 && (
                            <>
                                <Field label="Water Density (kN/m³)" id="waterDensity" value={inputs.waterDensity} onChange={set('waterDensity')} />
                                <Field label="Liquid Density (kN/m³)" id="liquidDensity" value={inputs.liquidDensity} onChange={set('liquidDensity')} />
                                <Field label="Empty Weight of Tank (kN)" id="emptyWtTank" value={inputs.emptyWtTank} onChange={set('emptyWtTank')} />
                                <Field label="Operating Weight of Tank (kN)" id="operatingWtTank" value={inputs.operatingWtTank} onChange={set('operatingWtTank')} />
                                <Field label="Hydrotest Weight of Tank (kN)" id="hydrotestWtTank" value={inputs.hydrotestWtTank} onChange={set('hydrotestWtTank')} />
                            </>
                        )}

                        {/* 3. Plate & Layer Thickness */}
                        {activeTab === 2 && (
                            <>
                                <Field label="Tank Bottom Plate Thickness (mm)" id="tankBottomPlateThk" value={inputs.tankBottomPlateThk} onChange={set('tankBottomPlateThk')} />
                                <Field label="THK Of Sand Bitumin Layer (m)" id="thkSandBitumen" value={inputs.thkSandBitumen} onChange={set('thkSandBitumen')} />
                                <Field label="THK Of M30 Concrete Layer (m)" id="thkM30Conc" value={inputs.thkM30Conc} onChange={set('thkM30Conc')} />
                                <Field label="THK Of M75 Concrete Layer (m)" id="thkM75Conc" value={inputs.thkM75Conc} onChange={set('thkM75Conc')} />
                            </>
                        )}

                        {/* 4. Foundation Geometry */}
                        {activeTab === 3 && (
                            <>
                                <Field label="Height of Ring Wall Above GL (m)" id="heightRBAboveGL" value={inputs.heightRBAboveGL} onChange={set('heightRBAboveGL')} />
                                <Field label="Depth of Ring Beam Below GL (m)" id="depthRBBelowGL" value={inputs.depthRBBelowGL} onChange={set('depthRBBelowGL')} />
                                <Field label="Depth of FDN Raft (m)" id="depthFdnRaft" value={inputs.depthFdnRaft} onChange={set('depthFdnRaft')} />
                                <Field label="Thickness of Ring Beam/Wall (m)" id="thkRingBeamWall" value={inputs.thkRingBeamWall} onChange={set('thkRingBeamWall')} />
                                <Field label="Width of Ring Beam Raft (m)" id="widthRingBeamRaft" value={inputs.widthRingBeamRaft} onChange={set('widthRingBeamRaft')} />
                            </>
                        )}

                        {/* 5. Material & Soil Properties */}
                        {activeTab === 4 && (
                            <>
                                <Field label="SBC at Given Depth (kN/m²)" id="sbcAtFdnDepth" value={inputs.sbcAtFdnDepth} onChange={set('sbcAtFdnDepth')} />
                                <Field label="Unit Weight of Concrete (kN/m³)" id="unitWtConcrete" value={inputs.unitWtConcrete} onChange={set('unitWtConcrete')} />
                                <Field label="Unit Weight of Sand (kN/m³)" id="unitWtSand" value={inputs.unitWtSand} onChange={set('unitWtSand')} />
                                <Field label="Unit Weight of Soil (kN/m³)" id="unitWtSoil" value={inputs.unitWtSoil} onChange={set('unitWtSoil')} />
                                <Field
                                    label="Fck (Concrete Grade)"
                                    id="fck"
                                    value={inputs.fck}
                                    onChange={set('fck')}
                                    options={[
                                        { value: 25, label: 'M25' },
                                        { value: 30, label: 'M30' },
                                        { value: 35, label: 'M35' }
                                    ]}
                                    type="select"
                                />

                                <Field
                                    label="Fy (Steel Grade)"
                                    id="fy"
                                    value={inputs.fy}
                                    onChange={set('fy')}
                                    options={[
                                        { value: 415, label: 'Fe415' },
                                        { value: 500, label: 'Fe500' }
                                    ]}
                                    type="select"
                                />
                            </>
                        )}

                        {/* 6. Advanced Soil Parameters */}
                        {activeTab === 5 && (
                            <>
                                <Field label="Coefficient of Earth Pressure (Ka)" id="Ka" value={inputs.Ka} onChange={set('Ka')} />
                                <Field label="Coefficient of Friction (μ)" id="mu" value={inputs.mu} onChange={set('mu')} />
                                <Field label="Wind Load Force (kN)" id="windFx" value={inputs.windFx} onChange={set('windFx')} />
                                <Field label="Wind Load Moment (kN-m)" id="windM" value={inputs.windM} onChange={set('windM')} />
                                <Field label="Seismic Load Force (kN)" id="seismicFx" value={inputs.seismicFx} onChange={set('seismicFx')} />
                                <Field label="Seismic Load Moment (kN-m)" id="seismicM" value={inputs.seismicM} onChange={set('seismicM')} />
                            </>
                        )}

                    </div>

                    {/* Navigation Buttons */}
                    <div className="mt-8 pt-6 border-t border-gray-100 flex items-center justify-between">
                        <button
                            onClick={() => setActiveTab(prev => Math.max(0, prev - 1))}
                            disabled={activeTab === 0}
                            className={`px-5 py-2.5 rounded-xl font-medium text-sm transition-all shadow-sm border ${activeTab === 0 ? 'text-gray-300 border-gray-100 bg-gray-50/50 cursor-not-allowed' : 'text-gray-600 border-gray-200 bg-white hover:bg-gray-50'}`}
                        >
                            Previous
                        </button>
                        <span className="text-xs text-gray-400 font-bold tracking-widest uppercase">
                            Step {activeTab + 1} of 6
                        </span>
                        <button
                            onClick={() => setActiveTab(prev => Math.min(5, prev + 1))}
                            disabled={activeTab === 5}
                            className={`px-5 py-2.5 rounded-xl font-medium text-sm transition-all shadow-sm border ${activeTab === 5 ? 'text-gray-300 border-gray-100 bg-gray-50/50 cursor-not-allowed' : 'bg-indigo-600 text-white border-indigo-600 hover:bg-indigo-700 hover:shadow-indigo-500/20 shadow-lg'}`}
                        >
                            Next Step
                        </button>
                    </div>
                </div>
            </div>

            {/* Tank Visualization Section */}
            <TankVisualization inputs={inputs} />
        </div>
    );
};

const DataBox = ({ label, value, unit }) => (
    <div className="bg-gray-50 border border-gray-100 rounded-xl p-3 flex flex-col">
        <span className="text-xs text-gray-500 font-medium mb-1">{label}</span>
        <span className="text-sm font-semibold text-gray-800">{value !== null && value !== undefined && value !== '' ? value : '—'} <span className="text-gray-400 font-normal">{unit}</span></span>
    </div>
);

const TankVisualization = ({ inputs }) => {
    const requiredKeys = [
        'bcd', 'totalHeightEqpt', 'heightRBAboveGL',
        'depthRBBelowGL', 'depthFdnRaft', 'thkRingBeamWall', 'widthRingBeamRaft'
    ];

    const hasRequired = requiredKeys.every(key =>
        inputs[key] !== null && inputs[key] !== undefined && inputs[key] !== ''
    );

    if (!hasRequired) {
        return (
            <div className="bg-white shrink-0 shadow-xl shadow-gray-200/40 rounded-3xl border border-gray-100 p-8 flex flex-col items-center justify-center text-center min-h-[300px]">
                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                    <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                </div>
                <p className="text-gray-500 font-medium">Enter tank details to visualize</p>
            </div>
        );
    }

    return (
        <div className="bg-white shrink-0 shadow-xl shadow-gray-200/40 rounded-3xl border border-gray-100 overflow-hidden flex flex-col p-6 sm:p-8">
            <h2 className="text-lg font-semibold text-gray-800 mb-6 flex items-center">
                <span className="w-1.5 h-6 rounded-full bg-indigo-500 inline-block mr-3"></span>
                Tank Visualization
            </h2>

            <div className="flex flex-col lg:flex-row items-center gap-8">
                <div className="w-full lg:w-1/2 flex justify-center">
                    <svg viewBox="0 0 300 350" className="w-full max-w-[280px] h-auto drop-shadow-sm">
                        <ellipse cx="150" cy="60" rx="70" ry="15" fill="#f8fafc" stroke="#4f46e5" strokeWidth="2" />

                        <line x1="80" y1="60" x2="80" y2="180" stroke="#4f46e5" strokeWidth="2" />
                        <line x1="220" y1="60" x2="220" y2="180" stroke="#4f46e5" strokeWidth="2" />

                        <path d="M 80 180 A 70 15 0 0 0 220 180" fill="#e0e7ff" opacity="0.5" />
                        <path d="M 80 180 A 70 15 0 0 0 220 180" fill="none" stroke="#4f46e5" strokeWidth="2" />
                        <path d="M 80 180 A 70 15 0 0 1 220 180" fill="none" stroke="#4f46e5" strokeWidth="1" strokeDasharray="4 4" />

                        <rect x="70" y="180" width="20" height="40" fill="#e0e7ff" stroke="#4338ca" strokeWidth="1.5" />
                        <rect x="210" y="180" width="20" height="40" fill="#e0e7ff" stroke="#4338ca" strokeWidth="1.5" />

                        <line x1="20" y1="220" x2="280" y2="220" stroke="#10b981" strokeWidth="2" strokeDasharray="8 4" />
                        <text x="285" y="224" fontSize="12" fill="#059669" fontWeight="bold">GL</text>

                        <rect x="70" y="220" width="20" height="50" fill="#cbd5e1" stroke="#475569" strokeWidth="1.5" />
                        <rect x="210" y="220" width="20" height="50" fill="#cbd5e1" stroke="#475569" strokeWidth="1.5" />

                        <rect x="50" y="270" width="60" height="20" fill="#94a3b8" stroke="#475569" strokeWidth="1.5" />
                        <rect x="190" y="270" width="60" height="20" fill="#94a3b8" stroke="#475569" strokeWidth="1.5" />

                        <line x1="40" y1="60" x2="40" y2="180" stroke="#9ca3af" strokeWidth="1" />
                        <line x1="35" y1="60" x2="45" y2="60" stroke="#9ca3af" strokeWidth="1" />
                        <line x1="35" y1="180" x2="45" y2="180" stroke="#9ca3af" strokeWidth="1" />
                        <text x="15" y="125" fontSize="10" fill="#6b7280" transform="rotate(-90 15,125)">Height</text>

                        <line x1="80" y1="35" x2="220" y2="35" stroke="#9ca3af" strokeWidth="1" />
                        <line x1="80" y1="30" x2="80" y2="40" stroke="#9ca3af" strokeWidth="1" />
                        <line x1="220" y1="30" x2="220" y2="40" stroke="#9ca3af" strokeWidth="1" />
                        <text x="140" y="28" fontSize="10" fill="#6b7280" textAnchor="middle">BCD</text>

                        <text x="150" y="205" fontSize="10" fill="#4338ca" textAnchor="middle">RB Above GL</text>
                        <text x="150" y="245" fontSize="10" fill="#475569" textAnchor="middle">RB Below GL</text>
                        <text x="120" y="283" fontSize="10" fill="#475569" textAnchor="middle">Raft</text>
                    </svg>
                </div>

                <div className="w-full lg:w-1/2 flex flex-col justify-center">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <DataBox label="BCD" value={inputs.bcd} unit="m" />
                        <DataBox label="Total Height" value={inputs.totalHeightEqpt} unit="m" />
                        <DataBox label="RB Above GL" value={inputs.heightRBAboveGL} unit="m" />
                        <DataBox label="RB Below GL" value={inputs.depthRBBelowGL} unit="m" />
                        <DataBox label="FDN Raft Depth" value={inputs.depthFdnRaft} unit="m" />
                        <DataBox label="RB Wall Thk" value={inputs.thkRingBeamWall} unit="m" />
                        <DataBox label="RB Raft Width" value={inputs.widthRingBeamRaft} unit="m" />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TankInput;