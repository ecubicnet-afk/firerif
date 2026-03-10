import { PrismaClient } from "../src/generated/prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  // Create admin user
  const hashedPassword = await bcrypt.hash("admin12345", 12);
  await prisma.user.upsert({
    where: { email: "admin@firelife.jp" },
    update: {},
    create: {
      email: "admin@firelife.jp",
      hashedPassword,
      name: "管理者",
      role: "ADMIN",
      subscription: {
        create: {
          stripeCustomerId: "cus_admin_placeholder",
          status: "ACTIVE",
        },
      },
    },
  });

  // Create video courses
  const courses = [
    {
      slug: "nisa-guide",
      title: "NISAの始め方",
      description:
        "新NISAの制度概要から口座開設、商品選び、実際の購入方法まで初心者にもわかりやすく解説します。",
      sortOrder: 1,
      episodes: [
        { title: "NISAとは？制度の概要を理解しよう", sortOrder: 1 },
        { title: "旧NISAと新NISAの違い", sortOrder: 2 },
        { title: "NISA口座の開設方法", sortOrder: 3 },
        { title: "つみたて投資枠の活用法", sortOrder: 4 },
        { title: "成長投資枠の使い方", sortOrder: 5 },
        { title: "おすすめの投資信託の選び方", sortOrder: 6 },
        { title: "実際にNISAで投資してみよう", sortOrder: 7 },
        { title: "NISA運用の注意点", sortOrder: 8 },
        { title: "NISAと税金の関係", sortOrder: 9 },
        { title: "NISA活用の実践戦略", sortOrder: 10 },
      ],
    },
    {
      slug: "why-invest",
      title: "なぜ投資をしないといけないのか",
      description:
        "インフレ、年金問題、老後資金など、投資が必要な理由を数字を使って具体的に解説します。",
      sortOrder: 2,
      episodes: [
        { title: "お金の価値は時間とともに減る", sortOrder: 1 },
        { title: "年金だけでは足りない理由", sortOrder: 2 },
        { title: "複利の力を味方につける", sortOrder: 3 },
        { title: "投資のリスクは本当に怖い？", sortOrder: 4 },
        { title: "長期投資の圧倒的な優位性", sortOrder: 5 },
      ],
    },
    {
      slug: "saving-manual",
      title: "節約マニュアル",
      description:
        "固定費の見直しから日々の節約テクニックまで、無理なく続けられる節約術を解説します。",
      sortOrder: 3,
      episodes: [
        { title: "まず固定費を見直そう", sortOrder: 1 },
        { title: "通信費の最適化", sortOrder: 2 },
        { title: "保険の見直し方", sortOrder: 3 },
        { title: "食費の賢い節約法", sortOrder: 4 },
        { title: "光熱費を下げるコツ", sortOrder: 5 },
      ],
    },
    {
      slug: "household-budget",
      title: "家計簿の付け方",
      description:
        "家計簿を習慣化して支出を把握する方法を解説。このサイトの家計簿ツールの使い方も紹介します。",
      sortOrder: 4,
      episodes: [
        { title: "なぜ家計簿をつけるのか", sortOrder: 1 },
        { title: "支出カテゴリの分け方", sortOrder: 2 },
        { title: "家計簿を続けるコツ", sortOrder: 3 },
        { title: "家計簿から見える改善ポイント", sortOrder: 4 },
        { title: "FIREに向けた貯蓄率の考え方", sortOrder: 5 },
      ],
    },
  ];

  for (const course of courses) {
    const { episodes, ...courseData } = course;
    const created = await prisma.videoCourse.upsert({
      where: { slug: course.slug },
      update: courseData,
      create: {
        ...courseData,
        episodes: {
          create: episodes.map((ep) => ({
            title: ep.title,
            videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
            sortOrder: ep.sortOrder,
          })),
        },
      },
    });
    console.log(`Course: ${created.title}`);
  }

  // Create sample live streams
  const nextMonth = new Date();
  nextMonth.setMonth(nextMonth.getMonth() + 1);
  nextMonth.setDate(15);
  nextMonth.setHours(20, 0, 0, 0);

  const nextMonth2 = new Date(nextMonth);
  nextMonth2.setDate(28);

  await prisma.liveStream.createMany({
    data: [
      {
        title: "第1回ライブ配信: 投資Q&Aスペシャル",
        description: "会員の皆さんからの質問にリアルタイムでお答えします",
        scheduledAt: nextMonth,
      },
      {
        title: "第2回ライブ配信: 今月の市場振り返り",
        description: "今月のマーケットを振り返り、来月の展望をお伝えします",
        scheduledAt: nextMonth2,
      },
    ],
    skipDuplicates: true,
  });

  console.log("Seed completed!");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
