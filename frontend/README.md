# Commerce Intelligence Platform — Frontend

Frontend for the Commerce Intelligence Platform, implementing the approved
architecture in `ARCHITECTURE.md` against the endpoints in `API_CONTRACT.md`.

This app renders backend responses only. It never computes, aggregates,
joins, or fabricates business data — see `API_CONTRACT.md` §0 for the
frontend/backend responsibility split.

## Stack

React 18 + TypeScript (strict) · Vite · Tailwind CSS v4 · Framer Motion ·
React Query · Recharts · shadcn/ui-style primitives (Radix-based) ·
React Router v7

## Getting started

```bash
npm install
cp .env.example .env   # set VITE_API_BASE_URL to your backend
npm run dev
```

The app expects the backend described in `API_CONTRACT.md` to be running at
`VITE_API_BASE_URL`. Until those endpoints exist, every widget will
correctly show its `ErrorState` (fetch failure) — that's expected, not a bug.

## Build order / phase status

| Phase | Scope | Status |
|---|---|---|
| 1 | Application Shell (routing, layout, design tokens, services layer, all types) | ✅ Done |
| 2 | Executive Overview | ✅ Done |
| 3 | Pipeline Health | ⏳ Stub — awaiting build |
| 4 | Data Quality Center | ⏳ Stub — awaiting build |
| 5 | Business Intelligence | ⏳ Stub — awaiting build |
| 6 | Medallion Architecture Explorer (centerpiece) | ⏳ Stub — awaiting build |

Each remaining phase is scoped exactly as described in `ARCHITECTURE.md` §11
and will be built against the real API — no mock data is used as a
stand-in anywhere in this codebase.

## Project structure

See `ARCHITECTURE.md` §3 for the full folder structure and rationale.
Quick orientation:

- `src/services/*Api.ts` — the only place `fetch` happens, one file per domain, 1:1 with `API_CONTRACT.md`.
- `src/features/*/hooks` — React Query hooks wrapping each service call.
- `src/features/*/components` — page-specific UI.
- `src/components/{ui,layout,charts,feedback}` — cross-feature building blocks.
- `src/types/*.ts` — response types mirroring `API_CONTRACT.md` 1:1.
- `src/pages/*` — one folder per route.

## Design system

Dark-mode-first, single accent color, Geist typeface throughout (display and
body — no secondary font). Full token reference in `src/styles/globals.css`
and `ARCHITECTURE.md` §4.
