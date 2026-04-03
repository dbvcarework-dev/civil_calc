import React from 'react'

const StatusBadge = ({ ok, okText = 'OK', failText }) => (
    ok
        ? <span className="badge-ok">✓ {okText}</span>
        : <span className="badge-fail">✗ {failText}</span>
)

const Row = ({ label, value, badge }) => (
    <div className="result-row">
        <span className="result-label">{label}</span>
        <span className="result-value flex items-center gap-2">
            {value}
            {badge}
        </span>
    </div>
)

const ResultsPanel = ({ results: r }) => {
    return (
        <div className="section-card flex flex-col gap-1 min-w-0">
            <h2 className="section-title">
                <span className="w-2 h-5 rounded-full bg-emerald-500 inline-block"></span>
                Design Results
                <span className="ml-auto text-xs text-gray-500 font-normal">IS 456 : 2000</span>
            </h2>

            {/* Geometry */}
            <p className="group-title">Geometry</p>
            <Row label="Effective Depth, d" value={`${r.d.toFixed(1)} mm`} />

            {/* Flexure */}
            <p className="group-title">Flexure</p>
            <Row label="Mulim Factor" value={`${r.mulimFactor.toFixed(3)}`} />
            <Row label="Mu,lim" value={`${r.Mulim.toFixed(1)} kN·m`} />
            <Row
                label="Moment Capacity"
                value={null}
                badge={<StatusBadge ok={r.muOk} okText="Section OK" failText="Increase section size" />}
            />
            <Row label="Pt Required" value={r.AstReq != null ? `${r.PtReq.toFixed(3)} %` : '—'} />
            <Row label="Ast Required" value={r.AstReq != null ? `${r.AstReq.toFixed(1)} mm²` : '—'} />
            <Row label="Ast Minimum" value={`${r.AstMin.toFixed(1)} mm²`} />
            <Row label="Pt Minimum" value={`${r.PtMin.toFixed(2)} %`} />
            <Row
                label="Reinforcement"
                value={`${r.AstProv.toFixed(1)} mm² (Pt = ${r.PtProv.toFixed(3)}%)`}
                badge={<StatusBadge ok={r.steelOk} okText="OK" failText="Increase Reinforcement" />}
            />

            {/* Side Face */}
            <p className="group-title">Side Face Reinforcement</p>
            <Row label="SFR Required?" value={r.sfrRequired ? 'Yes (D ≥ 750 mm)' : 'No'} />
            {r.sfrRequired && (
                <>
                    <Row label="SFR Area Required" value={`${r.sfrAreaReq.toFixed(1)} mm²`} />
                    <Row label="SFR Area Provided" value={`${r.sfrAreaProv.toFixed(1)} mm²`} />
                </>
            )}
            <Row
                label="SFR Check"
                value={null}
                badge={<StatusBadge ok={r.sfrOk} okText={r.sfrCheck} failText={r.sfrCheck} />}
            />

            {/* Shear */}
            <p className="group-title">Shear</p>
            <Row label="Nominal shear stress τv" value={`${r.tv.toFixed(2)} N/mm²`} />
            <div className="bg-gray-50/50 p-2 rounded-lg border border-gray-100 my-1">
                <div className="flex justify-between text-[10px] text-gray-500 uppercase tracking-wider mb-1 px-1">
                    <span>Table 19 Interpolation</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs border-b border-gray-100 pb-2 mb-2">
                    <div className="flex justify-between px-1">
                        <span className="text-gray-500">{Number(r.tcRatio1).toFixed(2)}%:</span>
                        <span className="font-medium">{r.tcLo.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between px-1 border-l border-gray-100 pl-2">
                        <span className="text-gray-500">{Number(r.tcRatio2).toFixed(2)}%:</span>
                        <span className="font-medium">{r.tcHi.toFixed(2)}</span>
                    </div>
                </div>
                <Row label="Calculated τc" value={<span className="text-blue-600 font-bold">{r.tc.toFixed(2)} N/mm²</span>} />
            </div>
            <Row label="τc,max" value={`${r.tcMax.toFixed(1)} N/mm²`} />
            <Row
                label="Section Size (Cl. 40.2.3)"
                value={null}
                badge={<StatusBadge ok={r.shearSectionOk} okText="OK" failText="FAIL — τv > τc,max! Increase section" />}
            />
            <Row
                label="Shear Design"
                value={r.shearDesign ? 'Stirrups designed for shear' : 'Minimum stirrups govern'}
            />
            <Row label="Vu,c (concrete contribution)" value={`${r.Vuc.toFixed(1)} kN`} />
            <Row label="Vu,s (steel requirement)" value={r.Vus !== null ? `${r.Vus.toFixed(1)} kN` : "—"} />
            <Row label="Vusmin" value={r.Vusmin !== null ? `${r.Vusmin.toFixed(1)} kN` : "—"} />
            <Row
                label="Stirrup Spacing"
                value={r.stirrupSpacing !== null ? `${r.stirrupSpacing.toFixed(0)} mm` : "—"}
                badge={<StatusBadge ok={r.stirrupOk} okText="OK" failText="Increase Stirrups" />}
            />
        </div>
    )
}

export default ResultsPanel