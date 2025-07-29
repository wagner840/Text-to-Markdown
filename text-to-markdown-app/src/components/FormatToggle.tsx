"use client";

import { ReactElement } from "react";
import * as Switch from "@radix-ui/react-switch";
import { Label } from "./ui/label";

interface FormatToggleProps {
  format: "standard" | "gfm";
  onFormatChange: (format: "standard" | "gfm") => void;
}

export function FormatToggle({
  format,
  onFormatChange,
}: FormatToggleProps): ReactElement {
  return (
    <div className="flex items-center space-x-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
      <Label
        htmlFor="format-toggle"
        className="text-sm font-medium text-gray-700 dark:text-gray-300"
      >
        Markdown Format:
      </Label>

      <div className="flex items-center space-x-2">
        <span
          className={`text-sm ${
            format === "standard"
              ? "text-blue-600 font-semibold"
              : "text-gray-500"
          }`}
        >
          Standard
        </span>

        <Switch.Root
          id="format-toggle"
          checked={format === "gfm"}
          onCheckedChange={(checked) =>
            onFormatChange(checked ? "gfm" : "standard")
          }
          className="relative inline-flex h-6 w-11 items-center rounded-full bg-gray-300 transition-colors data-[state=checked]:bg-blue-600"
        >
          <Switch.Thumb className="block h-5 w-5 rounded-full bg-white transition-transform data-[state=checked]:translate-x-5 data-[state=unchecked]:translate-x-0.5" />
        </Switch.Root>

        <span
          className={`text-sm ${
            format === "gfm" ? "text-blue-600 font-semibold" : "text-gray-500"
          }`}
        >
          GitHub Flavored
        </span>
      </div>

      <div className="ml-4 group relative">
        <button
          type="button"
          className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          aria-label="Information about formats"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </button>

        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block z-10">
          <div className="bg-gray-900 dark:bg-gray-700 text-white text-xs rounded-lg p-3 w-64 shadow-lg">
            <p className="font-semibold mb-1">Standard:</p>
            <p className="mb-2 opacity-90">Basic markdown syntax</p>

            <p className="font-semibold mb-1">GitHub Flavored (GFM):</p>
            <p className="opacity-90">
              Adds tasks, tables, @mentions, #refs, ~~strikethrough~~, emojis 😊
            </p>

            <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1">
              <div className="border-4 border-transparent border-t-gray-900 dark:border-t-gray-700"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
