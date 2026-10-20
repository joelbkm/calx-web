'use client';

import Link from 'next/link';
import Image from 'next/image';
import { DM_Sans, Playfair_Display } from 'next/font/google';
import { useEffect, useState, type ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import { Menu, X } from 'lucide-react';
import { useI18n, type Locale } from '@/i18n';
import { marketing, publicLabels } from '@/components/public/content';
import '@/components/public/public.css';

const sans = DM_Sans({ subsets: ['latin'], display: 'swap', variable: '--font-public-sans' });
const serif = Playfair_Display({ subsets: ['latin'], display: 'swap', variable: '--font-public-serif' });

export default function PublicLayout({ children }: { children: ReactNode }) {
    const { locale, setLocale } = useI18n();
    const copy = marketing[locale];
    const labels = publicLabels[locale];
    const [menuOpen, setMenuOpen] = useState(false);
    const pathname = usePathname();
    useEffect(() => {
        // Public pages share their shell. Start a new page at its heading,
        // while preserving anchors used by app deep links and the navigation.
        const frame = requestAnimationFrame(() => {
            const anchor = window.location.hash.slice(1);
            if (anchor) document.getElementById(anchor)?.scrollIntoView();
            else window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
        });
        return () => cancelAnimationFrame(frame);
    }, [pathname]);

    function changeLocale(next: Locale) {
        setLocale(next);
        const url = new URL(window.location.href);
        url.searchParams.set('lang', next);
        window.history.replaceState(window.history.state, '', url);
    }
    const home = `/?lang=${locale}`;
    const links = [
        { text: copy.navFeatures, href: `${home}#features` },
        { text: copy.navBenefits, href: `${home}#advantages` },
    ];

    return (
        <div className={`calx-public ${sans.variable} ${serif.variable}`}>
            <a className="cx-skip" href="#main-content">{labels.skip}</a>
            <header className="cx-header">
                <div className="cx-wrap">
                    <div className="cx-nav">
                        <Link className="cx-brand" href={home} aria-label="CalX">
                            <Image src="/officel_web_logo.png" width={36} height={36} alt="" />
                            <span>CalX</span>
                        </Link>
                        <nav className="cx-navlinks" aria-label={labels.journey}>
                            {links.map(link => <Link key={link.href} href={link.href}>{link.text}</Link>)}
                        </nav>
                        <div className="cx-navright">
                            <div className="cx-languages" role="group" aria-label="Language / Langue">
                                {(['fr', 'en'] as const).map(lang => (
                                    <button key={lang} type="button" lang={lang} aria-label={lang === 'fr' ? 'Français' : 'English'} aria-pressed={locale === lang} onClick={() => changeLocale(lang)}>
                                        {lang.toUpperCase()}
                                    </button>
                                ))}
                            </div>
                            <Link className="cx-smallcta" href={`${home}#download`}>{copy.download}</Link>
                            <button className="cx-menu-toggle" type="button" aria-label={menuOpen ? labels.close : labels.menu} aria-expanded={menuOpen} aria-controls="public-mobile-menu" onClick={() => setMenuOpen(open => !open)}>
                                {menuOpen ? <X size={22} /> : <Menu size={22} />}
                            </button>
                        </div>
                    </div>
                    {menuOpen && (
                        <nav id="public-mobile-menu" className="cx-mobile-menu" aria-label={labels.journey} onKeyDown={event => { if (event.key === 'Escape') setMenuOpen(false); }}>
                            {[...links, { text: copy.download, href: `${home}#download` }].map(link => (
                                <Link key={link.href} href={link.href} onClick={() => setMenuOpen(false)}>{link.text}</Link>
                            ))}
                        </nav>
                    )}
                </div>
            </header>
            <main id="main-content" tabIndex={-1}>{children}</main>
            <div className="cx-wrap">
                <footer className="cx-footer">
                    <Link href={home} className="cx-brand">CalX <small>© {new Date().getFullYear()}</small></Link>
                    <nav className="cx-footlinks" aria-label={locale === 'fr' ? 'Informations' : 'Information'}>
                        <Link href={`/privacy/?lang=${locale}`}>{copy.privacy}</Link>
                        <Link href={`/terms/?lang=${locale}`}>{copy.terms}</Link>
                        <a href="mailto:contact@calx.be">contact@calx.be</a>
                    </nav>
                </footer>
            </div>
        </div>
    );
}
