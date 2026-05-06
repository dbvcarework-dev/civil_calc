

// ─── IS:875 Part-3 Wind Load Calculator Utilities ──────────────────────────

// K1 — Risk Coefficient (IS:875 Table 1)


export const DESIGN_LIVES = ["50", "5", "25", "100"];

// Map each design-life to its single valid structure type
export const DESIGN_LIFE_TYPE_MAP = {
  "50": "General",
  "5": "Temporary",
  "25": "LowHazard",
  "100": "Important",
};

/** Returns K1 value for given designLife and Vb (auto-resolves structure type) */
export function getK1(designLife, vb, winloadTable) {
  const structureType = DESIGN_LIFE_TYPE_MAP[String(designLife)];
  if (!structureType) return null;
  return winloadTable.k1Table?.[designLife]?.vbValues?.[vb] ?? null;
}



// Moved linearInterpolate above getK1 so it's available for K1 interpolation
function linearInterpolate(x, x0, x1, y0, y1) {
  if (x1 === x0) return y0;
  return y0 + ((y1 - y0) * (x - x0)) / (x1 - x0);
}

/** Returns K2 interpolated for given height and terrain category (1-4) */
export function getK2(height, terrainCategory, winloadTable) {
  const vals = winloadTable.k2Table.terrainCategories[String(terrainCategory)];
  console.log(vals)
  if (!vals) return null;
  const H = Math.max(height, 10); // below 10m → use 10m value
  const maxH = winloadTable.k2Table.heights[winloadTable.k2Table.heights.length - 1];
  if (H >= maxH) return vals[vals.length - 1];

  for (let i = 0; i < winloadTable.k2Table.heights.length - 1; i++) {
    if (H >= winloadTable.k2Table.heights[i] && H <= winloadTable.k2Table.heights[i + 1]) {
      return linearInterpolate(H, winloadTable.k2Table.heights[i], winloadTable.k2Table.heights[i + 1], vals[i], vals[i + 1]);
    }
  }
  return vals[0];
}

// Ka — Area Averaging Factor (IS:875 Table 4)
export function getKa(area) {
  if (area <= 10) return 1.0;
  if (area >= 100) return 0.8;
  // linear interpolation between (10, 1.0) and (25, 0.9) and (25, 0.9) → (100, 0.8)
  if (area <= 25) return linearInterpolate(area, 10, 25, 1.0, 0.9);
  return linearInterpolate(area, 25, 100, 0.9, 0.8);
}

/** Full wind load calculation — returns all intermediate and final values */
export function calculateWindLoad(inp, winloadTable) {
  // console.log(winloadTable);
  // Coerce string inputs to numbers centrally
  const parsed = { ...inp };
  const numKeys = ['H', 'W', 'L', 'k2Custom', 'k3Custom', 'cpi', 'cpeA', 'cpeB', 'cpeC', 'cpeD'];
  numKeys.forEach(k => {
    if (parsed[k] !== undefined && parsed[k] !== null && String(parsed[k]).trim() !== '') {
      parsed[k] = Number(parsed[k]);
    }
  });

  const {
    H, W, L,
    city,
    designLife, structureType,
    terrainCategory, k2Custom,
    k3Type, k3Custom,
    k4Type,
    kd, kcType,
    cpi,
    cpeA, cpeB, cpeC, cpeD,
  } = parsed;

  // Guard: if critical inputs are zero/missing, return null (empty state)
  if (!H || !W || !L || Number(H) <= 0 || Number(W) <= 0 || Number(L) <= 0) return null;

  const vb = winloadTable.cityWindSpeeds.find(c => c.city === city)?.vb ?? null;

  const k1 = getK1(designLife, vb, winloadTable);
  const k1Invalid = k1 === null;

  const k2Auto = getK2(H, terrainCategory, winloadTable);
  const k2 = (k2Custom !== undefined && k2Custom !== null && String(k2Custom).trim() !== '') ? parseFloat(k2Custom) : k2Auto;

  const k3 = k3Type === 'flat' ? 1.0 : (parseFloat(k3Custom) || 1.0);
  const k4 = k4Type === 'normal' ? 1.0 : 1.15;

  const vz = vb != null && !k1Invalid ? +(vb * k1 * k2 * k3 * k4).toFixed(3) : null;
  const pz = vz != null ? +(0.6 * vz * vz / 1000).toFixed(4) : null;

  // Ka
  const area = W * L;
  const ka = getKa(area);

  // Kd
  const kdVal = winloadTable.kdMap[kd] ?? 0.9;

  // Kc
  const kcVal = winloadTable.kcMap[kcType] ?? 1.0;

  let pd = null;
  let pdMinimumGoverns = false;
  if (pz != null) {
    const pdCalc = kdVal * ka * kcVal * pz;
    const pdMin = 0.7 * pz;
    pdMinimumGoverns = pdCalc < pdMin;
    pd = +(Math.max(pdCalc, pdMin)).toFixed(4);
  }

  const cpiVal = parseFloat(cpi) || 0;
  const hwRatio = W > 0 ? (H / W).toFixed(2) : null;
  const lwRatio = W > 0 ? (L / W).toFixed(2) : null;

  const walls = [
    { name: 'Wall A', cpe: parseFloat(cpeA) || 0 },
    { name: 'Wall B', cpe: parseFloat(cpeB) || 0 },
    { name: 'Wall C', cpe: parseFloat(cpeC) || 0 },
    { name: 'Wall D', cpe: parseFloat(cpeD) || 0 },
  ].map(w => ({
    ...w,
    suction: +(w.cpe - cpiVal).toFixed(3),
    pressure: +(w.cpe + cpiVal).toFixed(3),
  }));

  return {
    vb, k1, k1Invalid, k2Auto: k2Auto != null ? +k2Auto.toFixed(4) : null, k2: k2 != null ? +k2.toFixed(4) : null, k3, k4,
    vz, pz,
    area: +area.toFixed(3), ka: +ka.toFixed(4), kdVal, kcVal,
    pd, pdMinimumGoverns,
    cpiVal, hwRatio, lwRatio,
    walls,
  };
}
