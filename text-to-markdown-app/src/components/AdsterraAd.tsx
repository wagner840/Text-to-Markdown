"use client";

import { useEffect, useRef } from "react";

interface AdsterraAdProps {
  className?: string;
}

// Declaração global para window.atOptions
declare global {
  interface Window {
    atOptions: {
      key: string;
      format: string;
      height: number;
      width: number;
      params: Record<string, unknown>;
    };
  }
}

export function AdsterraAd({ className = "" }: AdsterraAdProps) {
  const adRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Configuração do Adsterra
    window.atOptions = {
      key: "77e1f22a67b5b0b11f8e23f14b17eab7",
      format: "iframe",
      height: 90,
      width: 728,
      params: {},
    };

    // Criar e adicionar o script do Adsterra
    const script = document.createElement("script");
    script.type = "text/javascript";
    script.src =
      "//www.highperformanceformat.com/77e1f22a67b5b0b11f8e23f14b17eab7/invoke.js";
    script.async = true;

    const currentAdRef = adRef.current;
    if (currentAdRef) {
      currentAdRef.appendChild(script);
    }

    // Cleanup
    return () => {
      if (currentAdRef && script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };
  }, []);

  return (
    <div
      ref={adRef}
      className={`flex justify-center items-center min-h-[90px] ${className}`}
      style={{ maxWidth: "728px", margin: "0 auto" }}
    />
  );
}
