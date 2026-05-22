# Dashboard — Backend API Contract

This dashboard is currently powered by **mock JSON files** under `./mocks/`.
When the backend is ready, each section can be wired to its endpoint without touching the UI.

---

## Folder Layout

```
Dashboard/
├── index.tsx                    ← orchestrator
├── DashboardHeader.tsx          ← uses mocks/dashboardHeader.json
├── ClinicalAttentionRadar.tsx   ← uses mocks/clinicalAttentionRadar.json
├── EngagementHealth.tsx         ← uses mocks/engagementHealth.json
├── AiPriorityQueue.tsx          ← uses mocks/aiPriorityQueue.json
├── CommunicationCenter.tsx      ← uses mocks/communicationCenter.json
├── InterventionInsights.tsx     ← uses mocks/interventionInsights.json
├── ActivePatientGrowth.tsx      ← uses mocks/activePatientGrowth.json
├── EmptyState.tsx               ← shared "No data" UI
└── mocks/                       ← exact JSON shapes the backend should return
```

Each mock file is the canonical example of the response body for its endpoint.

---

## Endpoints

All endpoints are `POST` and follow the same pattern as the rest of the project (`src/api/api.ts`).
The frontend API class is at `src/api/AppendUiDashboard.ts`.

| Section                  | Endpoint                                             | Mock file                     |
| ------------------------ | ---------------------------------------------------- | ----------------------------- |
| Dashboard header         | `POST /append_ui_dashboard/header`                   | `dashboardHeader.json`        |
| Clinical Attention Radar | `POST /append_ui_dashboard/clinical_attention_radar` | `clinicalAttentionRadar.json` |
| Engagement Health        | `POST /append_ui_dashboard/engagement_health`        | `engagementHealth.json`       |
| AI Priority Queue        | `POST /append_ui_dashboard/ai_priority_queue`        | `aiPriorityQueue.json`        |
| Communication Center     | `POST /append_ui_dashboard/communication_center`     | `communicationCenter.json`    |
| Intervention Insights    | `POST /append_ui_dashboard/intervention_insights`    | `interventionInsights.json`   |
| Active Patient Growth    | `POST /append_ui_dashboard/active_patient_growth`    | `activePatientGrowth.json`    |

All requests include the standard `Authorization: Bearer <token>` header. The body is currently `{}` but each endpoint can accept future filter params (date range, clinic id, etc.).

---

## Response Shapes

### 1. `POST /append_ui_dashboard/header`

```json
{
  "totalPatients": 135,
  "isLive": true,
  "syncedAt": "2026-05-21T10:26:00Z"
}
```

| Field           | Type     | Notes                                                    |
| --------------- | -------- | -------------------------------------------------------- |
| `totalPatients` | number   | Total active patients in the clinic                      |
| `isLive`        | boolean  | Whether realtime sync is active                          |
| `syncedAt`      | ISO 8601 | UTC timestamp of last sync (frontend formats relatively) |

---

### 2. `POST /append_ui_dashboard/clinical_attention_radar`

```json
{
  "immediate": 12,
  "monitor": 34,
  "stable": 89
}
```

| Field       | Type   | Notes                                   |
| ----------- | ------ | --------------------------------------- |
| `immediate` | number | Patients needing immediate intervention |
| `monitor`   | number | Patients to monitor                     |
| `stable`    | number | Patients on track                       |

> Frontend computes percentages from these three values.

---

### 3. `POST /append_ui_dashboard/engagement_health`

```json
[
  { "key": "lab_coverage", "label": "Lab Coverage", "value": 74 },
  { "key": "wearable", "label": "Wearable", "value": 58 },
  { "key": "app_active", "label": "App Active", "value": 82 },
  { "key": "follow_ups_due", "label": "Follow-ups Due", "value": 21 },
  { "key": "ai_plans", "label": "AI Plans", "value": 67 }
]
```

| Field   | Type   | Notes                                         |
| ------- | ------ | --------------------------------------------- |
| `key`   | string | Stable enum key — frontend maps it to a color |
| `label` | string | Display label                                 |
| `value` | number | Percentage (0–100)                            |

**Known keys** (color-mapped on the frontend): `lab_coverage`, `wearable`, `app_active`, `follow_ups_due`, `ai_plans`. Any new key gets a fallback color.

---

### 4. `POST /append_ui_dashboard/ai_priority_queue`

```json
{
  "items": [
    {
      "id": "pq_001",
      "patientId": "pat_001",
      "name": "Mona Azami",
      "priority": "immediate",
      "reason": "Missing ApoB biomarker — overdue 14 days",
      "isUnread": true
    }
  ],
  "pagination": {
    "page": 1,
    "perPage": 20,
    "total": 8,
    "hasMore": false
  }
}
```

| Field                | Type    | Notes                                             |
| -------------------- | ------- | ------------------------------------------------- |
| `items[].id`         | string  | Unique queue item id                              |
| `items[].patientId`  | string  | Reference to the patient record                   |
| `items[].name`       | string  | Patient full name (initials computed by frontend) |
| `items[].priority`   | enum    | `"immediate" \| "monitor" \| "stable"`            |
| `items[].reason`     | string  | Short reason / trigger                            |
| `items[].isUnread`   | boolean | Whether the practitioner has seen this            |
| `pagination.page`    | number  | Current page (1-based)                            |
| `pagination.perPage` | number  | Items per page                                    |
| `pagination.total`   | number  | Total queue size                                  |
| `pagination.hasMore` | boolean | Whether there are more pages                      |

> Future request params: `{ page, perPage, filterPriority }`.

---

### 5. `POST /append_ui_dashboard/communication_center`

```json
{
  "summary": {
    "unreadCount": 4,
    "waitingOver24hCount": 2
  },
  "items": [
    {
      "id": "msg_001",
      "patientId": "pat_001",
      "name": "Mona Azami",
      "snippet": "Hi doctor, I had my ApoB test done yesterday…",
      "sentAt": "2026-05-21T08:30:00Z",
      "isWaiting": false
    }
  ],
  "pagination": {
    "page": 1,
    "perPage": 20,
    "total": 4,
    "hasMore": false
  }
}
```

| Field                         | Type     | Notes                                                      |
| ----------------------------- | -------- | ---------------------------------------------------------- |
| `summary.unreadCount`         | number   | **Total** unread across the clinic (not just current page) |
| `summary.waitingOver24hCount` | number   | **Total** messages waiting >24h                            |
| `items[].sentAt`              | ISO 8601 | UTC timestamp — frontend formats relatively                |
| `items[].isWaiting`           | boolean  | Whether this message has been waiting >24h                 |

> The counts must be computed server-side, not derived from `items.length`, because items are paginated.

---

### 6. `POST /append_ui_dashboard/intervention_insights`

```json
{
  "programs": [
    { "key": "peptide_therapy", "label": "Peptide Therapy", "count": 28 },
    {
      "key": "lifestyle_optimization",
      "label": "Lifestyle Optimization",
      "count": 45
    },
    { "key": "diet_intervention", "label": "Diet Intervention", "count": 33 },
    { "key": "sleep_protocol", "label": "Sleep Protocol", "count": 19 }
  ],
  "metrics": {
    "adherenceRate": 76,
    "planCompliance": 68,
    "inactiveUsers": 14,
    "completed": 31
  }
}
```

| Field                    | Type   | Notes                                             |
| ------------------------ | ------ | ------------------------------------------------- |
| `programs[].key`         | string | Stable enum key — mapped to color on the frontend |
| `programs[].label`       | string | Display label                                     |
| `programs[].count`       | number | Active patients enrolled                          |
| `metrics.adherenceRate`  | number | Percentage 0–100                                  |
| `metrics.planCompliance` | number | Percentage 0–100                                  |
| `metrics.inactiveUsers`  | number | Count of inactive users in last 30 days           |
| `metrics.completed`      | number | Count of completed programs                       |

**Known program keys**: `peptide_therapy`, `lifestyle_optimization`, `diet_intervention`, `sleep_protocol`.

---

### 7. `POST /append_ui_dashboard/active_patient_growth`

```json
{
  "currentActive": 135,
  "changePercent": 5.5,
  "trend": [
    {
      "period": "2025-08",
      "label": "Aug",
      "active": 98,
      "new": 14,
      "churned": 3
    },
    {
      "period": "2026-01",
      "label": "Jan",
      "active": 135,
      "new": 15,
      "churned": 8
    }
  ]
}
```

| Field             | Type   | Notes                                        |
| ----------------- | ------ | -------------------------------------------- |
| `currentActive`   | number | Current total active patients                |
| `changePercent`   | number | % change vs previous month (can be negative) |
| `trend[].period`  | string | `YYYY-MM` machine-readable period            |
| `trend[].label`   | string | Short label for X axis (e.g. `Jan`)          |
| `trend[].active`  | number | Active patients in that period               |
| `trend[].new`     | number | New onboarded patients in that period        |
| `trend[].churned` | number | Churned patients in that period              |

---

## Empty / No Data Handling

Every section renders a `<EmptyState />` ("No data available") when its core data is missing or empty:

| Section                  | Empty condition                              |
| ------------------------ | -------------------------------------------- |
| Clinical Attention Radar | `immediate + monitor + stable === 0`         |
| Engagement Health        | `items.length === 0`                         |
| AI Priority Queue        | `items.length === 0`                         |
| Communication Center     | `items.length === 0` (summary still renders) |
| Intervention Insights    | `programs.length === 0`                      |
| Active Patient Growth    | `trend.length === 0`                         |

Backend can safely return empty arrays / zero values and the UI will display a clean empty state.

---

## Connecting the Backend (When Ready)

The API class is already prepared at `src/api/AppendUiDashboard.ts`. To wire a section up:

1. Import the API class and React hooks in the section component.
2. Replace the direct mock import with `useState` + `useEffect`:

```tsx
import { useEffect, useState } from 'react';
import AppendUiDashboardApi from '../../../../api/AppendUiDashboard';
import mockData from './mocks/engagementHealth.json';

const EngagementHealth = () => {
  const [items, setItems] = useState<EngagementItem[]>(mockData);

  useEffect(() => {
    AppendUiDashboardApi.getEngagementHealth()
      .then((res) => {
        if (Array.isArray(res?.data)) setItems(res.data);
      })
      .catch((err) => {
        console.error('Error getting engagement health:', err);
      });
  }, []);

  // ... rest of the component
};
```

Until then, the dashboard renders entirely from the mock JSON files.

---

## Conventions

- **Times** are ISO 8601 UTC strings. The frontend uses `formatRelativeDate()` from `src/utils/formatRelativeDate.ts`.
- **Initials** are derived in the frontend (`src/utils/getInitials.ts`) from `name`. Backend should never send `initials`.
- **Colors** are decided in the frontend based on stable `key` values. Backend should never send hex colors.
- **Pagination summaries** (`unreadCount`, etc.) must come from the server, since the items array is paginated.
- **Enums** (priority, program key, etc.) must be stable snake_case strings — UI text comes from `label` fields.
