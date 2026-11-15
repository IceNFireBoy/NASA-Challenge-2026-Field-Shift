// SI-ASSISTED: drafted by Claude (Anthropic, claude.ai); facts checked against the listed sources by the team.
// Plain-language text for the "why" cards, glossary and references. Keep claims tied to SOURCES ids.
import { formatPhp, SEASON_MONTHS, topReasons } from './engine.js';

export const SOURCES = {
  power: { label: 'NASA POWER (daily agroclimatology)', url: 'https://power.larc.nasa.gov/' },
  imerg: { label: 'GPM IMERG Final monthly V07, doi:10.5067/GPM/IMERG/3B-MONTH/07', url: 'https://doi.org/10.5067/GPM/IMERG/3B-MONTH/07' },
  oni: { label: 'NOAA CPC Oceanic Nino Index (ONI v5)', url: 'https://www.cpc.ncep.noaa.gov/products/analysis_monitoring/enso/oni/v5/' },
  fao56: { label: 'FAO Irrigation & Drainage Paper 56 (Allen et al., 1998)', url: 'https://www.fao.org/4/x0490e/x0490e00.htm' },
  fao33: { label: 'FAO Irrigation & Drainage Paper 33 Ky values (via FAO I&D Paper 66)', url: 'https://www.fao.org/4/i2800e/i2800e02.pdf' },
  pcaarrd: { label: 'DOST-PCAARRD: Isabela town celebrates Mungbean Fiesta', url: 'https://newport.pcaarrd.dost.gov.ph/index.php/quick-information-dispatch-qid-articles/isabela-town-celebrates-mungbean-fiesta' },
  manilatimes: { label: 'Manila Times (2021): Isabela town benefits from mungbean', url: 'https://www.manilatimes.net/2021/04/08/business/agribusiness/isabela-town-benefits-from-mungbean/861138' },
  philrice: { label: 'PhilRice Isabela R&D Highlights 2021 (rice-rice-mungbean and rice-rice-corn)', url: 'https://www.philrice.gov.ph/wp-content/uploads/2023/08/RD-highlights_Isabela-Aug_2023.pdf' },
  pagasa: { label: 'PAGASA via news reports, 5 Nov 2026: very strong El Nino, impacts into mid-2027', url: 'https://asianews.network/very-strong-el-nino-now-active-in-tropical-pacific-says-philippine-state-weather-bureau/' },
  psa: { label: 'PSA farmgate price releases (regional, 2023-2025)', url: 'https://openstat.psa.gov.ph/Database/Prices/Farmgate-Prices' },
};

const pct = (x) => `${Math.round(100 * x)}%`;
const mm = (x) => `${Math.round(x)} mm`;

export function dateOfDay(day) {
  // Day 0 = Dec 1. Late plantings finish after May 31, so the calendar runs on through Jun-Aug.
  const months = [...SEASON_MONTHS, 'Jun', 'Jul', 'Aug'];
  const days = [31, 31, 28, 31, 30, 31, 30, 31, 31];
  let d = day;
  for (let i = 0; i < days.length; i += 1) {
    if (d < days[i]) return `${months[i]} ${d + 1}`;
    d -= days[i];
  }
  return `Sep ${d + 1}`;
}

export function whySuggested(r, rankCount) {
  if (r.blocked) return 'Not ranked: a hard constraint rules it out for your field.';
  const reasons = topReasons(r);
  const lead = r.rank === 1 ? 'Ranks first for the priorities you set' : `Ranks ${r.rank} of ${rankCount} for the priorities you set`;
  if (!reasons.length) return `${lead}.`;
  return `${lead}, mostly from ${reasons.map((x) => `${x.label.toLowerCase()} (${Math.round(x.points)} pts)`).join(' and ')}.`;
}

export function buildWhyCard(r, { waterMode, scenarioLabel, rainSource, soilLabel, rankCount }) {
  const src = rainSource === 'imerg' ? 'GPM IMERG satellite rainfall' : 'NASA POWER rainfall';
  const card = { why: whySuggested(r, rankCount), evidence: [], benefits: [], gaps: [], risks: [], validate: [], pest: '' };
  card.gaps.push(
    'One point (San Mateo town centre); your field may differ.',
    'NASA POWER is a gridded estimate (~50 km), not a weather station; IMERG averages ~11 km cells.',
    'Soil type is your selection, not a BSWM soil-map lookup.',
    'Scenarios summarise past seasons; they are not a forecast of 2026-27.',
  );
  if (r.fallow) {
    card.evidence.push(
      'No crop, so no crop water use and no harvest in Dec-May.',
      'Many Isabela rice fields stay idle in summer while waiting for irrigation water (San Mateo mayor, Manila Times 2021).',
    );
    card.benefits.push('No input cost or crop-failure risk in a dry year.', 'Least labour.');
    card.risks.push('No dry-season income.', 'Bare soil for about six months: crusting, erosion when rains return, weeds.', 'No nitrogen added for the next rice crop.');
    card.validate.push('Is your field really idle in the dry season, or already in rice-rice or rice-mungbean?');
    card.pest = 'Breaks the rice crop sequence, but volunteer rice and weeds can still host rice pests. Verify locally.';
    return card;
  }
  if (r.blocked) {
    card.risks.push(r.crop.blockReason);
    card.validate.push('If your field actually drains well, switch the soil setting and compare again.');
  }
  card.evidence.push(
    `Planted ${dateOfDay(r.start)}, harvested about ${dateOfDay(r.end)} (${r.crop.duration} days).`,
    `Crop water need ${mm(r.etc)} (FAO-56 crop coefficients x reference ET from NASA POWER temperatures).`,
    `Supply: ${mm(r.peff)} effective rain (${src}) + ${mm(r.storedWater)} stored soil water = ${pct(r.pctMet)} of need under ${scenarioLabel}.`,
  );
  if (waterMode === 'irrigated') {
    card.evidence.push(`Irrigation needed: about ${mm(r.irrigationMm)} of pumped water (${formatPhp(r.irrigationCost)}/ha, illustrative cost).`);
  } else {
    card.evidence.push(`Expected yield loss from water stress: ${pct(r.yieldLoss)} (FAO-33 yield response factor Ky = ${r.crop.kyv.toFixed(2)}).`);
  }
  card.evidence.push(`Net return ${formatPhp(r.net)}/ha with the prices and costs shown (edit them to match your market).`);
  if (r.hotFlowerDays >= 0.5) card.evidence.push(`About ${r.hotFlowerDays.toFixed(1)} days at 35 C or hotter expected during flowering.`);

  if (r.id === 'rice_mungbean') {
    card.evidence.push('San Mateo is known as the Munggo Capital; at least 7,000 ha of its rice land are rotated with mungbean (Manila Times 2021).', 'Local yields of 800-1,000 kg/ha are reported (DOST-PCAARRD).');
    card.benefits.push('Fixes 21-85 kg N/ha per cycle, cutting urea needs for the next rice crop.', 'Shortest crop here (60-80 days), so it can finish before the hottest, driest weeks.', 'Lowest water need of the three crops.');
    card.risks.push('Rain during pod drying can rot pods; hand-picking in several rounds adds labour.', 'Bean fly and pod borers in warm spells.');
    card.validate.push('Seed variety and local planting window with the Philippine Mungbean Center (ISU San Mateo) or the Municipal Agriculture Office.', 'Your actual farmgate price this season.');
    card.pest = 'Not a grass, so it interrupts rice-specific pests such as stem borers and planthoppers. It has its own pests; scout regularly.';
    card.gaps.push('Nitrogen benefit varies widely (21-85 kg/ha) with inoculation and soil.');
  }
  if (r.id === 'rice_corn') {
    card.evidence.push('PhilRice Isabela has studied the profitability of rice-rice-corn alongside rice-rice-mungbean (PhilRice R&D Highlights 2021).');
    card.benefits.push('Large, established market for yellow corn as feed.', 'Stover can feed livestock.');
    card.risks.push('Highest water need and the most sensitive yield response to drought here (Ky 1.25).', 'High cash outlay for hybrid seed and fertiliser; losses are larger in a dry year.', 'Removes nitrogen and adds none.');
    card.validate.push('Whether pump or canal water is available through April.', 'Buyer and drying capacity near you.');
    card.pest = 'Corn and rice are both grasses, so some pests and diseases can carry over (armyworms, for example). The pest break is partial. Verify locally.';
    card.gaps.push('Corn duration and production cost are assumptions, not from our sources.');
  }
  if (r.id === 'rice_peanut') {
    card.benefits.push('Legume: adds nitrogen (amount not quantified in our sources).', 'Least sensitive yield response to water stress here (Ky 0.70).', 'Haulms are a good feed.');
    card.risks.push('Very labour-intensive: manual extraction and threshing alone take 15-23 man-days/ha.', 'Needs friable, well-drained soil; waterlogging and hard clay cut pod recovery.', 'Pods must dry well after harvest to avoid aflatoxin.');
    card.validate.push('Soil drainage of your specific field.', 'Labour availability at harvest.');
    card.pest = 'Not a grass, so it interrupts rice-specific pests. Watch for leaf spot and rust.';
    card.gaps.push('No San Mateo peanut yield data in our sources; yield and cost are illustrative.');
  }
  if (r.heatFlag) card.risks.push('Hot spell likely during flowering, when flowers and pods are most sensitive to heat.');
  if (r.overlapsWetSeason) card.risks.push('Harvest falls after May 31 and may clash with wet-season rice land preparation.');
  if (r.yieldLoss >= 0.4 && waterMode !== 'irrigated') card.risks.push(`Under ${scenarioLabel} without irrigation, rain and stored water cover only ${pct(r.pctMet)} of need.`);
  card.gaps.push(`Soil: ${soilLabel}. Root depth and starting soil water are model assumptions.`);
  return card;
}

export const GLOSSARY = [
  { term: 'Evapotranspiration (ET)', text: 'Water that leaves a field as vapour, from the soil (evaporation) and through the leaves (transpiration). It is how much water a crop uses.' },
  { term: 'Reference ET (ET0)', text: 'How much water a short, well-watered grass would use in this weather. We estimate it from NASA POWER temperatures with the Hargreaves formula.' },
  { term: 'Crop coefficient (Kc)', text: 'Multiplier that turns ET0 into a specific crop\'s water need at each growth stage (FAO-56).' },
  { term: 'Effective rainfall', text: 'The part of rainfall that soaks into the root zone and the crop can use, after runoff and deep drainage.' },
  { term: 'Root-zone soil wetness', text: 'NASA POWER index from 0 (dry) to 1 (saturated) for the top 1 m of soil, from the MERRA-2 model. We compare each scenario with the typical year (a soil-moisture anomaly).' },
  { term: 'Yield response factor (Ky)', text: 'How strongly yield drops when the crop gets less water than it needs (FAO-33). Above 1 means very sensitive.' },
  { term: 'El Nino and ONI', text: 'El Nino warms the central Pacific and usually brings drier dry seasons to the Philippines. NOAA\'s Oceanic Nino Index (ONI) measures its strength.' },
  { term: 'NDVI', text: 'A satellite greenness index from 0 to 1; higher means denser green plants. The Past seasons tab shows MODIS NDVI for one 250 m pixel at the town centre as a check on when land is green or bare. The crop model and the rankings do not use it.' },
  { term: 'Frost risk', text: 'Not a factor in lowland Isabela. The challenge lists it; we show it here so its absence is a stated finding, not an omission.' },
  { term: 'Satellite vs ground data', text: 'Satellites and models cover every field, every month, but blur detail over kilometres. Ground stations are precise but sparse. Combining them (as IMERG does with rain gauges) gives the best of both; local records should still check our numbers.' },
];

export const SOIL_HEALTH_PRIMER = [
  { title: 'Nitrogen-fixing crops', text: 'Legumes such as mungbean and peanut host bacteria that turn air nitrogen into plant food, leaving some for the next crop.' },
  { title: 'Cover crops', text: 'Any living crop shields soil from sun and heavy rain, keeps it from crusting and helps water soak in.' },
  { title: 'Deep-rooting crops', text: 'Roots that go deeper (corn more than mungbean) reach stored water and can help break compacted layers.' },
  { title: 'Drought-tolerant crops', text: 'Crops with a low Ky (like peanut) lose less yield when water runs short.' },
];
