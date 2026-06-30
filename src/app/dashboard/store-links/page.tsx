'use client';

import RoleGuard from '@/components/guards/RoleGuard';
import { useState, useEffect } from 'react';
import { doc, onSnapshot, setDoc, Timestamp } from 'firebase/firestore';
import { httpsCallable } from 'firebase/functions';
import { db, functions } from '@/lib/firebase/client';
import { useAuth } from '@/lib/auth/context';
import { Smartphone, Save, AlertCircle, Apple, Play, RefreshCw } from 'lucide-react';

interface StoreLinks {
    iosUrl: string;
    androidUrl: string;
    updatedAt?: unknown;
    updatedBy?: string;
}

const DEFAULT_LINKS: StoreLinks = {
    iosUrl: '',
    androidUrl: '',
};

export default function StoreLinksPage() {
    const { user } = useAuth();
    const [links, setLinks] = useState<StoreLinks | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const unsub = onSnapshot(doc(db, 'app_config', 'store_links'), (snap) => {
            if (snap.exists()) {
                const data = snap.data();
                setLinks({
                    iosUrl: data.iosUrl ?? '',
                    androidUrl: data.androidUrl ?? '',
                    updatedAt: data.updatedAt,
                    updatedBy: data.updatedBy,
                });
            } else {
                setLinks({ ...DEFAULT_LINKS });
            }
            setLoading(false);
        });
        return () => unsub();
    }, []);

    const [backfilling, setBackfilling] = useState(false);
    const [backfillMsg, setBackfillMsg] = useState<string | null>(null);

    const handleBackfill = async () => {
        setBackfilling(true);
        setBackfillMsg(null);
        try {
            const fn = httpsCallable<Record<string, never>, { ok: boolean; count: number }>(
                functions, 'backfillUsersPublic'
            );
            const res = await fn({});
            setBackfillMsg(`✅ ${res.data.count} profils synchronisés.`);
        } catch (e) {
            const msg = e instanceof Error ? e.message : 'Erreur';
            setBackfillMsg(`Échec : ${msg}`);
        }
        setBackfilling(false);
    };

    const isValid = (url: string) =>
        url.trim() === '' || /^https?:\/\/.+/i.test(url.trim());

    const handleSave = async () => {
        if (!links) return;
        if (!isValid(links.iosUrl) || !isValid(links.androidUrl)) {
            setError('Les liens doivent commencer par https:// (ou être vides).');
            return;
        }
        setError(null);
        setSaving(true);
        try {
            await setDoc(doc(db, 'app_config', 'store_links'), {
                iosUrl: links.iosUrl.trim(),
                androidUrl: links.androidUrl.trim(),
                updatedAt: Timestamp.now(),
                updatedBy: user?.uid,
            });
            setSaved(true);
            setTimeout(() => setSaved(false), 3000);
        } catch (err) {
            console.error('Error saving store links:', err);
            setError('Échec de l\'enregistrement (permissions ?).');
        }
        setSaving(false);
    };

    return (
        <RoleGuard module="pricing">
            <div>
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-2xl font-bold text-calx-text flex items-center gap-3">
                            <Smartphone className="text-gold-400" size={28} />
                            Liens des stores
                        </h1>
                        <p className="text-calx-text-secondary mt-1">
                            Les boutons de téléchargement du site et de l&apos;e-mail de bienvenue utilisent ces URLs
                        </p>
                    </div>
                </div>

                {/* Info banner */}
                <div className="flex items-start gap-3 p-4 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm mb-6">
                    <AlertCircle size={18} className="flex-shrink-0 mt-0.5" />
                    <p>
                        Modifiés ici, ces liens sont utilisés <strong>en temps réel</strong> par le site
                        <code className="bg-blue-500/20 px-1 rounded mx-1">calx.be</code>
                        et par l&apos;<strong>e-mail de bienvenue</strong>, via
                        <code className="bg-blue-500/20 px-1 rounded mx-1">app_config/store_links</code>.
                        Aucun redéploiement nécessaire.
                    </p>
                </div>

                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <div className="w-8 h-8 border-2 border-gold-400 border-t-transparent rounded-full animate-spin" />
                    </div>
                ) : links ? (
                    <div className="space-y-6">
                        {/* ── App Store (iOS) ── */}
                        <div className="bg-calx-surface/50 border border-calx-surface rounded-xl p-5">
                            <div className="flex items-center gap-2 mb-3">
                                <Apple size={18} className="text-gold-400" />
                                <h3 className="text-base font-semibold text-calx-text">Apple App Store (iOS)</h3>
                            </div>
                            <input
                                type="url"
                                inputMode="url"
                                placeholder="https://apps.apple.com/app/idXXXXXXXXXX"
                                value={links.iosUrl}
                                onChange={(e) => setLinks({ ...links, iosUrl: e.target.value })}
                                className="w-full px-4 py-2.5 bg-calx-card/50 border border-calx-surface-variant rounded-xl text-calx-text focus:outline-none focus:ring-2 focus:ring-gold-400/40 transition-all"
                            />
                        </div>

                        {/* ── Google Play (Android) ── */}
                        <div className="bg-calx-surface/50 border border-calx-surface rounded-xl p-5">
                            <div className="flex items-center gap-2 mb-3">
                                <Play size={18} className="text-gold-400" />
                                <h3 className="text-base font-semibold text-calx-text">Google Play (Android)</h3>
                            </div>
                            <input
                                type="url"
                                inputMode="url"
                                placeholder="https://play.google.com/store/apps/details?id=com.skytechnologieslabs.calx"
                                value={links.androidUrl}
                                onChange={(e) => setLinks({ ...links, androidUrl: e.target.value })}
                                className="w-full px-4 py-2.5 bg-calx-card/50 border border-calx-surface-variant rounded-xl text-calx-text focus:outline-none focus:ring-2 focus:ring-gold-400/40 transition-all"
                            />
                        </div>

                        {error && (
                            <p className="text-sm text-red-400">{error}</p>
                        )}

                        {/* Save button */}
                        <button
                            onClick={handleSave}
                            disabled={saving}
                            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-gold-400 to-gold-600 text-black font-bold rounded-xl hover:shadow-lg hover:shadow-gold-400/25 transition-all disabled:opacity-50"
                        >
                            <Save size={16} />
                            {saving ? 'Enregistrement...' : saved ? '✅ Enregistré !' : 'Enregistrer les liens'}
                        </button>
                    </div>
                ) : null}

                {/* Maintenance: backfill the public profile mirror */}
                <div className="mt-10 pt-6 border-t border-calx-surface">
                    <h3 className="text-sm font-semibold text-calx-text mb-1">Maintenance</h3>
                    <p className="text-xs text-calx-text-muted mb-3 max-w-xl">
                        Synchronise le miroir public des profils (nom + photo modérée) pour les
                        comptes <strong>existants</strong>. Les nouveaux comptes se synchronisent
                        automatiquement. À lancer une fois après cette mise à jour.
                    </p>
                    <button
                        onClick={handleBackfill}
                        disabled={backfilling}
                        className="flex items-center gap-2 px-5 py-2.5 bg-calx-surface border border-calx-surface-variant text-calx-text rounded-xl hover:border-gold-400/40 transition-all disabled:opacity-50"
                    >
                        <RefreshCw size={15} className={backfilling ? 'animate-spin' : ''} />
                        {backfilling ? 'Synchronisation...' : 'Synchroniser les profils publics'}
                    </button>
                    {backfillMsg && (
                        <p className="mt-2 text-sm text-calx-text-secondary">{backfillMsg}</p>
                    )}
                </div>
            </div>
        </RoleGuard>
    );
}
