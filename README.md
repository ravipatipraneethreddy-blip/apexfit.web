# ApexFit

Personal training and nutrition tracking built with Next.js 16, React 19 and PostgreSQL/Prisma.

## Run and verify

Use Node.js 20.9 or newer. Set `DATABASE_URL` and `JWT_SECRET` in the local environment or your Vercel project. Keep the existing production values; this update does not require a database migration. No OpenAI or other language-model API key is needed. `RAPIDAPI_KEY` remains optional for the exercise catalogue, with built-in exercises as a fallback.

```sh
npm ci
npm test
npm run typecheck
npm run build
npm run dev
```

The test suite exercises the real rules, nutrition parser and server actions with mocked sessions and database methods. It includes ownership checks, failure propagation, repeated saves, offline replay, full workout history, local midnight and DST dates. It is not a substitute for a signed-in database/browser integration test.

If local sandbox restrictions prevent Turbopack from binding its compiler port, the supported alternative is `npm run build -- --webpack`. Production can retain the standard Vercel build command.

## Personal coach without an LLM

The coach recalculates from completed workouts, saved targets and recovery check-ins. It supports Push/Pull/Legs, Upper/Lower and Full Body; chosen weekdays; gym, dumbbells or bodyweight; experience; session length; rep ranges; and available load increments.

- A seven-day view keeps the programme sequence after missed days and includes rest days. A next session can be beyond the visible week.
- Per-exercise suggestions use actual completed sets. They favour rep progression before load increases, avoid mixed-load false positives and large jumps, and suggest easier sessions after poor recovery, extended gaps or repeated below-range performance.
- Pain and very high fatigue/soreness change the current recommendation to recovery. Future sessions remain provisional.
- Nutrition summaries use logged meals and saved targets. Food ideas come from the built-in database and respect the saved dietary preference; they are not a complete meal plan or allergy assessment.
- Weight trends use one reading per local day and compare weekly averages only when enough days have been logged.
- Recommendations open in the workout logger. Saving or syncing a workout refreshes the recommendation.

Settings, check-ins, reminders and unsynced drafts are saved for the account on that browser. They do not sync between devices. Saved meals and workouts remain in PostgreSQL. The coach is an explainable rules engine, not a trained language model or unrestricted chatbot.

The preset progression and recovery thresholds are product heuristics, not personalised medical assessments. Background reading: [ACSM 2026 resistance training guidance](https://acsm.org/resistance-training-guidelines-update-2026/) and [ACSM progression guidance](https://pubmed.ncbi.nlm.nih.gov/19204579/). The software does not claim clinical validation.

## Reliability and privacy changes

- Meal deletion/editing and workout retrieval/editing require the signed-in owner. Coaching actions require authentication. Badge and streak updates verify ownership.
- Profile data sent to clients uses an explicit safe-field selection and excludes password hashes. Failed profile writes report an error.
- Personal nutrition reports use authenticated queries without shared cross-user caching. The service worker caches only public assets and removes older ApexFit caches.
- Meal/workout saves carry an account-bound idempotency key and original timestamp. Reloads and concurrent retries do not create a second record. Offline entries use separate per-account keys and have visible retry, review and download controls.
- Legacy unsynced entries with no account ID are preserved for download and never assigned automatically to the current account.
- Drafts survive refreshes; saved templates keep sets and reps. Existing meals and workouts can be edited, including their dates.
- Full-history statistics and personal records no longer stop at ten workouts. The recent-history list still intentionally shows ten.
- Daily totals use the browser timezone, with Vercel's timezone header and Asia/Kolkata as fallbacks. Historical meal dates and DST report ranges use local calendar boundaries.
- Food lookup handles supported amounts and compounds deterministically. Unknown/partial matches require manual input instead of invented nutrition. Manual corrections remain when the editor is closed.
- All TypeScript build errors are enforced rather than ignored.

## Reminders and offline limits

Daily in-app reminders work while ApexFit is open. A downloadable recurring calendar event provides a reminder when the app is closed, after the user imports it and enables calendar notifications. This release does not implement server-scheduled Web Push delivery.

An already-open logger can save meal/workout entries to the device without a connection. Loading authenticated pages from a cold offline start is intentionally unsupported: private pages and account data are not cached by the service worker. Device storage must remain available until pending entries have synced.

## Release verification

- Automated regression tests, TypeScript checking and the production Webpack build were run locally.
- Vercel deployment status is checked after publication.
- Signed-in UI flows, real database operations, mobile-device behaviour and closed-app calendar delivery still need live verification. No existing customer records were used or modified for testing.
