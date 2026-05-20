'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import { Menu, X } from 'lucide-react';
import type { ReactNode } from 'react';
import { useI18n } from '@/i18n';
import LanguageSelector from '@/components/LanguageSelector';

export default function PublicLayout({ children }: { children: ReactNode }) {
    const { t } = useI18n();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const NAV_LINKS = [
        { label: t.navFeatures, href: '/#features' },
        { label: t.navAdvantages, href: '/#advantages' },
        { label: t.navPricing, href: '/#download' },
    ];

    return (
        <div className="min-h-screen bg-calx-bg">
            {/* Navbar */}
            <header className="fixed top-0 inset-x-0 z-50 backdrop-blur-xl bg-calx-bg/80 border-b border-calx-surface/50">
                <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-2">
                        <Image
                            src="/officel_web_logo.png"
                            alt="CalX Logo"
                            width={40}
                            height={40}
                            className="object-contain"
                        />
                    </Link>

                    {/* Desktop Nav */}
                    <div className="hidden md:flex items-center gap-8">
                        {NAV_LINKS.map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                className="text-sm text-calx-text-secondary hover:text-calx-text transition-colors"
                            >
                                {link.label}
                            </Link>
                        ))}
                        {/* Admin link removed from public nav for security through obscurity.
                            Admins access the back-office via the obscure /cockpit/admin path. */}
                        <LanguageSelector />
                        <Link
                            href="/#download"
                            className="px-4 py-2 bg-gradient-to-r from-gold-400 to-gold-600 text-black font-semibold text-sm rounded-full hover:shadow-lg hover:shadow-gold-400/25 transition-all"
                        >
                            {t.navDownload}
                        </Link>
                    </div>

                    {/* Mobile menu button */}
                    <div className="flex items-center gap-3 md:hidden">
                        <LanguageSelector />
                        <button
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            className="p-2 text-calx-text-secondary hover:text-calx-text"
                        >
                            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                        </button>
                    </div>
                </nav>

                {/* Mobile menu */}
                {mobileMenuOpen && (
                    <div className="md:hidden border-t border-calx-surface bg-calx-bg px-4 py-4 space-y-3">
                        {NAV_LINKS.map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                className="block py-2 text-calx-text-secondary hover:text-calx-text transition-colors"
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                {link.label}
                            </Link>
                        ))}
                        <Link
                            href="/#download"
                            className="block w-full text-center px-4 py-2.5 bg-gradient-to-r from-gold-400 to-gold-600 text-black font-semibold text-sm rounded-full"
                            onClick={() => setMobileMenuOpen(false)}
                        >
                            {t.navDownloadCalx}
                        </Link>
                    </div>
                )}
            </header>

            {/* Content */}
            <main className="pt-16">{children}</main>

            {/* Footer */}
            <footer className="border-t border-calx-surface bg-calx-bg">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                        <div className="md:col-span-2">
                            <Image
                                src="/officel_web_logo.png"
                                alt="CalX Logo"
                                width={36}
                                height={36}
                                className="object-contain"
                            />
                            <p className="mt-3 text-calx-text-secondary text-sm max-w-md">
                                {t.footerDesc}
                            </p>
                        </div>
                        <div>
                            <h4 className="text-calx-text font-semibold mb-3">{t.footerApp}</h4>
                            <ul className="space-y-2 text-sm text-calx-text-secondary">
                                <li><Link href="/#features" className="hover:text-calx-text transition-colors">{t.footerFeatures}</Link></li>
                                <li><Link href="/#download" className="hover:text-calx-text transition-colors">{t.footerPricing}</Link></li>
                                <li><Link href="/#download" className="hover:text-calx-text transition-colors">{t.footerDownload}</Link></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="text-calx-text font-semibold mb-3">{t.footerLegal}</h4>
                            <ul className="space-y-2 text-sm text-calx-text-secondary">
                                <li><Link href="/privacy" className="hover:text-calx-text transition-colors">{t.footerPrivacy}</Link></li>
                                <li><Link href="/terms" className="hover:text-calx-text transition-colors">{t.footerTerms}</Link></li>
                                <li><a href="mailto:contact@calx.be" className="hover:text-calx-text transition-colors">{t.footerContact}</a></li>
                            </ul>
                        </div>
                    </div>
                    <div className="mt-8 pt-8 border-t border-calx-surface text-center text-xs text-calx-text-muted">
                        © {new Date().getFullYear()} CalX. {t.footerRights}
                    </div>
                </div>
            </footer>
        </div>
    );
}
