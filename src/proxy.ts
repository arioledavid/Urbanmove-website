import NextAuth from "next-auth";
import { NextResponse } from "next/server";
import { authConfig } from "@/auth.config";
import { getAdminOrigin, getHostname, isAdminHost } from "@/lib/hosts";

const { auth } = NextAuth(authConfig);

function stripAdminPrefix(pathname: string): string {
  if (pathname === "/admin") return "/";
  if (pathname.startsWith("/admin/")) {
    return pathname.slice("/admin".length) || "/";
  }
  return pathname;
}

function isServerActionRequest(request: Request): boolean {
  if (request.method !== "POST") return false;
  return (
    request.headers.has("next-action") ||
    request.headers.has("Next-Action") ||
    Boolean(request.headers.get("content-type")?.includes("multipart/form-data"))
  );
}

/**
 * Host routing, URL normalization, auth gating only (ADR 001).
 *
 * Important: we rewrite clean paths → `/admin/*`, but we do NOT redirect
 * `/admin/*` → clean paths. That redirect + rewrite combination loops
 * (e.g. /login → rewrite /admin/login → redirect /login → …) and blanked
 * the admin app on admin.lvh.me.
 */
export default auth((request) => {
  const host = getHostname(request);
  const { pathname, search } = request.nextUrl;

  if (
    pathname === "/manifest.webmanifest" ||
    pathname === "/manifest.json" ||
    pathname === "/robots.txt" ||
    pathname === "/sitemap.xml"
  ) {
    return NextResponse.next();
  }

  if (!isAdminHost(host)) {
    if (pathname === "/admin" || pathname.startsWith("/admin/")) {
      const cleanPath = stripAdminPrefix(pathname);
      const target = new URL(cleanPath + search, getAdminOrigin(request));
      return NextResponse.redirect(target, 308);
    }
    return NextResponse.next();
  }

  // —— Admin host ——

  if (pathname.startsWith("/api/")) {
    return NextResponse.next();
  }

  // Already on the internal /admin tree — serve as-is (no clean-URL redirect).
  if (pathname === "/admin" || pathname.startsWith("/admin/")) {
    const isPublicAdminPath =
      pathname === "/admin/login" || pathname.startsWith("/admin/login/");
    const serverAction = isServerActionRequest(request);

    if (!isPublicAdminPath && !serverAction) {
      const session = request.auth;
      if (!session?.user?.id || session.user.active === false) {
        const login = new URL("/login", request.url);
        login.searchParams.set(
          "callbackUrl",
          stripAdminPrefix(pathname) + search,
        );
        return NextResponse.redirect(login);
      }
    }

    return NextResponse.next();
  }

  const internalPath = pathname === "/" ? "/admin" : `/admin${pathname}`;
  const isPublicAdminPath =
    internalPath === "/admin/login" ||
    internalPath.startsWith("/admin/login/");
  const serverAction = isServerActionRequest(request);

  if (!isPublicAdminPath && !serverAction) {
    const session = request.auth;
    if (!session?.user?.id || session.user.active === false) {
      const login = new URL("/login", request.url);
      login.searchParams.set("callbackUrl", pathname + search);
      return NextResponse.redirect(login);
    }
  }

  const rewriteUrl = request.nextUrl.clone();
  rewriteUrl.pathname = internalPath;
  return NextResponse.rewrite(rewriteUrl);
});

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
