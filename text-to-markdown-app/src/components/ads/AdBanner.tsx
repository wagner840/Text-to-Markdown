"use client";

import { ReactElement } from "react";
import type { AdConfig, AdContent } from "@/types/ads";
import { AdService } from "@/lib/ads/adService";
import { useAd } from "@/hooks/ads/useAd";
import { ExternalLink, RefreshCw, AlertCircle, Eye } from "lucide-react";
import { cn } from "@/lib/utils";

interface AdBannerProps {
  config: AdConfig;
  adService: AdService;
  className?: string;
  showMetrics?: boolean;
}

export function AdBanner({
  config,
  adService,
  className,
  showMetrics = false,
}: AdBannerProps): ReactElement {
  const { state, adRef, retryLoad, refresh, trackClick } = useAd(
    config,
    adService,
    {
      loadingStrategy: config.loadingStrategy,
      maxRetries: config.maxRetries,
      refreshInterval: config.refreshInterval,
    }
  );

  const handleAdClick = (linkUrl?: string) => {
    trackClick();
    if (linkUrl && linkUrl !== "#") {
      window.open(linkUrl, "_blank", "noopener,noreferrer");
    }
  };

  const renderContent = () => {
    if (state.loading) {
      return <LoadingPlaceholder config={config} />;
    }

    if (state.error && !state.content) {
      return (
        <ErrorPlaceholder
          error={state.error}
          onRetry={retryLoad}
          config={config}
        />
      );
    }

    if (state.content) {
      return (
        <AdContentComponent
          content={state.content}
          onClick={handleAdClick}
          config={config}
        />
      );
    }

    return <EmptyPlaceholder config={config} />;
  };

  return (
    <div
      ref={adRef}
      className={cn(
        "relative rounded-lg border overflow-hidden transition-all duration-300",
        "hover:shadow-md w-full",
        getPositionStyles(config.position),
        className
      )}
      style={{
        width: config.size.responsive ? "100%" : config.size.width,
        minHeight: config.size.height,
        maxWidth: config.size.responsive ? config.size.width : undefined,
        aspectRatio: config.size.responsive
          ? `${config.size.width} / ${config.size.height}`
          : undefined,
      }}
    >
      {renderContent()}
      {showMetrics && state.content && (
        <MetricsOverlay
          state={{
            impressions: state.impressions || 0,
            clicks: state.clicks || 0,
            error: state.error || undefined,
          }}
        />
      )}

      {/* Refresh button */}
      <button
        onClick={refresh}
        className="absolute top-2 right-2 p-1 rounded-full bg-white/80 hover:bg-white text-gray-600 hover:text-gray-800 transition-colors opacity-0 hover:opacity-100 group-hover:opacity-100"
        title="Refresh ad"
      >
        <RefreshCw className="w-3 h-3" />
      </button>
    </div>
  );
}

function LoadingPlaceholder({ config }: { config: AdConfig }): ReactElement {
  return (
    <div
      className="flex flex-col items-center justify-center p-6 bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400"
      style={{ minHeight: config.size.height }}
    >
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mb-3"></div>
      <p className="text-sm text-center">Loading content...</p>
      <p className="text-xs text-center mt-1 opacity-75">
        {config.size.width} × {config.size.height}
      </p>
    </div>
  );
}

function ErrorPlaceholder({
  error,
  onRetry,
  config,
}: {
  error: string;
  onRetry: () => void;
  config: AdConfig;
}): ReactElement {
  return (
    <div
      className="flex flex-col items-center justify-center p-6 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border-red-200 dark:border-red-800"
      style={{ minHeight: config.size.height }}
    >
      <AlertCircle className="w-6 h-6 mb-2" />
      <p className="text-sm text-center mb-3">Failed to load content</p>
      <p className="text-xs text-center mb-3 opacity-75">{error}</p>
      <button
        onClick={onRetry}
        className="px-3 py-1 bg-red-100 hover:bg-red-200 dark:bg-red-800 dark:hover:bg-red-700 text-red-700 dark:text-red-300 rounded text-xs transition-colors"
      >
        Retry
      </button>
    </div>
  );
}

function EmptyPlaceholder({ config }: { config: AdConfig }): ReactElement {
  return (
    <div
      className="flex flex-col items-center justify-center p-6 bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500"
      style={{ minHeight: config.size.height }}
    >
      <div className="w-8 h-8 bg-gray-300 dark:bg-gray-600 rounded mb-3"></div>
      <p className="text-sm text-center">Ad Space</p>
      <p className="text-xs text-center mt-1 opacity-75">
        {config.size.width} × {config.size.height}
      </p>
    </div>
  );
}

function AdContentComponent({
  content,
  onClick,
  config,
}: {
  content: AdContent;
  onClick: (linkUrl?: string) => void;
  config: AdConfig;
}): ReactElement {
  const isClickable = content.linkUrl && content.linkUrl !== "#";

  return (
    <div
      className={cn(
        "p-4 bg-white dark:bg-gray-800 h-full flex flex-col",
        isClickable &&
          "cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
      )}
      onClick={() => isClickable && onClick(content.linkUrl)}
      style={{ minHeight: config.size.height }}
    >
      {content.imageUrl && (
        <div className="mb-3 flex-shrink-0">
          <img
            src={content.imageUrl}
            alt={content.title}
            className="w-full h-20 object-cover rounded"
            loading="lazy"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = "none";
            }}
          />
        </div>
      )}

      <div className="flex-1 flex flex-col">
        <h3 className="font-semibold text-sm text-gray-900 dark:text-white mb-2 line-clamp-2">
          {content.title}
        </h3>

        <p className="text-xs text-gray-600 dark:text-gray-300 mb-3 flex-1 line-clamp-3">
          {content.description}
        </p>

        {content.cta && (
          <div className="mt-auto">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
              {content.cta}
              <ExternalLink className="w-3 h-3 ml-1" />
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

function MetricsOverlay({
  state,
}: {
  state: { impressions: number; clicks: number; error?: string };
}): ReactElement {
  return (
    <div className="absolute bottom-2 left-2 px-2 py-1 bg-black/75 text-white text-xs rounded backdrop-blur-sm">
      <div className="flex items-center gap-2">
        <span className="flex items-center gap-1">
          <Eye className="w-3 h-3" />
          {state.impressions}
        </span>
        {state.clicks > 0 && <span>👆 {state.clicks}</span>}
        {state.error && <span className="text-red-400">❌</span>}
      </div>
    </div>
  );
}

function getPositionStyles(position: string): string {
  switch (position) {
    case "floating":
      return ""; // Removido pois já está sendo aplicado no container
    case "header":
      return "mx-auto";
    case "footer":
      return "mx-auto";
    case "sidebar":
      return "w-full";
    case "content-top":
      return "mx-auto";
    case "content-bottom":
      return "mx-auto";
    default:
      return "mx-auto";
  }
}
