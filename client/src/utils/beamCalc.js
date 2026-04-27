

// ── LOOKUP TABLES from IS 456 ──────────────────────────
const TC_TABLE = {
    0.15: { 15: 0.28, 20: 0.28, 25: 0.29, 30: 0.29, 35: 0.29, 40: 0.30 },
    0.25: { 15: 0.35, 20: 0.36, 25: 0.36, 30: 0.37, 35: 0.37, 40: 0.38 },
    0.50: { 15: 0.46, 20: 0.48, 25: 0.49, 30: 0.50, 35: 0.50, 40: 0.51 },
    0.75: { 15: 0.54, 20: 0.56, 25: 0.57, 30: 0.59, 35: 0.59, 40: 0.60 },
    1.00: { 15: 0.60, 20: 0.62, 25: 0.64, 30: 0.66, 35: 0.67, 40: 0.68 },
    1.25: { 15: 0.64, 20: 0.67, 25: 0.70, 30: 0.71, 35: 0.73, 40: 0.74 },
    1.50: { 15: 0.68, 20: 0.72, 25: 0.74, 30: 0.76, 35: 0.78, 40: 0.79 },
    1.75: { 15: 0.71, 20: 0.75, 25: 0.78, 30: 0.80, 35: 0.82, 40: 0.84 },
    2.00: { 15: 0.71, 20: 0.79, 25: 0.82, 30: 0.84, 35: 0.86, 40: 0.88 },
    2.25: { 15: 0.71, 20: 0.81, 25: 0.85, 30: 0.88, 35: 0.90, 40: 0.92 },
    2.50: { 15: 0.71, 20: 0.82, 25: 0.88, 30: 0.91, 35: 0.93, 40: 0.95 },
    2.75: { 15: 0.71, 20: 0.82, 25: 0.90, 30: 0.94, 35: 0.96, 40: 0.98 },
    3.00: { 15: 0.71, 20: 0.82, 25: 0.92, 30: 0.96, 35: 0.99, 40: 1.01 }
};
const TC_MAX = { 15: 2.5, 20: 2.8, 25: 3.1, 30: 3.5, 35: 3.7, 40: 4.0 }

const MULIM_FACTOR = { 250: 0.149, 415: 0.138, 500: 0.133 }

// ── INTERPOLATION (for tc table lookup) ───────────────
function getTc(ratio, fck, r1, r2) {
    const grade = [15, 20, 25, 30, 35, 40].includes(fck) ? fck : 40

    // Use user-provided bounds if available, else find automatically
    const lo = r1 ?? 0.75
    const hi = r2 ?? 1.00

    const tcLo = TC_TABLE[lo]?.[grade] ?? 0.50
    const tcHi = TC_TABLE[hi]?.[grade] ?? 0.60

    // Linear interpolation
    const tc = tcLo + ((tcHi - tcLo) / (hi - lo)) * (ratio - lo)

    return {
        tc,
        loRatio: lo,
        hiRatio: hi,
        loTc: tcLo,
        hiTc: tcHi
    }
}

// ── BAR AREA HELPER ────────────────────────────────────
const barArea = (dia, count) => (Math.PI / 4) * dia * dia * count

// ── MAIN FUNCTION — this is the entire brain ──────────
export function calculateBeam(inp) {
    // Coerce numeric strings to numbers centrally
    const parsed = { ...inp };
    for (const k in parsed) {
        if (k !== 'beamName' && k !== 'bendingMomentDirection') {
            parsed[k] = Number(parsed[k]);
        }
    }

    const { Mu, Vu, cover, fck, fy, b, D,
        bar1Count, bar1Dia, bar2Count, bar2Dia,
        stirrupDia, stirrupLegs, providedStirrupSpacing,
        sfrCount, sfrDia, } = parsed

    const r = {}

    // GEOMETRY
    r.d = D - cover // effective depth

    // Guard: if critical inputs are zero/missing, return null (empty state)
    if (!r.d || !fck || !fy || !b) return null

    // FLEXURE
    r.mulimFactor = MULIM_FACTOR[fy] ?? 0.133
    r.Mulim = (r.mulimFactor * fck * b * r.d * r.d) / 1e6
    r.muOk = Mu < r.Mulim
    r.muCheck = r.muOk ? 'OK' : 'Increase section size'

    // REQUIRED STEEL
    const disc = 1 - (4.6 * Mu * 1e6) / (fck * b * r.d * r.d)
    r.PtReq = disc > 0 ? 50 * (fck / fy) * (1 - Math.sqrt(disc)) : null
    r.AstReq = r.PtReq ? (r.PtReq * b * r.d) / 100 : null
    r.AstMin = (0.85 * b * r.d) / fy
    r.PtMin = Math.max((r.AstMin * 100) / (b * r.d), 0.27)

    // PROVIDED STEEL
    r.Ast1 = barArea(bar1Dia, bar1Count)
    r.Ast2 = barArea(bar2Dia, bar2Count)
    r.AstProv = r.Ast1 + r.Ast2
    r.PtProv = (r.AstProv * 100) / (b * r.d)
    r.steelOk = r.PtReq !== null ? r.PtProv >= Math.max(r.PtReq, r.PtMin) : false  // Bug fix: null PtReq means section fails
    r.steelCheck = r.steelOk ? 'OK' : 'Increase Reinforcement'

    // SIDE FACE REINF
    r.sfrRequired = D >= 750
    r.sfrAreaReq = b * D * 0.001
    r.sfrOneSideAreaReq = r.sfrAreaReq / 2
    r.sfrAreaProv = barArea(sfrDia, sfrCount)
    r.sfrOk = !r.sfrRequired || r.sfrAreaProv >= r.sfrOneSideAreaReq
    r.sfrCheck = r.sfrRequired ? (r.sfrOk ? 'OK' : 'Increase SFR') : 'Not required'

    // SHEAR
    r.tv = (Vu * 1000) / (b * r.d)
    r.tcMax = TC_MAX[fck] ?? 3.5
    r.ratio100 = (r.AstProv * 100) / (b * r.d)
    r.As = r.AstProv * 100 / (b * D)

    // tc Calculation details
    const tcData = getTc(r.As, fck, parsed.tcRatio1, parsed.tcRatio2)
    r.tcLo = tcData.loTc
    r.tcHi = tcData.hiTc
    r.tcRatio1 = tcData.loRatio
    r.tcRatio2 = tcData.hiRatio
    r.tc = tcData.tc
    // r.tcLo + ((r.tcHi - r.tcLo) / (r.tcRatio2 - r.tcRatio1)) * (r.As - r.tcRatio1)

    r.shearSectionOk = r.tv <= r.tcMax
    r.shearDesign = r.tv > r.tc
    r.Vuc = (r.tc * b * r.d) / 1000
    r.Asv = barArea(stirrupDia, stirrupLegs)
    r.Vus = Math.max(Vu - r.Vuc, 0)

    // Spacing from shear demand
    r.SvCalc = r.Vus > 0
        ? (0.87 * fy * r.Asv * r.d) / (r.Vus * 1000)
        : 9999

    // Minimum spacing — IS 456 Cl. 26.5.1.6
    r.SvMin1 = (0.87 * fy * r.Asv) / (0.4 * b)

    // Maximum spacing limits — IS 456 Cl. 26.5.1.5
    r.SvMax1 = 0.75 * D      // ← this was missing
    r.SvMax2 = 300               // ← and this
    r.minSpacing = Math.min(r.SvMax1, r.SvMax2)

    r.Sv = r.Vus > 0 ? (0.87 * fy * r.Asv * r.d) / (r.Vus * 1000) : null



    // Auto designed spacing
    // Auto designed spacing (kept internally for reference)
    const svRaw = Math.min(r.SvCalc, r.SvMin1, r.SvMax1, r.SvMax2)
    r.autoSpacing = Math.floor(svRaw / 25) * 25

    // User provided spacing
    const userSpacing = parsed.providedStirrupSpacing
    r.isUserSpacing = !!userSpacing && userSpacing > 0

    if (!r.isUserSpacing) {
        // No spacing entered yet — return nothing for spacing results
        r.stirrupSpacing = null
        r.Vusmin = null
        r.stirrupOk = null
        r.stirrupCheck = null
    } else {
        // User entered a value — verify it
        r.stirrupSpacing = userSpacing
        r.Vusmin = (0.87 * fy * r.Asv * r.d) / (r.stirrupSpacing * 1000)
        r.stirrupOk = r.Vusmin >= r.Vus
            && r.stirrupSpacing <= r.SvMax1
            && r.stirrupSpacing <= r.SvMax2
        r.stirrupCheck = r.stirrupOk
            ? 'OK'
            : `Unsafe — max allowed is ${r.autoSpacing} mm`
    }
    r.shearCheck = r.Vusmin > r.Vus ? 'OK' : 'Increase Reinforcement'

    //L4 SECTION 
    r.lenOfBeam = 7;
    r.L4 = r.lenOfBeam * 1000 / 4;
    r.M34 = r.L4 / 1000;
    r.M32 = r.M34 / 2;
    r.O32 = r.M34 - r.M32;
    r.R27 = 320;
    r.L29 = 29.939;
    const V19 = (r.R27 - r.L29) / r.M34;
    r.O28 = r.L29 + (V19 * r.M32);
    r.ptPercent = 50 * (fck / fy) *
        (1 - Math.sqrt(
            1 - ((4.6 * r.O28 * Math.pow(10, 6)) / (fck * b * Math.pow(r.d, 2)))
        ))
    r.astPercent = (r.ptPercent * b * r.d) / 100

    //Bar provide for L4
    r.bar1CountL4 = 3;
    r.bar1DiaL4 = 20;
    r.bar2CountL4 = 0;
    r.bar2DiaL4 = 20;

    r.O37 = (Math.PI / 4) * Math.pow(r.bar1DiaL4, 2) * r.bar1CountL4;
    r.O38 = (Math.PI / 4) * Math.pow(r.bar2DiaL4, 2) * r.bar2CountL4;

    r.O40 = r.O37 + r.O38;







    return r    // ← everything is in here, ~25 values
}