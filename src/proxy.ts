import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { getSupabaseEnv } from "@/src/lib/supabase/env";
import { applySecurityHeaders } from "@/src/lib/security/headers";
import { isStaffRole } from "@/src/lib/permissions/roles";
import { isAllowedOrigin, safeInternalPath } from "@/src/lib/security/urls";
import { hasPermission, permissionForAdminPath } from "@/src/lib/security/permissions";

function cookieOptions(options: Record<string, unknown> | undefined, request: NextRequest) {
  return {
    ...options,
    httpOnly: true,
    sameSite: "lax" as const,
    secure: request.nextUrl.protocol === "https:",
    path: "/",
  };
}

export async function proxy(request: NextRequest) {
  const env = getSupabaseEnv();
  const isAdminRoute = request.nextUrl.pathname.startsWith("/admin");
  const isPortalAuth = request.nextUrl.pathname.startsWith("/portal/auth");
  const isMutating =
    request.method !== "GET" && request.method !== "HEAD" && request.method !== "OPTIONS";

  if (isMutating && request.nextUrl.pathname.startsWith("/admin")) {
    const origin = request.headers.get("origin");
    const host = request.headers.get("host");
    if (origin && !isAllowedOrigin(origin, host)) {
      return new NextResponse("Forbidden", { status: 403 });
    }
  }

  if (!env) {
    const response = isAdminRoute
      ? NextResponse.redirect(new URL("/portal/auth", request.url))
      : NextResponse.next({ request });
    applySecurityHeaders(response.headers, {
      isAdmin: isAdminRoute,
      isProduction: request.nextUrl.protocol === "https:",
    });
    return response;
  }

  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(env.url, env.anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        supabaseResponse = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, cookieOptions(options, request))
        );
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (isAdminRoute && !user) {
    const url = request.nextUrl.clone();
    url.pathname = "/portal/auth";
    url.searchParams.set("redirect", safeInternalPath(request.nextUrl.pathname));
    const response = NextResponse.redirect(url);
    applySecurityHeaders(response.headers, { isAdmin: true, isProduction: request.nextUrl.protocol === "https:" });
    return response;
  }

  if (isAdminRoute && user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role, is_active, email")
      .eq("id", user.id)
      .maybeSingle();

    if (!profile || !profile.is_active || !isStaffRole(profile.role)) {
      const url = request.nextUrl.clone();
      url.pathname = "/portal/auth";
      const response = NextResponse.redirect(url);
      applySecurityHeaders(response.headers, { isAdmin: true, isProduction: request.nextUrl.protocol === "https:" });
      return response;
    }

    const needed = permissionForAdminPath(request.nextUrl.pathname);
    if (
      needed !== "dashboard" &&
      !hasPermission(
        { role: profile.role, is_active: profile.is_active, email: profile.email },
        needed
      )
    ) {
      const url = request.nextUrl.clone();
      url.pathname = "/admin";
      const response = NextResponse.redirect(url);
      applySecurityHeaders(response.headers, { isAdmin: true, isProduction: request.nextUrl.protocol === "https:" });
      return response;
    }
  }

  if (isPortalAuth && user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role, is_active")
      .eq("id", user.id)
      .maybeSingle();

    if (profile && profile.is_active && isStaffRole(profile.role)) {
      const url = request.nextUrl.clone();
      url.pathname = "/admin";
      const response = NextResponse.redirect(url);
      applySecurityHeaders(response.headers, { isAdmin: true, isProduction: request.nextUrl.protocol === "https:" });
      return response;
    }
  }

  applySecurityHeaders(supabaseResponse.headers, {
    isAdmin: isAdminRoute,
    isProduction: request.nextUrl.protocol === "https:",
  });
  return supabaseResponse;
}

export const config = {
  matcher: ["/admin", "/admin/:path*", "/portal", "/portal/:path*"],
};
