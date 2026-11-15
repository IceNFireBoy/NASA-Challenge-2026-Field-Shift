// SI-ASSISTED: drafted by Claude (Anthropic, claude.ai); values and sources reviewed by the team.
// Every number carries a status so the UI can badge it:
//   sourced        - from a cited publication (FAO, PSA, DOST, team reference)
//   local-sourced  - a San Mateo / Isabela figure from a cited source
//   secondary      - from an SI-assisted literature summary (team PDF) that cites a primary source; verify
//   assumption     - our modelling choice, stated openly
//   illustrative   - placeholder for the demo; replace with local data (UI lets users edit it)

export const STATUS_LABELS = {
  sourced: 'Sourced',
  'local-sourced': 'Local source',
  secondary: 'Secondary source',
  assumption: 'Assumption',
  illustrative: 'Illustrative',
};

export const SOILS = {
  loam: {
    id: 'loam',
    label: 'Friable loam (drains well)',
    drainage: 'good',
    tawPerM: { value: 0.155, range: [0.13, 0.18], status: 'sourced', source: 'FAO-56 Table 19, loam: available water 0.13-0.18 m3/m3' },
  },
  clay: {
    id: 'clay',
    label: 'Heavy clay (drains poorly)',
    drainage: 'poor',
    tawPerM: { value: 0.16, range: [0.12, 0.2], status: 'sourced', source: 'FAO-56 Table 19, clay: available water 0.12-0.20 m3/m3' },
  },
};

// Which dry-season slot the field is in. Sets the default planting date and how much
// plant-available water is left in the root zone at planting (then scaled by the scenario's
// NASA POWER root-zone wetness relative to the typical year).
export const FIELD_SITUATIONS = {
  after_wet_rice: {
    id: 'after_wet_rice',
    label: 'After wet-season rice (no dry-season rice crop)',
    hint: 'Rice harvested Oct-Nov; the field would otherwise sit idle until the rains.',
    defaultPlanting: 'dec15',
    initialFraction: { value: 0.6, range: [0.4, 0.8], status: 'assumption', note: 'Paddy has drained for several weeks after harvest.' },
  },
  after_dry_rice: {
    id: 'after_dry_rice',
    label: 'After irrigated dry-season rice (summer slot)',
    hint: 'Rice harvested Feb-Mar; the San Mateo rice-rice-mungbean pattern fits here.',
    defaultPlanting: 'mar15',
    initialFraction: { value: 0.85, range: [0.7, 1.0], status: 'assumption', note: 'Paddy was flooded until shortly before harvest.' },
  },
};

export const MODEL = {
  stages: {
    value: { ini: 0.18, dev: 0.27, mid: 0.35, late: 0.2 }, status: 'assumption',
    note: 'Growth-stage proportions in the style of FAO-56 Table 11, applied to every crop.',
  },
  flowerFrac: { value: 0.25, status: 'assumption', note: 'Flowering/pod-set window = first 25% of the mid-season stage onward.' },
  heatFlagDays: { value: 3, status: 'assumption', note: 'Flag when 3 or more Tmax >= 35 C days are expected during flowering.' },
};

export const IRRIGATION = {
  efficiency: { value: 0.7, status: 'assumption', note: 'Share of pumped water the crop actually uses.' },
  costPhpPerMm: { value: 30, status: 'illustrative', note: 'Pumping cost per mm of water per hectare (10 m3). Replace with local fuel and pump data.' },
};

const STAGES_NOTE = 'FAO-56 Table 12 single crop coefficients';

export const CROPS = {
  rice_fallow: {
    id: 'rice_fallow',
    name: 'Rice, then dry-season fallow',
    short: 'Fallow',
    isFallow: true,
    family: 'none (field left idle)',
    soilTier: { value: 50, status: 'assumption', note: 'No nitrogen added; stubble and weeds give partial cover; organic-matter loss not modelled.' },
    forageTier: { value: 20, status: 'assumption', note: 'Stubble and weeds for grazing only.' },
    laborMdHa: { value: 2, status: 'assumption', note: 'Basic field upkeep.' },
    nFixed: { text: '0 kg N/ha (no legume)', status: 'sourced' },
    econ: {
      yieldKgHa: { value: 0, status: 'assumption' },
      pricePhpKg: { value: 0, status: 'assumption' },
      costPhpHa: { value: 0, status: 'assumption' },
    },
    seedRateKgHa: { value: 0, status: 'assumption' },
    blockOnClay: false,
  },
  rice_mungbean: {
    id: 'rice_mungbean',
    name: 'Rice, then mungbean (munggo)',
    short: 'Mungbean',
    family: 'legume (Fabaceae)',
    durationDays: { value: 70, range: [60, 80], status: 'secondary', source: 'SI-assisted literature summary (team PDF) citing a Philippine cropping calendar: 60-80 days; verify with the DA mungbean production guide' },
    kc: { ini: 0.4, mid: 1.05, end: 0.35, status: 'sourced', source: `${STAGES_NOTE}, green gram (mungbean): mid 1.05, end 0.35 when harvested dry; legumes ini 0.40` },
    rootDepthM: { value: 0.6, range: [0.6, 0.9], status: 'sourced', source: 'FAO-56 Table 22 (beans) low end; paddy plough pans limit rooting (assumption)' },
    ky: { value: 1.15, range: [1.0, 1.25], status: 'sourced', source: 'FAO-33 seasonal Ky for beans, used as a proxy for mungbean' },
    soilTier: { value: 90, status: 'assumption', note: 'Legume; fixes 21-85 kg N/ha per cycle (sourced range).' },
    forageTier: { value: 50, status: 'assumption', note: 'Residues usually incorporated into the soil.' },
    laborMdHa: { value: 25, range: [20, 35], status: 'assumption', note: 'Moderate labour; harvesting by repeated hand-picking (priming) adds work.' },
    nFixed: { text: '21-85 kg N/ha per cycle', range: [21, 85], status: 'secondary', source: 'SI-assisted literature summary (team PDF) citing a field evaluation of N2 fixation by mungbean in the Philippines (OSTI ETDEWEB 634524)' },
    econ: {
      yieldKgHa: { value: 900, range: [800, 1000], status: 'local-sourced', source: 'DOST-PCAARRD: San Mateo produces 800-1,000 kg/ha' },
      pricePhpKg: { value: 60, status: 'illustrative', source: 'PSA regional farmgate releases put mongo near ₱60+/kg (e.g., ₱62.80, Biliran Q1 2024); replace with the Cagayan Valley value from PSA OpenSTAT' },
      costPhpHa: { value: 25000, status: 'illustrative', source: 'Placeholder production cost; replace with PSA costs-and-returns or local data' },
    },
    seedRateKgHa: { value: 25, status: 'illustrative', source: 'Verify with DA-RFO2 / Philippine Mungbean Center (ISU San Mateo)' },
    blockOnClay: false,
  },
  rice_corn: {
    id: 'rice_corn',
    name: 'Rice, then yellow corn',
    short: 'Corn',
    family: 'grass (Poaceae), same family as rice',
    durationDays: { value: 105, range: [95, 115], status: 'assumption', source: 'Typical hybrid yellow corn; not in team sources' },
    kc: { ini: 0.3, mid: 1.2, end: 0.35, status: 'sourced', source: `${STAGES_NOTE}, maize (grain): ini 0.30, mid 1.20, end 0.35 when harvested dry` },
    rootDepthM: { value: 1.0, range: [1.0, 1.7], status: 'sourced', source: 'FAO-56 Table 22 (maize) low end; paddy plough pans limit rooting (assumption)' },
    ky: { value: 1.25, range: [1.1, 1.4], status: 'sourced', source: 'FAO-33 seasonal Ky for maize' },
    soilTier: { value: 20, status: 'assumption', note: 'Cereal after cereal; removes nitrogen and does not add any.' },
    forageTier: { value: 80, status: 'assumption', note: 'Stover is a common feed.' },
    laborMdHa: { value: 32, range: [25, 40], status: 'assumption', note: 'Moderate labour.' },
    nFixed: { text: 'none; removes soil N', status: 'sourced' },
    econ: {
      yieldKgHa: { value: 5000, range: [4000, 6000], status: 'illustrative', source: 'Placeholder hybrid yellow-corn yield; replace with PSA Isabela data' },
      pricePhpKg: { value: 18.14, range: [16, 19], status: 'sourced', source: 'PSA Central Luzon Q1 2023 farmgate price for yellow corn: ₱18.14/kg. A different region and year from San Mateo today; replace with the Cagayan Valley value from PSA OpenSTAT' },
      costPhpHa: { value: 60000, status: 'illustrative', source: 'Placeholder production cost; replace with PSA costs-and-returns or local data' },
    },
    seedRateKgHa: { value: 18, status: 'illustrative', source: 'Verify with seed suppliers / DA-RFO2' },
    blockOnClay: false,
  },
  rice_peanut: {
    id: 'rice_peanut',
    name: 'Rice, then peanut',
    short: 'Peanut',
    family: 'legume (Fabaceae)',
    durationDays: { value: 105, range: [90, 120], status: 'secondary', source: 'SI-assisted literature summary (team PDF) citing UPL Pn peanut varieties: 90-120 days' },
    kc: { ini: 0.4, mid: 1.15, end: 0.6, status: 'sourced', source: `${STAGES_NOTE}, groundnut: mid 1.15, end 0.60; legumes ini 0.40` },
    rootDepthM: { value: 0.5, range: [0.5, 1.0], status: 'sourced', source: 'FAO-56 Table 22 (groundnut) low end; paddy plough pans limit rooting (assumption)' },
    ky: { value: 0.7, range: [0.6, 0.85], status: 'sourced', source: 'FAO-33 seasonal Ky for groundnuts' },
    soilTier: { value: 80, status: 'assumption', note: 'Legume; fixes nitrogen (no kg/ha figure in our sources).' },
    forageTier: { value: 70, status: 'assumption', note: 'Haulms are a valued feed.' },
    laborMdHa: { value: 44, range: [38, 52], status: 'assumption', note: '19 man-days/ha for manual extraction and threshing (midpoint of 15-23 from a 1998 Philippine peanut study, via the team PDF) plus 25 assumed for other work.' },
    nFixed: { text: 'fixes N; amount not quantified in our sources', status: 'sourced' },
    econ: {
      yieldKgHa: { value: 1200, range: [900, 1500], status: 'illustrative', source: 'Placeholder dry-pod yield; replace with PSA Isabela data' },
      pricePhpKg: { value: 58, range: [50, 65], status: 'sourced', source: 'PSA Central Luzon Q1 2023: dry peanut with shell ₱58.24/kg' },
      costPhpHa: { value: 45000, status: 'illustrative', source: 'Placeholder production cost; replace with PSA costs-and-returns or local data' },
    },
    seedRateKgHa: { value: 100, status: 'illustrative', source: 'Verify with DA-RFO2' },
    blockOnClay: true,
    blockReason: 'Blocked on heavy clay: peanut needs friable, well-drained soil for pegging and pod recovery, and it is sensitive to waterlogging.',
  },
};

export const ROTATION_IDS = ['rice_fallow', 'rice_mungbean', 'rice_corn', 'rice_peanut'];
export const DEFAULT_CURRENT = 'rice_fallow';
