import { AdConfig, AdContent, AdProviderConfig, AdMetrics } from "@/types/ads";

export class AdService {
  private cache = new Map<string, { content: AdContent; expiry: number }>();
  private metrics = new Map<string, AdMetrics>();
  private abortControllers = new Map<string, AbortController>();

  constructor(
    private providers: Map<string, AdProviderConfig>,
    private defaultTimeout = 5000
  ) {}

  /**
   * Load ad content asynchronously with caching and fallbacks
   */
  async loadAd(config: AdConfig): Promise<AdContent> {
    const startTime = Date.now();

    // Check cache first
    const cached = this.cache.get(config.id);
    if (cached && cached.expiry > Date.now()) {
      this.updateMetrics(config.id, { loadTime: Date.now() - startTime });
      return cached.content;
    }

    // Cancel any existing request for this ad
    this.abortExistingRequest(config.id);

    // Create new abort controller
    const controller = new AbortController();
    this.abortControllers.set(config.id, controller);

    try {
      const content = await this.fetchAdContent(config, controller.signal);

      // Cache the result for 5 minutes
      this.cache.set(config.id, {
        content,
        expiry: Date.now() + 5 * 60 * 1000,
      });

      this.updateMetrics(config.id, {
        loadTime: Date.now() - startTime,
        errors: 0,
      });

      return content;
    } catch (error) {
      this.updateMetrics(config.id, {
        loadTime: Date.now() - startTime,
        errors: 1,
      });

      // Return fallback content on error
      return this.getFallbackContent(config);
    } finally {
      this.abortControllers.delete(config.id);
    }
  }

  /**
   * Track ad impression
   */
  trackImpression(adId: string): void {
    this.updateMetrics(adId, { impressions: 1 });

    // Send to analytics (in a real app, this would go to your analytics service)
    this.sendAnalytics("impression", adId);
  }

  /**
   * Track ad click
   */
  trackClick(adId: string): void {
    this.updateMetrics(adId, { clicks: 1 });

    // Send to analytics
    this.sendAnalytics("click", adId);
  }

  /**
   * Get metrics for an ad
   */
  getMetrics(adId: string): AdMetrics | null {
    return this.metrics.get(adId) || null;
  }

  /**
   * Clear cache for an ad (useful for refresh)
   */
  clearCache(adId: string): void {
    this.cache.delete(adId);
  }

  /**
   * Preload ad content in the background
   */
  async preloadAd(config: AdConfig): Promise<void> {
    try {
      await this.loadAd(config);
    } catch (error) {
      // Silent fail for preloading
      console.warn(`Failed to preload ad ${config.id}:`, error);
    }
  }

  private async fetchAdContent(
    config: AdConfig,
    signal: AbortSignal
  ): Promise<AdContent> {
    const provider = this.providers.get(config.provider);

    if (!provider) {
      throw new Error(`Unknown ad provider: ${config.provider}`);
    }

    // Simulate network delay and potential failures
    await this.delay(Math.random() * 2000);

    if (signal.aborted) {
      throw new Error("Request aborted");
    }

    // Mock ad content based on provider
    switch (config.provider) {
      case "google":
        return this.generateGoogleAd(config);
      case "banner":
        return this.generateBannerAd(config);
      case "mock":
      default:
        return this.generateMockAd(config);
    }
  }

  private generateMockAd(config: AdConfig): AdContent {
    const adTypes = [
      {
        title: "Boost Your Productivity",
        description:
          "Try our amazing productivity tools and increase your workflow efficiency by 300%!",
        cta: "Get Started Free",
        linkUrl: "https://example.com/productivity",
      },
      {
        title: "Learn Markdown in Minutes",
        description:
          "Master Markdown syntax with our interactive tutorial. Perfect for developers and writers.",
        cta: "Start Learning",
        linkUrl: "https://example.com/markdown-tutorial",
      },
      {
        title: "Code Editor Pro",
        description:
          "The ultimate code editor with AI assistance, syntax highlighting, and team collaboration.",
        cta: "Download Now",
        linkUrl: "https://example.com/code-editor",
      },
    ];

    const randomAd = adTypes[Math.floor(Math.random() * adTypes.length)];

    return {
      id: config.id,
      provider: config.provider,
      ...randomAd,
      imageUrl: `https://picsum.photos/${config.size.width}/${config.size.height}?random=${config.id}`,
      metadata: {
        size: config.size,
        position: config.position,
        loadedAt: new Date().toISOString(),
      },
    };
  }

  private generateGoogleAd(config: AdConfig): AdContent {
    return {
      id: config.id,
      provider: "google",
      title: "Google Ads",
      description: "Relevant ads powered by Google AdSense",
      cta: "Learn More",
      linkUrl: "https://www.google.com/adsense/",
      imageUrl: `https://picsum.photos/${config.size.width}/${config.size.height}?grayscale&random=${config.id}`,
      metadata: {
        size: config.size,
        provider: "Google AdSense",
      },
    };
  }

  private generateBannerAd(config: AdConfig): AdContent {
    return {
      id: config.id,
      provider: "banner",
      title: "Text to Markdown Pro",
      description:
        "Upgrade to Pro for advanced features, API access, and priority support!",
      cta: "Upgrade Now",
      linkUrl: "/pro",
      imageUrl: `https://picsum.photos/${config.size.width}/${config.size.height}?random=${config.id}`,
      metadata: {
        size: config.size,
        internal: true,
      },
    };
  }

  private getFallbackContent(config: AdConfig): AdContent {
    const provider = this.providers.get(config.provider);

    if (provider?.fallbackContent) {
      return { ...provider.fallbackContent, id: config.id };
    }

    return {
      id: config.id,
      provider: "fallback",
      title: "Content Loading...",
      description: "Please wait while we load relevant content for you.",
      cta: "Refresh",
      linkUrl: "#",
      metadata: { fallback: true },
    };
  }

  private abortExistingRequest(adId: string): void {
    const existingController = this.abortControllers.get(adId);
    if (existingController) {
      existingController.abort();
      this.abortControllers.delete(adId);
    }
  }

  private updateMetrics(adId: string, updates: Partial<AdMetrics>): void {
    const current = this.metrics.get(adId) || {
      impressions: 0,
      clicks: 0,
      ctr: 0,
      loadTime: 0,
      errors: 0,
    };

    const updated = {
      ...current,
      impressions: current.impressions + (updates.impressions || 0),
      clicks: current.clicks + (updates.clicks || 0),
      loadTime: updates.loadTime || current.loadTime,
      errors: current.errors + (updates.errors || 0),
    };

    // Calculate CTR
    updated.ctr =
      updated.impressions > 0
        ? (updated.clicks / updated.impressions) * 100
        : 0;

    this.metrics.set(adId, updated);
  }

  private async sendAnalytics(event: string, adId: string): Promise<void> {
    // In a real application, send to your analytics service
    // For now, just log to console
    console.log(`Analytics: ${event} for ad ${adId}`);

    // Example: send to Google Analytics, Mixpanel, etc.
    // await analytics.track(event, { adId, timestamp: Date.now() });
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
