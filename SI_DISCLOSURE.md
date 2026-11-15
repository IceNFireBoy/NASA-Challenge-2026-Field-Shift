<!-- SI-ASSISTED: generated with Claude Code (Anthropic); reviewed by the team. -->
# SI (AI) use disclosure: Has Bean Planned: San Mateo, Isabela

This document discloses how Synthetic Intelligence (SI) tools were used in the NASA Space Apps 2026 project "Has Bean Planned: San Mateo, Isabela". It is written to meet the Space Apps requirement to label SI use.

## Tools used and what for

| Tool | Used for |
|---|---|
| **Claude (claude.ai)**, by Anthropic | Research and verification of sources, drafting of the core data pipeline and the calculation engine, and drafting of this documentation kit |
| **Claude Code**, by Anthropic | Building the user interface, writing and editing documentation, and deployment |
| **Gemini**, by Google | An early literature summary. Used only as a secondary reference. [TEAM TO CONFIRM how claims from it were checked against primary sources] |
| **Image or video tools** | None. No AI-generated images or video are used in the project unless the team adds them, in which case this document will be updated |

## How SI-generated content is labelled

- Every source file that was created with SI assistance starts with this first-line comment:
  - `// SI-ASSISTED: generated with Claude Code (Anthropic); reviewed by the team.` (JavaScript and similar files)
  - `# SI-ASSISTED: generated with Claude Code (Anthropic); reviewed by the team.` (Python files)
  - `<!-- SI-ASSISTED: generated with Claude Code (Anthropic); reviewed by the team. -->` (Markdown and HTML files)
- The project progress log (`PROGRESS.md`) records the work done in each phase.

## Human review and testing

- The team reviewed the generated code and documentation.
- The calculation engine has automated tests (Vitest). The data pipeline has offline tests (pytest). Both suites are run before each release.
- The production build is checked with `npm run build`.

## Where the numbers come from

- SI tools did not create the data, numbers or statistics in the app.
- Climate values come from NASA POWER, processed by the team's pipeline.
- Crop water, yield and economic parameters come from the cited sources (FAO-56, FAO-33, and the local sources listed in the README), or are marked as assumptions or illustrative values with a status badge on screen.
- Every number on screen is traceable to the climate data file, the parameter file, or user input.

## Limits of SI use

- SI output is treated as a draft. It is not treated as a source of facts.
- The project does not use SI to make farm recommendations. The tool supports, and does not replace, farmer and expert judgement.

## Contact

For questions about this disclosure, contact the team: marxus.antonio.magisa@student.ateneo.edu
