import { revalidatePath } from "next/cache";
import { markAvailableByLidarrAlbumIds } from "@/lib/request-status";

const RELEVANT_EVENTS = new Set(["Download", "AlbumImport", "Rename"]);

type LidarrWebhookAlbum = { id?: number };

export async function POST(request: Request) {
  const payload = await request.json().catch(() => null);
  if (!payload || typeof payload !== "object") {
    return Response.json({ ok: false }, { status: 400 });
  }

  const eventType = (payload as { eventType?: string }).eventType;
  if (!eventType || !RELEVANT_EVENTS.has(eventType)) {
    return Response.json({ ok: true, skipped: true });
  }

  const body = payload as {
    albums?: LidarrWebhookAlbum[];
    album?: LidarrWebhookAlbum;
  };
  const albumsField = body.albums ?? (body.album ? [body.album] : []);
  const albumIds = new Set<number>();
  for (const album of albumsField) {
    if (typeof album?.id === "number") albumIds.add(album.id);
  }

  if (albumIds.size === 0) {
    return Response.json({ ok: true, skipped: true });
  }

  const updated = await markAvailableByLidarrAlbumIds([...albumIds]);
  if (updated.length > 0) {
    revalidatePath("/requests");
  }

  return Response.json({ ok: true, updated: updated.length });
}
