import Image from "next/image";
import Link from "next/link";
import { logout } from "@/app/actions/auth";

type NavUser = {
  displayName: string;
  role: string;
};

export function Nav({ user }: { user: NavUser }) {
  return (
    <header className="sticky top-0 z-20 border-b border-zinc-800/80 bg-zinc-950/70 backdrop-blur-md">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
        <div className="flex items-center gap-8">
          <Link
            href="/discover"
            className="group flex items-center gap-2 font-semibold tracking-tight"
          >
            <span className="relative flex items-center justify-center">
              <span className="absolute inset-0 rounded-full bg-emerald-400/30 blur-md transition-opacity duration-300 group-hover:opacity-100 opacity-0" />
              <Image
                src="/logo.png"
                alt=""
                width={28}
                height={33}
                className="relative"
              />
            </span>
            <span className="ss-glow-text text-base">Soundseer</span>
          </Link>
          <nav className="flex gap-5 text-sm text-zinc-400">
            <Link
              href="/discover"
              className="transition-colors hover:text-emerald-300"
            >
              Поиск
            </Link>
            <Link
              href="/requests"
              className="transition-colors hover:text-emerald-300"
            >
              Запросы
            </Link>
            {user.role === "ADMIN" && (
              <Link
                href="/settings"
                className="transition-colors hover:text-emerald-300"
              >
                Настройки
              </Link>
            )}
          </nav>
        </div>
        <div className="flex items-center gap-3 text-sm text-zinc-400">
          <span className="hidden sm:inline text-zinc-500">
            {user.displayName}
          </span>
          <form action={logout}>
            <button
              type="submit"
              className="transition-colors hover:text-emerald-300"
            >
              Выйти
            </button>
          </form>
        </div>
      </div>
    </header>
  );
}
