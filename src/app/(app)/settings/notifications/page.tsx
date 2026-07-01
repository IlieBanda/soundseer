import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NotificationsForm } from "./notifications-form";

export default async function NotificationsSettingsPage() {
  await requireAdmin();
  const settings = await prisma.settings.findUnique({ where: { id: 1 } });

  return (
    <div>
      <h1 className="text-3xl font-semibold tracking-tight">
        <span className="ss-glow-text">Уведомления</span>
      </h1>
      <p className="mt-2 mb-6 text-zinc-400">
        Получайте уведомления об одобрении, отклонении и доступности альбомов.
      </p>
      <NotificationsForm
        discordWebhookUrl={settings?.discordWebhookUrl ?? ""}
        telegramBotToken={settings?.telegramBotToken ?? ""}
        telegramChatId={settings?.telegramChatId ?? ""}
      />
    </div>
  );
}
