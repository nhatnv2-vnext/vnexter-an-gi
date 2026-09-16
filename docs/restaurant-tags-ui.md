# Restaurant Tags UI Implementation

## Overview

The admin restaurant form now uses a multi-select checkbox interface for choosing tags instead of a free-text comma-separated input.

## Standard Tags Catalog

Location: `lib/restaurant-tags.ts`

```typescript
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
```

## UI Layout

### Checkbox Grid

- Responsive grid layout: `repeat(auto-fill, minmax(7rem, 1fr))`
- Each checkbox shows Vietnamese label
- Hover effect for better UX
- Selected tags are checked

### Custom Tags Preservation

If an existing restaurant has tags not in the standard catalog, they are:
- Displayed as read-only chips below the checkbox grid
- Preserved when saving
- Not lost during edit operations

## Form Behavior

### Create Mode
- All checkboxes start unchecked
- User selects tags from the standard catalog
- Submits as array of tag IDs

### Edit Mode
- Checkboxes pre-checked based on restaurant's existing tags
- Standard tags: shown as checkboxes (can be toggled)
- Custom tags: shown as chips (preserved automatically)
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

- `.admin-tags-fieldset` - Container fieldset
- `.admin-tags-grid` - Responsive checkbox grid
- `.admin-tag-checkbox` - Individual checkbox label
- `.admin-custom-tags` - Custom tags section
- `.admin-tags-chips` - Chips container
- `.admin-tag-chip` - Individual custom tag chip

## Benefits

1. **Better UX**: Visual selection instead of typing
2. **Validation**: Only standard tags can be selected
3. **Consistency**: Same tags across all restaurants
4. **Discoverability**: Users see all available tags
5. **Preservation**: Custom tags not lost during edits
6. **Backward Compatible**: API still accepts both formats
