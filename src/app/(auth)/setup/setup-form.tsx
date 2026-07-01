"use client";

import { useActionState } from "react";
import { setupAdmin } from "@/app/actions/auth";

export function SetupForm() {
  const [state, formAction, pending] = useActionState(setupAdmin, undefined);

  return (
    <form action={formAction} className="flex flex-col gap-4">
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
      <button type="submit" disabled={pending} className="ss-btn-primary mt-2">
        {pending ? "Создание..." : "Создать аккаунт"}
      </button>
    </form>
  );
}
