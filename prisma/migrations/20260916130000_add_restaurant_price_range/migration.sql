-- AlterTable
-- Add price range fields (VND integers, e.g. 30000 = 30k VND, 50000 = 50k VND)
ALTER TABLE "Restaurant" ADD COLUMN "priceMin" INTEGER,
ADD COLUMN "priceMax" INTEGER;
