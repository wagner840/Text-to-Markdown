# Markdown Libraries Research 2025 - Context for AI Implementation

## JavaScript/TypeScript Libraries Analysis

### Marked.js ⭐ RECOMMENDED for Performance
- **GitHub**: https://github.com/markedjs/marked
- **Documentation**: https://marked.js.org/
- **Performance**: Built specifically for speed, described as "⚡ built for speed"
- **TypeScript Support**: ✅ Full TypeScript support (36% of codebase)
- **Security Gotcha**: ⚠️ Does NOT sanitize HTML output - requires DOMPurify
- **Usage Pattern**:
```javascript
import { marked } from 'marked';
import DOMPurify from 'dompurify';

const html = DOMPurify.sanitize(marked(text));
```

### Markdown-it ⭐ Alternative for Extensibility
- **GitHub**: https://github.com/markdown-it/markdown-it
- **Performance**: Good balance of performance and features
- **Plugin Ecosystem**: Most extensive plugin architecture
- **Better Security**: Has built-in security options
- **Usage**:
```javascript
import MarkdownIt from 'markdown-it';
const md = new MarkdownIt({ html: false, breaks: true });
```

## Performance Benchmarks
- **Marked**: Fastest for simple conversion
- **Markdown-it**: Good performance with features
- **Showdown**: Fast for basic features
- **Remark**: Slower but most powerful

## Security Requirements
1. **Never trust markdown libraries alone** for XSS prevention
2. **Always use DOMPurify** for sanitization
3. **Disable HTML input**: `html: false` in options
4. **Validate file uploads**: type, size, content checks

## AI Optimization Patterns
- **Structure**: Use clear hierarchical headers
- **Formatting**: Consistent bullet points and code blocks
- **Context**: Include language tags for syntax highlighting
- **Length**: Process in chunks for large texts (>50KB)

## Implementation Gotchas
- Replace Unicode `U+0000` with replacement character `U+FFFD`
- Handle empty input gracefully
- Implement error boundaries for malformed markdown
- Cache conversion results with content hash keys
- Use streaming for large text processing

## Caching Strategy
```javascript
const LRU = require('lru-cache');
const cache = new LRU({ max: 500, ttl: 1000 * 60 * 10 });

function cachedMarkdownConvert(text) {
  const hash = crypto.createHash('md5').update(text).digest('hex');
  if (cache.has(hash)) return cache.get(hash);
  
  const result = DOMPurify.sanitize(marked(text));
  cache.set(hash, result);
  return result;
}
```

## GFM vs Standard Markdown
- **GFM**: GitHub Flavored Markdown with tables, strikethrough, task lists
- **Standard**: Original Markdown specification
- **CommonMark**: Standardized version removing ambiguities
- **Recommendation**: Offer both options with clear labeling