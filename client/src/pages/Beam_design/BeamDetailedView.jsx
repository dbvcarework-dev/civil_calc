import { useParams, useNavigate } from 'react-router-dom'
import ResultsPanel from '../../components/ResultsPanel'
import axios from 'axios'
import { useState, useEffect } from 'react'
import * as XLSX from 'xlsx';
import ExcelJS from 'exceljs';

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

    useEffect(() => {

        fetchDesign();
    }, [id]);
    const fetchDesign = async () => {
        try {
            const response = await axios.get(`/api/saved-designs/${id}`, { withCredentials: true });
            setDesign(response.data.data);
            console.log(response.data.data)
        } catch (err) {
            console.error('Fetch error:', err);
            setError('Failed to load saved design.');
        } finally {
            setIsLoading(false);
        }
    };

    const exportToExcel = async (design) => {
        // 1. Load the template file
        const response = await fetch("/beam_temp3.xlsx");
        const arrayBuffer = await response.arrayBuffer();

        const workbook = new ExcelJS.Workbook();
        await workbook.xlsx.load(arrayBuffer);
        const worksheet = workbook.worksheets[0];



        // 2 data mapping to exact cells
        const cellMap = {
            // ── INPUTS 
            C10: design.inputs.Mu, N9: 175.0,
            C11: design.inputs.cover, N10: design.inputs.cover,
            C12: design.inputs.fck, N11: design.inputs.fck,
            C13: design.inputs.fy, N12: design.inputs.fy,
            C14: design.inputs.b, N13: design.inputs.b,
            C15: design.inputs.D, N14: design.inputs.D,
            C16: design.results.d, N15: design.results.d,
            C17: design.results.mulimFactor, N16: design.results.mulimFactor,
            N17: 7,

            // ── FLEXURE ──
            C19: design.results.Mulim.toFixed(2), N18: design.results.Mulim,
            D20: design.results.muCheck, O19: design.results.muCheck,
            C23: design.results.PtReq.toFixed(3), N22: design.results.ptPercent,
            C24: design.results.AstReq.toFixed(2), N23: design.results.ptPercent * design.inputs.b * design.results.d / 100,
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
            B40: design.results.SvMax1, B41: design.results.SvMax2, B42: 300,

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

            //
            M37: 3, N37: 20, O37: 942.48,
            M38: 0, N38: 20, O38: 0,
            O40: 942.48
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

                    <div className="ml-auto flex items-center gap-3">
                        <button onClick={() => exportToExcel(design)}
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-white hover:bg-gray-50 text-gray-700 transition-all duration-200 border border-gray-200 shadow-sm">
                            Export to Excel
                        </button>
                        <button onClick={() => navigate(-1)}
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-white hover:bg-gray-50 text-gray-700 transition-all duration-200 border border-gray-200 shadow-sm">
                            ← Back
                        </button>
                    </div>
                </div>
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
                        {/* Left Side: Inputs in Report Format */}
                        <ReportInputs inputs={design.inputs} />

                        {/* Right Side: Results Panel */}
                        <ResultsPanel inputs={design.inputs} results={design.results} />
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