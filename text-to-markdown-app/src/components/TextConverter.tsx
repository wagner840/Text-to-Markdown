"use client";

import { ReactElement, useState, useCallback, useRef, useMemo } from "react";
import { FormatToggle } from "./FormatToggle";
import { PreviewPane } from "./PreviewPane";
import { ClientMarkdownConverter } from "@/lib/markdown/client-converter";
import { Copy, Download, AlertCircle, Clipboard } from "lucide-react";
import { useToast } from "@/hooks/useToast";

export function TextConverter(): ReactElement {
  const [inputText, setInputText] = useState("");
  const [outputMarkdown, setOutputMarkdown] = useState("");
  const [format, setFormat] = useState<"standard" | "gfm">("gfm");
  const [isConverting, setIsConverting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { toast } = useToast();

  // Create converter instance
  const converter = useMemo(() => new ClientMarkdownConverter(), []);

  const handleConvert = useCallback(async () => {
    if (!inputText.trim()) {
      setError("Please enter some text to convert");
      return;
    }

    setError(null);
    setIsConverting(true);

    try {
      const startTime = Date.now();

      // Convert directly in the client
      const markdown = converter.convert(inputText, format);

      if (markdown) {
        setOutputMarkdown(markdown);
        const processingTime = Date.now() - startTime;
        toast({
          title: "Conversion completed!",
          description: `Processed in ${processingTime}ms`,
        });
      } else {
        throw new Error("Conversion failed");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
      toast({
        title: "Conversion error",
        description: "Could not convert the text",
        variant: "destructive",
      });
    } finally {
      setIsConverting(false);
    }
  }, [inputText, format, converter, toast]);

  const handleCopy = useCallback(async () => {
    if (!outputMarkdown) return;

    try {
      await navigator.clipboard.writeText(outputMarkdown);
      toast({
        title: "Copied!",
        description: "Markdown copied to clipboard",
      });
    } catch (err) {
      toast({
        title: "Copy error",
        description: "Could not copy text",
        variant: "destructive",
      });
    }
  }, [outputMarkdown, toast]);

  const handleDownload = useCallback(() => {
    if (!outputMarkdown) return;

    const blob = new Blob([outputMarkdown], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `converted-${format}-${Date.now()}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: "Download started!",
      description: "Markdown file downloaded successfully",
    });
  }, [outputMarkdown, format, toast]);

  const handlePaste = useCallback(async () => {
    try {
      const text = await navigator.clipboard.readText();
      setInputText(text);
      toast({
        title: "Text pasted!",
        description: "Text pasted from clipboard",
      });
    } catch (err) {
      toast({
        title: "Paste error",
        description: "Could not access clipboard",
        variant: "destructive",
      });
    }
  }, [toast]);

  return (
    <div className="w-full max-w-7xl mx-auto p-6 space-y-8 bg-white dark:bg-gray-900 rounded-xl shadow-2xl">
      <FormatToggle format={format} onFormatChange={setFormat} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Input Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
              Input Text
            </h2>
            <button
              onClick={handlePaste}
              className="flex items-center gap-2 px-3 py-1 text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
            >
              <Clipboard className="w-4 h-4" />
              Paste from clipboard
            </button>
          </div>

          <div className="relative">
            <textarea
              ref={textareaRef}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Paste or type your text here..."
              className="w-full h-96 p-4 border border-gray-300 dark:border-gray-600 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
              disabled={isConverting}
            />

            {error && (
              <div className="absolute bottom-4 left-4 right-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md p-3 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400" />
                <span className="text-sm text-red-600 dark:text-red-400">
                  {error}
                </span>
              </div>
            )}
          </div>

          <button
            onClick={handleConvert}
            disabled={isConverting || !inputText.trim()}
            className="w-full py-3 px-4 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            {isConverting ? "Converting..." : "Convert to Markdown"}
          </button>
        </div>

        {/* Output Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
              Markdown Output
            </h2>
            <div className="flex gap-2">
              <button
                onClick={handleCopy}
                disabled={!outputMarkdown}
                className="flex items-center gap-2 px-3 py-1 text-sm text-gray-600 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Copy className="w-4 h-4" />
                Copy
              </button>
              <button
                onClick={handleDownload}
                disabled={!outputMarkdown}
                className="flex items-center gap-2 px-3 py-1 text-sm text-gray-600 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Download className="w-4 h-4" />
                Download
              </button>
            </div>
          </div>

          <PreviewPane
            markdown={outputMarkdown}
            format={format}
            isLoading={isConverting}
          />
        </div>
      </div>
    </div>
  );
}
