# Price Range Seed Data

After merging, update the 5 existing restaurants with these price ranges via the admin panel at `/admin`:

## Recommended Price Data (per-serving lunch, VND)

| Restaurant | priceMin | priceMax | Display |
|------------|----------|----------|---------|
| **Bếp 3 Miền** | 40000 | 70000 | 40k–70k |
| **Bún Cá Rô Bà Kỵ** | 40000 | 80000 | 40k–80k |
| **Phở Vịt Quay** | 30000 | 60000 | 30k–60k |
| **Cuốn Ngon** | 50000 | 90000 | 50k–90k |
| **Nhà Hàng Tràng An** | 40000 | 80000 | 40k–80k |

## How to Update

1. Go to `/admin/login`
2. For each restaurant, click "Sửa"
3. Enter the values in the "Giá từ" and "Giá đến" fields
4. Save

The prices will display as badges on restaurant cards (e.g., "40k–80k").

## Technical Notes

- Stored as integers in VND (e.g., 40000 = 40k VND)
- Display format: `${min/1000}k–${max/1000}k`
- Fields are optional - restaurants without price data will not show a badge
- Budget filter includes restaurants without price data (assumed affordable)
