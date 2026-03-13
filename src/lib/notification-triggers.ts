/**
 * 行動経済学に基づく時間帯別プッシュ通知トリガー設定
 *
 * 30〜50代子育て世帯の生活リズムに合わせて、
 * 節約アクションを促すタイミングと通知メッセージを定義する。
 */

export interface NotificationTrigger {
  id: string;
  label: string;
  /** 開始時刻 (HH:MM) */
  startTime: string;
  /** 終了時刻 (HH:MM) */
  endTime: string;
  /** 特定の日付条件（毎月何日か、曜日など） */
  dayCondition?: "payday" | "weekend" | "weekday";
  /** 推奨するスタンプラベル */
  recommendedStamps: string[];
  /** 通知メッセージテンプレート */
  message: string;
}

export const NOTIFICATION_TRIGGERS: NotificationTrigger[] = [
  // ── 朝の通勤時間帯 ──
  {
    id: "morning-commute",
    label: "朝の通勤タイム",
    startTime: "07:30",
    endTime: "09:00",
    dayCondition: "weekday",
    recommendedStamps: ["自宅ドリップ", "一駅歩き", "自炊弁当"],
    message: "おはようございます！今日もマイボトルとお弁当で、未来の自分に仕送りしませんか？",
  },

  // ── ランチタイム ──
  {
    id: "lunch",
    label: "ランチタイム",
    startTime: "11:30",
    endTime: "13:00",
    dayCondition: "weekday",
    recommendedStamps: ["自炊弁当", "自販機スルー", "レジ横スイーツ"],
    message: "ランチどうしますか？お弁当なら800円の節約。20年後にはもっと大きな価値になりますよ。",
  },

  // ── 午後のおやつタイム ──
  {
    id: "afternoon-snack",
    label: "おやつの誘惑タイム",
    startTime: "14:30",
    endTime: "16:00",
    recommendedStamps: ["レジ横スイーツ", "自販機スルー", "自宅ドリップ"],
    message: "午後の小休憩。コンビニスイーツの代わりに、未来の自分にプレゼントしませんか？",
  },

  // ── 帰宅時間帯 ──
  {
    id: "evening-commute",
    label: "帰宅タイム",
    startTime: "17:00",
    endTime: "19:00",
    dayCondition: "weekday",
    recommendedStamps: ["一駅歩き", "タクシー回避", "ATM手数料"],
    message: "お疲れさまです。一駅歩けば健康と200円の節約、ダブルでおトクです。",
  },

  // ── 夕食〜深夜 ──
  {
    id: "night",
    label: "夜のリラックスタイム",
    startTime: "20:00",
    endTime: "23:59",
    recommendedStamps: ["晩酌休み", "ガチャ我慢", "サブスク解約"],
    message: "今夜はノンアルで。ゲームの課金もちょっと我慢。未来の自分がきっと喜びます。",
  },

  // ── 週末 ──
  {
    id: "weekend",
    label: "週末のおでかけ",
    startTime: "09:00",
    endTime: "18:00",
    dayCondition: "weekend",
    recommendedStamps: ["ホムパ化", "図書館利用", "衝動買い我慢"],
    message: "週末は家族でおうち時間もいいですよね。外食より2,000円おトク、未来で何倍にもなります。",
  },

  // ── 給料日前後 ──
  {
    id: "payday",
    label: "給料日前後",
    startTime: "00:00",
    endTime: "23:59",
    dayCondition: "payday",
    recommendedStamps: ["セールスルー", "衝動買い我慢", "格安プラン", "サブスク解約"],
    message: "お給料日！まとまったお金が入ると気が大きくなりがち。今月も未来の自分への投資を忘れずに。",
  },

  // ── 飲み会シーン（金曜夜）──
  {
    id: "friday-night",
    label: "金曜の夜",
    startTime: "18:00",
    endTime: "23:59",
    dayCondition: "weekday",
    recommendedStamps: ["二次会パス", "タクシー回避"],
    message: "金曜おつかれさまです！一次会で切り上げれば3,000円の節約。未来の自分へのプレゼントに。",
  },
];

/**
 * 現在時刻に基づいて該当するトリガーを返す
 */
export function getActiveTriggersForNow(): NotificationTrigger[] {
  const now = new Date();
  const currentTime = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
  const dayOfWeek = now.getDay(); // 0=Sun, 6=Sat
  const dayOfMonth = now.getDate();
  const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
  const isPayday = dayOfMonth >= 24 && dayOfMonth <= 27;

  return NOTIFICATION_TRIGGERS.filter((trigger) => {
    // 時刻範囲チェック
    if (currentTime < trigger.startTime || currentTime > trigger.endTime) {
      return false;
    }

    // 日付条件チェック
    if (trigger.dayCondition === "weekend" && !isWeekend) return false;
    if (trigger.dayCondition === "weekday" && isWeekend) return false;
    if (trigger.dayCondition === "payday" && !isPayday) return false;

    return true;
  });
}

/**
 * 現在のトリガーに基づく推奨スタンプラベルのリストを返す
 */
export function getRecommendedStampLabels(): string[] {
  const triggers = getActiveTriggersForNow();
  const labels = new Set<string>();
  for (const trigger of triggers) {
    for (const stamp of trigger.recommendedStamps) {
      labels.add(stamp);
    }
  }
  return Array.from(labels);
}
