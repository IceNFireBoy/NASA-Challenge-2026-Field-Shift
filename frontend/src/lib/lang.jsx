// SI-ASSISTED: generated with Claude Code (Anthropic); reviewed by the team.
// Filipino labels for the main controls and card headings of the Analytics and Community view
// (Phase 5 stretch 1). English stays the default; anything not listed here stays in English.
// The Filipino text was drafted with SI and must be checked by a native speaker on the team.
import { createContext, useContext } from 'react';

export const ANALYTICS_FIL = {
  // tabs
  'Compare': 'Paghahambing',
  'Season calendar': 'Kalendaryo ng panahon',
  'Past seasons': 'Mga nakaraang panahon',
  'Plan together': 'Sama-samang plano',
  'Data & methods': 'Datos at pamamaraan',
  // header and notices
  'Compare dry-season options after rice using NASA climate data, crop science and your priorities.': 'Ihambing ang mga pagpipilian sa tag-araw pagkatapos ng palay gamit ang datos ng klima ng NASA, agham ng pananim at ang iyong mga prayoridad.',
  'Reset all settings': 'I-reset ang lahat ng setting',
  'Decision support only.': 'Gabay lamang sa pagpapasya.',
  'This tool highlights patterns in past NASA data to support, not replace, your judgement and local experts.': 'Ipinapakita ng tool na ito ang mga padron sa nakaraang datos ng NASA upang tumulong, hindi pumalit, sa iyong pagpapasya at sa mga lokal na eksperto.',
  'Main labels are in Filipino; details, sources and numbers stay in English.': 'Ang mga pangunahing label ay nasa Filipino; nasa Ingles pa ang mga detalye, sanggunian at paliwanag.',
  // compare: field
  'Step 1. Your field': 'Hakbang 1. Ang bukid mo',
  'Field situation': 'Kalagayan ng bukid',
  'Soil': 'Lupa',
  'Water access': 'Patubig',
  'Rainfed only': 'Ulan lang',
  'Can irrigate': 'May patubig',
  'Planting date': 'Petsa ng tanim',
  'Your current rotation: assumed, please confirm': 'Kasalukuyan mong tanim: palagay lamang, pakikumpirma',
  'Labour available (man-days per ha)': 'Lakas-paggawa (araw-tao bawat ektarya)',
  // compare: priorities
  'Step 2. Your priorities': 'Hakbang 2. Mga prayoridad mo',
  'Reset': 'I-reset',
  'Move a slider up for what matters more. Shares always add up to 100%.': 'Itaas ang slider ng mas mahalaga sa iyo. Laging 100% ang kabuuan.',
  'Drought safety': 'Ligtas sa tagtuyot',
  'Soil health & nitrogen': 'Kalusugan ng lupa at nitroheno',
  'Ground cover': 'Takip sa lupa',
  'Income': 'Kita',
  'Low labour': 'Kaunting trabaho',
  'Forage value': 'Pakain sa hayop',
  // compare: scenario
  'Step 3. Scenario': 'Hakbang 3. Senaryo',
  'Scenarios summarise past seasons; they are not forecasts.': 'Buod ng mga nakaraang panahon ang mga senaryo; hindi ito forecast.',
  'What if?': 'Paano kung?',
  'Rainfall change': 'Pagbabago ng ulan',
  'Warmer by': 'Mas mainit nang',
  // compare: results
  'Results': 'Resulta',
  'How sure is the top choice?': 'Gaano kasigurado ang nangunguna?',
  'Close call: local judgement matters most here.': 'Dikit ang resulta: pinakamahalaga rito ang lokal na pagpapasya.',
  'Water need met': 'Natugunang tubig',
  'Net per ha': 'Netong kita bawat ektarya',
  'Labour': 'Trabaho',
  'Harvest': 'Ani',
  'Why this result': 'Bakit ganito ang resulta',
  'Hide why': 'Itago ang paliwanag',
  'Blocked': 'Hindi maaari',
  'Your current rotation': 'Kasalukuyan mong tanim',
  'Prices and costs (editable)': 'Presyo at gastos (maaaring baguhin)',
  'Reset to defaults': 'Ibalik sa dati',
  // other tabs
  'Season calendar: bare fields and vulnerable months': 'Kalendaryo ng panahon: nakatiwangwang na bukid at mga delikadong buwan',
  'Long-term trend': 'Pangmatagalang takbo',
  'dry seasons': 'tag-araw',
  'Replay: every past season with your settings': 'Balik-tanaw: bawat nakaraang panahon gamit ang iyong mga setting',
  'Monthly rain vs crop water demand (mm)': 'Buwanang ulan laban sa kailangang tubig ng pananim (mm)',
  'Past seasons show what happened; they are not forecasts of 2026-27.': 'Ipinapakita ng mga nakaraang panahon ang nangyari; hindi ito forecast para sa 2026-27.',
  'Illustrative scenario, not an LGU plan.': 'Halimbawang senaryo lamang, hindi plano ng LGU.',
  'Hectares in the cooperative': 'Ektarya ng kooperatiba',
  'Share adopting (%)': 'Bahaging sasali (%)',
  'Crop': 'Pananim',
  'Seed needed': 'Kailangang binhi',
  'Total labour': 'Kabuuang trabaho',
  'Extra water if irrigating': 'Dagdag na tubig kung may patubig',
  'Coordination prompt': 'Paalala sa koordinasyon',
  'Who to involve': 'Sino ang dapat isali',
  'Farmer Q&A (coming soon)': 'Tanong at Sagot ng Magsasaka (malapit na)',
  'Ask a question (coming soon)': 'Magtanong (malapit na)',
  'Data sources': 'Pinagmulan ng datos',
  'How it works, in plain words': 'Paano ito gumagana, sa simpleng salita',
  'Parameters and their status': 'Mga parameter at ang kalagayan nito',
  'Glossary': 'Talahulugan',
  'Limitations': 'Mga limitasyon',
  'Farmer view rules': 'Mga panuntunan sa tanaw ng Magsasaka',
  'This tool supports, not replaces, farmer and expert judgement.': 'Tumutulong ang tool na ito, hindi pumapalit, sa pagpapasya ng magsasaka at eksperto.',
  'Where the data comes from': 'Saan galing ang datos',
  'Vegetation greenness from satellite (NDVI)': 'Pagkaluntian ng tanim mula sa satellite (NDVI)',
};

export const makeTr = (lang) => (lang === 'fil' ? (s) => ANALYTICS_FIL[s] ?? s : (s) => s);
export const TrContext = createContext((s) => s);
export const useTr = () => useContext(TrContext);
