import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import TankResult from '../../components/tankResult';
import html2canvas from 'html2canvas';
import ExcelJS from 'exceljs';

const ReportSection = ({ title, children }) => (
    <div className="mb-6 last:mb-0">
        <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 pb-2 border-b border-gray-100">{title}</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3">
            {children}
        </div>
    </div>
);

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

    if (!hasRequired) return null;

    return (
        <div className="bg-white shrink-0 shadow-xl shadow-gray-200/40 rounded-3xl border border-gray-100 overflow-hidden flex flex-col p-6 sm:p-8 mt-8">
            <h2 className="text-lg font-semibold text-gray-800 mb-6 flex items-center">
                <span className="w-1.5 h-6 rounded-full bg-indigo-500 inline-block mr-3"></span>
                Tank Visualization
            </h2>

            <div className="flex flex-col lg:flex-row items-center gap-8">
                <div id="tank-visualization" className="w-full lg:w-1/2 flex justify-center">
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
                <ReportSection title="Tank Details">
                    <ReportRow label="Design/Tank Name" value={inputs?.tankName} />
                    <ReportRow label="Tank Internal Diameter" value={inputs?.tankID ? `${inputs.tankID} m` : '—'} />
                    <ReportRow label="B.C.D" value={inputs?.bcd ? `${inputs.bcd} m` : '—'} />
                    <ReportRow label="Total Height of Equipment" value={inputs?.totalHeightEqpt ? `${inputs.totalHeightEqpt} m` : '—'} />
                    <ReportRow label="Liquid Level in Tank" value={inputs?.liquidLevel ? `${inputs.liquidLevel} m` : '—'} />
                </ReportSection>

                <ReportSection title="Load Details">
                    <ReportRow label="Water Density" value={inputs?.waterDensity ? `${inputs.waterDensity} kN/m³` : '—'} />
                    <ReportRow label="Liquid Density" value={inputs?.liquidDensity ? `${inputs.liquidDensity} kN/m³` : '—'} />
                    <ReportRow label="Empty Weight of Tank" value={inputs?.emptyWtTank ? `${inputs.emptyWtTank} kN` : '—'} />
                    <ReportRow label="Operating Weight of Tank" value={inputs?.operatingWtTank ? `${inputs.operatingWtTank} kN` : '—'} />
                    <ReportRow label="Hydrotest Weight of Tank" value={inputs?.hydrotestWtTank ? `${inputs.hydrotestWtTank} kN` : '—'} />
                </ReportSection>

                <ReportSection title="Plate & Layer Thickness">
                    <ReportRow label="Tank Bottom Plate Thickness" value={inputs?.tankBottomPlateThk ? `${inputs.tankBottomPlateThk} mm` : '—'} />
                    <ReportRow label="THK Of Sand Bitumin Layer" value={inputs?.thkSandBitumen ? `${inputs.thkSandBitumen} m` : '—'} />
                    <ReportRow label="THK Of M30 Concrete Layer" value={inputs?.thkM30Conc ? `${inputs.thkM30Conc} m` : '—'} />
                    <ReportRow label="THK Of M75 Concrete Layer" value={inputs?.thkM75Conc ? `${inputs.thkM75Conc} m` : '—'} />
                </ReportSection>

                <ReportSection title="Foundation Geometry">
                    <ReportRow label="Height of RB Above GL" value={inputs?.heightRBAboveGL ? `${inputs.heightRBAboveGL} m` : '—'} />
                    <ReportRow label="Depth of Ring Beam Below GL" value={inputs?.depthRBBelowGL ? `${inputs.depthRBBelowGL} m` : '—'} />
                    <ReportRow label="Depth of FDN Raft" value={inputs?.depthFdnRaft ? `${inputs.depthFdnRaft} m` : '—'} />
                    <ReportRow label="Thickness of Ring Beam/Wall" value={inputs?.thkRingBeamWall ? `${inputs.thkRingBeamWall} m` : '—'} />
                    <ReportRow label="Width of Ring Beam Raft" value={inputs?.widthRingBeamRaft ? `${inputs.widthRingBeamRaft} m` : '—'} />
                </ReportSection>

                <ReportSection title="Material & Soil Properties">
                    <ReportRow label="SBC at Given Depth" value={inputs?.sbcAtFdnDepth ? `${inputs.sbcAtFdnDepth} kN/m²` : '—'} />
                    <ReportRow label="Unit Weight of Concrete" value={inputs?.unitWtConcrete ? `${inputs.unitWtConcrete} kN/m³` : '—'} />
                    <ReportRow label="Unit Weight of Sand" value={inputs?.unitWtSand ? `${inputs.unitWtSand} kN/m³` : '—'} />
                    <ReportRow label="Unit Weight of Soil" value={inputs?.unitWtSoil ? `${inputs.unitWtSoil} kN/m³` : '—'} />
                    <ReportRow label="Fck (Concrete Grade)" value={inputs?.fck ? `M${inputs.fck}` : '—'} />
                    <ReportRow label="Fy (Steel Grade)" value={inputs?.fy ? `Fe${inputs.fy}` : '—'} />
                </ReportSection>

                <ReportSection title="Advanced Soil Parameters">
                    <ReportRow label="Coefficient of Earth Pressure (Ka)" value={inputs?.Ka} />
                    <ReportRow label="Coefficient of Friction (μ)" value={inputs?.mu} />
                    <ReportRow label="Wind Load Force" value={inputs?.windFx ? `${inputs.windFx} kN` : '—'} />
                    <ReportRow label="Wind Load Moment" value={inputs?.windM ? `${inputs.windM} kN-m` : '—'} />
                    <ReportRow label="Seismic Load Force" value={inputs?.seismicFx ? `${inputs.seismicFx} kN` : '—'} />
                    <ReportRow label="Seismic Load Moment" value={inputs?.seismicM ? `${inputs.seismicM} kN-m` : '—'} />
                </ReportSection>
            </div>
        </div>
    );
};

const TankFoundationDetailed = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [tankDesign, setTankDesign] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchTankDesign();
    }, [id]);

    const fetchTankDesign = async () => {
        try {
            setIsLoading(true);
            const response = await axios.get(`/api/tankdesigns/${id}`, { withCredentials: true });
            setTankDesign(response.data.data || null);
            console.log(response.data.data);
            setError(null);
        } catch (error) {
            console.error('Error fetching tank design:', error);
            setError('Failed to load saved tank foundation design.');
        } finally {
            setIsLoading(false);
        }
    }

    const captureDiagram = async () => {
        const element = document.getElementById('tank-visualization');
        if (!element) return null;

        const canvas = await html2canvas(element, {
            scale: 2,
            useCORS: true,
            backgroundColor: '#ffffff',
        });
        return canvas.toDataURL("image/png");
    };

    const handleExport = async (design) => {
        try {
            const response = await fetch('/tank_foundation_temp3.xlsx');
            const arrayBuffer = await response.arrayBuffer();

            const workbook = new ExcelJS.Workbook();
            await workbook.xlsx.load(arrayBuffer);
            const worksheet = workbook.getWorksheet('Sheet1') || workbook.getWorksheet(1);

            //INPUTS___________________________________________________
            worksheet.getCell('C1').value = null;
            worksheet.getCell('C7').value = design?.inputs?.tankID;
            worksheet.getCell('C8').value = design?.inputs?.bcd;
            worksheet.getCell('C9').value = design?.inputs?.totalHeightEqpt;
            worksheet.getCell('C10').value = design?.inputs?.liquidLevel;
            worksheet.getCell('C11').value = design?.inputs?.waterDensity;
            worksheet.getCell('C12').value = design?.inputs?.liquidDensity;
            worksheet.getCell('C13').value = design?.inputs?.emptyWtTank;
            worksheet.getCell('C14').value = design?.inputs?.operatingWtTank;
            worksheet.getCell('C15').value = design?.inputs?.hydrotestWtTank;
            worksheet.getCell('C16').value = design?.inputs?.tankBottomPlateThk;
            worksheet.getCell('C17').value = design?.inputs?.thkSandBitumen;
            worksheet.getCell('C18').value = design?.inputs?.thkM30Conc;
            worksheet.getCell('C19').value = design?.inputs?.thkM75Conc;
            worksheet.getCell('C20').value = design?.inputs?.heightRBAboveGL;
            worksheet.getCell('C21').value = design?.results?.depthFdnFromGL;
            worksheet.getCell('C22').value = design?.results?.depthFdnFromGL;
            worksheet.getCell('C23').value = design?.inputs?.depthFdnRaft;
            worksheet.getCell('C24').value = design?.inputs?.thkRingBeamWall;
            worksheet.getCell('C25').value = design?.inputs?.widthRingBeamRaft;
            worksheet.getCell('C26').value = design?.results?.depthFdnFromGL;
            worksheet.getCell('C27').value = design?.inputs?.sbcAtFdnDepth;
            worksheet.getCell('C28').value = design?.results?.sbcAfterWL;
            worksheet.getCell('C29').value = design?.results?.sbcAfterEQ;
            worksheet.getCell('C30').value = design?.inputs?.Ka;
            worksheet.getCell('C31').value = design?.inputs?.mu;
            worksheet.getCell('C32').value = design?.inputs?.unitWtConcrete;
            worksheet.getCell('C33').value = design?.inputs?.unitWtSand;
            worksheet.getCell('C34').value = design?.inputs?.unitWtSoil;
            worksheet.getCell('C35').value = design?.inputs?.fck;
            worksheet.getCell('C36').value = design?.inputs?.fy;
            worksheet.getCell('C38').value = design?.inputs?.windFx;
            worksheet.getCell('C39').value = design?.inputs?.windM;
            worksheet.getCell('C40').value = design?.inputs?.seismicFx;
            worksheet.getCell('C41').value = design?.inputs?.seismicM;

            //OUTPUTS________________________________________________

            //STEP A
            worksheet.getCell('J46').value = design?.results?.windBMAtBase;
            worksheet.getCell('C49').value = design?.results?.windFxDesign;
            worksheet.getCell('C51').value = design?.results?.windMDesign;

            //STEP B
            worksheet.getCell('J58').value = design?.results?.eqBMAtBase;
            worksheet.getCell('C56').value = design?.results?.seismicFxDesign;
            worksheet.getCell('C60').value = design?.results?.seismicMDesign;
            worksheet.getCell('C64').value = design?.results?.seismicMDesign;
            worksheet.getCell('C66').value = design?.results?.seismicFxDesign;

            //STEP C
            worksheet.getCell('I71').value = design?.results?.areaAnnularRaft;
            worksheet.getCell('K73').value = design?.results?.Z_raft;
            worksheet.getCell('G78').value = design?.results?.areaTankBottomPlate;
            worksheet.getCell('I80').value = design?.results?.wtTotalBottomPlate;
            worksheet.getCell('I82').value = design?.results?.areaAnnularBottomPlate;
            worksheet.getCell('I85').value = design?.results?.wtAnnularBottomPlate;

            // 1.0
            worksheet.getCell('I93').value = design?.results?.A_selfWtPerM;
            worksheet.getCell('I95').value = design?.results?.B_basePlatePerM;
            worksheet.getCell('I96').value = design?.results?.C_liquidOnRingPerM;
            worksheet.getCell('I97').value = design?.results?.D_wtRingBeamWallPerM;
            worksheet.getCell('I98').value = design?.results?.E_wtRingBeamRaftPerM;
            worksheet.getCell('I99').value = design?.results?.F_wtOutsideSoilPerM;
            worksheet.getCell('I100').value = design?.results?.G_wtInsideSandPerM;
            worksheet.getCell('I101').value = design?.results?.totalLoadPerM;
            worksheet.getCell('J103').value = design?.results?.sbcAfterWL;
            worksheet.getCell('J106').value = design?.results?.sbcAfterWL;
            worksheet.getCell('G103').value = design?.results?.check1_Pmax_ring;
            worksheet.getCell('G106').value = design?.results?.check1_Pmin_ring;



            //STEP 1
            worksheet.getCell('I111').value = design?.results?.ins_A_wtBottomPlate;
            worksheet.getCell('I112').value = design?.results?.ins_B_liquidWt;
            worksheet.getCell('I113').value = design?.results?.ins_C_wtSandBitumen;
            worksheet.getCell('I114').value = design?.results?.ins_D_wtM30;
            worksheet.getCell('I115').value = design?.results?.ins_E_wtM75;
            worksheet.getCell('I116').value = design?.results?.ins_F_wtSandFill;
            worksheet.getCell('I117').value = design?.results?.totalInsideLoads_op;
            worksheet.getCell('G119').value = design?.results?.check1_Pmax_inside;
            worksheet.getCell('G122').value = design?.results?.check1_Pmin_inside;

            //STEP 2
            worksheet.getCell('G131').value = design?.results?.check2_Pmax_ring;
            worksheet.getCell('G134').value = design?.results?.check2_Pmin_ring;
            worksheet.getCell('G140').value = design?.results?.check2_Pmax_inside;
            worksheet.getCell('G144').value = design?.results?.check2_Pmin_inside;

            //STEP 3
            worksheet.getCell('I152').value = design?.results?.ins_A_wtBottomPlate;
            worksheet.getCell('I153').value = design?.results?.ins_B_liquidWt_HT;
            worksheet.getCell('I154').value = design?.results?.ins_C_wtSandBitumen_HT;
            worksheet.getCell('I155').value = design?.results?.ins_D_wtM30;
            worksheet.getCell('I156').value = design?.results?.ins_E_wtM75;
            worksheet.getCell('I157').value = design?.results?.ins_F_wtSandFill;
            worksheet.getCell('I158').value = design?.results?.totalInsideLoads_HT;
            worksheet.getCell('G160').value = design?.results?.check3_Pmax_inside;
            worksheet.getCell('G163').value = design?.results?.check3_Pmin_inside;

            //STEP 4 
            worksheet.getCell('C170').value = design?.results?.seismicFxDesign;
            worksheet.getCell('I171').value = design?.results?.sl_A;
            worksheet.getCell('I172').value = design?.results?.sl_B_ringWall;
            worksheet.getCell('I173').value = design?.results?.sl_C_ringRaft;
            worksheet.getCell('I174').value = design?.results?.sl_D_outsideSoil;
            worksheet.getCell('I175').value = design?.results?.sl_E_insideSand;
            worksheet.getCell('I176').value = design?.results?.sl_F_sandBitumen;
            worksheet.getCell('I177').value = design?.results?.sl_G_M30;
            worksheet.getCell('I178').value = design?.results?.sl_H_M75;
            worksheet.getCell('I179').value = design?.results?.sl_I_sandFill;
            worksheet.getCell('I180').value = design?.results?.totalRestoringWt;
            worksheet.getCell('G182').value = design?.results?.restoringForceSliding;
            worksheet.getCell('G185').value = design?.results?.FOS_sliding;
            worksheet.getCell('J185').value = design?.results?.sliding_OK ? "OK" : "CHECK";

            //STEP 5
            worksheet.getCell('C189').value = design?.results?.overturnMoment;
            worksheet.getCell('I185').value = 1.5;
            worksheet.getCell('I196').value = 1.5;
            worksheet.getCell('I192').value = design?.results?.restoringMoment;
            worksheet.getCell('G196').value = design?.results?.FOS_overturning;
            worksheet.getCell('J196').value = design?.results?.overturning_OK ? "OK" : "CHECK";

            //STEP 6
            worksheet.getCell('I204').value = design?.results?.A_selfWtPerM;
            worksheet.getCell('I205').value = design?.results?.B_basePlatePerM;
            worksheet.getCell('I206').value = design?.results?.C_liquidOnRingPerM;
            worksheet.getCell('I207').value = design?.results?.D_wtRingBeamWallPerM;
            worksheet.getCell('I208').value = design?.results?.totalSurcharge;
            worksheet.getCell('I210').value = design?.results?.windLoadPerM;
            worksheet.getCell('I212').value = design?.results?.surcharge_load;
            worksheet.getCell('K215').value = design?.results?.surcharge_soil;
            worksheet.getCell('K218').value = design?.results?.hoopTension;

            //STEP 7
            worksheet.getCell('C225').value = design?.results?.hoopTension;
            worksheet.getCell('I228').value = design?.results?.astMinHorizontal;
            worksheet.getCell('G227').value = design?.results?.astHoopRequired;
            worksheet.getCell('G230').value = design?.results?.astHoopEachFace;
            worksheet.getCell('G233').value = design?.results?.barArea_horiz;
            worksheet.getCell('G234').value = design?.results?.spacingHoopProvide;
            worksheet.getCell('C233').value = design?.results?.barDia_horiz;
            worksheet.getCell('C234').value = design?.results?.barDia_horiz;
            worksheet.getCell('C235').value = design?.results?.astHoopProvided;

            //STEP 8
            worksheet.getCell('C241').value = design?.results?.sigma_ct;
            worksheet.getCell('C246').value = design?.results?.wallThkCalc;
            worksheet.getCell('C247').value = design?.results?.wallThkCalc.toFixed(0);
            worksheet.getCell('F247').value = design?.results?.wallThkProvided;

            //STEP 9 
            worksheet.getCell('I254').value = design?.results?.astVertTotal;
            worksheet.getCell('C256').value = design?.results?.astVertEachFace;
            worksheet.getCell('G257').value = design?.results?.spacingVertCalc;
            worksheet.getCell('G258').value = design?.results?.spacingVertProvide;
            worksheet.getCell('C259').value = design?.results?.astVertProvided;
            worksheet.getCell('C257').value = design?.results?.barDia_vert;
            worksheet.getCell('C258').value = design?.results?.barDia_vert;

            //STEP 10
            worksheet.getCell('C263').value = design?.results?.check1_Pmax_ring;
            worksheet.getCell('I264').value = design?.results?.raftBM;
            worksheet.getCell('C266').value = design?.results?.raftMu;
            worksheet.getCell('K267').value = design?.results?.raftDeReq;
            worksheet.getCell('I269').value = design?.results?.raftDeProvide;

            worksheet.getCell('C273').value = design?.results?.pt_req;
            worksheet.getCell('C274').value = design?.results?.pt_min;
            worksheet.getCell('I275').value = design?.results?.raftAstReq;
            worksheet.getCell('G277').value = design?.results?.raftSpacingCalc;
            worksheet.getCell('G278').value = design?.results?.raftSpacingProvide;
            worksheet.getCell('C279').value = design?.results?.raftAstProvided;
            worksheet.getCell('C277').value = design?.results?.raftBarDia;
            worksheet.getCell('C278').value = design?.results?.raftBarDia;

            //conculsion
            worksheet.getCell('C283').value = design?.results?.conclusion?.bcd;
            worksheet.getCell('C284').value = design?.results?.conclusion?.thkRingWall_m;
            worksheet.getCell('C285').value = design?.results?.conclusion?.widthRingRaft_m;
            worksheet.getCell('C286').value = design?.results?.conclusion?.thkRingRaft_m;
            worksheet.getCell('C287').value = design?.results?.conclusion?.depthFdn_m;
            worksheet.getCell('C288').value = design?.results?.conclusion?.horizReinf;
            worksheet.getCell('C289').value = design?.results?.conclusion?.vertReinf;
            worksheet.getCell('C290').value = design?.results?.conclusion?.raftReinf;

            //checks 
            // worksheet.getCell('K104').value = design?.results?.check1_ring_OK ? "OK" : "CHECK";
            // worksheet.getCell('I107').value = design?.results?.check1_ring_tension ? "(-) PRESSURE" : "(-) NO PRESSURE";
            // worksheet.getCell('I108').value = null;

            // worksheet.getCell('K120').value = design?.results?.check1_inside_OK ? "OK" : "CHECK";
            // worksheet.getCell('I123').value = design?.results?.check1_inside_tension ? "(-) PRESSURE" : "(-) NO PRESSURE";
            // worksheet.getCell('K132').value = design?.results?.check2_ring_OK ? "OK" : "CHECK";
            // worksheet.getCell('I135').value = design?.results?.check2_ring_tension ? "(-) PRESSURE" : "(-) NO PRESSURE";
            // worksheet.getCell('K141').value = design?.results?.check2_inside_OK ? "OK" : "CHECK";
            // worksheet.getCell('I145').value = design?.results?.check2_inside_tension ? "(-) PRESSURE" : "(-) NO PRESSURE";
            // worksheet.getCell('K161').value = design?.results?.check3_inside_OK ? "OK" : "CHECK";
            // worksheet.getCell('I164').value = design?.results?.check3_inside_tension ? "(-) PRESSURE" : "(-) NO PRESSURE";
            // worksheet.getCell('J185').value = design?.results?.sliding_OK ? "OK" : "CHECK";
            // worksheet.getCell('J196').value = design?.results?.overturning_OK ? "OK" : "CHECK";
            // worksheet.getCell('G236').value = design?.results?.astHoopProvided_OK ? "OK" : "CHECK";
            // worksheet.getCell('C246').value = null;


            // worksheet.getCell('G280').value = design?.results?.raft_OK ? "OK" : "CHECK";
            // worksheet.getCell('G249').value = design?.results?.wallThk_OK ? "OK" : "CHECK";
            // worksheet.getCell('G260').value = design?.results?.astVertProvided_OK ? "OK" : "CHECK";
            worksheet.getCell('G288').value = null;
            worksheet.getCell('G289').value = null;
            worksheet.getCell('G290').value = null;
            worksheet.getCell('J119').value = design?.results?.sbcAfterWL;
            worksheet.getCell('J122').value = design?.results?.sbcAfterWL;
            worksheet.getCell('J131').value = design?.results?.sbcAfterEQ;
            worksheet.getCell('J134').value = design?.results?.sbcAfterEQ;
            worksheet.getCell('J140').value = design?.results?.sbcAfterEQ;
            worksheet.getCell('J144').value = design?.results?.sbcAfterEQ;
            worksheet.getCell('J160').value = design?.results?.sbcAfterEQ;
            worksheet.getCell('J163').value = design?.results?.sbcAfterEQ;



            const imageBase64 = await captureDiagram();
            if (imageBase64) {
                const imageId = workbook.addImage({
                    base64: imageBase64,
                    extension: "png",
                });

                worksheet.addImage(imageId, {
                    tl: { col: 6, row: 5.4 },   // position 
                    ext: { width: 450, height: 400 }, // size 
                });
            }

            const buffer = await workbook.xlsx.writeBuffer();
            const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });

            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = `Tank_Design_${design?.tank_name || 'Design'}.xlsx`;
            link.click();
            URL.revokeObjectURL(link.href);

        } catch (err) {
            console.error('Export Error:', err);
            alert('Failed to export to Excel.');
        }
    };

    return (
        <div className="min-h-screen bg-[#f8fafc] flex flex-col font-sans">
            <header
                className="border-b border-gray-200 bg-white/80 backdrop-blur sticky top-0 z-10 shadow-sm" >
                <div className="max-w-7xl mx-auto pl-14 pr-4 sm:pl-16 sm:pr-6 lg:px-8 py-4 flex items-center gap-3 sm:gap-4">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center text-white font-bold text-xl flex-shrink-0">
                        TF
                    </div>
                    <div>
                        <h1 className="text-base font-semibold text-gray-900 leading-tight">{tankDesign?.tank_name || 'Loading...'}</h1>
                        <p className="text-xs text-gray-500">Design ID : {id}</p>
                    </div>

                    <div className="ml-auto flex items-center gap-3">
                        <button onClick={() => handleExport(tankDesign)}
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-white hover:bg-gray-50 text-gray-700  border border-gray-200 shadow-sm">
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                            </svg>
                            Export to Excel
                        </button>
                        <Link to="/app/tank-foundation/saved"
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 shadow-sm">
                            ← Back
                        </Link>
                    </div>
                </div>
            </header>

            <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-20 gap-4">
                        <div className="w-10 h-10 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin"></div>
                        <p className="text-gray-500 font-medium">Fetching design details...</p>
                    </div>
                ) : error ? (
                    <div className="bg-red-50 text-red-600 p-6 rounded-2xl text-center shadow-sm max-w-2xl mx-auto border border-red-100">
                        <div className="text-2xl mb-2">⚠️</div>
                        <p className="font-semibold">{error}</p>
                        <button onClick={fetchTankDesign} className="mt-4 text-indigo-600 text-sm font-bold hover:underline">Try Again</button>
                    </div>
                ) : tankDesign ? (
                    <div className="flex flex-col lg:flex-row gap-8 items-start animate-in fade-in slide-in-from-bottom-4 duration-700">
                        {/* Left Side: Inputs in Report Format */}
                        <div className="w-full lg:w-7/12 xl:w-2/3">
                            <ReportInputs inputs={tankDesign.inputs} />
                            <TankVisualization inputs={tankDesign.inputs} />
                        </div>

                        {/* Right Side: Results Panel */}
                        <div className="w-full lg:w-5/12 xl:w-1/3 lg:sticky lg:top-24">
                            <TankResult result={tankDesign.results} inputs={tankDesign.inputs} />
                        </div>
                    </div>
                ) : (
                    <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-200">
                        <div className="text-4xl mb-4">🔍</div>
                        <p className="text-gray-500 font-medium">No design data available for this ID.</p>
                        <Link to="/app/tank-foundation/saved" className="text-indigo-600 font-bold mt-4 inline-block hover:underline">Return to History</Link>
                    </div>
                )}
            </main>

            <footer className="border-t border-gray-200 mt-auto py-8 text-center text-xs text-gray-400 font-medium tracking-wide">
                IS 456 : 2000 · Ring Beam Foundation · Detailed Design Report
            </footer>
        </div>
    );
};

export default TankFoundationDetailed;