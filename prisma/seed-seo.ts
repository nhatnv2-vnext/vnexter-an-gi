/**
 * One-off / repeatable: fill SEO meta from existing restaurant data.
 * Only updates rows where meta fields are still empty (unless --force).
 *
 *   npx tsx prisma/seed-seo.ts
 *   npx tsx prisma/seed-seo.ts --force
 */
import { PrismaClient } from "@prisma/client";
import { buildRestaurantSeo } from "../lib/restaurant-seo";

const prisma = new PrismaClient();
const force = process.argv.includes("--force");

async function main() {
  const restaurants = await prisma.restaurant.findMany({
    orderBy: { createdAt: "asc" },
  });

  let updated = 0;
  let skipped = 0;

  for (const restaurant of restaurants) {
    const hasSeo =
      Boolean(restaurant.metaTitle?.trim()) ||
      Boolean(restaurant.metaDescription?.trim()) ||
      Boolean(restaurant.metaImageUrl?.trim());

    if (hasSeo && !force) {
      skipped += 1;
      console.log(`skip  ${restaurant.name}`);
      continue;
    }

    const seo = buildRestaurantSeo(restaurant);
    await prisma.restaurant.update({
      where: { id: restaurant.id },
      data: seo,
    });
    updated += 1;
    console.log(`seed  ${restaurant.name}`);
    console.log(`      title: ${seo.metaTitle}`);
    console.log(`      desc:  ${seo.metaDescription.slice(0, 90)}...`);
  }

  console.log(`\nDone. updated=${updated} skipped=${skipped}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
