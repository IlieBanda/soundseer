"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { sendDiscordNotification } from "@/lib/notifications/discord";
import { sendTelegramNotification } from "@/lib/notifications/telegram";
import { testLidarrConnection } from "@/lib/lidarr";

export type SettingsActionState = { error?: string; success?: boolean } | undefined;

const notificationsSchema = z.object({
  discordWebhookUrl: z.string().optional(),
  telegramBotToken: z.string().optional(),
  telegramChatId: z.string().optional(),
});

export async function updateNotificationSettings(
  _state: SettingsActionState,
  formData: FormData
): Promise<SettingsActionState> {
  await requireAdmin();

  const parsed = notificationsSchema.safeParse({
    discordWebhookUrl: formData.get("discordWebhookUrl") || undefined,
    telegramBotToken: formData.get("telegramBotToken") || undefined,
    telegramChatId: formData.get("telegramChatId") || undefined,
  });
  if (!parsed.success) {
    return { error: "Некорректные данные" };
  }

  await prisma.settings.upsert({
    where: { id: 1 },
    create: { id: 1, ...parsed.data },
    update: parsed.data,
  });

  revalidatePath("/settings/notifications");
  return { success: true };
}

export async function sendTestNotification(
  // eslint-disable-next-line @typescript-eslint/no-unused-vars -- required by useActionState's action signature
  _state: SettingsActionState
): Promise<SettingsActionState> {
  await requireAdmin();

  const settings = await prisma.settings.findUnique({ where: { id: 1 } });
  if (!settings?.discordWebhookUrl && !(settings?.telegramBotToken && settings?.telegramChatId)) {
    return { error: "Сначала настройте Discord или Telegram" };
  }

  try {
    const tasks: Promise<void>[] = [];
    if (settings.discordWebhookUrl) {
      tasks.push(
        sendDiscordNotification(
          settings.discordWebhookUrl,
          "🔔 Тестовое уведомление от Soundseer"
        )
      );
    }
    if (settings.telegramBotToken && settings.telegramChatId) {
      tasks.push(
        sendTelegramNotification(
          settings.telegramBotToken,
          settings.telegramChatId,
          "🔔 Тестовое уведомление от Soundseer"
        )
      );
    }
    await Promise.all(tasks);
  } catch {
    return { error: "Не удалось отправить уведомление. Проверьте настройки." };
  }

  return { success: true };
}

const lidarrSchema = z.object({
  lidarrUrl: z.string().min(1, "Укажите URL"),
  lidarrApiKey: z.string().min(1, "Укажите API-ключ"),
  lidarrRootFolder: z.string().min(1, "Укажите корневую папку"),
  lidarrQualityProfileId: z.coerce.number().int().positive(),
  lidarrMetadataProfileId: z.coerce.number().int().positive(),
});

export async function updateLidarrSettings(
  _state: SettingsActionState,
  formData: FormData
): Promise<SettingsActionState> {
  await requireAdmin();

  const parsed = lidarrSchema.safeParse({
    lidarrUrl: formData.get("lidarrUrl"),
    lidarrApiKey: formData.get("lidarrApiKey"),
    lidarrRootFolder: formData.get("lidarrRootFolder"),
    lidarrQualityProfileId: formData.get("lidarrQualityProfileId"),
    lidarrMetadataProfileId: formData.get("lidarrMetadataProfileId"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Некорректные данные" };
  }

  try {
    await testLidarrConnection({
      url: parsed.data.lidarrUrl,
      apiKey: parsed.data.lidarrApiKey,
    });
  } catch {
    return { error: "Не удалось подключиться к Lidarr. Проверьте URL и API-ключ." };
  }

  await prisma.settings.upsert({
    where: { id: 1 },
    create: { id: 1, ...parsed.data },
    update: parsed.data,
  });

  revalidatePath("/settings/lidarr");
  return { success: true };
}
