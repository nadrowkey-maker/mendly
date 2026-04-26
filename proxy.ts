import createMiddleware from "next-intl/middleware";
import { NextRequest } from "next/server";
import { routing } from "@/i18n/routing";
import { updateSession } from "@/lib/supabase/middleware";

const intlMiddleware = createMiddleware(routing);

export async function proxy(request: NextRequest) {
  // First refresh the Supabase session (sets cookies if needed)
  const supabaseResponse = await updateSession(request);

  // Then run the next-intl middleware for locale routing
  const intlResponse = intlMiddleware(request);

  // Merge cookies from the Supabase response into the intl response
  if (supabaseResponse.cookies) {
    supabaseResponse.cookies.getAll().forEach((cookie) => {
      intlResponse.cookies.set(cookie);
    });
  }

  return intlResponse;
}

export const config = {
  matcher: [
    // Match all paths except static assets and API routes
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)",
  ],
};