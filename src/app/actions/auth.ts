"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { hashPassword, verifyPassword } from "@/lib/password";
import { createSession, deleteSession } from "@/lib/session";

export type FormState = { error?: string } | undefined;

const setupSchema = z.object({
  displayName: z.string().trim().min(1, "Введите имя"),
  email: z.email("Введите корректный email"),
  password: z.string().min(8, "Минимум 8 символов"),
});

export async function setupAdmin(
  _state: FormState,
  formData: FormData
): Promise<FormState> {
  const existingUsers = await prisma.user.count();
  if (existingUsers > 0) {
    return { error: "Установка уже завершена" };
  }

  const parsed = setupSchema.safeParse({
    displayName: formData.get("displayName"),
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Неверные данные" };
  }

  const { displayName, email, password } = parsed.data;
  const passwordHash = await hashPassword(password);

  const user = await prisma.user.create({
    data: {
      displayName,
      email: email.toLowerCase(),
      passwordHash,
      role: "ADMIN",
      canAutoApprove: true,
    },
  });

  await createSession(user.id);
  redirect("/discover");
}

const loginSchema = z.object({
  email: z.email("Введите корректный email"),
  password: z.string().min(1, "Введите пароль"),
});

export async function login(
  _state: FormState,
  formData: FormData
): Promise<FormState> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Неверные данные" };
  }

  const { email, password } = parsed.data;
  const user = await prisma.user.findUnique({
    where: { email: email.toLowerCase() },
  });
  if (!user || !(await verifyPassword(password, user.passwordHash))) {
    return { error: "Неверный email или пароль" };
  }

  await createSession(user.id);
  redirect("/discover");
}

export async function logout() {
  await deleteSession();
  redirect("/login");
}
