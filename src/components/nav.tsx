import Image from "next/image";
import Link from "next/link";
import { logout } from "@/app/actions/auth";

type NavUser = {
  displayName: string;
  role: string;
};

export function Nav({ user }: { user: NavUser }) {
  return (
    <header className="border-b border-zinc-800">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
        <div className="flex items-center gap-6">
          <Link
            href="/discover"
            className="flex items-center gap-2 font-semibold tracking-tight"
          >
            <Image src="/logo.svg" alt="" width={24} height={24} />
            Soundseer
          </Link>
          <nav className="flex gap-4 text-sm text-zinc-400">
            <Link href="/discover" className="hover:text-zinc-100">
              Поиск
            </Link>
            <Link href="/requests" className="hover:text-zinc-100">
              Запросы
            </Link>
            {user.role === "ADMIN" && (
              <Link href="/settings" className="hover:text-zinc-100">
                Настройки
              </Link>
            )}
          </nav>
        </div>
        <div className="flex items-center gap-3 text-sm text-zinc-400">
          <span>{user.displayName}</span>
          <form action={logout}>
            <button type="submit" className="hover:text-zinc-100">
              Выйти
            </button>
          </form>
        </div>
      </div>
    </header>
  );
}
