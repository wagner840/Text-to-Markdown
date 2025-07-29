"use client";

import { ReactElement } from "react";
import { AdBanner } from "./AdBanner";
import { getAdConfig, useAdContext } from "./AdProvider";

interface AdContainerProps {
  position:
    | "header"
    | "sidebar"
    | "content-top"
    | "content-bottom"
    | "footer"
    | "floating";
  className?: string;
  showMetrics?: boolean;
}

export function AdContainer({
  position,
  className = "border-gray-700",
  showMetrics = false,
}: AdContainerProps): ReactElement | null {
  const { adService } = useAdContext();

  let config;
  let containerClassName = "";

  switch (position) {
    case "header":
      config = getAdConfig("header-banner");
      containerClassName = "w-full flex justify-center py-4 px-4";
      break;
    case "sidebar":
      config = getAdConfig("sidebar-square");
      containerClassName = "w-full max-w-[300px] mx-auto";
      break;
    case "content-top":
      config = getAdConfig("content-inline");
      containerClassName = "w-full max-w-4xl mx-auto mb-8";
      break;
    case "content-bottom":
      config = {
        id: "content-bottom",
        provider: "mock" as const,
        size: { width: 728, height: 90, responsive: true },
        position: "content-bottom" as const,
        loadingStrategy: "viewport" as const,
      };
      containerClassName = "w-full max-w-4xl mx-auto mt-8";
      break;
    case "footer":
      config = getAdConfig("footer-banner");
      containerClassName = "w-full flex justify-center py-8 px-4";
      break;
    case "floating":
      config = getAdConfig("floating-cta");
      containerClassName = "fixed bottom-4 right-4 z-50 max-w-sm";
      className =
        "border-gray-700 bg-white dark:bg-gray-800 shadow-lg rounded-lg";
      break;
    default:
      return null;
  }

  if (!config) return null;

  return (
    <div className={containerClassName}>
      <AdBanner
        config={config}
        adService={adService}
        className={className}
        showMetrics={showMetrics}
      />
    </div>
  );
}
