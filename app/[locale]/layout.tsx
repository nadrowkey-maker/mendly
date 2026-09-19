import type { Metadata } from 'next';
import { NextIntlClientProvider, hasLocale } from 'next-intl';
import { getTranslations } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { routing } from '@/i18n/routing';
import { BRAND, SITE_URL } from '@/lib/seo/site';
import { Manrope, JetBrains_Mono, Cormorant_Garamond } from 'next/font/google';
import { AuthProvider } from '@/lib/supabase/auth-context';
import '../globals.css';

// Manrope porte tout : le display en 200 et le texte en 400/500. Le contraste
// de graisse fait le travail à la place d'une seconde famille — c'est ce qui
// donne l'aplomb des grands titres fins sans multiplier les fontes.
const manrope = Manrope({
  subsets: ['latin'],
  variable: '--font-sans',
  weight: ['200', '300', '400', '500', '600', '700'],
  display: 'swap',
});

// Télémétrie : compteurs, horodatages, étiquettes techniques.
const jetbrains = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  weight: ['400', '500'],
  display: 'swap',
});

// Conservé pour les pages éditoriales (manifeste, contact), hors identité
// principale.
const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  variable: '--font-fraunces',
  style: ['normal', 'italic'],
  weight: ['300', '400', '500', '600', '700'],
});

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

/**
 * Ce que toute page hérite, sauf mention contraire.
 *
 * `metadataBase` est la pièce qui manquait : sans elle, Next écrit les
 * adresses d'images et de canoniques en relatif, et un aperçu de partage en
 * relatif n'est résolu par aucun réseau — le lien sort sans vignette.
 *
 * Le gabarit de titre évite d'écrire « · Mendly » dans chaque page, et le nom
 * de marque en fin de titre est ce qui permet à une recherche sur le nom de
 * faire remonter n'importe laquelle de nos pages.
 */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'home.meta' });

  return {
    metadataBase: new URL(SITE_URL),
    title: { default: t('title'), template: `%s · ${BRAND}` },
    description: t('description'),
    applicationName: BRAND,
    manifest: '/manifest.webmanifest',
    icons: {
      icon: [
        { url: '/favicon.ico', sizes: '256x256' },
        { url: '/icons/mendly-192.png', type: 'image/png', sizes: '192x192' },
      ],
      apple: [{ url: '/icons/mendly-180.png', sizes: '180x180' }],
    },
    formatDetection: { telephone: false },
    // Renseigner NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION une fois le site
    // revendiqué dans la Search Console : c'est ce qui autorise à demander
    // l'indexation au lieu de l'attendre.
    verification: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION
      ? { google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION }
      : undefined,
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  return (
    <html
      lang={locale}
      className={`dark ${manrope.variable} ${jetbrains.variable} ${cormorant.variable}`}
    >
      <body className="antialiased bg-(--bg-primary) text-(--text-primary) font-sans">
        <NextIntlClientProvider>
          <AuthProvider>{children}</AuthProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
