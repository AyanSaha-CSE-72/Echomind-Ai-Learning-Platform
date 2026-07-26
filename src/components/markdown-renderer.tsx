"use client";

import { cn } from "@/lib/utils";

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

export function MarkdownRenderer({ content, className }: MarkdownRendererProps) {
  // Simple markdown parser
  const lines = content.split("\n");
  const elements: React.ReactNode[] = [];
  let inList = false;
  let listItems: string[] = [];

  const flushList = () => {
    if (listItems.length > 0) {
      elements.push(
        <ul key={`list-${elements.length}`} className="my-3 space-y-1.5 list-disc list-inside text-sm text-ink-200">
          {listItems.map((item, i) => (
            <li key={i} dangerouslySetInnerHTML={{ __html: parseInline(item) }} />
          ))}
        </ul>,
      );
      listItems = [];
    }
    inList = false;
  };

  lines.forEach((line, i) => {
    const trimmed = line.trim();

    // Headers
    if (trimmed.startsWith("### ")) {
      flushList();
      elements.push(
        <h3 key={i} className="text-base font-semibold mt-4 mb-2 text-white">
          <span dangerouslySetInnerHTML={{ __html: parseInline(trimmed.slice(4)) }} />
        </h3>,
      );
    } else if (trimmed.startsWith("## ")) {
      flushList();
      elements.push(
        <h2 key={i} className="text-lg font-semibold mt-5 mb-2 text-white">
          <span dangerouslySetInnerHTML={{ __html: parseInline(trimmed.slice(3)) }} />
        </h2>,
      );
    } else if (trimmed.startsWith("# ")) {
      flushList();
      elements.push(
        <h1 key={i} className="text-xl font-bold mt-6 mb-3 text-white">
          <span dangerouslySetInnerHTML={{ __html: parseInline(trimmed.slice(2)) }} />
        </h1>,
      );
    }
    // List items
    else if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
      inList = true;
      listItems.push(trimmed.slice(2));
    }
    // Numbered list
    else if (/^\d+\.\s/.test(trimmed)) {
      inList = true;
      listItems.push(trimmed.replace(/^\d+\.\s/, ""));
    }
    // Empty line
    else if (trimmed === "") {
      flushList();
    }
    // Regular paragraph
    else {
      flushList();
      elements.push(
        <p key={i} className="text-sm leading-relaxed text-ink-200 mb-2">
          <span dangerouslySetInnerHTML={{ __html: parseInline(trimmed) }} />
        </p>,
      );
    }
  });

  flushList();

  return <div className={cn("markdown-content", className)}>{elements}</div>;
}

function parseInline(text: string): string {
  return text
    // Bold
    .replace(/\*\*(.+?)\*\*/g, '<strong class="font-semibold text-white">$1</strong>')
    // Italic
    .replace(/\*(.+?)\*/g, '<em class="italic">$1</em>')
    // Code
    .replace(/`(.+?)`/g, '<code class="px-1.5 py-0.5 rounded bg-white/10 text-violet-300 text-xs font-mono">$1</code>');
}
