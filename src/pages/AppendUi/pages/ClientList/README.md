# Client List — Backend Status & API Contract

This page is wired to the **existing** backend endpoint and falls back to the
mock JSON in `./mocks/clientList.json` while the request is in flight (or if it
fails).

---

## Folder Layout

```
ClientList/
├── index.tsx                  ← orchestrator (state, filtering, sorting, fetch)
├── ClientListHeader.tsx       ← title + count + "Add Client" button
├── ClientFilters.tsx          ← search bar + filter panel
├── ClientTable.tsx            ← table + pagination + empty state
├── AddClientModal.tsx         ← modal for creating a new client
├── mapPatient.ts              ← backend → design transformation
├── constants.ts               ← URGENCY_CONFIG, PLAN_CONFIG, CATEGORY_COLORS
├── types.ts                   ← Client, NewClientForm, SortCol, SortDir
└── mocks/
    └── clientList.json        ← canonical example of the list response
```

---

## ✅ Connected to Backend (live)

| Action       | Endpoint           | Frontend caller             |
| ------------ | ------------------ | --------------------------- |
| Fetch list   | `GET /patients`    | `Application.getPatients()` |

The backend returns `{ patients_list_data: BackendPatient[] }`. Each item is
mapped to the design's `Client` shape by `mapPatient.ts`.

### Fields that come straight from the backend

| Design field         | Backend field                              |
| -------------------- | ------------------------------------------ |
| `id`                 | `member_id` (formatted as `HC-XXXX`)       |
| `name`               | `name`                                     |
| `gender`             | `sex` (`"female"` → `'F'`, else `'M'`)     |
| `age`                | `age`                                      |
| `enrollment.startDate` | `enroll_date` (formatted as `Oct 12`)    |
| `lastCheckIn`        | days since `last_followup`                 |
| `assigned`           | `assigned_to.join(', ')`                   |

### Fields derived from existing backend data

| Design field        | Derivation rule                                                                                       |
| ------------------- | ----------------------------------------------------------------------------------------------------- |
| `urgency`           | `status === 'needs check'` OR `daysSinceCheckIn > 14` → `immediate`; `status === 'incomplete data'` OR `> 7` days → `monitor`; else → `stable` |
| `planStatus`        | `checked` → `active`, `incomplete data` → `draft`, `needs check` → `none`, else → `active`           |
| `enrollment.week` + `totalWeeks` | mapped from `progress` (0–100). Internally stored as `week = progress`, `totalWeeks = 100` so the progress bar shows `progress%` correctly |

---

## ❌ Fields the design needs but the backend does not provide

Each of these is currently filled with a safe default; please tell me how you
want to handle them.

| Design field                  | Default in code           | Question for product / backend                                                                                     |
| ----------------------------- | ------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| `enrollment.program`          | `'—'` (em dash)           | Should the backend add a `program` field per patient? Or should we derive it from `category`?                       |
| `enrollment.week`             | `progress` (approx.)      | The design uses week-of-N progress. Should backend send `week` & `totalWeeks` explicitly, or keep using `progress`? |
| `enrollment.totalWeeks`       | `100`                     | Same as above.                                                                                                     |
| `category`                    | `'—'` (em dash, default color) | Should backend add a `category` enum (`Peptide`, `Longevity`, `Diet`, `Sleep`, `Lifestyle`)? Or derive from program? |
| `connectedApps`               | `[]` → "Not Connected"    | The design shows badges for connected wearables (Oura, Garmin, Apple Health, etc.). Should backend add `connected_apps: string[]`? |
| `assigned` (multiple)         | `assigned_to.join(', ')`  | Design currently shows one practitioner. Should it show multiple? Show the primary one? Show first + "+N more"?    |

### Filter dropdowns that won't fully work until the missing fields exist

| Filter         | Status                                                                  |
| -------------- | ----------------------------------------------------------------------- |
| Urgency        | ✅ Works (derived)                                                       |
| Category       | ⚠️ Always empty — needs `category` field                                |
| Plan Status    | ✅ Works (derived)                                                       |
| Assigned To    | ⚠️ Hard-coded options `Dr. Holt` / `Dr. Voss` — should list real coaches |
| Mobile App     | ⚠️ Always "Not Connected" — needs `connectedApps`                       |
| Check-In       | ✅ Works (derived from `last_followup`)                                  |

### Other things to decide

1. **Patient ID format** — design shows `HC-0041`. Backend has `member_id: 41`.
   Currently we format as `HC-${pad(member_id, 4)}`. Is this OK or do you want
   the raw `member_id`?
2. **Avatar** — design shows initials only. Backend provides `picture`. Should
   we render the picture when available (and fall back to initials)?
3. **Pagination** — `/patients` returns _all_ patients in one shot. The footer
   shows static "1 / 2" buttons. Should we implement client-side pagination, or
   wait for a paginated server endpoint?
4. **Add Client** — the modal currently does **not** POST anywhere. We need a
   backend endpoint (or we can wire the existing `Application.addPatient(...)`
   style call if one exists).
5. **Row actions** — Message / View Plan / Schedule / Flag buttons are visual
   only. Each needs an endpoint or route to wire to.

---

## How the fallback works

```tsx
const [clients, setClients] = useState<Client[]>(mockData.items as Client[]);

useEffect(() => {
  Application.getPatients()
    .then((res) => {
      const raw = res?.data?.patients_list_data ?? [];
      setClients(raw.map(mapPatientToClient));
      // ...also populates AppContext.patientsList for other features
    })
    .catch(console.error);
}, []);
```

- **First render**: shows mock items immediately (no spinner).
- **On success**: replaces with mapped real patients.
- **On failure**: mock items remain visible; the error is `console.error`'d but
  no toast is shown (the global axios interceptor stays silent for this).
- **Side effect**: `AppContext.patientsList` is populated so other pages
  (reports, drift analysis, etc.) that depend on the patients list continue to
  work.

---

## Conventions (aligned with `Dashboard/`)

- **Enums** (urgency, planStatus, category, etc.) are stable strings — UI
  styling/colors are mapped on the frontend (`constants.ts`).
- **Initials** are derived in the frontend via `src/utils/getInitials.ts`.
- **Progress %** is derived from `enrollment.week / enrollment.totalWeeks`.
- **Colors** for category badges live in `constants.ts → CATEGORY_COLORS` with
  a fallback color for unknown categories.
