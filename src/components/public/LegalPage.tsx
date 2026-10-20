'use client';

import Link from 'next/link';
import { ArrowLeft, ArrowUpRight } from 'lucide-react';
import type { ReactNode } from 'react';
import PublicLayout from '@/components/layout/PublicLayout';
import { useI18n } from '@/i18n';
import { publicLabels } from './content';

export function LegalSection({ title, id, children }: { title: string; id: string; children: ReactNode }) {
    return <section className="cx-legal-section" id={id}><h2>{title}</h2><div className="cx-legal-copy">{children}</div></section>;
}

export default function LegalPage({ title, updated, badge, sections, children }: { title: string; updated: string; badge: string; sections: string[]; children: ReactNode }) {
    const { locale } = useI18n();
    const labels = publicLabels[locale];
    return (
        <PublicLayout>
            <div className="cx-wrap cx-legal">
                <Link className="cx-back" href={`/?lang=${locale}`}><ArrowLeft size={15} aria-hidden="true" />{labels.back}</Link>
                <div className="cx-legal-heading"><p className="cx-eyebrow">{badge}</p><h1>{title}</h1><p>{updated}</p></div>
                <div className="cx-legal-grid">
                    <aside className="cx-legal-toc"><nav aria-label={labels.contents}><h2>{labels.contents}</h2><ol>{sections.map((text, index) => <li key={text}><a href={`#legal-section-${index + 1}`}>{text}<ArrowUpRight size={12} aria-hidden="true" /></a></li>)}</ol></nav></aside>
                    <article className="cx-legal-article">{children}</article>
                </div>
            </div>
        </PublicLayout>
    );
}
