import React from 'react';
import { DESIGN_LIVES, DESIGN_LIFE_TYPE_MAP } from '../utils/windLoadCalc';
import { cityWindSpeeds } from "../config/winLoadTables.json"

// ── Shared primitives matching app theme ──────────────────────────────────────

const Label = ({ children }) => (
    <label className="text-sm font-medium text-gray-700 mb-1.5 inline-block">{children}</label>
);

const InputNum = ({ id, value, onChange, min, placeholder }) => (
    <input
        id={id}
        type="text"
        inputMode="decimal"
        value={value ?? ''}
        onChange={(e) => {
            const raw = e.target.value;
            if (raw !== '' && raw !== '-' && isNaN(Number(raw))) return; // Ensure valid number
            if (min === 0 && raw !== '' && raw !== '-' && Number(raw) < 0) return;
            // cpe coefficients can be negative, so we only restrict if min === 0
            if (min !== undefined && min !== 0 && raw !== '' && Number(raw) < min) {
                // Not returning early here to allow user to type negative signs initially
                if (raw !== '-') {
                    // Wait, actually let them just type it and we coerce in calc.
                }
            }
            onChange(e); // Pass the synthetic event through so `set(key)(e)` captures `e.target.value`
        }}
        placeholder={placeholder ?? '—'}
        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl
            focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none
            transition-all duration-200 text-gray-700 sm:text-sm"
    />
);

const SelectField = ({ id, value, onChange, children }) => (
    <select
        id={id}
        value={value}
        onChange={onChange}
        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl
            focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none
            transition-all duration-200 text-gray-700 sm:text-sm appearance-none cursor-pointer"
    >
        {children}
    </select>
);

// Pill badge showing current computed K-value
const KBadge = ({ label, value, unit = '' }) => (
    <span className="inline-flex items-center gap-1.5 bg-indigo-50 border border-indigo-100 rounded-lg px-3 py-1.5 text-sm">
        <span className="font-semibold text-indigo-400 text-xs">{label}</span>
        <span className="font-bold text-indigo-700">{value != null ? `${value}${unit}` : '—'}</span>
    </span>
);

// Card wrapper — matches app's rounded-3xl white cards
const Card = ({ title, accent = 'bg-indigo-500', children }) => (
    <div className="bg-white shadow-xl shadow-gray-200/40 rounded-3xl border border-gray-100 overflow-hidden">
        <div className="px-6 pt-6 pb-3 border-b border-gray-100">
            <h2 className="text-lg font-semibold text-gray-800 flex items-center">
                <span className={`w-1.5 h-6 rounded-full ${accent} inline-block mr-3 shrink-0`} />
                {title}
            </h2>
        </div>
        <div className="px-6 py-5 space-y-5">{children}</div>
    </div>
);

// Section sub-label — matches group-title style
const GroupTitle = ({ children }) => (
    <p className="text-xs font-semibold uppercase tracking-widest text-indigo-600 mt-4 mb-2 pb-1 border-b border-gray-100">
        {children}
    </p>
);

// Formula display
const Formula = ({ children }) => (
    <p className="text-xs text-gray-500 font-mono bg-gray-50 px-3 py-2 rounded-xl border border-gray-100 mt-1">
        {children}
    </p>
);

// Radio option card
const RadioOption = ({ name, value, checked, onChange, label, desc, badge }) => (
    <label className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all duration-150
        ${checked ? 'border-indigo-300 bg-indigo-50/50' : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50/50'}`}>
        <input
            type="radio"
            name={name}
            value={value}
            checked={checked}
            onChange={() => onChange(value)}
            className="mt-0.5 accent-indigo-600"
        />
        <span className="flex-1 min-w-0">
            <span className="block text-sm font-medium text-gray-700">{label}</span>
            {desc && <span className="block text-xs text-gray-500 mt-0.5">{desc}</span>}
        </span>
        {checked && badge && (
            <span className="shrink-0 text-xs font-bold text-indigo-700 bg-indigo-100 px-2 py-0.5 rounded-lg">{badge}</span>
        )}
    </label>
);

// ── Main Component ────────────────────────────────────────────────────────────

const WindLoadInput = ({ inputs, onChange, results }) => {
    const set = (key) => (e) => onChange(key, e.target.value);
    const setVal = (key) => (val) => onChange(key, val);

    const terrainDesc = {
        '1': 'Open sea coasts, flat treeless plains',
        '2': 'Open terrain with scattered obstructions < 10m high',
        '3': 'Suburban/industrial, numerous obstacles 10–15m',
        '4': 'Dense urban, large city with tall buildings',
    };

    return (
        <div className="space-y-6">

            {/* ── Project & Dimensions ── */}
            <div className="bg-white shadow-xl shadow-gray-200/40 rounded-3xl border border-gray-100 overflow-hidden">
                <div className="px-6 pt-6 pb-3 border-b border-gray-100">
                    <h2 className="text-lg font-semibold text-gray-800 flex items-center">
                        <span className="w-1.5 h-6 rounded-full bg-gray-400 inline-block mr-3 shrink-0" />
                        Project &amp; Structure Details
                    </h2>
                </div>
                <div className="px-6 py-5 space-y-5">
                    <div>
                        <Label>Project / Design Name</Label>
                        <input
                            type="text"
                            value={inputs.projectName ?? ''}
                            onChange={(e) => onChange('projectName', e.target.value)}
                            placeholder="e.g. Factory Shed"
                            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl
                                focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none
                                transition-all duration-200 text-gray-700 sm:text-sm"
                        />
                    </div>
                    <div>
                        <GroupTitle>Structure Dimensions</GroupTitle>
                        <div className="grid grid-cols-3 gap-4">
                            {[
                                { id: 'H', label: 'H — Height (m)', key: 'H' },
                                { id: 'W', label: 'W — Width (m)', key: 'W' },
                                { id: 'L', label: 'L — Length (m)', key: 'L' },
                            ].map(({ id, label, key }) => (
                                <div key={id}>
                                    <Label>{label}</Label>
                                    <InputNum id={id} value={inputs[key]} onChange={set(key)} min={0} step={0.1} />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Section 1: Design Wind Speed ── */}
            <Card title="Section 1 — Design Wind Speed (Vz)">
                <Formula>Vz = Vb × K1 × K2 × K3 × K4</Formula>

                {/* Vb */}
                <div>
                    <GroupTitle>Vb — Basic Wind Speed</GroupTitle>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <Label>City / Location</Label>
                            <SelectField id="city" value={inputs.city} onChange={set('city')}>
                                {cityWindSpeeds.map(c => (
                                    <option key={c.city} value={c.city}>{c.city}</option>
                                ))}
                            </SelectField>
                        </div>
                        <div className="flex flex-col justify-end">
                            <KBadge label="Vb" value={results?.vb} unit=" m/s" />
                        </div>
                    </div>
                </div>

                {/* K1 */}
                <div>
                    <GroupTitle>K1 — Risk Coefficient (IS:875 Table 1)</GroupTitle>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <Label>Design Life</Label>
                            <SelectField id="designLife" value={inputs.designLife} onChange={set('designLife')}>
                                {DESIGN_LIVES.map(y => <option key={y} value={y}>{y} years — {DESIGN_LIFE_TYPE_MAP[y]}</option>)}
                            </SelectField>
                        </div>
                        <div className="flex flex-col justify-end">
                            <span className="inline-flex items-center gap-1.5 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm">
                                <span className="font-medium text-gray-500 text-xs">Structure Type</span>
                                <span className="font-semibold text-gray-800">{DESIGN_LIFE_TYPE_MAP[inputs.designLife] ?? '—'}</span>
                            </span>
                        </div>
                    </div>
                    <div className="mt-3">
                        {results?.k1Invalid ? (
                            <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl px-3 py-2 text-xs font-semibold text-red-700">
                                <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                                </svg>
                                K1 not available for {inputs.designLife} yrs design life (Vb = {results?.vb ?? '?'} m/s)
                            </div>
                        ) : (
                            <KBadge label="K1" value={results?.k1} />
                        )}
                    </div>
                </div>

                {/* K2 */}
                <div>
                    <GroupTitle>K2 — Terrain &amp; Height Factor (IS:875 Table 2)</GroupTitle>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <Label>Terrain Category</Label>
                            <SelectField id="terrainCategory" value={inputs.terrainCategory} onChange={set('terrainCategory')}>
                                {['1', '2', '3', '4'].map(cat => (
                                    <option key={cat} value={cat}>Category {cat} — {terrainDesc[cat]}</option>
                                ))}
                            </SelectField>
                        </div>
                        <div>
                            <Label>K2 Value (Override)</Label>
                            <InputNum id="k2Custom" value={inputs.k2Custom} onChange={set('k2Custom')} placeholder={results?.k2Auto != null ? `Auto: ${results.k2Auto.toFixed(2)}` : '—'} step={0.01} />
                        </div>
                    </div>
                    <div className="mt-3 flex items-center gap-3 flex-wrap">
                        <KBadge label="K2 Applied" value={results?.k2 != null ? results.k2.toFixed(2) : null} />
                        <span className="text-xs text-gray-500">
                            {inputs.k2Custom && String(inputs.k2Custom).trim() !== ''
                                ? 'Custom override applied'
                                : `Auto-interpolated at H = ${inputs.H} m`}
                        </span>
                    </div>
                </div>

                {/* K3 */}
                <div>
                    <GroupTitle>K3 — Topography Factor (IS:875 Cl.6.3.3)</GroupTitle>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <RadioOption
                            name="k3Type" value="flat" checked={inputs.k3Type === 'flat'}
                            onChange={setVal('k3Type')}
                            label="Flat / Level Site" desc="No significant topographic features" badge="K3 = 1.0"
                        />
                        <RadioOption
                            name="k3Type" value="hill" checked={inputs.k3Type === 'hill'}
                            onChange={setVal('k3Type')}
                            label="Hill or Ridge Site" desc="Significant topographic features present"
                        />
                    </div>
                    {inputs.k3Type === 'hill' ? (
                        <div className="mt-3 flex items-center gap-3">
                            <div className="flex-1">
                                <Label>K3 Value (1.0 – 1.36)</Label>
                                <InputNum id="k3Custom" value={inputs.k3Custom} onChange={set('k3Custom')} min={1.0} max={1.36} step={0.01} />
                            </div>
                            <div className="flex flex-col justify-end">
                                <KBadge label="K3" value={inputs.k3Custom} />
                            </div>
                        </div>
                    ) : (
                        <div className="mt-3"><KBadge label="K3" value="1.000" /></div>
                    )}
                </div>

                {/* K4 */}
                <div>
                    <GroupTitle>K4 — Importance Factor (IS:875 Cl.6.3.4)</GroupTitle>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <RadioOption
                            name="k4Type" value="normal" checked={inputs.k4Type === 'normal'}
                            onChange={setVal('k4Type')}
                            label="Normal Building" desc="Standard structures" badge="K4 = 1.0"
                        />
                        <RadioOption
                            name="k4Type" value="cyclone" checked={inputs.k4Type === 'cyclone'}
                            onChange={setVal('k4Type')}
                            label="Cyclone-prone / Post-disaster" desc="Essential / emergency facilities" badge="K4 = 1.15"
                        />
                    </div>
                    <div className="mt-3"><KBadge label="K4" value={results?.k4} /></div>
                </div>
            </Card>

            {/* ── Section 2: Wind Pressure ── */}
            <Card title="Section 2 — Wind Pressure (Pz)" accent="bg-teal-500">
                <Formula>Pz = 0.6 × Vz² / 1000 &nbsp;(kN/m²)</Formula>
                {results?.pz != null ? (
                    <div className="bg-gray-50 border border-gray-100 rounded-2xl px-5 py-4 flex items-end gap-2 mt-1">
                        <span className="text-2xl font-black text-teal-700 font-mono tabular-nums">{results.pz.toFixed(2)}</span>
                        <span className="text-sm font-semibold text-gray-500 mb-0.5">kN/m²</span>
                    </div>
                ) : (
                    <p className="text-sm text-gray-400 italic">Awaiting valid Vz…</p>
                )}
            </Card>

            {/* ── Section 3: Design Wind Pressure ── */}
            <Card title="Section 3 — Design Wind Pressure (Pd)" accent="bg-violet-500">
                <Formula>Pd = max( Kd × Ka × Kc × Pz,  0.7 × Pz )</Formula>

                {/* Kd */}
                <div>
                    <GroupTitle>Kd — Wind Directionality (IS:875 Cl.7.2.1)</GroupTitle>
                    <Label>Structure Cross-section</Label>
                    <SelectField id="kd" value={inputs.kd} onChange={set('kd')}>
                        <option value="rectangular">Rectangular Building → Kd = 0.9</option>
                        <option value="circular_polygon">Circular or Polygon Section → Kd = 1.0</option>
                        <option value="lattice_chimney">Lattice Tower / Chimney → Kd = 1.0</option>
                    </SelectField>
                    <div className="mt-3"><KBadge label="Kd" value={results?.kdVal} /></div>
                </div>

                {/* Ka */}
                <div>
                    <GroupTitle>Ka — Area Averaging Factor (IS:875 Table 4)</GroupTitle>
                    <div className="flex flex-wrap items-center gap-3">
                        <KBadge label="Tributary Area" value={results?.area != null ? results.area.toFixed(2) : null} unit=" m²" />
                        <KBadge label="Ka" value={results?.ka != null ? results.ka.toFixed(4) : null} />
                        <span className="text-xs text-gray-500">= W × L = {inputs.W} × {inputs.L}</span>
                    </div>
                </div>

                {/* Kc */}
                <div>
                    <GroupTitle>Kc — Combination Factor (IS:875 Table 4)</GroupTitle>
                    <Label>Number of Loaded Surfaces</Label>
                    <SelectField id="kcType" value={inputs.kcType} onChange={set('kcType')}>
                        <option value="1">1 surface → Kc = 1.0</option>
                        <option value="2">2 surfaces → Kc = 0.9</option>
                        <option value="3plus">3 or more surfaces → Kc = 0.8</option>
                    </SelectField>
                    <div className="mt-3"><KBadge label="Kc" value={results?.kcVal} /></div>
                </div>

                {results?.pd != null && (
                    <div className="bg-gray-50 border border-gray-100 rounded-2xl px-5 py-4 flex items-end gap-2">
                        <span className="text-2xl font-black text-violet-700 font-mono tabular-nums">{results.pd.toFixed(3)}</span>
                        <span className="text-sm font-semibold text-gray-500 mb-0.5">kN/m²</span>
                        {results.pdMinimumGoverns && (
                            <span className="ml-2 text-xs font-semibold text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-2 py-1">
                                Min governs (0.7 × Pz)
                            </span>
                        )}
                    </div>
                )}
            </Card>

            {/* ── Section 4: Pressure Coefficients ── */}
            <Card title="Section 4 — Pressure Coefficients" accent="bg-amber-500">

                {/* Cpi */}
                <div>
                    <GroupTitle>Cpi — Internal Pressure Coefficient (IS:875 Cl.7.3.2.2)</GroupTitle>
                    <div className="space-y-2">
                        <RadioOption name="cpi" value="0.2" checked={inputs.cpi === '0.2'} onChange={setVal('cpi')}
                            label="Less than 5% openings" desc="Small or negligible openings" badge="Cpi = 0.2" />
                        <RadioOption name="cpi" value="0.5" checked={inputs.cpi === '0.5'} onChange={setVal('cpi')}
                            label="5% to 20% openings" desc="Moderate openings" badge="Cpi = 0.5" />
                        <RadioOption name="cpi" value="0.7" checked={inputs.cpi === '0.7'} onChange={setVal('cpi')}
                            label="More than 20% openings" desc="Large openings or open structures" badge="Cpi = 0.7" />
                    </div>
                </div>

                {/* H/W and L/W */}
                <div>
                    <GroupTitle>Reference Ratios</GroupTitle>
                    <div className="grid grid-cols-2 gap-3">
                        {[
                            { label: 'H/W Ratio', value: results?.hwRatio },
                            { label: 'L/W Ratio', value: results?.lwRatio },
                        ].map(({ label, value }) => (
                            <div key={label} className="bg-gray-50 border border-gray-100 rounded-xl px-4 py-3">
                                <p className="text-xs font-medium text-gray-500 mb-1">{label}</p>
                                <p className="text-xl font-bold text-gray-800 font-mono">{value ?? '—'}</p>
                            </div>
                        ))}
                    </div>
                    <p className="mt-2 text-xs text-gray-500 bg-amber-50 border border-amber-100 rounded-xl px-3 py-2">
                        📐 Use H/W and L/W to select C<sub>pe</sub> values from <strong>IS:875 Table 5</strong>
                    </p>
                </div>

                {/* Cpe inputs */}
                <div>
                    <GroupTitle>Cpe — External Pressure Coefficients</GroupTitle>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {[
                            { key: 'cpeA', label: 'Wall A', sub: 'Windward Long Face' },
                            { key: 'cpeB', label: 'Wall B', sub: 'Leeward Long Face' },
                            { key: 'cpeC', label: 'Wall C', sub: 'Windward Short Face' },
                            { key: 'cpeD', label: 'Wall D', sub: 'Leeward Short Face' },
                        ].map(({ key, label, sub }) => (
                            <div key={key}>
                                <label className="text-sm font-medium text-gray-700 mb-1.5 inline-block">
                                    {label} — Cpe <span className="text-xs font-normal text-gray-400 ml-1">{sub}</span>
                                </label>
                                <InputNum id={key} value={inputs[key]} onChange={set(key)} min={-2} max={2} step={0.1} placeholder="e.g. -0.6" />
                            </div>
                        ))}
                    </div>
                    <p className="mt-2 text-xs text-gray-400">Range: −2.0 to +2.0 (per IS:875 Table 5)</p>
                </div>
            </Card>
        </div>
    );
};

export default WindLoadInput;
