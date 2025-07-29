"use client";

export class ClientMarkdownConverter {
  constructor() {
    // No need for marked.js here since we're converting TO markdown, not FROM markdown
  }

  convert(text: string, format: "standard" | "gfm"): string {
    if (!text || typeof text !== "string") {
      return "";
    }

    try {
      // Clean up the input text
      const cleaned = this.cleanText(text);

      // Apply text-to-markdown conversion rules
      const markdown = this.textToMarkdown(cleaned, format);

      return markdown;
    } catch (error) {
      console.error("Conversion error:", error);
      return text; // Return original text on error
    }
  }

  private cleanText(text: string): string {
    // Remove excessive whitespace and normalize line endings
    return text
      .replace(/\r\n/g, "\n") // Normalize line endings
      .replace(/\r/g, "\n") // Handle old Mac line endings
      .replace(/\n{3,}/g, "\n\n") // Limit consecutive line breaks
      .trim();
  }

  private textToMarkdown(text: string, format: "standard" | "gfm"): string {
    let result = text;

    // 1. Convert URLs to markdown links
    result = this.convertUrls(result);

    // 2. Convert email addresses to mailto links
    result = this.convertEmails(result);

    // 3. Detect and convert lists
    result = this.convertLists(result, format);

    // 4. Convert headings (lines that look like titles)
    result = this.convertHeadings(result);

    // 5. Convert emphasis patterns
    result = this.convertEmphasis(result, format);

    // 6. Convert code patterns
    result = this.convertCode(result, format);

    // 7. Convert quotes to blockquotes
    result = this.convertBlockquotes(result);

    // 8. GFM specific conversions (only for GitHub Flavored Markdown)
    if (format === "gfm") {
      result = this.convertGfmFeatures(result);
    }

    // 9. Format paragraphs properly
    result = this.formatParagraphs(result);

    return result;
  }

  private convertUrls(text: string): string {
    // Convert URLs to markdown links
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    return text.replace(urlRegex, "[$1]($1)");
  }

  private convertEmails(text: string): string {
    // Convert email addresses to mailto links
    const emailRegex = /([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/g;
    return text.replace(emailRegex, "[$1](mailto:$1)");
  }

  private convertLists(text: string, format: "standard" | "gfm"): string {
    const lines = text.split("\n");
    const result: string[] = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();

      // Detect numbered lists (1. 2. 3. or 1) 2) 3))
      if (/^\d+[\.\)]\s+/.test(line)) {
        const content = line.replace(/^\d+[\.\)]\s+/, "");
        const number = line.match(/^(\d+)/)?.[1] || "1";
        result.push(`${number}. ${content}`);
      }
      // Detect bullet points (-, *, •, etc.)
      else if (/^[-*•]\s+/.test(line)) {
        const content = line.replace(/^[-*•]\s+/, "");
        result.push(`- ${content}`);
      }
      // Detect lines that start with "First:", "Second:", etc.
      else if (
        /^(first|second|third|fourth|fifth|sixth|seventh|eighth|ninth|tenth)[:.]?\s+/i.test(
          line
        )
      ) {
        const content = line.replace(
          /^(first|second|third|fourth|fifth|sixth|seventh|eighth|ninth|tenth)[:.]?\s+/i,
          ""
        );
        result.push(`1. ${content}`);
      }
      // GFM: Detect task-like patterns
      else if (format === "gfm" && this.isTaskLine(line)) {
        result.push(this.convertToTaskList(line));
      } else {
        result.push(line);
      }
    }

    return result.join("\n");
  }

  private isTaskLine(line: string): boolean {
    // Patterns that suggest a task or todo item
    return (
      /^(TODO|TASK|DONE|COMPLETED|PENDING|FINISHED|WIP|IN PROGRESS)[:.]?\s+/i.test(
        line
      ) ||
      /^[-*]\s*(TODO|TASK|DONE|COMPLETED|PENDING|FINISHED)[:.]?\s+/i.test(
        line
      ) ||
      /^(✓|✔|☑|✅|❌|⭕)\s+/.test(line) ||
      /\[(x|X| )\]\s+/.test(line)
    );
  }

  private convertToTaskList(line: string): string {
    const trimmed = line.trim();

    // Already a task list
    if (/\[(x|X| )\]\s+/.test(trimmed)) {
      return `- ${trimmed}`;
    }

    // Convert done/completed items to checked
    if (/^(DONE|COMPLETED|FINISHED)[:.]?\s+/i.test(trimmed)) {
      const content = trimmed.replace(
        /^(DONE|COMPLETED|FINISHED)[:.]?\s+/i,
        ""
      );
      return `- [x] ${content}`;
    }

    // Convert checkmarks to checked tasks
    if (/^(✓|✔|☑|✅)\s+/.test(trimmed)) {
      const content = trimmed.replace(/^(✓|✔|☑|✅)\s+/, "");
      return `- [x] ${content}`;
    }

    // Convert X marks to checked tasks
    if (/^(❌|⭕)\s+/.test(trimmed)) {
      const content = trimmed.replace(/^(❌|⭕)\s+/, "");
      return `- [x] ${content}`;
    }

    // Convert bullet + status to task
    if (
      /^[-*]\s*(TODO|TASK|DONE|COMPLETED|PENDING|FINISHED)[:.]?\s+/i.test(
        trimmed
      )
    ) {
      const isDone = /^[-*]\s*(DONE|COMPLETED|FINISHED)[:.]?\s+/i.test(trimmed);
      const content = trimmed.replace(
        /^[-*]\s*(TODO|TASK|DONE|COMPLETED|PENDING|FINISHED)[:.]?\s+/i,
        ""
      );
      return `- [${isDone ? "x" : " "}] ${content}`;
    }

    // Default todo items
    const content = trimmed.replace(
      /^(TODO|TASK|PENDING|WIP|IN PROGRESS)[:.]?\s+/i,
      ""
    );
    return `- [ ] ${content}`;
  }

  private convertHeadings(text: string): string {
    const lines = text.split("\n");
    const result: string[] = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      const nextLine = lines[i + 1]?.trim();

      // Skip empty lines
      if (!line) {
        result.push(line);
        continue;
      }

      // Check if this looks like a heading
      const isHeading = this.isLikelyHeading(line, nextLine, i === 0);

      if (isHeading) {
        // Determine heading level based on position and content
        const level = this.determineHeadingLevel(line, i === 0);
        result.push(`${"#".repeat(level)} ${line}`);
      } else {
        result.push(line);
      }
    }

    return result.join("\n");
  }

  private isLikelyHeading(
    line: string,
    nextLine: string,
    isFirst: boolean
  ): boolean {
    // Don't convert if it's already a heading
    if (line.startsWith("#")) return false;

    // First line is often a title if it's short and followed by content
    if (isFirst && line.length < 100 && nextLine && nextLine.length > 0) {
      return true;
    }

    // Lines that end with colon might be headings
    if (line.endsWith(":") && line.length < 80) {
      return true;
    }

    // Short lines (< 60 chars) followed by longer content
    if (line.length < 60 && nextLine && nextLine.length > line.length * 1.5) {
      return true;
    }

    return false;
  }

  private determineHeadingLevel(line: string, isFirst: boolean): number {
    if (isFirst) return 1; // First line is usually H1
    if (line.endsWith(":")) return 2; // Section headers
    return 3; // Subsections
  }

  private convertEmphasis(text: string, format: "standard" | "gfm"): string {
    // Convert text in quotes to emphasis
    text = text.replace(/"([^"]+)"/g, "*$1*");

    // Convert text in single quotes to inline code (if short)
    text = text.replace(/'([^']{1,30})'/g, "`$1`");

    // GFM: Additional emphasis patterns
    if (format === "gfm") {
      // Strikethrough for crossed out text
      text = text.replace(/~~([^~]+)~~/g, "~~$1~~"); // Keep existing strikethrough
      text = text.replace(/\-\-([^-]+)\-\-/g, "~~$1~~"); // Convert --text-- to strikethrough
      text = text.replace(
        /\b(deleted|removed|cancelled|strikethrough)\s+([^\n]+)/gi,
        "~~$2~~"
      );

      // Convert CAPS WORDS to bold (if not too long)
      text = text.replace(/\b([A-Z]{2,15})\b/g, "**$1**");

      // Convert underscored_words to italic
      text = text.replace(/\b([a-zA-Z]+_[a-zA-Z_]+)\b/g, "*$1*");
    }

    return text;
  }

  private convertCode(text: string, format: "standard" | "gfm"): string {
    // Convert code patterns - text that looks like code
    const lines = text.split("\n");
    const result: string[] = [];
    let inCodeBlock = false;

    for (const line of lines) {
      // Detect code blocks (indented lines or lines with code-like patterns)
      if (this.isCodeLine(line)) {
        if (!inCodeBlock) {
          // GFM: Try to detect language
          const language =
            format === "gfm" ? this.detectCodeLanguage(line) : "";
          result.push(`\`\`\`${language}`);
          inCodeBlock = true;
        }
        result.push(line.replace(/^\s{2,}/, "")); // Remove excessive indentation
      } else {
        if (inCodeBlock) {
          result.push("```");
          inCodeBlock = false;
        }
        result.push(line);
      }
    }

    // Close code block if still open
    if (inCodeBlock) {
      result.push("```");
    }

    return result.join("\n");
  }

  private detectCodeLanguage(line: string): string {
    const trimmed = line.trim().toLowerCase();

    // JavaScript/TypeScript
    if (
      /^(function|const|let|var|class|import|export|async|await)/.test(trimmed)
    ) {
      return "javascript";
    }

    // Python
    if (
      /^(def|import|from|class|if __name__|print\(|pip install)/.test(trimmed)
    ) {
      return "python";
    }

    // HTML
    if (/^<[^>]+>/.test(trimmed)) {
      return "html";
    }

    // CSS
    if (
      /^[\w-]+\s*:\s*[^;]+;?$/.test(trimmed) ||
      /^\.[\w-]+|^#[\w-]+/.test(trimmed)
    ) {
      return "css";
    }

    // SQL
    if (/^(select|insert|update|delete|create|alter|drop)/.test(trimmed)) {
      return "sql";
    }

    // Bash/Shell
    if (/^(#!\/bin\/|npm|yarn|git|cd|ls|mkdir|chmod)/.test(trimmed)) {
      return "bash";
    }

    return "";
  }

  private isCodeLine(line: string): boolean {
    const trimmed = line.trim();

    // Empty lines don't count as code
    if (!trimmed) return false;

    // Lines with common code patterns
    const codePatterns = [
      /^(function|class|const|let|var|if|for|while|return)\s/,
      /^(def|import|from|class|if|for|while|return)\s/,
      /^\w+\([^)]*\)\s*{?$/,
      /[{}();]$/,
      /^\s*[<>]/,
      /^[A-Z_][A-Z0-9_]*\s*=/,
      /^(npm|yarn|git|cd|ls|mkdir|chmod)\s/,
      /^#!/,
    ];

    return codePatterns.some((pattern) => pattern.test(trimmed));
  }

  private convertBlockquotes(text: string): string {
    const lines = text.split("\n");
    const result: string[] = [];

    for (const line of lines) {
      const trimmed = line.trim();

      // Convert lines that start with quotes
      if (
        trimmed.startsWith('"') &&
        trimmed.endsWith('"') &&
        trimmed.length > 10
      ) {
        result.push(`> ${trimmed.slice(1, -1)}`);
      }
      // Convert lines that look like citations
      else if (/^(-|—)\s*.+/g.test(trimmed)) {
        result.push(`> ${trimmed}`);
      } else {
        result.push(line);
      }
    }

    return result.join("\n");
  }

  private convertGfmFeatures(text: string): string {
    // Convert tables (if we detect table-like structures)
    text = this.convertTables(text);

    // Convert mentions
    text = this.convertMentions(text);

    // Convert emojis
    text = this.convertEmojis(text);

    // Convert issue/PR references
    text = this.convertReferences(text);

    // Convert keyboard shortcuts
    text = this.convertKeyboardShortcuts(text);

    return text;
  }

  private convertTables(text: string): string {
    // Basic table detection and conversion
    const lines = text.split("\n");
    const result: string[] = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      // Detect lines with multiple tabs or pipes (potential table rows)
      if (line.includes("\t") && (line.match(/\t/g) || []).length >= 2) {
        const cells = line.split("\t").map((cell) => cell.trim());
        result.push(`| ${cells.join(" | ")} |`);

        // Add header separator if this looks like a first row
        const nextLine = lines[i + 1];
        if (i === 0 || !nextLine?.includes("\t")) {
          result.push(`| ${cells.map(() => "---").join(" | ")} |`);
        }
      }
      // Detect comma-separated values that might be table data
      else if (
        line.includes(",") &&
        (line.match(/,/g) || []).length >= 2 &&
        line.length < 200
      ) {
        const cells = line.split(",").map((cell) => cell.trim());
        // Only convert if it looks like structured data (not just a sentence with commas)
        if (
          cells.every(
            (cell) =>
              cell.length < 50 &&
              !cell.includes(" and ") &&
              !cell.includes(" or ")
          )
        ) {
          result.push(`| ${cells.join(" | ")} |`);

          // Add header separator for first table row
          const nextLine = lines[i + 1];
          if (i === 0 || !nextLine?.includes(",")) {
            result.push(`| ${cells.map(() => "---").join(" | ")} |`);
          }
        } else {
          result.push(line);
        }
      } else {
        result.push(line);
      }
    }

    return result.join("\n");
  }

  private convertMentions(text: string): string {
    // Convert @username patterns to GitHub mentions
    return text.replace(/@([a-zA-Z0-9_-]+)/g, "[@$1](https://github.com/$1)");
  }

  private convertEmojis(text: string): string {
    // Convert common emoji patterns
    const emojiMap: { [key: string]: string } = {
      ":)": "😊",
      ":-)": "😊",
      ":(": "😞",
      ":-(": "😞",
      ":D": "😄",
      ":-D": "😄",
      ";)": "😉",
      ";-)": "😉",
      ":P": "😛",
      ":-P": "😛",
      ":thumbsup:": "👍",
      ":thumbsdown:": "👎",
      ":fire:": "🔥",
      ":rocket:": "🚀",
      ":star:": "⭐",
      ":heart:": "❤️",
      ":warning:": "⚠️",
      ":info:": "ℹ️",
      ":check:": "✅",
      ":x:": "❌",
    };

    let result = text;
    for (const [pattern, emoji] of Object.entries(emojiMap)) {
      result = result.replace(
        new RegExp(pattern.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "g"),
        emoji
      );
    }

    return result;
  }

  private convertReferences(text: string): string {
    // Convert issue/PR references like #123
    text = text.replace(
      /#(\d+)/g,
      "[#$1](https://github.com/user/repo/issues/$1)"
    );

    // Convert repo references like user/repo#123
    text = text.replace(
      /([a-zA-Z0-9_-]+\/[a-zA-Z0-9_-]+)#(\d+)/g,
      "[$1#$2](https://github.com/$1/issues/$2)"
    );

    return text;
  }

  private convertKeyboardShortcuts(text: string): string {
    // Convert keyboard shortcuts like Ctrl+C to <kbd> tags
    return text.replace(
      /\b(Ctrl|Alt|Shift|Cmd|Meta)\+([A-Za-z0-9]+)\b/g,
      "<kbd>$1</kbd>+<kbd>$2</kbd>"
    );
  }

  private formatParagraphs(text: string): string {
    // Ensure proper paragraph spacing
    const paragraphs = text.split(/\n\s*\n/);
    return paragraphs
      .map((para) => para.trim())
      .filter((para) => para.length > 0)
      .join("\n\n");
  }
}
