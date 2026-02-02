import { Link } from "@tanstack/react-router";
import { cn } from "@/lib/utils";
import { ArrowUpRight } from "lucide-react";

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

export function Card({ children, className }: CardProps) {
  return (
    <article
      className={cn(
        "group relative flex flex-col rounded-lg border border-border p-6 transition-colors hover:border-accent/50",
        className,
      )}
    >
      {children}
    </article>
  );
}

interface CardTitleProps {
  href?: string;
  children: React.ReactNode;
  external?: boolean;
}

function CardTitle({ href, children, external = false }: CardTitleProps) {
  const className =
    "text-base font-semibold text-foreground group-hover:text-accent transition-colors";

  if (href) {
    if (external) {
      return (
        <h2 className={className}>
          <a href={href} target="_blank" rel="noopener noreferrer">
            <span className="absolute inset-0 z-10" />
            {children}
          </a>
        </h2>
      );
    }

    return (
      <h2 className={className}>
        <Link to={href}>
          <span className="absolute inset-0 z-10" />
          {children}
        </Link>
      </h2>
    );
  }

  return <h2 className={className}>{children}</h2>;
}

interface CardDescriptionProps {
  children: React.ReactNode;
}

function CardDescription({ children }: CardDescriptionProps) {
  return (
    <p className="mt-2 text-sm leading-relaxed text-muted line-clamp-3">
      {children}
    </p>
  );
}

interface CardEyebrowProps {
  children: React.ReactNode;
  as?: React.ElementType;
  dateTime?: string;
}

function CardEyebrow({
  children,
  as: Component = "p",
  dateTime,
}: CardEyebrowProps) {
  return (
    <Component
      className="mb-2 text-sm text-muted-foreground"
      {...(dateTime ? { dateTime } : {})}
    >
      {children}
    </Component>
  );
}

interface CardLinkProps {
  href: string;
  label: string;
  external?: boolean;
}

function CardLink({ href, label, external = true }: CardLinkProps) {
  return (
    <a
      href={href}
      className="mt-4 flex items-center gap-1 text-sm text-muted group-hover:text-accent transition-colors"
      target={external ? "_blank" : undefined}
      rel={external ? "noopener noreferrer" : undefined}
    >
      <span>{label}</span>
      <ArrowUpRight className="h-3 w-3" />
    </a>
  );
}

interface CardTagsProps {
  tags: string[];
}

function CardTags({ tags }: CardTagsProps) {
  return (
    <div className="mt-4 flex flex-wrap gap-2">
      {tags.map((tag) => (
        <span
          key={tag}
          className="rounded-full bg-border px-2.5 py-0.5 text-xs text-muted"
        >
          {tag}
        </span>
      ))}
    </div>
  );
}

Card.Title = CardTitle;
Card.Description = CardDescription;
Card.Eyebrow = CardEyebrow;
Card.Link = CardLink;
Card.Tags = CardTags;
