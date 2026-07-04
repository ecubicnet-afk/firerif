import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

/**
 * 管理者が書いた補足・FAQ・リンク（Markdown）を安全に描画する。
 * - raw HTML は許可しない（react-markdown 既定でサニタイズ）
 * - 外部リンクは新規タブ＋ rel="noopener"
 */
export function Markdown({ children }: { children: string }) {
  return (
    <div className="md-body">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          a: ({ href, children }) => (
            <a href={href} target="_blank" rel="noopener noreferrer nofollow">
              {children}
            </a>
          ),
        }}
      >
        {children}
      </ReactMarkdown>
    </div>
  );
}
