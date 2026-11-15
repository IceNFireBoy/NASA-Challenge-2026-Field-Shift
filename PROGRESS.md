<!-- SI-ASSISTED: generated with Claude Code (Anthropic); reviewed by the team. -->
# Field Shift: progress

## Done
- Phase 0: kit extracted (26 files), venv (Python 3.13) created, placeholder climate data written.
- Pipeline tests: 13 passed. Frontend tests: 14 passed. `npm run build` OK.

## Next
- Phase 1: real NASA data (POWER + IMERG), then UI phases 2-4.

## Known issues
- Toolchain is outside the spec ranges: default Python is 3.14 (venv uses 3.13, fine), Node is v26.3.0 (spec wants 20/22). Everything works so far.
- `climate.json` is placeholder data (`data_status=placeholder`), not real NASA data.
- npm warns esbuild's postinstall is not in allowScripts; build still works.
