import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const restaurants = [
    {
      name: "Phở bò Trung Kính",
      slug: "pho-bo-trung-kinh",
      description:
        "Quán phở bò quen thuộc cho bữa trưa gần 219 Trung Kính — nước trong, tái chín đủ vị, hợp ngày mưa hoặc se lạnh.",
      address: "Gần 219 Trung Kính, Cầu Giấy, Hà Nội",
      imageUrl: "/restaurants/img-8824.jpg",
      tags: ["pho", "nong", "trua"],
    },
    {
      name: "Cơm văn phòng mát bụng",
      slug: "com-van-phong-mat-bung",
      description:
        "Suất cơm trưa nhẹ bụng quanh Trung Kính — hợp ngày nắng nóng, ăn xong vẫn tỉnh táo làm việc tiếp.",
      address: "Gần 219 Trung Kính, Cầu Giấy, Hà Nội",
      imageUrl: "/restaurants/img-8825.jpg",
      tags: ["mat", "trua", "com"],
    },
  ];

  await Promise.all(
    restaurants.map((restaurant) =>
      prisma.restaurant.upsert({
        where: { slug: restaurant.slug },
        update: restaurant,
        create: restaurant,
      }),
    ),
  );
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
