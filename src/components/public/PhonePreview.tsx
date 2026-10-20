import Image from 'next/image';
import type { ReactNode } from 'react';
import type { Locale } from '@/i18n';
import { publicLabels } from './content';

export type PreviewScreen = 'dashboard' | 'scan' | 'diary' | 'progress';

export default function PhonePreview({ locale, screen, className = '', priority = false, children }: { locale: Locale; screen: PreviewScreen; className?: string; priority?: boolean; children?: ReactNode }) {
    return (
        <div className={`cx-phone ${className}`}>
            <Image
                key={`${locale}-${screen}`}
                src={`/marketing/${locale === 'en' ? 'en-US' : 'fr'}-${screen}.webp`}
                alt={publicLabels[locale].screenshots[screen]}
                width={460}
                height={999}
                sizes="(max-width: 680px) 180px, 240px"
                priority={priority}
            />
            {children}
        </div>
    );
}
