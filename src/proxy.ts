import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const SESSION_COOKIE = "soundseer_session";
const PROTECTED_PREFIXES = ["/discover", "/artist", "/requests", "/settings"];
const AUTH_ONLY_ROUTES = ["/login"];

async function hasValidSessionCookie(request: NextRequest) {
  const cookieValue = request.cookies.get(SESSION_COOKIE)?.value;
  if (!cookieValue) return false;

  const secretKey = process.env.SESSION_SECRET;
  if (!secretKey) return false;

  try {
    await jwtVerify(cookieValue, new TextEncoder().encode(secretKey), {
      algorithms: ["HS256"],
    });
    return true;
  } catch {
    return false;
  }
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isProtected = PROTECTED_PREFIXES.some((prefix) =>
    pathname.startsWith(prefix)
  );
  const isAuthOnly = AUTH_ONLY_ROUTES.includes(pathname);

  if (!isProtected && !isAuthOnly) {
    return NextResponse.next();
  }

  const authenticated = await hasValidSessionCookie(request);

  if (isProtected && !authenticated) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (isAuthOnly && authenticated) {
    return NextResponse.redirect(new URL("/discover", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
