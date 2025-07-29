import { NextRequest, NextResponse } from "next/server";
import { ConversionRequestSchema } from "@/types";

// Configure for Edge Runtime
export const runtime = "edge";

// Simple server-side conversion (fallback)
function simpleTextToMarkdown(
  text: string,
  format: "standard" | "gfm"
): string {
  // Basic text-to-markdown conversion for server fallback
  const lines = text.split("\n");
  const result: string[] = [];

  for (const line of lines) {
    if (line.trim() === "") {
      result.push("");
      continue;
    }

    // Simple heading detection
    if (line.match(/^[A-Z][^.!?]*$/)) {
      result.push(`# ${line}`);
    }
    // Simple list detection
    else if (line.match(/^\d+\.?\s/)) {
      result.push(line.replace(/^(\d+)\.?\s/, "$1. "));
    } else if (line.match(/^[-*•]\s/)) {
      result.push(line.replace(/^[-*•]\s/, "- "));
    }
    // Regular paragraph
    else {
      result.push(line);
    }
  }

  return result.join("\n");
}

export async function POST(request: NextRequest) {
  try {
    // Parse and validate request body
    const body = await request.json();
    const validatedData = ConversionRequestSchema.parse(body);

    // Perform simple conversion
    const markdown = simpleTextToMarkdown(
      validatedData.text,
      validatedData.format
    );

    const result = {
      markdown,
      format: validatedData.format,
      metadata: {
        originalLength: validatedData.text.length,
        convertedLength: markdown.length,
        processingTime: Date.now() - Date.now(), // Placeholder
      },
    };

    // Return response with proper headers
    return NextResponse.json(result, {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=600",
      },
    });
  } catch (error) {
    console.error("Conversion error:", error);

    // Handle validation errors
    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json(
        {
          error: "Invalid request format",
          details: error.message,
        },
        { status: 400 }
      );
    }

    // Handle other errors
    return NextResponse.json(
      {
        error: "Internal server error",
        message: "Failed to process conversion request",
      },
      { status: 500 }
    );
  }
}

// Handle other methods
export async function GET() {
  return NextResponse.json({ error: "Method not allowed" }, { status: 405 });
}
