// ─── IS:875 Part-3 Wind Load Calculator Utilities ──────────────────────────

// Basic Wind Speed table (city → Vb in m/s)
export const CITY_VB = [
  { city: "Agra", vb: 47 }, { city: "Ahmedabad", vb: 39 }, { city: "Ajmer", vb: 47 },
  { city: "Almora", vb: 47 }, { city: "Amritsar", vb: 47 }, { city: "Asansol", vb: 47 },
  { city: "Aurangabad", vb: 39 }, { city: "Bahraich", vb: 47 }, { city: "Bengaluru", vb: 33 },
  { city: "Barauni", vb: 47 }, { city: "Bareilly", vb: 47 }, { city: "Bhatinda", vb: 47 },
  { city: "Bhilai", vb: 39 }, { city: "Bhopal", vb: 39 }, { city: "Bhubaneswar", vb: 50 },
  { city: "Bhuj", vb: 50 }, { city: "Bikaner", vb: 47 }, { city: "Bokaro", vb: 47 },
  { city: "Bombay/Mumbai", vb: 44 }, { city: "Calcutta/Kolkata", vb: 50 },
  { city: "Calicut/Kozhikode", vb: 39 }, { city: "Chandigarh", vb: 47 },
  { city: "Coimbatore", vb: 39 }, { city: "Cuttack", vb: 50 }, { city: "Darbhanga", vb: 55 },
  { city: "Darjeeling", vb: 47 }, { city: "Dehradun", vb: 47 }, { city: "Delhi", vb: 47 },
  { city: "Durgapur", vb: 47 }, { city: "Gangtok", vb: 47 }, { city: "Guwahati", vb: 50 },
  { city: "Gaya", vb: 39 }, { city: "Gorakhpur", vb: 47 }, { city: "Hyderabad", vb: 44 },
  { city: "Imphal", vb: 47 }, { city: "Jabalpur", vb: 47 }, { city: "Jaipur", vb: 47 },
  { city: "Jamshedpur", vb: 47 }, { city: "Jhansi", vb: 47 }, { city: "Jodhpur", vb: 47 },
  { city: "Kanpur", vb: 47 }, { city: "Kohima", vb: 44 }, { city: "Kurnool", vb: 39 },
  { city: "Lakshadweep", vb: 39 }, { city: "Lucknow", vb: 47 }, { city: "Ludhiana", vb: 47 },
  { city: "Madras/Chennai", vb: 50 }, { city: "Madurai", vb: 39 }, { city: "Mandi", vb: 39 },
  { city: "Mangalore", vb: 39 }, { city: "Moradabad", vb: 47 }, { city: "Mysore", vb: 33 },
  { city: "Nagpur", vb: 44 }, { city: "Nainital", vb: 47 }, { city: "Nasik", vb: 39 },
  { city: "Nellore", vb: 50 }, { city: "Panjim/Goa", vb: 39 }, { city: "Patiala", vb: 47 },
  { city: "Patna", vb: 47 }, { city: "Pondicherry", vb: 50 }, { city: "PortBlair", vb: 44 },
  { city: "Rajkot", vb: 39 }, { city: "Ranchi", vb: 39 }, { city: "Roorkee", vb: 39 },
  { city: "Rourkela", vb: 39 }, { city: "Shimla", vb: 39 }, { city: "Srinagar", vb: 39 },
  { city: "Surat", vb: 44 }, { city: "Tiruchirappalli", vb: 47 }, { city: "Trivandrum", vb: 39 },
  { city: "Udaipur", vb: 47 }, { city: "Vadodara", vb: 44 }, { city: "Varanasi", vb: 47 },
  { city: "Vijayawada", vb: 50 }, { city: "Visakhapatnam", vb: 50 },
];

// K1 — Risk Coefficient (IS:875 Table 1)
// Rows: design life, Cols: structure type [Temporary, LowHazard, General, Important]
const K1_TABLE = {
  "5": { Temporary: 0.82, LowHazard: 0.94, General: 1.00, Important: null },
  "25": { Temporary: 0.76, LowHazard: 0.92, General: 1.00, Important: null },
  "50": { Temporary: 0.73, LowHazard: 0.91, General: 1.00, Important: 1.07 },
  "100": { Temporary: 0.71, LowHazard: 0.90, General: 1.07, Important: 1.08 },
};

export const DESIGN_LIVES = ["5", "25", "50", "100"];
export const STRUCTURE_TYPES = ["Temporary", "LowHazard", "General", "Important"];

/** Returns K1 value or null if invalid combination */
export function getK1(designLife, structureType) {
  const row = K1_TABLE[String(designLife)];
  if (!row) return null;
  return row[structureType] ?? null;
}

// K2 — Terrain & Height Factor (IS:875 Table 2)
const K2_HEIGHTS = [10, 15, 20, 30, 50, 100, 150, 200, 250, 300, 350, 400, 450, 500];
const K2_VALUES = {
  "1": [1.05, 1.09, 1.12, 1.15, 1.20, 1.26, 1.30, 1.32, 1.34, 1.35, 1.35, 1.35, 1.35, 1.35],
  "2": [1.00, 1.05, 1.07, 1.12, 1.17, 1.24, 1.28, 1.30, 1.32, 1.34, 1.35, 1.35, 1.35, 1.35],
  "3": [0.91, 0.97, 1.01, 1.06, 1.12, 1.20, 1.24, 1.27, 1.29, 1.31, 1.32, 1.34, 1.35, 1.35],
  "4": [0.80, 0.80, 0.80, 0.97, 1.10, 1.20, 1.24, 1.27, 1.28, 1.30, 1.31, 1.32, 1.33, 1.34],
};

function linearInterpolate(x, x0, x1, y0, y1) {
  if (x1 === x0) return y0;
  return y0 + ((y1 - y0) * (x - x0)) / (x1 - x0);
}

/** Returns K2 interpolated for given height and terrain category (1-4) */
export function getK2(height, terrainCategory) {
  const vals = K2_VALUES[String(terrainCategory)];
  if (!vals) return null;
  const H = Math.max(height, 10); // below 10m → use 10m value
  const maxH = K2_HEIGHTS[K2_HEIGHTS.length - 1];
  if (H >= maxH) return vals[vals.length - 1];

  for (let i = 0; i < K2_HEIGHTS.length - 1; i++) {
    if (H >= K2_HEIGHTS[i] && H <= K2_HEIGHTS[i + 1]) {
      return linearInterpolate(H, K2_HEIGHTS[i], K2_HEIGHTS[i + 1], vals[i], vals[i + 1]);
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
export function calculateWindLoad(inp) {
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
  const vb = CITY_VB.find(c => c.city === city)?.vb ?? null;

  const k1 = getK1(designLife, structureType);
  const k1Invalid = k1 === null;

  const k2Auto = getK2(H, terrainCategory);
  const k2 = (k2Custom !== undefined && k2Custom !== null && String(k2Custom).trim() !== '') ? parseFloat(k2Custom) : k2Auto;

  const k3 = k3Type === 'flat' ? 1.0 : (parseFloat(k3Custom) || 1.0);
  const k4 = k4Type === 'normal' ? 1.0 : 1.15;

  const vz = vb != null && !k1Invalid ? +(vb * k1 * k2 * k3 * k4).toFixed(3) : null;
  const pz = vz != null ? +(0.6 * vz * vz / 1000).toFixed(4) : null;

  // Ka
  const area = W * L;
  const ka = getKa(area);

  // Kd
  const kdMap = {
    'rectangular': 0.9,
    'circular_polygon': 1.0,
    'lattice_chimney': 1.0,
  };
  const kdVal = kdMap[kd] ?? 0.9;

  // Kc
  const kcMap = { '1': 1.0, '2': 0.9, '3plus': 0.8 };
  const kcVal = kcMap[kcType] ?? 1.0;

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
    { name: 'Wall A (Windward Long)', cpe: parseFloat(cpeA) || 0 },
    { name: 'Wall B (Leeward Long)', cpe: parseFloat(cpeB) || 0 },
    { name: 'Wall C (Windward Short)', cpe: parseFloat(cpeC) || 0 },
    { name: 'Wall D (Leeward Short)', cpe: parseFloat(cpeD) || 0 },
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
