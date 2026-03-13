import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST() {
  // Only allow setup if no admin user exists yet
  const existingAdmin = await prisma.user.findFirst({
    where: { role: "ADMIN" },
  });
  if (existingAdmin) {
    return NextResponse.json(
      { error: "Setup already completed" },
      { status: 400 }
    );
  }

  const initialPassword = process.env.ADMIN_INITIAL_PASSWORD;
  if (!initialPassword || initialPassword.length < 8) {
    return NextResponse.json(
      { error: "ADMIN_INITIAL_PASSWORD environment variable must be set (min 8 chars)" },
      { status: 500 }
    );
  }

  const hashedPassword = await bcrypt.hash(initialPassword, 12);

  const user = await prisma.user.upsert({
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

  // Also seed courses if they don't exist
  const courses = [
    {
      slug: "nisa-guide",
      title: "NISAの始め方",
      description: "新NISAの制度概要から口座開設、商品選び、実際の購入方法まで初心者にもわかりやすく解説します。",
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
      description: "インフレ、年金問題、老後資金など、投資が必要な理由を数字を使って具体的に解説します。",
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
      description: "固定費の見直しから日々の節約テクニックまで、無理なく続けられる節約術を解説します。",
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
      description: "家計簿を習慣化して支出を把握する方法を解説。このサイトの家計簿ツールの使い方も紹介します。",
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
    await prisma.videoCourse.upsert({
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
  }

  return NextResponse.json({
    message: "Setup complete",
    admin: { email: user.email, name: user.name },
  });
}
