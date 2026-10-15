"use client";

import Image from "next/image";
import { useState } from "react";
import { ImageOff } from "lucide-react";
import { cn } from "@/lib/utils";

export function PortfolioImage({ src, alt, sizes, className, priority = false }: { src: string; alt: string; sizes: string; className?: string; priority?: boolean }) {
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  if (!src || failedSrc === src) return <div role="img" aria-label={alt} className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-muted2 px-5 text-center text-foreground/40"><ImageOff size={24} aria-hidden="true" /><span className="text-xs">{alt}</span></div>;
  return <Image src={src} alt={alt} fill sizes={sizes} priority={priority} className={cn("object-cover", className)} onError={() => setFailedSrc(src)} />;
}
