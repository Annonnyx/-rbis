-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('USER', 'ADMIN', 'MODERATOR', 'BANNED');

-- CreateEnum
CREATE TYPE "ThemeColor" AS ENUM ('CYAN', 'BLUE', 'GREEN', 'ORANGE', 'RED', 'PINK', 'PURPLE');

-- CreateEnum
CREATE TYPE "AccountType" AS ENUM ('PERSONAL', 'BUSINESS');

-- CreateEnum
CREATE TYPE "TransactionType" AS ENUM ('DEPOSIT', 'WITHDRAWAL', 'TRANSFER', 'PAYMENT', 'DIVIDEND');

-- CreateEnum
CREATE TYPE "SuggestionType" AS ENUM ('FEATURE', 'RULE', 'EVENT', 'ECONOMY');

-- CreateEnum
CREATE TYPE "SuggestionStatus" AS ENUM ('PENDING', 'UNDER_REVIEW', 'APPROVED', 'REJECTED', 'IMPLEMENTED');

-- CreateEnum
CREATE TYPE "TradeType" AS ENUM ('BUY', 'SELL');

-- CreateEnum
CREATE TYPE "MiniGameType" AS ENUM ('DELIVERY_WALKING', 'URBAN_TASKS', 'DELIVERY_BIKE', 'STREET_VENDOR', 'FREELANCE_DIGITAL', 'DRIVER_VTC');

-- CreateEnum
CREATE TYPE "ItemType" AS ENUM ('FOOD', 'DRINK', 'ENERGY_BOOST', 'STAMINA_POTION', 'SPECIAL');

-- CreateEnum
CREATE TYPE "LocationType" AS ENUM ('RESIDENTIAL', 'COMMERCIAL', 'INDUSTRIAL', 'FINANCIAL', 'PORT', 'AIRPORT', 'TOURIST', 'RURAL');

-- CreateEnum
CREATE TYPE "CryptoType" AS ENUM ('ORB', 'BITGOLD', 'ETHEREUM_PLUS', 'SPEEDCOIN', 'GREENTOKEN');

-- CreateEnum
CREATE TYPE "CryptoTransactionType" AS ENUM ('BUY', 'SELL', 'MINING_REWARD', 'STAKING_REWARD');

-- CreateEnum
CREATE TYPE "BusinessType" AS ENUM ('CLOTHING', 'ENERGY_DRINKS', 'ELECTRONICS', 'FOOD_BEVERAGE', 'COSMETICS', 'FURNITURE', 'SAAS', 'HARDWARE', 'GAME_DEV', 'CYBERSECURITY', 'AIRLINE', 'LOGISTICS', 'REAL_ESTATE', 'CASINO', 'HOTEL', 'INDUSTRIAL', 'PHARMA', 'GREEN_ENERGY', 'OIL_GAS', 'NUCLEAR', 'MEDIA', 'HEALTHCARE', 'EDUCATION', 'AGRICULTURE', 'DEFENSE');

-- CreateEnum
CREATE TYPE "BusinessSubType" AS ENUM ('FAST_FASHION', 'READY_TO_WEAR', 'LUXURY', 'SPORTSWEAR', 'ECO_FRIENDLY', 'ARTISANAL', 'INDUSTRIAL', 'PREMIUM_BIO', 'GAMING', 'RETAIL', 'REPAIR', 'MANUFACTURING', 'RESTAURANT', 'FAST_FOOD', 'CAFE', 'BAKERY');

-- CreateEnum
CREATE TYPE "PricePositioning" AS ENUM ('DISCOUNT', 'ACCESSIBLE', 'PREMIUM', 'LUXE');

-- CreateEnum
CREATE TYPE "EthicsPositioning" AS ENUM ('STANDARD', 'ECO_FRIENDLY', 'FAIR_TRADE', 'LOCAL');

-- CreateEnum
CREATE TYPE "InnovationPositioning" AS ENUM ('TRADITIONAL', 'HYBRID', 'INNOVATIVE');

-- CreateEnum
CREATE TYPE "LegalStructure" AS ENUM ('AUTO_ENTREPRENEUR', 'SARL', 'SAS', 'HOLDING', 'OFFSHORE');

-- CreateEnum
CREATE TYPE "TaxOptimizationLevel" AS ENUM ('STANDARD', 'SARL_OPTIMIZED', 'HOLDING_SARL', 'HOLDING_OFFSHORE');

-- CreateEnum
CREATE TYPE "OPAStatus" AS ENUM ('PENDING', 'ACTIVE', 'ACCEPTED', 'REJECTED', 'COMPLETED');

-- CreateEnum
CREATE TYPE "ForbesRankTier" AS ENUM ('OUTSIDE', 'BOTTOM_100', 'MID_50', 'TOP_25', 'TOP_10', 'NUMBER_1');

-- CreateEnum
CREATE TYPE "EventType" AS ENUM ('OPPORTUNITY', 'BREAKDOWN', 'BUZZ', 'CRISIS', 'SCANDAL');

-- CreateEnum
CREATE TYPE "AchievementCategory" AS ENUM ('FORTUNE', 'FORBES', 'BUSINESS', 'RETAIL', 'TECH', 'TRANSPORT', 'REAL_ESTATE', 'SPECIAL', 'FRANCHISE', 'STOCK', 'CRYPTO');

-- CreateEnum
CREATE TYPE "AchievementRewardType" AS ENUM ('BADGE', 'BONUS', 'TITLE', 'SKIN');

-- CreateEnum
CREATE TYPE "EmployeeRole" AS ENUM ('OPERATIONS', 'SALES', 'MARKETING', 'RESEARCH', 'MANAGEMENT', 'LOGISTICS', 'CUSTOMER_SERVICE');

-- CreateEnum
CREATE TYPE "SkillType" AS ENUM ('EFFICIENCY', 'CREATIVITY', 'NEGOTIATION', 'LEADERSHIP', 'TECHNICAL', 'MARKETING', 'LOGISTICS');

-- CreateEnum
CREATE TYPE "TutorialStep" AS ENUM ('WELCOME', 'MAP_DISCOVERY', 'FIRST_MINIGAME', 'ENERGY_SYSTEM', 'FIRST_BUSINESS', 'BUSINESS_TYPES', 'LOCATION_CHOICE', 'DA_POSITIONING', 'HIRING_EMPLOYEE', 'STOCK_MARKET', 'CRYPTO_UNLOCKED', 'HOLDING_UNLOCKED', 'VICTORY_CONDITIONS', 'COMPLETED');

-- CreateEnum
CREATE TYPE "TechCategory" AS ENUM ('PRODUCT', 'PROCESS', 'MARKETING', 'LOGISTICS', 'SUSTAINABILITY');

-- CreateEnum
CREATE TYPE "ContractStatus" AS ENUM ('NEGOTIATING', 'ACTIVE', 'EXPIRED', 'TERMINATED');

-- CreateEnum
CREATE TYPE "FranchiseStatus" AS ENUM ('DRAFT', 'ACTIVE', 'SUSPENDED', 'TERMINATED');

-- CreateEnum
CREATE TYPE "ProjectType" AS ENUM ('RESIDENTIAL', 'COMMERCIAL', 'OFFICE', 'INDUSTRIAL', 'MIXED_USE');

-- CreateEnum
CREATE TYPE "ConstructionStatus" AS ENUM ('PLANNING', 'PERMITTING', 'CONSTRUCTION', 'COMPLETED', 'SOLD_OUT');

-- CreateEnum
CREATE TYPE "VehicleType" AS ENUM ('AIRCRAFT_SMALL', 'AIRCRAFT_MEDIUM', 'AIRCRAFT_LARGE', 'CARGO_PLANE', 'VAN', 'TRUCK_SMALL', 'TRUCK_MEDIUM', 'TRUCK_LARGE', 'TRUCK_TANKER');

-- CreateEnum
CREATE TYPE "VehicleStatus" AS ENUM ('ACTIVE', 'MAINTENANCE', 'RETIRED', 'SOLD');

-- CreateTable
CREATE TABLE "accounts" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "provider_account_id" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,

    CONSTRAINT "accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sessions" (
    "id" TEXT NOT NULL,
    "session_token" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "email_verified" TIMESTAMP(3),
    "name" TEXT,
    "first_name" TEXT,
    "last_name" TEXT,
    "identifier" TEXT NOT NULL,
    "name_changed_at" TIMESTAMP(3),
    "image" TEXT,
    "role" "UserRole" NOT NULL DEFAULT 'USER',
    "theme_color" "ThemeColor" NOT NULL DEFAULT 'CYAN',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "verification_tokens" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL
);

-- CreateTable
CREATE TABLE "bank_accounts" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "type" "AccountType" NOT NULL,
    "name" TEXT NOT NULL,
    "balance" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "currency" TEXT NOT NULL DEFAULT 'Ø',
    "is_main" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "business_id" TEXT,

    CONSTRAINT "bank_accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "transactions" (
    "id" TEXT NOT NULL,
    "account_id" TEXT NOT NULL,
    "type" "TransactionType" NOT NULL,
    "amount" DECIMAL(15,2) NOT NULL,
    "description" TEXT,
    "related_account_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "transactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_locations" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "lat" DECIMAL(10,8) NOT NULL,
    "lng" DECIMAL(11,8) NOT NULL,
    "address" TEXT,
    "city_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_locations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cities" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "name_en" TEXT,
    "name_fr" TEXT,
    "name_de" TEXT,
    "name_es" TEXT,
    "lat" DECIMAL(10,8) NOT NULL,
    "lng" DECIMAL(11,8) NOT NULL,
    "is_unlocked" BOOLEAN NOT NULL DEFAULT false,
    "unlock_threshold" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "cities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "businesses" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "objective" TEXT,
    "product" TEXT,
    "service" TEXT,
    "city_id" TEXT,
    "capital" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "type" "BusinessType",
    "sub_type" "BusinessSubType",
    "location_id" TEXT,
    "price_positioning" "PricePositioning",
    "ethics_positioning" "EthicsPositioning",
    "innovation_positioning" "InnovationPositioning",
    "revenue_per_hour" DECIMAL(15,2) DEFAULT 0,
    "monthly_rent" DECIMAL(15,2) DEFAULT 0,
    "monthly_salaries" DECIMAL(15,2) DEFAULT 0,
    "operating_costs" DECIMAL(15,2) DEFAULT 0,
    "productivity" DECIMAL(3,2) DEFAULT 1.0,
    "customer_satisfaction" INTEGER DEFAULT 50,
    "reputation" INTEGER DEFAULT 0,
    "is_profitable" BOOLEAN DEFAULT false,

    CONSTRAINT "businesses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "suggestions" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "type" "SuggestionType" NOT NULL,
    "status" "SuggestionStatus" NOT NULL DEFAULT 'PENDING',
    "votes" INTEGER NOT NULL DEFAULT 0,
    "implemented_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "suggestions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "votes" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "suggestion_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "votes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "stocks" (
    "id" TEXT NOT NULL,
    "business_id" TEXT,
    "symbol" TEXT NOT NULL,
    "name" TEXT,
    "total_shares" INTEGER NOT NULL DEFAULT 1000,
    "available_shares" INTEGER NOT NULL DEFAULT 1000,
    "current_price" DECIMAL(15,2) NOT NULL DEFAULT 1.00,
    "is_real_stock" BOOLEAN NOT NULL DEFAULT false,
    "sector" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "stocks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "stock_trades" (
    "id" TEXT NOT NULL,
    "stock_id" TEXT NOT NULL,
    "buyer_id" TEXT NOT NULL,
    "seller_id" TEXT,
    "quantity" INTEGER NOT NULL,
    "price" DECIMAL(15,2) NOT NULL,
    "total" DECIMAL(15,2) NOT NULL,
    "type" "TradeType" NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "stock_trades_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "stock_history" (
    "id" TEXT NOT NULL,
    "stock_id" TEXT NOT NULL,
    "price" DECIMAL(15,2) NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "stock_history_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "products" (
    "id" TEXT NOT NULL,
    "business_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "price" DECIMAL(15,2) NOT NULL,
    "stock" INTEGER NOT NULL DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "products_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sales" (
    "id" TEXT NOT NULL,
    "product_id" TEXT NOT NULL,
    "business_id" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "unit_price" DECIMAL(15,2) NOT NULL,
    "total_amount" DECIMAL(15,2) NOT NULL,
    "buyer_name" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "sales_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "global_settings" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "description" TEXT,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "global_settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "player_stats" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "mini_games_earnings" INTEGER NOT NULL DEFAULT 0,
    "mini_games_cap_reached" BOOLEAN NOT NULL DEFAULT false,
    "energy_current" INTEGER NOT NULL DEFAULT 100,
    "energy_max" INTEGER NOT NULL DEFAULT 100,
    "last_energy_update" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "starting_capital" INTEGER NOT NULL DEFAULT 500,
    "has_used_mini_games" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "player_stats_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mini_game_sessions" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "player_stats_id" TEXT NOT NULL,
    "type" "MiniGameType" NOT NULL,
    "earnings" INTEGER NOT NULL,
    "energy_consumed" INTEGER NOT NULL,
    "duration" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "mini_game_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "inventory_items" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "type" "ItemType" NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "energy_restore" INTEGER,
    "energy_boost" INTEGER,
    "duration" INTEGER,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "expires_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "inventory_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "game_locations" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "lat" DOUBLE PRECISION NOT NULL,
    "lng" DOUBLE PRECISION NOT NULL,
    "type" "LocationType" NOT NULL,
    "district" TEXT,
    "rent_per_sqm" INTEGER NOT NULL DEFAULT 50,
    "foot_traffic" INTEGER NOT NULL DEFAULT 50,
    "visibility" INTEGER NOT NULL DEFAULT 50,
    "accessibility" INTEGER NOT NULL DEFAULT 50,
    "competition" INTEGER NOT NULL DEFAULT 0,
    "has_parking" BOOLEAN NOT NULL DEFAULT false,
    "has_fiber" BOOLEAN NOT NULL DEFAULT false,
    "has_loading_dock" BOOLEAN NOT NULL DEFAULT false,
    "has_storage" BOOLEAN NOT NULL DEFAULT false,
    "gentrification_level" INTEGER NOT NULL DEFAULT 0,
    "major_projects_nearby" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "game_locations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "crypto_wallets" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "orb_balance" DECIMAL(20,8) NOT NULL DEFAULT 0,
    "bitgold_balance" DECIMAL(20,8) NOT NULL DEFAULT 0,
    "ethereum_plus_balance" DECIMAL(20,8) NOT NULL DEFAULT 0,
    "speedcoin_balance" DECIMAL(20,8) NOT NULL DEFAULT 0,
    "greentoken_balance" DECIMAL(20,8) NOT NULL DEFAULT 0,
    "total_value" DECIMAL(20,2) NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "crypto_wallets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "crypto_transactions" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "crypto_wallet_id" TEXT NOT NULL,
    "type" "CryptoTransactionType" NOT NULL,
    "cryptoType" "CryptoType" NOT NULL,
    "amount" DECIMAL(20,8) NOT NULL,
    "price_per_unit" DECIMAL(20,8) NOT NULL,
    "total_value" DECIMAL(20,2) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "crypto_transactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "crypto_mining" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "crypto_wallet_id" TEXT NOT NULL,
    "hashrate" INTEGER NOT NULL DEFAULT 0,
    "powerConsumption" INTEGER NOT NULL DEFAULT 0,
    "mining_cost_per_hour" INTEGER NOT NULL DEFAULT 0,
    "last_mining_update" TIMESTAMP(3) NOT NULL,
    "total_mined" DECIMAL(20,8) NOT NULL DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "crypto_mining_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "holdings" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "legal_structure" "LegalStructure" NOT NULL,
    "tax_optimization_level" "TaxOptimizationLevel" NOT NULL,
    "capital" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "annual_cost" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "taxRate" DECIMAL(5,4) NOT NULL DEFAULT 0.25,
    "revenue_multiplier" DECIMAL(3,2) NOT NULL DEFAULT 1.0,
    "has_deductions" BOOLEAN NOT NULL DEFAULT false,
    "has_amortizations" BOOLEAN NOT NULL DEFAULT false,
    "has_provisions" BOOLEAN NOT NULL DEFAULT false,
    "has_tax_credits" BOOLEAN NOT NULL DEFAULT false,
    "has_offshore" BOOLEAN NOT NULL DEFAULT false,
    "has_transfer_pricing" BOOLEAN NOT NULL DEFAULT false,
    "audit_risk" INTEGER NOT NULL DEFAULT 0,
    "reputation_risk" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "holdings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "subsidiaries" (
    "id" TEXT NOT NULL,
    "holding_id" TEXT NOT NULL,
    "business_id" TEXT NOT NULL,
    "ownership_percent" DECIMAL(5,2) NOT NULL,
    "country" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "annual_contribution" DECIMAL(15,2) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "subsidiaries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "opa_offers" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "target_business_id" TEXT NOT NULL,
    "offer_price_per_share" DECIMAL(15,2) NOT NULL,
    "total_shares" INTEGER NOT NULL,
    "total_value" DECIMAL(15,2) NOT NULL,
    "premium_percent" DECIMAL(5,2) NOT NULL,
    "status" "OPAStatus" NOT NULL,
    "acceptance_rate" DECIMAL(5,2) NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "opa_offers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "forbes_rankings" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "current_rank" INTEGER NOT NULL DEFAULT 10000,
    "previous_rank" INTEGER DEFAULT 10000,
    "rank_tier" "ForbesRankTier" NOT NULL,
    "total_fortune" DECIMAL(20,2) NOT NULL DEFAULT 0,
    "cash" DECIMAL(20,2) NOT NULL DEFAULT 0,
    "stocks" DECIMAL(20,2) NOT NULL DEFAULT 0,
    "crypto" DECIMAL(20,2) NOT NULL DEFAULT 0,
    "business_value" DECIMAL(20,2) NOT NULL DEFAULT 0,
    "real_estate" DECIMAL(20,2) NOT NULL DEFAULT 0,
    "rank_change" INTEGER NOT NULL DEFAULT 0,
    "fortune_change" DECIMAL(20,2) NOT NULL DEFAULT 0,
    "last_updated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "forbes_rankings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "random_events" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "business_id" TEXT,
    "type" "EventType" NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "revenue_impact" DECIMAL(5,2),
    "reputation_impact" INTEGER,
    "cost_impact" DECIMAL(15,2),
    "duration_hours" INTEGER,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "player_choice" TEXT,
    "choice_result" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "resolved_at" TIMESTAMP(3),

    CONSTRAINT "random_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "victories" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "achieved_at" TIMESTAMP(3) NOT NULL,
    "final_fortune" DECIMAL(20,2) NOT NULL,
    "final_rank" INTEGER NOT NULL,
    "total_play_time" INTEGER NOT NULL,
    "businesses_owned" INTEGER NOT NULL DEFAULT 0,
    "total_transactions" INTEGER NOT NULL DEFAULT 0,
    "title" TEXT NOT NULL DEFAULT 'Magnat Suprême',
    "bonus_reward" DECIMAL(20,2) NOT NULL DEFAULT 1000000,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "victories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "achievements" (
    "id" TEXT NOT NULL,
    "number" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "category" "AchievementCategory" NOT NULL,
    "condition_type" TEXT NOT NULL,
    "condition_value" TEXT NOT NULL,
    "reward_type" "AchievementRewardType" NOT NULL,
    "reward_value" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "achievements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_achievements" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "achievement_id" TEXT NOT NULL,
    "unlocked_at" TIMESTAMP(3) NOT NULL,
    "progress" DOUBLE PRECISION NOT NULL DEFAULT 0,

    CONSTRAINT "user_achievements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "employees" (
    "id" TEXT NOT NULL,
    "business_id" TEXT NOT NULL,
    "first_name" TEXT NOT NULL,
    "last_name" TEXT NOT NULL,
    "full_name" TEXT NOT NULL,
    "role" "EmployeeRole" NOT NULL,
    "level" INTEGER NOT NULL DEFAULT 1,
    "experience" INTEGER NOT NULL DEFAULT 0,
    "skill_efficiency" INTEGER NOT NULL DEFAULT 10,
    "skill_creativity" INTEGER NOT NULL DEFAULT 10,
    "skill_negotiation" INTEGER NOT NULL DEFAULT 10,
    "skill_leadership" INTEGER NOT NULL DEFAULT 10,
    "skill_technical" INTEGER NOT NULL DEFAULT 10,
    "skill_marketing" INTEGER NOT NULL DEFAULT 10,
    "skill_logistics" INTEGER NOT NULL DEFAULT 10,
    "salary" DECIMAL(10,2) NOT NULL,
    "hired_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "performance" DECIMAL(3,2) NOT NULL DEFAULT 0.7,
    "satisfaction" DECIMAL(3,2) NOT NULL DEFAULT 0.8,
    "specializations" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "employees_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "employee_trainings" (
    "id" TEXT NOT NULL,
    "employee_id" TEXT NOT NULL,
    "skill_type" "SkillType" NOT NULL,
    "duration_hours" INTEGER NOT NULL,
    "cost" DECIMAL(10,2) NOT NULL,
    "xp_gain" INTEGER NOT NULL,
    "started_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completed_at" TIMESTAMP(3),

    CONSTRAINT "employee_trainings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tutorials" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "current_step" "TutorialStep" NOT NULL DEFAULT 'WELCOME',
    "completed_steps" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "totalSteps" INTEGER NOT NULL DEFAULT 14,
    "steps_completed" INTEGER NOT NULL DEFAULT 0,
    "skipped" BOOLEAN NOT NULL DEFAULT false,
    "skipped_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tutorials_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "technologies" (
    "id" TEXT NOT NULL,
    "business_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "category" "TechCategory" NOT NULL,
    "level" INTEGER NOT NULL DEFAULT 1,
    "max_level" INTEGER NOT NULL DEFAULT 5,
    "research_cost" DECIMAL(15,2) NOT NULL,
    "research_time" INTEGER NOT NULL,
    "effects" TEXT NOT NULL,
    "progress" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "started_at" TIMESTAMP(3),
    "completed_at" TIMESTAMP(3),
    "prerequisites" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "technologies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "patents" (
    "id" TEXT NOT NULL,
    "business_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "industry" TEXT NOT NULL,
    "licensing_revenue" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "market_value" DECIMAL(15,2) NOT NULL,
    "filed_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "patents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "b2b_clients" (
    "id" TEXT NOT NULL,
    "business_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "industry" TEXT NOT NULL,
    "contract_status" "ContractStatus" NOT NULL DEFAULT 'NEGOTIATING',
    "monthly_volume" INTEGER NOT NULL,
    "unit_price" DECIMAL(10,2) NOT NULL,
    "satisfaction" DECIMAL(3,2) NOT NULL DEFAULT 0.8,
    "loyalty_years" INTEGER NOT NULL DEFAULT 0,
    "total_revenue" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "b2b_clients_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "suppliers" (
    "id" TEXT NOT NULL,
    "business_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "material_type" TEXT NOT NULL,
    "base_price" DECIMAL(10,2) NOT NULL,
    "quality_rating" INTEGER NOT NULL DEFAULT 5,
    "reliability" DECIMAL(3,2) NOT NULL DEFAULT 0.9,
    "discount_rate" DECIMAL(5,2) NOT NULL DEFAULT 0,
    "min_order_quantity" INTEGER NOT NULL DEFAULT 100,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "suppliers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "franchises" (
    "id" TEXT NOT NULL,
    "franchisor_id" TEXT NOT NULL,
    "franchisee_id" TEXT,
    "brand_name" TEXT NOT NULL,
    "business_type" "BusinessType" NOT NULL,
    "entry_fee" DECIMAL(15,2) NOT NULL,
    "royalty_rate" DECIMAL(5,2) NOT NULL,
    "city" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "monthly_revenue" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "total_revenue" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "royalty_paid" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "status" "FranchiseStatus" NOT NULL DEFAULT 'DRAFT',
    "opened_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "franchises_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "construction_projects" (
    "id" TEXT NOT NULL,
    "business_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "project_type" "ProjectType" NOT NULL,
    "address" TEXT NOT NULL,
    "land_cost" DECIMAL(15,2) NOT NULL,
    "land_size" INTEGER NOT NULL,
    "buildable_area" INTEGER NOT NULL,
    "floors" INTEGER NOT NULL DEFAULT 1,
    "total_units" INTEGER NOT NULL,
    "construction_cost" DECIMAL(15,2) NOT NULL,
    "total_investment" DECIMAL(15,2) NOT NULL,
    "status" "ConstructionStatus" NOT NULL,
    "planned_start" TIMESTAMP(3),
    "actual_start" TIMESTAMP(3),
    "expected_completion" TIMESTAMP(3),
    "actual_completion" TIMESTAMP(3),
    "units_sold" INTEGER NOT NULL DEFAULT 0,
    "avg_sale_price" DECIMAL(15,2) NOT NULL,
    "total_sales" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "gentrification_multiplier" DECIMAL(3,2) NOT NULL DEFAULT 1.0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "construction_projects_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vehicles" (
    "id" TEXT NOT NULL,
    "business_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "vehicle_type" "VehicleType" NOT NULL,
    "capacity" INTEGER NOT NULL,
    "range" INTEGER NOT NULL,
    "fuel_consumption" DECIMAL(5,2) NOT NULL,
    "purchase_price" DECIMAL(15,2) NOT NULL,
    "purchase_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" "VehicleStatus" NOT NULL DEFAULT 'ACTIVE',
    "total_km" INTEGER NOT NULL DEFAULT 0,
    "hours_flown" INTEGER NOT NULL DEFAULT 0,
    "last_maintenance" TIMESTAMP(3),
    "next_maintenance" TIMESTAMP(3),
    "maintenance_cost" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "vehicles_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "accounts_provider_provider_account_id_key" ON "accounts"("provider", "provider_account_id");

-- CreateIndex
CREATE UNIQUE INDEX "sessions_session_token_key" ON "sessions"("session_token");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_identifier_key" ON "users"("identifier");

-- CreateIndex
CREATE UNIQUE INDEX "verification_tokens_token_key" ON "verification_tokens"("token");

-- CreateIndex
CREATE UNIQUE INDEX "verification_tokens_identifier_token_key" ON "verification_tokens"("identifier", "token");

-- CreateIndex
CREATE UNIQUE INDEX "user_locations_user_id_key" ON "user_locations"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "businesses_user_id_key" ON "businesses"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "votes_user_id_suggestion_id_key" ON "votes"("user_id", "suggestion_id");

-- CreateIndex
CREATE UNIQUE INDEX "stocks_business_id_key" ON "stocks"("business_id");

-- CreateIndex
CREATE UNIQUE INDEX "stocks_symbol_key" ON "stocks"("symbol");

-- CreateIndex
CREATE UNIQUE INDEX "global_settings_key_key" ON "global_settings"("key");

-- CreateIndex
CREATE UNIQUE INDEX "player_stats_user_id_key" ON "player_stats"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "crypto_wallets_user_id_key" ON "crypto_wallets"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "crypto_mining_user_id_key" ON "crypto_mining"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "crypto_mining_crypto_wallet_id_key" ON "crypto_mining"("crypto_wallet_id");

-- CreateIndex
CREATE UNIQUE INDEX "holdings_user_id_key" ON "holdings"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "forbes_rankings_user_id_key" ON "forbes_rankings"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "victories_user_id_key" ON "victories"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "achievements_number_key" ON "achievements"("number");

-- CreateIndex
CREATE UNIQUE INDEX "user_achievements_user_id_achievement_id_key" ON "user_achievements"("user_id", "achievement_id");

-- CreateIndex
CREATE UNIQUE INDEX "tutorials_user_id_key" ON "tutorials"("user_id");

-- AddForeignKey
ALTER TABLE "accounts" ADD CONSTRAINT "accounts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bank_accounts" ADD CONSTRAINT "bank_accounts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bank_accounts" ADD CONSTRAINT "bank_accounts_business_id_fkey" FOREIGN KEY ("business_id") REFERENCES "businesses"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_account_id_fkey" FOREIGN KEY ("account_id") REFERENCES "bank_accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_locations" ADD CONSTRAINT "user_locations_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_locations" ADD CONSTRAINT "user_locations_city_id_fkey" FOREIGN KEY ("city_id") REFERENCES "cities"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "businesses" ADD CONSTRAINT "businesses_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "businesses" ADD CONSTRAINT "businesses_city_id_fkey" FOREIGN KEY ("city_id") REFERENCES "cities"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "businesses" ADD CONSTRAINT "businesses_location_id_fkey" FOREIGN KEY ("location_id") REFERENCES "game_locations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "suggestions" ADD CONSTRAINT "suggestions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "votes" ADD CONSTRAINT "votes_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "votes" ADD CONSTRAINT "votes_suggestion_id_fkey" FOREIGN KEY ("suggestion_id") REFERENCES "suggestions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stocks" ADD CONSTRAINT "stocks_business_id_fkey" FOREIGN KEY ("business_id") REFERENCES "businesses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stock_trades" ADD CONSTRAINT "stock_trades_stock_id_fkey" FOREIGN KEY ("stock_id") REFERENCES "stocks"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stock_trades" ADD CONSTRAINT "stock_trades_buyer_id_fkey" FOREIGN KEY ("buyer_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stock_history" ADD CONSTRAINT "stock_history_stock_id_fkey" FOREIGN KEY ("stock_id") REFERENCES "stocks"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "products" ADD CONSTRAINT "products_business_id_fkey" FOREIGN KEY ("business_id") REFERENCES "businesses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sales" ADD CONSTRAINT "sales_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sales" ADD CONSTRAINT "sales_business_id_fkey" FOREIGN KEY ("business_id") REFERENCES "businesses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "player_stats" ADD CONSTRAINT "player_stats_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mini_game_sessions" ADD CONSTRAINT "mini_game_sessions_player_stats_id_fkey" FOREIGN KEY ("player_stats_id") REFERENCES "player_stats"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inventory_items" ADD CONSTRAINT "inventory_items_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "crypto_wallets" ADD CONSTRAINT "crypto_wallets_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "crypto_transactions" ADD CONSTRAINT "crypto_transactions_crypto_wallet_id_fkey" FOREIGN KEY ("crypto_wallet_id") REFERENCES "crypto_wallets"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "crypto_mining" ADD CONSTRAINT "crypto_mining_crypto_wallet_id_fkey" FOREIGN KEY ("crypto_wallet_id") REFERENCES "crypto_wallets"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "holdings" ADD CONSTRAINT "holdings_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subsidiaries" ADD CONSTRAINT "subsidiaries_holding_id_fkey" FOREIGN KEY ("holding_id") REFERENCES "holdings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subsidiaries" ADD CONSTRAINT "subsidiaries_business_id_fkey" FOREIGN KEY ("business_id") REFERENCES "businesses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "opa_offers" ADD CONSTRAINT "opa_offers_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "opa_offers" ADD CONSTRAINT "opa_offers_target_business_id_fkey" FOREIGN KEY ("target_business_id") REFERENCES "businesses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "forbes_rankings" ADD CONSTRAINT "forbes_rankings_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "random_events" ADD CONSTRAINT "random_events_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "random_events" ADD CONSTRAINT "random_events_business_id_fkey" FOREIGN KEY ("business_id") REFERENCES "businesses"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "victories" ADD CONSTRAINT "victories_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_achievements" ADD CONSTRAINT "user_achievements_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_achievements" ADD CONSTRAINT "user_achievements_achievement_id_fkey" FOREIGN KEY ("achievement_id") REFERENCES "achievements"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "employees" ADD CONSTRAINT "employees_business_id_fkey" FOREIGN KEY ("business_id") REFERENCES "businesses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "employee_trainings" ADD CONSTRAINT "employee_trainings_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "employees"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tutorials" ADD CONSTRAINT "tutorials_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "technologies" ADD CONSTRAINT "technologies_business_id_fkey" FOREIGN KEY ("business_id") REFERENCES "businesses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "patents" ADD CONSTRAINT "patents_business_id_fkey" FOREIGN KEY ("business_id") REFERENCES "businesses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "b2b_clients" ADD CONSTRAINT "b2b_clients_business_id_fkey" FOREIGN KEY ("business_id") REFERENCES "businesses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "suppliers" ADD CONSTRAINT "suppliers_business_id_fkey" FOREIGN KEY ("business_id") REFERENCES "businesses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "construction_projects" ADD CONSTRAINT "construction_projects_business_id_fkey" FOREIGN KEY ("business_id") REFERENCES "businesses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vehicles" ADD CONSTRAINT "vehicles_business_id_fkey" FOREIGN KEY ("business_id") REFERENCES "businesses"("id") ON DELETE CASCADE ON UPDATE CASCADE;
