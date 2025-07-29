"use client";

import {
  ReactElement,
  ReactNode,
  createContext,
  useContext,
  useMemo,
} from "react";
import { AdService } from "@/lib/ads/adService";
import { AdConfig, AdProviderConfig } from "@/types/ads";

interface AdContextValue {
  adService: AdService;
  configs: AdConfig[];
}

const AdContext = createContext<AdContextValue | null>(null);

interface AdProviderProps {
  children: ReactNode;
  configs?: AdConfig[];
  providers?: AdProviderConfig[];
}

export function AdProvider({
  children,
  configs = [],
  providers = [],
}: AdProviderProps): ReactElement {
  const adService = useMemo(() => {
    // Create provider map
    const providerMap = new Map<string, AdProviderConfig>();

    // Add default providers
    const defaultProviders: AdProviderConfig[] = [
      {
        name: "mock",
        timeout: 5000,
        fallbackContent: {
          id: "fallback",
          title: "Content Unavailable",
          description:
            "Unable to load content at this time. Please try again later.",
          cta: "Retry",
          provider: "fallback",
        },
      },
      {
        name: "banner",
        timeout: 3000,
        fallbackContent: {
          id: "banner-fallback",
          title: "Upgrade Available",
          description: "Enhance your experience with premium features.",
          cta: "Learn More",
          provider: "internal",
        },
      },
      {
        name: "google",
        timeout: 10000,
        fallbackContent: {
          id: "google-fallback",
          title: "Advertisement",
          description: "Sponsored content will appear here.",
          cta: "Learn More",
          provider: "google",
        },
      },
    ];

    // Add custom providers
    [...defaultProviders, ...providers].forEach((provider) => {
      providerMap.set(provider.name, provider);
    });

    return new AdService(providerMap);
  }, [providers]);

  const value = useMemo(
    () => ({
      adService,
      configs,
    }),
    [adService, configs]
  );

  return <AdContext.Provider value={value}>{children}</AdContext.Provider>;
}

export function useAdContext(): AdContextValue {
  const context = useContext(AdContext);

  if (!context) {
    throw new Error("useAdContext must be used within an AdProvider");
  }

  return context;
}

// Pre-defined ad configurations for common use cases
export const defaultAdConfigs: AdConfig[] = [
  {
    id: "header-banner",
    provider: "banner",
    size: { width: 728, height: 90, responsive: true },
    position: "header",
    loadingStrategy: "eager",
    refreshInterval: 5,
  },
  {
    id: "sidebar-square",
    provider: "mock",
    size: { width: 300, height: 250, responsive: true },
    position: "sidebar",
    loadingStrategy: "viewport",
    refreshInterval: 3,
  },
  {
    id: "content-inline",
    provider: "mock",
    size: { width: 320, height: 100, responsive: true },
    position: "content-top",
    loadingStrategy: "lazy",
  },
  {
    id: "footer-banner",
    provider: "banner",
    size: { width: 970, height: 90, responsive: true },
    position: "footer",
    loadingStrategy: "viewport",
  },
  {
    id: "floating-cta",
    provider: "banner",
    size: { width: 200, height: 150, responsive: false },
    position: "floating",
    loadingStrategy: "lazy",
    maxRetries: 2,
  },
];

// Helper function to get a specific ad config
export function getAdConfig(
  id: string,
  configs: AdConfig[] = defaultAdConfigs
): AdConfig | undefined {
  return configs.find((config) => config.id === id);
}
