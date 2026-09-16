import { hash } from "bcryptjs";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const OBSOLETE_SLUGS = ["pho-bo-trung-kinh", "com-van-phong-mat-bung"];

async function seedAdmin() {
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD;
  if (!email || !password) {
    console.warn(
      "Skip admin seed: set ADMIN_EMAIL and ADMIN_PASSWORD to create an admin user.",
    );
    return;
  }

  const passwordHash = await hash(password, 12);
  await prisma.adminUser.upsert({
    where: { email },
    update: { passwordHash },
    create: { email, passwordHash },
  });
  console.log(`Admin ready: ${email}`);
}

async function seedRestaurants() {
  const restaurants = [
    {
      name: "Bún bò Huế",
      slug: "bun-bo-hue",
      description:
        "Bún bò Huế cho bữa trưa gần 219 Trung Kính — nước dùng đậm, sả ớt thơm, phù hợp ngày mưa hoặc se lạnh.",
      address: "Gần 219 Trung Kính, Cầu Giấy, Hà Nội",
      imageUrl: "/restaurants/img-8824.jpg",
      tags: ["bun", "nong", "trua"],
      priceMin: 40000,
      priceMax: 60000,
    },
    {
      name: "Bún cá cay Hải Phòng",
      slug: "bun-ca-cay-hai-phong",
      description:
        "Bún cá cay Hải Phòng quanh Trung Kính — nước cay ấm, cá dai, hợp trưa muốn món nóng đậm vị.",
      address: "Gần 219 Trung Kính, Cầu Giấy, Hà Nội",
      imageUrl: "/restaurants/img-8825.jpg",
      tags: ["bun", "nong", "cay", "trua"],
      priceMin: 40000,
      priceMax: 60000,
    },
    {
      name: "Bếp 3 Miền",
      slug: "bep-3-mien",
      description:
        "Quán ăn đa dạng món 3 miền gần 219 Trung Kính — cơm văn phòng, món trưa nhanh gọn.",
      address: "Gần 219 Trung Kính, Cầu Giấy, Hà Nội",
      imageUrl: "/restaurants/placeholder.jpg",
      tags: ["com", "trua", "nong"],
      priceMin: 40000,
      priceMax: 70000,
    },
    {
      name: "Bún Cá Rô Bà Kỵ",
      slug: "bun-ca-ro-ba-ky",
      description:
        "Bún cá rô đặc sản Hà Nội gần Trung Kính — nước dùng ngọt thanh, cá rô tươi, món nóng hợp mưa.",
      address: "Gần 219 Trung Kính, Cầu Giấy, Hà Nội",
      imageUrl: "/restaurants/placeholder.jpg",
      tags: ["bun", "nong", "trua"],
      priceMin: 40000,
      priceMax: 80000,
    },
    {
      name: "Phở Vịt Quay",
      slug: "pho-vit-quay",
      description:
        "Phở vịt quay Lạng Sơn gần 219 Trung Kính — nước phở đậm đà, vịt quay giòn, món nóng hợp mưa lạnh.",
      address: "Gần 219 Trung Kính, Cầu Giấy, Hà Nội",
      imageUrl: "/restaurants/placeholder.jpg",
      tags: ["pho", "nong", "trua"],
      priceMin: 30000,
      priceMax: 60000,
    },
    {
      name: "Cuốn Ngon",
      slug: "cuon-ngon",
      description:
        "Cuốn tươi mát gần Trung Kính — gỏi cuốn, nem cuốn, quán mát điều hòa, hợp trưa nóng.",
      address: "Gần 219 Trung Kính, Cầu Giấy, Hà Nội",
      imageUrl: "/restaurants/placeholder.jpg",
      tags: ["cuon", "mat", "dieuhoa", "trongnha", "nhe", "trua"],
      priceMin: 50000,
      priceMax: 90000,
    },
    {
      name: "Nhà Hàng Tràng An",
      slug: "nha-hang-trang-an",
      description:
        "Nhà hàng Tràng An gần 219 Trung Kính — món Bắc đa dạng, điều hòa mát mẻ, phù hợp trưa công sở.",
      address: "Gần 219 Trung Kính, Cầu Giấy, Hà Nội",
      imageUrl: "/restaurants/placeholder.jpg",
      tags: ["com", "dieuhoa", "trongnha", "trua"],
      priceMin: 40000,
      priceMax: 80000,
    },
  ];

  await prisma.restaurant.deleteMany({
    where: { slug: { in: OBSOLETE_SLUGS } },
  });

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

async function main() {
  await seedAdmin();
  await seedRestaurants();
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
