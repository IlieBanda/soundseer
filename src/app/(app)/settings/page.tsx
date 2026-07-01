import Link from "next/link";
import { requireAdmin } from "@/lib/auth";

const SECTIONS = [
  { href: "/settings/users", title: "Пользователи", description: "Роли и автоодобрение запросов" },
  { href: "/settings/lidarr", title: "Lidarr", description: "Подключение к Lidarr" },
  { href: "/settings/notifications", title: "Уведомления", description: "Discord и Telegram" },
];

export default async function SettingsPage() {
  await requireAdmin();

  return (
    <div>
      <h1 className="text-2xl font-semibold">Настройки</h1>
      <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
        {SECTIONS.map((section) => (
          <Link
            key={section.href}
            href={section.href}
            className="rounded-lg border border-zinc-800 bg-zinc-900 p-4 transition-colors hover:border-zinc-600"
          >
            <p className="font-medium">{section.title}</p>
            <p className="mt-1 text-sm text-zinc-500">{section.description}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
