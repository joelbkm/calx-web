'use client';

import LegalPage, { LegalSection } from '@/components/public/LegalPage';
import { publicLabels } from '@/components/public/content';
import { useI18n } from '@/i18n';

export default function PrivacyPage() {
    const { t, locale } = useI18n();
    const labels = publicLabels[locale];

    return (
        <LegalPage title={`${t.privacyTitle1}${t.privacyTitle2}`} updated={t.lastUpdated} badge={t.legalBadge} sections={[t.privacyS1Title, t.privacyS2Title, t.privacyS3Title, t.privacyS4Title, t.privacyS5Title, t.privacyS6Title, t.privacyS7Title, t.privacyS8Title, t.privacyS9Title, t.privacyS10Title, t.privacyS11Title, t.privacyS11bTitle, t.privacyS12Title, t.privacyS13Title]}>
                    <LegalSection id="legal-section-1" title={t.privacyS1Title}>
                        <p>{t.privacyS1P1}</p>
                        <p>{t.privacyS1P2}</p>
                        <p>{t.privacyS1P3}</p>
                    </LegalSection>

                    <LegalSection id="legal-section-2" title={t.privacyS2Title}>
                        <p>
                            <strong>CalX</strong><br />
                            {labels.website} : <a href="https://www.calx.be" className="text-gold-400 hover:underline">www.calx.be</a><br />
                            {labels.contact} : <a href="mailto:contact@calx.be" className="text-gold-400 hover:underline">contact@calx.be</a>
                        </p>
                    </LegalSection>

                    <LegalSection id="legal-section-3" title={t.privacyS3Title}>
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
                    </LegalSection>

                    <LegalSection id="legal-section-4" title={t.privacyS4Title}>
                        <p>{t.privacyS4Intro}</p>
                        <ul className="list-disc list-inside space-y-1 ml-2">
                            <li>{t.privacyS4F1}</li>
                            <li>{t.privacyS4F2}</li>
                            <li>{t.privacyS4F3}</li>
                            <li>{t.privacyS4F4}</li>
                        </ul>
                        <p>{t.privacyS4End}</p>
                    </LegalSection>

                    <LegalSection id="legal-section-5" title={t.privacyS5Title}>
                        <p>{t.privacyS5Intro}</p>
                        <ul className="list-disc list-inside space-y-1 ml-2">
                            <li>{t.privacyS5F1}</li>
                            <li>{t.privacyS5F2}</li>
                            <li>{t.privacyS5F3}</li>
                            <li>{t.privacyS5F4}</li>
                        </ul>
                        <p><strong>{t.privacyS5Warn}</strong></p>
                        <p>{t.privacyS5End}</p>
                        <p><strong>{t.privacyS5Consent}</strong></p>
                    </LegalSection>

                    <LegalSection id="legal-section-6" title={t.privacyS6Title}>
                        <p>{t.privacyS6Intro}</p>
                        <ul className="list-disc list-inside space-y-1 ml-2">
                            <li>{t.privacyS6F1}</li>
                            <li>{t.privacyS6F2}</li>
                            <li>{t.privacyS6F3}</li>
                        </ul>
                    </LegalSection>

                    <LegalSection id="legal-section-7" title={t.privacyS7Title}>
                        <p>{t.privacyS7Intro}</p>
                        <ul className="list-disc list-inside space-y-1 ml-2">
                            <li>{t.privacyS7F1}</li>
                            <li>{t.privacyS7F2}</li>
                            <li>{t.privacyS7F3}</li>
                            <li>{t.privacyS7F4}</li>
                        </ul>
                    </LegalSection>

                    <LegalSection id="legal-section-8" title={t.privacyS8Title}>
                        <p>{t.privacyS8Intro}</p>
                        <ul className="list-disc list-inside space-y-1 ml-2">
                            <li>{t.privacyS8F1}</li>
                            <li>{t.privacyS8F2}</li>
                            <li>{t.privacyS8F3}</li>
                            <li>{t.privacyS8F4}</li>
                        </ul>
                    </LegalSection>

                    <LegalSection id="legal-section-9" title={t.privacyS9Title}>
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
                    </LegalSection>

                    <LegalSection id="legal-section-10" title={t.privacyS10Title}>
                        <p>{t.privacyS10Intro}</p>
                        <ul className="list-disc list-inside space-y-1 ml-2">
                            <li>{t.privacyS10F1}</li>
                            <li>{t.privacyS10F2}</li>
                            <li>{t.privacyS10F3}</li>
                            <li>{t.privacyS10F4}</li>
                        </ul>
                    </LegalSection>

                    <LegalSection id="legal-section-11" title={t.privacyS11Title}>
                        <p>{t.privacyS11P1}</p>
                    </LegalSection>

                    <LegalSection id="legal-section-12" title={t.privacyS11bTitle}>
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
                    </LegalSection>

                    <LegalSection id="legal-section-13" title={t.privacyS12Title}>
                        <p>{t.privacyS12P1}</p>
                        <p>{t.privacyS12P2}</p>
                    </LegalSection>

                    <LegalSection id="legal-section-14" title={t.privacyS13Title}>
                        <p>{t.privacyS13P1}</p>
                        <div className="bg-calx-card/50 rounded-xl p-4 border border-calx-surface mt-2">
                            <p><strong className="text-calx-text">{t.contactName}</strong></p>
                            <p>📧 E-mail : <a href="mailto:contact@calx.be" className="text-gold-400 hover:underline">contact@calx.be</a></p>
                            <p>🌐 {labels.website} : <a href="https://www.calx.be" className="text-gold-400 hover:underline">www.calx.be</a></p>
                        </div>
                    </LegalSection>
        </LegalPage>
    );
}
