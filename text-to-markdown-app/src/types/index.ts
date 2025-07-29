import { z } from "zod";

// Core data models for type safety and validation

// Text conversion request/response models
export const ConversionRequestSchema = z.object({
  text: z.string().min(1).max(50000), // 50KB limit
  format: z.enum(["standard", "gfm"]),
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
    enhancements: z
      .object({
        searchResults: z.array(z.any()).optional(),
        libraryRecommendations: z.array(z.any()).optional(),
      })
      .optional(),
  }),
  metadata: z.object({
    format: z.string(),
    timestamp: z.string(),
    cacheKey: z.string(),
  }),
});

// MCP Context7 integration models
export const LibraryResolutionSchema = z.object({
  data: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
      description: z.string().optional(),
    })
  ),
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
