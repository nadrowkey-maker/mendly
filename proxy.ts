import createMiddleware from "next-intl/middleware";
import { NextRequest, NextResponse } from "next/server";
import { routing } from "@/i18n/routing";
import { updateSession } from "@/lib/supabase/middleware";

const intlMiddleware = createMiddleware(routing);

export async function proxy(request: NextRequest) {
  /*
   * La barre oblique finale, pour les pages uniquement.
   *
   * `next.config.ts` ne redirige plus de lui-même (voir `skipTrailingSlashRedirect`),
   * pour épargner les routes d'API. Les pages gardent une adresse unique, avec
   * la barre finale : sans cette redirection, `/fr/terms` et `/fr/terms/`
   * serviraient la même page sous deux adresses.
   *
   * Le chemin est lu dans l'URL brute et non dans `nextUrl`, qui normalise la
   * barre finale selon la configuration : on ne verrait jamais la différence,
   * et la redirection bouclerait.
   */
  const raw = new URL(request.url);
  if (!raw.pathname.endsWith("/")) {
    return NextResponse.redirect(new URL(`${raw.pathname}/${raw.search}`, request.url), 308);
  }

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