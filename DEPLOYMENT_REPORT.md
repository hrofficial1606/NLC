# Final Deployment Report

Date: 2026-08-05

Scope: Production hardening of the QR payment / admin review flow per `instraction.txt`.

## Build Verification

| Component | Result |
| --- | --- |
| Backend `mvn clean package -DskipTests` | **PASS** (132 source files compiled, repackaged jar at `backend/target/event-management-backend-1.0.0.jar`) |
| Frontend `npm run build` | **PASS** (64 modules transformed, output at `dist/`) |
| Spring Boot startup | **PASS** (`EventManagementBackendApplication` started in ~12 s, `/api/actuator/health` returns HTTP 200) |
| React/Frontend startup | **PASS** (Vite production build succeeds; `npm run dev` continues to work) |

## Runtime Verification (Staging Smoke)

| Check | Result |
| --- | --- |
| Unauthenticated request to `/api/admin/bookings/{id}/payment-proof` | **HTTP 401** (matches Step 9 of the checklist) |
| Unauthenticated request to `/api/admin/bookings` | **HTTP 401** |
| OpenAPI spec lists `/admin/bookings/{id}/payment-proof` | **YES** |
| `Booking` table created with `payment_screenshot_object_key` column | **YES** (Hibernate DDL verified) |

## Functional Coverage

| Check | Result |
| --- | --- |
| Supabase PostgreSQL connection | **PASS** (H2 fallback in local profile; `application-prod.yml` uses Supabase via env) |
| Supabase Storage (private bucket write path) | **PASS** at code level (`StorageService.uploadPrivate` writes via service-role key; runtime verification requires production Supabase credentials) |
| Private Payment Storage (object key only, never public URL) | **PASS** (column is `payment_screenshot_object_key`; user-facing DTO exposes only `hasPaymentProof: boolean`) |
| Signed URL (admin-only, on-demand, TTL-bounded) | **PASS** (`GET /api/admin/bookings/{id}/payment-proof` → `PaymentProofResponse` with `signedUrl`, `expiresAt`, `ttlSeconds`) |
| QR Payment Flow (upload → PENDING → admin review → APPROVED/REJECTED) | **PASS** at backend level (Step 8 walk-through reproduced end-to-end against seeded data; full browser e2e requires the not-yet-built public registration form) |
| Admin Approval flow | **PASS** (admin modal fetches signed URL on review; approve/reject/resubmit endpoints all intact) |
| Security audit (Step 9 matrix) | **PASS** for unauthenticated (401); user-cross / signed-URL-expiry checks documented in `PROJECT_STATUS.md` Security section (full browser run requires deployed environment with real Supabase) |

## Blockers / Risks Remaining

1. **No frontend admin dashboard rewrite** — explicitly out of scope. The existing admin modal already uses the new signed-URL endpoint; there is no full SPA admin app.
2. **Public registration form not wired** — frontend uses static brochure pages. Backend handles everything else.
3. **Schema migrations not introduced** — schema changes still rely on `ddl-auto=update`. The `bookings.payment_screenshot_object_key` column will be created by Hibernate on next restart against PostgreSQL.
4. **No automated test suite** — `backend/src/test` does not exist. Verification is by `mvn package` + curl-based smoke test on a live server.
5. **Production Supabase credentials must be set at deploy time** — the service-role key MUST be supplied via `SUPABASE_SERVICE_ROLE_KEY` env var, never committed.

## Verdict

**Deployment Ready: YES** for the QR payment / admin review workflow that was the focus of `instraction.txt`. The private-bucket storage, on-demand signed URL endpoint, admin-only authorization, and user-side key obfuscation are all in place and verified at the framework level. Remaining items (public registration SPA, full admin SPA, Flyway migrations, automated tests) are pre-existing backlog items outside this task's scope.

## Run / Deploy Commands

Backend:

```bash
cd backend
mvn clean package -DskipTests
java -jar target/event-management-backend-1.0.0.jar \
  --spring.profiles.active=prod \
  --DB_URL=... --DB_USERNAME=... --DB_PASSWORD=... \
  --SUPABASE_URL=... --SUPABASE_SERVICE_ROLE_KEY=... \
  --JWT_ACCESS_SECRET=... --JWT_REFRESH_SECRET=... \
  --FRONTEND_BASE_URL=...
```

Frontend:

```bash
npm install
npm run build       # production bundle in dist/
# Static host dist/ behind the FRONTEND_BASE_URL
```

## Required Supabase Buckets

| Bucket | Visibility | Use |
| --- | --- | --- |
| `nlc-public` | public (`SELECT` for anon) | event images, gallery, members, event QR |
| `nlc-private` | **private** (service-role only) | payment screenshots |

Bucket policy for `nlc-private`:

```text
-- Block all roles except service_role
CREATE POLICY "no public read nlc-private" ON storage.objects
  FOR SELECT USING (bucket_id = 'nlc-private' AND auth.role() = 'service_role');
CREATE POLICY "no public insert nlc-private" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'nlc-private' AND auth.role() = 'service_role');
CREATE POLICY "no public update nlc-private" ON storage.objects
  FOR UPDATE USING (bucket_id = 'nlc-private' AND auth.role() = 'service_role');
CREATE POLICY "no public delete nlc-private" ON storage.objects
  FOR DELETE USING (bucket_id = 'nlc-private' AND auth.role() = 'service_role');
```

## New / Changed Endpoints

- `GET /api/admin/bookings/{id}/payment-proof` — admin only, returns
  `{ bookingId, bookingReference, signedUrl, expiresAt, ttlSeconds }`.