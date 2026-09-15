"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function DeleteRestaurantButton({
  id,
  name,
}: {
  id: string;
  name: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function onDelete() {
    if (!window.confirm(`Xóa quán “${name}”? Reviews của quán cũng sẽ mất.`)) {
      return;
    }
    setLoading(true);
    const res = await fetch(`/api/admin/restaurants/${id}`, { method: "DELETE" });
    setLoading(false);
    if (!res.ok) {
      const body = (await res.json().catch(() => null)) as { error?: string } | null;
      window.alert(body?.error || "Xóa thất bại");
      return;
    }
    router.refresh();
  }

  return (
    <button type="button" className="admin-link-danger" onClick={onDelete} disabled={loading}>
      {loading ? "Đang xóa..." : "Xóa"}
    </button>
  );
}
