import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { getSupabaseEnv } from "@/lib/supabase/env";

export async function updateSession(request: NextRequest) {
  const env = getSupabaseEnv();

  if (!env) {
    return NextResponse.next({ request });
  }

  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(env.url, env.anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => {
          request.cookies.set(name, value);
        });
        supabaseResponse = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) => {
          supabaseResponse.cookies.set(name, value, options);
        });
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;
  const isLoginPath = pathname === "/login";

  if (!user && !isLoginPath) {
    if (pathname.startsWith("/api/")) {
      return nextJson({ error: "No autorizado." }, 401, supabaseResponse);
    }

    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return nextRedirect(url, supabaseResponse);
  }

  if (user && isLoginPath) {
    const url = request.nextUrl.clone();
    url.pathname = "/";
    return nextRedirect(url, supabaseResponse);
  }

  return supabaseResponse;
}

function nextRedirect(url: URL, supabaseResponse: NextResponse) {
  const redirectResponse = NextResponse.redirect(url);
  copyCookies(supabaseResponse, redirectResponse);
  return redirectResponse;
}

function nextJson(
  body: { error: string },
  status: number,
  supabaseResponse: NextResponse,
) {
  const jsonResponse = NextResponse.json(body, { status });
  copyCookies(supabaseResponse, jsonResponse);
  return jsonResponse;
}

function copyCookies(from: NextResponse, to: NextResponse) {
  from.cookies.getAll().forEach((cookie) => {
    to.cookies.set(cookie.name, cookie.value);
  });
}
