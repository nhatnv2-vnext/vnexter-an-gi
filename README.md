# Hôm nay ăn gì

Gợi ý **quán ăn trưa** quanh **219 Trung Kính, Hà Nội** — quay số, xem chi tiết quán, đánh giá, và gợi ý theo thời tiết.

Stack: Next.js + Prisma + Neon Postgres, deploy trên Vercel.

## Deploy (Neon + Vercel)

1. **Neon** — tạo Postgres project, copy connection string.
2. **Env** — đặt `DATABASE_URL` trong `.env` (local) và trên Vercel (Project → Settings → Environment Variables). Xem `.env.example`.
3. **DB local** — migrate và seed:

   ```bash
   npx prisma migrate dev
   npx prisma db seed
   ```

4. **Dev** — `npm run dev` → http://localhost:3000
5. **Vercel** — import repo, thêm cùng `DATABASE_URL`. Build chạy `prisma generate`, `prisma migrate deploy`, rồi `next build` (xem `package.json`).

> Nếu `prisma migrate deploy` (local hoặc trong Vercel build) lỗi advisory lock khi dùng Neon pooler, hãy ưu tiên connection string **direct** (không pooled) cho bước migrate.

Sau deploy, seed production một lần nếu cần: `npx prisma db seed` với `DATABASE_URL` trỏ Neon production.
