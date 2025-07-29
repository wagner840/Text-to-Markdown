import { ReactElement } from "react";
import { TextConverter } from "@/components/TextConverter";
import { AdProvider, defaultAdConfigs } from "@/components/ads/AdProvider";
import { AdContainer } from "@/components/ads/AdContainer";

export default function Home(): ReactElement {
  return (
    <AdProvider configs={defaultAdConfigs}>
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
        {/* Header Ad - sempre no topo */}
        <div className="w-full">
          <AdContainer position="header" showMetrics={true} />
        </div>

        {/* Layout Principal */}
        <div className="flex justify-center min-h-screen">
          {/* Sidebar Esquerda - só aparece em telas muito grandes (xl+) */}
          <aside className="hidden xl:block w-64 p-4 flex-shrink-0">
            <div className="sticky top-8">
              <AdContainer position="sidebar" />
            </div>
          </aside>

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
              <div className="flex justify-center">
                <AdContainer position="content-top" />
              </div>

              {/* Conversor Principal */}
              <TextConverter />

              {/* Content Bottom Ad */}
              <div className="flex justify-center">
                <AdContainer position="content-bottom" />
              </div>
            </main>
          </div>

          {/* Sidebar Direita - só aparece em telas muito grandes (xl+) */}
          <aside className="hidden xl:block w-64 p-4 flex-shrink-0">
            <div className="sticky top-8">
              <AdContainer position="sidebar" />
            </div>
          </aside>
        </div>

        {/* Footer Ad */}
        <footer className="border-t border-gray-700 mt-12">
          <AdContainer position="footer" />
        </footer>

        {/* Floating Ad - sempre presente */}
        <AdContainer position="floating" />
      </div>
    </AdProvider>
  );
}
