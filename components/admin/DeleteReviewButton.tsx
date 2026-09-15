"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function DeleteReviewButton({ id }: { id: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function onDelete() {
    if (!window.confirm("Xóa review này?")) return;
    setLoading(true);
    const res = await fetch(`/api/admin/reviews/${id}`, { method: "DELETE" });
    setLoading(false);
    if (!res.ok) {
      window.alert("Xóa thất bại");
      return;
    }
    router.refresh();
  }

  return (
    <button
      type="button"
      className="admin-link-danger"
      onClick={onDelete}
      disabled={loading}
    >
      {loading ? "..." : "Xóa"}
    </button>
  );
}
