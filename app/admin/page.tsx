import Image from "next/image";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { DeleteRestaurantButton } from "@/components/admin/DeleteRestaurantButton";

export const dynamic = "force-dynamic";

export default async function AdminRestaurantsPage() {
  const restaurants = await prisma.restaurant.findMany({
    orderBy: { createdAt: "asc" },
    include: { _count: { select: { reviews: true } } },
  });

  return (
    <div className="admin-page">
      <div className="admin-page-head">
        <div>
          <h1>Quán ăn</h1>
          <p>{restaurants.length} quán trong danh sách quay số / gợi ý.</p>
        </div>
        <Link className="admin-btn primary" href="/admin/restaurants/new">
          Thêm quán
        </Link>
      </div>

      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Ảnh</th>
              <th>Tên</th>
              <th>Tags</th>
              <th>Reviews</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {restaurants.map((r) => (
              <tr key={r.id}>
                <td>
                  <div className="admin-thumb">
                    <Image
                      src={r.imageUrl}
                      alt=""
                      width={56}
                      height={56}
                      unoptimized={r.imageUrl.startsWith("http")}
                    />
                  </div>
                </td>
                <td>
                  <strong>{r.name}</strong>
                  <div className="admin-muted">{r.slug}</div>
                </td>
                <td>{r.tags.join(", ") || "—"}</td>
                <td>{r._count.reviews}</td>
                <td className="admin-row-actions">
                  <Link href={`/admin/restaurants/${r.slug}`}>Sửa</Link>
                  <DeleteRestaurantButton id={r.slug} name={r.name} />
                </td>
              </tr>
            ))}
            {restaurants.length === 0 && (
              <tr>
                <td colSpan={5}>Chưa có quán. Hãy thêm quán đầu tiên.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
