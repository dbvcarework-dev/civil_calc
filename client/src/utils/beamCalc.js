// ── LOOKUP TABLES from IS 456 ──────────────────────────
const TC_TABLE = {
    0.15: { 15: 0.28, 20: 0.28, 25: 0.29, 30: 0.29, 35: 0.29 },
    0.25: { 15: 0.35, 20: 0.36, 25: 0.36, 30: 0.37, 35: 0.37 },
    0.50: { 15: 0.46, 20: 0.48, 25: 0.49, 30: 0.50, 35: 0.50 },
    0.75: { 15: 0.54, 20: 0.56, 25: 0.57, 30: 0.59, 35: 0.59 },
    1.00: { 15: 0.60, 20: 0.62, 25: 0.64, 30: 0.66, 35: 0.67 },
    1.25: { 15: 0.64, 20: 0.67, 25: 0.70, 30: 0.71, 35: 0.73 },
    1.50: { 15: 0.68, 20: 0.72, 25: 0.74, 30: 0.76, 35: 0.78 },
    1.75: { 15: 0.71, 20: 0.75, 25: 0.78, 30: 0.80, 35: 0.82 },
    2.00: { 15: 0.71, 20: 0.79, 25: 0.82, 30: 0.84, 35: 0.86 },
    2.25: { 15: 0.71, 20: 0.81, 25: 0.85, 30: 0.88, 35: 0.90 },
    2.50: { 15: 0.71, 20: 0.82, 25: 0.88, 30: 0.91, 35: 0.93 },
    2.75: { 15: 0.71, 20: 0.82, 25: 0.90, 30: 0.94, 35: 0.96 },
    3.00: { 15: 0.71, 20: 0.82, 25: 0.92, 30: 0.96, 35: 0.99 },
}

const TC_MAX = { 15: 2.5, 20: 2.8, 25: 3.1, 30: 3.5, 35: 3.7, 40: 4.0 }

const MULIM_FACTOR = { 250: 0.149, 415: 0.138, 500: 0.133 }

// ── INTERPOLATION (for tc table lookup) ───────────────
function getTc(ratio, fck) {
    const rows = Object.keys(TC_TABLE).map(Number).sort((a, b) => a - b)
    const grade = [15, 20, 25, 30, 35].includes(fck) ? fck : 30
    const val = Math.min(ratio, 3.0)
    if (val <= rows[0]) return TC_TABLE[rows[0]][grade]
    if (val >= rows[rows.length - 1]) return TC_TABLE[rows[rows.length - 1]][grade]
    const lo = rows.filter(r => r <= val).at(-1)
    const hi = rows.filter(r => r > val)[0]
    const tcLo = TC_TABLE[lo][grade]
    const tcHi = TC_TABLE[hi][grade]
    return tcLo + ((tcHi - tcLo) / (hi - lo)) * (val - lo)
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
        sfrCount, sfrDia } = parsed

    const r = {}

    // GEOMETRY
    r.d = D - cover

    // Guard: if critical inputs are zero/missing, return null (empty state)
    if (!r.d || !fck || !fy || !b) return null                                         // effective depth

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
    r.sfrAreaReq = (D * b * 0.001) / 2
    r.sfrAreaProv = barArea(sfrDia, sfrCount)
    r.sfrOk = !r.sfrRequired || r.sfrAreaProv >= r.sfrAreaReq
    r.sfrCheck = r.sfrRequired ? (r.sfrOk ? 'OK' : 'Increase SFR') : 'Not required'

    // SHEAR
    r.tv = (Vu * 1000) / (b * r.d)
    r.tcMax = TC_MAX[fck] ?? 3.5
    r.ratio100 = (r.AstProv * 100) / (b * r.d)
    r.tc = getTc(r.ratio100, fck)
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
    r.SvMax1 = 0.75 * r.d        // ← this was missing
    r.SvMax2 = 300               // ← and this

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

    return r    // ← everything is in here, ~25 values
}