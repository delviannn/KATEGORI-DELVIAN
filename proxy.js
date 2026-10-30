import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

function securityHeaders(response, policy, adminRoute = false) {
  response.headers.set("Content-Security-Policy", policy);
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  if (process.env.NODE_ENV === "production") {
    response.headers.set("Strict-Transport-Security", "max-age=31536000; includeSubDomains");
  }
  if (adminRoute) response.headers.set("Cache-Control", "private, no-store, max-age=0");
  return response;
}

export async function proxy(request) {
  const nonceBytes = crypto.getRandomValues(new Uint8Array(16));
  const nonce = btoa(String.fromCharCode(...nonceBytes));
  const isDevelopment = process.env.NODE_ENV === "development";
  const policy = [
    "default-src 'self'",
    "base-uri 'self'",
    "form-action 'self' https://wa.me",
    "frame-ancestors 'none'",
    "object-src 'none'",
    "img-src 'self' https: data: blob:",
    "font-src 'self' https://fonts.gstatic.com data:",
    `style-src 'self' 'nonce-${nonce}' https://fonts.googleapis.com${isDevelopment ? " 'unsafe-inline'" : ""}`,
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'${isDevelopment ? " 'unsafe-eval'" : ""}`,
    "connect-src 'self'",
    "upgrade-insecure-requests",
  ].join("; ");
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("Content-Security-Policy", policy);
  requestHeaders.set("x-nonce", nonce);
  const adminRoute = request.nextUrl.pathname.startsWith("/admin");
  let response = securityHeaders(NextResponse.next({ request: { headers: requestHeaders } }), policy, adminRoute);

  // This project serves product images directly from Storage and does not use
  // Next's image optimizer. Block its public optimization endpoint entirely.
  if (request.nextUrl.pathname === "/_next/image") {
    return securityHeaders(new NextResponse(null, { status: 404 }), policy);
  }

  if (!adminRoute) return response;
  const pathname = request.nextUrl.pathname;
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) {
    if (pathname === "/admin/login") return response;
    return securityHeaders(NextResponse.redirect(new URL("/admin/login", request.url)), policy, true);
  }

  const supabase = createServerClient(url, key, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        requestHeaders.set("cookie", request.cookies.toString());
        response = securityHeaders(NextResponse.next({ request: { headers: requestHeaders } }), policy, true);
        cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
      },
    },
  });
  let user = null;
  try {
    const result = await supabase.auth.getUser();
    user = result.data.user;
  } catch {
    if (pathname !== "/admin/login") {
      return securityHeaders(new NextResponse("Layanan admin sementara tidak tersedia.", { status: 503 }), policy, true);
    }
  }
  const isAdmin = user?.app_metadata?.role === "admin";
  if (!isAdmin && pathname !== "/admin/login") {
    return securityHeaders(NextResponse.redirect(new URL("/admin/login", request.url)), policy, true);
  }
  if (isAdmin && pathname === "/admin/login") {
    return securityHeaders(NextResponse.redirect(new URL("/admin", request.url)), policy, true);
  }
  return response;
}

export const config = { matcher: ["/((?!_next/static|favicon.ico|icons/).*)"] };
