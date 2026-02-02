"use client";

import { MDXContent } from "@content-collections/mdx/react";
import { mdxComponents } from "./MDXComponents";
import { useEffect, useState } from "react";

interface ArticleContentProps {
  code: string;
}

export function ArticleContent({ code }: ArticleContentProps) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Don't render MDX on server - it uses eval/new Function which doesn't work in SSR
  if (!isMounted) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-4 bg-border rounded w-3/4"></div>
        <div className="h-4 bg-border rounded w-full"></div>
        <div className="h-4 bg-border rounded w-5/6"></div>
        <div className="h-4 bg-border rounded w-full"></div>
        <div className="h-4 bg-border rounded w-2/3"></div>
      </div>
    );
  }

  return <MDXContent code={code} components={mdxComponents} />;
}
