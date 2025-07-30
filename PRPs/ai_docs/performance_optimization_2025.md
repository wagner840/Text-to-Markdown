# Performance Optimization 2025 - Context for Fast Web Apps

## Core Web Vitals Targets
- **LCP (Largest Contentful Paint)**: Under 2.5 seconds
- **INP (Interaction to Next Paint)**: Under 200 milliseconds
- **CLS (Cumulative Layout Shift)**: Under 0.1
- **Target**: Sub-500ms initial load for text-to-markdown app

## Next.js 15 Optimization Patterns

### Critical Resource Prioritization
```html
<!-- Preload critical resources -->
<link rel="preload" href="/critical.css" as="style">
<link rel="preload" href="/critical.js" as="script">
<link rel="preload" href="/font.woff2" as="font" type="font/woff2" crossorigin>

<!-- Use fetchpriority for LCP elements -->
<img src="hero.jpg" fetchpriority="high" alt="Hero">
```

### Service Worker Caching
```javascript
import { precacheAndRoute, cleanupOutdatedCaches } from 'workbox-precaching';
import { registerRoute } from 'workbox-routing';
import { StaleWhileRevalidate, CacheFirst } from 'workbox-strategies';

// Precache static assets
precacheAndRoute(self.__WB_MANIFEST);

// Cache markdown conversions
registerRoute(
  ({ url }) => url.pathname.startsWith('/api/convert'),
  new StaleWhileRevalidate({
    cacheName: 'markdown-conversions',
  })
);
```

### Next.js Config Optimization
```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    turbo: {
      rules: {
        '*.svg': { loaders: ['@svgr/webpack'], as: '*.js' }
      }
    }
  },
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920]
  },
  webpack: (config, { dev }) => {
    if (dev) {
      config.optimization.splitChunks = {
        chunks: 'all',
        cacheGroups: {
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            chunks: 'all'
          }
        }
      };
    }
    return config;
  }
};
```

## Ad Integration Without Performance Impact

### Async Ad Loading
```javascript
// Intersection Observer for ad lazy loading
const adObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const adSlot = entry.target;
      requestIdleCallback(() => {
        googletag.display(adSlot.id);
      });
      adObserver.unobserve(adSlot);
    }
  });
}, { rootMargin: '200px' });
```

### Header Bidding Optimization
```javascript
pbjs.setConfig({
  bidderTimeout: 1500,  // Reduced for faster loads
  enableSingleRequest: true,
  userSync: {
    syncsPerBidder: 3,
    syncDelay: 3000
  }
});
```

## Performance Monitoring
```javascript
import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals';

const sendToAnalytics = (metric) => {
  gtag('event', metric.name, {
    event_category: 'Web Vitals',
    value: Math.round(metric.name === 'CLS' ? metric.value * 1000 : metric.value),
    non_interaction: true
  });
};

getCLS(sendToAnalytics);
getLCP(sendToAnalytics);
getTTFB(sendToAnalytics);
```

## Critical Optimizations for Text-to-Markdown App
1. **Edge Runtime**: Use for conversion APIs
2. **Streaming**: Process large texts in chunks
3. **Web Workers**: Heavy text processing off main thread
4. **CDN**: Aggressive caching of converted results
5. **Bundle Splitting**: Separate ad code from core functionality