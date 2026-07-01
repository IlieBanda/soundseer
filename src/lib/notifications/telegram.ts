import "server-only";

export async function sendTelegramNotification(
  botToken: string,
  chatId: string,
  text: string
) {
  const res = await fetch(
    `https://api.telegram.org/bot${botToken}/sendMessage`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: chatId, text }),
    }
  );
  if (!res.ok) {
    throw new Error(`Telegram notification failed: ${res.status}`);
  }
}
