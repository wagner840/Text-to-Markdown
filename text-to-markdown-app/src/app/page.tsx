import { ReactElement } from "react";
import { TextConverter } from "@/components/TextConverter";
import { AdsterraAd } from "@/components/AdsterraAd";

export default function Home(): ReactElement {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      {/* Header Ad */}
      <div className="w-full py-4">
        <AdsterraAd className="mb-4" />
      </div>

      {/* Layout Principal */}
      <div className="flex justify-center min-h-screen">
        {/* Container Principal - sempre centralizado */}
        <div className="flex-1 max-w-6xl mx-auto px-4 py-8">
          <header className="text-center mb-12">
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">
              Text to Markdown Converter
            </h1>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Convert plain text to AI-optimized Markdown
            </p>
          </header>

          <main className="space-y-8">
            {/* Content Top Ad */}
            <div className="flex justify-center mb-8">
              <AdsterraAd />
            </div>

            {/* Conversor Principal */}
            <TextConverter />

            {/* Content Bottom Ad */}
            <div className="flex justify-center mt-8">
              <AdsterraAd />
            </div>
          </main>
        </div>
      </div>

      {/* Footer Ad */}
      <footer className="border-t border-gray-700 py-8">
        <AdsterraAd />
      </footer>
    </div>
  );
}
