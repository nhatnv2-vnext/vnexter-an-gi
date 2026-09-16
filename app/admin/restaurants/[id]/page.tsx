import Link from "next/link";
import { notFound } from "next/navigation";
import { RestaurantForm } from "@/components/admin/RestaurantForm";
import { prisma } from "@/lib/prisma";

type Props = { params: Promise<{ id: string }> };

export const dynamic = "force-dynamic";

export default async function EditRestaurantPage({ params }: Props) {
  const { id } = await params;
  const restaurant = await prisma.restaurant.findUnique({ where: { id } });
  if (!restaurant) notFound();

  return (
    <div className="admin-page">
      <div className="admin-page-head">
        <div>
          <h1>Sửa quán</h1>
          <p>
            <Link href="/admin">← Quay lại danh sách</Link>
          </p>
        </div>
      </div>
      <RestaurantForm
        mode="edit"
        restaurantId={restaurant.id}
        initial={{
          name: restaurant.name,
          slug: restaurant.slug,
          description: restaurant.description,
          address: restaurant.address,
          imageUrl: restaurant.imageUrl,
          tags: restaurant.tags,
          openTime: restaurant.openTime,
          closeTime: restaurant.closeTime,
        }}
      />
    </div>
  );
}
