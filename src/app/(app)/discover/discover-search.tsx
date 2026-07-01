"use client";

import { useRef, useState } from "react";
import { ArtistCard } from "@/components/artist-card";

type Artist = {
  id: string;
  name: string;
  disambiguation?: string;
  type?: string;
};

export function DiscoverSearch() {
  const [query, setQuery] = useState("");
  const [artists, setArtists] = useState<Artist[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const controllerRef = useRef<AbortController | null>(null);

  function handleChange(value: string) {
    setQuery(value);

    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    controllerRef.current?.abort();

    const trimmed = value.trim();
    if (!trimmed) {
      setArtists([]);
      setError(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    timeoutRef.current = setTimeout(async () => {
      const controller = new AbortController();
      controllerRef.current = controller;
      try {
        const res = await fetch(
          `/api/search?q=${encodeURIComponent(trimmed)}`,
          { signal: controller.signal }
        );
        const data = await res.json();
        if (!res.ok) {
          setError("Не удалось выполнить поиск. Попробуйте ещё раз.");
          setArtists([]);
        } else {
          setArtists(data.artists ?? []);
        }
      } catch (err) {
        if ((err as Error).name !== "AbortError") {
          setError("Не удалось выполнить поиск. Попробуйте ещё раз.");
        }
      } finally {
        setLoading(false);
      }
    }, 400);
  }

  const trimmedQuery = query.trim();

  return (
    <div>
      <div className="relative max-w-md">
        <svg
          className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <circle cx="11" cy="11" r="7" />
          <path d="m21 21-4.3-4.3" strokeLinecap="round" />
        </svg>
        <input
          type="text"
          placeholder="Найти артиста..."
          value={query}
          onChange={(e) => handleChange(e.target.value)}
          className="ss-input w-full pl-9"
        />
        {loading && (
          <span className="absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 animate-spin rounded-full border-2 border-emerald-500/30 border-t-emerald-400" />
        )}
      </div>

      <div className="mt-6">
        {error && <p className="text-sm text-red-400">{error}</p>}
        {!loading && !error && trimmedQuery && artists.length === 0 && (
          <p className="text-sm text-zinc-500">Ничего не найдено.</p>
        )}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {artists.map((artist) => (
            <ArtistCard
              key={artist.id}
              mbid={artist.id}
              name={artist.name}
              disambiguation={artist.disambiguation}
              type={artist.type}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
