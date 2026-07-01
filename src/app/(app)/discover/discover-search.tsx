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
      <input
        type="text"
        placeholder="Найти артиста..."
        value={query}
        onChange={(e) => handleChange(e.target.value)}
        className="w-full max-w-md rounded-md border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm outline-none focus:border-zinc-500"
      />

      <div className="mt-6">
        {loading && <p className="text-sm text-zinc-500">Поиск...</p>}
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
