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
      <form action={saveAction} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <label htmlFor="discordWebhookUrl" className="text-sm text-zinc-300">
            Discord Webhook URL
          </label>
          <input
            id="discordWebhookUrl"
            name="discordWebhookUrl"
            defaultValue={discordWebhookUrl}
            placeholder="https://discord.com/api/webhooks/..."
            className="rounded-md border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm outline-none focus:border-zinc-500"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label htmlFor="telegramBotToken" className="text-sm text-zinc-300">
            Telegram Bot Token
          </label>
          <input
            id="telegramBotToken"
            name="telegramBotToken"
            defaultValue={telegramBotToken}
            className="rounded-md border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm outline-none focus:border-zinc-500"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label htmlFor="telegramChatId" className="text-sm text-zinc-300">
            Telegram Chat ID
          </label>
          <input
            id="telegramChatId"
            name="telegramChatId"
            defaultValue={telegramChatId}
            className="rounded-md border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm outline-none focus:border-zinc-500"
          />
        </div>
        {saveState?.error && (
          <p className="text-sm text-red-400">{saveState.error}</p>
        )}
        {saveState?.success && (
          <p className="text-sm text-emerald-400">Настройки сохранены</p>
        )}
        <button
          type="submit"
          disabled={savePending}
          className="rounded-md bg-emerald-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-emerald-500 disabled:opacity-50"
        >
          {savePending ? "Сохранение..." : "Сохранить"}
        </button>
      </form>

      <form action={testAction} className="flex flex-col gap-2">
        <button
          type="submit"
          disabled={testPending}
          className="rounded-md border border-zinc-700 px-4 py-2 text-sm hover:border-zinc-500 disabled:opacity-50"
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
