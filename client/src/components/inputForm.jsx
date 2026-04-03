import React from 'react'

const Field = ({ label, id, value, onChange }) => (
    <div>
        <label htmlFor={id} className="label-text">{label}</label>
        <input
            id={id}
            type="text"
            inputMode="decimal"
            value={value ?? ''}
            onChange={onChange}
            className="input-field"
            placeholder="—"
        />
    </div>
)

const BEAM_TYPES = [
    'Top Left Support',
    'Top Right Support',
    'Top Middle Span',
    'Bottom Span',
]

const InputForm = ({ inputs, onChange }) => {
    // For number fields — store raw strings
    const set = (key) => (e) => {
        const raw = e.target.value;
        if (raw !== '' && isNaN(Number(raw))) return; // Ensure valid number
        if (raw !== '' && Number(raw) < 0) return; // Prevent negative
        onChange({ ...inputs, [key]: raw === '' ? null : raw })
    }
    // For text/select fields — store string directly
    const setText = (key) => (e) => onChange({ ...inputs, [key]: e.target.value })

    return (
        <div className="section-card flex flex-col gap-1">
            <h2 className="section-title">
                <span className="w-2 h-5 rounded-full bg-blue-500 inline-block"></span>
                Input Parameters
            </h2>

            {/* ── Beam Identification ── */}
            <p className="group-title">Beam Identification</p>
            <div className="grid grid-cols-2 gap-3">
                <div>
                    <label htmlFor="beamName" className="label-text">Beam Marking </label>
                    <input
                        id="beamName"
                        type="text"
                        value={inputs.beamName ?? ''}
                        onChange={setText('beamName')}
                        className="input-field"
                        placeholder="e.g. B1, Beam-G1"
                    />
                </div>
                <div>
                    <label htmlFor="beamType" className="label-text">Bending Moment Direction</label>
                    <select
                        id="beamType"
                        value={inputs.bendingMomentDirection ?? ''}
                        onChange={setText('bendingMomentDirection')}
                        className="input-field"
                    >
                        <option value="" disabled>Select type…</option>
                        {BEAM_TYPES.map(t => (
                            <option key={t} value={t}>{t}</option>
                        ))}
                    </select>
                </div>
            </div>

            <p className="group-title">Loading</p>
            <div className="grid grid-cols-2 gap-3">
                <Field label="Bending Moment Mu (kN·m)" id="Mu" value={inputs.Mu} onChange={set('Mu')} />
                <Field label="Shear Force Vu (kN)" id="Vu" value={inputs.Vu} onChange={set('Vu')} />
            </div>

            <p className="group-title">Section Geometry</p>
            <div className="grid grid-cols-2 gap-3">
                <Field label="Width b (mm)" id="b" value={inputs.b} onChange={set('b')} />
                <Field label="Total Depth D (mm)" id="D" value={inputs.D} onChange={set('D')} />
                <Field label="Eff. Cover (mm)" id="cover" value={inputs.cover} onChange={set('cover')} />
            </div>

            <p className="group-title">Material Grades</p>
            <div className="grid grid-cols-2 gap-3">
                <Field label="Grade of Concrete fck (MPa)" id="fck" value={inputs.fck} onChange={set('fck')} />
                <Field label="Grade of Steel fy (MPa)" id="fy" value={inputs.fy} onChange={set('fy')} />
            </div>

            <p className="group-title">Main Reinforcement</p>
            <div className="grid grid-cols-2 gap-3">
                <Field label="Bar 1 — Count" id="bar1Count" value={inputs.bar1Count} onChange={set('bar1Count')} />
                <Field label="Bar 1 — Dia (mm)" id="bar1Dia" value={inputs.bar1Dia} onChange={set('bar1Dia')} />
                <Field label="Bar 2 — Count" id="bar2Count" value={inputs.bar2Count} onChange={set('bar2Count')} />
                <Field label="Bar 2 — Dia (mm)" id="bar2Dia" value={inputs.bar2Dia} onChange={set('bar2Dia')} />
            </div>

            <p className="group-title">Side Face Reinforcement</p>
            <div className="grid grid-cols-2 gap-3">
                <Field label="SFR Count" id="sfrCount" value={inputs.sfrCount} onChange={set('sfrCount')} />
                <Field label="SFR Dia (mm)" id="sfrDia" value={inputs.sfrDia} onChange={set('sfrDia')} />
            </div>

            <p className="group-title">Table 19 Interpolation (Manual)</p>
            <div className="grid grid-cols-2 gap-3">
                <div>
                    <label className="label-text">tc Row 1 (%)</label>
                    <select
                        value={inputs.tcRatio1 ?? '0.75'}
                        onChange={setText('tcRatio1')}
                        className="input-field"
                    >
                        {[0.15, 0.25, 0.50, 0.75, 1.00, 1.25, 1.50, 1.75, 2.00, 2.25, 2.50, 2.75, 3.00].map(v => (
                            <option key={v} value={v}>{v.toFixed(2)} %</option>
                        ))}
                    </select>
                </div>
                <div>
                    <label className="label-text">tc Row 2 (%)</label>
                    <select
                        value={inputs.tcRatio2 ?? '1.00'}
                        onChange={setText('tcRatio2')}
                        className="input-field"
                    >
                        {[0.15, 0.25, 0.50, 0.75, 1.00, 1.25, 1.50, 1.75, 2.00, 2.25, 2.50, 2.75, 3.00].map(v => (
                            <option key={v} value={v}>{v.toFixed(2)} %</option>
                        ))}
                    </select>
                </div>
            </div>

            <p className="group-title">Shear Reinforcement (Stirrups)</p>
            <div className="grid grid-cols-2 gap-3">
                <Field label="Stirrup Dia (mm)" id="stirrupDia" value={inputs.stirrupDia} onChange={set('stirrupDia')} />
                <Field label="Stirrup Legs" id="stirrupLegs" value={inputs.stirrupLegs} onChange={set('stirrupLegs')} />
                <Field label="Provided Stirrup Spacing (mm)" id="providedStirrupSpacing" value={inputs.providedStirrupSpacing} onChange={set('providedStirrupSpacing')} />
            </div>




        </div>
    )
}

export default InputForm