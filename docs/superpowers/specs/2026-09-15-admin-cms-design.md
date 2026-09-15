# Admin CMS — Design Spec

**Date:** 2026-09-15  
**Status:** Approved for implementation  
**Parent:** Hôm nay ăn gì MVP (`2026-09-15-homnayangi-design.md`)

## Goal

Protected admin area so the owner can CRUD lunch restaurants (~10 items), upload images to Vercel Blob, and delete spam reviews. Public site behavior unchanged.

## Decisions (locked)

| Topic | Choice |
|-------|--------|
| Auth | Auth.js (NextAuth v5) Credentials — email + password |
| Users | Prisma `AdminUser`; seed 1 admin from `ADMIN_EMAIL` / `ADMIN_PASSWORD` |
| Scope | Restaurant CRUD + review list/delete |
| Images | Upload via Vercel Blob (`BLOB_READ_WRITE_TOKEN`) |
| UI language | Vietnamese |
| Public reviews | Unchanged (visitor cookie, no login) |

## Architecture

```
/admin/login
/admin                      restaurants list
/admin/restaurants/new
/admin/restaurants/[id]     edit form + upload
/admin/reviews              list + delete

Auth.js JWT session
Middleware protects /admin/* except /admin/login
Prisma AdminUser + existing Restaurant / Review
Vercel Blob for imageUrl
```

### Env

- `DATABASE_URL`
- `AUTH_SECRET`
- `ADMIN_EMAIL` / `ADMIN_PASSWORD` (seed only)
- `BLOB_READ_WRITE_TOKEN`

## Data model

### `AdminUser`

| Field | Type |
|-------|------|
| id | String cuid PK |
| email | String unique |
| passwordHash | String |
| createdAt | DateTime |

Restaurant / Review models unchanged. `imageUrl` may be `/restaurants/...` or `https://*.public.blob.vercel-storage.com/...`.

## Pages

- **Login:** email, password, Vietnamese errors (generic on failure).
- **Restaurants list:** thumb, name, tags, Edit / Delete / Add.
- **Restaurant form:** name, slug (editable, default from name), description, address, tags (comma-separated), image upload + preview, Save.
- **Reviews:** restaurant name, stars, comment, date, Delete.

## API (admin session required → 401/403 otherwise)

| Method | Path | Behavior |
|--------|------|----------|
| POST | `/api/admin/restaurants` | Create |
| PATCH | `/api/admin/restaurants/[id]` | Update |
| DELETE | `/api/admin/restaurants/[id]` | Delete (cascade reviews) |
| POST | `/api/admin/upload` | Multipart image → Blob URL (reject non-image / >4MB) |
| DELETE | `/api/admin/reviews/[id]` | Delete review |

## Edge cases

- Wrong login: generic Vietnamese error.
- Delete restaurant: confirm in UI; cascade reviews.
- Upload validation: image MIME, max 4MB.
- Replacing image on edit: store new Blob URL; do not require deleting old Blob (MVP).
- `next.config` remotePatterns for Vercel Blob host.

## Out of scope

- Create admins in UI / multi-role
- Edit reviews (delete only)
- Soft-delete / audit log
- Reorder spin reel
- Delete old Blob objects on replace

## Success criteria

- Seeded admin can log in and reach `/admin`.
- Unauthenticated users redirected from `/admin` to login.
- Admin can create/update/delete restaurants including Blob upload.
- Admin can list and delete reviews.
- Public spin / weather / review flows still work.
