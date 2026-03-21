"use client";

import { cn } from "@/lib/utils";
import type { ToolCategory } from "@/lib/guide-data";

interface GuideTableOfContentsProps {
  categories: ToolCategory[];
}

export function GuideTableOfContents({ categories }: GuideTableOfContentsProps) {
  function handleClick(e: React.MouseEvent<HTMLAnchorElement>, id: string) {
    e.preventDefault();
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }

  return (
    <nav className="flex gap-2 overflow-x-auto pb-2 -mx-1 px-1 scrollbar-hide">
      {categories.map((category) => (
        <a
          key={category.id}
          href={`#${category.id}`}
          onClick={(e) => handleClick(e, category.id)}
          className={cn(
            "flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium",
            "border border-border bg-background",
            "hover:bg-primary hover:text-primary-foreground hover:border-primary",
            "transition-colors duration-200"
          )}
        >
          <span className="text-primary font-bold mr-1.5">{category.number}</span>
          {category.title}
        </a>
      ))}
    </nav>
  );
}
