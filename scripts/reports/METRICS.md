# Privacy Budget — metric dictionary (`players` collection)

All KPIs below are computed from the **MongoDB `players`** collection (`mongoose.model('Player')`) using `scripts/reports/privacyBudgetMetrics.mjs`. No separate telemetry collection is required.

**Temporal filter:** by default counts **all** documents. Pass `--from YYYY-MM-DD --to YYYY-MM-DD` (UTC midnight bounds) to filter by **`players.createdAt`**.

---

## Cohort semantics

| Term | Definition |
|------|-------------|
| **Start** | A `Player` document exists (successful create after Welcome). Indexed by `createdAt` when filtering. |
| **Complete / completer** | `privacyBudgetCompletedAt` is not null (full 10-level run recorded). |
| **Completion rate** | `completes ÷ starts` for the same date filter on `createdAt`. |
| **Per-level submission** | One element inside `privacyBudgetLevelResults[]` (one PATCH after “Post Now” for that level). |

---

## KPI list (implementations align with export script)

### 1) Starts (`starts`)

Number of documents matching the optional **`createdAt`** range.

---

### 2) Completes (`completes`)

Same filter, plus `privacyBudgetCompletedAt != null`.

---

### 3) Completion rate (`completionRate`)

`completes / starts`. Null if starts = 0.

---

### 4) Average & median privacy budget score (completers)

**Population:** completers (`privacyBudgetCompletedAt` set) within the same `createdAt` filter.

- **Mean:** average of `privacyBudgetTotalScore`
- **Median:** median of the same field (computed in application code after sort)

---

### 5) Feedback band distribution

**Granularity:** one row per **level submission**.

Pipeline: `$unwind` `privacyBudgetLevelResults` → `$group` by `privacyBudgetLevelResults.feedbackBand`.

Each row includes `count` and **share of submissions** (count / sum of counts).

---

### 6) Funnel — “reached at least level K”

For each `K` in 1…10:

- **maxLevel** = `$max` of `privacyBudgetLevelResults.levelId` (null if no results)
- **Count** = players with `maxLevel >= K` (same `createdAt` filter)
- **Share of starts** = that count ÷ `starts`

**Interpretation:** among **all** starts in the window, what fraction **ever** submitted at least level *K* (sequential play is assumed; out-of-order submissions would be rare).

---

### 7) Caption mode mix

**Granularity:** per level submission.

`$unwind` results → `$group` by `selectedCaptionMode` (`keep` | `edit`).

Reported as **share of submissions** per mode.

---

### 8) Session duration (completers only, extra)

For completers:  
`durationSec = (privacyBudgetCompletedAt - createdAt) / 1000`

Report **mean** and **median** in seconds. Long tails are possible; note skew if you quote medians on a resume.

---

## MongoDB Compass — pasteable pipelines

Replace `ISODate("...")` bounds or remove the `$match` on `createdAt` for all-time.

### Starts & completion rollup

```json
[
  {
    "$match": {
      "createdAt": {
        "$gte": { "$date": "2026-01-01T00:00:00.000Z" },
        "$lte": { "$date": "2026-04-30T23:59:59.999Z" }
      }
    }
  },
  {
    "$group": {
      "_id": null,
      "starts": { "$sum": 1 },
      "completes": {
        "$sum": {
          "$cond": [{ "$ifNull": ["$privacyBudgetCompletedAt", false] }, 1, 0]
        }
      }
    }
  },
  {
    "$project": {
      "_id": 0,
      "starts": 1,
      "completes": 1,
      "completionRate": {
        "$cond": [
          { "$gt": ["$starts", 0] },
          { "$divide": ["$completes", "$starts"] },
          null
        ]
      }
    }
  }
]
```

### Feedback bands (distribution)

```json
[
  { "$match": {} },
  { "$unwind": "$privacyBudgetLevelResults" },
  {
    "$group": {
      "_id": "$privacyBudgetLevelResults.feedbackBand",
      "count": { "$sum": 1 }
    }
  },
  { "$sort": { "count": -1 } }
]
```

### Funnel facet (levels 1–10)

Run the scripted report for the full `$facet`; hand-built facet is verbose. Prefer:

```bash
node scripts/reports/privacyBudgetMetrics.mjs --from 2026-01-01 --to 2026-04-30
```

---

## Caveats (resume / stakeholder honesty)

1. **One nickname = one row.** Unique `name` means “replay” replaces the UX pattern unless you rename or wipe data—completion rates describe **sessions created**, not literal human users.

2. **Filtering by `createdAt`** does **not** include completions that occurred later if the player was created earlier (window excludes them)—for “activity in April” vs “profiles created in April,” adjust definitions and document.

3. **`privacyBudgetCompletedAt`** is the authoritative **complete** signal for this codebase.

---

## Files

| File | Purpose |
|------|---------|
| `scripts/reports/privacyBudgetMetrics.mjs` | Run KPI export + JSON snapshot |
| `reports/privacy-budget-metrics-*.json` | Saved output (gitignored pattern optional) |
