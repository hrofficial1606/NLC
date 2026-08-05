# NLC Event Management Backend

Production-ready Spring Boot backend for the Nagpur Ladies Club event management platform.

## Stack

- Java 21
- Spring Boot 3
- Spring Security + JWT
- Spring Data JPA + Hibernate
- PostgreSQL or MySQL
- Maven
- Lombok
- Swagger / OpenAPI
- Supabase Storage (private + public buckets, signed URL review)
- Scheduler / async jobs

## Features

- Authentication: register, login, refresh token, logout, email verification, forgot/reset password
- Role-based access: `ADMIN`, `USER`
- Event CRUD and public listing
- Event registration with QR instructions and payment proof workflow
- Admin approval / rejection for paid registrations
- Gallery management + Instagram sync hook
- Sponsor management APIs
- Member card issuance and retrieval
- WhatsApp registration / booking / member card alerts
- About page / team CMS
- Contact inquiry management
- Admin dashboard analytics
- Swagger docs, validation, rate limiting, CORS, global exception handling

## Project Structure

```text
backend/
  src/main/java/com/nlc/backend/
    config/
    controller/
    dto/
    entity/
    exception/
    repository/
    scheduler/
    security/
    service/
    util/
  db/schema.sql
  postman/NLC-Event-Management.postman_collection.json
```

## Quick Start

1. Copy `.env.example` values into your environment or IDE run configuration.
2. Create a PostgreSQL or MySQL database.
3. Update `DB_URL`, `DB_USERNAME`, `DB_PASSWORD`, and `DB_DRIVER`.
4. Run:

```bash
mvn spring-boot:run
```

API base URL:

```text
http://localhost:8080/api
```

Swagger UI:

```text
http://localhost:8080/api/swagger-ui.html
```

## Default Admin

Seeded automatically on first startup:

- Email: `admin@nlc.local`
- Password: `Admin@123`

Change this immediately in production.

## Important Environment Variables

- `JWT_ACCESS_SECRET`
- `JWT_REFRESH_SECRET`
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `SUPABASE_PUBLIC_BUCKET` (default `nlc-public`)
- `SUPABASE_PRIVATE_BUCKET` (default `nlc-private`)
- `SUPABASE_SIGNED_URL_TTL` (default 300 seconds; admin signed-URL TTL)
- `FRONTEND_BASE_URL`

## Supabase Storage

Payment screenshots MUST be uploaded to the **private** bucket (`nlc-private`) using the service-role key (server side only). The frontend never receives public URLs for payment screenshots.

### Required buckets and policies

| Bucket | Visibility | Purpose | Upload via |
| --- | --- | --- | --- |
| `nlc-public` | public | event images, gallery, members, event QR | service-role (upload) + anon read |
| `nlc-private` | **private** | payment-proof screenshots | service-role (upload + read), anon/blocked |

Recommended bucket policies:

- `nlc-public`: `SELECT` open to anon; `INSERT/UPDATE/DELETE` only with service-role.
- `nlc-private`: all CRUD only via service-role (no anon or authenticated user access). The backend reads objects using signed URLs generated on demand.

### Admin signed-URL review

```text
GET /api/admin/bookings/{id}/payment-proof
Authorization: Bearer <admin JWT>
```

Returns:

```json
{
  "bookingId": 42,
  "bookingReference": "NLC-ABCD1234",
  "signedUrl": "https://<project>.supabase.co/storage/v1/object/sign/nlc-private/payment-proofs/<uuid>?token=...",
  "expiresAt": "2026-08-05T13:30:00Z",
  "ttlSeconds": 300
}
```

The signed URL is generated on demand (TTL configurable via `SUPABASE_SIGNED_URL_TTL`, default 5 min) and is **never** persisted server-side.

## Integration Notes

### Supabase Storage

The backend uses `SupabaseStorageService` for both public and private buckets. `StorageService.uploadPrivate(...)` writes payment screenshots into `nlc-private` and returns only the storage object key — never a public URL. The admin endpoint `GET /admin/bookings/{id}/payment-proof` generates a signed URL via the service-role key on demand.

### Instagram Sync

`InstagramSyncScheduler` calls `InstagramSyncServiceImpl` on a cron schedule. The persistence and scheduling hooks are ready; replace the placeholder fetch logic with your Instagram Graph API media pull.

## Main API Areas

- `/auth/**`
- `/public/**`
- `/user/**`
- `/admin/**`

Additional admin/public APIs added:

- `/admin/sponsors`
- `/public/sponsors`
- `/admin/member-cards`
- `/user/member-card`

## Production Hardening Checklist

- Move from `ddl-auto=update` to migrations (`Flyway` or `Liquibase`)
- Replace placeholder email bodies with branded HTML templates
- Add Redis-backed rate limiting and caching
- Add request tracing and centralized logging
- Implement full Instagram Graph API fetch and token refresh
- Rotate `SUPABASE_SERVICE_ROLE_KEY` and `JWT_*_SECRET` before launch
- Lock down `nlc-private` bucket: only service-role should have any CRUD access
- Add integration and controller tests

## Frontend Integration

The backend already uses DTO-based REST responses that are ready to consume from your existing React frontend.

## Deployment Files

- Render service blueprint: [../render.yaml](../render.yaml)
- Render env template: [deploy/render.env.example](deploy/render.env.example)
- Hostinger VPS compose stack: [deploy/hostinger/docker-compose.yml](deploy/hostinger/docker-compose.yml)
- Hostinger setup notes: [deploy/hostinger/DEPLOY.md](deploy/hostinger/DEPLOY.md)
