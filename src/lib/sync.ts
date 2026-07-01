import "server-only";
import { prisma } from "@/lib/prisma";
import { getAlbumById } from "@/lib/lidarr";
import { markAvailableByLidarrAlbumIds } from "@/lib/request-status";

/**
 * Polls Lidarr for requests stuck in PROCESSING and marks them AVAILABLE
 * once their tracks are fully downloaded. Acts as a fallback for setups
 * that haven't configured the Lidarr webhook.
 */
export async function syncProcessingRequests() {
  const processing = await prisma.musicRequest.findMany({
    where: { status: "PROCESSING", lidarrAlbumId: { not: null } },
  });
  if (processing.length === 0) return;

  const availableIds: number[] = [];
  for (const request of processing) {
    if (!request.lidarrAlbumId) continue;
    try {
      const album = await getAlbumById(request.lidarrAlbumId);
      if (album && (album.statistics?.percentOfTracks ?? 0) >= 100) {
        availableIds.push(request.lidarrAlbumId);
      }
    } catch (err) {
      console.error(`Failed to sync Lidarr album ${request.lidarrAlbumId}`, err);
    }
  }

  await markAvailableByLidarrAlbumIds(availableIds);
}
