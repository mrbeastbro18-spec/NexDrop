# NexDrop

Single-package full-stack file storage app built with Next.js App Router, Prisma, PostgreSQL, and optional Redis.

## Run locally
1. Copy `.env.example` to `.env`.
2. Start PostgreSQL and Redis.
3. Install dependencies: `npm install`
4. Push schema: `npx prisma db push`
5. Start: `npm run dev`

## Production commands
- Install: `npm ci`
- Build: `npm run build`
- Lint: `npm run lint`
- Start: `npm run start:prod`

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

## Tests
- Unit tests: `npm test`
- E2E tests: `npm run test:e2e`
- All tests: `npm run test:all`

## Notes
- Frontend and backend live in the same Next.js app.
- API routes are under `app/api`.
- Uploads are chunked and stored on disk under `STORAGE_PATH`.
- PostgreSQL is required; Redis is optional for future rate limiting and cache features.
