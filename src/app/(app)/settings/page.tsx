import Link from "next/link";
import { requireAdmin } from "@/lib/auth";

const SECTIONS = [
  {
    href: "/settings/users",
    title: "Пользователи",
    description: "Роли и автоодобрение запросов",
    icon: "👥",
  },
  {
    href: "/settings/lidarr",
    title: "Lidarr",
    description: "Подключение к Lidarr",
    icon: "🎧",
  },
  {
    href: "/settings/notifications",
    title: "Уведомления",
    description: "Discord и Telegram",
    icon: "🔔",
  },
];

export default async function SettingsPage() {
  await requireAdmin();

  return (
    <div>
      <h1 className="text-3xl font-semibold tracking-tight">
        <span className="ss-glow-text">Настройки</span>
      </h1>
      <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
        {SECTIONS.map((section) => (
          <Link
            key={section.href}
            href={section.href}
            className="ss-card ss-card-hover group flex flex-col gap-2 p-5"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500/10 text-lg ring-1 ring-emerald-500/20">
              {section.icon}
            </span>
            <p className="font-medium text-zinc-100 transition-colors group-hover:text-emerald-300">
              {section.title}
            </p>
            <p className="text-sm text-zinc-500">{section.description}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
