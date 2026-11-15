<!-- SI-ASSISTED: generated with Claude Code (Anthropic); reviewed by the team. -->
# Space Apps project page: ready-to-paste text

Paste each block into the matching field on the Space Apps project page.

---

## Project name

Has Bean Planned: San Mateo, Isabela

## High-level summary (about 150 words)

Has Bean Planned helps rice farmers in San Mateo, Isabela, Philippines choose what to plant after the wet-season harvest. It compares fallow, mungbean, corn and peanut, including the current rotation. Each option shows its reasons, evidence, benefits, gaps, risks and pest-cycle notes, ranked by the farmer's own priorities, with its uncertainty stated. NASA POWER daily climate data drives a water balance and a water-stress yield estimate, using FAO-56 and FAO-33 methods. Prices and costs are editable and labelled with their data status. Past seasons summarise what has happened, not what will happen. Has Bean Planned supports, and does not replace, farmer and expert judgement. NASA POWER is a gridded estimate, not a weather station.

## Project details

Has Bean Planned is a web application for farmers, cooperatives and local extension staff in San Mateo, Isabela. The problem is that dry-season choices after rice involve uncertain water, uncertain prices and up-front costs. El Niño conditions expected in the 2026-27 season make this harder.

The app compares fallow, mungbean, corn and peanut side by side. It lets users set field details and rank their priorities, and it shows a ranked list of options with plain-language reasons. Current features include the Compare view, the ranked option cards, uncertainty lines per card, editable prices and costs with status badges, and reset.

Features in progress include what-if sliders, a season calendar showing bare-field and vulnerable months, past-season replay and trend charts, a full uncertainty panel, a community tab, and a Data and methods tab with a glossary.

Status and limitations are stated openly in the app. Past seasons are not forecasts. Economic values are illustrative where marked. There is no pest or disease model, no groundwater or capillary rise, and the model has not yet been validated against field records.

Live app: https://hasbeanplanned.netlify.app
Demo video: [LINK]
Source code: https://github.com/IceNFireBoy/NASA-Challenge-2026-Field-Shift

## Use of NASA data

- **NASA POWER** (daily gridded meteorological data, including rainfall in the current build) is the main climate input. It is used to build a daily soil-water balance and to replay past seasons.
- **GPM IMERG V07** (satellite-gauge precipitation, monthly, 0.1 degree) is the rainfall source for all 24 dry seasons, retrieved as an area-averaged time series through NASA Giovanni. NASA POWER rainfall is kept for a side-by-side comparison chart.

Links: https://power.larc.nasa.gov/ and https://gpm.nasa.gov/data/imerg

## Space agency partner and other data

- **Space agency partner:** NASA
- **Other data:**
  - NOAA Oceanic Niño Index (ONI), for El Niño context: https://www.cpc.ncep.noaa.gov/products/analysis_monitoring/ensostuff/ONI_v5.php
  - FAO-56 and FAO-33 methods for crop water use and yield response (see references)
  - Philippine Statistics Authority, DOST-PCAARRD and PhilRice, for local crop facts [ADD SPECIFIC SOURCE]
  - The Manila Times, for local reporting on the 2026-27 outlook [ADD SPECIFIC ARTICLE LINK]

## References

1. NASA POWER Project. https://power.larc.nasa.gov/
2. Huffman, G. J., et al. GPM IMERG Final Precipitation L3 1 month 0.1 degree V07 (GPM_3IMERGM). https://gpm.nasa.gov/data/imerg. DOI: 10.5067/GPM/IMERG/3B-MONTH/07
3. NOAA Climate Prediction Center. Oceanic Niño Index. https://www.cpc.ncep.noaa.gov/products/analysis_monitoring/ensostuff/ONI_v5.php
4. Allen, R. G., Pereira, L. S., Raes, D., Smith, M. (1998). Crop evapotranspiration: Guidelines for computing crop water requirements. FAO Irrigation and Drainage Paper 56.
5. Doorenbos, J., and Kassam, A. H. (1979). Yield response to water. FAO Irrigation and Drainage Paper 33.
6. Philippine Statistics Authority. [ADD SPECIFIC PUBLICATION]
7. DOST-PCAARRD. [ADD SPECIFIC PUBLICATION]
8. PhilRice. [ADD SPECIFIC PUBLICATION]
9. The Manila Times. [ADD SPECIFIC ARTICLE, DATE AND URL]

## Use of SI tools

This project used AI tools. Claude (claude.ai, by Anthropic) was used for research, verification, drafting of the core data pipeline and calculation engine, and this documentation. Claude Code (by Anthropic) was used for the user interface, documentation and deployment. Gemini (by Google) was used for an early literature summary, as a secondary reference only. No image or video generation tools were used.

Every source file generated with AI assistance is marked with an SI-ASSISTED comment at the top. The team reviewed and tested the code. All numbers come from cited data or from user input, not from AI output. Full details: [LINK TO SI_DISCLOSURE.md]
