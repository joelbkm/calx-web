'use client';

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { ReactNode } from 'react';
import fr from './fr';
import en from './en';
import type { Translations } from './fr';

type Locale = 'fr' | 'en';

interface I18nContextType {
    locale: Locale;
    t: Translations;
    setLocale: (locale: Locale) => void;
}

const translations: Record<Locale, Translations> = { fr, en };

const I18nContext = createContext<I18nContextType>({
    locale: 'fr',
    t: fr,
    setLocale: () => { },
});

export function I18nProvider({ children }: { children: ReactNode }) {
    const [locale, setLocaleState] = useState<Locale>('fr');

    useEffect(() => {
        const saved = localStorage.getItem('calx-locale') as Locale | null;
        if (saved && translations[saved]) {
            setLocaleState(saved);
            document.documentElement.lang = saved;
        }
    }, []);

    const setLocale = useCallback((newLocale: Locale) => {
        setLocaleState(newLocale);
        localStorage.setItem('calx-locale', newLocale);
        document.documentElement.lang = newLocale;
    }, []);

    return (
        <I18nContext.Provider value={{ locale, t: translations[locale], setLocale }}>
            {children}
        </I18nContext.Provider>
    );
}

export function useI18n() {
    return useContext(I18nContext);
}

export type { Locale };
