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
    <h1 className="mt-8 mb-4 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
      {children}
    </h1>
  ),
  h2: ({ children }: HeadingProps) => (
    <h2 className="mt-8 mb-4 text-2xl font-semibold tracking-tight text-foreground">
      {children}
    </h2>
  ),
  h3: ({ children }: HeadingProps) => (
    <h3 className="mt-6 mb-3 text-xl font-semibold text-foreground">
      {children}
    </h3>
  ),
  h4: ({ children }: HeadingProps) => (
    <h4 className="mt-4 mb-2 text-lg font-medium text-foreground">
      {children}
    </h4>
  ),
  p: ({ children }: { children?: ReactNode }) => (
    <p className="mb-4 leading-7 text-muted">{children}</p>
  ),
  a: ({ href, children }: LinkProps) => (
    <a
      href={href}
      className="font-medium text-accent underline underline-offset-4 transition-colors hover:text-accent/80"
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
        <code className="rounded bg-border px-1.5 py-0.5 font-mono text-sm text-foreground">
          {children}
        </code>
      );
    }
    // Code inside pre block - let pre handle styling
    return <code className={className}>{children}</code>;
  },
  pre: ({ children }: PreProps) => (
    <pre className="mb-4 overflow-x-auto rounded-lg bg-zinc-900 p-4 text-sm">
      {children}
    </pre>
  ),
  ul: ({ children }: ListProps) => (
    <ul className="mb-4 ml-6 list-disc space-y-2 text-muted">{children}</ul>
  ),
  ol: ({ children }: ListProps) => (
    <ol className="mb-4 ml-6 list-decimal space-y-2 text-muted">{children}</ol>
  ),
  li: ({ children }: { children?: ReactNode }) => (
    <li className="leading-7">{children}</li>
  ),
  blockquote: ({ children }: BlockquoteProps) => (
    <blockquote className="mb-4 border-l-4 border-accent pl-4 italic text-muted">
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
      className="my-4 rounded-lg"
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
