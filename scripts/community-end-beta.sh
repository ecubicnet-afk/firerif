#!/bin/bash
# コミュニティのベータ無料開放を終了し、有料会員限定に切り替えるスクリプト
#
# 使い方:
#   ./scripts/community-end-beta.sh
#
# このスクリプトは .env.local の COMMUNITY_BETA_FREE を false に変更します。
# 変更後、デプロイ（またはサーバー再起動）が必要です。

set -e

ENV_FILE=".env.local"

if [ ! -f "$ENV_FILE" ]; then
  echo "エラー: $ENV_FILE が見つかりません"
  exit 1
fi

if grep -q "COMMUNITY_BETA_FREE=true" "$ENV_FILE"; then
  sed -i 's/COMMUNITY_BETA_FREE=true/COMMUNITY_BETA_FREE=false/' "$ENV_FILE"
  echo "COMMUNITY_BETA_FREE を false に変更しました"
  echo ""
  echo "次のステップ:"
  echo "  1. デプロイまたはサーバーを再起動してください"
  echo "  2. コミュニティページにサブスクなしでアクセスできないことを確認してください"
else
  echo "COMMUNITY_BETA_FREE=true が $ENV_FILE に見つかりません"
  echo "既に無効化されているか、環境変数が設定されていません"
fi
