# Vercel Deployment Guide

## Overview

This app deploys to Vercel with the following setup:
- **Production branch**: `feat/homnayangi-mvp`
- **Database**: PostgreSQL (hosted separately)
- **Build command**: `npm run build` (runs `prisma generate && next build`)
- **Install command**: `npm install` (runs `prisma generate` via postinstall)

## Database Migrations

⚠️ **Important**: Database migrations are NOT run during the Vercel build process.

### Why?

Vercel's build environment:
1. Runs in an isolated container without persistent database access
2. May run multiple builds in parallel
3. Should not perform stateful operations like schema migrations

### How to Deploy Migrations

When you add a new migration (e.g., via `npx prisma migrate dev`), deploy it separately:

#### Option 1: Run migrations locally before deploying

```bash
# 1. Apply migration to production database
DATABASE_URL="your-production-db-url" npm run migrate:deploy

# 2. Push code to trigger Vercel deployment
git push origin feat/homnayangi-mvp
```

#### Option 2: Use Vercel CLI (if installed)

```bash
# Run migration against production database
vercel env pull .env.production.local
npm run migrate:deploy
```

#### Option 3: Vercel Build Hook (Advanced)

Create a separate script that:
1. Runs `prisma migrate deploy` before the build
2. Configure as a Vercel "Ignored Build Step" command

## Environment Variables on Vercel

Required environment variables in Vercel project settings:

```
DATABASE_URL=postgresql://user:password@host/db?sslmode=require
AUTH_SECRET=your-secret-from-openssl-rand-base64-32
AUTH_URL=https://vnexter-an-gi.vercel.app
BLOB_READ_WRITE_TOKEN=vercel_blob_token
```

**Note**: `AUTH_URL` must match your production domain for NextAuth to work correctly.

## Troubleshooting

### Build fails with "Environment variable not found: DATABASE_URL"

- **Cause**: The build script tries to run `prisma migrate deploy`
- **Fix**: Ensure `package.json` build script is `prisma generate && next build` (no migrate)

### Weather API returns loading state forever

- **Cause**: API route was statically generated at build time
- **Fix**: Add `export const dynamic = "force-dynamic"` to dynamic API routes

### Migration not applied after deployment

- **Cause**: Migrations aren't automatically deployed
- **Solution**: Run `npm run migrate:deploy` with production DATABASE_URL before pushing

## Deployment Checklist

Before merging to `feat/homnayangi-mvp`:

- [ ] Tests pass locally (`npm test`)
- [ ] Build succeeds locally (`npm run build`)
- [ ] If schema changed, migration applied to production DB
- [ ] Environment variables set in Vercel
- [ ] No hardcoded credentials in code

After merge:

- [ ] Vercel build succeeds (check dashboard)
- [ ] Production site loads at https://vnexter-an-gi.vercel.app
- [ ] Weather section shows temperature and suggestion (not loading state)
- [ ] Restaurant list displays correctly
- [ ] Admin panel accessible at /admin/login

## Reference

- **Prisma Deployment Guides**: https://www.prisma.io/docs/guides/deployment
- **Next.js on Vercel**: https://nextjs.org/docs/deployment
- **Vercel Environment Variables**: https://vercel.com/docs/concepts/projects/environment-variables
