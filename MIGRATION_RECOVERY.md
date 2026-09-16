# Migration Recovery Guide

## Issue: Failed Migration in Production Database

The migration `20260916131000_add_restaurant_price_range` failed during deployment, marking it as failed in Prisma's migration history. This prevents new migrations from being applied.

### Error Details
```
Error: P3009
migrate found failed migrations in the target database, new migrations will not be applied.
The `20260916131000_add_restaurant_price_range` migration started at 2026-09-16 13:17:13.491527 UTC failed
```

## Resolution Steps

### Step 1: Verify Column State in Production

First, check if the columns were actually created despite the failure:

```bash
# Connect to your production database and run:
SELECT column_name 
FROM information_schema.columns 
WHERE table_name = 'Restaurant' 
  AND column_name IN ('priceMin', 'priceMax');
```

### Step 2: Resolve the Failed Migration

Choose the appropriate resolution based on Step 1 results:

#### Option A: Columns DO NOT exist (rolled back)
If the query returns 0 rows, the migration was rolled back:

```bash
npx prisma migrate resolve --rolled-back 20260916131000_add_restaurant_price_range
npx prisma migrate deploy
```

#### Option B: Columns DO exist (partially applied)
If the query returns both `priceMin` and `priceMax`, mark the migration as applied:

```bash
npx prisma migrate resolve --applied 20260916131000_add_restaurant_price_range
```

### Step 3: Verify Migration Status

```bash
npx prisma migrate status
```

Expected output: "Database schema is up to date!"

## Why This Happened

The migration failed because the build script previously included `prisma migrate deploy`, which ran during Vercel's build phase. When migrations fail during build:
1. Vercel marks the deployment as failed
2. Prisma marks the migration as started but not completed
3. Future deployments are blocked

## Prevention (Already Implemented)

✅ Build script now: `"build": "prisma generate && next build"`
- No database connection required during build
- Prisma Client generation uses local schema only

✅ Migrations separated: `"migrate:deploy": "prisma migrate deploy"`
- Run manually after deployment or via separate CI step
- Never during Vercel build phase

## Post-Merge Deployment Flow

1. **Merge PR #11** → Vercel builds successfully (no DB needed)
2. **Resolve failed migration** (run one of the commands from Step 2)
3. **Deploy future migrations** using `npm run migrate:deploy` from a local environment with production DATABASE_URL
4. **Alternative**: Set up a GitHub Action to run migrations post-deploy

## Migration File Contents

```sql
-- 20260916131000_add_restaurant_price_range/migration.sql
ALTER TABLE "Restaurant" ADD COLUMN "priceMin" INTEGER,
ADD COLUMN "priceMax" INTEGER;
```

## Related PRs

- PR #10: Initial fix removing migrations from build script
- PR #11: Homepage layout alignment + ensures clean build without DB
