import { NextResponse } from "next/server";
import pg from "pg";

const createTablesSql = `
-- Enums
DO $$ BEGIN
  CREATE TYPE "Role" AS ENUM ('MEMBER', 'ADMIN');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE "SubscriptionStatus" AS ENUM ('ACTIVE', 'PAST_DUE', 'CANCELED', 'INACTIVE', 'TRIALING');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE "QuestionStatus" AS ENUM ('PENDING', 'SYNCED', 'ANSWERED');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE "BudgetType" AS ENUM ('INCOME', 'EXPENSE', 'SAVING');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE "AssetCategory" AS ENUM ('CASH', 'STOCK', 'BOND', 'REAL_ESTATE', 'CRYPTO', 'PENSION', 'OTHER');
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Tables
CREATE TABLE IF NOT EXISTS "User" (
  "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text,
  "email" TEXT NOT NULL,
  "hashedPassword" TEXT NOT NULL,
  "name" TEXT,
  "role" "Role" NOT NULL DEFAULT 'MEMBER',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "User_email_key" ON "User"("email");

CREATE TABLE IF NOT EXISTS "Subscription" (
  "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text,
  "userId" TEXT NOT NULL,
  "stripeCustomerId" TEXT NOT NULL,
  "stripeSubscriptionId" TEXT,
  "stripePriceId" TEXT,
  "status" "SubscriptionStatus" NOT NULL DEFAULT 'INACTIVE',
  "currentPeriodStart" TIMESTAMP(3),
  "currentPeriodEnd" TIMESTAMP(3),
  "cancelAtPeriodEnd" BOOLEAN NOT NULL DEFAULT false,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Subscription_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "Subscription_userId_key" ON "Subscription"("userId");
CREATE UNIQUE INDEX IF NOT EXISTS "Subscription_stripeCustomerId_key" ON "Subscription"("stripeCustomerId");
CREATE UNIQUE INDEX IF NOT EXISTS "Subscription_stripeSubscriptionId_key" ON "Subscription"("stripeSubscriptionId");

CREATE TABLE IF NOT EXISTS "VideoCourse" (
  "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text,
  "slug" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "description" TEXT,
  "thumbnailUrl" TEXT,
  "sortOrder" INTEGER NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "VideoCourse_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "VideoCourse_slug_key" ON "VideoCourse"("slug");

CREATE TABLE IF NOT EXISTS "Episode" (
  "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text,
  "courseId" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "description" TEXT,
  "videoUrl" TEXT NOT NULL,
  "thumbnailUrl" TEXT,
  "duration" INTEGER,
  "sortOrder" INTEGER NOT NULL DEFAULT 0,
  "isFree" BOOLEAN NOT NULL DEFAULT false,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Episode_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "LiveStream" (
  "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text,
  "title" TEXT NOT NULL,
  "description" TEXT,
  "embedUrl" TEXT,
  "scheduledAt" TIMESTAMP(3) NOT NULL,
  "isLive" BOOLEAN NOT NULL DEFAULT false,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "LiveStream_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "Question" (
  "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text,
  "userId" TEXT NOT NULL,
  "content" TEXT NOT NULL,
  "status" "QuestionStatus" NOT NULL DEFAULT 'PENDING',
  "answerVideoUrl" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Question_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "BudgetEntry" (
  "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text,
  "userId" TEXT NOT NULL,
  "year" INTEGER NOT NULL,
  "month" INTEGER NOT NULL,
  "category" TEXT NOT NULL,
  "amount" INTEGER NOT NULL,
  "type" "BudgetType" NOT NULL,
  "memo" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "BudgetEntry_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "BudgetEntry_userId_year_month_idx" ON "BudgetEntry"("userId", "year", "month");

CREATE TABLE IF NOT EXISTS "Asset" (
  "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text,
  "userId" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "category" "AssetCategory" NOT NULL,
  "amount" INTEGER NOT NULL,
  "date" TIMESTAMP(3) NOT NULL,
  "memo" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Asset_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "Asset_userId_date_idx" ON "Asset"("userId", "date");

CREATE TABLE IF NOT EXISTS "VisionItem" (
  "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text,
  "userId" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "description" TEXT,
  "imageUrl" TEXT,
  "targetDate" TIMESTAMP(3),
  "targetAmount" INTEGER,
  "sortOrder" INTEGER NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "VisionItem_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "Todo" (
  "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text,
  "userId" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "completed" BOOLEAN NOT NULL DEFAULT false,
  "dueDate" TIMESTAMP(3),
  "sortOrder" INTEGER NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Todo_pkey" PRIMARY KEY ("id")
);

-- Foreign keys (idempotent with DO blocks)
DO $$ BEGIN
  ALTER TABLE "Subscription" ADD CONSTRAINT "Subscription_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  ALTER TABLE "Episode" ADD CONSTRAINT "Episode_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "VideoCourse"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  ALTER TABLE "Question" ADD CONSTRAINT "Question_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  ALTER TABLE "BudgetEntry" ADD CONSTRAINT "BudgetEntry_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  ALTER TABLE "Asset" ADD CONSTRAINT "Asset_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  ALTER TABLE "VisionItem" ADD CONSTRAINT "VisionItem_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  ALTER TABLE "Todo" ADD CONSTRAINT "Todo_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN null; END $$;
`;

export async function GET() {
  const connectionString =
    process.env.DATABASE_URL_UNPOOLED || process.env.DATABASE_URL;

  if (!connectionString) {
    return NextResponse.json(
      { error: "DATABASE_URL not configured" },
      { status: 500 }
    );
  }

  const client = new pg.Client({ connectionString });

  try {
    await client.connect();

    // Step 1: Create tables
    await client.query(createTablesSql);

    // Step 2: Check if admin exists
    const adminCheck = await client.query(
      `SELECT id FROM "User" WHERE role = 'ADMIN' LIMIT 1`
    );
    if (adminCheck.rows.length > 0) {
      return NextResponse.json({
        message: "Tables verified. Admin already exists.",
        tablesCreated: true,
        adminExists: true,
      });
    }

    // Step 3: Create admin user with bcrypt hash of "admin12345"
    // Pre-computed bcrypt hash of "admin12345"
    const hashedPassword =
      "$2b$12$XU9ityk8NLP5QXJ.4jNr.OCt2dx4W6oBsooSV7YfQdFM84MNgrv0i";

    const adminResult = await client.query(
      `INSERT INTO "User" (id, email, "hashedPassword", name, role, "createdAt", "updatedAt")
       VALUES (gen_random_uuid()::text, 'admin@firelife.jp', $1, '管理者', 'ADMIN', NOW(), NOW())
       ON CONFLICT (email) DO NOTHING
       RETURNING id, email`,
      [hashedPassword]
    );

    const adminId = adminResult.rows[0]?.id;
    if (adminId) {
      await client.query(
        `INSERT INTO "Subscription" (id, "userId", "stripeCustomerId", status, "createdAt", "updatedAt")
         VALUES (gen_random_uuid()::text, $1, 'cus_admin_placeholder', 'ACTIVE', NOW(), NOW())
         ON CONFLICT ("userId") DO NOTHING`,
        [adminId]
      );
    }

    // Step 4: Seed courses
    const courses = [
      {
        slug: "nisa-guide",
        title: "NISAの始め方",
        description:
          "新NISAの制度概要から口座開設、商品選び、実際の購入方法まで初心者にもわかりやすく解説します。",
        sortOrder: 1,
        episodes: [
          "NISAとは？制度の概要を理解しよう",
          "旧NISAと新NISAの違い",
          "NISA口座の開設方法",
          "つみたて投資枠の活用法",
          "成長投資枠の使い方",
          "おすすめの投資信託の選び方",
          "実際にNISAで投資してみよう",
          "NISA運用の注意点",
          "NISAと税金の関係",
          "NISA活用の実践戦略",
        ],
      },
      {
        slug: "why-invest",
        title: "なぜ投資をしないといけないのか",
        description:
          "インフレ、年金問題、老後資金など、投資が必要な理由を数字を使って具体的に解説します。",
        sortOrder: 2,
        episodes: [
          "お金の価値は時間とともに減る",
          "年金だけでは足りない理由",
          "複利の力を味方につける",
          "投資のリスクは本当に怖い？",
          "長期投資の圧倒的な優位性",
        ],
      },
      {
        slug: "saving-manual",
        title: "節約マニュアル",
        description:
          "固定費の見直しから日々の節約テクニックまで、無理なく続けられる節約術を解説します。",
        sortOrder: 3,
        episodes: [
          "まず固定費を見直そう",
          "通信費の最適化",
          "保険の見直し方",
          "食費の賢い節約法",
          "光熱費を下げるコツ",
        ],
      },
      {
        slug: "household-budget",
        title: "家計簿の付け方",
        description:
          "家計簿を習慣化して支出を把握する方法を解説。このサイトの家計簿ツールの使い方も紹介します。",
        sortOrder: 4,
        episodes: [
          "なぜ家計簿をつけるのか",
          "支出カテゴリの分け方",
          "家計簿を続けるコツ",
          "家計簿から見える改善ポイント",
          "FIREに向けた貯蓄率の考え方",
        ],
      },
    ];

    for (const course of courses) {
      const courseResult = await client.query(
        `INSERT INTO "VideoCourse" (id, slug, title, description, "sortOrder", "createdAt")
         VALUES (gen_random_uuid()::text, $1, $2, $3, $4, NOW())
         ON CONFLICT (slug) DO NOTHING
         RETURNING id`,
        [course.slug, course.title, course.description, course.sortOrder]
      );

      const courseId = courseResult.rows[0]?.id;
      if (courseId) {
        for (let i = 0; i < course.episodes.length; i++) {
          await client.query(
            `INSERT INTO "Episode" (id, "courseId", title, "videoUrl", "sortOrder", "createdAt")
             VALUES (gen_random_uuid()::text, $1, $2, $3, $4, NOW())`,
            [
              courseId,
              course.episodes[i],
              "https://www.youtube.com/embed/dQw4w9WgXcQ",
              i + 1,
            ]
          );
        }
      }
    }

    return NextResponse.json({
      message: "Setup complete!",
      tablesCreated: true,
      admin: { email: "admin@firelife.jp", password: "admin12345" },
      coursesSeeded: courses.length,
    });
  } catch (error) {
    console.error("Setup error:", error);
    return NextResponse.json(
      {
        error: "Setup failed",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  } finally {
    await client.end();
  }
}
