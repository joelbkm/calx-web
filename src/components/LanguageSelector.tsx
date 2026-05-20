'use client';

import { useI18n } from '@/i18n';
import type { Locale } from '@/i18n';

const LANGUAGES: { code: Locale; flag: string; label: string }[] = [
    { code: 'fr', flag: '🇫🇷', label: 'FR' },
    { code: 'en', flag: '🇬🇧', label: 'EN' },
];

export default function LanguageSelector() {
    const { locale, setLocale } = useI18n();

    return (
        <div className="flex items-center gap-1 p-0.5 rounded-full bg-calx-surface/80 border border-calx-surface">
            {LANGUAGES.map((lang) => (
                <button
                    key={lang.code}
                    onClick={() => setLocale(lang.code)}
                    className={`
            flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium transition-all
            ${locale === lang.code
                            ? 'bg-gold-400/20 text-gold-400 border border-gold-400/30'
                            : 'text-calx-text-muted hover:text-calx-text-secondary border border-transparent'
                        }
          `}
                    aria-label={`Switch to ${lang.label}`}
                >
                    <span className="text-sm">{lang.flag}</span>
                    <span>{lang.label}</span>
                </button>
            ))}
        </div>
    );
}
