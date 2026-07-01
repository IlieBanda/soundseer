import "server-only";

const MB_BASE = "https://musicbrainz.org/ws/2";
const USER_AGENT = "Soundseer/0.1.0 (+https://github.com/soundseer)";
const MIN_INTERVAL_MS = 1100;

let queue: Promise<unknown> = Promise.resolve();
let lastCallAt = 0;

function throttle<T>(fn: () => Promise<T>): Promise<T> {
  const run = async () => {
    const wait = Math.max(0, lastCallAt + MIN_INTERVAL_MS - Date.now());
    if (wait > 0) await new Promise((resolve) => setTimeout(resolve, wait));
    lastCallAt = Date.now();
    return fn();
  };
  const result = queue.then(run, run);
  queue = result.then(
    () => undefined,
    () => undefined
  );
  return result;
}

async function mbFetch<T>(
  path: string,
  params: Record<string, string>
): Promise<T> {
  const url = new URL(`${MB_BASE}${path}`);
  url.searchParams.set("fmt", "json");
  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, value);
  }

  return throttle(async () => {
    const res = await fetch(url, {
      headers: { "User-Agent": USER_AGENT },
      next: { revalidate: 3600 },
    });
    if (!res.ok) {
      throw new Error(`MusicBrainz request failed: ${res.status}`);
    }
    return res.json() as Promise<T>;
  });
}

export type MBArtist = {
  id: string;
  name: string;
  disambiguation?: string;
  type?: string;
  country?: string;
  score?: number;
  "life-span"?: { begin?: string; end?: string; ended?: boolean };
};

export type MBReleaseGroup = {
  id: string;
  title: string;
  "first-release-date"?: string;
  "primary-type"?: string;
  "secondary-types"?: string[];
  "artist-credit"?: { name: string; artist?: { id: string; name: string } }[];
};

export async function searchArtists(query: string, limit = 15) {
  const data = await mbFetch<{ artists: MBArtist[] }>("/artist/", {
    query,
    limit: String(limit),
  });
  return data.artists ?? [];
}

export async function getArtist(mbid: string) {
  return mbFetch<MBArtist>(`/artist/${mbid}`, {});
}

export async function getArtistReleaseGroups(mbid: string) {
  const data = await mbFetch<{ "release-groups": MBReleaseGroup[] }>(
    "/release-group",
    { artist: mbid, limit: "100" }
  );
  const groups = data["release-groups"] ?? [];

  return groups
    .filter((g) => g["primary-type"] === "Album" || g["primary-type"] === "EP")
    .sort((a, b) =>
      (b["first-release-date"] ?? "").localeCompare(
        a["first-release-date"] ?? ""
      )
    );
}

export function coverArtUrl(
  releaseGroupMbid: string,
  size: "250" | "500" = "250"
) {
  return `https://coverartarchive.org/release-group/${releaseGroupMbid}/front-${size}`;
}
