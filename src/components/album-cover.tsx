"use client";

import { useState } from "react";

export function AlbumCover({ src, alt }: { src: string; alt: string }) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <div className="flex aspect-square w-full items-center justify-center rounded-md bg-zinc-800 text-xs text-zinc-500">
        Нет обложки
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      loading="lazy"
      onError={() => setFailed(true)}
      className="aspect-square w-full rounded-md bg-zinc-800 object-cover"
    />
  );
}
