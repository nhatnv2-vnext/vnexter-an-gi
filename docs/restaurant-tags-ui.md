# Restaurant Tags UI Implementation

## Overview

The admin restaurant form uses a multi-select pulldown (dropdown) for choosing tags instead of a free-text comma-separated input. Users can select multiple tags by holding Ctrl (Windows) or Cmd (Mac).

## Standard Tags Catalog

Location: `lib/restaurant-tags.ts`

Based on research team input, the catalog includes:

### Primary Research Tags
- **pho** → "Phở" - Pho noodle soup
- **nong** → "Món nóng" - Hot dishes
- **bun** → "Bún" - Rice vermicelli dishes
- **com** → "Cơm" - Rice dishes
- **cuon** → "Cuốn" - Rolled/wrapped dishes
- **mat** → "Mát / món mát" - Cool/refreshing dishes
- **nhe** → "Nhẹ bụng" - Light meals
- **dieuhoa** → "Có điều hòa" - Air-conditioned venue
- **trongnha** → "Trong nhà" - Indoor seating

### Weather System Tags
- **trua** → "Ăn trưa" - Lunch time
- **cay** → "Cay" - Spicy
- **do-uong** → "Đồ uống" - Beverages

**Note**: Slug values (pho, bun, dieuhoa, etc.) are stored in the database. Vietnamese labels with diacritics are display-only for admin UX.

```typescript
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
  { id: "trongnha", label: "Ngồi trong nhà" },
  
  // Weather system / existing data tags
  { id: "trua", label: "Trưa" },
  { id: "cay", label: "Cay" },
  { id: "do-uong", label: "Đồ uống" },
];
```

## UI Layout

### Multi-Select Pulldown

- Native HTML `<select multiple>` element
- 8 visible rows (size="8")
- Vietnamese labels with full diacritics for readability
- Users hold Ctrl/Cmd to select multiple options
- Selected options are highlighted

### Custom Tags Preservation

If an existing restaurant has tags not in the standard catalog, they are:
- Displayed as a muted note below the select
- Preserved when saving
- Not lost during edit operations

## Form Behavior

### Create Mode
- Multi-select starts empty
- User selects tags by clicking while holding Ctrl (Windows) or Cmd (Mac)
- Submits as array of slug values (e.g., `["pho", "bun", "dieuhoa"]`)

### Edit Mode
- Multi-select pre-selects restaurant's existing standard tags
- Standard tags: shown in the dropdown (can be selected/deselected)
- Custom tags: shown in a note below (preserved automatically)
- Both standard and custom tags submitted together

## Backend Compatibility

The API endpoint continues to accept both formats:

```typescript
// Array format (new form sends this)
tags: ["bun", "nong", "trua"]

// String format (still supported for backward compatibility)
tags: "bun, nong, trua"
```

The `parseTags()` function in `lib/restaurant-admin.ts` handles both formats.

## Styling

CSS classes in `app/globals.css`:

- `.admin-tags-select` - Multi-select dropdown styling
- `.admin-tags-select option` - Individual option padding
- `.admin-tags-select option:checked` - Selected option highlight
- `.admin-custom-tags-note` - Custom tags display note

## Weather Integration

The tags integrate with the weather-based lunch suggestion system (`lib/weather.ts`):

- **Rain/Cold days**: Prefers `nong` (hot), `bun` tags
- **Hot days**: Prefers `dieuhoa` (air-conditioned), `trongnha` (indoor), `mat` (cool) tags
- **Mild days**: Prefers `trua` (lunch) tag

This allows the system to recommend restaurants with appropriate comfort features based on weather conditions.

## Benefits

1. **Better UX**: Multi-select pulldown instead of typing
2. **Readable Labels**: Vietnamese with full diacritics for admin clarity
3. **Validation**: Only standard tags can be selected
4. **Consistency**: Same tags across all restaurants
5. **Discoverability**: Users see all available tags
6. **Preservation**: Custom tags not lost during edits
7. **Backward Compatible**: API still accepts both formats
8. **Weather-Aware**: New venue comfort tags (dieuhoa, trongnha) integrate with hot weather suggestions
9. **Native Control**: Standard HTML element, no third-party dependencies
