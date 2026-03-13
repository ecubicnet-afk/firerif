This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

---

## かんたん資産管理 — UI/UX 改善設計書

### 1. 市場・技術調査サマリー

#### Fintech UIトレンド分析
- **カード型サマリー**: WealthNavi・Moneyforward等では、投資元本・評価額・損益を大きなフォントのカードで一目で把握できるデザインを採用。色分けによるセマンティック表現が重要。
- **チャートの可読性**: Robinhoodスタイルのミニマルなエリアチャート、ドーナツ中央に合計値を配置するパターンが主流。ラベルの重なりは致命的UX問題として認識されている。
- **トラスト（信頼感）の演出**: 深い青・緑系のアクセントカラー、余白の活用、モノスペースフォントでの数値表示が金融アプリの信頼感を高める。
- **モバイルファースト**: テーブルはカードビューに変換、チャートはスワイプ操作対応がベストプラクティス。

#### グラフライブラリ最適化
- **Recharts 3.x（現行）を維持**: 既存コードとの互換性、コミュニティサイズ、React 19対応を考慮し、Recharts を最適化して使い続ける。Tremor は Tailwind CSS 4 との互換性問題あり。
- **改善ポイント**: カスタムツールチップの強化、ラベルレイアウトの修正、ResponsiveContainer のパフォーマンス最適化。

### 2. UI改善設計

#### 2.1 視覚的階層の整理

| 要素 | Before | After |
|------|--------|-------|
| 投資元本 | `text-lg font-black` | `text-2xl font-black` + アイコン色強調 |
| 時価評価額 | `text-lg font-black` | `text-2xl font-black` + グラデーション背景 |
| 損益額 | `text-lg font-black` | `text-3xl font-black` + セマンティックカラー強調 |
| サマリーカード | 5列均等 | 損益カードを中央に大きく配置（スパン2列） |

#### 2.2 チャートの視認性改善

- **Top 10 バーチャート**: `layout="vertical"` + `LabelList position="top"` を **横棒グラフ（horizontal layout）** に変更。銘柄名を YAxis に配置しラベル重なりを完全解消。長い銘柄名は `tick` のカスタムレンダラーで15文字に truncate。
- **ドーナツチャート**: カスタム `CustomPieLabel` の位置計算を改善。1%未満のセグメントはラベル非表示。中央に合計金額 + 銘柄数を表示。Legend にパーセンテージを付加。
- **エリアチャート（資産推移）**: 投資元本ラインを追加し、含み益を視覚的に表現。カスタムツールチップに日付・総資産・損益・前回比を表示。

#### 2.3 カラーパレットの統一

```
セマンティックカラー:
  利益（プラス）: emerald-600 (#059669) — 一貫してすべてのプラス表示に使用
  損失（マイナス）: rose-600 (#e11d48) — 一貫してすべてのマイナス表示に使用

地域カラー（コントラスト改善）:
  日本: #2563eb (blue-600)
  米国: #dc2626 (red-600)
  全世界: #7c3aed (violet-600)
  現金: #64748b (slate-500)
  その他: #6b7280 (gray-500)

資産種別カラー:
  投資信託: #059669 (emerald-600)
  株式: #2563eb (blue-600)
  ETF: #d97706 (amber-600)
  REIT: #db2777 (pink-600)
  債券: #7c3aed (violet-600)
  現金: #64748b (slate-500)
```

#### 2.4 レスポンシブ設計

- **銘柄リスト**: モバイル時はカードビューに切替（各銘柄が独立カードとして表示）
- **サマリー統計**: モバイル2列、タブレット3列、デスクトップ5列のグリッド
- **チャート**: モバイルではドーナツを縦積み、バーチャートは高さを自動調整
- **ヘッダー操作**: モバイルでは縦スタック配置

### 3. コンサルタント・レビュー

#### 計算精度（浮動小数点数）
- 現在の `parseFloat` + 四則演算は、日本円ベースの整数計算では精度問題は発生しにくい。
- `profitRate` の計算で `toFixed(2)` を使用しており、表示レベルでは問題なし。
- **推奨**: 内部計算は現状維持（円単位の整数値）。表示時に `Math.round()` を適用。

#### CSVパースの堅牢性
- 前回修正で `includes()` ベースの部分一致、UTF-8フォールバック、エラーフィードバックを実装済み。
- **追加推奨**: なし（現在の実装で十分堅牢）。

#### セキュリティ
- 資産データはサーバーサイド（PostgreSQL）に保存。LocalStorage には機密データを保持していない。
- セッション管理は NextAuth で適切に実装済み。
- **結論**: 現在のアーキテクチャで暗号化の追加は不要。

### 4. 実装対象ファイル

| ファイル | 変更内容 |
|---------|---------|
| `src/app/(member)/assets/page.tsx` | 全面リニューアル |
| `README.md` | 設計書追記（本セクション） |

---

## ビジョンボード v3 — コルクボード化 + 画像最適化

### 設計概要

ビジョンボードをグラスモーフィズムUI → コルクボード風UIに刷新。夢や目標を「ピン留め」するメタファーで没入感を実現。

### 主な改善点

| カテゴリ | 改善内容 |
|---------|---------|
| **ビジュアル** | CSSグラデーションによるコルクテクスチャ背景（画像不要）、紙テクスチャカード |
| **ピン装飾** | HTML/CSSで5色ローテーションのプッシュピン、光沢ハイライト付き |
| **レイアウト** | カードにランダム風回転（±3度、indexベース決定論的）、3列レスポンシブグリッド |
| **画像最適化** | Canvas APIでアップロード時圧縮（max 1200px幅、JPEG 0.8品質）、10MBまで受付 |
| **体感速度** | Shimmerスケルトン（animate-pulse）で画像ロード中のUX改善 |
| **アクセシビリティ** | alt属性にタイトル自動設定、ピン装飾にaria-hidden、削除ボタンにaria-label |
| **ダークモード** | コルク背景・紙テクスチャのダーク版を完備 |

### 修正ファイル

| ファイル | 変更 |
|---------|------|
| `src/app/globals.css` | `.bg-cork`, `.bg-paper` CSSユーティリティ追加 |
| `src/components/vision-board/VisionCard.tsx` | ピン装飾、回転、紙テクスチャ、shimmerスケルトン |
| `src/components/vision-board/VisionForm.tsx` | Canvas圧縮関数、10MBアップロード対応、コルクボードスタイル |
| `src/app/(member)/vision/page.tsx` | コルクボード背景、3列グリッド、テキスト更新 |
| `src/components/vision-board/EmptyState.tsx` | コルクボードテーマ統一 |

### 技術詳細

- **コルクテクスチャ**: 5層のCSS radial-gradient重ね合わせで実現（外部画像不要）
- **画像圧縮**: `canvas.toDataURL("image/jpeg", 0.8)` — 2MB超時は0.5品質でリトライ
- **ピン色**: `[red, blue, emerald, amber, purple]` を `index % 5` でサイクル
- **回転角度**: `((index * 7 + 3) % 7) - 3` で -3〜+3度の決定論的分散

---

## ライフプランニング・シミュレーション

### 概要

家族構成・収支・ライフイベントを入力し、生涯の必要資金をシミュレーションする機能。30〜50代の子育て世帯がFIRE達成に向けた長期的な資金計画を立てることを支援する。

### 機能

1. **6ステップ入力ウィザード**: 基本情報 → 家族構成 → 収入 → 住居 → ライフイベント → 資産・生活費
2. **リアルタイムシミュレーション**: 入力変更に即座に反応し、資産推移を再計算
3. **資産推移チャート**: Recharts AreaChart で年齢ごとの資産残高を可視化（プラス=emerald, マイナス=rose）
4. **収支バランスチャート**: 5年ごとの収入vs支出を棒グラフで表示
5. **ライフイベントタイムライン**: 退職・入学・ローン完済等のマイルストーンを時系列で表示
6. **年次収支テーブル**: 全年度の詳細収支（デスクトップ=テーブル、モバイル=カードビュー）
7. **資産不足警告**: 資産がマイナスになる年齢と最大不足額を検出・表示
8. **プラン保存**: PostgreSQLにJSON形式で保存、複数プラン管理可能

### 計算ロジック

| 項目 | 計算式 |
|------|--------|
| 給与 | 年収 × (1 + 昇給率)^経過年数 |
| 年金 | 月額年金 × 12（受給開始年齢以降） |
| 生活費 | 基本生活費 × 退職後比率 × (1 + インフレ率)^経過年数 |
| 住宅ローン | PMT = P × r(1+r)^n / ((1+r)^n - 1)（元利均等返済） |
| 教育費 | 子供の年齢に基づく自動計算（幼稚園30万〜大学120万/年） |
| 投資リターン | 資産残高 × 運用利回り（プラス資産のみ） |
| 年間キャッシュフロー | 収入 - 生活費 - 住居費 - 教育費 - イベント費 + 投資リターン |

### 教育費デフォルト値（公立ベース）

| 段階 | 年齢 | 年間費用 |
|------|------|---------|
| 幼稚園 | 3-5歳 | 30万円 |
| 小学校 | 6-11歳 | 35万円 |
| 中学校 | 12-14歳 | 50万円 |
| 高校 | 15-17歳 | 50万円 |
| 大学 | 18-21歳 | 120万円 |

### 技術詳細

- **クライアントサイド計算**: `simulateLifePlan()` で全年度をループ計算（最大100年分、軽量）
- **データ保存**: Prisma `LifePlan` モデル、`data` フィールドにJSON保存（柔軟なスキーマ）
- **テスト**: Vitest で住宅ローン計算・教育費・インフレ率・シミュレーション全体を検証

### 修正ファイル

| ファイル | 変更内容 |
|---------|---------|
| `prisma/schema.prisma` | LifePlanモデル追加 |
| `src/types/life-plan.ts` | 型定義 |
| `src/lib/life-plan-constants.ts` | デフォルト値、教育費テーブル |
| `src/lib/life-plan-calc.ts` | シミュレーションエンジン |
| `src/lib/__tests__/life-plan-calc.test.ts` | 計算テスト |
| `src/app/api/life-plan/route.ts` | CRUD API |
| `src/app/(member)/life-plan/page.tsx` | メインページ |
| `src/components/life-plan/` | ウィザード、ステップ、チャート、結果表示 |
| `src/components/layout/sidebar.tsx` | ナビゲーション追加 |
