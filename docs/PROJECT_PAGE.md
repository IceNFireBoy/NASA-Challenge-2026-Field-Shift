<!-- SI-ASSISTED: generated with Claude Code (Anthropic); reviewed by the team. -->
# Space Apps project page: ready-to-paste text

Paste each block into the matching field on the Space Apps project page.

---

## Project name

Has Bean Planned

## Team

NASApusomo: Marxus Magisa, Krizdarl Callo, Antonio Pasia, Kareena Macasiljig, Anica Begonia, Jonathan Serote

## High-level summary (about 150 words)

Has Bean Planned helps rice farmers decide what to do with their field in the dry season. A farmer answers five picture-card questions on a phone and gets one plain answer, in English or Filipino: the best fit among fallow, mungbean, corn and peanut, with three reasons and traffic lights for water, soil, income and work. An Analytics and Community view gives extension workers the full comparison, a season calendar, 24 past seasons replayed, and a cooperative planner. Rainfall comes from NASA GPM IMERG; temperature and soil wetness from NASA POWER; observed greenness from MODIS NDVI. FAO-56 and FAO-33 methods turn these into crop water need, yield loss and income, and 300 what-if runs show how sure the answer is. San Mateo, Isabela is our test-drive area; the design is meant to scale nationally. The tool supports, and does not replace, farmer and expert judgement. Past seasons are not forecasts.

## Project details

**The problem.** After the wet-season rice harvest a field can sit idle or carry a second crop. Each option needs water that may not come, a price that may not hold, and costs paid up front. A very strong El Niño was reported by PAGASA in November 2026, which makes the choice harder.

**What we built.** A web app with two views that share every setting.

- *Farmer view (default).* One question per screen with large picture cards, then a single answer card with plain reasons, a fit score, traffic lights that use marks and words as well as colour, how sure the answer is, what a dry El Niño year would change, and a "what if it rains less?" slider.
- *Analytics and Community view.* Compare (priority sliders, scenarios, ranked options with why-cards, editable prices), Season calendar (bare-field periods and vulnerable months), Past seasons (trends, a replay of all 24 dry seasons, IMERG against POWER rainfall, MODIS NDVI), Plan together (cooperative seed, labour and water planner), and Data & methods (sources, a grid-cell map, every parameter with its status, glossary, limitations).

**How it works.** Reference evapotranspiration from NASA POWER temperatures and FAO-56 crop coefficients give each crop's water need. Usable IMERG rain plus stored soil water give the supply. FAO-33 yield-response factors turn the shortfall into yield loss and income. Options are scored on six criteria weighted by the farmer's priorities, and the comparison is re-run 300 times with inputs varied inside stated ranges.

**What it found for San Mateo** (default settings, past seasons, not a forecast). Mungbean is the best fit in both a typical year and a strong El Niño year. In a strong El Niño year corn falls below leaving the field idle.

**Scaling.** San Mateo is the test-drive area. Every data source is global and fetched by coordinates, so the next step is a location picker, regional prices and more crops and languages.

**Limits, stated in the app.** One point is modelled; satellite and model grids are not rain gauges; crop prices are PSA figures for Cagayan Valley, while some yields and costs are still placeholders and badged as such; no pest or disease model; no field validation yet.

Live app: https://hasbeanplanned.netlify.app
Demo video: [LINK]
Source code: https://github.com/IceNFireBoy/NASA-Challenge-2026-Field-Shift

## Use of NASA data

- **GPM IMERG Final, monthly, V07 (GPM_3IMERGM)** is the rainfall the model runs on, for all 24 dry seasons from 2001-02 to 2024-25, retrieved as an area-averaged time series through NASA Giovanni.
- **NASA POWER** daily data supplies maximum and minimum temperature and root-zone soil wetness, and a second rainfall series shown beside IMERG for comparison.
- **MODIS MOD13Q1 v061 NDVI** (250 m, 16-day) shows observed greenness at the point as an independent check on when land is green or bare. The crop model does not use it.

Links: https://gpm.nasa.gov/data/imerg , https://power.larc.nasa.gov/ , https://doi.org/10.5067/MODIS/MOD13Q1.061

## Space agency partner and other data

- **Space agency partner:** NASA
- **Other data:**
  - NOAA CPC Oceanic Niño Index (ERSSTv6), to label El Niño and La Niña seasons: https://www.cpc.ncep.noaa.gov/products/analysis_monitoring/enso/oni/v6/
  - FAO Irrigation and Drainage Papers 56 and 33, for crop water use and yield response
  - ISRIC SoilGrids 2.0, for a soil-texture hint: https://soilgrids.org/
  - PSA OpenSTAT, for farmgate prices (Region II, January to May 2026) and mungbean and peanut production costs (2021): https://openstat.psa.gov.ph/Database/Prices/Farmgate-Prices
  - DOST-PCAARRD and PhilRice Isabela, for San Mateo mungbean yield and local context
  - OpenStreetMap, for the base map

## References

1. NASA POWER Project. https://power.larc.nasa.gov/
2. Huffman, G. J., Stocker, E. F., Bolvin, D. T., Nelkin, E. J., Tan, J. (2023). GPM IMERG Final Precipitation L3 1 month 0.1 degree x 0.1 degree V07. NASA GES DISC. https://doi.org/10.5067/GPM/IMERG/3B-MONTH/07
3. Didan, K. (2021). MODIS/Terra Vegetation Indices 16-Day L3 Global 250m SIN Grid V061. NASA LP DAAC. https://doi.org/10.5067/MODIS/MOD13Q1.061
4. NOAA Climate Prediction Center. Oceanic Niño Index (ERSSTv6). https://www.cpc.ncep.noaa.gov/products/analysis_monitoring/enso/oni/v6/
5. Allen, R. G., Pereira, L. S., Raes, D., Smith, M. (1998). Crop evapotranspiration: Guidelines for computing crop water requirements. FAO Irrigation and Drainage Paper 56. https://www.fao.org/4/x0490e/x0490e00.htm
6. Doorenbos, J., Kassam, A. H. (1979). Yield response to water. FAO Irrigation and Drainage Paper 33; values as given in Paper 66. https://www.fao.org/4/i2800e/i2800e02.pdf
7. Poggio, L., et al. (2021). SoilGrids 2.0. SOIL 7, 217-240. https://doi.org/10.5194/soil-7-217-2021
8. DOST-PCAARRD (2018). Isabela town celebrates Mungbean FIESTA. https://newport.pcaarrd.dost.gov.ph/index.php/quick-information-dispatch-qid-articles/isabela-town-celebrates-mungbean-fiesta
9. Philippine Statistics Authority, OpenSTAT. Farmgate prices, Region II, January to May 2026; Legumes costs and returns, 2021. https://openstat.psa.gov.ph/Database/Prices/Farmgate-Prices
10. PhilRice (2023). 2021 PhilRice R&D Highlights, Isabela Branch Station. https://www.philrice.gov.ph/wp-content/uploads/2023/08/RD-highlights_Isabela-Aug_2023.pdf
11. Basilio, K. C. (5 November 2026). 'Very strong' El Niño now active in tropical Pacific, says Philippine state weather bureau. Philippine Daily Inquirer, via Asia News Network. https://asianews.network/very-strong-el-nino-now-active-in-tropical-pacific-says-philippine-state-weather-bureau/
12. Rosales, C. M., Rivera, F. G., Hautea, R. A., Del Rosario, E. (1998). Field evaluation of N2 fixation by mung bean in the Philippines, and residual effects on maize. https://www.osti.gov/etdeweb/biblio/634524

## Use of SI tools

This project used SI tools. Claude (claude.ai, by Anthropic) was used for research, source checking, and drafting of the core data pipeline and calculation engine. Claude Code (by Anthropic) was used for the user interface, charts, pipeline extensions, a link and source check, documentation and deployment. Gemini (by Google) was used for an early literature summary, as a pointer to primary sources only. No image or video generation tools were used.

Every source file generated with SI assistance is marked with an SI-ASSISTED comment at the top. The team reviewed and tested the code. No climate, satellite or soil number was generated by SI; modelling assumptions proposed by SI are badged "Assumption" in the app, and the Filipino labels drafted by SI were checked by native speakers on the team. Full details: https://github.com/IceNFireBoy/NASA-Challenge-2026-Field-Shift/blob/main/SI_DISCLOSURE.md
