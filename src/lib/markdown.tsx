import type { ReactNode } from "react";

/**
 * Tiny, dependency-free markdown-lite renderer for blog bodies.
 * Supports: `##`/`###` headings, blank-line paragraphs, `-`/`*` bullet lists,
 * `>` blockquotes, and inline `**bold**` + `[text](url)`.
 *
 * Text is rendered as React children (never dangerouslySetInnerHTML), so all
 * content is escaped by React — safe against injection. Links are restricted to
 * http(s)/mailto to avoid `javascript:` URIs.
 */

/** Estimate reading time from a body string (~200 words/min, floor 1). */
export function readingTime(body: string): string {
  const words = body.trim().split(/\s+/).filter(Boolean).length;
  const mins = Math.max(1, Math.round(words / 200));
  return `${mins} min read`;
}

const safeHref = (url: string): string | null => {
  const u = url.trim();
  return /^(https?:\/\/|mailto:|\/)/i.test(u) ? u : null;
};

/** Parse inline `**bold**` and `[text](url)` into React nodes. */
function renderInline(text: string, keyBase: string): ReactNode[] {
  const nodes: ReactNode[] = [];
  // Alternate on bold and links via a single tokenizer.
  const pattern = /\*\*([^*]+)\*\*|\[([^\]]+)\]\(([^)]+)\)/g;
  let last = 0;
  let m: RegExpExecArray | null;
  let i = 0;
  while ((m = pattern.exec(text)) !== null) {
    if (m.index > last) nodes.push(text.slice(last, m.index));
    if (m[1] !== undefined) {
      nodes.push(<strong key={`${keyBase}-b${i}`}>{m[1]}</strong>);
    } else {
      const href = safeHref(m[3]);
      nodes.push(
        href ? (
          <a
            key={`${keyBase}-l${i}`}
            href={href}
            className="font-medium text-brand-700 underline decoration-brand-300 underline-offset-2 hover:text-brand-800"
            {...(href.startsWith("http") ? { target: "_blank", rel: "noopener noreferrer" } : {})}
          >
            {m[2]}
          </a>
        ) : (
          m[2]
        )
      );
    }
    last = pattern.lastIndex;
    i++;
  }
  if (last < text.length) nodes.push(text.slice(last));
  return nodes;
}

/** Render markdown-lite into a list of block React nodes. */
export function renderMarkdown(md: string): ReactNode {
  const lines = md.replace(/\r\n/g, "\n").split("\n");
  const blocks: ReactNode[] = [];
  let para: string[] = [];
  let list: string[] = [];
  let quote: string[] = [];
  let k = 0;

  const flushPara = () => {
    if (para.length) {
      const key = `p${k++}`;
      blocks.push(<p key={key}>{renderInline(para.join(" "), key)}</p>);
      para = [];
    }
  };
  const flushList = () => {
    if (list.length) {
      const key = `ul${k++}`;
      blocks.push(
        <ul key={key} className="list-disc space-y-2 pl-6">
          {list.map((item, idx) => (
            <li key={`${key}-${idx}`}>{renderInline(item, `${key}-${idx}`)}</li>
          ))}
        </ul>
      );
      list = [];
    }
  };
  const flushQuote = () => {
    if (quote.length) {
      const key = `bq${k++}`;
      blocks.push(
        <blockquote
          key={key}
          className="border-l-4 border-brand-200 bg-brand-50/60 py-1 pl-5 pr-4 text-ink-800 italic"
        >
          {renderInline(quote.join(" "), key)}
        </blockquote>
      );
      quote = [];
    }
  };
  const flushAll = () => {
    flushPara();
    flushList();
    flushQuote();
  };

  for (const raw of lines) {
    const line = raw.trimEnd();
    if (!line.trim()) {
      flushAll();
      continue;
    }
    const h3 = line.match(/^###\s+(.*)$/);
    const h2 = line.match(/^##\s+(.*)$/);
    const bullet = line.match(/^[-*]\s+(.*)$/);
    const bq = line.match(/^>\s?(.*)$/);

    if (h3) {
      flushAll();
      const key = `h3${k++}`;
      blocks.push(
        <h3 key={key} className="pt-2 text-xl font-bold text-ink-900">
          {renderInline(h3[1], key)}
        </h3>
      );
    } else if (h2) {
      flushAll();
      const key = `h2${k++}`;
      blocks.push(
        <h2 key={key} className="pt-4 text-2xl font-bold text-ink-900">
          {renderInline(h2[1], key)}
        </h2>
      );
    } else if (bullet) {
      flushPara();
      flushQuote();
      list.push(bullet[1]);
    } else if (bq) {
      flushPara();
      flushList();
      quote.push(bq[1]);
    } else {
      flushList();
      flushQuote();
      para.push(line);
    }
  }
  flushAll();

  return <div className="space-y-6 text-lg leading-relaxed text-slate-700">{blocks}</div>;
}
