"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireUser, requireAdmin } from "@/lib/auth";
import { submitAlbumRequest } from "@/lib/lidarr";
import { notifyRequestEvent } from "@/lib/notifications";
import type { MusicRequest } from "@/generated/prisma/client";

export type RequestActionState = { error?: string; success?: boolean } | undefined;

const ACTIVE_STATUSES = ["PENDING", "APPROVED", "PROCESSING", "AVAILABLE"] as const;

async function submitToLidarrAndUpdate(musicRequest: MusicRequest) {
  try {
    const lidarrAlbumId = await submitAlbumRequest({
      artistMbid: musicRequest.artistMbid,
      artistName: musicRequest.artistName,
      albumMbid: musicRequest.mbid,
    });
    await prisma.musicRequest.update({
      where: { id: musicRequest.id },
      data: { status: "PROCESSING", lidarrAlbumId },
    });
  } catch (err) {
    console.error("Failed to submit request to Lidarr", err);
  }
}

const requestSchema = z.object({
  mbid: z.string().min(1),
  artistMbid: z.string().min(1),
  title: z.string().min(1),
  artistName: z.string().min(1),
  coverUrl: z.string().optional(),
});

export async function requestAlbum(
  _state: RequestActionState,
  formData: FormData
): Promise<RequestActionState> {
  const user = await requireUser();

  const parsed = requestSchema.safeParse({
    mbid: formData.get("mbid"),
    artistMbid: formData.get("artistMbid"),
    title: formData.get("title"),
    artistName: formData.get("artistName"),
    coverUrl: formData.get("coverUrl") || undefined,
  });
  if (!parsed.success) {
    return { error: "Некорректные данные запроса" };
  }

  const existing = await prisma.musicRequest.findFirst({
    where: {
      mbid: parsed.data.mbid,
      requestedById: user.id,
      status: { in: [...ACTIVE_STATUSES] },
    },
  });
  if (existing) {
    return { error: "Вы уже запрашивали этот альбом" };
  }

  const musicRequest = await prisma.musicRequest.create({
    data: {
      ...parsed.data,
      requestedById: user.id,
      status: user.canAutoApprove ? "APPROVED" : "PENDING",
    },
  });

  if (user.canAutoApprove) {
    await submitToLidarrAndUpdate(musicRequest);
  }

  revalidatePath("/requests");
  revalidatePath(`/artist/${parsed.data.artistMbid}`);
  return { success: true };
}

export async function approveRequest(requestId: string) {
  await requireAdmin();

  const musicRequest = await prisma.musicRequest.findUnique({
    where: { id: requestId },
  });
  if (!musicRequest || musicRequest.status !== "PENDING") return;

  await prisma.musicRequest.update({
    where: { id: requestId },
    data: { status: "APPROVED" },
  });
  await notifyRequestEvent("approved", musicRequest);

  await submitToLidarrAndUpdate(musicRequest);

  revalidatePath("/requests");
}

export async function declineRequest(requestId: string) {
  await requireAdmin();

  const musicRequest = await prisma.musicRequest.findUnique({
    where: { id: requestId },
  });
  if (!musicRequest || musicRequest.status !== "PENDING") return;

  await prisma.musicRequest.update({
    where: { id: requestId },
    data: { status: "DECLINED" },
  });
  await notifyRequestEvent("declined", musicRequest);

  revalidatePath("/requests");
}
