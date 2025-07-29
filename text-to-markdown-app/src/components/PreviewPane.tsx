"use client";

import { ReactElement } from "react";
import { cn } from "@/lib/utils";

interface PreviewPaneProps {
  markdown: string;
  format: "standard" | "gfm";
  isLoading?: boolean;
}

export function PreviewPane({
  markdown,
  format,
  isLoading,
}: PreviewPaneProps): ReactElement {
  if (isLoading) {
    return (
      <div className="w-full h-96 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-600 dark:text-gray-400">Converting...</p>
        </div>
      </div>
    );
  }

  if (!markdown) {
    return (
      <div className="w-full h-96 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg flex items-center justify-center">
        <p className="text-gray-500 dark:text-gray-400 text-center">
          The converted markdown will appear here
        </p>
      </div>
    );
  }

  return (
    <div className="w-full h-96 overflow-auto bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
      <div className="sticky top-0 bg-gray-100 dark:bg-gray-800 px-4 py-2 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
            {format === "gfm"
              ? "GitHub Flavored Markdown"
              : "Standard Markdown"}
          </span>
          <span className="text-xs text-gray-500 dark:text-gray-500">
            {markdown.length} characters
          </span>
        </div>
      </div>

      <div className="p-4">
        <pre
          className={cn(
            "text-sm font-mono leading-relaxed",
            "text-gray-800 dark:text-gray-200",
            "whitespace-pre-wrap break-words",
            "bg-transparent m-0 p-0"
          )}
        >
          {markdown}
        </pre>
      </div>
    </div>
  );
}
