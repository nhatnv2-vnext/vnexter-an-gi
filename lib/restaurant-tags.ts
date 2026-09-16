/**
 * Canonical restaurant tags catalog
 * Used by admin form and validation
 * 
 * Primary tags based on research team input:
 * nong, pho, bun, com, cuon, mat, nhe, dieuhoa, trongnha
 * 
 * Additional tags from weather system / existing data:
 * trua, cay, do-uong
 */
export type RestaurantTag = {
  id: string;
  label: string;
};

export const RESTAURANT_TAGS: RestaurantTag[] = [
  // Primary research tags
  { id: "nong", label: "Nóng" },
  { id: "pho", label: "Phở" },
  { id: "bun", label: "Bún" },
  { id: "com", label: "Cơm" },
  { id: "cuon", label: "Cuốn" },
  { id: "mat", label: "Mát" },
  { id: "nhe", label: "Nhẹ" },
  { id: "dieuhoa", label: "Có điều hòa" },
  { id: "trongnha", label: "Trong nhà" },
  
  // Weather system / existing data tags
  { id: "trua", label: "Bữa trưa" },
  { id: "cay", label: "Cay" },
  { id: "do-uong", label: "Đồ uống" },
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
