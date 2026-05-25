# NexDrop

Single-package full-stack file storage app built with Next.js App Router, Prisma, PostgreSQL, and optional Redis.

## Deployment

**For serverless/Alpine Linux deployments (SynthLaunch, Render, Railway, etc.):**
→ See [SERVERLESS_DEPLOYMENT.md](./SERVERLESS_DEPLOYMENT.md)

## Run locally
1. Copy `.env.example` to `.env`.
2. Start PostgreSQL and Redis.
3. Install dependencies: `npm install`
4. Push schema: `npx prisma db push`
5. Start: `npm run dev`

## Production commands
- Install: `npm ci --include=dev --ignore-scripts`
- Build: `npm run build`
- Lint: `npm run lint`
- Start: `npm run start:prod`

## Environment variables
The repo uses `lib/env.ts` to normalize and validate environment settings.

- Most environment variables are runtime-only.
- Build-time success does not require all `.env` values because optional vars have safe defaults and request-origin URL generation is used instead of `APP_URL` at build time.
- For a real production deployment, you must still provide runtime secrets and database settings in `.env`.

Required runtime variables for production:
- `NODE_ENV=production`
- `DATABASE_URL`
- `JWT_ACCESS_SECRET`
- `JWT_REFRESH_SECRET`

`APP_URL` is optional and no longer required for Prisma-backed API routes. The app now derives public URLs from the incoming request origin where needed.

Optional features:
- SMTP/email: `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `SMTP_USER`, `SMTP_PASS`, `EMAIL_FROM`
- S3 storage: `S3_ENABLED`, `S3_BUCKET`, `S3_REGION`, `S3_ACCESS_KEY`, `S3_SECRET_KEY`, `S3_ENDPOINT`
- Sentry: `SENTRY_DSN`, `SENTRY_ENVIRONMENT`

Runtime validation note:
- The runtime helper `NEXDROP_RUNTIME=1` is used in the Docker runtime stage to enforce required production envs after build. It is not required for building the app.

**OpenSSL / Prisma note**

- Prisma is configured for the production Linux/OpenSSL 3 runtime target used by the deployment container.
- If you build custom images, make sure OpenSSL is installed in the runtime image.

**Commands**

- **Install (local):** `npm install`
- **Install (CI / reproducible):** `npm ci --include=dev --ignore-scripts`
- **Build (production):** `npm run build`
- **Start (production):** `npm run start:prod` (uses built artifacts)
- **Start (development):** `npm run dev`
- **Lint:** `npm run lint`
- **Unit tests:** `npm test`
- **E2E tests:** `npm run test:e2e`
- **Prisma commands:** `npx prisma db push`, `npm run db:migrate`, `npm run db:studio`

## Procfile
If you deploy to Heroku, Render, Railway, or any provider that supports a Procfile, use:

```text
web: npm run start:prod
worker: npm run email:worker
```

## Docker
`docker compose up --build`

## Production Docker with HTTPS
1. Copy `.env.example` to `.env` and set `DOMAIN`, `DOMAIN_WWW`, and `LETSENCRYPT_EMAIL`.
2. Start the production stack:
   - `docker compose -f docker-compose.prod.yml up -d`
3. Issue certificates once the app and nginx are reachable:
   - `./scripts/issue_cert.sh`
4. Reload nginx after certificates are issued:
   - `docker compose -f docker-compose.prod.yml exec nginx nginx -s reload`
5. Renew certificates periodically:
   - `./scripts/renew_cert.sh`

**Runtime notes**

- The app enforces required production environment variables at runtime only when `NEXDROP_RUNTIME=1` is set (the provided `Dockerfile` sets this). This avoids build-time failures during static generation while ensuring secrets are validated in production.
- Prefer Debian-based Node images with OpenSSL 3 (the `Dockerfile` uses `node:24-bookworm-slim`) or ensure your runtime image provides a compatible OpenSSL 3 library for Prisma.
- `npm run build` does not require a `.env` file if you only need to build static and dynamic routes; the repo uses safe defaults for missing optional values. However, a runtime `.env` is still required to run the app with your real database and credentials.
## Tests
- Unit tests: `npm test`
- E2E tests: `npm run test:e2e`
- All tests: `npm run test:all`

## Notes
- Frontend and backend live in the same Next.js app.
- API routes are under `app/api`.
- Uploads are chunked and stored on disk under `STORAGE_PATH`.
- PostgreSQL is required; Redis is optional for future rate limiting and cache features.

## Deployment notes

- Prisma engines require a compatible OpenSSL library at build/runtime. The app is now aligned with the Debian/OpenSSL 3 runtime used by the current container deployment.
- Some deployment platforms upload the `.next` folder directly and may refuse non-regular files (symlinks) under `.next/node_modules`. The build removes those post-build to avoid upload failures.

If you run into issues, prefer building inside the included Dockerfile or in a Debian-based CI runner with OpenSSL installed.

For SynthLaunch, use the same production commands listed above:

- Install: `npm ci --include=dev --ignore-scripts`
- Build: `npm run build`
- Start: `npm run start:prod`

Health check endpoint:

- `GET /api/health` returns liveness status and is safe for public health checks.
- `GET /api/health/ready` returns readiness (`200`/`503`) with non-sensitive dependency status (`database`, `redis`).

Auth and admin diagnostics:

- Auth APIs now include an `x-request-id` response header for easier trace correlation.
- Optional bootstrap admin login is available using `ADMIN_BOOTSTRAP_EMAIL` + `ADMIN_BOOTSTRAP_PASSWORD`.
- Set `NEXT_PUBLIC_ENABLE_DEBUG_LOGS=true` to emit auth/admin request failures in browser console.
- Set `ENABLE_DEBUG_LOGS=true` to emit structured server debug logs.
