# Clarification Disposition: Sprint Dashboard Prototype

- **Reviewed documents**: `spec/constitution.md`, `spec/specification.md`
- **Review date**: 2026-09-28
- **Status**: All 18 review findings have a disposition. Decisions are recorded in `spec/specification.md`; listed exclusions are not part of the local prototype.

| # | Finding | Disposition | Specification resolution |
|---:|---|---|---|
| 1 | Intended users vs local-only access | Answered; shared access out of scope | PM operates the app on loopback. Team can observe locally; remote access, authentication, authorization, and client access are excluded. |
| 2 | Project/active sprint selection | Answered | Seed contains one project/team and at most one active sprint. The demo fixture has one; a no-active fixture tests the 404 state. There are no selectors; multiple project/active-sprint data is invalid. |
| 3 | Calendar/timezone/boundaries | Answered | UTC; Monday-Friday; no holidays; start/end inclusive; as-of is the latest complete snapshot. Missing snapshot is invalid rather than interpolated. |
| 4 | Scope/re-estimation accounting | Answered; re-estimation out of scope | Original points freeze at kickoff. Aggregate add/remove events reconcile to current issue scope. Mid-sprint estimate edits and issue-level event attribution/reasons are excluded. |
| 5 | Pace formula and API field | Answered | Expected completion is original points × elapsed working days / total working days; variance is actual minus expected. Express returns both values, rounded to two decimals. |
| 6 | Exact stack pins | Answered as implementation gate | Exact versions and image digests are selected and committed during toolchain bootstrap, before implementation, per the constitution. They are not feature behavior. |
| 7 | Freshness source and refresh | Answered; refresh out of scope | `as_of_at` is the complete fixture snapshot time. Data older than 24 hours is stale. Runtime refresh is excluded; fixture edit/reseed is atomic. |
| 8 | Status mapping and description test | Answered; custom mapping/description storage out of scope | Only the four defined statuses are accepted. Unknown values invalidate seed data. Blocked state uses only `flagged`; summaries are tested without storing descriptions. |
| 9 | API nullability/enums/empty cases | Answered | Nullable fields, status/freshness values, zero-count groups, zero scope, empty active sprint, and no active sprint behavior are defined in the response contract. |
| 10 | Scope-change detail | Answered; reasons/issue links out of scope | UI shows dated aggregate additions/removals and totals. Scope events have no reason or issue reference. |
| 11 | Full issue set/pagination | Answered; pagination and production scale out of scope | The prototype returns the complete issue set for one seeded sprint; filters are client-side. |
| 12 | Retry and response validation | Answered | Shared contracts validate API responses in API and browser. Retry is user-triggered for transient network/503 failures; no automatic retry. |
| 13 | Unauthenticated network binding | Answered; remote access out of scope | API and Vite bind to `127.0.0.1`; no authentication because only fictional local data is served. |
| 14 | DB constraints/deletion behavior | Answered; individual deletion out of scope | Unique active-sprint/project and issue/sprint keys are enforced. Seed replacement is transactional; no row deletion API exists. |
| 15 | Accessibility/performance targets | Answered; production performance out of scope | Dashboard targets WCAG 2.2 AA and desktop/mobile viewport checks. Production scale, concurrency, and load targets are excluded. |
| 16 | Roster lifecycle | Answered; roster management out of scope | Seed has exactly 10 active members; all appear even with zero points. Inactive roster management is excluded. |
| 17 | Health/error UI behavior | Answered | Health is an operational readiness endpoint only. UI uses dashboard response errors: 404 no-sprint, 503 retryable, 500 non-retryable data error. |
| 18 | Atomic snapshot semantics | Answered | One `as_of_at` identifies a complete fixture snapshot; seed validation and replacement are atomic. Partial refresh is not supported. |

## Remaining Implementation Gate

No product clarification remains open for the prototype. Implementation is still blocked until exact dependency/runtime versions and the PostgreSQL image digest are pinned and CI is configured to verify them, as required by `spec/constitution.md`.