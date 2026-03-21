"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";

const isBetaFree = process.env.NEXT_PUBLIC_COMMUNITY_BETA_FREE === "true";

export function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isResubscribe = searchParams.get("resubscribe") === "true";
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("パスワードが一致しません");
      return;
    }

    if (password.length < 8) {
      setError("パスワードは8文字以上で入力してください");
      return;
    }

    setLoading(true);

    try {
      // Register the user
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, name }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "登録に失敗しました");
        setLoading(false);
        return;
      }

      // Sign in after registration
      const signInResult = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (signInResult?.error) {
        setError("登録は完了しましたが、ログインに失敗しました");
        setLoading(false);
        return;
      }

      if (isBetaFree) {
        // Beta free: skip checkout, go directly to community
        router.push("/community");
      } else {
        // Redirect to checkout
        const checkoutRes = await fetch("/api/stripe/checkout", {
          method: "POST",
        });

        const checkoutData = await checkoutRes.json();

        if (checkoutData.url) {
          window.location.href = checkoutData.url;
        } else {
          router.push("/dashboard");
        }
      }
    } catch {
      setError("登録中にエラーが発生しました");
    } finally {
      setLoading(false);
    }
  }

  async function handleResubscribe() {
    setLoading(true);
    try {
      const res = await fetch("/api/stripe/checkout", { method: "POST" });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } catch {
      setError("エラーが発生しました");
    } finally {
      setLoading(false);
    }
  }

  if (isResubscribe) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">サブスクリプションの再開</CardTitle>
          <CardDescription>
            会員エリアにアクセスするには、サブスクリプションを再開してください。
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
              {error}
            </div>
          )}
        </CardContent>
        <CardFooter>
          <Button
            className="w-full"
            onClick={handleResubscribe}
            disabled={loading}
          >
            {loading ? "処理中..." : "サブスクリプションを再開する"}
          </Button>
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl">新規登録</CardTitle>
        <CardDescription>
          ファイヤーライフコミュニティに参加しましょう
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          {error && (
            <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
              {error}
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="name">お名前</Label>
            <Input
              id="name"
              type="text"
              placeholder="山田 太郎"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">メールアドレス</Label>
            <Input
              id="email"
              type="email"
              placeholder="mail@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">パスワード</Label>
            <Input
              id="password"
              type="password"
              placeholder="8文字以上"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">パスワード（確認）</Label>
            <Input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "登録中..." : isBetaFree ? "無料で登録する" : "登録して決済へ進む"}
          </Button>
          <p className="text-sm text-muted-foreground text-center">
            既にアカウントをお持ちの方は{" "}
            <Link href="/login" className="text-primary hover:underline">
              ログイン
            </Link>
          </p>
        </CardFooter>
      </form>
    </Card>
  );
}
