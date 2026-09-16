# Post-Deploy Actions for Vercel

After PR #10 is merged and deployed to Vercel, follow these steps to ensure everything works correctly.

## 1. Verify Deployment Success

Check the Vercel dashboard:
- [ ] Build completed successfully (green checkmark)
- [ ] No build errors in logs
- [ ] Deployment is live

## 2. Reseed Production Database (Recommended)

The seed data was expanded from 2 to 7 restaurants with proper weather tags and price ranges. To update production:

```bash
# Option A: Using Vercel CLI
vercel env pull .env.production.local
npx tsx prisma/seed.ts

# Option B: Direct connection
export DATABASE_URL="your-production-postgresql-url"
export ADMIN_EMAIL="admin@example.com"
export ADMIN_PASSWORD="your-secure-password"
npx tsx prisma/seed.ts
```

This will:
- Upsert (update or insert) all 7 restaurants
- Set price ranges for budget filter
- Add weather-optimized tags (pho, nong, dieuhoa, etc.)
- Delete obsolete restaurants

⚠️ **Note**: Upsert won't affect existing reviews. Restaurants are matched by slug.

## 3. Test Weather Feature

Visit https://vnexter-an-gi.vercel.app and verify:

### Weather Card (Left Side)
- [ ] Shows actual temperature (e.g., "28°C") - not "..." or "--"
- [ ] Shows sky condition in Vietnamese (e.g., "Trời quang", "Ít mây", "Mưa nhẹ")
- [ ] Shows correct weather icon (sun, cloud, rain, etc.)

### Weather Suggestion (Right Side)
- [ ] Shows context-appropriate text:
  - Rain: "Trưa mưa quanh Trung Kính — nên ăn món nóng..."
  - Hot (≥33°C): "Trưa nắng nóng — nên tìm quán có điều hòa..."
  - Cold (≤20°C): "Trưa se lạnh — hợp món nóng..."
  - Mild: "Thời tiết dễ chịu — hợp đi bộ ăn trưa..."
- [ ] Shows specific restaurant recommendation (e.g., "Gợi ý hôm nay: Phở Vịt Quay")
- [ ] "Xem quán hợp thời tiết →" link works and goes to restaurant detail page

### Expected Behavior by Weather

| Weather | Expected Suggestion |
|---------|---------------------|
| 🌧️ Rain | Phở Vịt Quay or Bún restaurants (hot dishes) |
| ☀️ Hot (≥33°C) | Cuốn Ngon or Nhà Hàng Tràng An (air-conditioned) |
| ❄️ Cold (≤20°C) | Phở Vịt Quay or Bún restaurants (warm meals) |
| 🌤️ Mild | Any restaurant with "trua" tag |

## 4. Test Other Features

### Restaurant List
- [ ] All restaurants visible (should be 7 if reseeded)
- [ ] Price badges show correctly (e.g., "40–70k")
- [ ] Restaurant cards clickable
- [ ] Reviews display if any exist

### Budget Filter (from PR #8)
- [ ] Budget filter dropdown works
- [ ] Options: "Bất kỳ", "≤30k", "≤50k", "≤80k"
- [ ] Filters restaurant list correctly
- [ ] Restaurants without prices still show (assumed affordable)

### Slot Spinner
- [ ] Cuisine filter works (Bất kỳ, Phở, Bún, Cơm, Cuốn)
- [ ] Budget + cuisine filters combine correctly
- [ ] "Quay số" button shows random restaurant matching filters

### Admin Panel
- [ ] Login works at `/admin/login`
- [ ] Restaurant list loads at `/admin`
- [ ] Can edit restaurant (price, tags, etc.)
- [ ] Reviews page loads at `/admin/reviews`

## 5. If Weather Doesn't Load

If the weather section stays in loading state:

### Check 1: Database Connection
```bash
# Verify DATABASE_URL is set in Vercel
vercel env pull .env.production.local
cat .env.production.local | grep DATABASE_URL
```

### Check 2: Weather API Response
```bash
# Test weather API endpoint
curl https://vnexter-an-gi.vercel.app/api/weather

# Should return JSON like:
# {
#   "condition": "mild",
#   "tempC": 28,
#   "suggestionText": "...",
#   "suggestedRestaurantId": "clxxxxx",
#   "weatherCode": 1,
#   "skyLabel": "Ít mây",
#   ...
# }
```

### Check 3: Vercel Function Logs
1. Go to Vercel dashboard
2. Select deployment
3. Click "Functions" tab
4. Look for `/api/weather` errors

### Common Issues
- **"Cannot connect to database"** → DATABASE_URL not set or incorrect
- **"Open-Meteo 429"** → Rate limit (rare, has fallback)
- **"Empty suggestion"** → No restaurants with weather tags (reseed needed)

## 6. Optional: Verify Each Restaurant

If you want to check all 7 restaurants are properly seeded:

```bash
# Connect to production DB
export DATABASE_URL="your-production-url"

# Check restaurant count
npx prisma db execute --stdin <<< "SELECT COUNT(*) FROM \"Restaurant\";"

# List all restaurants with tags
npx prisma db execute --stdin <<< "SELECT name, slug, tags, \"priceMin\", \"priceMax\" FROM \"Restaurant\" ORDER BY \"createdAt\";"
```

Expected output: 7 restaurants with proper tags and prices.

## 7. Announce Completion

Once everything is verified:
- [ ] Weather works with real temperature and suggestions
- [ ] Price ranges visible on cards
- [ ] Budget filter functional
- [ ] All 7 restaurants visible
- [ ] Admin panel accessible

✅ **Deployment successful!**

## Troubleshooting

### Weather API times out
- Open-Meteo might be slow. Refresh page after 5-10 seconds.
- Check Vercel function logs for errors.

### No restaurants show
- Database might be empty. Run seed script.
- Check DATABASE_URL is correct.

### Build fails on next deployment
- Make sure build script is `prisma generate && next build` (no migrate)
- Check package.json matches PR #10 changes

### Price ranges don't show
- Either priceMin/priceMax not set, or restaurants not reseeded
- Update via admin panel or run seed script

## Reference

- **PR #10**: https://github.com/nhatnv2-vnext/vnexter-an-gi/pull/10
- **Vercel Dashboard**: https://vercel.com/no-hope/vnexter-an-gi
- **Production Site**: https://vnexter-an-gi.vercel.app
- **Deployment Guide**: `docs/VERCEL_DEPLOYMENT.md`
