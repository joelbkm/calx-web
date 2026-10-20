'use client';

import LegalPage, { LegalSection } from '@/components/public/LegalPage';
import { publicLabels } from '@/components/public/content';
import { useI18n } from '@/i18n';

export default function TermsPage() {
    const { t, locale } = useI18n();
    const labels = publicLabels[locale];

    return (
        <LegalPage title={`${t.termsTitle1}${t.termsTitle2}`} updated={t.lastUpdated} badge={t.legalBadge} sections={[t.termsS1Title, t.termsS2Title, t.termsS3Title, t.termsS4Title, t.termsS5Title, t.termsS6Title, t.termsS7Title, t.termsS8Title, t.termsS9Title, t.termsS10Title, t.termsS11Title, t.termsS12Title, t.termsS13Title, t.termsS14Title]}>
                    <LegalSection id="legal-section-1" title={t.termsS1Title}>
                        <p>{t.termsS1P1}</p>
                        <p>{t.termsS1P2}</p>
                    </LegalSection>

                    <LegalSection id="legal-section-2" title={t.termsS2Title}>
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
                    </LegalSection>

                    <LegalSection id="legal-section-3" title={t.termsS3Title}>
                        <p>{t.termsS3Intro}</p>
                        <ul className="list-disc list-inside space-y-1 ml-2">
                            <li>{t.termsS3F1}</li>
                            <li>{t.termsS3F2}</li>
                            <li>{t.termsS3F3}</li>
                            <li>{t.termsS3F4}</li>
                        </ul>
                        <p>{t.termsS3End}</p>
                    </LegalSection>

                    <LegalSection id="legal-section-4" title={t.termsS4Title}>
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
                    </LegalSection>

                    <LegalSection id="legal-section-5" title={t.termsS5Title}>
                        <p>{t.termsS5P1}</p>
                        <p>{t.termsS5P2}</p>
                    </LegalSection>

                    <LegalSection id="legal-section-6" title={t.termsS6Title}>
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
                    </LegalSection>

                    <LegalSection id="legal-section-7" title={t.termsS7Title}>
                        <p>{t.termsS7P1}</p>
                        <p>{t.termsS7P2}</p>
                    </LegalSection>

                    <LegalSection id="legal-section-8" title={t.termsS8Title}>
                        <p>{t.termsS8P1}</p>
                        <p>{t.termsS8P2}</p>
                        <p>{t.termsS8P3}</p>
                        <p>{t.termsS8P4}</p>
                    </LegalSection>

                    <LegalSection id="legal-section-9" title={t.termsS9Title}>
                        <p>{t.termsS9P1}</p>
                        <ul className="list-disc list-inside space-y-1 ml-2">
                            <li>{t.termsS9F1}</li>
                            <li>{t.termsS9F2}</li>
                            <li>{t.termsS9F3}</li>
                            <li>{t.termsS9F4}</li>
                        </ul>
                        <p>{t.termsS9End}</p>
                    </LegalSection>

                    <LegalSection id="legal-section-10" title={t.termsS10Title}>
                        <p>{t.termsS10P1}</p>
                        <p>{t.termsS10P2}</p>
                        <p>{t.termsS10P3} <a href="/privacy" className="text-gold-400 hover:underline">{t.footerPrivacy}</a>.</p>
                    </LegalSection>

                    <LegalSection id="legal-section-11" title={t.termsS11Title}>
                        <p>{t.termsS11P1}</p>
                        <p>{t.termsS11P2}</p>
                    </LegalSection>

                    <LegalSection id="legal-section-12" title={t.termsS12Title}>
                        <p>{t.termsS12Intro}</p>
                        <ul className="list-disc list-inside space-y-1 ml-2">
                            <li>{t.termsS12F1}</li>
                            <li>{t.termsS12F2}</li>
                        </ul>
                        <p>{t.termsS12End}</p>
                    </LegalSection>

                    <LegalSection id="legal-section-13" title={t.termsS13Title}>
                        <p>{t.termsS13P1}</p>
                    </LegalSection>

                    <LegalSection id="legal-section-14" title={t.termsS14Title}>
                        <p>{t.termsS14P1}</p>
                        <div className="bg-calx-card/50 rounded-xl p-4 border border-calx-surface mt-2">
                            <p><strong className="text-calx-text">{t.contactSupportName}</strong></p>
                            <p>📧 E-mail : <a href="mailto:contact@calx.be" className="text-gold-400 hover:underline">contact@calx.be</a></p>
                            <p>🌐 {labels.website} : <a href="https://www.calx.be" className="text-gold-400 hover:underline">www.calx.be</a></p>
                        </div>
                    </LegalSection>
        </LegalPage>
    );
}
