# Frontend Reproduction Runbook

## CAP-13 (Table)

| ID | Story | Priority | Acceptance (sketch) | Owner | Lab |
| -- | ----- | -------- | -------------------- | ----- | --- |
| CAP-13 | Search, view, and log interactions for a customer from the UI | P0 | Search Amina → select → profile loads → log an interaction → timeline reflects it → survives reload | `[FRONTEND]` | 50 |

## CAP-13 Acceptance Criteria

1. Search returns matching customers (exact ID or partial name), including an empty-query "load all" case.
2. Selecting a customer loads their profile and interaction timeline.
3. Submitting a valid interaction shows it in the timeline without a full page reload.
4. Invalid input (blank/over-length summary) is rejected client-side before any request is sent, and a `400` from the server is surfaced as a field-level, screen-reader-announced error.
5. Network/outage and unauthorized (401/403, not yet reachable — Lab 51) states are visibly distinct from a normal validation error, with retry guidance where retrying could actually help.
6. The full journey (search → select → view → log → verify) is operable by keyboard alone, with focus moved to the relevant result on both success and failure.

## Technical Touchpoints

- **API client** — `CustomerApiClient` (`search`, `getProfile`, `create`, `updateStatus`) and `InteractionApiClient` (`get`, `create`), both built on a single shared `http()` wrapper (plain `fetch`, no axios).
- **Types** — `Customer`, `CustomerDraft`, `CustomerStatus`, `Interaction`, `InteractionDraft`, `InteractionType`, `ProblemDetail`, mirrored directly against the backend's `CustomerResponse`/`InteractionResponse`/`CreateCustomerRequest`/`CreateInteractionRequest`/`UpdateCustomerStatusRequest` DTOs.
- **Error handling** — a single `ApiError` class (`kind: 'network' | 'http' | 'abort' | 'parse'`, plus `status`) built once in `http.ts`, consumed uniformly by every hook and every `ErrorState` call site.
- **Correlation header** — `X-Correlation-Id: lab-request-001`, sent only on `POST /api/v1/interactions`, not on any other endpoint (matches CAP-12's fixture correlation ID, verified in the same header the backend logs against).
- **State/hooks** — one custom hook per data concern (`useCustomerSearch`, `useCustomerProfile` — merged with the status-update mutation, `useInteractions` — combined read/write), each exposing `status`/`error`/`retry` in a consistent shape.
- **Accessibility** — real `<label>`/`<button>`/`<form>` elements throughout (no click-only `div`s, no placeholder-as-label), `aria-describedby`/`aria-invalid`/`role="alert"` on the interaction form, focus management via `useRef` on both success and failure, semantic landmarks (`main`, `header`) at the app root.

## Definition of Done + Demo Evidence

**Definition of Done** — all 6 acceptance criteria pass; `npm run lint` / `npm test -- --run` / `npm run build` all green; one E2E journey (search → save → assert timeline text) passes; UI-created data is independently confirmed via direct API call and direct SQL query; UI-created data survives a backend restart; an invalid submission is confirmed to leave no row in the database.

**Demo evidence checklist** — one artifact per criterion, decided up front:

1. Screenshot of search returning both Amina and Ravi on an empty query, plus a filtered search for "Amina."
2. Screenshot of Amina's profile + timeline loading after selection.
3. Screenshot/gif of the timeline updating immediately after a successful interaction submission, with the "Interaction saved" confirmation visible in the accessibility tree.
4. Screenshot of an empty-summary submission being blocked client-side (button disabled), plus a `curl` `400` response for a server-side validation failure with the `role="alert"` field error rendered.
5. Screenshot of the outage state (backend stopped) and a mocked/simulated 401/403 state, shown side by side to demonstrate they're visually and textually distinct.
6. A recorded/written keyboard-only walkthrough per the checklist below.

## Fixture Plan

- `CUS-1001` (Amina Khan, `ACTIVE`) and `CUS-1002` (Ravi Singh, `PROSPECT`) — seeded on the backend via Flyway (CAP-12's `V3__create_customer.sql`), confirmed reachable via `GET /api/v1/customers/CUS-1001` returning `200` with matching data.
- `CUS-9999` reserved as the not-found fixture for exercising the 404/empty-profile UI path — deliberately never seeded.
- Correlation ID `lab-request-001` sent on every `POST /api/v1/interactions` from the UI, matching CAP-12's fixture correlation ID so backend and frontend evidence can be tied to the same identifier.
- No auth fixture exists yet — `authHeaders()` is a stub returning `{}`, consistent with Lab 51 deferring real authentication; 401/403 UI states are built but not currently reachable against the live backend.

## Step 1 — API client and types

**Base client:** `http.ts`, one shared function wrapping plain `fetch`, pointed at `VITE_API_BASE_URL` (set via `.env`, required — an unset value silently resolves requests against the Vite dev server itself rather than the backend, which was caught and fixed early via a `Failed to parse successful server response` symptom traced back to a missing `.env`).

**Error normalization:** every failure path — network failure, `AbortError`, non-2xx HTTP response, and JSON parse failure on an otherwise-`200` response — is caught and rewrapped into a single `ApiError` class (`kind`, `status`, inherited `message`). Callers never handle raw `fetch` rejections or raw `Response` objects directly.

**`ProblemDetail` typing:** the backend's `GlobalExceptionHandler` returns RFC 7807 Problem Details (`type`/`title`/`status`/`detail`/`instance`), not the field-level `fieldErrors` map originally assumed from a generic spec template. `http.ts` extracts `problem.detail || problem.title` as the `ApiError` message; no client-side parsing of the joined validation string was implemented (evaluated and deliberately rejected as fragile — see Step 2).

**`authHeaders()` stub:** returns `{}` unconditionally. Present so wiring in real auth later (Lab 51) doesn't require changing any caller of `http()`.

**Correlation header placement — corrected after a regression:** initially specified as living in `InteractionApiClient.create`'s own call, not the shared `http()` wrapper (so it doesn't leak onto `GET`/`PATCH`/other endpoints). A later refactor accidentally dropped the header from `create` entirely; caught by `interactionsApi.test.ts`'s dedicated header-inspection test (asserting on `fetchSpy.mock.calls[0]`'s `headers`), not by manual testing — manual Network-tab inspection had missed the regression.

**Type mismatches resolved against real backend DTOs:**
- `InteractionApiResponse.id` (not `interactionId`) matches the backend's actual `InteractionResponse.id: UUID` field; the mismatch was mapped once, inside `mapToInteractions`, so the rest of the frontend's domain type (`Interaction.interactionId`) keeps its own internal naming.
- `correlationId` made optional (`string | undefined`) on both `Interaction` and `InteractionDraft`, matching the backend DTO's lack of `@NotBlank` on that field.
- `CustomerDraft` narrowed to exactly `{ fullName, email }`, matching `CreateCustomerRequest`'s only two `@NotBlank`/`@Email`-validated fields.
- `updateStatus`'s request body corrected from sending the raw status string to `{ newStatus: status }`, matching `UpdateCustomerStatusRequest`'s single `newStatus` field — caught before it reached manual testing, then locked in with a dedicated body-shape test.

## Step 2 — Accessible UI states

**Loading/empty/success/invalid/unauthorized/outage — one `ErrorState` component, three branches:**
- `status === 401 || status === 403` → distinct "not authorized" copy, retry button hidden (retrying an auth failure can't succeed without a sign-in action that doesn't exist yet).
- `kind === 'network' || status >= 500` → distinct "can't reach the server" copy with retry guidance, verified live by stopping the backend process and confirming the UI never shows a false-success state.
- Anything else (`400`, etc.) → the raw `ProblemDetail`-derived message, surfaced via `role="alert"`.

**Field-level validation mapping — deliberately not built as structured `fieldErrors`:** the backend's `GlobalExceptionHandler` joins all Bean Validation failures into one semicolon-separated string inside `ProblemDetail.detail`, with no real per-field map. Two options were evaluated: parsing that joined string client-side (rejected — fragile, breaks on any message containing `": "` or `"; "`, and couples the frontend to backend string formatting with no version guarantee), versus surfacing the joined string as a single form-level alert tied to the summary field via `aria-describedby` (chosen — matches what the backend actually provides, satisfies the "map detail into form alerts" requirement without inventing structure the API doesn't have).

**Focus management (`InteractionForm`):** on successful submit, focus moves to a `tabIndex={-1}`, `aria-live="polite"` confirmation element (`sr-only`, visually hidden, screen-reader-visible) rather than leaving focus on the submit button with no confirmation. On failure, focus returns to the summary field itself, which — because `aria-describedby` conditionally includes the error paragraph's `id` once an error exists — causes the error to be announced the moment focus lands, without a separate live-region announcement.

**Known regression, caught and fixed:** the success confirmation's render condition (`!submitting && !submitError`) was true on initial mount, before any submission — meaning "Interaction saved" was present in the accessibility tree (though visually hidden via `sr-only`) without any user action. Reported by a teammate testing the UI. Fixed with an explicit `justSaved` boolean, set `true` only inside the success branch of `handleSubmit`, reset `false` on the next keystroke.

**Duplicate-submit prevention:** `canSubmit` gates on a `submitting` boolean set synchronously (before any `await`) at the top of `handleSubmit`, so a rapid double-click sees the button already disabled by the second click. Not covered by an explicit rapid-double-click automated test; verified manually.

**Semantic structure:** `<main>`/`<header>` landmarks at the app root; every input has a real `<label htmlFor>` (no placeholder-only labels); every clickable list item (`CustomerList`) is a real `<button>`, not a `div` with an `onClick` handler — this is what makes native Tab/Enter/Space behavior work without any custom keyboard handling code.

## Step 3 — Component architecture and state ownership

**Split by data lifecycle, not by visual grouping:** `CustomerSearch` (query string → live-updating list, refetches on every keystroke — debounce evaluated and deferred as out of scope) is a sibling of `CustomerProfile` (single `customerId` → one fetch, mounted only once a customer is selected) under `App`, which owns exactly one piece of shared state (`selectedCustomerId`) tying the two together. Neither component knows the other exists.

**`CustomerProfile` merges profile-read and status-update concerns into one hook** (`useCustomerProfile`), rather than splitting them, since both operate on the same `customer` object in the same component for the same reason — evaluated against keeping them separate, and merged specifically because the split version would have required either a refetch-after-write round trip or awkward cross-hook coordination for no real benefit at this scale. Fetch and update expose disambiguated state (`fetchStatus`/`fetchError` vs `updateStatus`/`updateError`) to avoid a naming collision at the call site.

**`InteractionTimeline` and `InteractionForm` share one `useInteractions` hook**, called once in `CustomerProfile` and passed down as props to both children — chosen over each component independently calling `useInteractions` (which would give each its own disconnected copy of the interactions array, and a create in the form would never appear in the timeline).

**Return-to-list behavior:** `CustomerProfile` accepts an `onClose` callback, wired to clear `selectedCustomerId` back to `null` in `App`. Closing the profile also remounts `CustomerSearch` (via a `key` prop bumped on close) to force a fresh search — added after a teammate reported the list not reflecting a status change made from the profile view, since `CustomerSearch`'s and `CustomerProfile`'s customer data live in two independent `useState` instances with no shared source of truth. Trade-off accepted: the remount also clears any previously typed search query.

**Retry mechanics:** every fetching hook exposes a `retry()` function backed by an internal `refetchIndex` counter in its `useEffect` dependency array (not a no-op `setState(x => x)`, which was the first attempt and doesn't actually retrigger the effect).

## Step 4 — Testing

**Component tests (Vitest + React Testing Library):** `InteractionForm`, `InteractionTimeline`, `InteractionCard`, `CustomerSearch`, `CustomerList`, `CustomerProfile` — all queried via `getByRole`/`getByLabelText`, not CSS selectors, so tests stay stable against markup/styling changes. `CustomerSearch`/`CustomerProfile` mock their API client modules directly (`vi.mock`) rather than hitting the network, since both call the API client internally through their hooks rather than receiving data as props.

**API client tests:** `customersApi.test.ts` and `interactionsApi.test.ts`, both against a mocked `globalThis.fetch`, covering the success shape, the empty/204 case, a `400`/`404`/`409` mapped through `ProblemDetail` → `ApiError`, network failure, and abort. Two tests exist specifically to prevent regression of bugs already found once: the `updateStatus` body-shape test (`{ newStatus: status }`, not the raw status value) and the correlation-header test (present on `create`, verified via inspecting the actual `fetch` call arguments).

**E2E (Playwright):** one critical-path journey — search "Amina" → select → fill and submit the interaction form → assert the new summary text appears in the timeline — using a `Date.now()`-suffixed summary string per run to avoid collisions with prior runs' leftover data. Requires the Spring backend running against real Postgres and the Vite dev server (auto-started by Playwright's `webServer` config) simultaneously.

**Linting:** `react-hooks/set-state-in-effect` fired on two distinct patterns in the data-fetching hooks — one genuinely avoidable (resetting state to an empty/idle value derivable from `customerId` alone, fixed by computing it during render instead of via `setState` in the effect) and one not avoidable (`setStatus('loading')` before starting an async fetch, which has no render-time equivalent since the loading state doesn't exist until the effect runs) and was suppressed with an inline justification comment rather than restructured. The `@typescript-eslint/no-explicit-any` rule caught a bare `catch (error: any)` in `http.ts`, replaced with `catch (error: unknown)` plus explicit `instanceof` narrowing before any property access.

## Step 5 — Persistence verification

**Completed the step-by-step walkthough detailed in lab 50** Created an interaction for `CUS-1001` which submitted to the api via the UI. Used cUrl to inspect that the request was posted to the server. Additionally, inpsected the database on the docker image using `SELECT * FROM customer_interactions WHERE customer_id == "CUS-1001"` to confirm a `new row` was added. Shut down UI and backend. Restarted both programs to find the test interaction still there for `CUS-1001`

## Known Gaps

- **Docker/Testcontainers not available in this environment** — `InteractionEventKafkaIT` (backend-owned integration test) fails at `mvn verify` with `Can't get Docker image: apache/kafka:3.8.0`, since no Docker daemon is running/installed locally. Noted as an environment gap, not a code defect; unit-level `mvn verify` (surefire) is unaffected. Backend team owns follow-up.
- **No debounce on live customer search** — every keystroke in `CustomerSearch` triggers a new request (aborting the previous one via `AbortController`); functionally correct but not efficient. Deferred as out of scope for this pass.
- **`@Version`/optimistic locking on `Customer`** — discussed but not implemented; the status-change dropdown currently has no database-level protection against two near-simultaneous writes to the same customer beyond the UI-level "disable while submitting" guard. Flagged as a candidate follow-up given `PATCH /customers/{id}/status` is a genuine, exercised concurrent-write path now that the dropdown exists.
- **Rapid-double-submit on `InteractionForm`** — guarded via a synchronous `submitting` flag, not covered by an automated test exercising the actual race condition.