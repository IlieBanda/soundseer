import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { updateUserAccess, deleteUser } from "@/app/actions/users";
import { CreateUserForm } from "./create-user-form";

export default async function UsersSettingsPage() {
  const admin = await requireAdmin();
  const users = await prisma.user.findMany({ orderBy: { createdAt: "asc" } });

  return (
    <div>
      <h1 className="text-3xl font-semibold tracking-tight">
        <span className="ss-glow-text">Пользователи</span>
      </h1>
      <p className="mt-2 mb-6 text-zinc-400">
        Управление ролями и автоодобрением запросов.
      </p>

      <div className="mb-8 flex flex-col gap-2">
        {users.map((user) => (
          <form
            key={user.id}
            action={updateUserAccess}
            className="ss-card flex flex-wrap items-center gap-4 px-4 py-3"
          >
            <input type="hidden" name="userId" value={user.id} />
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-lime-300/20 to-emerald-600/30 text-sm font-semibold text-emerald-300 ring-1 ring-emerald-500/20">
              {user.displayName.trim().charAt(0).toUpperCase() || "?"}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate font-medium text-zinc-100">
                {user.displayName}
              </p>
              <p className="truncate text-sm text-zinc-500">{user.email}</p>
            </div>

            {user.id === admin.id ? (
              <span className="ss-badge bg-zinc-800 text-zinc-400 ring-1 ring-zinc-700">
                Это вы
              </span>
            ) : (
              <>
                <select
                  name="role"
                  defaultValue={user.role}
                  className="ss-input py-1.5"
                >
                  <option value="USER">USER</option>
                  <option value="ADMIN">ADMIN</option>
                </select>
                <label className="flex items-center gap-1.5 text-sm text-zinc-400">
                  <input
                    type="checkbox"
                    name="canAutoApprove"
                    defaultChecked={user.canAutoApprove}
                    className="h-4 w-4 rounded border-zinc-700 bg-zinc-950 accent-emerald-500"
                  />
                  Автоодобрение
                </label>
                <button type="submit" className="ss-btn-secondary">
                  Сохранить
                </button>
                <button
                  type="submit"
                  formAction={deleteUser}
                  className="ss-btn-danger"
                >
                  Удалить
                </button>
              </>
            )}
          </form>
        ))}
      </div>

      <h2 className="mb-3 text-lg font-medium text-zinc-200">
        Добавить пользователя
      </h2>
      <CreateUserForm />
    </div>
  );
}
