# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a personal portfolio website built with TanStack Start, TanStack Router, React 19, TypeScript, Tailwind CSS v4, and Motion (Framer Motion). It features a minimalist, academic-style design with subtle animations, inspired by CS professor websites and t3.gg.

## Commands

### Development
```bash
npm run dev          # Start development server (http://localhost:3000)
npm run build        # Build for production
npm run preview      # Preview production build
npm run test         # Run tests with Vitest
```

## Architecture

### Directory Structure

- **`src/routes/`** - TanStack Router file-based routes
  - `__root.tsx` - Root layout with Header, Footer, and meta tags
  - `index.tsx` - Home page
  - `about.tsx` - About page with bio and skills
  - `projects.tsx` - Projects listing
  - `articles.tsx` - Articles listing
  - `articles/$slug.tsx` - Dynamic article page with MDX rendering

- **`src/components/`** - Reusable React components
  - `Header.tsx` - Minimal navigation header with animated nav underline
  - `Footer.tsx` - Footer with social links
  - `Container.tsx` - Centered max-width wrapper
  - `Card.tsx` - Card component with compound pattern (Card.Title, Card.Description, etc.)
  - `SocialIcons.tsx` - Social media icons with hover animations
  - `MDXComponents.tsx` - Custom styled components for MDX rendering
  - `Motion.tsx` - Reusable Motion animation components
  - `ArticleContent.tsx` - Client-side MDX renderer wrapper

- **`src/data/`** - Data access layer
  - `projects.ts` - Project information
  - `articles.ts` - Article helpers using content-collections
  - `experience.ts` - Work and education history
  - `social.ts` - Social media links

- **`content/articles/`** - MDX article files (processed by content-collections)

- **`src/lib/`** - Utility functions
  - `utils.ts` - Helpers like `cn()` for className merging, date formatting

- **`src/styles.css`** - Global styles with Tailwind CSS v4

- **`content-collections.ts`** - Configuration for content-collections (MDX processing)

### Key Architectural Patterns

**Routing:**
- File-based routing with TanStack Router
- Dynamic routes use `$param` syntax (e.g., `articles/$slug.tsx`)
- Route-level head() for SEO meta tags
- Route loaders for data fetching

**Styling:**
- Tailwind CSS v4 with CSS-first configuration
- Custom theme variables defined in `@theme` block
- Dark mode via `prefers-color-scheme` media query
- Color tokens: `--color-background`, `--color-foreground`, `--color-muted`, `--color-accent`, etc.

**Content Management:**
- MDX articles processed at build time via content-collections
- Type-safe article schema with Zod validation
- Automatic slug generation from file names
- Custom MDX components for styled rendering

**Component Patterns:**
- Compound components (e.g., Card.Title, Card.Description)
- `cn()` utility for conditional className merging
- TypeScript interfaces for props

**Animations (Motion):**
- Reusable animation components in `src/components/Motion.tsx`
- `PageTransition` - Wraps page content for enter animations
- `FadeIn` / `FadeInView` - Fade and slide up, optionally on viewport entry
- `Stagger` / `StaggerView` - Container for staggered child animations
- `StaggerItem` - Child items that animate in sequence
- `HoverLift` / `HoverScale` - Hover interaction effects
- `motion` re-exported for custom animations
- Animated nav underline follows active route (layoutId)
- Subtle hover effects on cards, links, tags, and social icons

**Path Aliasing:**
- `@/*` maps to `src/*` (configured in tsconfig.json and vite)
- `content-collections` maps to `.content-collections/generated`

## Tech Stack

- **Framework:** TanStack Start + TanStack Router v1
- **UI:** React 19, TypeScript
- **Styling:** Tailwind CSS v4 (with @tailwindcss/vite plugin)
- **Animations:** Motion (Framer Motion)
- **Content:** content-collections with MDX support
- **Build:** Vite 7
- **Icons:** Lucide React

## Adding New Content

### Adding an Article (MDX)

Create a new `.mdx` file in `content/articles/`:

```mdx
---
title: "Article Title"
description: "A brief description of the article"
date: "2024-06-15"
author: "Christopher Nielson"
tags: ["Tag1", "Tag2", "Tag3"]
published: true
---

Your article content here. You can use:

## Headings

Regular paragraphs with **bold** and *italic* text.

- Bullet lists
- With multiple items

```python
# Code blocks with syntax highlighting
def hello():
    print("Hello, world!")
```

> Blockquotes for emphasis

And [links](https://example.com) to external resources.
```

The file name becomes the article slug (e.g., `my-article.mdx` → `/articles/my-article`).

**Frontmatter Schema:**
- `title` (required): Article title
- `description` (required): Brief description for previews/SEO
- `date` (required): Publication date in YYYY-MM-DD format
- `author` (optional): Author name, defaults to "Christopher Nielson"
- `tags` (optional): Array of tag strings, defaults to []
- `published` (optional): Boolean, defaults to true. Set to false to hide from listings
- `image` (optional): Path to a cover image

### Adding a Project

Add to `src/data/projects.ts`:
```typescript
{
  name: "Project Name",
  description: "Project description",
  link: {
    href: "https://github.com/...",
    label: "github.com/project",
  },
  tags: ["React", "TypeScript"],
}
```

### Adding a New Route

Create a new file in `src/routes/`:
```typescript
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/route-path")({
  component: PageComponent,
  head: () => ({
    meta: [{ title: "Page Title - Christopher Nielson" }],
  }),
});

function PageComponent() {
  return <Container>...</Container>;
}
```

## MDX Features

Articles support full MDX with custom components:

- **Headings** (h1-h4): Properly styled with spacing
- **Paragraphs**: Readable line height and muted color
- **Links**: Underlined with accent color, external links open in new tab
- **Code blocks**: Dark background with `<pre>` styling
- **Inline code**: Subtle background with monospace font
- **Lists** (ul/ol): Proper indentation and spacing
- **Blockquotes**: Left border with italic text
- **Tables**: Bordered cells with alternating header
- **Images**: Lazy loading with rounded corners
- **Strong/Em**: Appropriate font weights

Custom components can be added to `src/components/MDXComponents.tsx`.

## Build Output

The `.content-collections` directory is auto-generated during build and contains:
- Type definitions for articles
- Compiled MDX content
- Generated collection data

This directory is gitignored and regenerated on each build.

## Design Principles

1. **Minimalist:** Focus on content, minimal decorative elements
2. **Typography-first:** Large, readable text with generous whitespace
3. **Monochrome + accent:** Black/white/zinc palette with blue accent
4. **Fast:** Minimal dependencies, optimized builds
5. **Dark mode:** Respects system preference
6. **Type-safe content:** Full TypeScript support for articles via content-collections