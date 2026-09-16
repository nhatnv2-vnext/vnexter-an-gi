-- AlterTable
-- Add price range fields (VND integers, e.g. 40000 = 40k VND, 80000 = 80k VND)
ALTER TABLE "Restaurant" ADD COLUMN "priceMin" INTEGER,
ADD COLUMN "priceMax" INTEGER;
