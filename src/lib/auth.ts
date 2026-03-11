import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "./prisma";
import { rateLimit } from "./rate-limit";

// Login attempt tracking per email
const loginAttempts = new Map<string, { count: number; lockedUntil?: number }>();

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "メールアドレス", type: "email" },
        password: { label: "パスワード", type: "password" },
      },
      async authorize(credentials, req) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("メールアドレスとパスワードを入力してください");
        }

        const email = credentials.email.toLowerCase().trim();

        // Rate limit by email: 10 attempts per 15 minutes
        const { allowed } = rateLimit(`login:${email}`, 10, 15 * 60 * 1000);
        if (!allowed) {
          throw new Error(
            "ログイン試行回数が上限に達しました。15分後にお試しください"
          );
        }

        // Also rate limit by IP
        const ip =
          (req?.headers && ("x-forwarded-for" in req.headers
            ? String(req.headers["x-forwarded-for"]).split(",")[0].trim()
            : req.headers["x-real-ip"])) || "unknown";
        const { allowed: ipAllowed } = rateLimit(
          `login-ip:${ip}`,
          20,
          15 * 60 * 1000
        );
        if (!ipAllowed) {
          throw new Error(
            "ログイン試行回数が上限に達しました。15分後にお試しください"
          );
        }

        const user = await prisma.user.findUnique({
          where: { email },
          include: { subscription: true },
        });

        if (!user) {
          throw new Error("メールアドレスまたはパスワードが正しくありません");
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.hashedPassword
        );

        if (!isPasswordValid) {
          throw new Error("メールアドレスまたはパスワードが正しくありません");
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          subscriptionStatus: user.subscription?.status ?? "INACTIVE",
        };
      },
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  callbacks: {
    async jwt({ token, user, trigger }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.subscriptionStatus = user.subscriptionStatus;
      }

      // Refresh subscription status periodically
      if (trigger === "update" || !user) {
        const dbUser = await prisma.user.findUnique({
          where: { id: token.id },
          include: { subscription: true },
        });
        if (dbUser) {
          token.role = dbUser.role;
          token.subscriptionStatus =
            dbUser.subscription?.status ?? "INACTIVE";
        }
      }

      return token;
    },
    async session({ session, token }) {
      session.user.id = token.id;
      session.user.role = token.role;
      session.user.subscriptionStatus = token.subscriptionStatus;
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
};
