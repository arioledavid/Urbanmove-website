/**
 * Single place for hostname routing decisions (ADR 001).
 * Extend here when adding future subdomains (portal, driver app, etc.).
 */

const ADMIN_HOSTS = new Set([
  "admin.urbanmovelogistics.co.uk",
  "admin.localhost",
  "admin.lvh.me",
]);

const LOCAL_ADMIN_HOST = "admin.lvh.me";

export function getHostname(request: {
  headers: Headers;
}): string {
  const raw =
    request.headers.get("x-forwarded-host") ??
    request.headers.get("host") ??
    "";
  return raw.split(":")[0]!.toLowerCase();
}

export function isAdminHost(host: string): boolean {
  return ADMIN_HOSTS.has(host);
}

export function getAdminOrigin(request: {
  headers: Headers;
  nextUrl: URL;
}): string {
  const host = getHostname(request);
  const port = request.nextUrl.port || "3000";
  const protocol = request.nextUrl.protocol || "http:";

  if (host === "admin.localhost" || host === "admin.lvh.me") {
    return `${protocol}//${host}:${port}`;
  }

  if (host === "localhost" || host === "127.0.0.1") {
    // lvh.me resolves to 127.0.0.1 in Node (admin.localhost often does not).
    return `${protocol}//${LOCAL_ADMIN_HOST}:${port}`;
  }

  return (
    process.env.ADMIN_ORIGIN ?? "https://admin.urbanmovelogistics.co.uk"
  );
}
