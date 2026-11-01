'use client';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { useI18n } from '@/i18n';
import { guideEntries, localizedPath } from '@/seo/content';
import './seo.css';
export default function GoalLinks(){const {locale}=useI18n();return <section className="cx-wrap cx-goals" aria-labelledby="goals-title"><p className="cx-eyebrow">{locale==='fr'?'Ton objectif, ton suivi':'Your goal, your record'}</p><h2 id="goals-title">{locale==='fr'?'Que souhaites-tu suivre avec CalX ?':'What would you like to track with CalX?'}</h2><div className="cx-goal-links">{guideEntries(locale).map(guide=><Link href={localizedPath(locale,guide.id)} key={guide.id}><strong>{guide.label}</strong><p>{guide.description}</p><span>{locale==='fr'?'Découvrir ce suivi':'Explore this feature'} <ArrowUpRight size={17}/></span></Link>)}</div></section>}
