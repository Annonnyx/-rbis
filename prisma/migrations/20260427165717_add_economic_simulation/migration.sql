-- CreateEnum
CREATE TYPE "PriceIndicator" AS ENUM ('TOO_CHEAP', 'GOOD', 'TOO_EXPENSIVE');

-- AlterTable
ALTER TABLE "businesses" ADD COLUMN     "accumulated_revenue" DECIMAL(15,2) DEFAULT 0,
ADD COLUMN     "current_stock" INTEGER DEFAULT 0,
ADD COLUMN     "demand_score" INTEGER DEFAULT 50,
ADD COLUMN     "last_revenue_calc" TIMESTAMP(3),
ADD COLUMN     "optimal_price_max" DECIMAL(15,2),
ADD COLUMN     "optimal_price_min" DECIMAL(15,2),
ADD COLUMN     "price_indicator" "PriceIndicator",
ADD COLUMN     "product_price" DECIMAL(15,2) DEFAULT 0,
ADD COLUMN     "production_cost" DECIMAL(15,2) DEFAULT 0,
ADD COLUMN     "total_produced" INTEGER DEFAULT 0,
ADD COLUMN     "total_sold" INTEGER DEFAULT 0;
