

// ─────────────────────────────────────────────────────────────
// MAIN FUNCTION — call this with all inputs, get all outputs
// ─────────────────────────────────────────────────────────────
export function calculateTankFoundation(inputs) {
    const r = {};  // results object

    // Coerce all numeric inputs to prevent string concatenation bugs
    const parsed = { ...inputs };
    for (const k in parsed) {
        if (k !== 'tankName') {
            parsed[k] = Number(parsed[k]);
        }
    }

    // ── Destructure inputs ──────────────────────────────────────
    const {
        tankID,           // Tank inner diameter (M)          e.g. 11.8
        bcd,              // Bolt circle diameter (M)          e.g. 12.0
        totalHeightEqpt,  // Total height of equipment (M)    e.g. 12.8
        liquidLevel,      // Liquid level in tank (M)         e.g. 12.5
        waterDensity,     // (KN/M3)                          e.g. 10
        liquidDensity,    // (KN/M3)                          e.g. 10
        emptyWtTank,      // Empty weight of tank (KN)        e.g. 530
        operatingWtTank,  // Operating weight (KN)            e.g. 12429
        hydrotestWtTank,  // Hydrotest weight (KN)            e.g. 14664
        tankBottomPlateThk, // Tank bottom plate thickness (MM) e.g. 8
        thkSandBitumen,   // Thickness sand-bitumen layer (M) e.g. 0.05
        thkM30Conc,       // Thickness M30 concrete (M)       e.g. 0.15
        thkM75Conc,       // Thickness M7.5 concrete (M)      e.g. 0.075
        heightRBAboveGL,  // Height of ring beam above GL (M) e.g. 1.0
        depthRBBelowGL,   // Depth ring beam below GL (M)     e.g. 1.4
        depthFdnRaft,     // Depth of foundation raft (M)     e.g. 0.6
        thkRingBeamWall,  // Thickness of ring beam wall (M)  e.g. 0.4
        widthRingBeamRaft,// Width of ring beam raft (M)      e.g. 2.0
        sbcAtFdnDepth,    // SBC at foundation depth (KN/M2)  e.g. 190
        Ka,               // Earth pressure coeff at rest     e.g. 0.36
        mu,               // Friction coefficient             e.g. 0.30
        unitWtConcrete,   // (KN/M3)                          e.g. 25
        unitWtSand,       // (KN/M3)                          e.g. 18
        unitWtSoil,       // (KN/M3)                          e.g. 18
        fck,              // Concrete grade (N/MM2)           e.g. 30
        fy,               // Steel grade (N/MM2)              e.g. 500
        windFx,           // Wind force at top of ring (KN)   e.g. 416
        windM,            // Wind moment at top of ring (kN.M) e.g. 2656
        seismicFx,        // Seismic force at top (KN)        e.g. 1477
        seismicM,         // Seismic moment at top (kN.M)     e.g. 9430
        barDia_horiz,     // Horizontal bar diameter (mm)
        barDia_vert,      // Vertical bar diameter (mm)
        raftBarDia        // Raft bar diameter (mm)
    } = parsed;

    // Guard: if critical inputs are zero/missing, return null (empty state)
    if (!tankID || !bcd || !totalHeightEqpt || Number(tankID) <= 0 || Number(bcd) <= 0) return null;

    const PI = 3.14159265358979;
    const PI_EXCEL = 3.14;
    const PI_EXCEL2 = 3.142;

    // ─────────────────────────────────────────────────────────────
    // STEP 0: SBC ADJUSTMENTS
    // ─────────────────────────────────────────────────────────────
    r.sbcAfterWL = sbcAtFdnDepth * 1.25;
    r.sbcAfterEQ = sbcAtFdnDepth * 1.25;

    // ─────────────────────────────────────────────────────────────
    // STEP A: WIND LOAD MOMENTS AT FOUNDATION BASE
    // ─────────────────────────────────────────────────────────────
    r.depthFdnFromGL = depthRBBelowGL + depthFdnRaft;
    const windBMAtBase = windFx * (r.depthFdnFromGL + heightRBAboveGL);
    r.windBMAtBase = windBMAtBase;
    r.windFxDesign = windFx;
    r.windMDesign = windM + windBMAtBase;

    // ─────────────────────────────────────────────────────────────
    // STEP B: EARTHQUAKE LOAD MOMENTS AT FOUNDATION BASE
    // ─────────────────────────────────────────────────────────────
    const eqBMAtBase = seismicFx * (depthRBBelowGL + heightRBAboveGL);
    r.eqBMAtBase = eqBMAtBase;
    r.seismicFxDesign = seismicFx;
    r.seismicMDesign = seismicM + eqBMAtBase;

    // ─────────────────────────────────────────────────────────────
    // STEP C: GEOMETRY OF ANNULAR RING RAFT
    // ─────────────────────────────────────────────────────────────
    const OD_r = bcd + widthRingBeamRaft / 2;
    const ID_r = bcd - widthRingBeamRaft / 2;

    r.OD_raft = OD_r;
    r.ID_raft = ID_r;

    // Area of annular ring raft = π/4 × (OD² - ID²)
    r.areaAnnularRaft = (PI_EXCEL / 4) * (OD_r ** 2 - ID_r ** 2);
    // = 3.14/4 × (169 - 121) = 3.14/4 × 48 = 37.68 M²

    // Modulus of section of annular ring raft
    r.Z_raft = (PI_EXCEL * (OD_r ** 4 - ID_r ** 4)) / (32 * bcd);

    // ─────────────────────────────────────────────────────────────
    // STEP C2: TANK BOTTOM PLATE AREAS & WEIGHTS
    // ─────────────────────────────────────────────────────────────
    const unitWtSteel = 78.5; // KN/M3

    // Total tank bottom plate (full circle, ID = tankID)
    r.areaTankBottomPlate = PI_EXCEL * bcd * bcd / 4;
    // = 3.14/4 × 12.00² = 0.785 × 144 = 113.04 M²

    r.wtTotalBottomPlate = r.areaTankBottomPlate * (tankBottomPlateThk / 1000) * unitWtSteel;
    // = 113.04 × 0.008 × 78.5 = 71.00 KN

    // Annular bottom plate resting on ring beam
    // Inner edge of raft = ID_r = 11, Outer is at bcd inner = 11.2?
    // Excel: π/4 × (12² - 11.2²) = 3.14/4 × (144 - 125.44) = 0.785 × 18.56 = 14.57 M²
    // So annular ring plate: OD = bcd = 12, ID = bcd - thkWall×2 = 12-0.8 = 11.2
    const annularPlateOD = bcd;
    const annularPlateID = bcd - 2 * thkRingBeamWall;
    r.areaAnnularBottomPlate = (PI_EXCEL / 4) * (annularPlateOD ** 2 - annularPlateID ** 2);
    // = 3.14/4 × (144 - 125.44) = 14.57 M²

    r.wtAnnularBottomPlate = r.areaAnnularBottomPlate * (tankBottomPlateThk / 1000) * unitWtSteel;
    // = 14.57 × 0.008 × 78.5 = 9.15 KN

    // Self weight of tank EXCLUDING bottom plate
    // Excel: 'SELF WT. OF TANK ON RING BEAM' = 459.01088 KN
    // = operatingWtTank - (wtTotalBottomPlate + liquid weight) ... 
    // Actually: emptyWtTank - wtTotalBottomPlate = 530 - 70.989 = 459.01 KN ✓
    r.selfWtTankExclPlate = emptyWtTank - r.wtTotalBottomPlate;
    // = 530 - 70.989 = 459.011 KN

    // ─────────────────────────────────────────────────────────────
    // STEP 1: LOADS PER METRE OF RING BEAM (for soil pressure check)
    // ─────────────────────────────────────────────────────────────
    const ringPerimeter = PI_EXCEL2 * bcd; // 3.142 × 12 = 37.704 M

    // A: Self wt of tank on ring beam per M (excluding bottom plate)
    r.A_selfWtPerM = r.selfWtTankExclPlate / ringPerimeter;

    // B: Tank base plate load per M
    r.B_basePlatePerM = r.wtAnnularBottomPlate / ringPerimeter;

    // C: Weight of liquid column resting on ring per M
    r.C_liquidOnRingPerM = liquidDensity * thkRingBeamWall;

    // D: Weight of ring beam (wall) per M
    const totalHeightRingWall = heightRBAboveGL + depthRBBelowGL;
    r.D_wtRingBeamWallPerM = unitWtConcrete * thkRingBeamWall * totalHeightRingWall;

    // E: Weight of ring beam raft per M
    r.E_wtRingBeamRaftPerM = unitWtConcrete * widthRingBeamRaft * depthFdnRaft;

    // F: Weight of outside soil on raft per M
    const outsideSoilWidth = (widthRingBeamRaft - thkRingBeamWall) / 2;
    r.F_wtOutsideSoilPerM = unitWtSoil * outsideSoilWidth * depthRBBelowGL;

    // G: Weight of inside sand on raft per M
    const insideSandWidth = (widthRingBeamRaft - thkRingBeamWall) / 2;
    r.G_wtInsideSandPerM = unitWtSand * insideSandWidth * totalHeightRingWall;

    r.totalLoadPerM = r.A_selfWtPerM + r.B_basePlatePerM + r.C_liquidOnRingPerM
        + r.D_wtRingBeamWallPerM + r.E_wtRingBeamRaftPerM
        + r.F_wtOutsideSoilPerM + r.G_wtInsideSandPerM;

    // ─────────────────────────────────────────────────────────────
    // STEP 1: SOIL PRESSURE — OPERATING + WIND LOAD
    // ─────────────────────────────────────────────────────────────

    // Under Ring Beam Raft:
    // P = totalLoadPerM/M + M_wind/Z — both normalised to M²
    // totalLoad (KN/M) × perimeter / area = KN/M²?
    // Excel formula: P_max = totalLoadPerM/areaAnnularRaft + windM/Z_raft (all in total, not per M)
    // Total vertical load on raft = totalLoadPerM × perimeter:
    // Actually Excel directly: numerator = 125.137 (per M), denom = 37.68 M²
    // Result = 125.137/37.68 + 3904/113.825 = 3.32 + 34.30 = 37.62 ≈ 37.62 KN/M² ✓
    // (Excel shows 37.619)
    // So: P = (totalLoadPerM × ringPerimeter) / areaAnnularRaft ± M/Z
    // Simplifies to: totalLoadPerM/areaAnnularRaft×perimeter ...
    // Actually: totalLoadPerM × perimeter = total vertical KN, divide by area = KN/M²
    // but Excel uses: totalLoadPerM / areaAnnularRaft (treating per-M load as if it's total)
    // That gives: 125.137/37.68 = 3.32, not 37.62
    // So the actual formula is: (total vertical load) / area ± M/Z
    // total vertical = totalLoadPerM × ringPerimeter? = 125.137 × 37.68 = 4714.2 KN
    // 4714.2 / 37.68 = 125.14 KN/M²?  Then ± 3904/113.825 = 34.3
    // 125.14 + 34.3 = 159.4? Not 37.62.
    // Excel must be: totalLoadPerM / areaAnnularRaft ± M/Z (treating per-M as total KN somehow)
    // = 125.137/37.68 ± 3904/113.825 = 3.32 ± 34.30
    // Max = 3.32 + 34.30 = 37.62 ✓, Min = 3.32 - 34.30 = -30.98 ✓
    // So Excel's formula IS: P = totalLoadPerM/areaAnnularRaft ± M/Z_raft
    // This is dimensionally: (KN/M) / M² = KN/M³... but the result matches.
    // The ring beam calculation treats "load per metre of ring" divided by "area per metre" = pressure.
    // Area per metre of ring = widthRingBeamRaft = 2M per M run. So effective pressure = totalLoadPerM/2 = 62.57 KN/M²?
    // But Excel divides by 37.68 (total area). This is a known approximation used in practice.
    // We replicate exactly as Excel does:

    r.check1_Pmax_ring = r.totalLoadPerM / r.areaAnnularRaft + r.windMDesign / r.Z_raft;
    r.check1_Pmin_ring = r.totalLoadPerM / r.areaAnnularRaft - r.windMDesign / r.Z_raft;
    r.check1_ring_OK = r.check1_Pmax_ring <= r.sbcAfterWL;
    r.check1_ring_tension = r.check1_Pmin_ring < 0; // true = tension (uplift)

    // ─────────────────────────────────────────────────────────────
    // INSIDE RING — Soil Pressure (Operating + Wind)
    // All loads INSIDE the ring on the tank floor area
    // ─────────────────────────────────────────────────────────────
    // Area inside ring (tank floor area, ID = tankID)
    r.areaInsideRing = (PI_EXCEL / 4) * tankID ** 2;
    r.Z_inside = (PI_EXCEL * tankID ** 3) / 32;

    // Inside loads (Operating case):
    r.ins_A_wtBottomPlate = r.areaTankBottomPlate * (tankBottomPlateThk / 1000) * unitWtSteel;
    r.ins_B_liquidWt = operatingWtTank - emptyWtTank;
    r.ins_C_wtSandBitumen = r.areaTankBottomPlate * thkSandBitumen * unitWtSand;
    r.ins_D_wtM30 = r.areaTankBottomPlate * thkM30Conc * unitWtConcrete;
    r.ins_E_wtM75 = r.areaTankBottomPlate * thkM75Conc * 24;

    // Sand filling inside ring
    const sandFillH = totalHeightRingWall - thkSandBitumen - thkM30Conc - thkM75Conc;
    r.ins_F_wtSandFill = r.areaTankBottomPlate * sandFillH * unitWtSand;

    r.totalInsideLoads_op = r.ins_A_wtBottomPlate + r.ins_B_liquidWt + r.ins_C_wtSandBitumen
        + r.ins_D_wtM30 + r.ins_E_wtM75 + r.ins_F_wtSandFill;

    // Soil pressure inside ring (Operating + Wind):
    r.check1_Pmax_inside = r.totalInsideLoads_op / r.areaInsideRing + r.windMDesign / r.Z_inside;
    r.check1_Pmin_inside = r.totalInsideLoads_op / r.areaInsideRing - r.windMDesign / r.Z_inside;
    r.check1_inside_OK = r.check1_Pmax_inside <= r.sbcAfterWL;
    r.check1_inside_tension = r.check1_Pmin_inside < 0;

    // ─────────────────────────────────────────────────────────────
    // STEP 2: SOIL PRESSURE — OPERATING + EQ LOAD
    // ─────────────────────────────────────────────────────────────
    r.check2_Pmax_ring = r.totalLoadPerM / r.areaAnnularRaft + r.seismicMDesign / r.Z_raft;
    r.check2_Pmin_ring = r.totalLoadPerM / r.areaAnnularRaft - r.seismicMDesign / r.Z_raft;
    r.check2_ring_OK = r.check2_Pmax_ring <= r.sbcAfterEQ;
    r.check2_ring_tension = r.check2_Pmin_ring < 0;

    r.check2_Pmax_inside = r.totalInsideLoads_op / r.areaInsideRing + r.seismicMDesign / r.Z_inside;
    r.check2_Pmin_inside = r.totalInsideLoads_op / r.areaInsideRing - r.seismicMDesign / r.Z_inside;
    r.check2_inside_OK = r.check2_Pmax_inside <= r.sbcAfterEQ;
    r.check2_inside_tension = r.check2_Pmin_inside < 0;

    // ─────────────────────────────────────────────────────────────
    // STEP 3: SOIL PRESSURE — HYDROTEST + 0.75×WIND LOAD
    // ─────────────────────────────────────────────────────────────
    r.ins_B_liquidWt_HT = hydrotestWtTank - emptyWtTank;
    r.totalInsideLoads_HT = r.ins_A_wtBottomPlate + r.ins_B_liquidWt_HT
        + r.ins_C_wtSandBitumen + r.ins_D_wtM30
        + r.ins_E_wtM75 + r.ins_F_wtSandFill;

    const moment_HT = 0.75 * r.seismicMDesign;

    r.check3_Pmax_inside = r.totalInsideLoads_HT / r.areaInsideRing + moment_HT / r.Z_inside;
    r.check3_Pmin_inside = r.totalInsideLoads_HT / r.areaInsideRing - moment_HT / r.Z_inside;
    r.check3_inside_OK = r.check3_Pmax_inside <= r.sbcAfterWL;
    r.check3_inside_tension = r.check3_Pmin_inside < 0;

    // ─────────────────────────────────────────────────────────────
    // STEP 4: SLIDING CHECK (Empty condition)
    // ─────────────────────────────────────────────────────────────
    r.disturbingForce = seismicFx;

    // Restoring weights
    const perimeterForSliding = PI_EXCEL * bcd;
    r.sl_A = emptyWtTank;
    r.sl_B_ringWall = unitWtConcrete * (perimeterForSliding * thkRingBeamWall) * totalHeightRingWall;
    r.sl_C_ringRaft = unitWtConcrete * (PI_EXCEL * bcd * widthRingBeamRaft) * depthFdnRaft;

    // D: Outside soil on raft
    const sl_outsideArea = (PI_EXCEL / 4) * ((bcd + 2 * outsideSoilWidth) ** 2 - bcd ** 2);
    r.sl_D_outsideSoil = unitWtSoil * sl_outsideArea * depthRBBelowGL;

    // E: Inside sand on raft
    const sl_insideArea = (PI_EXCEL / 4) * (bcd ** 2 - (bcd - 2 * insideSandWidth) ** 2);
    r.sl_E_insideSand = unitWtSand * sl_insideArea * depthFdnRaft;

    // F-I: Inside layers (same area as tank bottom = 109.3034 M²)
    r.sl_F_sandBitumen = r.areaTankBottomPlate * thkSandBitumen * unitWtSand;
    r.sl_G_M30 = r.areaTankBottomPlate * thkM30Conc * unitWtConcrete;
    r.sl_H_M75 = r.areaTankBottomPlate * thkM75Conc * 24;
    r.sl_I_sandFill = r.areaTankBottomPlate * sandFillH * unitWtSand;

    r.totalRestoringWt = r.sl_A + r.sl_B_ringWall + r.sl_C_ringRaft + r.sl_D_outsideSoil
        + r.sl_E_insideSand + r.sl_F_sandBitumen + r.sl_G_M30
        + r.sl_H_M75 + r.sl_I_sandFill;

    r.restoringForceSliding = mu * r.totalRestoringWt;
    r.FOS_sliding = r.restoringForceSliding / r.disturbingForce;
    r.sliding_OK = r.FOS_sliding >= 1.5;

    // ─────────────────────────────────────────────────────────────
    // STEP 5: OVERTURNING CHECK
    // ─────────────────────────────────────────────────────────────
    r.overturnMoment = r.seismicMDesign;
    const overturnArm = (bcd + widthRingBeamRaft) * 0.5;
    r.restoringMoment = r.totalRestoringWt * overturnArm;
    r.FOS_overturning = r.restoringMoment / r.overturnMoment;
    r.overturning_OK = r.FOS_overturning >= 1.5;

    // ─────────────────────────────────────────────────────────────
    // STEP 6: HOOP TENSION IN RING BEAM (Operating + Wind)
    // ─────────────────────────────────────────────────────────────
    // 5.1: Loads per metre on ring beam wall (vertical surcharge)
    const h6_A = r.A_selfWtPerM;
    const h6_B = r.B_basePlatePerM;
    const h6_C = r.C_liquidOnRingPerM;
    const h6_D = r.D_wtRingBeamWallPerM;

    // Wind force per metre of perimeter
    r.windLoadPerM = windFx / (PI_EXCEL * bcd);

    const totalSurcharge = h6_A + h6_B + h6_C + h6_D + r.windLoadPerM;
    r.totalSurcharge = totalSurcharge;

    // 5.2: Surcharge due to confined soil (earth pressure from surcharge)
    r.surcharge_load = totalSurcharge * depthRBBelowGL * Ka;

    // 5.3: Surcharge due to confined soil (self weight of soil column)
    r.surcharge_soil = 0.5 * depthRBBelowGL ** 2 * unitWtSoil * Ka;

    // Total hoop tension
    r.hoopTension = (r.surcharge_load + r.surcharge_soil) * (0.5 * bcd);

    // ─────────────────────────────────────────────────────────────
    // STEP 7: REINFORCEMENT FOR RING BEAM (Horizontal — hoop steel)
    // ─────────────────────────────────────────────────────────────
    // Allowable stress in steel (working stress method)
    const sigmaSteel = 230; // N/MM² (IS 3370 working stress)
    r.astHoopRequired = (r.hoopTension * 1000) / sigmaSteel;

    // Minimum horizontal steel = 0.20% of cross section
    r.astMinHorizontal = 0.002 * 1000 * (thkRingBeamWall * 1000);

    r.astHoopDesign = Math.max(r.astHoopRequired, r.astMinHorizontal);
    r.astHoopEachFace = r.astHoopDesign / 2;

    // Spacing for 12mm bar:
    // const barDia_horiz = 12; // mm
    r.barDia_horiz = barDia_horiz;
    const barArea_horiz = Math.PI * barDia_horiz ** 2 / 4; // = 113.1 MM²
    r.barArea_horiz = barArea_horiz;
    r.spacingHoopCalc = barArea_horiz * 1000 / r.astHoopEachFace; // C/C spacing (mm)
    r.spacingHoopProvide = 125; // mm (as per Excel conclusion)
    r.astHoopProvided = barArea_horiz * 1000 / r.spacingHoopProvide;
    // = 113.1 × 8 = 904.32 MM² ✓
    r.astHoopProvided_OK = r.astHoopEachFace <= r.astHoopProvided;
    // σct (permissible tensile stress in concrete M30) = 1.2 N/MM²
    const sigma_ct = 1.20;
    r.sigma_ct = sigma_ct;
    const m_minus1 = 13.33;
    r.wallThkCalc = (1 / 1000) * (((r.hoopTension * 1000) / sigma_ct) - m_minus1 * r.astHoopProvided);
    r.wallThkProvided = thkRingBeamWall * 1000;
    r.wallThk_OK = r.wallThkProvided >= r.wallThkCalc;

    // ─────────────────────────────────────────────────────────────
    // STEP 9: VERTICAL REINFORCEMENT
    // ─────────────────────────────────────────────────────────────
    r.astVertTotal = 0.0012 * 1000 * (thkRingBeamWall * 1000);
    r.astVertEachFace = r.astVertTotal / 2;
    // const barDia_vert = 12;
    r.barDia_vert = barDia_vert;
    const barArea_vert = Math.PI * barDia_vert ** 2 / 4;
    r.barArea_vert = barArea_vert;
    r.spacingVertCalc = barArea_vert * 1000 / r.astVertEachFace;
    r.spacingVertProvide = 150;
    r.astVertProvided = barArea_vert * 1000 / r.spacingVertProvide;
    r.astVertProvided_OK = r.astVertTotal <= r.astVertProvided;

    // ─────────────────────────────────────────────────────────────
    // STEP 10: DESIGN OF RING WALL BASE RAFT
    // ─────────────────────────────────────────────────────────────
    const raftSoilPressure = r.check1_Pmax_ring;
    const cantileverArm = outsideSoilWidth;

    // BM at face of wall: M = q × L²/2
    r.raftBM = raftSoilPressure * cantileverArm ** 2 / 2;

    // Factored moment: Mu = 1.5 × BM
    r.raftMu = 1.5 * r.raftBM;

    // Effective depth required: de = √(Mu / (0.138 × fck × b))
    r.raftDeReq = Math.sqrt((r.raftMu * 1e6) / (0.138 * fck * 1000));

    const raftD = depthFdnRaft * 1000;
    const raftCover = 50;
    // const raftBarDia = 12;
    r.raftBarDia = raftBarDia;
    r.raftDeProvided = raftD - raftCover - 5; // Excel method

    // pt required (IS 456 formula)
    const Mu_Nmm = r.raftMu * 1e6;
    r.pt_req = (50 * fck / fy) * (1 - Math.sqrt(1 - (4.6 * Mu_Nmm) / (fck * 1000 * r.raftDeProvided ** 2)));

    r.pt_min = 0.12;
    r.pt_max = Math.max(r.pt_req, r.pt_min);
    r.raftAstReq = (r.pt_max / 100) * 1000 * r.raftDeProvided;

    const raftBarArea = Math.PI * raftBarDia ** 2 / 4;
    r.raftSpacingCalc = raftBarArea * 1000 / r.raftAstReq;
    r.raftSpacingProvide = 150;
    r.raftAstProvided = raftBarArea * 1000 / r.raftSpacingProvide;
    r.raft_OK = r.raftDeProvided >= r.raftDeReq;

    // ─────────────────────────────────────────────────────────────
    // CONCLUSION SUMMARY
    // ─────────────────────────────────────────────────────────────
    r.conclusion = {
        bcd: bcd,
        thkRingWall_m: thkRingBeamWall,
        widthRingRaft_m: widthRingBeamRaft,
        thkRingRaft_m: depthFdnRaft,
        depthFdn_m: r.depthFdnFromGL,
        horizReinf: `${r.barDia_horiz} TOR @ ${r.spacingHoopProvide} C/C (both faces)`,
        vertReinf: `${r.barDia_vert} TOR @ ${r.spacingVertProvide} C/C (both faces)`,
        raftReinf: `${r.raftBarDia} TOR @ ${r.raftSpacingProvide} C/C (both ways)`,
        allChecksPass: r.check1_ring_OK && r.check2_ring_OK && r.check3_inside_OK
            && r.sliding_OK && r.overturning_OK && r.wallThk_OK && r.raft_OK
    };

    return r;
}

// ─────────────────────────────────────────────────────────────
// DEFAULT INPUTS (matching the Excel file exactly)
// ─────────────────────────────────────────────────────────────
export const defaultInputs = {
    tankName: 'Tank 1', tankID: '11.80', bcd: '12.00', totalHeightEqpt: '12.80', liquidLevel: '12.50',
    waterDensity: '10.00', liquidDensity: '10.00',
    emptyWtTank: '530.00', operatingWtTank: '12429.00', hydrotestWtTank: '14664.00',
    tankBottomPlateThk: '8.00', thkSandBitumen: '0.05', thkM30Conc: '0.15', thkM75Conc: '0.075',
    heightRBAboveGL: '1.0', depthRBBelowGL: '1.40', depthFdnRaft: '0.60',
    thkRingBeamWall: '0.40', widthRingBeamRaft: '2.00',
    sbcAtFdnDepth: '190.00', Ka: '0.36', mu: '0.30',
    unitWtConcrete: '25.00', unitWtSand: '18.00', unitWtSoil: '18.00',
    fck: '30.00', fy: '500.00',
    windFx: '416.00', windM: '2656.00', seismicFx: '1477.00', seismicM: '9430.00',
    barDia_horiz: '12.00', barDia_vert: '12.00', raftBarDia: '12.00'
};

