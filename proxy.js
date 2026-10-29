import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

function securityHeaders(response, policy) {
  response.headers.set("Content-Security-Policy", policy);
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  if (process.env.NODE_ENV === "production") {
    response.headers.set("Strict-Transport-Security", "max-age=63072000; includeSubDomains; preload");
  }
  return response;
}

export async function proxy(request) {
  const nonceBytes = crypto.getRandomValues(new Uint8Array(16));
  const nonce = btoa(String.fromCharCode(...nonceBytes));
  const policy = [
    "default-src 'self'",
    "base-uri 'self'",
    "form-action 'self' https://wa.me",
    "frame-ancestors 'none'",
    "object-src 'none'",
    "img-src 'self' https: data: blob:",
    "font-src 'self' https://fonts.gstatic.com data:",
    `style-src 'self' 'nonce-${nonce}' https://fonts.googleapis.com`,
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'`,
    "connect-src 'self' https://*.supabase.co https://api.openai.com https://generativelanguage.googleapis.com",
    "upgrade-insecure-requests",
  ].join("; ");
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("Content-Security-Policy", policy);
  requestHeaders.set("x-nonce", nonce);
  let response = securityHeaders(NextResponse.next({ request: { headers: requestHeaders } }), policy);

  if (!request.nextUrl.pathname.startsWith("/admin")) return response;
  const pathname = request.nextUrl.pathname;
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) {
    if (pathname === "/admin/login") return response;
    return securityHeaders(NextResponse.redirect(new URL("/admin/login", request.url)), policy);
  }

  const supabase = createServerClient(url, key, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = securityHeaders(NextResponse.next({ request: { headers: requestHeaders } }), policy);
        cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
      },
    },
  });
  const { data: { user } } = await supabase.auth.getUser();
  if (!user && pathname !== "/admin/login") {
    return securityHeaders(NextResponse.redirect(new URL("/admin/login", request.url)), policy);
  }
  if (user && pathname === "/admin/login") {
    return securityHeaders(NextResponse.redirect(new URL("/admin", request.url)), policy);
  }
  return response;
}

export const config = { matcher: ["/((?!_next/static|_next/image|favicon.ico|icons/).*)"] };
