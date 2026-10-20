'use client';

import { useEffect, useState } from 'react';
import { useI18n } from '@/i18n';
import { marketing, publicLabels } from './content';

type StoreLinks = { iosUrl: string; androidUrl: string };

function validStoreUrl(value: unknown): string {
    if (typeof value !== 'string') return '';
    try {
        const url = new URL(value);
        return url.protocol === 'https:' ? url.href : '';
    } catch {
        return '';
    }
}

// Keep the existing store_links document managed by the admin as the source of truth.
export default function DownloadLinks() {
    const { locale } = useI18n();
    const copy = marketing[locale];
    const labels = publicLabels[locale];
    const [links, setLinks] = useState<StoreLinks>({ iosUrl: '', androidUrl: '' });
    const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');
    const [attempt, setAttempt] = useState(0);

    useEffect(() => {
        let cancelled = false;
        async function load() {
            try {
                const [{ doc, getDoc }, { db }] = await Promise.all([
                    import('firebase/firestore'),
                    import('@/lib/firebase/client'),
                ]);
                const snapshot = await getDoc(doc(db, 'app_config', 'store_links'));
                if (cancelled) return;
                const data = snapshot.data();
                setLinks({ iosUrl: validStoreUrl(data?.iosUrl), androidUrl: validStoreUrl(data?.androidUrl) });
                setStatus('ready');
            } catch {
                if (!cancelled) setStatus('error');
            }
        }
        void load();
        return () => { cancelled = true; };
    }, [attempt]);

    const stores = [
        { name: 'App Store', small: copy.appleSmall, url: links.iosUrl, path: 'M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z' },
        { name: 'Google Play', small: copy.googleSmall, url: links.androidUrl, path: 'M3 2v20l10-10L3 2zm2.7 0L16 8l-2 2L5.7 2zm9.7 9.4 2-2L21 11.5v1l-3.6 2.1-2-2 1.2-1.2-1.2-1.2zm.6 4.6L5.7 22l8.3-8 2 2z' },
    ];

    return (
        <div className="cx-download-links">
            <div className="cx-stores">
                {stores.map(store => {
                    const content = <><svg aria-hidden="true" viewBox="0 0 24 24" fill="currentColor" width="26" height="26"><path d={store.path} /></svg><span><small>{store.small}</small><strong>{store.name}</strong></span></>;
                    return store.url ? (
                        <a key={store.name} href={store.url} className="cx-store" target="_blank" rel="noopener noreferrer" aria-label={`${copy.download} — ${store.name}`}>{content}</a>
                    ) : (
                        <button key={store.name} type="button" className="cx-store" disabled aria-describedby="store-status">{content}</button>
                    );
                })}
            </div>
            <div id="store-status" className="cx-store-status" role="status">
                {status === 'loading' ? labels.loading : status === 'error' ? labels.storesError : stores.filter(store => !store.url).map(store => `${store.name} : ${labels.unavailable}`).join(' ')}
            </div>
            {status === 'error' && <button type="button" className="cx-retry" onClick={() => { setStatus('loading'); setAttempt(value => value + 1); }}>{labels.retry}</button>}
        </div>
    );
}
