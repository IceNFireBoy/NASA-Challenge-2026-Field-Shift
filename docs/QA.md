<!-- SI-ASSISTED: generated with Claude Code (Anthropic); reviewed by the team. -->
# QA: challenge item -> where in the app -> status

Checked by automated tests, a scripted pass over the live site at phone and desktop width (no console errors), and by the team on a phone.

| Challenge item | Where | Status |
|---|---|---|
| NASA data used | GPM IMERG (rainfall, via Giovanni CSV), NASA POWER (temperature, comparison rainfall, root-zone wetness), MODIS NDVI (Past seasons); Data & methods, footer | Done |
| Local soil | Farmer view soil question; field form (loam / heavy clay) with a SoilGrids hint; clay blocks peanut | Done (two soil types only) |
| Crop characteristics | Data & methods parameter table; why cards | Done; several values are Assumption/Illustrative and badged |
| Farmer priorities | Farmer view picture cards (pick up to 2); priority sliders in Compare | Done |
| Constraints (water, labour, prices) | Water access, labour cap, editable Prices and costs | Done; crop prices and legume costs are PSA figures, corn yield and cost and peanut yield are placeholders |
| 3+ strategies incl. existing | Four options; "Your current rotation" selector | Done (current rotation is assumed, user confirms) |
| Why / evidence / benefits / gaps / risks | "Why this result" on each card | Done |
| Bare-field periods | Season calendar tab | Done |
| Vulnerable seasons | Season calendar (water stress, heat months) | Done |
| Pest-cycle disruption | Pest cycle section of each why card | Done as notes; no pest model |
| Reduce water demand | Water need met and irrigation mm on cards | Done |
| Infiltration / erosion (ground cover) | Cover score and cover criterion | Partly: a score, not a measured infiltration model |
| Supplemental income | Net return per hectare, economics panel | Done (PSA prices; some costs and yields still placeholders) |
| Uncertainty | Uncertainty panel and card lines (300 runs) | Done |
| Where human judgement matters | Notice, "Check locally", close-call note | Done |
| Plain-language terms (ET, soil moisture anomaly, NDVI, frost, water balance) | Glossary in Data & methods | Done; NDVI is shown in Past seasons but not used by the model; frost is explained as not applicable |
| Satellite vs ground data | Glossary; IMERG-vs-POWER toggle in Past seasons (working) | Done |
| Harmonised resolution | Data & methods "Harmonising data" | Done (explained; one point, monthly) |
| Scenario sliders | Rainfall change, warmer by | Done |
| Supports-not-replaces framing | Persistent notice, footer, limitations | Done |
| SI labelling | First-line comment in source files; SI_DISCLOSURE.md | Done |
| No NASA logos | Text only, hand-made SVG | Done |

## Open items
- IMERG rainfall: done through a Giovanni CSV (`pipeline/data/imerg_giovanni.csv`).
- Add the demo video link to the README, demo script and project page.
- No field validation; one grid point; past seasons are not forecasts.
