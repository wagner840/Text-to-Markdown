export interface AdConfig {
  id: string;
  provider: "google" | "mock" | "banner";
  size: AdSize;
  position: AdPosition;
  loadingStrategy: "eager" | "lazy" | "viewport";
  refreshInterval?: number; // in minutes
  maxRetries?: number;
}

export interface AdSize {
  width: number;
  height: number;
  responsive?: boolean;
}

export type AdPosition =
  | "header"
  | "sidebar"
  | "footer"
  | "content-top"
  | "content-bottom"
  | "floating";

export interface AdContent {
  id: string;
  title: string;
  description: string;
  imageUrl?: string;
  linkUrl?: string;
  cta?: string;
  provider: string;
  metadata?: Record<string, unknown>;
}

export interface AdState {
  loading: boolean;
  error: string | null;
  content: AdContent | null;
  retryCount: number;
  lastLoaded: Date | null;
  impressions: number;
  clicks: number;
}

export interface AdMetrics {
  impressions: number;
  clicks: number;
  ctr: number; // click-through rate
  loadTime: number;
  errors: number;
}

export interface AdProviderConfig {
  name: string;
  apiKey?: string;
  endpoint?: string;
  timeout?: number;
  fallbackContent?: AdContent;
}

export interface AdContext {
  configs: AdConfig[];
  states: Map<string, AdState>;
  metrics: Map<string, AdMetrics>;
  providers: Map<string, AdProviderConfig>;
  loadAd: (adId: string) => Promise<void>;
  trackImpression: (adId: string) => void;
  trackClick: (adId: string) => void;
  refreshAd: (adId: string) => Promise<void>;
}
