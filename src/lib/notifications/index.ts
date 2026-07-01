import "server-only";
import { prisma } from "@/lib/prisma";
import { sendDiscordNotification } from "./discord";
import { sendTelegramNotification } from "./telegram";
import type { MusicRequest } from "@/generated/prisma/client";

type NotificationEvent = "approved" | "declined" | "available";

const TITLES: Record<NotificationEvent, string> = {
  approved: "✅ Запрос одобрен",
  declined: "❌ Запрос отклонён",
  available: "🎵 Альбом доступен",
};

export async function notifyRequestEvent(
  event: NotificationEvent,
  request: Pick<MusicRequest, "title" | "artistName">
) {
  const settings = await prisma.settings.findUnique({ where: { id: 1 } });
  if (!settings) return;

  const text = `${TITLES[event]}: ${request.title} — ${request.artistName}`;

  const tasks: Promise<void>[] = [];
  if (settings.discordWebhookUrl) {
    tasks.push(sendDiscordNotification(settings.discordWebhookUrl, text));
  }
  if (settings.telegramBotToken && settings.telegramChatId) {
    tasks.push(
      sendTelegramNotification(
        settings.telegramBotToken,
        settings.telegramChatId,
        text
      )
    );
  }

  const results = await Promise.allSettled(tasks);
  for (const result of results) {
    if (result.status === "rejected") {
      console.error("Notification delivery failed", result.reason);
    }
  }
}
