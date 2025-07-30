# MCP Context7 Integration Patterns - Implementation Guide

## Core Architecture
Model Context Protocol (MCP) by Anthropic standardizes AI-external tool connections.
Context7 provides real-time, version-specific documentation and library suggestions.

## Available Tools
1. **resolve-library-id**: Converts library names to Context7-compatible IDs
2. **get-library-docs**: Fetches current documentation for libraries

## HTTP Transport Implementation
```typescript
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { SSEClientTransport } from '@modelcontextprotocol/sdk/client/sse.js';

class Context7Client {
  private client: Client;
  private transport: SSEClientTransport;

  constructor() {
    this.transport = new SSEClientTransport(
      new URL('https://mcp.context7.com/mcp')
    );
    this.client = new Client({
      name: 'text-to-markdown-app',
      version: '1.0.0'
    }, {
      capabilities: { tools: {} }
    });
  }

  async resolveLibrary(libraryName: string): Promise<any> {
    const result = await this.client.callTool({
      name: 'resolve-library-id',
      arguments: { libraryName }
    });
    return result;
  }

  async getLibraryDocs(libraryId: string, topic?: string): Promise<any> {
    const result = await this.client.callTool({
      name: 'get-library-docs',
      arguments: { 
        context7CompatibleLibraryID: libraryId,
        ...(topic && { topic })
      }
    });
    return result;
  }
}
```

## Error Handling with Retry
```typescript
class Context7ClientWithRetry {
  async _retry_with_backoff(operation: Function, ...args: any[]): Promise<any> {
    const maxRetries = 3;
    let lastException: Error;
    
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        return await operation(...args);
      } catch (e) {
        lastException = e as Error;
        
        if (!this._should_retry(e, attempt)) break;
        
        if (attempt < maxRetries) {
          const delay = Math.min(1000 * (2 ** attempt), 60000);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }
    
    throw lastException!;
  }

  _should_retry(error: any, attempt: number): boolean {
    if (attempt >= 3) return false;
    
    const errorMsg = String(error).toLowerCase();
    return errorMsg.includes('connection') || 
           errorMsg.includes('timeout') || 
           errorMsg.includes('rate limit');
  }
}
```

## Caching Strategy
```typescript
interface CacheEntry {
  data: any;
  timestamp: number;
  ttl: number;
}

class Context7Cache {
  private cache = new Map<string, CacheEntry>();
  
  async getOrSet(key: string, fetchFn: Function, ttl = 3600): Promise<any> {
    const entry = this.cache.get(key);
    
    if (entry && (Date.now() - entry.timestamp) < entry.ttl * 1000) {
      return entry.data;
    }
    
    const data = await fetchFn();
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    });
    
    return data;
  }
  
  generateKey(operation: string, params: Record<string, any>): string {
    const keyData = { operation, ...params };
    return btoa(JSON.stringify(keyData));
  }
}
```

## Library Discovery for Text Processing
```typescript
class LibraryDiscoveryService {
  constructor(private client: Context7ClientWithRetry) {}

  async suggestLibrariesForText(text: string): Promise<string[]> {
    const detectedTech = this.detectTechnology(text);
    const suggestions: string[] = [];
    
    // Based on detected patterns
    if (detectedTech.includes('react')) {
      suggestions.push('react-markdown', 'remark', '@types/react');
    }
    if (detectedTech.includes('typescript')) {
      suggestions.push('marked', '@types/marked', 'dompurify');
    }
    if (detectedTech.includes('performance')) {
      suggestions.push('workbox', 'next-bundle-analyzer');
    }
    
    return suggestions;
  }
  
  private detectTechnology(text: string): string[] {
    const patterns = {
      react: /\b(jsx|tsx|react|component)\b/i,
      typescript: /\b(typescript|interface|type)\b/i,
      performance: /\b(performance|optimization|cache)\b/i,
      markdown: /\b(markdown|md|heading|bold)\b/i
    };
    
    const detected: string[] = [];
    for (const [tech, pattern] of Object.entries(patterns)) {
      if (pattern.test(text)) {
        detected.push(tech);
      }
    }
    
    return detected;
  }
}
```

## Integration with Text-to-Markdown App
```typescript
// Usage in the markdown conversion flow
export class EnhancedMarkdownConverter {
  constructor(
    private context7Client: Context7ClientWithRetry,
    private libraryDiscovery: LibraryDiscoveryService
  ) {}

  async convertWithEnhancements(text: string): Promise<{
    markdown: string;
    suggestions: any[];
    libraries: string[];
  }> {
    // Convert to markdown
    const markdown = this.convertToMarkdown(text);
    
    // Get library suggestions
    const libraries = await this.libraryDiscovery.suggestLibrariesForText(text);
    
    // Get detailed documentation for suggestions
    const suggestions = await Promise.all(
      libraries.slice(0, 3).map(async (lib) => {
        try {
          const resolved = await this.context7Client.resolveLibrary(lib);
          if (resolved.data?.[0]) {
            const docs = await this.context7Client.getLibraryDocs(
              resolved.data[0].id,
              'getting-started'
            );
            return { library: lib, docs: docs.data };
          }
        } catch (error) {
          console.warn(`Failed to get docs for ${lib}:`, error);
        }
        return null;
      })
    );

    return {
      markdown,
      suggestions: suggestions.filter(Boolean),
      libraries
    };
  }
}
```

## Production Configuration
- **Endpoints**: Primary `https://mcp.context7.com/mcp`, Fallback `https://context7.liam.sh/mcp`
- **Rate Limiting**: Built-in with exponential backoff
- **Caching**: 1-hour TTL for library docs, 2-hour for library resolution
- **Error Handling**: Graceful degradation with offline fallback
- **Security**: No authentication required for public endpoints

## Critical Gotchas
1. **Always resolve library names** before getting docs
2. **Implement proper retry logic** for network failures  
3. **Cache aggressively** to avoid rate limits
4. **Handle empty responses** gracefully
5. **Use meaningful topics** for better doc filtering