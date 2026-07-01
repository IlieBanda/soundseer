"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { hashPassword } from "@/lib/password";

export type UserActionState = { error?: string; success?: boolean } | undefined;

const createUserSchema = z.object({
  displayName: z.string().trim().min(1, "Введите имя"),
  email: z.email("Введите корректный email"),
  password: z.string().min(8, "Минимум 8 символов"),
});

export async function createUser(
  _state: UserActionState,
  formData: FormData
): Promise<UserActionState> {
  await requireAdmin();

  const parsed = createUserSchema.safeParse({
    displayName: formData.get("displayName"),
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Неверные данные" };
  }

  const { displayName, email, password } = parsed.data;
  const existing = await prisma.user.findUnique({
    where: { email: email.toLowerCase() },
  });
  if (existing) {
    return { error: "Пользователь с таким email уже существует" };
  }

  await prisma.user.create({
    data: {
      displayName,
      email: email.toLowerCase(),
      passwordHash: await hashPassword(password),
      role: "USER",
      canAutoApprove: false,
    },
  });

  revalidatePath("/settings/users");
  return { success: true };
}

export async function updateUserAccess(formData: FormData) {
  const admin = await requireAdmin();

  const userId = formData.get("userId");
  if (typeof userId !== "string") return;
  if (userId === admin.id) return; // prevent self-demotion lockout

  const role = formData.get("role") === "ADMIN" ? "ADMIN" : "USER";
  const canAutoApprove = formData.get("canAutoApprove") === "on";

  await prisma.user.update({
    where: { id: userId },
    data: { role, canAutoApprove },
  });

  revalidatePath("/settings/users");
}

export async function deleteUser(formData: FormData) {
  const admin = await requireAdmin();

  const userId = formData.get("userId");
  if (typeof userId !== "string" || userId === admin.id) return;

  await prisma.user.delete({ where: { id: userId } });

  revalidatePath("/settings/users");
}
