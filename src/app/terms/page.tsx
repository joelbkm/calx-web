'use client';

import PublicLayout from '@/components/layout/PublicLayout';
import { useI18n } from '@/i18n';

interface SectionProps {
    title: string;
    children: React.ReactNode;
}

function Section({ title, children }: SectionProps) {
    return (
        <section className="mb-10">
            <h2 className="text-xl font-bold text-calx-text mb-4 flex items-center gap-2">
                <span className="w-1 h-6 bg-gradient-to-b from-gold-400 to-gold-600 rounded-full" />
                {title}
            </h2>
            <div className="text-calx-text-secondary text-sm leading-relaxed space-y-3">
                {children}
            </div>
        </section>
    );
}

export default function TermsPage() {
    const { t } = useI18n();

    return (
        <PublicLayout>
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
                <div className="mb-12">
                    <span className="inline-block px-3 py-1 rounded-full bg-gold-400/10 border border-gold-400/20 text-gold-400 text-xs font-semibold uppercase tracking-wider mb-4">
                        {t.legalBadge}
                    </span>
                    <h1 className="text-3xl sm:text-4xl font-black text-calx-text mb-3">
                        {t.termsTitle1}<span className="gradient-text">{t.termsTitle2}</span>
                    </h1>
                    <p className="text-calx-text-muted text-sm">{t.lastUpdated}</p>
                </div>

                <div className="bg-calx-surface/40 border border-calx-surface rounded-2xl p-6 sm:p-10">
                    <Section title={t.termsS1Title}>
                        <p>{t.termsS1P1}</p>
                        <p>{t.termsS1P2}</p>
                    </Section>

                    <Section title={t.termsS2Title}>
                        <p>{t.termsS2Intro}</p>
                        <div className="mt-4 space-y-3">
                            {[
                                { title: t.termsService1Title, desc: t.termsService1Desc },
                                { title: t.termsService2Title, desc: t.termsService2Desc },
                                { title: t.termsService3Title, desc: t.termsService3Desc },
                                { title: t.termsService4Title, desc: t.termsService4Desc },
                                { title: t.termsService5Title, desc: t.termsService5Desc },
                                { title: t.termsService6Title, desc: t.termsService6Desc },
                                { title: t.termsService7Title, desc: t.termsService7Desc },
                                { title: t.termsService8Title, desc: t.termsService8Desc },
                            ].map((service) => (
                                <div key={service.title} className="bg-calx-card/50 rounded-xl p-4 border border-calx-surface">
                                    <h3 className="text-calx-text font-semibold text-sm mb-1">{service.title}</h3>
                                    <p className="text-xs text-calx-text-muted">{service.desc}</p>
                                </div>
                            ))}
                        </div>
                    </Section>

                    <Section title={t.termsS3Title}>
                        <p>{t.termsS3Intro}</p>
                        <ul className="list-disc list-inside space-y-1 ml-2">
                            <li>{t.termsS3F1}</li>
                            <li>{t.termsS3F2}</li>
                            <li>{t.termsS3F3}</li>
                            <li>{t.termsS3F4}</li>
                        </ul>
                        <p>{t.termsS3End}</p>
                    </Section>

                    <Section title={t.termsS4Title}>
                        <div className="bg-gold-400/10 border border-gold-400/30 rounded-xl p-5 mt-2">
                            <h3 className="text-gold-400 font-bold text-sm mb-3 flex items-center gap-2">{t.termsS4Warn}</h3>
                            <div className="space-y-2 text-calx-text-secondary text-sm">
                                <p>{t.termsS4P1}</p>
                                <p><strong>{t.termsS4P2}</strong></p>
                                <ul className="list-disc list-inside space-y-1 ml-2">
                                    <li>{t.termsS4F1}</li>
                                    <li>{t.termsS4F2}</li>
                                    <li>{t.termsS4F3}</li>
                                    <li>{t.termsS4F4}</li>
                                </ul>
                                <p className="mt-2">{t.termsS4End}</p>
                            </div>
                        </div>
                    </Section>

                    <Section title={t.termsS5Title}>
                        <p>{t.termsS5P1}</p>
                        <p>{t.termsS5P2}</p>
                    </Section>

                    <Section title={t.termsS6Title}>
                        <p>{t.termsS6Intro}</p>
                        <ul className="list-disc list-inside space-y-1 ml-2">
                            <li>{t.termsS6F1}</li>
                            <li>{t.termsS6F2}</li>
                            <li>{t.termsS6F3}</li>
                            <li>{t.termsS6F4}</li>
                            <li>{t.termsS6F5}</li>
                            <li>{t.termsS6F6}</li>
                        </ul>
                        <p>{t.termsS6End}</p>
                    </Section>

                    <Section title={t.termsS7Title}>
                        <p>{t.termsS7P1}</p>
                        <p>{t.termsS7P2}</p>
                    </Section>

                    <Section title={t.termsS8Title}>
                        <p>{t.termsS8P1}</p>
                        <p>{t.termsS8P2}</p>
                        <p>{t.termsS8P3}</p>
                        <p>{t.termsS8P4}</p>
                    </Section>

                    <Section title={t.termsS9Title}>
                        <p>{t.termsS9P1}</p>
                        <ul className="list-disc list-inside space-y-1 ml-2">
                            <li>{t.termsS9F1}</li>
                            <li>{t.termsS9F2}</li>
                            <li>{t.termsS9F3}</li>
                            <li>{t.termsS9F4}</li>
                        </ul>
                        <p>{t.termsS9End}</p>
                    </Section>

                    <Section title={t.termsS10Title}>
                        <p>{t.termsS10P1}</p>
                        <p>{t.termsS10P2}</p>
                        <p>{t.termsS10P3} <a href="/privacy" className="text-gold-400 hover:underline">{t.footerPrivacy}</a>.</p>
                    </Section>

                    <Section title={t.termsS11Title}>
                        <p>{t.termsS11P1}</p>
                        <p>{t.termsS11P2}</p>
                    </Section>

                    <Section title={t.termsS12Title}>
                        <p>{t.termsS12Intro}</p>
                        <ul className="list-disc list-inside space-y-1 ml-2">
                            <li>{t.termsS12F1}</li>
                            <li>{t.termsS12F2}</li>
                        </ul>
                        <p>{t.termsS12End}</p>
                    </Section>

                    <Section title={t.termsS13Title}>
                        <p>{t.termsS13P1}</p>
                    </Section>

                    <Section title={t.termsS14Title}>
                        <p>{t.termsS14P1}</p>
                        <div className="bg-calx-card/50 rounded-xl p-4 border border-calx-surface mt-2">
                            <p><strong className="text-calx-text">{t.contactSupportName}</strong></p>
                            <p>📧 E-mail : <a href="mailto:contact@calx.be" className="text-gold-400 hover:underline">contact@calx.be</a></p>
                            <p>🌐 Site web : <a href="https://www.calx.be" className="text-gold-400 hover:underline">www.calx.be</a></p>
                        </div>
                    </Section>
                </div>
            </div>
        </PublicLayout>
    );
}
