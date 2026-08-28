import { NextIntlClientProvider, hasLocale } from 'next-intl';
import { notFound } from 'next/navigation';
import { routing } from '@/i18n/routing';
import { Manrope, JetBrains_Mono, Cormorant_Garamond } from 'next/font/google';
import { AuthProvider } from '@/lib/supabase/auth-context';
// import { TubeCursor } from '@/components/ui/TubeCursor'; // disabled: causes Three.js double-import + global freeze on Hero
// import { TransitionPortal } from '@/components/ui/TransitionPortal'; // disabled: GPU saturation
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
        {/* <TubeCursor /> — disabled: causes Three.js double-import + global freeze on Hero */}
        {/* <TransitionPortal /> — disabled: WebGL shader running globally was saturating GPU */}
      </body>
    </html>
  );
}
