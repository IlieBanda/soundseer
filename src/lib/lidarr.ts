import "server-only";
import { prisma } from "@/lib/prisma";

type LidarrSettings = {
  url: string;
  apiKey: string;
  rootFolder: string;
  qualityProfileId: number;
  metadataProfileId: number;
};

async function getLidarrSettings(): Promise<LidarrSettings | null> {
  const settings = await prisma.settings.findUnique({ where: { id: 1 } });
  if (
    !settings?.lidarrUrl ||
    !settings.lidarrApiKey ||
    !settings.lidarrRootFolder ||
    !settings.lidarrQualityProfileId ||
    !settings.lidarrMetadataProfileId
  ) {
    return null;
  }
  return {
    url: settings.lidarrUrl.replace(/\/$/, ""),
    apiKey: settings.lidarrApiKey,
    rootFolder: settings.lidarrRootFolder,
    qualityProfileId: settings.lidarrQualityProfileId,
    metadataProfileId: settings.lidarrMetadataProfileId,
  };
}

async function lidarrFetch<T>(
  settings: LidarrSettings,
  path: string,
  init?: RequestInit
): Promise<T> {
  const res = await fetch(`${settings.url}/api/v1${path}`, {
    ...init,
    headers: {
      "X-Api-Key": settings.apiKey,
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
    cache: "no-store",
  });
  if (!res.ok) {
    throw new Error(`Lidarr request failed (${res.status}): ${path}`);
  }
  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

export type LidarrArtist = {
  id: number;
  artistName: string;
  foreignArtistId: string;
  monitored: boolean;
};

export type LidarrAlbum = {
  id: number;
  title: string;
  foreignAlbumId: string;
  artistId: number;
  monitored: boolean;
  statistics?: {
    percentOfTracks?: number;
    trackFileCount?: number;
    trackCount?: number;
  };
};

export async function isLidarrConfigured() {
  return (await getLidarrSettings()) !== null;
}

export async function testLidarrConnection(input: {
  url: string;
  apiKey: string;
}) {
  const res = await fetch(
    `${input.url.replace(/\/$/, "")}/api/v1/system/status`,
    {
      headers: { "X-Api-Key": input.apiKey },
      cache: "no-store",
    }
  );
  if (!res.ok) throw new Error(`Lidarr вернул ${res.status}`);
  return res.json() as Promise<{ version: string }>;
}

export async function findLibraryArtist(artistMbid: string) {
  const settings = await getLidarrSettings();
  if (!settings) return null;
  const artists = await lidarrFetch<LidarrArtist[]>(settings, "/artist");
  return artists.find((a) => a.foreignArtistId === artistMbid) ?? null;
}

export async function getArtistAlbums(lidarrArtistId: number) {
  const settings = await getLidarrSettings();
  if (!settings) return [];
  return lidarrFetch<LidarrAlbum[]>(
    settings,
    `/album?artistId=${lidarrArtistId}`
  );
}

export async function getQualityProfiles(input: { url: string; apiKey: string }) {
  const res = await fetch(
    `${input.url.replace(/\/$/, "")}/api/v1/qualityprofile`,
    { headers: { "X-Api-Key": input.apiKey }, cache: "no-store" }
  );
  if (!res.ok) throw new Error(`Lidarr вернул ${res.status}`);
  return res.json() as Promise<{ id: number; name: string }[]>;
}

export async function getMetadataProfiles(input: { url: string; apiKey: string }) {
  const res = await fetch(
    `${input.url.replace(/\/$/, "")}/api/v1/metadataprofile`,
    { headers: { "X-Api-Key": input.apiKey }, cache: "no-store" }
  );
  if (!res.ok) throw new Error(`Lidarr вернул ${res.status}`);
  return res.json() as Promise<{ id: number; name: string }[]>;
}

export async function getRootFolders(input: { url: string; apiKey: string }) {
  const res = await fetch(
    `${input.url.replace(/\/$/, "")}/api/v1/rootfolder`,
    { headers: { "X-Api-Key": input.apiKey }, cache: "no-store" }
  );
  if (!res.ok) throw new Error(`Lidarr вернул ${res.status}`);
  return res.json() as Promise<{ id: number; path: string }[]>;
}

export async function getAlbumById(lidarrAlbumId: number) {
  const settings = await getLidarrSettings();
  if (!settings) return null;
  return lidarrFetch<LidarrAlbum>(settings, `/album/${lidarrAlbumId}`);
}

export async function getLibraryAvailability(artistMbid: string) {
  const availability = new Map<
    string,
    { monitored: boolean; available: boolean }
  >();
  try {
    const artist = await findLibraryArtist(artistMbid);
    if (!artist) return availability;
    const albums = await getArtistAlbums(artist.id);
    for (const album of albums) {
      availability.set(album.foreignAlbumId, {
        monitored: album.monitored,
        available: (album.statistics?.percentOfTracks ?? 0) >= 100,
      });
    }
  } catch (err) {
    console.error("Failed to read Lidarr library availability", err);
  }
  return availability;
}

async function addArtistToLidarr(
  settings: LidarrSettings,
  artistMbid: string,
  artistName: string
) {
  return lidarrFetch<LidarrArtist>(settings, "/artist", {
    method: "POST",
    body: JSON.stringify({
      foreignArtistId: artistMbid,
      artistName,
      qualityProfileId: settings.qualityProfileId,
      metadataProfileId: settings.metadataProfileId,
      rootFolderPath: settings.rootFolder,
      monitored: false,
      addOptions: { monitor: "none", searchForMissingAlbums: false },
    }),
  });
}

function triggerCommand(settings: LidarrSettings, body: Record<string, unknown>) {
  return lidarrFetch(settings, "/command", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Ensures the artist exists in Lidarr, monitors the requested album and
 * triggers a search for it. Returns the Lidarr album id.
 */
export async function submitAlbumRequest(input: {
  artistMbid: string;
  artistName: string;
  albumMbid: string;
}): Promise<number> {
  const settings = await getLidarrSettings();
  if (!settings) {
    throw new Error("Lidarr не настроен. Обратитесь к администратору.");
  }

  let artist = await findLibraryArtist(input.artistMbid);
  if (!artist) {
    artist = await addArtistToLidarr(settings, input.artistMbid, input.artistName);
    await triggerCommand(settings, { name: "RefreshArtist", artistId: artist.id });
  }

  let album: LidarrAlbum | undefined;
  for (let attempt = 0; attempt < 8 && !album; attempt++) {
    if (attempt > 0) await sleep(1500);
    const albums = await getArtistAlbums(artist.id);
    album = albums.find((a) => a.foreignAlbumId === input.albumMbid);
  }

  if (!album) {
    throw new Error("Альбом не найден в Lidarr после добавления артиста.");
  }

  if (!album.monitored) {
    await lidarrFetch(settings, "/album/monitor", {
      method: "PUT",
      body: JSON.stringify({ albumIds: [album.id], monitored: true }),
    });
  }

  await triggerCommand(settings, { name: "AlbumSearch", albumIds: [album.id] });

  return album.id;
}
