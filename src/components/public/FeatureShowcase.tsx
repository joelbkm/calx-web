'use client';

import Image from 'next/image';
import { Activity, ArrowDownRight, ArrowUpRight, Camera, ChartNoAxesCombined, Check, ChefHat, CircleCheck, Dumbbell, FileDown, Flame, Footprints, Heart, Keyboard, MessageCircle, Mic, ScanBarcode, Sparkles, Target, Timer, Users, Utensils } from 'lucide-react';
import { useI18n } from '@/i18n';
import PhonePreview from './PhonePreview';
import { featureContent } from './feature-content';
import './features.css';

const destinations = ['nutrition-tools', 'running', 'coach', 'progress', 'squads', 'exports'];
const categoryIcons = [Utensils, Footprints, ChefHat, ChartNoAxesCombined, Users, FileDown];
const inputIcons = [Camera, Mic, ScanBarcode, Keyboard];
const metricIcons = [Timer, Flame, Heart];

export default function FeatureShowcase() {
    const { locale } = useI18n();
    const copy = featureContent[locale];

    return (
        <div className="cx-feature-story">
            <section id="advantages" className="cx-wrap cx-feature-overview" aria-labelledby="all-features-title">
                <div className="cx-sectionhead">
                    <div><p className="cx-eyebrow">{copy.eyebrow}</p><h2 id="all-features-title">{copy.title}</h2></div>
                    <p>{copy.intro}</p>
                </div>
                <nav className="cx-feature-index" aria-label={copy.title}>
                    {copy.overview.map((item, index) => {
                        const Icon = categoryIcons[index];
                        return <a href={`#${destinations[index]}`} className="cx-feature-link" key={destinations[index]}><Icon size={25} aria-hidden="true" /><strong>{item.title}</strong><span>{item.body}</span><ArrowDownRight size={18} aria-hidden="true" /></a>;
                    })}
                </nav>
            </section>

            <section className="cx-wrap cx-input-section" id="nutrition-tools" aria-labelledby="input-title">
                <div className="cx-sectionhead">
                    <div><p className="cx-eyebrow">{copy.nutrition.eyebrow}</p><h2 id="input-title">{copy.nutrition.title}</h2></div><p>{copy.nutrition.body}</p>
                </div>
                <div className="cx-input-grid">
                    {copy.nutrition.methods.map((method, index) => {
                        const Icon = inputIcons[index];
                        return <article key={method.title}><Icon size={27} aria-hidden="true" /><h3>{method.title}</h3><p>{method.body}</p></article>;
                    })}
                </div>
            </section>

            <section className="cx-wrap cx-feature-row cx-running-section" id="running" aria-labelledby="running-title">
                <figure className="cx-running-art">
                    <Image src="/marketing/running.webp" alt={copy.running.alt} width={852} height={1848} sizes="(max-width: 680px) 90vw, 380px" />
                    <figcaption><h3>{copy.running.visualTitle}</h3><p>{copy.running.visualSubtitle}</p></figcaption>
                </figure>
                <div className="cx-feature-detail">
                    <p className="cx-eyebrow">{copy.running.eyebrow}</p><h2 id="running-title">{copy.running.title}</h2><p className="cx-feature-intro">{copy.running.body}</p>
                    <div className="cx-feature-points">
                        {copy.running.metrics.map((metric, index) => {
                            const Icon = metricIcons[index];
                            return <div key={metric.title}><span className="cx-feature-point-icon"><Icon size={20} aria-hidden="true" /></span><div><h3>{metric.title}</h3><p>{metric.body}</p></div></div>;
                        })}
                    </div>
                    <ul className="cx-feature-tags" aria-label={copy.running.eyebrow}>{copy.running.activities.map(activity => <li key={activity}>{activity}</li>)}</ul>
                    <div className="cx-voice-tip"><Mic size={21} aria-hidden="true" /><div><h3>{copy.running.voiceTitle}</h3><p>{copy.running.voiceBody}</p></div></div>
                    <p className="cx-feature-note">{copy.running.note}</p>
                </div>
            </section>

            <section className="cx-wrap cx-feature-row cx-coach-section" id="coach" aria-labelledby="coach-title">
                <div className="cx-feature-detail">
                    <p className="cx-eyebrow">{copy.coach.eyebrow}</p><h2 id="coach-title">{copy.coach.title}</h2><p className="cx-feature-intro">{copy.coach.body}</p>
                    <div className="cx-feature-points">
                        {copy.coach.features.map(item => <div key={item.title}><span className="cx-feature-point-icon"><Check size={19} aria-hidden="true" /></span><div><h3>{item.title}</h3><p>{item.body}</p></div></div>)}
                    </div>
                    <ul className="cx-feature-tags" aria-label={copy.coach.eyebrow}>{copy.coach.tags.map(tag => <li key={tag}>{tag}</li>)}</ul>
                </div>
                <div className="cx-coach-scene">
                    <div className="cx-coach-orbit" aria-hidden="true" />
                    <PhonePreview screen="coach" locale={locale} className="cx-coach-phone" />
                    <div className="cx-feature-float"><Sparkles size={24} aria-hidden="true" /><div><strong>{copy.coach.badge}</strong><span>{copy.coach.badgeSub}</span></div></div>
                </div>
            </section>

            <div className="cx-wrap cx-feature-pair">
                {([{ id: 'progress', screen: 'progress', copy: copy.progress, Icon: Target }, { id: 'exports', screen: 'export', copy: copy.exports, Icon: FileDown }] as const).map(item => (
                    <section id={item.id} className={`cx-feature-panel cx-panel-${item.id}`} key={item.id} aria-labelledby={`${item.id}-title`}>
                        <p className="cx-eyebrow">{item.copy.eyebrow}</p><h2 id={`${item.id}-title`}>{item.copy.title}</h2><p className="cx-feature-intro">{item.copy.body}</p>
                        <ul className="cx-feature-checklist">{item.copy.features.map(text => <li key={text}><CircleCheck size={16} aria-hidden="true" />{text}</li>)}</ul>
                        <div className="cx-panel-visual"><PhonePreview screen={item.screen} locale={locale} className="cx-panel-phone" /><span className="cx-panel-badge"><item.Icon size={18} aria-hidden="true" />{item.copy.badge}</span></div>
                    </section>
                ))}
            </div>

            <section className="cx-wrap cx-feature-row cx-squads-section" id="squads" aria-labelledby="squads-title">
                <div className="cx-squad-scene" aria-hidden="true">
                    <div className="cx-squad-ring cx-squad-ring-outer" /><div className="cx-squad-ring cx-squad-ring-inner" />
                    <span className="cx-squad-node cx-node-food"><Utensils size={27} /></span><span className="cx-squad-node cx-node-run"><Footprints size={28} /></span><span className="cx-squad-node cx-node-heart"><Heart size={28} /></span><span className="cx-squad-node cx-node-strength"><Dumbbell size={28} /></span>
                    <div className="cx-squad-center"><Users size={44} /><strong>{copy.squads.center}</strong><span>{copy.squads.caption}</span></div>
                    <div className="cx-squad-bottom"><MessageCircle size={20} /><Heart size={20} /><Flame size={20} /><Activity size={20} /></div>
                </div>
                <div className="cx-feature-detail"><p className="cx-eyebrow">{copy.squads.eyebrow}</p><h2 id="squads-title">{copy.squads.title}</h2><p className="cx-feature-intro">{copy.squads.body}</p>
                    <div className="cx-feature-points">{copy.squads.features.map(item => <div key={item.title}><span className="cx-feature-point-icon"><Heart size={18} aria-hidden="true" /></span><div><h3>{item.title}</h3><p>{item.body}</p></div></div>)}</div>
                </div>
            </section>
            <div className="cx-wrap"><p className="cx-feature-availability">{copy.availability}<a href="#download">{copy.explore}<ArrowUpRight size={15} aria-hidden="true" /></a></p></div>
        </div>
    );
}
