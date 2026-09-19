import { isBrandFirstTitle } from "@/lib/restaurant-seo";

export type RestaurantInput = {
  name: string;
  slug: string;
  description: string;
  address: string;
  imageUrl: string;
  tags: string[];
  openTime?: string | null;
  closeTime?: string | null;
  priceMin?: number | null;
  priceMax?: number | null;
  metaTitle?: string | null;
  metaDescription?: string | null;
  metaImageUrl?: string | null;
};

export function slugifyName(name: string): string {
  return name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/đ/g, "d")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

export function parseTags(raw: unknown): string[] {
  const collected: string[] = [];
  if (Array.isArray(raw)) {
    for (const item of raw) {
      if (typeof item !== "string") continue;
      const tag = item.trim();
      if (tag) collected.push(tag);
    }
  } else if (typeof raw === "string") {
    for (const part of raw.split(",")) {
      const tag = part.trim();
      if (tag) collected.push(tag);
    }
  }
  return Array.from(new Set(collected));
}

function optionalTrimmedString(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed || null;
}

function isHttpOrPathUrl(url: string): boolean {
  return (
    url.startsWith("/") ||
    url.startsWith("https://") ||
    url.startsWith("http://")
  );
}

export function validateRestaurantInput(
  input: unknown,
): { ok: true; data: RestaurantInput } | { ok: false; error: string } {
  if (!input || typeof input !== "object") {
    return { ok: false, error: "Payload không hợp lệ" };
  }
  const body = input as Record<string, unknown>;
  const name = typeof body.name === "string" ? body.name.trim() : "";
  const slugRaw = typeof body.slug === "string" ? body.slug.trim() : "";
  const description =
    typeof body.description === "string" ? body.description.trim() : "";
  const address = typeof body.address === "string" ? body.address.trim() : "";
  const imageUrl =
    typeof body.imageUrl === "string" ? body.imageUrl.trim() : "";

  if (!name) return { ok: false, error: "Tên quán bắt buộc" };
  if (!description) return { ok: false, error: "Mô tả bắt buộc" };
  if (!address) return { ok: false, error: "Địa chỉ bắt buộc" };
  if (!imageUrl) return { ok: false, error: "Ảnh quán bắt buộc" };
  if (imageUrl.startsWith("data:")) {
    return {
      ok: false,
      error: "Không dùng ảnh dạng data URL — hãy dán link https hoặc đường dẫn /restaurants/...",
    };
  }
  if (!isHttpOrPathUrl(imageUrl)) {
    return {
      ok: false,
      error: "URL ảnh phải là đường dẫn /... hoặc link http(s)://...",
    };
  }

  const slug = slugRaw || slugifyName(name);
  if (!slug) return { ok: false, error: "Slug không hợp lệ" };

  const openTime = optionalTrimmedString(body.openTime);
  const closeTime = optionalTrimmedString(body.closeTime);
  const metaTitle = optionalTrimmedString(body.metaTitle);
  const metaDescription = optionalTrimmedString(body.metaDescription);
  const metaImageUrl = optionalTrimmedString(body.metaImageUrl);

  if (metaTitle && metaTitle.length > 70) {
    return { ok: false, error: "Meta title tối đa 70 ký tự" };
  }
  if (metaTitle && isBrandFirstTitle(metaTitle)) {
    return {
      ok: false,
      error: "Meta title không được bắt đầu bằng tên thương hiệu — đặt tên quán trước",
    };
  }
  if (metaDescription && metaDescription.length > 180) {
    return { ok: false, error: "Meta description tối đa 180 ký tự" };
  }
  if (metaImageUrl) {
    if (metaImageUrl.startsWith("data:")) {
      return {
        ok: false,
        error: "Meta image không dùng data URL — hãy dán link https hoặc /...",
      };
    }
    if (!isHttpOrPathUrl(metaImageUrl)) {
      return {
        ok: false,
        error: "Meta image phải là đường dẫn /... hoặc link http(s)://...",
      };
    }
  }

  const priceMin = typeof body.priceMin === "number" ? body.priceMin : null;
  const priceMax = typeof body.priceMax === "number" ? body.priceMax : null;

  return {
    ok: true,
    data: {
      name,
      slug,
      description,
      address,
      imageUrl,
      tags: parseTags(body.tags),
      openTime,
      closeTime,
      priceMin,
      priceMax,
      metaTitle,
      metaDescription,
      metaImageUrl,
    },
  };
}
