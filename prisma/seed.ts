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
    },
    {
      name: "Bún cá cay Hải Phòng",
      slug: "bun-ca-cay-hai-phong",
      description:
        "Bún cá cay Hải Phòng quanh Trung Kính — nước cay ấm, cá dai, hợp trưa muốn món nóng đậm vị.",
      address: "Gần 219 Trung Kính, Cầu Giấy, Hà Nội",
      imageUrl: "/restaurants/img-8825.jpg",
      tags: ["bun", "nong", "cay", "trua"],
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
