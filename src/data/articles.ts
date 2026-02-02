import { allArticles, type Article } from "content-collections";

// Re-export the Article type from content-collections
export type { Article };

/**
 * Get all published articles, sorted by date (newest first)
 */
export function getAllArticles(): Article[] {
  return allArticles
    .filter((article) => article.published)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

/**
 * Get a single article by its slug
 */
export function getArticleBySlug(slug: string): Article | undefined {
  return allArticles.find(
    (article) => article.slug === slug && article.published,
  );
}

/**
 * Get articles filtered by tag
 */
export function getArticlesByTag(tag: string): Article[] {
  return getAllArticles().filter((article) => article.tags.includes(tag));
}

/**
 * Get all unique tags from published articles
 */
export function getAllTags(): string[] {
  const tags = new Set<string>();
  getAllArticles().forEach((article) => {
    article.tags.forEach((tag) => tags.add(tag));
  });
  return Array.from(tags).sort();
}

/**
 * Format a date string for display
 */
export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}
