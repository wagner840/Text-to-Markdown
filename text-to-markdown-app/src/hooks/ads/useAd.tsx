"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { AdConfig, AdContent, AdState } from "@/types/ads";
import { AdService } from "@/lib/ads/adService";

interface UseAdOptions {
  loadingStrategy?: "eager" | "lazy" | "viewport";
  retryDelay?: number;
  maxRetries?: number;
  refreshInterval?: number;
}

interface UseAdReturn {
  state: AdState;
  adRef: React.RefObject<HTMLDivElement | null>;
  retryLoad: () => void;
  refresh: () => void;
  trackImpression: () => void;
  trackClick: () => void;
}

export function useAd(
  config: AdConfig,
  adService: AdService,
  options: UseAdOptions = {}
): UseAdReturn {
  const {
    loadingStrategy = "lazy",
    retryDelay = 2000,
    maxRetries = 3,
    refreshInterval,
  } = options;

  const [state, setState] = useState<AdState>({
    loading: false,
    error: null,
    content: null,
    retryCount: 0,
    lastLoaded: null,
    impressions: 0,
    clicks: 0,
  });

  const adRef = useRef<HTMLDivElement>(null);
  const impressionTracked = useRef(false);
  const refreshTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const retryTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);

  /**
   * Load ad content
   */
  const loadAd = useCallback(async () => {
    if (state.loading) return;

    setState((prev) => ({ ...prev, loading: true, error: null }));

    try {
      const content = await adService.loadAd(config);

      setState((prev) => ({
        ...prev,
        loading: false,
        content,
        lastLoaded: new Date(),
        retryCount: 0,
      }));
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to load ad";

      setState((prev) => ({
        ...prev,
        loading: false,
        error: errorMessage,
        retryCount: prev.retryCount + 1,
      }));

      // Retry logic
      if (state.retryCount < maxRetries) {
        retryTimeoutRef.current = setTimeout(() => {
          loadAd();
        }, retryDelay * Math.pow(2, state.retryCount)); // Exponential backoff
      }
    }
  }, [
    config,
    adService,
    state.loading,
    state.retryCount,
    maxRetries,
    retryDelay,
  ]);

  /**
   * Retry loading the ad
   */
  const retryLoad = useCallback(() => {
    setState((prev) => ({ ...prev, retryCount: 0 }));
    loadAd();
  }, [loadAd]);

  /**
   * Refresh the ad content
   */
  const refresh = useCallback(() => {
    adService.clearCache(config.id);
    setState((prev) => ({ ...prev, retryCount: 0 }));
    loadAd();
  }, [config.id, adService, loadAd]);

  /**
   * Track ad impression
   */
  const trackImpression = useCallback(() => {
    if (!impressionTracked.current && state.content) {
      adService.trackImpression(config.id);
      setState((prev) => ({ ...prev, impressions: prev.impressions + 1 }));
      impressionTracked.current = true;
    }
  }, [config.id, adService, state.content]);

  /**
   * Track ad click
   */
  const trackClick = useCallback(() => {
    if (state.content) {
      adService.trackClick(config.id);
      setState((prev) => ({ ...prev, clicks: prev.clicks + 1 }));
    }
  }, [config.id, adService, state.content]);

  /**
   * Set up intersection observer for lazy loading and impression tracking
   */
  useEffect(() => {
    if (!adRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;

        if (entry.isIntersecting) {
          // Load ad when it comes into view (for lazy loading)
          if (
            loadingStrategy === "viewport" &&
            !state.content &&
            !state.loading
          ) {
            loadAd();
          }

          // Track impression when ad is visible
          if (state.content && !impressionTracked.current) {
            // Wait a bit to ensure the user actually sees the ad
            setTimeout(trackImpression, 1000);
          }
        }
      },
      {
        threshold: 0.5, // Ad must be 50% visible
        rootMargin: "100px", // Start loading 100px before it's visible
      }
    );

    observer.observe(adRef.current);

    return () => {
      observer.disconnect();
    };
  }, [loadAd, trackImpression, loadingStrategy, state.content, state.loading]);

  /**
   * Initial load based on strategy
   */
  useEffect(() => {
    if (loadingStrategy === "eager") {
      loadAd();
    }
  }, [loadAd, loadingStrategy]);

  /**
   * Set up auto-refresh
   */
  useEffect(() => {
    if (refreshInterval && refreshInterval > 0) {
      refreshTimeoutRef.current = setTimeout(() => {
        refresh();
      }, refreshInterval * 60 * 1000); // Convert minutes to milliseconds
    }

    return () => {
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current);
      }
    };
  }, [refresh, refreshInterval, state.lastLoaded]);

  /**
   * Cleanup timeouts on unmount
   */
  useEffect(() => {
    return () => {
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
      }
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current);
      }
    };
  }, []);

  return {
    state,
    adRef,
    retryLoad,
    refresh,
    trackImpression,
    trackClick,
  };
}
