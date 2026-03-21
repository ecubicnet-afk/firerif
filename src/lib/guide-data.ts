import {
  Video,
  Radio,
  MessageCircleQuestion,
  Wallet,
  Sparkles,
  TrendingUp,
  Target,
  CalendarRange,
  CheckSquare,
  ClipboardCheck,
  BookOpen,
  Users,
  CreditCard,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export interface ToolInfo {
  id: string;
  title: string;
  icon: LucideIcon;
  color: string;
  bgColor: string;
  href: string;
  tagline: string;
  description: string;
  steps: string[];
  benefits: string[];
  isNew?: boolean;
}

export interface ToolCategory {
  id: string;
  number: number;
  title: string;
  subtitle: string;
  description: string;
  tools: ToolInfo[];
}

export const guideCategories: ToolCategory[] = [
  {
    id: "input",
    number: 1,
    title: "学ぶ・解決する",
    subtitle: "インプット",
    description:
      "FIREへの第一歩は正しい知識から。動画・ライブ・Q&Aで疑問を解消し、自信を持って行動できる土台を築きましょう。",
    tools: [
      {
        id: "courses",
        title: "動画コース",
        icon: Video,
        color: "text-blue-500",
        bgColor: "bg-blue-50",
        href: "/courses",
        tagline: "体系的にFIRE戦略を学び、遠回りを防ぐ",
        description:
          "FIREの基礎知識から実践的な投資戦略まで、専門家が監修したカリキュラムを動画で学べます。1本10〜15分の短い動画で、スキマ時間にも学習を進められます。",
        steps: [
          "コース一覧から興味のあるテーマを選ぶ",
          "動画を視聴して知識を吸収する（1本10〜15分）",
          "学んだポイントをメモやジャーナルに残す",
        ],
        benefits: [
          "自分のペースで何度でも復習できる",
          "基礎から応用まで体系的に網羅",
          "プロ監修の信頼できるカリキュラム",
        ],
      },
      {
        id: "live",
        title: "ライブ配信",
        icon: Radio,
        color: "text-red-500",
        bgColor: "bg-red-50",
        href: "/live",
        tagline: "最新情報をキャッチし、リアルタイムで疑問を解消",
        description:
          "定期的なライブ配信で、最新の市場動向や節約テクニックをリアルタイムで学べます。チャットで講師に直接質問できるのが最大の魅力です。",
        steps: [
          "配信スケジュールを確認して予定を空ける",
          "配信時間になったらページを開いて参加",
          "チャットで気軽に質問・コメントする",
        ],
        benefits: [
          "最新の市場動向をいち早くキャッチ",
          "講師に直接質問できる貴重な機会",
          "見逃してもアーカイブで視聴可能",
        ],
      },
      {
        id: "qa",
        title: "Q&A",
        icon: MessageCircleQuestion,
        color: "text-purple-500",
        bgColor: "bg-purple-50",
        href: "/qa",
        tagline: "あなた固有の疑問を専門家に直接相談",
        description:
          "学習中や実践中に浮かんだ疑問を投稿できます。専門家が丁寧に回答。過去のQ&Aも検索でき、同じ悩みを持つ仲間の質問からも学べます。",
        steps: [
          "疑問に思ったことを質問フォームに入力して投稿",
          "専門家からの回答を待つ（通知でお知らせ）",
          "過去のQ&Aを検索して類似の悩みも解決",
        ],
        benefits: [
          "個別の状況に合わせたアドバイスが得られる",
          "蓄積されたQ&Aが全員の知識財産に",
        ],
      },
    ],
  },
  {
    id: "management",
    number: 2,
    title: "見える化する",
    subtitle: "マネジメント",
    description:
      "「何となく」を「数字」に変えることが、FIREの最大の武器。現状を正確に把握し、未来をシミュレーションしましょう。",
    tools: [
      {
        id: "budget",
        title: "家計簿",
        icon: Wallet,
        color: "text-green-500",
        bgColor: "bg-green-50",
        href: "/budget",
        tagline: "支出の\"見える化\"がFIREへの最短ルート",
        description:
          "毎月の収入と支出をカテゴリ別に記録し、お金の流れを可視化します。「どこにいくら使っているか」を知ることが、貯蓄率アップの第一歩です。",
        steps: [
          "収入を登録して月の予算を設定する",
          "日々の支出をカテゴリ別に記録する",
          "月次サマリーで収支バランスと傾向を把握する",
        ],
        benefits: [
          "無駄遣いのパターンを発見できる",
          "貯蓄率を自動で算出",
          "改善すべきポイントが一目瞭然",
        ],
      },
      {
        id: "assets",
        title: "資産管理",
        icon: TrendingUp,
        color: "text-orange-500",
        bgColor: "bg-orange-50",
        href: "/assets",
        tagline: "資産の成長を数値で実感し、投資判断を最適化",
        description:
          "銀行口座・証券口座・その他の資産を一元管理。資産推移をグラフで確認し、着実な成長を実感することでモチベーションを維持できます。",
        steps: [
          "保有する口座・資産の情報を登録する",
          "定期的に残高を更新する",
          "推移グラフで資産の成長トレンドを確認する",
        ],
        benefits: [
          "全資産をワンストップで把握",
          "成長率をグラフで可視化",
          "ポートフォリオの見直し判断に活用",
        ],
      },
      {
        id: "life-plan",
        title: "ライフプラン",
        icon: CalendarRange,
        color: "text-teal-500",
        bgColor: "bg-teal-50",
        href: "/life-plan",
        tagline: "リタイア時期を逆算し、必要資金を明確に",
        description:
          "結婚・住宅購入・子育て・リタイアなど、将来のライフイベントを時系列で入力。必要資金を算出し、FIRE達成までのロードマップを描きます。",
        steps: [
          "将来のライフイベント（結婚、住宅、リタイア等）を入力",
          "収入・支出の見通しを年ごとに設定する",
          "シミュレーション結果でFIRE達成時期を確認する",
        ],
        benefits: [
          "FIRE達成時期を具体的な数字で把握",
          "必要資金が明確になり計画が立てやすい",
          "定期的に見直して軌道修正できる",
        ],
      },
    ],
  },
  {
    id: "action",
    number: 3,
    title: "行動する",
    subtitle: "アクション",
    description:
      "知識を行動に変えるツール群。モチベーションを維持しながら、毎日の小さなアクションをFIRE達成に直結させます。",
    tools: [
      {
        id: "dream",
        title: "節約ドリーム",
        icon: Sparkles,
        color: "text-amber-500",
        bgColor: "bg-amber-50",
        href: "/dream",
        tagline: "\"我慢\"を\"ワクワク\"に変え、節約を長続きさせる",
        description:
          "節約で浮いたお金で「何を叶えたいか」を登録し、達成度をスタンプで記録。節約を苦行ではなく、夢への投資に変えます。",
        steps: [
          "叶えたい夢や目標を登録する",
          "節約した金額をスタンプで楽しく記録する",
          "夢の達成度をチェックして達成感を味わう",
        ],
        benefits: [
          "節約にポジティブな動機付けを与える",
          "小さな成功体験を積み重ねられる",
        ],
      },
      {
        id: "vision",
        title: "ビジョンボード",
        icon: Target,
        color: "text-pink-500",
        bgColor: "bg-pink-50",
        href: "/vision",
        tagline: "理想の未来を毎日視覚化し、行動のエンジンにする",
        description:
          "理想のライフスタイルや目標を画像・テキストでボードに配置。毎日眺めることで潜在意識に働きかけ、FIREへのモチベーションを持続させます。",
        steps: [
          "理想のライフスタイルを表す画像を追加する",
          "目標や大切にしたい言葉をピン留めする",
          "毎日ボードを眺めて理想を意識に刷り込む",
        ],
        benefits: [
          "目標が視覚的に明確になる",
          "日々のモチベーションを維持できる",
          "潜在意識レベルで行動が変わる",
        ],
      },
      {
        id: "todos",
        title: "ToDoリスト",
        icon: CheckSquare,
        color: "text-cyan-500",
        bgColor: "bg-cyan-50",
        href: "/todos",
        tagline: "日々のFIREアクションを着実に積み重ねる",
        description:
          "今日やるべき具体的なアクションを管理。「家計簿をつける」「投資の勉強を15分する」など、FIREに向けた毎日の一歩を確実にこなしましょう。",
        steps: [
          "今日やるべきFIREアクションを追加する",
          "完了したタスクにチェックを入れる",
          "一日の終わりに振り返り、達成感を得る",
        ],
        benefits: [
          "やるべきことの漏れを防ぐ",
          "小さな達成感の積み重ねが習慣化を促す",
        ],
      },
    ],
  },
  {
    id: "output",
    number: 4,
    title: "成長する",
    subtitle: "アウトプット",
    description:
      "インプットだけでは知識は定着しません。書く・まとめる・提出するアウトプットで、学びを確かなスキルに変えましょう。",
    tools: [
      {
        id: "assignments",
        title: "課題提出",
        icon: ClipboardCheck,
        color: "text-violet-500",
        bgColor: "bg-violet-50",
        href: "/assignments",
        tagline: "学んだ知識をアウトプットし、確実にスキル化する",
        description:
          "動画コースで学んだ内容を、ワーク形式でアウトプット。ワークシートを記入して提出すると、専門家からパーソナルなフィードバックが届きます。",
        steps: [
          "動画コースに紐づいた課題テーマを確認する",
          "ワークシートに記入し、テキストまたはファイルで提出する",
          "フィードバックを受け取り、必要に応じて再提出する",
        ],
        benefits: [
          "「わかったつもり」を確実に防止",
          "知識が実践的なスキルとして定着",
          "専門家からパーソナルなフィードバック",
        ],
        isNew: true,
      },
      {
        id: "journal",
        title: "節約ジャーナル",
        icon: BookOpen,
        color: "text-lime-600",
        bgColor: "bg-lime-50",
        href: "/journal",
        tagline: "書く習慣で無駄遣いの衝動をコントロール",
        description:
          "日々の「節約アクション」や「お金に関する気づき」を記録する日記。ジャーナリング（書く瞑想）の効果で、無意識の浪費パターンに気づき、健全な金銭感覚を養います。",
        steps: [
          "今日行った節約アクションを1行で記録する",
          "節約金額と気づいたことをメモに残す",
          "週間の振り返りで自分の傾向を発見する",
        ],
        benefits: [
          "ジャーナリング効果で衝動買いを抑制",
          "節約が自然と習慣化される",
          "お金に対する自己理解が深まる",
        ],
        isNew: true,
      },
    ],
  },
  {
    id: "connect",
    number: 5,
    title: "つながる・管理する",
    subtitle: "コミュニティ & アカウント",
    description:
      "一人で続けるのは難しくても、仲間がいれば続けられる。同じ志を持つメンバーと交流し、お互いに刺激し合いましょう。",
    tools: [
      {
        id: "community",
        title: "コミュニティ",
        icon: Users,
        color: "text-indigo-500",
        bgColor: "bg-indigo-50",
        href: "/community",
        tagline: "同じ志を持つ仲間が最大のモチベーション",
        description:
          "FIREを目指す仲間と日々の進捗や気づきを共有できます。他のメンバーの成功体験や工夫は、あなたにとって最高のヒントと刺激になります。",
        steps: [
          "コミュニティページを開いて投稿を見る",
          "気になる投稿にコメントやリアクションする",
          "自分の進捗や気づきもシェアしてみる",
        ],
        benefits: [
          "仲間の成功体験が最高の刺激になる",
          "一人では気づけない視点が得られる",
          "仲間がいることで継続率が大幅アップ",
        ],
      },
      {
        id: "subscription",
        title: "サブスクリプション管理",
        icon: CreditCard,
        color: "text-gray-500",
        bgColor: "bg-gray-50",
        href: "/dashboard",
        tagline: "プランの確認・変更をいつでも簡単に",
        description:
          "現在のプラン、請求情報の確認、プラン変更がいつでも行えます。ダッシュボード下部の「請求・支払い管理」ボタンからアクセスできます。",
        steps: [
          "ダッシュボードの「請求・支払い管理」をクリック",
          "現在のプランや支払い履歴を確認する",
          "必要に応じてプランの変更を行う",
        ],
        benefits: [
          "透明な料金体系で安心",
          "いつでも自由にプラン変更が可能",
        ],
      },
    ],
  },
];
