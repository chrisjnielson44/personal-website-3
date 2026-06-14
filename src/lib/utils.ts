/**
 * Utility function to merge class names
 * Simple implementation without external dependencies
 */
export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(" ");
}

/**
 * Format a date string to a human-readable format
 */
export function formatDate(dateString: string): string {
  const date = parseDate(dateString);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

/**
 * Format a date to show just month and year
 */
export function formatMonthYear(dateString: string): string {
  const date = parseDate(dateString);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
  });
}

/**
 * Get the current year
 */
export function getCurrentYear(): number {
  return new Date().getFullYear();
}

function parseDate(dateString: string): Date {
  const dateOnlyMatch = /^(\d{4})-(\d{2})(?:-(\d{2}))?$/.exec(dateString);

  if (!dateOnlyMatch) {
    return new Date(dateString);
  }

  const [, year, month, day = "1"] = dateOnlyMatch;
  return new Date(Number(year), Number(month) - 1, Number(day));
}
