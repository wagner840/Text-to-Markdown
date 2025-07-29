import { marked } from "marked";
import DOMPurify from "isomorphic-dompurify";
import { LRUCache } from "lru-cache";
import { ConversionRequestSchema, ConversionResponse } from "@/types";

export class MarkdownConverter {
  private cache: LRUCache<string, ConversionResponse>;
  private marked: typeof marked;

  constructor() {
    // Configure LRU cache with 500 items max and 10 min TTL
    this.cache = new LRUCache<string, ConversionResponse>({
      max: 500,
      ttl: 600000, // 10 minutes
    });

    // Configure marked instance
    this.marked = marked;
    this.marked.setOptions({
      breaks: true,
      gfm: true,
    });
  }

  /**
   * Generate cache key based on text and format
   */
  private async generateCacheKey(
    text: string,
    format: string
  ): Promise<string> {
    // Use Web Crypto API for Edge Runtime compatibility
    const encoder = new TextEncoder();
    const data = encoder.encode(text + format);
    const hashBuffer = await crypto.subtle.digest("SHA-256", data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
    return hashHex;
  }

  /**
   * Chunk large text for streaming processing
   */
  private chunkText(text: string, chunkSize: number = 10000): string[] {
    const chunks: string[] = [];
    for (let i = 0; i < text.length; i += chunkSize) {
      chunks.push(text.slice(i, i + chunkSize));
    }
    return chunks;
  }

  /**
   * Process a single chunk of text
   */
  private async processChunk(
    chunk: string,
    format: "standard" | "gfm"
  ): Promise<string> {
    // Configure marked based on format
    this.marked.setOptions({
      gfm: format === "gfm",
    });

    // Parse markdown
    const html = await this.marked.parse(chunk);

    // CRITICAL: Always sanitize output
    return DOMPurify.sanitize(html);
  }

  /**
   * Convert text to markdown with sanitization
   */
  async convert(
    text: string,
    format: "standard" | "gfm"
  ): Promise<ConversionResponse> {
    const startTime = Date.now();

    try {
      // Validate input
      const validatedInput = ConversionRequestSchema.parse({ text, format });

      // Check cache first
      const cacheKey = await this.generateCacheKey(text, format);
      const cached = this.cache.get(cacheKey);
      if (cached) {
        return cached;
      }

      // Stream processing for large texts
      const chunks = this.chunkText(text, 10000); // 10KB chunks
      const processedChunks = await Promise.all(
        chunks.map((chunk) => this.processChunk(chunk, format))
      );

      // Join processed chunks
      const markdown = processedChunks.join("\n");

      // Structure response with metadata
      const response: ConversionResponse = {
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

      // Cache successful results
      this.cache.set(cacheKey, response);

      return response;
    } catch (error) {
      return {
        success: false,
        data: {
          markdown: "",
          originalLength: text.length,
          markdownLength: 0,
          processingTime: Date.now() - startTime,
        },
        metadata: {
          format,
          timestamp: new Date().toISOString(),
          cacheKey: "",
        },
      };
    }
  }

  /**
   * Clear the cache
   */
  clearCache(): void {
    this.cache.clear();
  }

  /**
   * Get cache statistics
   */
  getCacheStats() {
    return {
      size: this.cache.size,
      maxSize: this.cache.max,
      calculatedSize: this.cache.calculatedSize,
    };
  }
}
