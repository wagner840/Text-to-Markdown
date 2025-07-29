import type { Metadata } from "next";
import { ReactElement, ReactNode } from "react";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Text to Markdown Converter",
  description:
    "Convert plain text to AI-optimized Markdown with support for Standard Markdown and GitHub Flavored Markdown",
  keywords: [
    "markdown",
    "converter",
    "text",
    "AI",
    "GitHub Flavored Markdown",
    "GFM",
    "plain text",
    "formatter",
  ],
  authors: [{ name: "Text to Markdown" }],
  openGraph: {
    title: "Text to Markdown Converter",
    description: "Fast tool for converting text to AI-optimized Markdown",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>): ReactElement {
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <body className={`${inter.className} antialiased`}>{children}</body>
    </html>
  );
}
