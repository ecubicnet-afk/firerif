# コミュニティ: ベータ(無料) → 有料切り替え手順

## 概要

現在コミュニティは `COMMUNITY_BETA_FREE=true` により無料開放中。
以下の手順で有料会員限定に切り替える。

## 手順

### 1. 環境変数を変更

`.env.local`（または Vercel/ホスティング先の環境変数設定）で：

```diff
- COMMUNITY_BETA_FREE=true
+ COMMUNITY_BETA_FREE=false
```

または行自体を削除する。

### 2. デプロイ

```bash
# Vercel の場合
vercel env rm COMMUNITY_BETA_FREE production
vercel --prod

# セルフホストの場合
# .env.local を編集後、再起動
npm run build && npm run start
```

### 3. 確認

- 未ログインユーザー → `/login` にリダイレクトされること
- ログイン済み（サブスクなし） → `/register?resubscribe=true` にリダイレクトされること
- 有料会員 → コミュニティにアクセスできること
- ベータバナーが表示されなくなっていること

## 関連ファイル

- `src/middleware.ts` — アクセス制御ロジック
- `src/app/(member)/community/page.tsx` — ベータバナー表示
- `.env.local.example` — 環境変数テンプレート
