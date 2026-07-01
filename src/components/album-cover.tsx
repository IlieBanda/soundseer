"use client";

import { useState } from "react";

export function AlbumCover({ src, alt }: { src: string; alt: string }) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <div className="flex aspect-square w-full items-center justify-center rounded-lg bg-gradient-to-br from-zinc-800 to-zinc-900 text-center text-xs text-zinc-500">
        Нет обложки
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-lg shadow-[0_4px_16px_-6px_rgba(0,0,0,0.6)]">
      <img
        src={src}
        alt={alt}
        loading="lazy"
        onError={() => setFailed(true)}
        className="aspect-square w-full scale-100 bg-zinc-800 object-cover transition-transform duration-300 hover:scale-[1.04]"
      />
    </div>
  );
}
