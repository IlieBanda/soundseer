"use client";

import { useActionState } from "react";
import { login } from "@/app/actions/auth";

export function LoginForm() {
  const [state, formAction, pending] = useActionState(login, undefined);

  return (
    <form action={formAction} className="flex flex-col gap-4">
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
          className="ss-input"
        />
      </div>
      {state?.error && <p className="text-sm text-red-400">{state.error}</p>}
      <button type="submit" disabled={pending} className="ss-btn-primary mt-2">
        {pending ? "Вход..." : "Войти"}
      </button>
    </form>
  );
}
