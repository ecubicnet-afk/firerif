import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "利用規約 | ファイアライフコミュニティ",
};

export default function TermsPage() {
  return (
    <>
      <Header />
      <main className="container mx-auto max-w-3xl px-4 py-12">
        <h1 className="text-3xl font-bold mb-8">利用規約</h1>
        <p className="text-sm text-muted-foreground mb-8">最終更新日：2026年4月16日</p>

        <div className="prose prose-sm max-w-none space-y-8 text-foreground">
          <section>
            <h2 className="text-xl font-semibold mb-3">第1条（適用）</h2>
            <ol className="list-decimal pl-6 space-y-2">
              <li>本規約は、株式会社Ecubic（以下「当社」）が提供するオンラインコミュニティサービス「ファイアライフコミュニティ」（以下「本サービス」）の利用に関する条件を定めるものです。</li>
              <li>会員は、本規約に同意のうえ、本サービスを利用するものとします。</li>
              <li>当社が本サービス上で別途定める個別規定やガイドラインは、本規約の一部を構成します。</li>
            </ol>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">第2条（定義）</h2>
            <p>本規約において、次の用語は以下の意味で使用します。</p>
            <ol className="list-decimal pl-6 space-y-2 mt-2">
              <li><strong>「本サービス」</strong>：当社が運営するオンラインコミュニティ「ファイアライフコミュニティ」およびこれに付随する一切のサービス（Webアプリ、動画コンテンツ、ライブ配信、LINE特典等を含む）</li>
              <li><strong>「会員」</strong>：本規約に同意し、所定の手続きを経て本サービスの利用登録を完了した個人</li>
              <li><strong>「コンテンツ」</strong>：本サービスで提供される動画、テキスト、画像、データ等の一切の情報</li>
            </ol>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">第3条（利用登録）</h2>
            <ol className="list-decimal pl-6 space-y-2">
              <li>本サービスの利用を希望する方は、所定の方法により利用登録を申請するものとします。</li>
              <li>当社は、以下の場合に利用登録を拒否することがあります。理由の開示義務は負いません。
                <ul className="list-disc pl-6 mt-1 space-y-1">
                  <li>虚偽の情報を申告した場合</li>
                  <li>過去に本規約に違反したことがある場合</li>
                  <li>その他、当社が不適切と判断した場合</li>
                </ul>
              </li>
            </ol>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">第4条（料金および支払い）</h2>
            <ol className="list-decimal pl-6 space-y-2">
              <li>本サービスの利用料金は月額5,980円（税込）とします。入会金はかかりません。</li>
              <li>支払い方法はクレジットカード決済（サブスクリプション）とし、入会時に初月分を決済、以降毎月自動更新されます。</li>
              <li>当社は、事前に会員へ通知のうえ、料金を改定することがあります。</li>
              <li>既に支払い済みの利用料金は、日割り返金を含め、原則として返金いたしません。</li>
            </ol>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">第5条（解約）</h2>
            <ol className="list-decimal pl-6 space-y-2">
              <li>会員は、いつでもシステム上の操作により本サービスを解約できます。</li>
              <li>解約に伴う手数料・違約金は発生しません。</li>
              <li>解約後も、既に支払い済みの期間の終了日まで本サービスをご利用いただけます。</li>
            </ol>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">第6条（禁止事項）</h2>
            <p>会員は、本サービスの利用にあたり、以下の行為を行ってはなりません。</p>
            <ol className="list-decimal pl-6 space-y-2 mt-2">
              <li>法令または公序良俗に違反する行為</li>
              <li>当社または第三者の知的財産権、肖像権、プライバシー等を侵害する行為</li>
              <li>本サービスで提供されるコンテンツの無断転載、複製、再配布</li>
              <li>他の会員への誹謗中傷、嫌がらせ、迷惑行為</li>
              <li>営利目的の宣伝・勧誘行為（当社が許可した場合を除く）</li>
              <li>本サービスのシステムに対する不正アクセスや妨害行為</li>
              <li>特定の金融商品の購入・売却を推奨または助言する行為（投資助言に該当する行為）</li>
              <li>その他、当社が不適切と判断する行為</li>
            </ol>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">第7条（コンテンツの権利）</h2>
            <ol className="list-decimal pl-6 space-y-2">
              <li>本サービスで提供されるすべてのコンテンツの著作権その他の知的財産権は、当社または正当な権利者に帰属します。</li>
              <li>会員は、本サービスのコンテンツを個人の学習目的に限り利用できます。</li>
            </ol>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">第8条（免責事項）</h2>
            <ol className="list-decimal pl-6 space-y-2">
              <li>本サービスは投資教育・金融リテラシー向上を目的としたものであり、特定の金融商品の売買を推奨するものではありません。投資判断は会員ご自身の責任で行ってください。</li>
              <li>当社は、本サービスで提供する情報の正確性、完全性、有用性について保証しません。</li>
              <li>当社は、本サービスの提供の中断、停止、変更等により生じた損害について一切の責任を負いません。</li>
              <li>会員が本サービスの情報に基づいて行った投資その他の行為により生じた損害について、当社は一切の責任を負いません。</li>
            </ol>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">第9条（サービスの変更・終了）</h2>
            <ol className="list-decimal pl-6 space-y-2">
              <li>当社は、会員への事前通知のうえ、本サービスの内容を変更または終了することがあります。</li>
              <li>サービス終了の場合、未利用期間分の料金は返金いたします。</li>
            </ol>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">第10条（個人情報の取り扱い）</h2>
            <p>当社は、会員の個人情報を当社の<a href="https://firelife-community.netlify.app/privacy.html" target="_blank" rel="noopener noreferrer" className="text-primary underline hover:no-underline">プライバシーポリシー</a>に基づき適切に取り扱います。</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">第11条（規約の変更）</h2>
            <ol className="list-decimal pl-6 space-y-2">
              <li>当社は、必要と判断した場合、本規約を変更することがあります。</li>
              <li>変更後の規約は、本サービス上に掲示した時点から効力を生じます。</li>
              <li>変更後に本サービスを利用した場合、変更後の規約に同意したものとみなします。</li>
            </ol>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">第12条（準拠法・管轄）</h2>
            <ol className="list-decimal pl-6 space-y-2">
              <li>本規約の解釈は日本法に準拠します。</li>
              <li>本サービスに関する紛争は、岐阜地方裁判所を第一審の専属的合意管轄裁判所とします。</li>
            </ol>
          </section>

          <div className="border-t pt-6 mt-12 text-sm text-muted-foreground">
            <p>株式会社Ecubic</p>
            <p>代表取締役 各務 宗一朗</p>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
