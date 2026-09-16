# Restaurant Tags Guide

This guide explains the tag system used for weather-based lunch recommendations in the Hôm nay ăn gì app.

## Tag Categories

### Weather-Specific Tags

These tags help match restaurants to weather conditions:

#### Hot Dishes (for rain/cold weather)
- `pho` — Phở and similar noodle soups
- `nong` — Hot/warm dishes in general
- `bun` — Bún dishes (can be hot or room temperature)

#### Cool/Light Dishes (for hot weather)
- `mat` — Cool/refreshing dishes
- `cuon` — Rolled dishes (gỏi cuốn, nem cuốn)
- `do-uong` — Beverages and drinks
- `nhe` — Light dishes (easy on the stomach)

#### Spice Level
- `cay` — Spicy dishes

### General Tags
- `trua` — Lunch-appropriate (should be applied to most restaurants)
- `com` — Rice-based meals
- `chay` — Vegetarian options

## Weather Matching Algorithm

The system uses weighted scoring to rank restaurants:

1. **Rain** — Prefers: `pho` (highest), `nong`, `bun` (lowest)
2. **Hot** — Prefers: `mat` (highest), `cuon`, `do-uong`, `nhe` (lowest)
3. **Cold** — Prefers: `nong` (highest), `pho`, `bun` (lowest)
4. **Mild** — Prefers: `trua`

Tags earlier in the preference list receive higher weights. Restaurants are scored based on matching tags and sorted by score.

## Recommended Tag Sets

### Example Combinations

**Hot soup restaurants:**
```
["pho", "nong", "trua"]
```

**Bún bò Huế / hot bún:**
```
["bun", "nong", "cay", "trua"]
```

**Gỏi cuốn / fresh rolls:**
```
["cuon", "mat", "nhe", "trua"]
```

**Smoothie / juice bar:**
```
["do-uong", "mat", "trua"]
```

**Rice meals:**
```
["com", "trua"]
```

**Vegetarian:**
```
["chay", "trua", "nhe"]
```

## Adding New Restaurants

When seeding or adding restaurants via admin interface:

1. **Always include `trua`** unless the restaurant is specifically not lunch-appropriate
2. **Add 2-4 weather tags** to ensure the restaurant appears in relevant weather conditions
3. **Consider the target weather**: 
   - Cold/rainy days → add `nong`, `pho`, or `bun`
   - Hot days → add `mat`, `cuon`, `do-uong`, or `nhe`
4. **Be specific**: Use `pho` for phở restaurants rather than just `nong`

## Updating Seed Data

To update the seed data with better tags:

1. Edit `prisma/seed.ts`
2. Update the `tags` array for each restaurant
3. Run locally: `npx prisma db seed`
4. Test the weather API: `curl http://localhost:3000/api/weather`

**Note:** Do NOT commit database credentials or connection strings. The seed script reads `DATABASE_URL` from environment variables.

## Testing Tag Changes

Run the unit tests to verify tag logic:

```bash
npm test tests/weather.test.ts
```

The tests verify:
- Correct ranking based on tag priority
- Restaurant selection for each weather condition
- Fallback behavior when no tags match
- Weighted scoring algorithm
