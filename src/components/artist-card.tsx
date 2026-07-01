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
      className="ss-card ss-card-hover group flex items-center gap-3 p-4"
    >
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-lime-300/20 to-emerald-600/30 text-sm font-semibold text-emerald-300 ring-1 ring-emerald-500/20 transition-transform duration-200 group-hover:scale-105">
        {name.trim().charAt(0).toUpperCase() || "?"}
      </span>
      <span className="flex min-w-0 flex-col gap-0.5">
        <span className="truncate font-medium text-zinc-100 transition-colors group-hover:text-emerald-300">
          {name}
        </span>
        <span className="truncate text-xs text-zinc-500">
          {[type, disambiguation].filter(Boolean).join(" · ") || "Артист"}
        </span>
      </span>
    </Link>
  );
}
