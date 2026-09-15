# Hôm nay ăn gì MVP Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a Next.js app that helps pick a lunch spot near 219 Trung Kính with a slot/gacha spinner, restaurant detail + 5★ reviews (Neon/Prisma), and a separate weather-based lunch suggestion section.

**Architecture:** Next.js App Router on Vercel; Neon Postgres via Prisma; Open-Meteo for weather at fixed Trung Kính coordinates; anonymous reviews keyed by `visitor_id` cookie; two seed restaurants using converted WebP images from the repo HEIC files.

**Tech Stack:** Next.js 15 (App Router), TypeScript, Tailwind CSS, Prisma, Neon Postgres, Vitest, Open-Meteo API

## Global Constraints

- UI language: tiếng Việt; meal focus: **ăn trưa** quanh 219 Trung Kính
- Exactly 2 seed restaurants; images from `IMG_8824.HEIC` / `IMG_8825.HEIC` → WebP in `public/restaurants/`
- Weather section is independent of the slot spinner (no bias/filter on spin)
- Reviews: no auth; one review per restaurant per browser via `visitor_id` cookie
- Env: `DATABASE_URL` required for Prisma/Neon
- Out of scope: auth, admin CRUD, maps, image upload, edit/delete reviews, PWA

## File Structure

```
app/
  layout.tsx                          # Root layout, brand fonts/CSS vars
  page.tsx                            # Home: Hero + Slot + Weather + list
  globals.css                         # Atmosphere, CSS variables
  restaurants/[id]/page.tsx          # Detail + reviews
  api/restaurants/route.ts            # GET list + avg rating
  api/restaurants/[id]/route.ts      # GET detail + reviews
  api/restaurants/[id]/reviews/route.ts  # POST review
  api/weather/route.ts                # GET weather + lunch suggestion
components/
  Hero.tsx
  SlotSpinner.tsx                     # Client: gacha animation
  WeatherSuggestion.tsx               # Client or server-fed weather card
  RestaurantList.tsx
  RestaurantCard.tsx
  ReviewForm.tsx                      # Client
  ReviewList.tsx
  StarRating.tsx
lib/
  prisma.ts                           # Prisma singleton
  visitor.ts                          # Cookie visitor_id helpers
  weather.ts                          # Open-Meteo fetch + mapping (pure + async)
  review-validation.ts                # Pure validateCreateReview
  types.ts                            # Shared API/DTO types
prisma/
  schema.prisma
  seed.ts
public/restaurants/
  img-8824.webp
  img-8825.webp
vitest.config.ts
tests/
  review-validation.test.ts
  weather.test.ts
  visitor.test.ts
```

---

### Task 1: Scaffold Next.js + Vitest + convert images

**Files:**
- Create: entire Next.js app via `create-next-app` in repo root (existing `docs/` and HEIC files stay)
- Create: `vitest.config.ts`, `tests/.gitkeep`
- Create: `public/restaurants/img-8824.webp`, `public/restaurants/img-8825.webp`
- Modify: `package.json` (add test script, vitest)

**Interfaces:**
- Consumes: none
- Produces: runnable `npm run dev`; WebP paths `/restaurants/img-8824.webp` and `/restaurants/img-8825.webp`

- [ ] **Step 1: Scaffold Next.js in the repo root**

Run from `/Users/nhatnguyen/Documents/homnayangi` (keep existing files):

```bash
npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir=false --import-alias="@/*" --turbopack --yes
```

If create-next-app refuses non-empty dir, create in a temp folder and move app files into root (do not delete `docs/` or HEIC files).

Expected: `package.json`, `app/`, `next.config.ts` present; `npm run dev` starts.

- [ ] **Step 2: Add Vitest**

```bash
npm install -D vitest @vitejs/plugin-react jsdom
```

Create `vitest.config.ts`:

```ts
import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  test: {
    environment: "node",
    include: ["tests/**/*.test.ts"],
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "."),
    },
  },
});
```

Add to `package.json` scripts:

```json
"test": "vitest run",
"test:watch": "vitest"
```

- [ ] **Step 3: Convert HEIC → WebP**

```bash
mkdir -p public/restaurants
sips -s format jpeg IMG_8824.HEIC --out /tmp/img-8824.jpg
sips -s format jpeg IMG_8825.HEIC --out /tmp/img-8825.jpg
sips -s format webp /tmp/img-8824.jpg --out public/restaurants/img-8824.webp
sips -s format webp /tmp/img-8825.jpg --out public/restaurants/img-8825.webp
ls -la public/restaurants/
```

If `sips` cannot write WebP on this macOS, write JPEG instead and use `.jpg` paths consistently in seed (`img-8824.jpg` / `img-8825.jpg`). Prefer WebP when available.

Expected: two image files under `public/restaurants/`.

- [ ] **Step 4: Smoke-check tests runner**

```bash
npm test
```

Expected: Vitest runs with 0 tests (or no failing tests).

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "chore: scaffold Next.js, Vitest, and restaurant WebP assets"
```

---

### Task 2: Review validation + weather mapping (pure logic, TDD)

**Files:**
- Create: `lib/review-validation.ts`
- Create: `lib/weather.ts` (pure mapping parts + types; fetch can stub later)
- Create: `lib/types.ts`
- Create: `tests/review-validation.test.ts`
- Create: `tests/weather.test.ts`

**Interfaces:**
- Consumes: none
- Produces:
  - `validateCreateReview(input: unknown): { ok: true; data: CreateReviewInput } | { ok: false; error: string }`
  - `CreateReviewInput = { rating: number; comment?: string; authorName?: string }`
  - `WeatherCondition = "rain" | "hot" | "cold" | "mild"`
  - `classifyWeather(tempC: number, weatherCode: number): WeatherCondition`
  - `buildLunchSuggestion(condition: WeatherCondition, restaurants: { id: string; tags: string[] }[]): { suggestionText: string; suggestedRestaurantId?: string; preferredTags: string[] }`

- [ ] **Step 1: Write failing review validation tests**

Create `tests/review-validation.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { validateCreateReview } from "@/lib/review-validation";

describe("validateCreateReview", () => {
  it("accepts rating 1-5 with optional fields", () => {
    const result = validateCreateReview({
      rating: 5,
      comment: "Ngon",
      authorName: "An",
    });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data.rating).toBe(5);
      expect(result.data.comment).toBe("Ngon");
      expect(result.data.authorName).toBe("An");
    }
  });

  it("allows empty comment when rating present", () => {
    const result = validateCreateReview({ rating: 3 });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data.rating).toBe(3);
      expect(result.data.comment).toBeUndefined();
    }
  });

  it("rejects missing rating", () => {
    const result = validateCreateReview({ comment: "hi" });
    expect(result.ok).toBe(false);
  });

  it("rejects rating out of range", () => {
    expect(validateCreateReview({ rating: 0 }).ok).toBe(false);
    expect(validateCreateReview({ rating: 6 }).ok).toBe(false);
  });
});
```

- [ ] **Step 2: Run tests — expect FAIL**

```bash
npm test -- tests/review-validation.test.ts
```

Expected: FAIL — module `@/lib/review-validation` not found.

- [ ] **Step 3: Implement validation**

Create `lib/types.ts`:

```ts
export type CreateReviewInput = {
  rating: number;
  comment?: string;
  authorName?: string;
};

export type WeatherCondition = "rain" | "hot" | "cold" | "mild";

export type WeatherSuggestionResult = {
  condition: WeatherCondition;
  tempC: number;
  suggestionText: string;
  suggestedRestaurantId?: string;
};
```

Create `lib/review-validation.ts`:

```ts
import type { CreateReviewInput } from "./types";

export function validateCreateReview(
  input: unknown,
): { ok: true; data: CreateReviewInput } | { ok: false; error: string } {
  if (!input || typeof input !== "object") {
    return { ok: false, error: "Payload không hợp lệ" };
  }
  const body = input as Record<string, unknown>;
  const rating = body.rating;
  if (typeof rating !== "number" || !Number.isInteger(rating) || rating < 1 || rating > 5) {
    return { ok: false, error: "Rating phải là số nguyên từ 1 đến 5" };
  }

  const data: CreateReviewInput = { rating };

  if (body.comment !== undefined && body.comment !== null && body.comment !== "") {
    if (typeof body.comment !== "string") {
      return { ok: false, error: "Comment không hợp lệ" };
    }
    data.comment = body.comment.trim();
  }

  if (body.authorName !== undefined && body.authorName !== null && body.authorName !== "") {
    if (typeof body.authorName !== "string") {
      return { ok: false, error: "Tên không hợp lệ" };
    }
    data.authorName = body.authorName.trim().slice(0, 40);
  }

  return { ok: true, data };
}
```

- [ ] **Step 4: Run review tests — expect PASS**

```bash
npm test -- tests/review-validation.test.ts
```

Expected: PASS

- [ ] **Step 5: Write failing weather mapping tests**

Create `tests/weather.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { classifyWeather, buildLunchSuggestion } from "@/lib/weather";

describe("classifyWeather", () => {
  it("classifies rain weather codes as rain", () => {
    expect(classifyWeather(28, 61)).toBe("rain");
    expect(classifyWeather(25, 95)).toBe("rain");
  });

  it("classifies hot when temp >= 33 and not rain", () => {
    expect(classifyWeather(34, 0)).toBe("hot");
  });

  it("classifies cold when temp <= 20 and not rain", () => {
    expect(classifyWeather(18, 1)).toBe("cold");
  });

  it("classifies mild otherwise", () => {
    expect(classifyWeather(27, 2)).toBe("mild");
  });
});

describe("buildLunchSuggestion", () => {
  const restaurants = [
    { id: "r1", tags: ["pho", "nong", "trua"] },
    { id: "r2", tags: ["mat", "trua"] },
  ];

  it("suggests pho lunch on rain and picks pho-tagged restaurant", () => {
    const result = buildLunchSuggestion("rain", restaurants);
    expect(result.suggestionText).toMatch(/trưa/i);
    expect(result.suggestionText).toMatch(/phở|món nóng/i);
    expect(result.suggestedRestaurantId).toBe("r1");
    expect(result.preferredTags).toContain("pho");
  });

  it("suggests cool lunch on hot and picks mat-tagged restaurant", () => {
    const result = buildLunchSuggestion("hot", restaurants);
    expect(result.suggestionText).toMatch(/trưa/i);
    expect(result.suggestedRestaurantId).toBe("r2");
  });

  it("returns text without restaurant id when no tag match", () => {
    const result = buildLunchSuggestion("rain", [{ id: "x", tags: ["khac"] }]);
    expect(result.suggestionText.length).toBeGreaterThan(0);
    expect(result.suggestedRestaurantId).toBeUndefined();
  });
});
```

- [ ] **Step 6: Run weather tests — expect FAIL**

```bash
npm test -- tests/weather.test.ts
```

Expected: FAIL — `@/lib/weather` missing.

- [ ] **Step 7: Implement weather mapping**

Create `lib/weather.ts`:

```ts
import type { WeatherCondition } from "./types";

/** WMO weather codes that mean rain / storm / drizzle */
const RAIN_CODES = new Set([
  51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 80, 81, 82, 95, 96, 99,
]);

export function classifyWeather(tempC: number, weatherCode: number): WeatherCondition {
  if (RAIN_CODES.has(weatherCode)) return "rain";
  if (tempC >= 33) return "hot";
  if (tempC <= 20) return "cold";
  return "mild";
}

const SUGGESTION_COPY: Record<
  WeatherCondition,
  { text: string; preferredTags: string[] }
> = {
  rain: {
    text: "Trưa mưa quanh Trung Kính — nên ăn phở bò hoặc món nóng cho ấm bụng.",
    preferredTags: ["pho", "nong"],
  },
  hot: {
    text: "Trưa nắng nóng — chọn món mát, nhẹ bụng gần 219 Trung Kính.",
    preferredTags: ["mat", "do-uong"],
  },
  cold: {
    text: "Trưa se lạnh — hợp món nóng, phở hoặc lẩu nhẹ.",
    preferredTags: ["nong", "pho"],
  },
  mild: {
    text: "Thời tiết dễ chịu — hợp đi bộ ăn trưa quanh 219 Trung Kính.",
    preferredTags: ["trua"],
  },
};

export function buildLunchSuggestion(
  condition: WeatherCondition,
  restaurants: { id: string; tags: string[] }[],
): {
  suggestionText: string;
  suggestedRestaurantId?: string;
  preferredTags: string[];
} {
  const { text, preferredTags } = SUGGESTION_COPY[condition];
  const match = restaurants.find((r) =>
    r.tags.some((t) => preferredTags.includes(t)),
  );
  return {
    suggestionText: text,
    preferredTags,
    suggestedRestaurantId: match?.id,
  };
}

export const TRUNG_KINH_COORDS = { latitude: 21.0139, longitude: 105.7965 };

export const DEFAULT_LUNCH_FALLBACK =
  "Không lấy được thời tiết. Gợi ý mặc định cho bữa trưa: phở bò quanh 219 Trung Kính.";
```

- [ ] **Step 8: Run all unit tests — expect PASS**

```bash
npm test
```

Expected: all PASS.

- [ ] **Step 9: Commit**

```bash
git add lib/types.ts lib/review-validation.ts lib/weather.ts tests/
git commit -m "feat: add review validation and lunch weather mapping"
```

---

### Task 3: Prisma schema, Neon client, seed 2 lunch restaurants

**Files:**
- Create: `prisma/schema.prisma`
- Create: `prisma/seed.ts`
- Create: `lib/prisma.ts`
- Create: `.env.example`
- Modify: `package.json` (prisma seed config)

**Interfaces:**
- Consumes: image paths from Task 1; tags used by `buildLunchSuggestion`
- Produces: Prisma models `Restaurant`, `Review`; `prisma` singleton; seed creates exactly 2 restaurants

- [ ] **Step 1: Add Prisma + schema**

```bash
npm install @prisma/client
npm install -D prisma tsx
npx prisma init
```

Replace `prisma/schema.prisma`:

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model Restaurant {
  id          String   @id @default(cuid())
  name        String
  slug        String   @unique
  description String
  address     String
  imageUrl    String
  tags        String[]
  createdAt   DateTime @default(now())
  reviews     Review[]
}

model Review {
  id           String     @id @default(cuid())
  restaurantId String
  visitorId    String
  rating       Int
  comment      String?
  authorName   String?
  createdAt    DateTime   @default(now())
  restaurant   Restaurant @relation(fields: [restaurantId], references: [id], onDelete: Cascade)

  @@unique([restaurantId, visitorId])
  @@index([restaurantId])
}
```

Create `lib/prisma.ts`:

```ts
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
```

Create `.env.example`:

```
DATABASE_URL="postgresql://USER:PASSWORD@HOST/DB?sslmode=require"
```

- [ ] **Step 2: Write seed script**

Create `prisma/seed.ts`:

```ts
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  await prisma.review.deleteMany();
  await prisma.restaurant.deleteMany();

  await prisma.restaurant.createMany({
    data: [
      {
        name: "Phở bò Trung Kính",
        slug: "pho-bo-trung-kinh",
        description:
          "Quán phở bò quen thuộc cho bữa trưa gần 219 Trung Kính — nước trong, tái chín đủ vị, hợp ngày mưa hoặc se lạnh.",
        address: "Gần 219 Trung Kính, Cầu Giấy, Hà Nội",
        imageUrl: "/restaurants/img-8824.webp",
        tags: ["pho", "nong", "trua"],
      },
      {
        name: "Cơm văn phòng mát bụng",
        slug: "com-van-phong-mat-bung",
        description:
          "Suất cơm trưa nhẹ bụng quanh Trung Kính — hợp ngày nắng nóng, ăn xong vẫn tỉnh táo làm việc tiếp.",
        address: "Gần 219 Trung Kính, Cầu Giấy, Hà Nội",
        imageUrl: "/restaurants/img-8825.webp",
        tags: ["mat", "trua", "com"],
      },
    ],
  });
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
```

If images are `.jpg` from Task 1, use matching `imageUrl` paths.

Add to `package.json`:

```json
"prisma": {
  "seed": "tsx prisma/seed.ts"
}
```

- [ ] **Step 3: Migrate against Neon**

Engineer must create a Neon project (or use local Postgres) and set `DATABASE_URL` in `.env`.

```bash
npx prisma migrate dev --name init
npx prisma db seed
npx prisma studio
```

Expected: 2 restaurants visible; 0 reviews.

- [ ] **Step 4: Commit**

Do **not** commit `.env`. Commit schema, seed, prisma client, `.env.example`.

```bash
git add prisma lib/prisma.ts .env.example package.json package-lock.json
git commit -m "feat: add Prisma schema and lunch restaurant seed"
```

---

### Task 4: Visitor cookie helper + restaurant/review APIs

**Files:**
- Create: `lib/visitor.ts`
- Create: `tests/visitor.test.ts`
- Create: `app/api/restaurants/route.ts`
- Create: `app/api/restaurants/[id]/route.ts`
- Create: `app/api/restaurants/[id]/reviews/route.ts`

**Interfaces:**
- Consumes: `prisma`, `validateCreateReview`
- Produces:
  - `VISITOR_COOKIE = "visitor_id"`
  - `ensureVisitorId(existing: string | undefined): { visitorId: string; setCookie: boolean }`
  - `GET /api/restaurants` → `{ restaurants: Array<{ id, name, slug, description, address, imageUrl, tags, avgRating, reviewCount }> }`
  - `GET /api/restaurants/[id]` → restaurant + `reviews` + `avgRating` + `reviewCount` + `myReview` (if cookie matches)
  - `POST /api/restaurants/[id]/reviews` → 201 created | 400 validation | 404 | 409 duplicate

- [ ] **Step 1: Write visitor helper tests**

Create `tests/visitor.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { ensureVisitorId, isValidVisitorId } from "@/lib/visitor";

describe("ensureVisitorId", () => {
  it("reuses existing valid uuid", () => {
    const id = "550e8400-e29b-41d4-a716-446655440000";
    const result = ensureVisitorId(id);
    expect(result.visitorId).toBe(id);
    expect(result.setCookie).toBe(false);
  });

  it("creates new id when missing", () => {
    const result = ensureVisitorId(undefined);
    expect(isValidVisitorId(result.visitorId)).toBe(true);
    expect(result.setCookie).toBe(true);
  });

  it("creates new id when invalid", () => {
    const result = ensureVisitorId("not-a-uuid");
    expect(isValidVisitorId(result.visitorId)).toBe(true);
    expect(result.setCookie).toBe(true);
  });
});
```

- [ ] **Step 2: Run — expect FAIL then implement**

```bash
npm test -- tests/visitor.test.ts
```

Create `lib/visitor.ts`:

```ts
const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export const VISITOR_COOKIE = "visitor_id";

export function isValidVisitorId(value: string): boolean {
  return UUID_RE.test(value);
}

export function ensureVisitorId(existing: string | undefined): {
  visitorId: string;
  setCookie: boolean;
} {
  if (existing && isValidVisitorId(existing)) {
    return { visitorId: existing, setCookie: false };
  }
  return { visitorId: crypto.randomUUID(), setCookie: true };
}
```

- [ ] **Step 3: Implement GET list API**

Create `app/api/restaurants/route.ts`:

```ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const restaurants = await prisma.restaurant.findMany({
    orderBy: { createdAt: "asc" },
    include: { reviews: { select: { rating: true } } },
  });

  const payload = restaurants.map((r) => {
    const reviewCount = r.reviews.length;
    const avgRating =
      reviewCount === 0
        ? 0
        : r.reviews.reduce((s, x) => s + x.rating, 0) / reviewCount;
    const { reviews: _reviews, ...rest } = r;
    return {
      ...rest,
      avgRating: Math.round(avgRating * 10) / 10,
      reviewCount,
    };
  });

  return NextResponse.json({ restaurants: payload });
}
```

- [ ] **Step 4: Implement GET detail API**

Create `app/api/restaurants/[id]/route.ts`:

```ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { VISITOR_COOKIE } from "@/lib/visitor";

type Params = { params: Promise<{ id: string }> };

export async function GET(req: NextRequest, { params }: Params) {
  const { id } = await params;
  const visitorId = req.cookies.get(VISITOR_COOKIE)?.value;

  const restaurant = await prisma.restaurant.findUnique({
    where: { id },
    include: {
      reviews: { orderBy: { createdAt: "desc" } },
    },
  });

  if (!restaurant) {
    return NextResponse.json({ error: "Không tìm thấy quán" }, { status: 404 });
  }

  const reviewCount = restaurant.reviews.length;
  const avgRating =
    reviewCount === 0
      ? 0
      : restaurant.reviews.reduce((s, x) => s + x.rating, 0) / reviewCount;

  const myReview = visitorId
    ? restaurant.reviews.find((r) => r.visitorId === visitorId) ?? null
    : null;

  return NextResponse.json({
    restaurant: {
      id: restaurant.id,
      name: restaurant.name,
      slug: restaurant.slug,
      description: restaurant.description,
      address: restaurant.address,
      imageUrl: restaurant.imageUrl,
      tags: restaurant.tags,
      createdAt: restaurant.createdAt,
      avgRating: Math.round(avgRating * 10) / 10,
      reviewCount,
      reviews: restaurant.reviews.map(({ visitorId: _v, ...r }) => r),
      myReview: myReview
        ? {
            id: myReview.id,
            rating: myReview.rating,
            comment: myReview.comment,
            authorName: myReview.authorName,
            createdAt: myReview.createdAt,
          }
        : null,
    },
  });
}
```

- [ ] **Step 5: Implement POST review API**

Create `app/api/restaurants/[id]/reviews/route.ts`:

```ts
import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { validateCreateReview } from "@/lib/review-validation";
import { ensureVisitorId, VISITOR_COOKIE } from "@/lib/visitor";

type Params = { params: Promise<{ id: string }> };

export async function POST(req: NextRequest, { params }: Params) {
  const { id } = await params;
  const restaurant = await prisma.restaurant.findUnique({ where: { id } });
  if (!restaurant) {
    return NextResponse.json({ error: "Không tìm thấy quán" }, { status: 404 });
  }

  const body = await req.json().catch(() => null);
  const validated = validateCreateReview(body);
  if (!validated.ok) {
    return NextResponse.json({ error: validated.error }, { status: 400 });
  }

  const existingCookie = req.cookies.get(VISITOR_COOKIE)?.value;
  const { visitorId, setCookie } = ensureVisitorId(existingCookie);

  try {
    const review = await prisma.review.create({
      data: {
        restaurantId: id,
        visitorId,
        rating: validated.data.rating,
        comment: validated.data.comment,
        authorName: validated.data.authorName,
      },
    });

    const res = NextResponse.json({ review }, { status: 201 });
    if (setCookie) {
      res.cookies.set(VISITOR_COOKIE, visitorId, {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24 * 365,
      });
    }
    return res;
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
      return NextResponse.json(
        { error: "Bạn đã đánh giá quán này rồi" },
        { status: 409 },
      );
    }
    throw e;
  }
}
```

- [ ] **Step 6: Manual API smoke test**

```bash
npm run dev
# other terminal:
curl -s http://localhost:3000/api/restaurants | jq
ID=$(curl -s http://localhost:3000/api/restaurants | jq -r '.restaurants[0].id')
curl -s -c /tmp/hna.cookie -b /tmp/hna.cookie -X POST \
  "http://localhost:3000/api/restaurants/$ID/reviews" \
  -H 'content-type: application/json' \
  -d '{"rating":5,"comment":"Trưa ngon"}' | jq
curl -s -c /tmp/hna.cookie -b /tmp/hna.cookie -X POST \
  "http://localhost:3000/api/restaurants/$ID/reviews" \
  -H 'content-type: application/json' \
  -d '{"rating":4}' | jq
```

Expected: first POST 201; second POST 409; list shows avgRating.

- [ ] **Step 7: Commit**

```bash
git add lib/visitor.ts app/api tests/visitor.test.ts
git commit -m "feat: add restaurant and review APIs with visitor cookie"
```

---

### Task 5: Weather API route

**Files:**
- Create: `app/api/weather/route.ts`
- Modify: `lib/weather.ts` (add `fetchWeatherSuggestion`)

**Interfaces:**
- Consumes: `classifyWeather`, `buildLunchSuggestion`, `TRUNG_KINH_COORDS`, `DEFAULT_LUNCH_FALLBACK`, `prisma`
- Produces: `GET /api/weather` → `{ condition, tempC, suggestionText, suggestedRestaurantId?, degraded?: boolean }`

- [ ] **Step 1: Add fetch helper to `lib/weather.ts`**

Append:

```ts
export async function fetchOpenMeteoCurrent(): Promise<{
  tempC: number;
  weatherCode: number;
}> {
  const { latitude, longitude } = TRUNG_KINH_COORDS;
  const url = new URL("https://api.open-meteo.com/v1/forecast");
  url.searchParams.set("latitude", String(latitude));
  url.searchParams.set("longitude", String(longitude));
  url.searchParams.set("current", "temperature_2m,weather_code");
  url.searchParams.set("timezone", "Asia/Ho_Chi_Minh");

  const res = await fetch(url.toString(), { next: { revalidate: 600 } });
  if (!res.ok) throw new Error(`Open-Meteo ${res.status}`);
  const data = (await res.json()) as {
    current?: { temperature_2m?: number; weather_code?: number };
  };
  const tempC = data.current?.temperature_2m;
  const weatherCode = data.current?.weather_code;
  if (typeof tempC !== "number" || typeof weatherCode !== "number") {
    throw new Error("Open-Meteo payload missing current weather");
  }
  return { tempC, weatherCode };
}
```

- [ ] **Step 2: Implement route**

Create `app/api/weather/route.ts`:

```ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  buildLunchSuggestion,
  classifyWeather,
  DEFAULT_LUNCH_FALLBACK,
  fetchOpenMeteoCurrent,
} from "@/lib/weather";

export async function GET() {
  const restaurants = await prisma.restaurant.findMany({
    select: { id: true, tags: true },
  });

  try {
    const { tempC, weatherCode } = await fetchOpenMeteoCurrent();
    const condition = classifyWeather(tempC, weatherCode);
    const suggestion = buildLunchSuggestion(condition, restaurants);
    return NextResponse.json({
      condition,
      tempC,
      suggestionText: suggestion.suggestionText,
      suggestedRestaurantId: suggestion.suggestedRestaurantId,
    });
  } catch {
    return NextResponse.json({
      condition: "mild",
      tempC: null,
      suggestionText: DEFAULT_LUNCH_FALLBACK,
      suggestedRestaurantId: restaurants.find((r) =>
        r.tags.includes("pho"),
      )?.id,
      degraded: true,
    });
  }
}
```

- [ ] **Step 3: Smoke test**

```bash
curl -s http://localhost:3000/api/weather | jq
```

Expected: JSON with `suggestionText` containing lunch framing; on network fail still returns `degraded: true` and fallback text.

- [ ] **Step 4: Commit**

```bash
git add lib/weather.ts app/api/weather/route.ts
git commit -m "feat: add weather API with lunch suggestions"
```

---

### Task 6: Home page UI — Hero, SlotSpinner, Weather, list

**Files:**
- Modify: `app/layout.tsx`, `app/globals.css`, `app/page.tsx`
- Create: `components/Hero.tsx`, `components/SlotSpinner.tsx`, `components/WeatherSuggestion.tsx`, `components/RestaurantList.tsx`, `components/RestaurantCard.tsx`

**Interfaces:**
- Consumes: `GET /api/restaurants`, `GET /api/weather`
- Produces: Vietnamese lunch-focused home with independent spin + weather sections

- [ ] **Step 1: Global styles + layout**

Set CSS variables in `app/globals.css` for a warm street-food / midday Hanoi feel (avoid purple-on-white, cream+terracotta broadsheet clichés). Use an expressive Google font pair via `next/font` in `layout.tsx` (e.g. Be Vietnam Pro + a display face). Metadata title: `Hôm nay ăn gì`.

`app/layout.tsx` children wrapper: full-bleed background atmosphere (gradient or subtle pattern), not flat single color.

- [ ] **Step 2: Hero**

`components/Hero.tsx` — brand name hero-level “Hôm nay ăn gì”, one supporting line about ăn trưa gần 219 Trung Kính. No cards in hero.

- [ ] **Step 3: SlotSpinner (client)**

`components/SlotSpinner.tsx`:

```tsx
"use client";

import { useState } from "react";
import Link from "next/link";

type RestaurantSummary = {
  id: string;
  name: string;
  imageUrl: string;
};

export function SlotSpinner({ restaurants }: { restaurants: RestaurantSummary[] }) {
  const [spinning, setSpinning] = useState(false);
  const [winner, setWinner] = useState<RestaurantSummary | null>(null);
  const [displayName, setDisplayName] = useState("???");

  async function spin() {
    if (spinning || restaurants.length === 0) return;
    setSpinning(true);
    setWinner(null);
    const pick = restaurants[Math.floor(Math.random() * restaurants.length)];
    const frames = 18;
    for (let i = 0; i < frames; i++) {
      const flash = restaurants[i % restaurants.length];
      setDisplayName(flash.name);
      await new Promise((r) => setTimeout(r, 60 + i * 12));
    }
    setDisplayName(pick.name);
    setWinner(pick);
    setSpinning(false);
  }

  return (
    <section aria-labelledby="spin-heading">
      <h2 id="spin-heading">Hôm nay ăn trưa gì?</h2>
      <p>Quay số ngẫu nhiên — không phụ thuộc thời tiết.</p>
      <div className="slot-window" aria-live="polite">
        {displayName}
      </div>
      <button type="button" onClick={spin} disabled={spinning}>
        {spinning ? "Đang quay..." : "Quay ngay"}
      </button>
      {winner && (
        <p>
          Kết quả: <strong>{winner.name}</strong>{" "}
          <Link href={`/restaurants/${winner.id}`}>Xem chi tiết</Link>
        </p>
      )}
    </section>
  );
}
```

Style the slot window with intentional motion (CSS transition / blur) — at least 2–3 motions site-wide across home.

- [ ] **Step 4: WeatherSuggestion**

Client component that fetches `/api/weather` on mount; shows temp/condition + `suggestionText`; if `suggestedRestaurantId`, link to that restaurant; on `degraded`, show fallback messaging.

- [ ] **Step 5: Restaurant list**

`RestaurantCard` + `RestaurantList` — image, name, avg stars, link to detail. Not cards-in-hero; list section may use interactive list items.

- [ ] **Step 6: Wire `app/page.tsx`**

Server-fetch restaurants via `prisma` (or internal fetch). Render Hero → SlotSpinner → WeatherSuggestion → RestaurantList in that order. Copy must say ăn trưa.

- [ ] **Step 7: Manual UI check**

```bash
npm run dev
```

Open `/` — verify spin works with 2 restaurants; weather section separate; list links work.

- [ ] **Step 8: Commit**

```bash
git add app components
git commit -m "feat: build home page with slot spinner and weather tip"
```

---

### Task 7: Restaurant detail + review form UI

**Files:**
- Create: `app/restaurants/[id]/page.tsx`
- Create: `components/ReviewForm.tsx`, `components/ReviewList.tsx`, `components/StarRating.tsx`

**Interfaces:**
- Consumes: detail API shape / prisma query equivalent; POST reviews
- Produces: detail page with locked form when `myReview` exists

- [ ] **Step 1: StarRating component**

Controlled 1–5 stars for form + read-only display for averages/lists.

- [ ] **Step 2: ReviewForm (client)**

Props: `restaurantId`, `initialMyReview`. If `initialMyReview`, show “Bạn đã đánh giá” + read-only stars/comment (no edit). Else submit POST JSON; on 409 lock form; on 201 refresh (`router.refresh()`).

- [ ] **Step 3: ReviewList**

List reviews newest first: authorName or “Ẩn danh”, stars, comment, date.

- [ ] **Step 4: Detail page**

Server Component loads restaurant by `id` (404 if missing), shows image (`next/image`), description, address, avg rating, ReviewForm, ReviewList. Read `visitor_id` cookie with `cookies()` from `next/headers` to pass `myReview`.

- [ ] **Step 5: Manual test**

- Open restaurant A → submit 5★ review → form locks  
- Hard refresh → still locked  
- Incognito → can still review  
- Verify address/description/image visible  

- [ ] **Step 6: Commit**

```bash
git add app/restaurants components/ReviewForm.tsx components/ReviewList.tsx components/StarRating.tsx
git commit -m "feat: add restaurant detail and 5-star reviews"
```

---

### Task 8: Vercel build config + README deploy notes

**Files:**
- Modify: `package.json` build script
- Create: `README.md` (deploy steps only — keep short)
- Modify: `next.config.ts` if needed for images

**Interfaces:**
- Produces: `prisma generate && prisma migrate deploy && next build` friendly scripts

- [ ] **Step 1: Build scripts**

```json
"build": "prisma generate && prisma migrate deploy && next build",
"postinstall": "prisma generate"
```

- [ ] **Step 2: README**

Document: create Neon → set `DATABASE_URL` locally and on Vercel → `npx prisma migrate dev` / seed → `npm run dev` → deploy Vercel with same env. Mention lunch focus and 219 Trung Kính.

- [ ] **Step 3: Local production build smoke**

```bash
npm run build
```

Expected: build succeeds with valid `DATABASE_URL`.

- [ ] **Step 4: Commit**

```bash
git add package.json README.md next.config.ts
git commit -m "chore: add Vercel/Neon build scripts and README"
```

---

### Task 9: End-to-end verification checklist

**Files:** none (manual)

- [ ] **Step 1: Run unit tests**

```bash
npm test
```

Expected: all PASS.

- [ ] **Step 2: Checklist against success criteria**

- [ ] UI clearly about **ăn trưa** near 219 Trung Kính  
- [ ] Slot spin returns one of two restaurants with animation  
- [ ] Weather section independent + lunch-framed suggestion (or fallback)  
- [ ] Detail shows image, description, address  
- [ ] Review 5★ works; same browser blocked; other browser allowed  
- [ ] Images are WebP/JPEG under `public/restaurants/`, not HEIC  

- [ ] **Step 3: Final commit if any polish leftovers**

```bash
git status
# commit only if there are intentional leftover fixes
```

---

## Spec coverage (self-review)

| Spec requirement | Task |
|------------------|------|
| Next.js App Router + Vercel | 1, 8 |
| Neon + Prisma | 3, 4, 8 |
| Slot/gacha random (not wheel) | 6 |
| Weather section separate from spin | 5, 6 |
| Lunch focus / 219 Trung Kính copy | 3 seed, 5 copy, 6–7 UI |
| 2 restaurants + HEIC→WebP | 1, 3 |
| Detail: image, description, address | 7 |
| Reviews 5★, 1 per browser cookie | 2, 4, 7 |
| Open-Meteo + fallback | 2, 5 |
| Deploy notes Neon/Vercel | 8 |

**Placeholder scan:** none intentional.  
**Type consistency:** `CreateReviewInput`, `WeatherCondition`, cookie `visitor_id`, restaurant `tags` string[] aligned across tasks.
