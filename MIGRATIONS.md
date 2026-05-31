Applying Prisma migrations

This project keeps create-only SQL migrations in `prisma/migrations/` for controlled deployment.

To apply pending migrations to a target database you must set a valid `DATABASE_URL` environment variable that points to your Postgres instance and then run:

```bash
# apply migrations in non-interactive (CI/prod) environments
DATABASE_URL="postgres://user:pass@host:5432/dbname" npm run db:migrate:deploy
```

Notes:
- `prisma migrate deploy` will apply all SQL migrations in `prisma/migrations` in order and will not prompt for interactive input.
- If you don't have direct DB access or prefer to inspect SQL first, review the files under `prisma/migrations/`.
- For local development you can use `npm run db:migrate` which will create a migration and/or apply it in an interactive workflow.
- Always backup your production database before applying schema changes.

If you want me to attempt applying the migration from this environment, provide the `DATABASE_URL` (or grant access) and I will run the deploy command and report results.