import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { SetupForm } from "./setup-form";

// Always re-check user count — must never be statically cached.
export const dynamic = "force-dynamic";

export default async function SetupPage() {
  const userCount = await prisma.user.count();
  if (userCount > 0) {
    redirect("/login");
  }

  return (
    <>
      <p className="mb-6 text-center text-sm text-zinc-400">
        Создайте аккаунт администратора, чтобы начать.
      </p>
      <SetupForm />
    </>
  );
}
