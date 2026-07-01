import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/session";

export const getCurrentUser = cache(getSessionUser);

export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  return user;
}

export async function requireAdmin() {
  const user = await requireUser();
  if (user.role !== "ADMIN") redirect("/discover");
  return user;
}
