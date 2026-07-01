"use client";

import { useActionState } from "react";
import { createUser } from "@/app/actions/users";

export function CreateUserForm() {
  const [state, formAction, pending] = useActionState(createUser, undefined);

  return (
    <form action={formAction} className="ss-card flex max-w-md flex-col gap-3 p-4">
      <div className="flex flex-col gap-1.5">
        <label htmlFor="displayName" className="text-sm text-zinc-400">
          Имя
        </label>
        <input id="displayName" name="displayName" required className="ss-input" />
      </div>
      <div className="flex flex-col gap-1.5">
        <label htmlFor="email" className="text-sm text-zinc-400">
          Email
        </label>
        <input id="email" name="email" type="email" required className="ss-input" />
      </div>
      <div className="flex flex-col gap-1.5">
        <label htmlFor="password" className="text-sm text-zinc-400">
          Пароль
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          minLength={8}
          className="ss-input"
        />
      </div>
      {state?.error && <p className="text-sm text-red-400">{state.error}</p>}
      {state?.success && (
        <p className="text-sm text-emerald-400">Пользователь создан</p>
      )}
      <button type="submit" disabled={pending} className="ss-btn-primary">
        {pending ? "Создание..." : "Создать"}
      </button>
    </form>
  );
}
