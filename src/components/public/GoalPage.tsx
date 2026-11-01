'use client';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import PublicLayout from '@/components/layout/PublicLayout';
import PhonePreview from './PhonePreview';
import DownloadLinks from './DownloadLinks';
import GoalLinks from './GoalLinks';
import { guides, localizedPath, type GuideId } from '@/seo/content';
import type { Locale } from '@/i18n';
import './seo.css';
export default function GoalPage({locale,id}:{locale:Locale;id:GuideId}){
 const guide=guides[locale].find(g=>g.id===id)!;const fr=locale==='fr';
 return <PublicLayout><article className="cx-wrap cx-guide"><nav className="cx-guide-breadcrumb" aria-label={fr?'Fil d’Ariane':'Breadcrumb'}><Link href={localizedPath(locale,'')}>CalX</Link><span aria-hidden="true"> / </span><span>{guide.label}</span></nav><div className="cx-guide-hero"><div><p className="cx-eyebrow">{fr?'Nutrition & activité':'Nutrition & activity'}</p><h1>{guide.title}</h1><p className="cx-guide-intro">{guide.intro}</p><a href="#download" className="cx-primary">{fr?'Découvrir CalX':'Explore CalX'}<ArrowUpRight size={18}/></a></div><PhonePreview locale={locale} screen={guide.screen} priority/></div><div className="cx-guide-body">{guide.sections.map(section=><section key={section.title}><h2>{section.title}</h2><p>{section.body}</p></section>)}<section><h2>{fr?'Comment commencer dans CalX':'Getting started in CalX'}</h2><ol>{guide.steps.map(step=><li key={step}>{step}</li>)}</ol></section><section><h2>{fr?'Questions fréquentes':'Frequently asked questions'}</h2>{guide.faq.map(item=><details key={item.q}><summary>{item.q}</summary><p>{item.a}</p></details>)}</section><p className="cx-guide-note">{fr?'CalX est un outil de suivi, pas un dispositif médical. Les analyses et suggestions IA doivent être vérifiées. Certaines fonctions et certains exports nécessitent un abonnement, selon l’offre choisie dans l’application.':'CalX is a tracking tool, not a medical device. Review AI estimates and suggestions. Some features and exports require a subscription, depending on the plan selected in the app.'}</p></div><section className="cx-download" id="download"><div><h2>{fr?'Ton suivi, à portée de main.':'Your record, close at hand.'}</h2><p>{fr?'Retrouve CalX sur iPhone et Android.':'Find CalX on iPhone and Android.'}</p></div><DownloadLinks/></section></article><GoalLinks/></PublicLayout>;
}
