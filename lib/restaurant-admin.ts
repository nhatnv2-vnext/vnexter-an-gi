export type RestaurantInput = {
  name: string;
  slug: string;
  description: string;
  address: string;
  imageUrl: string;
  tags: string[];
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
  if (Array.isArray(raw)) {
    return raw
      .filter((t): t is string => typeof t === "string")
      .map((t) => t.trim())
      .filter(Boolean);
  }
  if (typeof raw !== "string") return [];
  return raw
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);
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
  if (
    !imageUrl.startsWith("/") &&
    !imageUrl.startsWith("https://") &&
    !imageUrl.startsWith("http://")
  ) {
    return {
      ok: false,
      error: "URL ảnh phải là đường dẫn /... hoặc link http(s)://...",
    };
  }

  const slug = slugRaw || slugifyName(name);
  if (!slug) return { ok: false, error: "Slug không hợp lệ" };

  return {
    ok: true,
    data: {
      name,
      slug,
      description,
      address,
      imageUrl,
      tags: parseTags(body.tags),
    },
  };
}
