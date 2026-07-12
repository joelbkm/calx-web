'use client';

import RoleGuard from '@/components/guards/RoleGuard';
import { useState, useEffect } from 'react';
import {
    collection, query, where, orderBy, onSnapshot,
    doc, updateDoc, setDoc, getDoc,
} from 'firebase/firestore';
import { db } from '@/lib/firebase/client';
import { formatRelativeTime } from '@/lib/utils';
import { Star, Check, Mail, MessageSquareWarning, ThumbsUp } from 'lucide-react';

interface Feedback {
    id: string;
    uid: string;
    stars: number;
    sentiment: 'positive' | 'negative';
    text?: string;
    platform?: string;
    appVersion?: string;
    locale?: string;
    status?: 'open' | 'reviewed' | 'resolved';
    createdAt?: { toDate: () => Date };
}

type Tab = 'negative' | 'positive';

export default function FeedbackPage() {
    return (
        <RoleGuard module="support">
            <FeedbackInner />
        </RoleGuard>
    );
}

function FeedbackInner() {
    const [items, setItems] = useState<Feedback[]>([]);
    const [loading, setLoading] = useState(true);
    const [tab, setTab] = useState<Tab>('negative');
    const [busy, setBusy] = useState<string | null>(null);

    // Admin alert email (app_config/review.adminAlertEmail).
    const [alertEmail, setAlertEmail] = useState('');
    const [savingEmail, setSavingEmail] = useState(false);

    useEffect(() => {
        getDoc(doc(db, 'app_config', 'review'))
            .then((s) => setAlertEmail((s.data()?.adminAlertEmail as string) || ''))
            .catch(() => {});
    }, []);

    useEffect(() => {
        setLoading(true);
        const q = query(
            collection(db, 'rating_feedback'),
            where('sentiment', '==', tab),
            orderBy('createdAt', 'desc'),
        );
        const unsub = onSnapshot(q, (snap) => {
            setItems(snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Feedback, 'id'>) })));
            setLoading(false);
        }, (err) => {
            console.error('feedback listener error:', err);
            setLoading(false);
        });
        return () => unsub();
    }, [tab]);

    const markResolved = async (id: string) => {
        setBusy(id);
        try {
            await updateDoc(doc(db, 'rating_feedback', id), {
                status: 'resolved',
                resolvedAt: new Date(),
            });
        } catch (e) {
            console.error(e);
            alert("Échec de la mise à jour (droits admin requis).");
        } finally {
            setBusy(null);
        }
    };

    const saveAlertEmail = async () => {
        setSavingEmail(true);
        try {
            await setDoc(doc(db, 'app_config', 'review'),
                { adminAlertEmail: alertEmail.trim() }, { merge: true });
        } catch (e) {
            console.error(e);
            alert("Échec (réservé au super admin).");
        } finally {
            setSavingEmail(false);
        }
    };

    const openCount = items.filter((i) => i.status !== 'resolved').length;

    return (
        <div className="p-6 max-w-4xl">
            <header className="mb-6">
                <h1 className="text-2xl font-bold text-calx-text">Avis clients</h1>
                <p className="text-sm text-calx-text-muted">
                    Retours 1–3★ (privés) et suggestions 4–5★ collectés dans l&apos;app.
                    Les avis 4–5★ partis sur l&apos;App Store restent privés chez Apple.
                </p>
            </header>

            {/* Admin alert email (extra) */}
            <div className="bg-calx-card border border-calx-surface-variant rounded-xl p-4 mb-6">
                <label className="text-xs font-medium text-calx-text-secondary flex items-center gap-2 mb-2">
                    <Mail size={14} /> E-mail d&apos;alerte pour les avis 1–3★
                </label>
                <div className="flex gap-2">
                    <input
                        type="email"
                        value={alertEmail}
                        onChange={(e) => setAlertEmail(e.target.value)}
                        placeholder="alertes@calx.be"
                        className="flex-1 bg-calx-surface border border-calx-surface-variant rounded-lg px-3 py-2 text-sm text-calx-text"
                    />
                    <button
                        onClick={saveAlertEmail}
                        disabled={savingEmail}
                        className="px-4 py-2 rounded-lg text-xs font-medium bg-gold-400/15 border border-gold-400/30 text-gold-300 hover:bg-gold-400/25 disabled:opacity-50"
                    >
                        {savingEmail ? '…' : 'Enregistrer'}
                    </button>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 mb-6">
                {([
                    { k: 'negative' as Tab, label: '⚠️ 1–3★', icon: <MessageSquareWarning size={14} /> },
                    { k: 'positive' as Tab, label: '👍 4–5★', icon: <ThumbsUp size={14} /> },
                ]).map(({ k, label, icon }) => (
                    <button
                        key={k}
                        onClick={() => setTab(k)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-medium transition-colors ${
                            tab === k
                                ? 'bg-gold-400/15 border border-gold-400/30 text-gold-300'
                                : 'bg-calx-card border border-calx-surface-variant text-calx-text-secondary hover:text-calx-text'
                        }`}
                    >
                        {icon}{label}
                        {tab === k && openCount > 0 && (
                            <span className="ml-1 px-1.5 py-0.5 rounded text-[10px] bg-gold-400/20 text-gold-200">
                                {openCount}
                            </span>
                        )}
                    </button>
                ))}
            </div>

            <div className="space-y-3">
                {loading ? (
                    <div className="text-center py-10">
                        <div className="inline-block w-6 h-6 border-2 border-gold-400 border-t-transparent rounded-full animate-spin" />
                    </div>
                ) : items.length === 0 ? (
                    <div className="text-center py-12 bg-calx-card border border-calx-surface-variant rounded-xl">
                        <Star size={32} className="mx-auto text-calx-text-muted mb-3" />
                        <p className="text-sm text-calx-text-muted">
                            {tab === 'negative' ? 'Aucun avis négatif 🎉' : 'Aucune suggestion positive pour le moment.'}
                        </p>
                    </div>
                ) : (
                    items.map((f) => (
                        <FeedbackCard key={f.id} f={f} busy={busy === f.id} onResolve={() => markResolved(f.id)} />
                    ))
                )}
            </div>
        </div>
    );
}

function FeedbackCard({ f, busy, onResolve }: { f: Feedback; busy: boolean; onResolve: () => void }) {
    const resolved = f.status === 'resolved';
    return (
        <div className={`bg-calx-card border rounded-xl p-5 ${resolved ? 'border-calx-surface-variant opacity-60' : 'border-calx-surface-variant'}`}>
            <div className="flex items-center gap-2 mb-2">
                <span className="text-gold-300 text-sm tracking-wide">
                    {'★'.repeat(Math.max(0, Math.min(5, f.stars)))}
                    <span className="text-calx-text-muted">{'★'.repeat(5 - Math.max(0, Math.min(5, f.stars)))}</span>
                </span>
                <span className="text-[11px] text-calx-text-muted">
                    {f.createdAt && formatRelativeTime(f.createdAt)}
                </span>
                {resolved && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-green-500/15 text-green-400 ml-auto">
                        ✓ Traité
                    </span>
                )}
            </div>

            {f.text ? (
                <p className="text-sm text-calx-text mb-3 whitespace-pre-wrap">{f.text}</p>
            ) : (
                <p className="text-sm text-calx-text-muted italic mb-3">(note sans message)</p>
            )}

            <div className="flex items-center gap-3 text-[11px] text-calx-text-muted">
                <span className="font-mono">{f.uid.slice(0, 10)}…</span>
                {f.platform && <span>· {f.platform}</span>}
                {f.appVersion && <span>· v{f.appVersion}</span>}
                {f.locale && <span>· {f.locale}</span>}
                {!resolved && (
                    <button
                        onClick={onResolve}
                        disabled={busy}
                        className="ml-auto flex items-center gap-1 px-3 py-1.5 rounded-lg text-[11px] font-medium bg-green-500/15 border border-green-500/30 text-green-400 hover:bg-green-500/25 disabled:opacity-50"
                    >
                        <Check size={13} /> Marquer traité
                    </button>
                )}
            </div>
        </div>
    );
}
