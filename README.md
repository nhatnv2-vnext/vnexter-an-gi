# Vnexter ăn gì

Gợi ý **quán ăn trưa** quanh **219 Trung Kính, Hà Nội** — quay số, xem chi tiết quán, đánh giá, và gợi ý theo thời tiết.

Stack: Next.js + Prisma + Neon Postgres, deploy trên Vercel.

## Deploy (Neon + Vercel)

1. **Neon** — tạo Postgres project, copy connection string.
2. **Env** — đặt trong `.env` (local) và trên Vercel (xem `.env.example`):
   - `DATABASE_URL`
   - `AUTH_SECRET` (vd. `openssl rand -base64 32`)
   - `AUTH_URL` (production only — set to your public URL if admin redirects to localhost, e.g. `https://your-domain.com`)
   - `ADMIN_EMAIL` / `ADMIN_PASSWORD` (seed tài khoản admin)
   - `BLOB_READ_WRITE_TOKEN` (Vercel Blob — upload ảnh trong admin)
3. **DB local** — migrate và seed:

   ```bash
   npx prisma migrate deploy
   npx prisma db seed
   ```

4. **Dev** — `npm run dev` → http://localhost:3000  
   Admin: http://localhost:3000/admin/login
5. **Vercel** — import repo, thêm cùng các env trên. Build chạy `prisma generate`, `prisma migrate deploy`, rồi `next build`.

> Nếu `prisma migrate deploy` lỗi advisory lock khi dùng Neon pooler, hãy ưu tiên connection string **direct** (không pooled) cho bước migrate.

> **Production admin fix:** If admin login redirects to `localhost:3000`, set `AUTH_URL` in Vercel env vars to your public URL (e.g. `https://your-domain.vercel.app`). NextAuth v5 auto-detects the URL from request headers, but some hosting environments need explicit configuration.

Sau deploy, seed production một lần nếu cần: `npx prisma db seed` (tạo admin + quán mẫu).

## Admin

- CRUD quán ăn (tên, slug, mô tả, địa chỉ, tags, ảnh)
- Upload ảnh qua Vercel Blob
- Xem / xóa review spam
