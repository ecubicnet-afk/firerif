import { Flame } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t py-6 md:py-8">
      <div className="container mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Flame className="h-4 w-4" />
          <span>&copy; {new Date().getFullYear()} ファイアライフ</span>
        </div>
        <div className="flex gap-4 text-sm text-muted-foreground">
          <a href="#" className="hover:text-foreground">利用規約</a>
          <a href="https://firelife-community.netlify.app/privacy.html" target="_blank" rel="noopener noreferrer" className="hover:text-foreground">プライバシーポリシー</a>
          <a href="https://firelife-community.netlify.app/tokushoho.html" target="_blank" rel="noopener noreferrer" className="hover:text-foreground">特定商取引法に基づく表記</a>
        </div>
      </div>
    </footer>
  );
}
