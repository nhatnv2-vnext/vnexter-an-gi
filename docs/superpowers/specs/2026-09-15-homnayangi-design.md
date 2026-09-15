# Hôm nay ăn gì — Design Spec

**Date:** 2026-09-15  
**Status:** Approved for planning  
**Location focus:** Quán ăn quanh 219 Trung Kính, Hà Nội

## Goal

App Next.js giúp chọn quán ăn quanh 219 Trung Kính: quay số kiểu slot/gacha, xem chi tiết quán, review 5 sao, và một section gợi ý riêng dựa trên thời tiết hiện tại. Deploy lên Vercel với Neon Postgres.

## Decisions (locked)

| Topic | Choice |
|-------|--------|
| Framework | Next.js App Router |
| Database | Neon Postgres + Prisma |
| Random UX | Slot / gacha animation (không phải bánh xe) |
| Weather vs spin | Hai section độc lập; weather không bias/lọc vòng quay |
| Reviews | Không login; 1 review / quán / browser via `visitor_id` cookie |
| Seed data | Đúng 2 quán, gắn 2 ảnh HEIC đã có trong repo (convert → WebP) |
| Weather API | Open-Meteo (không API key), tọa độ cố định gần 219 Trung Kính |
| Language | UI tiếng Việt |

## Architecture

```
Next.js (App Router) on Vercel
├── /                     Home: hero + Quay số + Weather tip + list
├── /restaurants/[id]     Detail + reviews
├── Route Handlers        /api/restaurants, reviews, weather
├── Prisma Client ──────► Neon Postgres
└── Open-Meteo            Current weather for Trung Kính area
```

- Server Components mặc định; Client Components cho slot animation và form review.
- Ảnh tĩnh trong `public/restaurants/` (WebP), không serve HEIC.
- Env bắt buộc: `DATABASE_URL` (Neon connection string).

## Pages & UI

### `/` — Trang chủ

1. **Hero:** brand “Hôm nay ăn gì” + một câu gần 219 Trung Kính.
2. **Section Quay số:** nút “Quay ngay” → animation slot/gacha → quán thắng + CTA “Xem chi tiết”. Random thuần trong toàn bộ quán (2 quán → 50/50).
3. **Section Thời tiết:** độc lập — điều kiện hiện tại + gợi ý món/quán phù hợp. Không ảnh hưởng vòng quay.
4. **Danh sách quán:** 2 item (ảnh, tên, rating trung bình) → link chi tiết.

### `/restaurants/[id]` — Chi tiết

- Ảnh lớn, tên, mô tả, địa chỉ.
- Rating trung bình + số lượng review.
- Form: rating 1–5 (bắt buộc), comment (optional), tên hiển thị (optional).
- Nếu cookie đã có review cho quán này: khóa form, hiện “Bạn đã đánh giá” và review của mình.
- MVP: không sửa/xóa review sau khi tạo.
- Danh sách review của quán.

### Out of scope (MVP)

- Auth / admin CRUD quán
- Google Maps / upload ảnh
- Sửa/xóa review
- PWA, filter nâng cao, bias thời tiết vào vòng quay

## Data model

### `Restaurant`

| Field | Type | Notes |
|-------|------|--------|
| id | String (cuid) | PK |
| name | String | |
| slug | String | unique |
| description | String | |
| address | String | quanh 219 Trung Kính |
| imageUrl | String | path `/restaurants/...webp` |
| tags | String[] | vd. `["pho","nong"]` — map weather tip |
| createdAt | DateTime | |

### `Review`

| Field | Type | Notes |
|-------|------|--------|
| id | String (cuid) | PK |
| restaurantId | String | FK → Restaurant |
| visitorId | String | UUID từ cookie |
| rating | Int | 1–5 |
| comment | String? | optional |
| authorName | String? | optional |
| createdAt | DateTime | |
| | | `@@unique([restaurantId, visitorId])` |

### Seed

- Đúng 2 restaurants.
- Convert `IMG_8824.HEIC` và `IMG_8825.HEIC` → WebP trong `public/restaurants/`.
- Tags khác nhau đủ để weather mapping có quán/gợi ý tương ứng.

## API

| Method | Path | Behavior |
|--------|------|----------|
| GET | `/api/restaurants` | List + average rating + review count |
| GET | `/api/restaurants/[id]` | Detail + reviews (mới nhất trước) |
| POST | `/api/restaurants/[id]/reviews` | Tạo review; đọc/set cookie `visitor_id`; 409 nếu đã review |
| GET | `/api/weather` | Proxy Open-Meteo → `{ condition, tempC, suggestionText, suggestedRestaurantId? }` |

### Review validation

- `rating` bắt buộc, integer 1–5.
- `comment` optional (cho phép rỗng nếu có rating).
- `authorName` optional.
- Trùng `(restaurantId, visitorId)` → 409 + UI khóa form.

### Weather mapping (code constants)

| Condition (từ Open-Meteo) | Gợi ý ví dụ |
|---------------------------|-------------|
| Mưa / ẩm | Món nóng, phở bò; ưu tiên tag `pho` / `nong` |
| Nắng nóng | Đồ mát / giải nhiệt; tag `mat` / `do-uong` |
| Se lạnh | Món nóng, lẩu/phở; tag `nong` |

Khi không có quán khớp tag: vẫn hiện text gợi ý món, không bắt buộc gắn restaurant.

## Edge cases

- **2 quán quay số:** animation vẫn chạy; kết quả random đều.
- **Weather API fail:** section hiện thông báo lỗi nhẹ + gợi ý mặc định (vd. phở bò quanh Trung Kính).
- **Review trùng:** API 409; UI không cho submit lại.
- **HEIC:** chỉ dùng sau khi convert sang WebP lúc setup/seed.

## Deploy (Vercel + Neon)

1. Tạo Neon project, lấy `DATABASE_URL`.
2. Set env trên Vercel.
3. Build chạy `prisma generate` + `prisma migrate deploy`.
4. Free tier Neon + Vercel đủ cho MVP (2 quán + reviews).

## Success criteria

- User quay số và nhận 1 trong 2 quán với animation slot.
- User mở chi tiết quán thấy ảnh, mô tả, địa chỉ.
- User gửi review 5 sao; browser thứ hai vẫn gửi được; cùng browser không gửi trùng.
- Section thời tiết riêng hiển thị điều kiện + gợi ý (hoặc fallback).
- Deploy được lên Vercel với Neon.
