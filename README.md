<!-- SI-ASSISTED: generated with Claude Code (Anthropic); reviewed by the team. -->
# Has Bean Planned

**A decision-support web app that helps rice farmers choose what to do with their field in the dry season, using NASA Earth data, FAO crop-water science and the farmer's own priorities.**

- Live app: https://hasbeanplanned.netlify.app
- Demo video (28 seconds): [DEMO_LINK]
- Source code: https://github.com/IceNFireBoy/NASA-Challenge-2026-Field-Shift
- Team: NASApusomo (Marxus Magisa, Krizdarl Callo, Antonio Pasia, Kareena Macasiljig, Anica Begonia, Jonathan Serote)
- Built for the NASA Space Apps Challenge 2026, "Field Shift: Adapting Farms with NASA Data"

> This tool supports, and does not replace, farmer and expert judgement. Its scenarios summarise past seasons; they are not forecasts. NASA POWER and GPM IMERG are gridded estimates, not weather stations on a farm.

---

## Contents

1. [The problem](#the-problem)
2. [San Mateo is the test drive; the goal is national](#san-mateo-is-the-test-drive-the-goal-is-national)
3. [What the app does](#what-the-app-does)
4. [Data used](#data-used)
5. [Method](#method)
6. [What the data shows for San Mateo](#what-the-data-shows-for-san-mateo)
7. [Limitations](#limitations)
8. [Repository layout](#repository-layout)
9. [Run, test and reproduce](#run-test-and-reproduce)
10. [Accessibility and language](#accessibility-and-language)
11. [Use of SI (AI) tools](#use-of-si-ai-tools)
12. [Licence, team, references](#licence)

---

## The problem

After the wet-season rice harvest, a field can be left idle until the rains return or planted with a second crop. The choice is not simple. Each crop needs water that may or may not arrive, a price that may or may not hold, and labour and inputs paid for up front. An El Niño year makes the dry months drier and the gamble larger. PAGASA, as reported by the Philippine Daily Inquirer on 5 November 2026, described a very strong El Niño, with impacts expected to last into mid-2027.

Farmers, cooperatives and local agriculture offices need a way to compare the options that is grounded in data, honest about what it does not know, and usable by someone who is not comfortable with technology.

## San Mateo is the test drive; the goal is national

This build covers **one place: San Mateo, Isabela**, in the Cagayan Valley of northern Luzon. We chose it as the test-drive area because it has a real, documented version of the question the app answers: San Mateo is called the Mungbean Capital of the Philippines, and about 7,000 hectares there are planted to mungbean in the dry months (DOST-PCAARRD, 2018).

**Given more time, Has Bean Planned is meant to be scaled to the whole Philippines.** San Mateo is where we proved the idea works end to end, not the limit of the idea. Nothing in the approach is specific to one town:

| Piece | Why it can scale | What scaling still needs |
|---|---|---|
| Climate (NASA POWER, GPM IMERG) | Both are global grids; the pipeline takes a latitude and longitude | A location picker, and a pipeline run (or an on-demand service) per municipality instead of one committed file |
| Vegetation (MODIS NDVI) and soil (SoilGrids) | Both are global and fetched by point | Field-level pixels instead of one town-centre pixel; BSWM soil maps where available |
| Crop-water model (FAO-56, FAO-33) | Crop coefficients and yield-response factors are crop properties, not place properties | Parameters for more crops, and dry-season rice, with sources |
| El Niño scenarios (NOAA ONI) | The index is global; seasons are labelled once for every location | Regional rainy-season calendars, since the dry season is not December to May everywhere in the country |
| Economics | Prices and costs are already editable and badged by source | Regional farmgate prices and costs-and-returns from PSA for each region |
| Language | The app already switches between English and Filipino | Ilocano, Cebuano, Hiligaynon and other major languages, written and checked by native speakers |
| Local facts and contacts | Kept in two content files, separate from the maths | Per-province crop facts, and the right agriculture office for each municipality |

What is **not** built today: there is no location picker, the coordinates are fixed in the pipeline, the crop list and local facts are San Mateo's, and the model has not been validated against farm records anywhere. A national version is a plan, and this repository is its first working municipality.

## What the app does

The app compares four dry-season options after rice: **leave the field fallow**, **mungbean**, **yellow corn** and **peanut**. It has two views that share every setting.

### Farmer view (the default)

Made for a smallholder on a phone, in plain words.

1. A welcome screen with one sentence and a Start button.
2. Five questions, one per screen, answered by tapping large picture cards:
   when the last rice was harvested, whether the field can be watered, sticky clay or loose soil, what matters most (pick up to two of: safe harvest, healthy soil, more income, less work, animal feed), and whether a dry El Niño year is expected.
3. A short loading screen that states what is being done, with counts read from the data (24 past dry seasons, 4 options, 300 what-ifs).
4. **One answer**: "Best fit for your field", with three plain reasons, a fit score and four traffic lights (water, soil, income, work). Each light carries a mark and a word, never colour alone.
5. How sure the answer is, what a dry El Niño year would change, a "what if it rains less?" slider, "Try a dry year" and "Change my answers".
6. The other three options and a "Why?" card, opened on request.

### Analytics and Community view

Made for extension workers, cooperatives and analysts. It was first called "Expert"; we renamed it so the label does not rank farmers below experts.

| Tab | What it shows |
|---|---|
| **Compare** | Field settings, six priority sliders, scenario picker with rainfall and warming what-ifs, ranked option cards with score breakdown, water need met, net return, labour and harvest date, an uncertainty panel, why-cards, and editable prices and costs with source badges |
| **Season calendar** | A June-to-May timeline per option showing wet-season rice, the dry-season crop and bare field; month-by-month water and heat flags; pick a month or a row for the numbers |
| **Past seasons** | Rainfall and heat trends over 24 dry seasons; a replay heatmap of every option in every past season (water need met, or profit or loss) with a detail panel per season; monthly rain against crop water demand, including an IMERG-versus-POWER comparison; observed vegetation greenness (MODIS NDVI) |
| **Plan together** | A cooperative calculator (seed, labour and extra water for a given area and adoption share), a coordination prompt, who to involve, and a "Farmer Q&A (coming soon)" section with three clearly labelled SAMPLE questions answered from the glossary |
| **Data & methods** | Sources and their status, a map showing how large one NASA grid cell is next to the town, the method in plain words, every parameter with its value, range, status and source, the Farmer-view rules, a glossary and the limitations |

## Data used

### NASA data

| Source | What we use it for | How we got it |
|---|---|---|
| **GPM IMERG Final, monthly, 0.1 degree, V07** (GPM_3IMERGM), doi:10.5067/GPM/IMERG/3B-MONTH/07 | Rainfall for every dry season, 2001-02 to 2024-25. This is the rainfall the model runs on | NASA Giovanni area-averaged time series (data box 121.55 to 121.65 E, 16.85 to 16.95 N, one grid cell, mm/hr), committed as `pipeline/data/imerg_giovanni.csv` |
| **NASA POWER** daily agroclimatology (https://power.larc.nasa.gov/) | Daily maximum and minimum temperature, root-zone soil wetness, and a second rainfall series for comparison | POWER point API |
| **MODIS MOD13Q1 v061** NDVI, 250 m, 16-day (doi:10.5067/MODIS/MOD13Q1.061) | Observed greenness of the land, 552 composites from June 2001 to May 2025 | ORNL DAAC MODIS/VIIRS subsetting service |

### Other data and science

| Source | What we use it for |
|---|---|
| **NOAA CPC Oceanic Niño Index** (ONI, ERSSTv6 table) | Labelling each season as El Niño, La Niña or neutral, and choosing the strong El Niño seasons |
| **FAO Irrigation and Drainage Paper 56** | Reference evapotranspiration (Hargreaves-Samani), crop coefficients, available soil water, root depths |
| **FAO Irrigation and Drainage Paper 33** (values via Paper 66) | Yield response to water shortage |
| **USDA-SCS effective rainfall** (as used in FAO CROPWAT) | The share of rain a crop can actually use |
| **ISRIC SoilGrids 2.0** (250 m, CC BY 4.0) | A soil-texture hint for the point: clay loam, about 32% clay and 42% sand in the top 30 cm |
| **PSA OpenSTAT** | Farmgate prices for yellow corn, mungbean and peanut in Region II (Cagayan Valley), January to May 2026; production costs for mungbean and peanut (Costs and Returns, 2021, national) |
| **DOST-PCAARRD**, **PhilRice Isabela** | San Mateo mungbean yield and area, and local context |
| **OpenStreetMap** | Base map tiles for the resolution map |

Every number on screen comes from the climate data file, the parameter file or user input. Each economic and agronomic input carries a badge: **Sourced**, **Local source**, **Secondary source**, **Assumption** or **Illustrative**; a number the user types is badged **Your value**.

**Rainfall status in plain terms.** The app runs on GPM IMERG. Downloading IMERG through the pipeline's own Earthdata login never worked for us (gateway timeouts, then a refused login), so the monthly series was exported from NASA Giovanni in a browser and committed. NASA POWER rainfall is kept beside it; the two typical-year totals differ by about 2%.

## Method

1. **Climate file.** `pipeline/fetch_climate.py` turns NASA POWER daily data and IMERG monthly rainfall into `frontend/src/data/climate.json`: 24 dry seasons (December to May, 2001-02 to 2024-25), each labelled by ENSO state, plus three scenarios: a typical year (the median of all 24), a strong El Niño year (the median of 2009-10, 2015-16 and 2023-24) and the 2015-16 season on its own.
2. **Crop water need.** Reference evapotranspiration is estimated from temperatures (Hargreaves-Samani) and multiplied by FAO-56 crop coefficients across four growth stages.
3. **Water supply.** Usable rain (USDA-SCS effective rainfall) plus water stored in the root zone at planting, which depends on soil, root depth, when the rice was harvested, and NASA POWER soil wetness for the scenario.
4. **Yield and money.** The shortfall is turned into yield loss with FAO-33 response factors. Yield times price, minus cost and any pumping cost, gives net return per hectare. If the field can be irrigated, the shortfall is pumped instead and costed.
5. **Scoring.** Each option gets a 0-to-100 score on six criteria (drought safety, soil health and nitrogen, ground cover, income, low labour, forage value), weighted by the user's priorities. Peanut is blocked on heavy clay.
6. **Uncertainty.** The comparison is re-run 300 times with inputs varied inside their stated ranges. The app reports how often each option comes first.
7. **Replay.** Every past season is run with the current settings, so the user can see how each option would have done year by year.

**Farmer-view rules** (our assumptions, listed in the app): a picked priority gets weight 40 and the others 5; water is "good" above 80% of need met and "okay" from 50%; soil, income and work lights have stated cut-offs; a "not sure" El Niño answer uses the typical year and also states what a dry year would change.

**Why rules and statistics, not a machine-learning model.** Rules can be read and checked by a farmer or an extension worker, and they work with the small amount of local data that exists. SI tools were used to write code, not to produce the numbers.

All calculations live in one engine (`frontend/src/engine/engine.js`) with automated tests.

## What the data shows for San Mateo

These are results from the committed data with the default settings (after wet-season rice, loose soil, rain only, default priorities). They describe past seasons and are not a forecast.

- **Typical year:** Mungbean scores 82, peanut 69, corn 58, fallow 48. Mungbean comes first in 88% of the 300 what-if runs.
- **Strong El Niño year:** Mungbean 82, peanut 53, fallow 48, corn 38. Corn falls below leaving the field idle, and mungbean comes first in every one of the 300 runs.
- **Replay:** mungbean met at least 80% of its water need in all 24 past dry seasons.
- **Rainfall:** typical dry-season months are 176, 87, 63, 85, 79 and 202 mm (December to May, IMERG); a strong El Niño year totals 573 mm against 692 mm.
- **Greenness:** the town-centre pixel is least green in November (NDVI 0.44) and greenest in August (0.59), with a second peak in January.

Prices are PSA farmgate prices for Cagayan Valley (January to May 2026). Mungbean and peanut costs are PSA national averages for 2021, so today's costs are likely higher. Corn yield and cost, and peanut yield, are still placeholders. All of them can be edited in the app.

## Limitations

- **Past seasons are not forecasts.** Scenarios summarise what happened; they do not predict 2026-27.
- **One point.** Everything is modelled for the San Mateo town centre. A NASA POWER cell is about 55 by 66 km and an IMERG cell about 11 km, so two farms far apart get the same numbers.
- **Gridded estimates, not gauges.** IMERG and POWER are satellite and model products.
- **Economics are partly sourced, partly placeholder.** Prices for mungbean, corn and peanut are PSA farmgate prices for Cagayan Valley (January to May 2026). Mungbean and peanut production costs are PSA national averages for 2021. Mungbean yield is a San Mateo figure from DOST-PCAARRD. Corn yield and cost, peanut yield, seed rates and the pumping cost are still placeholders, badged Illustrative. Costs are from 2021 and prices from 2026, so net returns for mungbean and peanut are on the generous side. Farmers should enter their own figures.
- **Soil is the user's choice,** with a SoilGrids hint; it is not a soil test or a BSWM map lookup.
- **NDVI is one 250 m pixel** at the town centre, which can include buildings and roads, with no cloud screening beyond the 16-day composite. The model does not use it.
- **No pest or disease model,** no groundwater or capillary rise, and crops that run past 31 May reuse May conditions.
- **No field validation yet.** The model has not been checked against farm records or harvest data.
- **Filipino labels** were drafted with SI and then checked by native speakers on the team. Why-cards, sources and chart captions are in English only.
- **Phones:** the team has tried the app on a phone. Layout was also checked at 360, 375 and 1280 px in a desktop browser.

## Repository layout

```
pipeline/
  fetch_climate.py      NASA POWER + IMERG -> climate.json (tested)
  fetch_extras.py       MODIS NDVI + SoilGrids -> optional blocks in climate.json
  data/imerg_giovanni.csv   the IMERG series the app ships with
  test_pipeline.py      19 offline tests
frontend/src/
  data/climate.json     the only data file the app reads
  engine/engine.js      all maths: water balance, yield loss, scoring, Monte Carlo, replay
  engine/params.js      every crop, soil and economic number with status and source
  engine/content.js     why-card text, glossary, sources
  lib/farmer.js         Farmer-view rules: answer mapping, traffic lights, plain reasons
  lib/i18n.js, lang.jsx English and Filipino labels
  lib/state.js          shared settings and saved-settings guard
  components/farmer/    the guided Farmer view
  components/           the Analytics and Community tabs
docs/                   project page, demo script, QA table, phase specs
SI_DISCLOSURE.md        how SI tools were used
```

Built with React 18, Vite 5, Tailwind CSS 3, Recharts 2 (charts) and Leaflet 1.9 (map); tests with Vitest and pytest. Hosted on Netlify from the `main` branch.

## Run, test and reproduce

Create the Python environment once from the repo root: `python -m venv .venv` (Windows: `py -m venv .venv`), then install `pipeline/requirements.txt`. Below, `PY` means `.venv/bin/python` on macOS or Linux and `.venv\Scripts\python.exe` on Windows.

```
# Tests
PY -m pytest pipeline -q          # 19 pipeline tests, no network
cd frontend && npm install
npm test                          # 22 engine and Farmer-view tests
npm run dev                       # local development server
npm run build                     # production build
```

To rebuild the data file exactly as shipped:

```
PY pipeline/fetch_climate.py --imerg-csv pipeline/data/imerg_giovanni.csv --imerg-units mm/hr
PY pipeline/fetch_extras.py       # adds the NDVI and SoilGrids blocks (slow: about 56 MODIS requests)
```

Other pipeline modes: `--placeholder` writes clearly labelled synthetic data with no network; `--skip-imerg` uses NASA POWER rainfall only; `--imerg-direct` downloads IMERG over HTTPS from GES DISC and needs a working Earthdata login (written and unit-tested, but not proven against the server by us). Re-running the climate fetch keeps the NDVI and SoilGrids blocks.

## Accessibility and language

- 18 px base text in both views and 48 px touch targets in the Farmer view; works at 360 px wide.
- Status is never carried by colour alone: traffic lights, heatmaps and flags use marks and words.
- Motion is CSS only, under 300 ms, and switched off when the device asks for reduced motion.
- English is the default. A Filipino toggle translates the Farmer view and the main labels of the Analytics and Community view.
- No photos of people, no NASA logos or insignia; icons are emoji or hand-made SVG.

## Use of SI (AI) tools

This project used SI tools. Details are in [SI_DISCLOSURE.md](SI_DISCLOSURE.md). In short:

- **Claude (claude.ai):** research, verification, drafting of the core pipeline and engine, and the first documentation.
- **Claude Code (Anthropic):** the user interface, pipeline extensions, and documentation.
- **Gemini:** an early literature summary, used only as a secondary reference.
- **Image or video generation:** none.

Every source file generated with SI starts with an `SI-ASSISTED` comment. The team reviewed and tested the code. The numbers come from cited data and stated assumptions, not from SI output.

## Licence

MIT. See [LICENSE](LICENSE).

## Team

**NASApusomo**

- Marxus Magisa
- Krizdarl Callo
- Antonio Pasia
- Kareena Macasiljig
- Anica Begonia
- Jonathan Serote

Contact: marxus.antonio.magisa@student.ateneo.edu

## References

1. NASA POWER Project, NASA Langley Research Center. https://power.larc.nasa.gov/
2. Huffman, G. J., E. F. Stocker, D. T. Bolvin, E. J. Nelkin, J. Tan (2023). GPM IMERG Final Precipitation L3 1 month 0.1 degree x 0.1 degree V07 (GPM_3IMERGM). NASA GES DISC. DOI: 10.5067/GPM/IMERG/3B-MONTH/07. Retrieved through NASA Giovanni, 15 Nov 2026.
3. Didan, K. (2021). MODIS/Terra Vegetation Indices 16-Day L3 Global 250m SIN Grid V061. NASA LP DAAC. DOI: 10.5067/MODIS/MOD13Q1.061. Retrieved through the ORNL DAAC subsetting service, 15 Nov 2026.
4. NOAA Climate Prediction Center. Oceanic Niño Index (ONI), ERSSTv6 table. https://www.cpc.ncep.noaa.gov/products/analysis_monitoring/enso/oni/v6/ (table read 15 Nov 2026)
5. Allen, R. G., Pereira, L. S., Raes, D., Smith, M. (1998). *Crop evapotranspiration: Guidelines for computing crop water requirements*. FAO Irrigation and Drainage Paper 56. https://www.fao.org/4/x0490e/x0490e00.htm
6. Doorenbos, J., and Kassam, A. H. (1979). *Yield response to water*. FAO Irrigation and Drainage Paper 33; values as given in FAO Irrigation and Drainage Paper 66. https://www.fao.org/4/i2800e/i2800e02.pdf
7. Poggio, L., et al. (2021). SoilGrids 2.0. *SOIL* 7, 217-240. DOI: 10.5194/soil-7-217-2021
8. Philippine Statistics Authority, OpenSTAT. (a) Farmgate prices by geolocation, commodity, year and period: Cereals, and Beans and Legumes; Region II (Cagayan Valley), January to May 2026. (b) Legumes: Average Production Costs and Returns, 2021 (mongo, peanut; national). https://openstat.psa.gov.ph/Database/Prices/Farmgate-Prices . The downloaded costs-and-returns tables are in `pipeline/data/psa/`.
9. DOST-PCAARRD (8 May 2018). Isabela town celebrates Mungbean FIESTA. https://newport.pcaarrd.dost.gov.ph/index.php/quick-information-dispatch-qid-articles/isabela-town-celebrates-mungbean-fiesta
10. PhilRice (2023). 2021 PhilRice R&D Highlights, Isabela Branch Station (Extracore Project 16, rice-rice-mungbean and rice-rice-corn). https://www.philrice.gov.ph/wp-content/uploads/2023/08/RD-highlights_Isabela-Aug_2023.pdf
11. Basilio, K. C. (5 November 2026). 'Very strong' El Niño now active in tropical Pacific, says Philippine state weather bureau. Philippine Daily Inquirer, via Asia News Network. https://asianews.network/very-strong-el-nino-now-active-in-tropical-pacific-says-philippine-state-weather-bureau/
12. Rosales, C. M., Rivera, F. G., Hautea, R. A., Del Rosario, E. (1998). Field evaluation of N2 fixation by mung bean in the Philippines, and residual effects on maize. https://www.osti.gov/etdeweb/biblio/634524
13. Department of Agriculture, Bureau of Plant Industry. Mungbean Production Guide (reproduced by DA-RAFIS MIMAROPA). Source page: http://bpi.da.gov.ph/index.php/production-guide/161-mungbean
14. Palomar, M. K. (ed.) (1998). Peanut in Local and Global Food Systems Series Report No. 1. Department of Anthropology, University of Georgia.
15. OpenStreetMap contributors. Map data and tiles. https://www.openstreetmap.org/copyright
