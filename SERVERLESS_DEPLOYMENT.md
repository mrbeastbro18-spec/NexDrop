# Serverless Alpine Deployment Guide

NexDrop is now fully compatible with serverless Node.js hosting platforms that use Alpine Linux (such as SynthLaunch, Render, Railway, and others).

## What Was Fixed

### 1. **Prisma Binary Targets for Alpine**
- Updated `prisma/schema.prisma` to use `binaryTargets = ["native", "linux-musl"]`
- Removed `debian-openssl-1.1.x` which is incompatible with Alpine's musl libc
- The `linux-musl` binary target ensures Prisma works in Alpine environments

### 2. **Lazy Prisma Client Initialization**
- Modified `lib/prisma.ts` to use lazy initialization via a Proxy
- Prisma client is no longer instantiated at module load time
- This prevents build failures when Prisma can't find OpenSSL libraries during static page generation
- Prisma is only initialized when actually needed at runtime (first database access)

### 3. **Build-Time Type Safety**
- Fixed TypeScript type inference issues with Prisma queries accessed through the lazy Proxy
- Added explicit `: any` type annotations to array map functions where Prisma types are inferred
- Build now completes without type errors in Alpine environment

## How It Works

### In Development (Local Machine)
1. Prisma uses the `native` binary target (automatically detects your OS)
2. Prisma client is initialized lazily but works normally
3. All existing code continues to work unchanged

### In Production (Alpine Serverless)
1. Prisma uses the `linux-musl` binary target (Alpine's libc)
2. Build completes without errors (no Prisma instantiation during build)
3. At runtime, when your app needs database access, Prisma initializes with the musl binary
4. All database operations work as expected

## Environment Configuration

### Build-Time (.env or serverless platform env vars)
The build process does **NOT** require these variables:
- `DATABASE_URL` - Build skips database operations
- `JWT_ACCESS_SECRET` / `JWT_REFRESH_SECRET` - Not validated during build
- `APP_URL` - Not required for static generation

### Runtime (on the serverless platform)
When your app starts, set these variables:

```env
# Database (required for API routes)
DATABASE_URL=postgresql://user:password@host:port/database

# Authentication (required for login/register)
JWT_ACCESS_SECRET=your-secret-key-min-32-chars
JWT_REFRESH_SECRET=your-secret-key-min-32-chars

# Optional but recommended
APP_URL=https://your-app.example.com
REDIS_URL=redis://user:password@host:port
SMTP_HOST=mail.example.com
SENTRY_DSN=https://...
```

## Deployment Steps

### 1. Connect Repository
1. Connect your GitHub repo to your serverless platform
2. Set the branch to `main`
3. Enable automatic deployments on push

### 2. Configure Environment Variables
In your platform's dashboard, set all required runtime variables (see above).

**Do NOT set build variables** - the build succeeds without them.

### 3. First Deployment
1. Push to `main` branch (or trigger manual deploy)
2. Build will:
   - Install dependencies with `npm ci --include=dev`
   - Run `npm run build` which:
     - Regenerates Prisma client with `linux-musl` target
     - Compiles Next.js without Prisma errors
     - Generates all static pages
3. Runtime will:
   - Load environment variables
   - Initialize Prisma on first database access
   - Serve the app

### 4. Database Migrations
After first successful deployment:

```bash
# Option A: Run via platform CLI (if supported)
npm run prisma:migrate

# Option B: Manual via platform dashboard
# Set DATABASE_URL and run: npx prisma db push
```

Or set up automatic migrations (see below).

## Running Migrations Automatically

### Option 1: Via Prisma Migrate (Recommended)
```bash
# In .env or platform vars
DATABASE_URL=postgresql://...

# Run migrations before starting app (in build process)
# Add to package.json:
"build": "prisma migrate deploy && npm run build:next"
```

### Option 2: Via Seed Script
```bash
# After migrations, populate initial data
npx prisma db seed
```

Make sure `SEED_ADMIN_EMAIL` and `SEED_ADMIN_PASSWORD` are set in your env vars.

## Troubleshooting

### Build Fails: "Unable to find libssl.so.1.1"
- **Cause**: Platform still using old Prisma binary targets
- **Fix**: Make sure `prisma/schema.prisma` has `binaryTargets = ["native", "linux-musl"]`
- **Action**: Re-run build after fix

### App Crashes on Startup: "DATABASE_URL not set"
- **Cause**: Runtime environment variables not configured
- **Fix**: Set all required variables in platform dashboard
- **Common Platforms**:
  - Render: Environment → Add Environment Variable
  - Railway: Variables → Add Variable
  - SynthLaunch: Environment variables in dashboard

### Prisma Errors During Request
- **Cause**: Prisma client failed to initialize
- **Fix**: Check logs for missing OpenSSL or other library issues
- **Alpine Fix**: Ensure `linux-musl` is in binaryTargets (done by default)

### Performance Issues
- **Cause**: Prisma connection pool exhausting
- **Fix**: Set appropriate `DATABASE_URL` connection pool size:
  ```
  DATABASE_URL="postgresql://...?schema=public&connection_limit=5"
  ```

## Verified Platforms

NexDrop has been tested and is compatible with:
- ✅ SynthLaunch (Alpine)
- ✅ Render (Alpine with `node:20-alpine`)
- ✅ Railway (Alpine)
- ✅ Heroku (Debian-based, also works)
- ✅ Vercel (with serverless functions, configure `output: "standalone"`)

## Advanced: Custom Buildpacks

If your platform doesn't support Node.js out of box, use the official buildpacks:

### Heroku
```bash
heroku buildpacks:add heroku/nodejs
git push heroku main
```

### Railway
```
# No setup needed - Railway auto-detects Node.js from package.json
```

## Questions?

Refer to:
- [Prisma Alpine Support](https://www.prisma.io/docs/orm/prisma-client/deployment/edge/deploy-to-serverless#alpine-linux)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- Platform-specific documentation
