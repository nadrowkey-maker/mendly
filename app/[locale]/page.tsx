import { useTranslations } from 'next-intl';
import { routing } from '@/i18n/routing';

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default function HomePage() {
  const t = useTranslations('hero');

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-8 text-center">
      <div className="text-xs text-purple-400 mb-4 tracking-widest">
        {t('eyebrow')}
      </div>
      <h1 className="text-5xl md:text-7xl font-bold mb-4">
        {t('title')}
      </h1>
      <p className="italic text-2xl text-white/60 mb-8">
        {t('titleEm')}
      </p>
      <p className="text-white/70 max-w-xl mb-8">
        {t('sub')}
      </p>
      <div className="flex gap-4">
        <button className="px-6 py-3 bg-purple-600 rounded-full font-bold">
          {t('ctaPrimary')}
        </button>
        <button className="px-6 py-3 border border-white/20 rounded-full">
          {t('ctaSecondary')}
        </button>
      </div>
    </main>
  );
}