<!-- SI-ASSISTED: generated with Claude Code (Anthropic); reviewed by the team. -->
# Has Bean Planned: San Mateo, Isabela

**A decision-support tool that compares dry-season options after rice for San Mateo, Isabela, using NASA climate data, crop-water science and the farmer's own priorities.**

- Live app: https://hasbeanplanned.netlify.app
- Demo video (28 seconds): [DEMO_LINK]
- Built for the NASA Space Apps Challenge 2026, "Field Shift: Adapting Farms with NASA Data"

> This tool supports, and does not replace, farmer and expert judgement. Its scenarios summarise past seasons. They are not forecasts. NASA POWER is a gridded estimate, not a weather station.

---

## The problem

San Mateo is a rice-growing municipality in Isabela, in the Cagayan Valley of northern Luzon. After the wet-season rice harvest, many fields stay bare during the dry season or are planted with a second crop. The choice is not simple. Each option needs water that may or may not be there, a market price that may or may not hold, and labour and inputs that cost money up front.

Climate variability makes this harder. The El Niño event expected in the 2026-27 season is a reason for farmers to plan for less rain than usual in the dry months. Local context on the 2026-27 outlook and on the Munggo Capital supply situation is drawn from local reporting in The Manila Times [CITE SPECIFIC ARTICLE AND DATE]. Farmers, cooperatives and local government need a way to compare options that is grounded in data and open about its uncertainty.

## What the tool does

Has Bean Planned compares four dry-season options after rice: **fallow**, **mungbean**, **corn** and **peanut**. The current rotation is always one of the four, so a farmer can see what changing would mean.

Mapped to the challenge objectives:

| Challenge objective | What Has Bean Planned does | Status |
|---|---|---|
| Compare rotation options, including the current one | Ranks fallow, mungbean, corn and peanut side by side, with the current rotation included | Built |
| Explain each option: why, evidence, benefits, gaps, risks | Each ranked card shows a "why" card, evidence, benefits, gaps, risks and pest notes | Built |
| Show bare-field periods | Shows how long a field stays bare under each option | Built |
| Show vulnerable months | Shows which months are most exposed to water stress | Built |
| Pest-cycle notes | Pest and disease notes are shown on each card as qualitative guidance. There is no pest or disease model | Built (qualitative) |
| Farmer priorities and constraints | Priority sliders and field inputs shape the ranking | Built |
| Uncertainty | Uncertainty lines appear on each card. | Built |
| What-if sliders | Lets the user change rainfall and temperature assumptions (prices are editable in the Prices and costs panel) and see the result | Built |
| Season calendar and past-season replay | Shows a calendar of the season and replays past seasons | Built |
| Trend charts | Shows how past seasons compare | Built |
| Community view | A tab for community input | Built |
| Plain-language glossary | Explains terms used in the app | Built |
| Satellite vs ground data explained | Explains where the numbers come from and what a satellite estimate is | Built |

**Built today (Compare view):** the field form, priority sliders, the scenario picker, ranked option cards with why, evidence, benefits, gaps, risks and pest notes, uncertainty lines per card, editable prices and costs with status badges, banners that flag data and assumption status, and a reset button.

## Data used

### NASA data
- **NASA POWER** (daily gridded meteorological data, including rainfall in the current build): https://power.larc.nasa.gov/
- **GPM IMERG V07** (satellite-gauge precipitation, Final Run, monthly, 0.1 degree; product GPM_3IMERGM): https://gpm.nasa.gov/data/imerg. DOI: 10.5067/GPM/IMERG/3B-MONTH/07
- **Current rainfall status:** the app uses **GPM IMERG** rainfall for every dry season, 2001-02 to 2024-25. It was exported from NASA Giovanni as an area-averaged monthly time series (data box 121.55 to 121.65 E, 16.85 to 16.95 N, one 0.1 degree cell, mm/hr) and is committed as `pipeline/data/imerg_giovanni.csv`. Reproduce with `python pipeline/fetch_climate.py --imerg-csv pipeline/data/imerg_giovanni.csv --imerg-units mm/hr`. NASA POWER rainfall is kept alongside it for the "IMERG vs POWER" comparison chart; the two typical-year totals differ by about 2%. Direct downloads from GES DISC (`--imerg-direct`, or earthaccess) did not work for us: the Earthdata login was refused.

### Other data
- **NOAA Oceanic Niño Index (ONI)** for El Niño and La Niña context: https://www.cpc.ncep.noaa.gov/products/analysis_monitoring/ensostuff/ONI_v5.php
- **FAO-56** (*Crop evapotranspiration*, Irrigation and Drainage Paper 56) for crop water use and the water balance method.
- **FAO-33** (*Yield response to water*, Irrigation and Drainage Paper 33) for the yield-loss response to water stress.
- **Philippine Statistics Authority (PSA)**, **DOST-PCAARRD** and **PhilRice** for local crop and production facts [CITE SPECIFIC PUBLICATIONS AND FIGURES].
- **The Manila Times** for local news context on the 2026-27 outlook and the Munggo Capital supply situation [CITE SPECIFIC ARTICLE].

Every number on screen comes from the climate data file, the parameter file, or user input. Each economic and agronomic input carries a status badge: **Sourced**, **Local source**, **Secondary source**, **Assumption** or **Illustrative**.

## Method summary

1. **Climate input.** Daily NASA POWER data for San Mateo are processed into a climate file used by the app.
2. **Water balance.** A daily soil-water balance (FAO-56 approach) tracks water supply from rainfall and soil storage against crop water demand for each option.
3. **Yield loss.** Water deficits are converted into yield loss using the FAO-33 response approach.
4. **Economics.** Yield is combined with prices and costs. Prices and costs are editable, and each one is marked with its status.
5. **Scoring.** Each option is scored against the farmer's priorities set in the app.
6. **Monte Carlo and replay.** Many simulated runs built from past seasons give a spread of outcomes. Past seasons are replayed one by one. These show how each option has performed in the record. They do not predict the next season.

The calculations live in a single engine with automated tests. Changes to the engine must pass the test suite.

## Limitations

- **Past seasons are not forecasts.** The scenarios summarise past seasons. They do not predict the coming season.
- **NASA POWER is a gridded estimate, not a weather station.** Local rainfall may differ.
- **Economics are illustrative.** Prices and costs are sourced, assumed or illustrative, as marked on screen. Farmers should check them against their own records and local market prices.
- **No pest or disease model.** Pest-cycle notes are qualitative only.
- **No groundwater or capillary rise.** The water balance does not include groundwater contribution or capillary rise from a water table.
- **No field validation yet.** The model has not yet been checked against farm records or harvest data from San Mateo.
- **Satellite rainfall (IMERG) is one 0.1 degree cell** (about 11 km) from a Giovanni area average, not a rain gauge on a farm.

## Run and test

Commands are listed in `CLAUDE.md`. In short:

```
# Python pipeline tests (run from the repo root; Windows venv path shown)
.venv\Scripts\python.exe -m pytest pipeline -q

# Frontend (run inside frontend/)
npm install
npm test          # engine tests (Vitest)
npm run dev       # local development server
npm run build     # production build
```

On macOS or Linux, use `.venv/bin/python` in place of `.venv\Scripts\python.exe`.

## Use of Space Apps SI tools (AI disclosure)

This project used AI tools. Details are in [SI_DISCLOSURE.md](SI_DISCLOSURE.md). In short:

- **Claude (claude.ai):** research, verification, drafting of the core pipeline and engine, and this documentation kit.
- **Claude Code (Anthropic):** user interface, documentation and deployment.
- **Gemini:** an early literature summary, used only as a secondary reference.
- **Image or video generation:** none.

Every source file generated with AI starts with an `SI-ASSISTED` comment. The team reviewed and tested the code. The numbers come from cited data, not from AI output.

## Licence

This project is licensed under the MIT Licence. [ADD LICENSE FILE TO REPOSITORY]

## Team

NASApusomo
[MEMBER NAMES AND ROLES]

## References

1. NASA POWER Project. https://power.larc.nasa.gov/
2. Huffman, G. J., E. F. Stocker, D. T. Bolvin, E. J. Nelkin, J. Tan. GPM IMERG Final Precipitation L3 1 month 0.1 degree x 0.1 degree V07 (GPM_3IMERGM). NASA GES DISC. https://gpm.nasa.gov/data/imerg. DOI: 10.5067/GPM/IMERG/3B-MONTH/07. Retrieved through NASA Giovanni, 15 Nov 2026.
3. NOAA Climate Prediction Center. Oceanic Niño Index (ONI). https://www.cpc.ncep.noaa.gov/products/analysis_monitoring/ensostuff/ONI_v5.php
4. Allen, R. G., Pereira, L. S., Raes, D., Smith, M. (1998). *Crop evapotranspiration: Guidelines for computing crop water requirements*. FAO Irrigation and Drainage Paper 56. Food and Agriculture Organization of the United Nations.
5. Doorenbos, J., and Kassam, A. H. (1979). *Yield response to water*. FAO Irrigation and Drainage Paper 33. Food and Agriculture Organization of the United Nations.
6. Philippine Statistics Authority. [ADD SPECIFIC TABLE OR PUBLICATION USED]
7. DOST-PCAARRD. [ADD SPECIFIC PUBLICATION USED]
8. PhilRice. [ADD SPECIFIC PUBLICATION USED]
9. The Manila Times. [ADD SPECIFIC ARTICLE, DATE AND URL]
