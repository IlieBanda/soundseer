import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

// Always re-check user count / session — must never be statically cached.
export const dynamic = "force-dynamic";

export default async function Home() {
  const userCount = await prisma.user.count();
  if (userCount === 0) {
    redirect("/setup");
  }

  const user = await getCurrentUser();
  redirect(user ? "/discover" : "/login");
}
