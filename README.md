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
