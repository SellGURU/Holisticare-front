# Description Flash Bug — Root Cause (v3.3.1)

## Confirmed culprits

| # | Source | Mechanism |
|---|--------|-----------|
| **F1** | `mergeCategoryCards.ts` L80-83 | Forced `description_ready=true` + old text during re-process |
| **B** | `DetiledAnalyse` / `newDetailedAcordin` | Direct render of `data.description` without commit gate (v3.2 fixed) |
| **F2** | `resolveDescriptionDisplayPhase` | Processing hold showed old committed during re-generate |
| **F3** | `useCategoryDescriptionDisplay` | No epoch reset on upload start |

## v3.3.1 fixes

- **Merge:** `explicitlyNotPending = incoming.description_pending === false` (undefined → treat as pending, clear description)
- **Phase:** `isReprocessing` → skeleton, clear committed
- **Hook:** `descriptionEpoch` bump on poll start + upload refresh; `descriptionPending === true` for reprocess
- **R1 logging:** `VITE_DESCRIPTION_DEBUG=1` → `[description-debug:R1_categoriesPoll]` for first 3 processing polls

## R1 — legacy path without `description_pending`

If backend never sends `description_pending` and never sets `description_ready: true`, user sees perpetual skeleton (trade-off vs flash). Monitor R1 logs; if seen in production, escalate backend F4 from optional to mandatory.

## Debug

```
VITE_DESCRIPTION_DEBUG=1
```

DevTools filter: `[description-debug`

## Tests

```
yarn test:merge-category
yarn test:description-phase
```

