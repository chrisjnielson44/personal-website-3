import { type ReactNode } from "react";

// Custom components for MDX rendering
// These will be used to style the rendered markdown content

interface HeadingProps {
  children?: ReactNode;
}

interface LinkProps {
  href?: string;
  children?: ReactNode;
}

interface CodeProps {
  children?: ReactNode;
  className?: string;
}

interface PreProps {
  children?: ReactNode;
}

interface ListProps {
  children?: ReactNode;
}

interface BlockquoteProps {
  children?: ReactNode;
}

interface ImageProps {
  src?: string;
  alt?: string;
}

export const mdxComponents = {
  h1: ({ children }: HeadingProps) => (
    <h1 className="mt-12 mb-5 text-4xl leading-tight text-foreground sm:text-5xl">
      {children}
    </h1>
  ),
  h2: ({ children }: HeadingProps) => (
    <h2 className="mt-12 mb-5 border-t border-border pt-6 text-3xl leading-tight text-foreground">
      {children}
    </h2>
  ),
  h3: ({ children }: HeadingProps) => (
    <h3 className="mt-9 mb-4 text-2xl leading-tight text-foreground">
      {children}
    </h3>
  ),
  h4: ({ children }: HeadingProps) => (
    <h4 className="mt-7 mb-3 text-lg font-semibold text-foreground">
      {children}
    </h4>
  ),
  p: ({ children }: { children?: ReactNode }) => (
    <p className="mb-5 text-[1.05rem] leading-8 text-muted">{children}</p>
  ),
  a: ({ href, children }: LinkProps) => (
    <a
      href={href}
      className="font-medium text-foreground underline decoration-accent decoration-2 underline-offset-4 transition-colors hover:text-accent"
      target={href?.startsWith("http") ? "_blank" : undefined}
      rel={href?.startsWith("http") ? "noopener noreferrer" : undefined}
    >
      {children}
    </a>
  ),
  code: ({ children, className }: CodeProps) => {
    // Inline code (no className means it's not inside a pre block)
    if (!className) {
      return (
        <code className="bg-surface px-1.5 py-0.5 font-mono text-sm text-foreground">
          {children}
        </code>
      );
    }
    // Code inside pre block - let pre handle styling
    return <code className={className}>{children}</code>;
  },
  pre: ({ children }: PreProps) => (
    <pre className="mb-6 overflow-x-auto border-l-4 border-accent bg-foreground p-5 text-sm">
      {children}
    </pre>
  ),
  ul: ({ children }: ListProps) => (
    <ul className="mb-5 ml-6 list-disc space-y-2 text-[1.05rem] text-muted">{children}</ul>
  ),
  ol: ({ children }: ListProps) => (
    <ol className="mb-5 ml-6 list-decimal space-y-2 text-[1.05rem] text-muted">{children}</ol>
  ),
  li: ({ children }: { children?: ReactNode }) => (
    <li className="leading-7">{children}</li>
  ),
  blockquote: ({ children }: BlockquoteProps) => (
    <blockquote className="my-8 border-y border-foreground py-6 font-display text-2xl leading-snug text-foreground">
      {children}
    </blockquote>
  ),
  hr: () => <hr className="my-8 border-border" />,
  strong: ({ children }: { children?: ReactNode }) => (
    <strong className="font-semibold text-foreground">{children}</strong>
  ),
  em: ({ children }: { children?: ReactNode }) => (
    <em className="italic">{children}</em>
  ),
  img: ({ src, alt }: ImageProps) => (
    <img
      src={src}
      alt={alt}
      className="my-8 border border-border"
      loading="lazy"
    />
  ),
  table: ({ children }: { children?: ReactNode }) => (
    <div className="mb-4 overflow-x-auto">
      <table className="w-full border-collapse text-sm">{children}</table>
    </div>
  ),
  th: ({ children }: { children?: ReactNode }) => (
    <th className="border border-border bg-card px-4 py-2 text-left font-semibold text-foreground">
      {children}
    </th>
  ),
  td: ({ children }: { children?: ReactNode }) => (
    <td className="border border-border px-4 py-2 text-muted">{children}</td>
  ),
};

export default mdxComponents;
