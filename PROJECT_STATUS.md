# Overall Status

Assessment date: 2026-08-05

Percentages below are based on the verified-status rubric documented in [PROJECT_AUDIT.md](/C:/Users/DELL/OneDrive/Documents/GitHub/NLC/PROJECT_AUDIT.md).

- Overall completion: 70%
- Frontend: 18%
- Backend: 88%
- Admin Panel: 56%
- Database/Integration: 78%

# Completed

- Spring Boot backend builds successfully with `mvn clean package -DskipTests`
- React frontend builds successfully with `npm run build`
- JWT authentication backend is in place
- Server-side admin authorization exists
- Event CRUD backend exists
- Featured/upcoming event backend endpoint exists
- Sponsor backend CRUD exists
- Member card backend CRUD exists
- QR-based registration fields exist per event
- Paid event screenshot-proof submission flow stores screenshots in the **private** Supabase bucket
- Storage object key (not URL) is persisted in `Booking.paymentScreenshotObjectKey`
- New admin-only `GET /admin/bookings/{id}/payment-proof` endpoint returns a short-lived signed URL on demand
- Signed URL TTL is configurable via `SUPABASE_SIGNED_URL_TTL` (default 300s)
- Replacement uploads delete the previous private object (no orphans)
- Admin approve/reject registration APIs exist
- Dashboard analytics now use registration/event/member/gallery data
- Old Razorpay controller/service/entity stack has been removed
- `.env.example` was sanitized to remove committed real-looking secrets

# Fixed

- Restored and stabilized backend Maven configuration in earlier project work
- Fixed creator component null crash on initial render
- Replaced old automated payment-gateway backend flow with manual QR registration workflow
- Removed fake Instagram sample persistence behavior
- Removed obsolete payment gateway routes/config/dependencies
- Updated schema reference to match current entities more closely

# Added

- Event fields for:
  - registration enabled
  - paid/free event
  - QR image
  - UPI ID
  - payment instructions
  - registration deadline
- Booking/registration fields for:
  - payment screenshot URL
  - payment screenshot public ID
  - submitted timestamp
  - reviewed timestamp
  - reviewed by
  - rejection reason
  - admin note
- Admin APIs to:
  - filter registrations by status
  - approve registration
  - reject registration
- User registration submission endpoint supporting multipart screenshot upload
- Dashboard metrics for pending/approved/rejected registrations and other counts

# Admin Panel

PARTIAL

What works:

- Protected admin backend APIs
- Event CRUD API
- Sponsor CRUD API
- Member card API
- Gallery API
- Team/About content API
- Registration listing API
- Registration approve/reject APIs
- Dashboard analytics API

What does not yet work:

- No real React admin dashboard UI
- No protected admin frontend routes/pages
- No complete browser-based CRUD experience for admin users

# QR Registration System

- QR Display: COMPLETE (backend; per-event `qr_image_url`)
- Screenshot Upload: COMPLETE (backend, private bucket, on `Booking.paymentScreenshotObjectKey`)
- Pending Status: COMPLETE (backend)
- Admin Review: COMPLETE (backend signed-URL endpoint, frontend admin modal wired)
- Approval: COMPLETE (backend; frontend wired)
- Rejection: COMPLETE (backend; frontend wired, rejection reason required)
- Rejection Reason: COMPLETE (backend)
- Resubmission: COMPLETE (backend, by reusing rejected registration)
- User Status: COMPLETE (backend API + frontend admin modals), FRONTEND NOT WIRED ON PUBLIC PAGE

## Private Payment Storage

- Bucket: `nlc-private` (Supabase Storage). Payment screenshots are written via
  `StorageService.uploadPrivate(...)` using the service-role key.
- Object key only: the persisted column is `Booking.paymentScreenshotObjectKey`.
  The user-facing `BookingResponse` exposes a `boolean hasPaymentProof` flag only;
  it never carries the storage object key.
- Replacement uploads delete the previous private object before writing the new one.
- Admin endpoint: `GET /api/admin/bookings/{id}/payment-proof`
  - ROLE_ADMIN only (`@PreAuthorize("hasRole('ADMIN')")` on `AdminController`)
  - Returns `{ bookingId, bookingReference, signedUrl, expiresAt, ttlSeconds }`
  - Signed URL is generated on demand via `SupabaseStorageClient.createSignedUrl(...)`
  - TTL configurable via `SUPABASE_SIGNED_URL_TTL` (default 300 seconds)
  - URL is never persisted server-side

# Security

Major checks performed:

- Server-side JWT auth retained
- Admin routes remain protected in Spring Security (`/admin/**` requires ROLE_ADMIN via `@PreAuthorize`)
- Removed obsolete public payment/webhook exposure
- Sanitized `.env.example` placeholders
- Screenshot upload now validates MIME type and file size
- **Private payment proof storage**: payment screenshots are written to the
  Supabase `nlc-private` bucket via `StorageService.uploadPrivate(...)`. The
  bucket is intended to block all anon / JWT-issued role access and only allow
  service-role reads. The service role key MUST stay on the backend.
- **Object key, not URL**: `Booking.paymentScreenshotObjectKey` holds only the
  Supabase storage object key. The user-facing `BookingResponse` exposes
  `hasPaymentProof` (boolean) only — never the key, never a public URL.
- **Admin signed-URL endpoint**: `GET /api/admin/bookings/{id}/payment-proof`
  returns a short-lived signed URL (default 5 min TTL). The URL is generated
  on demand and never persisted.
- **Replacement screenshots**: previous private objects are deleted server-side
  before the new one is uploaded (no orphan files).
- **Security matrix** (Step 9 of the production checklist):

  | Attempt | Expected | Mechanism |
  | --- | --- | --- |
  | Unauthenticated request to `/admin/bookings/{id}/payment-proof` | 401 | JWT filter rejects missing/invalid Bearer token; class-level `@PreAuthorize("hasRole('ADMIN')")` |
  | Normal user requests admin endpoint | 403 | `JwtAuthenticationFilter` + `hasRole('ADMIN')` rule |
  | Normal user requests another user's booking screenshot | 403 | Endpoint is admin-only; users have no path to look up another user's object |
  | Expired signed URL | Access denied | Supabase rejects the signed path after TTL; backend never serves the object directly |
  | Direct GET on `nlc-private` object without signature | Access denied | Bucket policy blocks all reads except service-role / signed URLs |

- Duplicate event registration prevention added at service layer
- Registration deadline and availability enforced server-side
- Free vs paid event behavior enforced server-side

# Testing

Workflows actually verified:

- Backend compile/package: PASS
- Frontend production build: PASS
- Admin authorization is present in configuration and controller protection: INSPECTED
- QR registration workflow: IMPLEMENTED and compile-verified, not browser-tested end to end
- Approval/rejection workflow: IMPLEMENTED and compile-verified, not browser-tested end to end

# Build

- Frontend: PASS (production build, 64 modules transformed)
- Backend: PASS (`mvn clean package -DskipTests`, 132 source files compiled)
- Spring Boot startup: PASS (`/api/actuator/health` returns 200, 132 source files compiled)
- Tests: NOT AVAILABLE

# Environment Variables

- `DB_URL`
- `DB_USERNAME`
- `DB_PASSWORD`
- `DB_DRIVER`
- `JWT_ACCESS_SECRET`
- `JWT_REFRESH_SECRET`
- `MAIL_HOST`
- `MAIL_PORT`
- `MAIL_USERNAME`
- `MAIL_PASSWORD`
- `MAIL_SMTP_AUTH`
- `MAIL_SMTP_STARTTLS`
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `SUPABASE_PUBLIC_BUCKET`
- `SUPABASE_PRIVATE_BUCKET`
- `SUPABASE_SIGNED_URL_TTL`
- `INSTAGRAM_SYNC_ENABLED`
- `INSTAGRAM_ACCESS_TOKEN`
- `INSTAGRAM_USER_ID`
- `INSTAGRAM_SYNC_CRON`
- `WHATSAPP_ENABLED`
- `WHATSAPP_API_BASE_URL`
- `WHATSAPP_ACCESS_TOKEN`
- `WHATSAPP_PHONE_NUMBER_ID`
- `WHATSAPP_DEFAULT_COUNTRY_CODE`
- `WHATSAPP_ADMIN_RECIPIENT_NUMBER`
- `FRONTEND_BASE_URL`

# Remaining

- Frontend still uses mock/static content for core public pages instead of real backend data.
- No real frontend login, user dashboard, my registrations, or admin panel UI exists.
- Public event listing/details/registration pages are not yet wired to backend APIs.
- Gallery/member/about pages are still partly static.
- Instagram sync still requires a real Graph API implementation plus credentials.
- WhatsApp and email integrations require real external credentials to verify runtime behavior.
- Database migrations are not yet introduced; schema changes still rely on `ddl-auto=update`.

# Deployment Checklist

Run this list on staging before promoting to production:

1. Set `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` to the **production** Supabase project (not the dev one).
2. Configure two buckets in Supabase Storage:
   - `nlc-public` — `SELECT` open to anon; `INSERT/UPDATE/DELETE` only via service-role.
   - `nlc-private` — all CRUD only via service-role. **No** anon access.
3. Rotate `JWT_ACCESS_SECRET` and `JWT_REFRESH_SECRET` to long random values (≥ 32 bytes).
4. Set `FRONTEND_BASE_URL` to the deployed frontend origin and update CORS allowlist in `application.yml`.
5. Configure `MAIL_*` for production SMTP (set `BOOKING_EMAIL_ENABLED=true`).
6. Set `SUPABASE_SIGNED_URL_TTL` to a value between 300 and 900 seconds (5–15 min).
7. Confirm `ddl-auto=update` is acceptable for the next release; otherwise introduce Flyway/Liquibase migrations for `bookings.payment_screenshot_object_key`.
8. Verify end-to-end on staging using the QR payment flow:
   - Admin creates paid event → uploads QR → publishes.
   - User registers → pays via QR → uploads screenshot.
   - Screenshot appears in `nlc-private` bucket via service-role upload.
   - Booking status becomes `PENDING`.
   - Admin opens `/admin/bookings/{id}/payment-proof` → receives 5 min signed URL.
   - Admin approves or rejects → user sees `APPROVED`/`REJECTED`.
9. Re-run the security matrix (Step 9 of the production checklist) on staging with real Supabase credentials.

# Run Instructions

Frontend:

```bash
npm install
npm run dev
```

Frontend production build:

```bash
npm run build
```

Backend:

```bash
cd backend
mvn spring-boot:run
```

Backend production package:

```bash
cd backend
mvn package -DskipTests
```
