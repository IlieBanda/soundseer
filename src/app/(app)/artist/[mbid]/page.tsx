import { notFound } from "next/navigation";
import {
  getArtist,
  getArtistReleaseGroups,
  coverArtUrl,
} from "@/lib/musicbrainz";
import { getLibraryAvailability } from "@/lib/lidarr";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { AlbumCover } from "@/components/album-cover";
import { RequestAlbumButton } from "@/components/request-album-button";
import { RequestStatusBadge } from "@/components/request-status-badge";

export default async function ArtistPage({
  params,
}: {
  params: Promise<{ mbid: string }>;
}) {
  const { mbid } = await params;
  const user = await requireUser();

  let artist;
  let releaseGroups;
  try {
    [artist, releaseGroups] = await Promise.all([
      getArtist(mbid),
      getArtistReleaseGroups(mbid),
    ]);
  } catch {
    notFound();
  }

  if (!artist) notFound();

  const [availability, existingRequests] = await Promise.all([
    getLibraryAvailability(mbid),
    prisma.musicRequest.findMany({
      where: {
        requestedById: user.id,
        mbid: { in: releaseGroups.map((rg) => rg.id) },
      },
    }),
  ]);
  const requestsByMbid = new Map(existingRequests.map((r) => [r.mbid, r]));

  return (
    <div>
      <h1 className="text-3xl font-semibold">{artist.name}</h1>
      {artist.disambiguation && (
        <p className="mt-1 text-zinc-500">{artist.disambiguation}</p>
      )}
      <p className="mt-1 text-sm text-zinc-500">
        {[artist.type, artist.country].filter(Boolean).join(" · ")}
      </p>

      <h2 className="mt-8 mb-4 text-lg font-medium">Дискография</h2>
      {releaseGroups.length === 0 ? (
        <p className="text-sm text-zinc-500">Альбомы не найдены.</p>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {releaseGroups.map((rg) => {
            const inLibrary = availability.get(rg.id);
            const existingRequest = requestsByMbid.get(rg.id);

            return (
              <div key={rg.id} className="flex flex-col gap-2">
                <AlbumCover src={coverArtUrl(rg.id)} alt={rg.title} />
                <div>
                  <p className="text-sm font-medium leading-tight">
                    {rg.title}
                  </p>
                  <p className="text-xs text-zinc-500">
                    {rg["first-release-date"]?.slice(0, 4) ?? "—"} ·{" "}
                    {rg["primary-type"]}
                  </p>
                </div>
                <div className="mt-1">
                  {inLibrary?.available ? (
                    <RequestStatusBadge status="AVAILABLE" />
                  ) : existingRequest ? (
                    <RequestStatusBadge status={existingRequest.status} />
                  ) : (
                    <RequestAlbumButton
                      mbid={rg.id}
                      artistMbid={mbid}
                      title={rg.title}
                      artistName={artist.name}
                      coverUrl={coverArtUrl(rg.id)}
                    />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
