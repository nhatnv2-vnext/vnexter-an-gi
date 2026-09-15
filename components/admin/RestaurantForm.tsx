"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { slugifyName } from "@/lib/restaurant-admin";

type Props = {
  mode: "create" | "edit";
  restaurantId?: string;
  initial?: {
    name: string;
    slug: string;
    description: string;
    address: string;
    imageUrl: string;
    tags: string[];
  };
};

export function RestaurantForm({ mode, restaurantId, initial }: Props) {
  const router = useRouter();
  const [name, setName] = useState(initial?.name ?? "");
  const [slug, setSlug] = useState(initial?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(Boolean(initial?.slug));
  const [description, setDescription] = useState(initial?.description ?? "");
  const [address, setAddress] = useState(initial?.address ?? "");
  const [imageUrl, setImageUrl] = useState(initial?.imageUrl ?? "");
  const [tags, setTags] = useState((initial?.tags ?? []).join(", "));
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const previewUrl = imageUrl.trim();

  function onNameChange(value: string) {
    setName(value);
    if (!slugTouched) setSlug(slugifyName(value));
  }

  async function onUpload(file: File | null) {
    if (!file) return;
    setUploading(true);
    setError("");
    const form = new FormData();
    form.set("file", file);
    const res = await fetch("/api/admin/upload", { method: "POST", body: form });
    const body = (await res.json().catch(() => null)) as
      | { url?: string; error?: string }
      | null;
    setUploading(false);
    if (!res.ok || !body?.url) {
      setError(body?.error || "Upload thất bại");
      return;
    }
    setImageUrl(body.url);
  }

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setSaving(true);
    setError("");
    const payload = {
      name,
      slug,
      description,
      address,
      imageUrl,
      tags,
    };
    const res = await fetch(
      mode === "create"
        ? "/api/admin/restaurants"
        : `/api/admin/restaurants/${restaurantId}`,
      {
        method: mode === "create" ? "POST" : "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      },
    );
    const body = (await res.json().catch(() => null)) as { error?: string } | null;
    setSaving(false);
    if (!res.ok) {
      setError(body?.error || "Lưu thất bại");
      return;
    }
    router.push("/admin");
    router.refresh();
  }

  return (
    <form className="admin-form" onSubmit={onSubmit}>
      <label>
        Tên quán
        <input value={name} onChange={(e) => onNameChange(e.target.value)} required />
      </label>
      <label>
        Slug
        <input
          value={slug}
          onChange={(e) => {
            setSlugTouched(true);
            setSlug(e.target.value);
          }}
          required
        />
      </label>
      <label>
        Mô tả
        <textarea
          rows={6}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder={"Có cơm rang, phở bò.\nNên ăn cơm rang 3 chỉ 😋"}
          required
        />
        <span className="admin-field-hint">
          Enter để xuống dòng — hiển thị đúng trên site. Emoji cũng dùng được.
        </span>
      </label>
      <label>
        Địa chỉ
        <input value={address} onChange={(e) => setAddress(e.target.value)} required />
      </label>
      <label>
        Tags (cách nhau bởi dấu phẩy)
        <input
          value={tags}
          onChange={(e) => setTags(e.target.value)}
          placeholder="bun, nong, trua"
        />
      </label>
      <fieldset className="admin-image-fields">
        <legend>Ảnh quán</legend>
        <p className="admin-muted">
          Dán URL ảnh là đủ — không bắt buộc upload. Ví dụ:{" "}
          <code>/restaurants/img-8824.jpg</code>,{" "}
          <code>/restaurants/img-8825.jpg</code>, hoặc link{" "}
          <code>https://...</code> công khai.
        </p>
        <label>
          URL ảnh
          <input
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            placeholder="https://... hoặc /restaurants/img-8824.jpg"
            required
          />
        </label>
        <label>
          Hoặc upload file (Vercel Blob)
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            onChange={(e) => onUpload(e.target.files?.[0] ?? null)}
          />
        </label>
        {previewUrl && !previewUrl.startsWith("data:") && (
          <div className="admin-preview">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={previewUrl} alt="" width={180} height={180} />
          </div>
        )}
        {uploading && <p className="admin-muted">Đang upload...</p>}
      </fieldset>
      {error && <p className="admin-error">{error}</p>}
      <div className="admin-form-actions">
        <button type="submit" className="admin-btn primary" disabled={saving || uploading}>
          {saving ? "Đang lưu..." : mode === "create" ? "Tạo quán" : "Lưu thay đổi"}
        </button>
        <button
          type="button"
          className="admin-btn"
          onClick={() => router.push("/admin")}
        >
          Hủy
        </button>
      </div>
    </form>
  );
}
