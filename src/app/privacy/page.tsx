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

export default function PrivacyPage() {
    const { t } = useI18n();

    return (
        <PublicLayout>
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
                <div className="mb-12">
                    <span className="inline-block px-3 py-1 rounded-full bg-gold-400/10 border border-gold-400/20 text-gold-400 text-xs font-semibold uppercase tracking-wider mb-4">
                        {t.legalBadge}
                    </span>
                    <h1 className="text-3xl sm:text-4xl font-black text-calx-text mb-3">
                        {t.privacyTitle1}<span className="gradient-text">{t.privacyTitle2}</span>
                    </h1>
                    <p className="text-calx-text-muted text-sm">{t.lastUpdated}</p>
                </div>

                <div className="bg-calx-surface/40 border border-calx-surface rounded-2xl p-6 sm:p-10">
                    <Section title={t.privacyS1Title}>
                        <p>{t.privacyS1P1}</p>
                        <p>{t.privacyS1P2}</p>
                        <p>{t.privacyS1P3}</p>
                    </Section>

                    <Section title={t.privacyS2Title}>
                        <p>
                            <strong>CalX</strong><br />
                            Site web : <a href="https://www.calx.be" className="text-gold-400 hover:underline">www.calx.be</a><br />
                            Contact : <a href="mailto:contact@calx.be" className="text-gold-400 hover:underline">contact@calx.be</a>
                        </p>
                    </Section>

                    <Section title={t.privacyS3Title}>
                        <p>{t.privacyS3Intro}</p>
                        <div className="mt-4 space-y-4">
                            {[
                                { title: t.privacyDataIdTitle, desc: t.privacyDataIdDesc },
                                { title: t.privacyDataBioTitle, desc: t.privacyDataBioDesc },
                                { title: t.privacyDataNutrTitle, desc: t.privacyDataNutrDesc },
                                { title: t.privacyDataExTitle, desc: t.privacyDataExDesc },
                                { title: t.privacyDataSocialTitle, desc: t.privacyDataSocialDesc },
                                { title: t.privacyDataPhotoTitle, desc: t.privacyDataPhotoDesc },
                                { title: t.privacyDataTechTitle, desc: t.privacyDataTechDesc },
                            ].map((item) => (
                                <div key={item.title} className="bg-calx-card/50 rounded-xl p-4 border border-calx-surface">
                                    <h3 className="text-calx-text font-semibold text-sm mb-2">{item.title}</h3>
                                    <p>{item.desc}</p>
                                </div>
                            ))}
                        </div>
                    </Section>

                    <Section title={t.privacyS4Title}>
                        <p>{t.privacyS4Intro}</p>
                        <ul className="list-disc list-inside space-y-1 ml-2">
                            <li>{t.privacyS4F1}</li>
                            <li>{t.privacyS4F2}</li>
                            <li>{t.privacyS4F3}</li>
                            <li>{t.privacyS4F4}</li>
                        </ul>
                        <p>{t.privacyS4End}</p>
                    </Section>

                    <Section title={t.privacyS5Title}>
                        <p>{t.privacyS5Intro}</p>
                        <ul className="list-disc list-inside space-y-1 ml-2">
                            <li>{t.privacyS5F1}</li>
                            <li>{t.privacyS5F2}</li>
                            <li>{t.privacyS5F3}</li>
                            <li>{t.privacyS5F4}</li>
                        </ul>
                        <p><strong>{t.privacyS5Warn}</strong></p>
                        <p>{t.privacyS5End}</p>
                    </Section>

                    <Section title={t.privacyS6Title}>
                        <p>{t.privacyS6Intro}</p>
                        <ul className="list-disc list-inside space-y-1 ml-2">
                            <li>{t.privacyS6F1}</li>
                            <li>{t.privacyS6F2}</li>
                            <li>{t.privacyS6F3}</li>
                        </ul>
                    </Section>

                    <Section title={t.privacyS7Title}>
                        <p>{t.privacyS7Intro}</p>
                        <ul className="list-disc list-inside space-y-1 ml-2">
                            <li>{t.privacyS7F1}</li>
                            <li>{t.privacyS7F2}</li>
                            <li>{t.privacyS7F3}</li>
                        </ul>
                    </Section>

                    <Section title={t.privacyS8Title}>
                        <p>{t.privacyS8Intro}</p>
                        <ul className="list-disc list-inside space-y-1 ml-2">
                            <li>{t.privacyS8F1}</li>
                            <li>{t.privacyS8F2}</li>
                            <li>{t.privacyS8F3}</li>
                            <li>{t.privacyS8F4}</li>
                        </ul>
                    </Section>

                    <Section title={t.privacyS9Title}>
                        <p>{t.privacyS9Intro}</p>
                        <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {[
                                { icon: '🔍', title: t.privacyRight1Title, desc: t.privacyRight1Desc },
                                { icon: '✏️', title: t.privacyRight2Title, desc: t.privacyRight2Desc },
                                { icon: '🗑️', title: t.privacyRight3Title, desc: t.privacyRight3Desc },
                                { icon: '📦', title: t.privacyRight4Title, desc: t.privacyRight4Desc },
                                { icon: '⛔', title: t.privacyRight5Title, desc: t.privacyRight5Desc },
                                { icon: '⏸️', title: t.privacyRight6Title, desc: t.privacyRight6Desc },
                            ].map((right) => (
                                <div key={right.title} className="bg-calx-card/50 rounded-lg p-3 border border-calx-surface">
                                    <p className="text-calx-text font-medium text-xs">{right.icon} {right.title}</p>
                                    <p className="text-[11px] text-calx-text-muted mt-1">{right.desc}</p>
                                </div>
                            ))}
                        </div>
                        <p className="mt-4">{t.privacyS9Contact}</p>
                        <p>{t.privacyS9Authority}</p>
                    </Section>

                    <Section title={t.privacyS10Title}>
                        <p>{t.privacyS10Intro}</p>
                        <ul className="list-disc list-inside space-y-1 ml-2">
                            <li>{t.privacyS10F1}</li>
                            <li>{t.privacyS10F2}</li>
                            <li>{t.privacyS10F3}</li>
                            <li>{t.privacyS10F4}</li>
                        </ul>
                    </Section>

                    <Section title={t.privacyS11Title}>
                        <p>{t.privacyS11P1}</p>
                    </Section>

                    <Section title={t.privacyS11bTitle}>
                        <p>{t.privacyS11bIntro}</p>
                        <ul className="list-disc list-inside space-y-1 ml-2 mt-2">
                            <li>{t.privacyS11bR1}</li>
                            <li>{t.privacyS11bR2}</li>
                            <li>{t.privacyS11bR3}</li>
                            <li>{t.privacyS11bR4}</li>
                            <li>{t.privacyS11bR5}</li>
                            <li>{t.privacyS11bR6}</li>
                        </ul>
                        <p className="mt-3">{t.privacyS11bContact}</p>
                    </Section>

                    <Section title={t.privacyS12Title}>
                        <p>{t.privacyS12P1}</p>
                        <p>{t.privacyS12P2}</p>
                    </Section>

                    <Section title={t.privacyS13Title}>
                        <p>{t.privacyS13P1}</p>
                        <div className="bg-calx-card/50 rounded-xl p-4 border border-calx-surface mt-2">
                            <p><strong className="text-calx-text">{t.contactName}</strong></p>
                            <p>📧 E-mail : <a href="mailto:contact@calx.be" className="text-gold-400 hover:underline">contact@calx.be</a></p>
                            <p>🌐 Site web : <a href="https://www.calx.be" className="text-gold-400 hover:underline">www.calx.be</a></p>
                        </div>
                    </Section>
                </div>
            </div>
        </PublicLayout>
    );
}
