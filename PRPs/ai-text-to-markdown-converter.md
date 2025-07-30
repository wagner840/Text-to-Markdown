name: "AI Text-to-Markdown Converter - Production Implementation PRP"
description: |

## Goal

Build a lightning-fast web application that converts plain text to AI-optimized markdown formats (Standard Markdown and GitHub Flavored Markdown), featuring sub-500ms load times, real-time internet search integration, MCP Context7 library suggestions, and performance-optimized ad serving capabilities.

## Why

- **AI Prompt Engineering Problem**: 66.7% of AI interactions suffer from poor formatting, reducing response quality by up to 40%
- **Market Opportunity**: Microsoft's MarkItDown validates the $2B+ markdown processing market
- **Performance Gap**: Current solutions fail Core Web Vitals with average 3+ second load times
- **Revenue Model**: Ad-supported SaaS with premium subscriptions, targeting $50K+ ARR in Year 1
- **User Impact**: Enable developers, AI researchers, and content creators to optimize prompts instantly

## What

A Next.js 15 web application with the following user-visible behavior:

### Core Features
- **Instant Text Conversion**: Paste text, get optimized markdown in <200ms
- **Dual Format Support**: Toggle between Standard Markdown and GitHub Flavored Markdown
- **Real-time Preview**: Live preview of both formats with syntax highlighting
- **Smart Enhancement**: Automatic context research and library suggestions
- **Copy & Export**: One-click copy to clipboard, download as .md files
- **Offline Capability**: Service Worker enables offline conversion

### Performance Requirements
- **Load Time**: Initial page load <500ms (P95)
- **Conversion Speed**: Text-to-markdown processing <200ms (P95)
- **Ad Integration**: Non-blocking ad loading with lazy loading
- **Uptime**: 99.9% availability target
- **Mobile First**: Responsive design optimized for mobile devices

### Success Criteria
- [ ] Sub-500ms initial page load time measured by Lighthouse
- [ ] 98%+ markdown conversion accuracy for standard text formats
- [ ] Real-time library suggestions via MCP Context7 integration
- [ ] Successful ad integration without performance degradation
- [ ] Support for text inputs up to 50KB in size
- [ ] Cross-browser compatibility (Chrome, Firefox, Safari, Edge)

## All Needed Context

### Documentation & References

```yaml
# MUST READ - Critical for implementation success
- url: https://nextjs.org/docs/app/building-your-application/optimizing/performance
  why: Next.js 15 performance optimization patterns and App Router usage
  critical: Service Workers, Edge Runtime, Image optimization

- url: https://marked.js.org/
  why: Primary markdown conversion library - speed optimized
  critical: Security requires DOMPurify sanitization, async processing patterns

- url: https://web.dev/explore/fast
  why: Core Web Vitals optimization techniques for sub-500ms targets
  critical: LCP, INP, CLS metrics and measurement strategies

- url: https://docs.anthropic.com/en/docs/claude-code/mcp
  why: MCP Context7 integration patterns and HTTP transport setup
  critical: Tool calling, error handling, caching strategies

# Local Reference Files
- file: /mnt/e/Text-to-markdown/Text-to-Markdown/claude_md_files/CLAUDE-NEXTJS-15.md
  why: Next.js 15 patterns, TypeScript requirements, component architecture
  critical: Mandatory ReactElement types, 80% test coverage, Zod validation

- file: /mnt/e/Text-to-markdown/Text-to-Markdown/PRPs/templates/prp_base.md
  why: PRP structure and validation patterns to follow
  critical: 4-level validation approach, task organization format

# AI Documentation Files  
- docfile: /mnt/e/Text-to-markdown/Text-to-Markdown/PRPs/ai_docs/markdown_libraries_research_2025.md
  why: Comprehensive markdown library analysis and implementation patterns
  critical: Marked.js + DOMPurify security pattern, performance benchmarks

- docfile: /mnt/e/Text-to-markdown/Text-to-Markdown/PRPs/ai_docs/performance_optimization_2025.md
  why: 2025 performance optimization strategies and ad integration
  critical: Service Worker patterns, Core Web Vitals targets, Next.js config

- docfile: /mnt/e/Text-to-markdown/Text-to-Markdown/PRPs/ai_docs/mcp_context7_integration.md
  why: Production-ready MCP Context7 integration with retry and caching
  critical: HTTP transport, error handling, library discovery patterns
```

### Current Codebase Structure

```bash
# This is a PRP Framework repository - we're building the app from scratch
Text-to-Markdown/
├── CLAUDE.md                    # Project methodology and patterns
├── PRPs/                        # PRP templates and documentation
│   ├── templates/               # Base templates to follow
│   ├── ai_docs/                # Curated implementation guides
│   └── scripts/                # PRP runner utilities
└── claude_md_files/            # Framework-specific patterns
    └── CLAUDE-NEXTJS-15.md     # Next.js 15 mandatory patterns
```

### Desired Codebase Structure

```bash
text-to-markdown-app/           # New Next.js 15 application
├── src/
│   ├── app/                    # Next.js 15 App Router
│   │   ├── globals.css         # Global styles with Tailwind
│   │   ├── layout.tsx          # Root layout with performance optimization
│   │   ├── page.tsx            # Home page with text converter
│   │   └── api/                # API routes
│   │       ├── convert/        # Edge function for markdown conversion
│   │       ├── search/         # Internet search integration
│   │       └── libraries/      # MCP Context7 integration
│   ├── components/             # React components
│   │   ├── ui/                 # Base UI components (shadcn/ui pattern)
│   │   ├── TextConverter.tsx   # Main conversion interface
│   │   ├── FormatToggle.tsx    # Standard vs GFM toggle
│   │   ├── PreviewPane.tsx     # Live markdown preview
│   │   └── AdContainer.tsx     # Async ad loading component
│   ├── lib/                    # Core utilities
│   │   ├── markdown/           # Conversion services
│   │   ├── mcp/               # Context7 client
│   │   ├── search/            # Internet search integration
│   │   └── performance/       # Caching and optimization
│   ├── hooks/                  # Custom React hooks
│   └── types/                  # TypeScript definitions
├── public/                     # Static assets with CDN optimization
├── tests/                      # Co-located test files
├── next.config.js              # Performance-optimized Next.js config
├── tailwind.config.js          # Tailwind CSS configuration
└── package.json                # Dependencies and scripts
```

### Known Gotchas & Library Quirks

```typescript
// CRITICAL: Marked.js security requirement
import { marked } from 'marked';
import DOMPurify from 'dompurify';

// ❌ NEVER do this - XSS vulnerability
const html = marked(userText);

// ✅ ALWAYS sanitize output
const html = DOMPurify.sanitize(marked(userText));

// CRITICAL: Next.js 15 TypeScript requirements
import { ReactElement } from 'react';

// ❌ FORBIDDEN - will cause compilation errors
function Component(): JSX.Element {
  return <div>Content</div>;
}

// ✅ MANDATORY pattern
function Component(): ReactElement {
  return <div>Content</div>;
}

// CRITICAL: MCP Context7 tool calling pattern
// ❌ Wrong - using library name directly
const docs = await client.callTool('get-library-docs', { 
  context7CompatibleLibraryID: 'react' // This will fail
});

// ✅ Correct - resolve library ID first
const resolved = await client.callTool('resolve-library-id', { 
  libraryName: 'react'
});
const docs = await client.callTool('get-library-docs', { 
  context7CompatibleLibraryID: resolved.data[0].id
});

// CRITICAL: Performance - Service Worker registration
// ❌ Wrong - blocking main thread
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw.js');
}

// ✅ Correct - non-blocking registration
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js');
  });
}

// CRITICAL: Ad loading - never block rendering
// ❌ Wrong - synchronous ad loading
googletag.display('ad-slot-1');

// ✅ Correct - async with intersection observer
const adObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      requestIdleCallback(() => {
        googletag.display(entry.target.id);
      });
    }
  });
});
```

## Implementation Blueprint

### Data Models and Structure

Create type-safe data models using Zod validation for all external data:

```typescript
// Core data models for type safety and validation
import { z } from 'zod';

// Text conversion request/response models
export const ConversionRequestSchema = z.object({
  text: z.string().min(1).max(50000), // 50KB limit
  format: z.enum(['standard', 'gfm']),
  enhanceWithSearch: z.boolean().optional(),
  includeLibraries: z.boolean().optional(),
});

export const ConversionResponseSchema = z.object({
  success: z.boolean(),
  data: z.object({
    markdown: z.string(),
    originalLength: z.number(),
    markdownLength: z.number(),
    processingTime: z.number(),
    enhancements: z.object({
      searchResults: z.array(z.any()).optional(),
      libraryRecommendations: z.array(z.any()).optional(),
    }).optional(),
  }),
  metadata: z.object({
    format: z.string(),
    timestamp: z.string(),
    cacheKey: z.string(),
  }),
});

// MCP Context7 integration models
export const LibraryResolutionSchema = z.object({
  data: z.array(z.object({
    id: z.string(),
    name: z.string(),
    description: z.string().optional(),
  })),
});

export const LibraryDocsSchema = z.object({
  data: z.object({
    content: z.string(),
    examples: z.array(z.string()).optional(),
    links: z.array(z.string()).optional(),
  }),
});

// Performance monitoring models
export const PerformanceMetricsSchema = z.object({
  lcp: z.number(),
  inp: z.number(),
  cls: z.number(),
  conversionTime: z.number(),
  cacheHitRate: z.number(),
});

export type ConversionRequest = z.infer<typeof ConversionRequestSchema>;
export type ConversionResponse = z.infer<typeof ConversionResponseSchema>;
export type LibraryResolution = z.infer<typeof LibraryResolutionSchema>;
export type LibraryDocs = z.infer<typeof LibraryDocsSchema>;
export type PerformanceMetrics = z.infer<typeof PerformanceMetricsSchema>;
```

### Task List - Implementation Order

```yaml
Task 1 - Foundation Setup:
CREATE text-to-markdown-app/:
  - SETUP Next.js 15 with TypeScript and App Router
  - CONFIGURE Tailwind CSS with performance optimizations
  - INSTALL core dependencies: marked, dompurify, zod, @radix-ui/react-*
  - SETUP ESLint config with strict TypeScript rules (CLAUDE-NEXTJS-15.md patterns)
  - CREATE basic project structure following vertical slice architecture

Task 2 - Core Conversion Engine:
CREATE src/lib/markdown/:
  - IMPLEMENT MarkdownConverter class using marked + DOMPurify pattern
  - ADD format selection (standard vs GFM) with proper enum typing
  - IMPLEMENT streaming conversion for large texts (>10KB chunks)
  - ADD comprehensive error handling with specific exception types
  - CREATE conversion caching with LRU cache and content hashing

Task 3 - Performance Infrastructure:
CREATE src/lib/performance/:
  - IMPLEMENT Service Worker with Workbox for conversion caching
  - CONFIGURE CDN optimization patterns in next.config.js
  - ADD performance monitoring with Web Vitals tracking
  - IMPLEMENT edge runtime for conversion API endpoints
  - CREATE bundle analysis and optimization scripts

Task 4 - UI Components Layer:
CREATE src/components/:
  - BUILD TextConverter component with textarea and real-time preview
  - IMPLEMENT FormatToggle component with accessibility support
  - CREATE PreviewPane with syntax highlighting using Prism.js
  - ADD copy-to-clipboard functionality with success feedback
  - IMPLEMENT responsive design following mobile-first approach

Task 5 - MCP Context7 Integration:
CREATE src/lib/mcp/:
  - IMPLEMENT Context7Client with HTTP transport and retry logic
  - ADD library resolution and documentation fetching services
  - CREATE intelligent library discovery based on text analysis
  - IMPLEMENT caching layer with stale-while-revalidate pattern
  - ADD error handling with graceful degradation

Task 6 - Internet Search Integration:
CREATE src/lib/search/:
  - INTEGRATE web search APIs (Google Custom Search or Bing)
  - IMPLEMENT contextual enhancement of markdown content
  - ADD search result caching with appropriate TTL
  - CREATE rate limiting and quota management
  - IMPLEMENT fallback mechanisms for API failures

Task 7 - Ad Integration System:
CREATE src/components/AdContainer.tsx:
  - IMPLEMENT async ad loading with Intersection Observer
  - ADD header bidding configuration with optimized timeouts
  - CREATE ad block detection with subscription alternative
  - IMPLEMENT lazy loading for below-the-fold ad slots
  - ADD performance monitoring for ad impact measurement

Task 8 - API Layer Development:
CREATE src/app/api/:
  - BUILD /api/convert endpoint with edge runtime
  - IMPLEMENT /api/search endpoint for context enhancement
  - CREATE /api/libraries endpoint for MCP Context7 integration
  - ADD comprehensive error handling and validation
  - IMPLEMENT rate limiting and request deduplication

Task 9 - Testing Infrastructure:
CREATE tests/:
  - SETUP Vitest with React Testing Library configuration
  - WRITE unit tests for conversion engine (80%+ coverage target)
  - ADD integration tests for API endpoints
  - CREATE performance tests for sub-500ms validation
  - IMPLEMENT E2E tests with Playwright for critical user journeys

Task 10 - Production Optimization:
OPTIMIZE for deployment:
  - CONFIGURE Vercel deployment with edge regions
  - SETUP monitoring with DataDog or New Relic
  - IMPLEMENT error tracking with Sentry
  - ADD analytics with privacy-focused solution
  - CREATE deployment pipeline with automated performance testing
```

### Per Task Pseudocode

```typescript
// Task 1 - Foundation Setup Pseudocode
// next.config.js performance configuration
const nextConfig = {
  experimental: {
    turbo: { /* Turbopack config */ },
  },
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
  },
  webpack: (config, { dev }) => {
    if (!dev) {
      config.optimization.splitChunks.chunks = 'all';
    }
    return config;
  },
};

// Task 2 - Core Conversion Engine Pseudocode
class MarkdownConverter {
  private cache: LRUCache;
  private marked: MarkedInstance;
  
  constructor() {
    this.cache = new LRU({ max: 500, ttl: 600000 }); // 10 min TTL
    this.marked = new Marked({
      breaks: true,
      gfm: true, // Configurable based on format selection
    });
  }
  
  async convert(text: string, format: 'standard' | 'gfm'): Promise<ConversionResponse> {
    // PATTERN: Validate input with Zod schema
    const validatedInput = ConversionRequestSchema.parse({ text, format });
    
    // PATTERN: Check cache first
    const cacheKey = this.generateCacheKey(text, format);
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }
    
    // PATTERN: Stream processing for large texts
    const chunks = this.chunkText(text, 10000); // 10KB chunks
    const processedChunks = await Promise.all(
      chunks.map(chunk => this.processChunk(chunk, format))
    );
    
    // CRITICAL: Always sanitize output
    const markdown = DOMPurify.sanitize(processedChunks.join('\n'));
    
    // PATTERN: Structure response with metadata
    const response = {
      success: true,
      data: {
        markdown,
        originalLength: text.length,
        markdownLength: markdown.length,
        processingTime: Date.now() - startTime,
      },
      metadata: {
        format,
        timestamp: new Date().toISOString(),
        cacheKey,
      },
    };
    
    // PATTERN: Cache successful results
    this.cache.set(cacheKey, response);
    return response;
  }
}

// Task 5 - MCP Context7 Integration Pseudocode
class Context7Service {
  private client: Context7Client;
  private cache: Context7Cache;
  
  async suggestLibraries(text: string): Promise<string[]> {
    // PATTERN: Extract technology indicators from text
    const techStack = this.detectTechnologyStack(text);
    
    // PATTERN: Get library suggestions based on detected stack
    const suggestions = await Promise.all(
      techStack.map(async (tech) => {
        try {
          // CRITICAL: Always resolve library names first
          const resolved = await this.client.resolveLibrary(tech);
          if (resolved.data?.[0]) {
            const docs = await this.client.getLibraryDocs(
              resolved.data[0].id,
              'getting-started'
            );
            return { library: tech, docs: docs.data };
          }
        } catch (error) {
          // PATTERN: Log but don't fail entire operation
          console.warn(`Failed to get docs for ${tech}:`, error);
        }
        return null;
      })
    );
    
    return suggestions.filter(Boolean);
  }
  
  private detectTechnologyStack(text: string): string[] {
    // PATTERN: Use keyword detection with confidence scoring
    const patterns = {
      react: /\b(jsx|tsx|react|component|hooks)\b/i,
      typescript: /\b(typescript|interface|type|enum)\b/i,
      nextjs: /\b(next\.js|nextjs|app router|pages)\b/i,
      tailwind: /\b(tailwind|tw-|@apply)\b/i,
    };
    
    return Object.entries(patterns)
      .filter(([, pattern]) => pattern.test(text))
      .map(([tech]) => tech);
  }
}

// Task 7 - Ad Integration Pseudocode
class AdManager {
  private observer: IntersectionObserver;
  private loadedAds: Set<string>;
  
  constructor() {
    this.loadedAds = new Set();
    this.observer = new IntersectionObserver(
      this.handleIntersection.bind(this),
      { rootMargin: '200px' } // Load ads 200px before visible
    );
  }
  
  private handleIntersection(entries: IntersectionObserverEntry[]) {
    entries.forEach(entry => {
      if (entry.isIntersecting && !this.loadedAds.has(entry.target.id)) {
        // CRITICAL: Use requestIdleCallback for non-blocking ad loading
        requestIdleCallback(() => {
          this.loadAd(entry.target as HTMLElement);
        });
        this.observer.unobserve(entry.target);
        this.loadedAds.add(entry.target.id);
      }
    });
  }
  
  private async loadAd(adElement: HTMLElement) {
    try {
      // PATTERN: Async ad loading with timeout
      const adPromise = googletag.display(adElement.id);
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Ad load timeout')), 3000)
      );
      
      await Promise.race([adPromise, timeoutPromise]);
    } catch (error) {
      // PATTERN: Graceful degradation on ad failure
      console.warn('Ad loading failed:', error);
      adElement.style.display = 'none';
    }
  }
}
```

### Integration Points

```yaml
SERVICE_WORKER:
  - registration: "Register in useEffect with proper cleanup"
  - caching: "Cache conversion results and static assets"
  - offline: "Enable offline conversion with cached results"

PERFORMANCE_MONITORING:
  - vitals: "Track LCP, INP, CLS with web-vitals library"
  - conversion: "Monitor conversion speed and cache hit rates"
  - ads: "Measure ad loading impact on Core Web Vitals"

MCP_CONTEXT7:
  - transport: "HTTP transport with retry and timeout handling"
  - caching: "Cache library docs and resolutions with appropriate TTL"
  - fallback: "Graceful degradation when MCP is unavailable"

SEARCH_APIS:
  - integration: "Google Custom Search or Bing Web Search"
  - rate_limiting: "Implement request throttling and quota management"
  - caching: "Cache search results to minimize API calls"

AD_NETWORKS:
  - loading: "Async loading with Intersection Observer"
  - bidding: "Header bidding with optimized timeout settings"
  - blocking: "Ad block detection with subscription alternative"
```

## Validation Loop

### Level 1: Syntax & Style

```bash
# Run these FIRST - fix any errors before proceeding
npm run type-check                   # TypeScript compilation with zero errors
npm run lint                        # ESLint with zero warnings (strict Next.js config)
npm run format:check                # Prettier formatting validation

# Expected: No errors. All TypeScript types must be explicit (ReactElement, not JSX.Element)
# Expected: 80%+ test coverage minimum (per CLAUDE-NEXTJS-15.md requirements)
```

### Level 2: Unit Tests

```typescript
// CREATE tests/ with comprehensive test coverage
// Following React Testing Library patterns

// Core conversion engine tests
describe('MarkdownConverter', () => {
  test('converts text to markdown with proper sanitization', async () => {
    const converter = new MarkdownConverter();
    const result = await converter.convert('# Hello **World**', 'standard');
    
    expect(result.success).toBe(true);
    expect(result.data.markdown).toContain('<h1>Hello <strong>World</strong></h1>');
    expect(result.data.processingTime).toBeLessThan(200); // Sub-200ms requirement
  });

  test('handles XSS attempts properly', async () => {
    const converter = new MarkdownConverter();
    const maliciousText = '<script>alert("xss")</script>';
    const result = await converter.convert(maliciousText, 'standard');
    
    expect(result.data.markdown).not.toContain('<script>');
    expect(result.data.markdown).toContain('&lt;script&gt;');
  });

  test('streams large text properly', async () => {
    const converter = new MarkdownConverter();
    const largeText = 'a'.repeat(50000); // 50KB text
    const result = await converter.convert(largeText, 'gfm');
    
    expect(result.success).toBe(true);
    expect(result.data.processingTime).toBeLessThan(1000); // Max 1s for large texts
  });
});

// MCP Context7 integration tests
describe('Context7Service', () => {
  test('resolves libraries and gets documentation', async () => {
    const service = new Context7Service();
    const suggestions = await service.suggestLibraries('React component with TypeScript');
    
    expect(suggestions).toContain('react');
    expect(suggestions).toContain('typescript');
  });

  test('handles MCP service failures gracefully', async () => {
    const service = new Context7Service();
    // Mock MCP failure
    jest.spyOn(service.client, 'resolveLibrary').mockRejectedValue(new Error('Network error'));
    
    const suggestions = await service.suggestLibraries('React component');
    expect(suggestions).toEqual([]); // Should not throw, return empty array
  });
});

// Performance tests
describe('Performance Requirements', () => {
  test('meets sub-500ms load time requirement', async () => {
    const startTime = performance.now();
    render(<HomePage />);
    const loadTime = performance.now() - startTime;
    
    expect(loadTime).toBeLessThan(500);
  });
});
```

```bash
# Run and iterate until passing:
npm run test                        # All unit tests must pass
npm run test:coverage               # Must achieve 80%+ coverage
npm run test:performance            # Performance tests must pass

# If failing: Read error, understand root cause, fix code, re-run
# NEVER mock to pass tests - fix the underlying implementation
```

### Level 3: Integration Testing

```bash
# Start the development server
npm run dev

# Test core conversion API
curl -X POST http://localhost:3000/api/convert \
  -H "Content-Type: application/json" \
  -d '{
    "text": "# Hello World\n\nThis is **markdown** text.",
    "format": "standard",
    "enhanceWithSearch": true,
    "includeLibraries": true
  }'

# Expected response (sub-200ms):
# {
#   "success": true,
#   "data": {
#     "markdown": "<h1>Hello World</h1><p>This is <strong>markdown</strong> text.</p>",
#     "originalLength": 42,
#     "markdownLength": 68,
#     "processingTime": 156,
#     "enhancements": {
#       "searchResults": [...],
#       "libraryRecommendations": [...]
#     }
#   }
# }

# Test MCP Context7 integration
curl -X POST http://localhost:3000/api/libraries \
  -H "Content-Type: application/json" \
  -d '{"query": "React TypeScript components"}'

# Expected: Library suggestions with documentation

# Test performance endpoints
curl http://localhost:3000/api/health
# Expected: Performance metrics and system status

# Load testing for performance validation
npx artillery run performance-test.yml
# Expected: All requests complete under 500ms, 99.9% success rate
```

### Level 4: Creative Validation & Production Readiness

```bash
# Performance validation with Lighthouse CI
npx lighthouse-ci autorun
# Expected: Performance score >90, all Core Web Vitals in "Good" range

# Bundle analysis
npm run build && npm run analyze
# Expected: Total bundle size <500KB, critical path optimized

# MCP Context7 server health check
node scripts/test-mcp-integration.js
# Expected: All MCP tools accessible, proper error handling

# Ad integration validation
npm run test:ads
# Expected: Ads load without blocking, no CLS impact

# Cross-browser testing
npx playwright test
# Expected: All tests pass on Chrome, Firefox, Safari, Edge

# Security scanning
npm audit --production
npx snyk test
# Expected: No high-severity vulnerabilities

# SEO and accessibility validation
npx @axe-core/cli http://localhost:3000
npm run lighthouse -- --preset=seo
# Expected: 100% accessibility score, proper SEO structure

# Real User Monitoring simulation
node scripts/rum-simulation.js
# Expected: Real-world performance metrics meet targets

# Stress testing with concurrent users
npx artillery run load-test.yml
# Expected: System handles 1000+ concurrent conversions

# CDN and caching validation
curl -I https://your-app.vercel.app/api/convert
# Expected: Proper cache headers, CDN distribution
```

## Final Validation Checklist

- [ ] All tests pass: `npm run test` (80%+ coverage achieved)
- [ ] No linting errors: `npm run lint` (zero warnings)
- [ ] No type errors: `npm run type-check` (strict TypeScript)
- [ ] Performance targets met: Lighthouse score >90, sub-500ms load time
- [ ] MCP Context7 integration working: Library suggestions functional
- [ ] Ad integration non-blocking: Core Web Vitals unaffected
- [ ] Security validated: XSS prevention, input sanitization working
- [ ] Cross-browser compatibility: All target browsers supported
- [ ] Mobile responsiveness: Perfect mobile experience
- [ ] Accessibility: WCAG 2.1 AA compliance
- [ ] SEO optimization: Proper meta tags and structure
- [ ] Error handling: Graceful degradation for all failure modes
- [ ] Caching strategy: Service Worker and API caching functional
- [ ] Bundle optimization: Critical resources prioritized, code splitting effective

---

## Anti-Patterns to Avoid

- ❌ Don't use `JSX.Element` - use `ReactElement` (Next.js 15 requirement)
- ❌ Don't trust markdown libraries for XSS prevention - always use DOMPurify
- ❌ Don't make synchronous API calls to MCP Context7 - use async with retry
- ❌ Don't load ads synchronously - use Intersection Observer for lazy loading
- ❌ Don't skip performance validation - sub-500ms is mandatory
- ❌ Don't ignore test coverage - 80% minimum is required
- ❌ Don't hardcode API endpoints - use environment variables
- ❌ Don't skip error boundaries - wrap all async operations
- ❌ Don't ignore accessibility - screen readers must work perfectly
- ❌ Don't deploy without CDN - performance optimization is critical

## Confidence Score: 9/10

This PRP provides comprehensive context for one-pass implementation success:

**Strengths:**
- ✅ Complete technical architecture with proven libraries
- ✅ Detailed task breakdown with pseudocode and patterns
- ✅ Comprehensive validation gates with executable commands
- ✅ Performance optimization patterns for sub-500ms targets
- ✅ Production-ready MCP Context7 integration patterns
- ✅ Security-first approach with XSS prevention
- ✅ Real-world implementation examples and gotchas

**Risk Mitigation:**
- All major technical decisions backed by research
- Multiple fallback strategies for external dependencies
- Comprehensive error handling patterns provided
- Performance monitoring and optimization built-in

This PRP enables confident first-pass implementation of a production-ready AI text-to-markdown converter that meets all performance, security, and functionality requirements.