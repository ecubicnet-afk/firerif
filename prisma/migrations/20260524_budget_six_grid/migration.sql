-- Migration: BudgetEntry に costType / payMethod を追加（6枠家計簿対応）
-- 状態: 未適用（本番DBには適用していない）。適用方法は末尾コメント参照。
-- 作成日: 2026-05-24

-- 1. enum 型を新規作成
CREATE TYPE "CostType" AS ENUM ('FIXED', 'VARIABLE');
CREATE TYPE "PayMethod" AS ENUM ('CARD', 'BANK', 'CASH');

-- 2. BudgetEntry にカラム追加（NULL 許容＝既存行はそのまま残る）
ALTER TABLE "BudgetEntry" ADD COLUMN "costType" "CostType";
ALTER TABLE "BudgetEntry" ADD COLUMN "payMethod" "PayMethod";

-- ============================================================
-- 適用方法（本番反映時のみ実行）:
--   オプションA（このプロジェクトの既存運用に合わせる・推奨）:
--     npm run db:push        # prisma db push でスキーマ差分を反映
--   オプションB（このSQLを直接流す）:
--     psql "$DATABASE_URL_UNPOOLED" -f prisma/migrations/20260524_budget_six_grid/migration.sql
-- ============================================================
