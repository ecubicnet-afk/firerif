// ★2026-07-13 ローンチ延期対応（2026-07-08 決定1）
// 本ローンチ（決済開始）が確定するまでは準備中モード:
//   - ランディングの料金セクション・登録CTAを「LINEで先行案内」に差し替え
//   - /register 自体は直URLで残す（既存ベータ協力者用）
// 本ローンチ時に PREPARING = false へ戻すと募集モードが復活する。
// 正本: ファイアライフコミュニティ/コミュニティ運営/会員アプリ_全体診断_2026-07-13.md
export const PREPARING = true;

// ファイアライフ公式LINE（pLvzNdo）。YouTube/note用の中火LINE(vXB8jli)と混同しないこと
export const LINE_URL = "https://lin.ee/pLvzNdo";
