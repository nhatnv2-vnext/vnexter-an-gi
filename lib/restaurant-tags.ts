/**
 * Canonical restaurant tags catalog
 * Used by admin form and validation
 */
export type RestaurantTag = {
  id: string;
  label: string;
};

export const RESTAURANT_TAGS: RestaurantTag[] = [
  { id: "pho", label: "Phở" },
  { id: "bun", label: "Bún" },
  { id: "com", label: "Cơm" },
  { id: "nong", label: "Nóng" },
  { id: "mat", label: "Mát" },
  { id: "cuon", label: "Cuốn" },
  { id: "do-uong", label: "Đồ uống" },
  { id: "nhe", label: "Nhẹ" },
  { id: "cay", label: "Cay" },
  { id: "trua", label: "Trưa" },
  { id: "chay", label: "Chay" },
];

/**
 * Get all tag IDs as an array
 */
export function getStandardTagIds(): string[] {
  return RESTAURANT_TAGS.map((t) => t.id);
}

/**
 * Get label for a tag ID
 */
export function getTagLabel(id: string): string {
  const tag = RESTAURANT_TAGS.find((t) => t.id === id);
  return tag?.label ?? id;
}
