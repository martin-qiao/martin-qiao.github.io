import type { ReactNode } from "react";

function safeHref(value: string): string | null {
  if (value.startsWith("/") && !value.startsWith("//")) return value;
  if (value.startsWith("#")) return value;
  try {
    const url = new URL(value);
    if (url.protocol === "http:" || url.protocol === "https:" || url.protocol === "mailto:") {
      return url.toString();
    }
  } catch {
    return null;
  }
  return null;
}

function inline(text: string, keyPrefix: string): ReactNode[] {
  const nodes: ReactNode[] = [];
  const pattern = /(\*\*([^*]+)\*\*|\*([^*]+)\*|\[([^\]]+)\]\(([^)\s]+)\))/g;
  let last = 0;
  let index = 0;
  for (const match of text.matchAll(pattern)) {
    const start = match.index ?? 0;
    if (start > last) nodes.push(text.slice(last, start));
    if (match[2]) {
      nodes.push(<strong key={`${keyPrefix}-b-${index}`}>{match[2]}</strong>);
    } else if (match[3]) {
      nodes.push(<em key={`${keyPrefix}-e-${index}`}>{match[3]}</em>);
    } else if (match[4] && match[5]) {
      const href = safeHref(match[5]);
      nodes.push(
        href ? (
          <a key={`${keyPrefix}-a-${index}`} href={href} rel="noreferrer">
            {match[4]}
          </a>
        ) : (
          match[4]
        ),
      );
    }
    last = start + match[0].length;
    index += 1;
  }
  if (last < text.length) nodes.push(text.slice(last));
  return nodes;
}

export function Markdown({ source, className }: { source: string; className?: string }) {
  const blocks = source.replace(/\r\n/g, "\n").trim().split(/\n{2,}/);
  if (blocks.length === 0 || (blocks.length === 1 && blocks[0] === "")) return null;
  return (
    <>
      {blocks.map((block, index) => {
        const lines = block.split("\n");
        if (lines.every((line) => line.startsWith("- "))) {
          return (
            <ul key={index} className={className}>
              {lines.map((line, lineIndex) => (
                <li key={lineIndex}>{inline(line.slice(2), `${index}-${lineIndex}`)}</li>
              ))}
            </ul>
          );
        }
        return (
          <p key={index} className={className}>
            {lines.map((line, lineIndex) => (
              <span key={lineIndex}>
                {lineIndex > 0 ? <br /> : null}
                {inline(line, `${index}-${lineIndex}`)}
              </span>
            ))}
          </p>
        );
      })}
    </>
  );
}
