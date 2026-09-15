import Link from "next/link";
import { RestaurantForm } from "@/components/admin/RestaurantForm";

export default function NewRestaurantPage() {
  return (
    <div className="admin-page">
      <div className="admin-page-head">
        <div>
          <h1>Thêm quán</h1>
          <p>
            <Link href="/admin">← Quay lại danh sách</Link>
          </p>
        </div>
      </div>
      <RestaurantForm mode="create" />
    </div>
  );
}
