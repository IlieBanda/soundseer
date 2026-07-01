import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { LoginForm } from "./login-form";

// Always re-check user count — must never be statically cached.
export const dynamic = "force-dynamic";

export default async function LoginPage() {
  const userCount = await prisma.user.count();
  if (userCount === 0) {
    redirect("/setup");
  }

  return <LoginForm />;
}
