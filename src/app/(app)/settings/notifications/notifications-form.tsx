"use client";

import { useActionState } from "react";
import {
  updateNotificationSettings,
  sendTestNotification,
} from "@/app/actions/settings";

type Props = {
  discordWebhookUrl: string;
  telegramBotToken: string;
  telegramChatId: string;
};

export function NotificationsForm({
  discordWebhookUrl,
  telegramBotToken,
  telegramChatId,
}: Props) {
  const [saveState, saveAction, savePending] = useActionState(
    updateNotificationSettings,
    undefined
  );
  const [testState, testAction, testPending] = useActionState(
    sendTestNotification,
    undefined
  );

  return (
    <div className="flex max-w-md flex-col gap-6">
      <form action={saveAction} className="ss-card flex flex-col gap-4 p-5">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="discordWebhookUrl" className="text-sm text-zinc-400">
            Discord Webhook URL
          </label>
          <input
            id="discordWebhookUrl"
            name="discordWebhookUrl"
            defaultValue={discordWebhookUrl}
            placeholder="https://discord.com/api/webhooks/..."
            className="ss-input"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="telegramBotToken" className="text-sm text-zinc-400">
            Telegram Bot Token
          </label>
          <input
            id="telegramBotToken"
            name="telegramBotToken"
            defaultValue={telegramBotToken}
            className="ss-input"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="telegramChatId" className="text-sm text-zinc-400">
            Telegram Chat ID
          </label>
          <input
            id="telegramChatId"
            name="telegramChatId"
            defaultValue={telegramChatId}
            className="ss-input"
          />
        </div>
        {saveState?.error && (
          <p className="text-sm text-red-400">{saveState.error}</p>
        )}
        {saveState?.success && (
          <p className="text-sm text-emerald-400">Настройки сохранены</p>
        )}
        <button type="submit" disabled={savePending} className="ss-btn-primary">
          {savePending ? "Сохранение..." : "Сохранить"}
        </button>
      </form>

      <form action={testAction} className="flex flex-col gap-2">
        <button
          type="submit"
          disabled={testPending}
          className="ss-btn-secondary w-full py-2 text-sm"
        >
          {testPending ? "Отправка..." : "Отправить тестовое уведомление"}
        </button>
        {testState?.error && (
          <p className="text-sm text-red-400">{testState.error}</p>
        )}
        {testState?.success && (
          <p className="text-sm text-emerald-400">Уведомление отправлено</p>
        )}
      </form>
    </div>
  );
}
