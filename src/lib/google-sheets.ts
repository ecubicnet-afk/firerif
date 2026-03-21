import { google } from "googleapis";
import type { GaxiosError } from "googleapis-common";

function getAuth() {
  if (!process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL) {
    throw new Error("GOOGLE_SERVICE_ACCOUNT_EMAIL が設定されていません");
  }
  if (!process.env.GOOGLE_PRIVATE_KEY) {
    throw new Error("GOOGLE_PRIVATE_KEY が設定されていません");
  }
  if (!process.env.GOOGLE_SPREADSHEET_ID) {
    throw new Error("GOOGLE_SPREADSHEET_ID が設定されていません");
  }

  // Vercel環境変数のPrivate Keyフォーマットを正規化
  // JSON由来の \n（リテラル文字列）を実際の改行に変換
  // 前後の余分な引用符も除去
  let privateKey = process.env.GOOGLE_PRIVATE_KEY;
  privateKey = privateKey.replace(/^["']|["']$/g, "");
  privateKey = privateKey.replace(/\\n/g, "\n");

  return new google.auth.GoogleAuth({
    credentials: {
      client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      private_key: privateKey,
    },
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });
}

/** Google API エラーを日本語の対処法付きメッセージに変換 */
export function formatSheetsError(error: unknown): string {
  const serviceEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL || "";

  if (error instanceof Error) {
    const msg = error.message;
    const gaxiosError = error as GaxiosError;
    const status = gaxiosError.response?.status;

    // 認証エラー（Private Keyの形式不正）
    if (
      msg.includes("DECODER") ||
      msg.includes("error:1E08010C") ||
      msg.includes("PEM") ||
      msg.includes("private key")
    ) {
      return "GOOGLE_PRIVATE_KEY のフォーマットが不正です。JSONキーファイルの private_key の値をそのまま貼り付けてください（改行は \\n のまま）";
    }

    // 権限エラー
    if (status === 403 || msg.includes("permission")) {
      return `スプレッドシートへのアクセス権がありません。スプレッドシートの共有設定で ${serviceEmail} を「編集者」として追加してください`;
    }

    // スプレッドシートが見つからない
    if (status === 404 || msg.includes("not found")) {
      return "スプレッドシートが見つかりません。GOOGLE_SPREADSHEET_ID を確認してください";
    }

    // シート名/範囲エラー
    if (msg.includes("range") || msg.includes("Unable to parse")) {
      return "シートの範囲指定エラー。スプレッドシートのシートタブ名を確認してください";
    }

    return msg;
  }

  return "不明なエラーが発生しました";
}

export async function appendQuestionToSheet(
  questionId: string,
  email: string,
  content: string,
  createdAt: string
) {
  const auth = getAuth();
  const sheets = google.sheets({ version: "v4", auth });
  const spreadsheetId = process.env.GOOGLE_SPREADSHEET_ID!;

  // シート名を自動検出（Sheet1 / シート1 / カスタム名に対応）
  const meta = await sheets.spreadsheets.get({
    spreadsheetId,
    fields: "sheets.properties.title",
  });
  const firstSheetTitle =
    meta.data.sheets?.[0]?.properties?.title ?? "Sheet1";

  await sheets.spreadsheets.values.append({
    spreadsheetId,
    range: `${firstSheetTitle}!A:E`,
    valueInputOption: "USER_ENTERED",
    requestBody: {
      values: [[questionId, email, content, createdAt, "SYNCED"]],
    },
  });
}
