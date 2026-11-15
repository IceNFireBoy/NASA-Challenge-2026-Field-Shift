<!-- SI-ASSISTED: generated with Claude Code (Anthropic); reviewed by the team. -->
# QA: challenge item -> where in the app -> status

Checked by code reading and a dev-browser pass (no console errors). Phone width not yet verified.

| Challenge item | Where | Status |
|---|---|---|
| NASA data used | NASA POWER (temperature, rain, root-zone wetness); Data & methods, footer | Done. GPM IMERG was attempted and failed (gateway timeout); rainfall is POWER and the app says so |
| Local soil | Field form (loam / heavy clay); clay blocks peanut | Done (two soil types only) |
| Crop characteristics | Data & methods parameter table; why cards | Done; several values are Assumption/Illustrative and badged |
| Farmer priorities | Priority sliders | Done |
| Constraints (water, labour, prices) | Water access, labour cap, editable Prices and costs | Done; prices/costs are illustrative until replaced |
| 3+ strategies incl. existing | Four options; "Your current rotation" selector | Done (current rotation is assumed, user confirms) |
| Why / evidence / benefits / gaps / risks | "Why this result" on each card | Done |
| Bare-field periods | Season calendar tab | Done |
| Vulnerable seasons | Season calendar (water stress, heat months) | Done |
| Pest-cycle disruption | Pest cycle section of each why card | Done as notes; no pest model |
| Reduce water demand | Water need met and irrigation mm on cards | Done |
| Infiltration / erosion (ground cover) | Cover score and cover criterion | Partly: a score, not a measured infiltration model |
| Supplemental income | Net PHP/ha, economics panel | Done (illustrative economics) |
| Uncertainty | Uncertainty panel and card lines (300 runs) | Done |
| Where human judgement matters | Notice, "Check locally", close-call note | Done |
| Plain-language terms (ET, soil moisture anomaly, NDVI, frost, water balance) | Glossary in Data & methods | Done; NDVI and frost are explained but not used |
| Satellite vs ground data | Glossary; IMERG-vs-POWER toggle (disabled, no IMERG data) | Partly: explained, comparison chart unavailable |
| Harmonised resolution | Data & methods "Harmonising data" | Done (explained; one point, monthly) |
| Scenario sliders | Rainfall change, warmer by | Done |
| Supports-not-replaces framing | Persistent notice, footer, limitations | Done |
| SI labelling | First-line comment in source files; SI_DISCLOSURE.md | Done |
| No NASA logos | Text only, hand-made SVG | Done |

## Open items
- Phone-width check by a human.
- IMERG rainfall (optional; retry only if asked).
- Replace README/project-page placeholders: demo link, team, source-code link; verify the IMERG DOI.
- No field validation; one grid point; past seasons are not forecasts.
