import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { DeleteReviewButton } from "@/components/admin/DeleteReviewButton";

export const dynamic = "force-dynamic";

export default async function AdminReviewsPage() {
  const reviews = await prisma.review.findMany({
    orderBy: { createdAt: "desc" },
    include: { restaurant: { select: { name: true } } },
  });

  return (
    <div className="admin-page">
      <div className="admin-page-head">
        <div>
          <h1>Reviews</h1>
          <p>
            <Link href="/admin">← Quán ăn</Link> · {reviews.length} đánh giá
          </p>
        </div>
      </div>

      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Quán</th>
              <th>Sao</th>
              <th>Nội dung</th>
              <th>Ngày</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {reviews.map((review) => (
              <tr key={review.id}>
                <td>{review.restaurant.name}</td>
                <td>{review.rating}★</td>
                <td>
                  <div>{review.authorName || "Ẩn danh"}</div>
                  <div className="admin-muted">{review.comment || "—"}</div>
                </td>
                <td>{review.createdAt.toLocaleString("vi-VN")}</td>
                <td>
                  <DeleteReviewButton id={review.id} />
                </td>
              </tr>
            ))}
            {reviews.length === 0 && (
              <tr>
                <td colSpan={5}>Chưa có review.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
