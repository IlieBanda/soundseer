import "server-only";
import { prisma } from "@/lib/prisma";
import { notifyRequestEvent } from "@/lib/notifications";

/**
 * Marks any non-AVAILABLE requests matching the given Lidarr album ids as
 * AVAILABLE. Used by both the Lidarr webhook and the periodic sync job.
 */
export async function markAvailableByLidarrAlbumIds(lidarrAlbumIds: number[]) {
  if (lidarrAlbumIds.length === 0) return [];

  const requests = await prisma.musicRequest.findMany({
    where: { lidarrAlbumId: { in: lidarrAlbumIds }, status: { not: "AVAILABLE" } },
  });
  if (requests.length === 0) return [];

  await prisma.musicRequest.updateMany({
    where: { id: { in: requests.map((r) => r.id) } },
    data: { status: "AVAILABLE" },
  });

  for (const request of requests) {
    notifyRequestEvent("available", request).catch((err) =>
      console.error("Failed to send availability notification", err)
    );
  }

  return requests;
}
