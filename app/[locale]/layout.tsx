import { NextIntlClientProvider, hasLocale } from 'next-intl';
import { notFound } from 'next/navigation';
import { routing } from '@/i18n/routing';
import { GeistSans } from 'geist/font/sans';
import { GeistMono } from 'geist/font/mono';
import { Cormorant_Garamond } from 'next/font/google';
import { TubeCursor } from '@/components/ui/TubeCursor';
import { TransitionPortal } from '@/components/ui/TransitionPortal';
import '../globals.css';

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
      className={`dark ${GeistSans.variable} ${GeistMono.variable} ${cormorant.variable}`}
    >
      <body className="antialiased bg-(--bg-primary) text-(--text-primary) font-sans">
        <NextIntlClientProvider>{children}</NextIntlClientProvider>
        <TubeCursor />
        <TransitionPortal />
      </body>
    </html>
  );
}
