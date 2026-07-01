import "server-only";
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { randomUUID } from "crypto";
import { prisma } from "@/lib/prisma";

const SESSION_COOKIE = "soundseer_session";
const SESSION_DURATION_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

// Read lazily (not at module scope) so importing this module doesn't crash
// build-time page-data collection in environments where env vars are only
// injected at runtime (e.g. Docker images built without a .env file).
function getEncodedKey() {
  const secretKey = process.env.SESSION_SECRET;
  if (!secretKey) {
    throw new Error("SESSION_SECRET environment variable is not set");
  }
  return new TextEncoder().encode(secretKey);
}

type SessionPayload = {
  sessionToken: string;
};

async function encrypt(payload: SessionPayload) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("30d")
    .sign(getEncodedKey());
}

async function decrypt(cookieValue: string | undefined) {
  if (!cookieValue) return null;
  try {
    const { payload } = await jwtVerify(cookieValue, getEncodedKey(), {
      algorithms: ["HS256"],
    });
    return payload as SessionPayload;
  } catch {
    return null;
  }
}

export async function createSession(userId: string) {
  const expiresAt = new Date(Date.now() + SESSION_DURATION_MS);
  const token = randomUUID();

  await prisma.session.create({
    data: { token, userId, expiresAt },
  });

  const cookieValue = await encrypt({ sessionToken: token });
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, cookieValue, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    expires: expiresAt,
    path: "/",
  });
}

export async function getSessionUser() {
  const cookieStore = await cookies();
  const payload = await decrypt(cookieStore.get(SESSION_COOKIE)?.value);
  if (!payload) return null;

  const session = await prisma.session.findUnique({
    where: { token: payload.sessionToken },
    include: { user: true },
  });

  if (!session || session.expiresAt < new Date()) {
    if (session) await prisma.session.delete({ where: { id: session.id } });
    return null;
  }

  return session.user;
}

export async function deleteSession() {
  const cookieStore = await cookies();
  const payload = await decrypt(cookieStore.get(SESSION_COOKIE)?.value);
  if (payload) {
    await prisma.session.deleteMany({ where: { token: payload.sessionToken } });
  }
  cookieStore.delete(SESSION_COOKIE);
}

export { SESSION_COOKIE };
