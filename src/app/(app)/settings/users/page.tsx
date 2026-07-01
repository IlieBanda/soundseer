import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { updateUserAccess, deleteUser } from "@/app/actions/users";
import { CreateUserForm } from "./create-user-form";

export default async function UsersSettingsPage() {
  const admin = await requireAdmin();
  const users = await prisma.user.findMany({ orderBy: { createdAt: "asc" } });

  return (
    <div>
      <h1 className="text-2xl font-semibold">Пользователи</h1>
      <p className="mt-2 mb-6 text-zinc-400">
        Управление ролями и автоодобрением запросов.
      </p>

      <div className="mb-8 flex flex-col divide-y divide-zinc-800 rounded-lg border border-zinc-800">
        {users.map((user) => (
          <form
            key={user.id}
            action={updateUserAccess}
            className="flex flex-wrap items-center gap-4 px-4 py-3"
          >
            <input type="hidden" name="userId" value={user.id} />
            <div className="min-w-0 flex-1">
              <p className="truncate font-medium">{user.displayName}</p>
              <p className="truncate text-sm text-zinc-500">{user.email}</p>
            </div>

            {user.id === admin.id ? (
              <span className="text-xs text-zinc-500">Это вы</span>
            ) : (
              <>
                <select
                  name="role"
                  defaultValue={user.role}
                  className="rounded-md border border-zinc-700 bg-zinc-950 px-2 py-1 text-sm"
                >
                  <option value="USER">USER</option>
                  <option value="ADMIN">ADMIN</option>
                </select>
                <label className="flex items-center gap-1 text-sm text-zinc-400">
                  <input
                    type="checkbox"
                    name="canAutoApprove"
                    defaultChecked={user.canAutoApprove}
                  />
                  Автоодобрение
                </label>
                <button
                  type="submit"
                  className="rounded-md border border-zinc-700 px-2 py-1 text-xs hover:border-zinc-500"
                >
                  Сохранить
                </button>
                <button
                  type="submit"
                  formAction={deleteUser}
                  className="rounded-md border border-red-800 px-2 py-1 text-xs text-red-400 hover:bg-red-900/30"
                >
                  Удалить
                </button>
              </>
            )}
          </form>
        ))}
      </div>

      <h2 className="mb-3 text-lg font-medium">Добавить пользователя</h2>
      <CreateUserForm />
    </div>
  );
}
