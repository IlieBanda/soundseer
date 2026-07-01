import Link from "next/link";

export function ArtistCard({
  mbid,
  name,
  disambiguation,
  type,
}: {
  mbid: string;
  name: string;
  disambiguation?: string;
  type?: string;
}) {
  return (
    <Link
      href={`/artist/${mbid}`}
      className="flex flex-col gap-1 rounded-lg border border-zinc-800 bg-zinc-900 p-4 transition-colors hover:border-zinc-600"
    >
      <span className="font-medium text-zinc-100">{name}</span>
      <span className="text-xs text-zinc-500">
        {[type, disambiguation].filter(Boolean).join(" · ") || "Артист"}
      </span>
    </Link>
  );
}
