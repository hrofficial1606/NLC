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
- Cloudinary media storage
- Razorpay payment integration
- Scheduler / async jobs

## Features

- Authentication: register, login, refresh token, logout, email verification, forgot/reset password
- Role-based access: `ADMIN`, `USER`
- Event CRUD and public listing
- Ticket booking with QR code generation
- Razorpay order + verification flow
- Gallery management + Instagram sync hook
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
- `CLOUDINARY_CLOUD_NAME`
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`
- `RAZORPAY_KEY_ID`
- `RAZORPAY_KEY_SECRET`
- `RAZORPAY_WEBHOOK_SECRET`
- `INSTAGRAM_ACCESS_TOKEN`
- `INSTAGRAM_USER_ID`
- `FRONTEND_BASE_URL`

## Integration Notes

### Cloudinary

The backend uses `CloudinaryMediaStorageService` for media uploads and deletions. Replace or extend this service if you prefer AWS S3.

### Razorpay

Order creation and verification are implemented in `PaymentServiceImpl`. Add stricter signature verification and webhook reconciliation before production launch.

### Instagram Sync

`InstagramSyncScheduler` calls `InstagramSyncServiceImpl` on a cron schedule. The persistence and scheduling hooks are ready; replace the placeholder fetch logic with your Instagram Graph API media pull.

## Main API Areas

- `/auth/**`
- `/public/**`
- `/user/**`
- `/admin/**`
- `/payments/**`

## Production Hardening Checklist

- Move from `ddl-auto=update` to migrations (`Flyway` or `Liquibase`)
- Replace placeholder email bodies with branded HTML templates
- Add Redis-backed rate limiting and caching
- Add request tracing and centralized logging
- Verify Razorpay webhooks cryptographically
- Implement full Instagram Graph API fetch and token refresh
- Store generated invoices/receipts in object storage
- Add integration and controller tests

## Frontend Integration

The backend already uses DTO-based REST responses that are ready to consume from your existing React frontend.
