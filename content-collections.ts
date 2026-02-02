import { defineCollection, defineConfig } from "@content-collections/core";
import { compileMDX } from "@content-collections/mdx";
import { z } from "zod";

const articles = defineCollection({
  name: "articles",
  directory: "content/articles",
  include: "**/*.mdx",
  schema: z.object({
    title: z.string(),
    description: z.string(),
    date: z.string(),
    author: z.string().optional().default("Christopher Nielson"),
    tags: z.array(z.string()).optional().default([]),
    published: z.boolean().optional().default(true),
    image: z.string().optional(),
    content: z.string(),
  }),
  transform: async (document, context) => {
    const mdx = await compileMDX(context, document, {
      rehypePlugins: [],
      remarkPlugins: [],
    });

    // Generate slug from filename (remove .mdx extension)
    const slug = document._meta.path;

    return {
      ...document,
      slug,
      mdx,
    };
  },
});

export default defineConfig({
  collections: [articles],
});
