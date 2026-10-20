'use client';

import { useRef, useState, type KeyboardEvent } from 'react';
import Image from 'next/image';
import { Activity, ArrowDownRight, ArrowUpRight, Camera, ChartNoAxesCombined, ChefHat, CircleCheck, Download, FileDown, Languages, Smartphone, Sparkles } from 'lucide-react';
import PublicLayout from '@/components/layout/PublicLayout';
import PhonePreview, { type PreviewScreen } from '@/components/public/PhonePreview';
import DownloadLinks from '@/components/public/DownloadLinks';
import { marketing, publicLabels } from '@/components/public/content';
import { useI18n } from '@/i18n';

const screens = ['scan', 'diary', 'progress'] as const satisfies readonly PreviewScreen[];

export default function HomePage() {
    const { locale } = useI18n();
    const copy = marketing[locale];
    const labels = publicLabels[locale];
    const [step, setStep] = useState(0);
    const tabs = useRef<(HTMLButtonElement | null)[]>([]);
    const steps = [
        { title: copy.step1title, body: copy.step1body },
        { title: copy.step2title, body: copy.step2body },
        { title: copy.step3title, body: copy.step3body },
    ];
    const benefits = [
        { Icon: ChefHat, title: copy.coachTitle, body: copy.coachBody, end: copy.coachEnd, EndIcon: Sparkles },
        { Icon: Activity, title: copy.activityTitle, body: copy.activityBody, end: copy.activityEnd, EndIcon: ChartNoAxesCombined },
        { Icon: FileDown, title: copy.exportTitle, body: copy.exportBody, end: copy.exportEnd, EndIcon: Download },
    ];

    function navigateTabs(event: KeyboardEvent<HTMLButtonElement>, index: number) {
        let next: number;
        if (event.key === 'ArrowDown' || event.key === 'ArrowRight') next = (index + 1) % screens.length;
        else if (event.key === 'ArrowUp' || event.key === 'ArrowLeft') next = (index + screens.length - 1) % screens.length;
        else if (event.key === 'Home') next = 0;
        else if (event.key === 'End') next = screens.length - 1;
        else return;
        event.preventDefault();
        setStep(next);
        tabs.current[next]?.focus();
    }

    return (
        <PublicLayout>
            <section className="cx-hero" aria-labelledby="hero-title">
                <Image className="cx-hero-bg" src="/marketing/hero.webp" alt={labels.heroAlt} width={1280} height={853} sizes="100vw" priority />
                <div className="cx-wrap">
                    <div className="cx-hero-content">
                        <p className="cx-eyebrow">{copy.eyebrow}</p>
                        <h1 id="hero-title"><span className="cx-ivory">{copy.hero1}</span><span>{copy.hero2}</span></h1>
                        <p className="cx-hero-copy">{copy.heroBody}</p>
                        <div className="cx-actions">
                            <a className="cx-primary" href="#download">{copy.getApp}<ArrowUpRight size={18} aria-hidden="true" /></a>
                            <a className="cx-textlink" href="#features">{copy.explore}<ArrowDownRight size={18} aria-hidden="true" /></a>
                        </div>
                        <div className="cx-trust">
                            <span><Smartphone size={14} aria-hidden="true" />{copy.platforms}</span>
                            <span><Languages size={14} aria-hidden="true" />{copy.languages}</span>
                        </div>
                    </div>
                </div>
                <PhonePreview className="cx-hero-phone" locale={locale} screen="dashboard" priority>
                    <div className="cx-phone-note"><CircleCheck size={22} aria-hidden="true" /><div><strong>{copy.noteTitle}</strong><small>{copy.noteSub}</small></div></div>
                </PhonePreview>
            </section>

            <div className="cx-wrap">
                <div className="cx-strip">
                    {[{ Icon: Camera, text: copy.strip1 }, { Icon: Sparkles, text: copy.strip2 }, { Icon: ChartNoAxesCombined, text: copy.strip3 }].map(({ Icon, text }) => (
                        <div className="cx-stripitem" key={text}><Icon size={23} aria-hidden="true" /><strong>{text}</strong></div>
                    ))}
                </div>
            </div>

            <section className="cx-journey cx-wrap" id="features" aria-labelledby="journey-title">
                <div className="cx-sectionhead">
                    <div><p className="cx-eyebrow">{copy.journeyEyebrow}</p><h2 id="journey-title">{copy.journeyTitle1}<br /><em>{copy.journeyTitle2}</em></h2></div>
                    <p>{copy.journeyIntro}</p>
                </div>
                <div className="cx-journeygrid">
                    <figure className="cx-mealpic">
                        <Image src="/marketing/meal.webp" alt={labels.mealAlt} width={500} height={500} sizes="(max-width: 680px) 100vw, 35vw" />
                        <figcaption className="cx-mealcaption"><div><small>{copy.estimated}</small><b>765 <span>kcal</span></b></div><span>{copy.mealAnalyzed}</span></figcaption>
                    </figure>
                    <div className="cx-steps" role="tablist" aria-label={labels.journey} aria-orientation="vertical">
                        {steps.map((item, index) => (
                            <button key={screens[index]} ref={element => { tabs.current[index] = element; }} type="button" className="cx-step" id={`step-${screens[index]}`} role="tab" aria-controls="journey-preview" aria-selected={step === index} tabIndex={step === index ? 0 : -1} onClick={() => setStep(index)} onKeyDown={event => navigateTabs(event, index)}>
                                <span aria-hidden="true">0{index + 1}</span><span className="cx-step-copy"><strong>{item.title}</strong><span>{item.body}</span></span>
                            </button>
                        ))}
                    </div>
                    <div id="journey-preview" className="cx-preview-panel" role="tabpanel" aria-labelledby={`step-${screens[step]}`} tabIndex={0}>
                        <PhonePreview className="cx-journey-phone" locale={locale} screen={screens[step]} />
                    </div>
                </div>
            </section>

            <section className="cx-capabilities cx-wrap" id="advantages" aria-labelledby="benefits-title">
                <h2 id="benefits-title">{copy.capTitle}</h2>
                <div className="cx-capgrid">
                    {benefits.map(({ Icon, title, body, end, EndIcon }) => (
                        <article className="cx-cap" key={title}>
                            <Icon size={26} className="cx-cap-icon" aria-hidden="true" /><h3>{title}</h3><p>{body}</p><span className="cx-cap-end"><EndIcon size={14} aria-hidden="true" /><span>{end}</span></span>
                        </article>
                    ))}
                </div>
            </section>

            <div className="cx-wrap">
                <section className="cx-download" id="download" aria-labelledby="download-title">
                    <div><h2 id="download-title">{copy.ctaTitle}</h2><p>{copy.ctaBody}</p></div>
                    <DownloadLinks />
                </section>
            </div>
        </PublicLayout>
    );
}
