'use client';

import RoleGuard from '@/components/guards/RoleGuard';
import { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot, Timestamp } from 'firebase/firestore';
import { httpsCallable } from 'firebase/functions';
import { db, functions } from '@/lib/firebase/client';
import { Gift, Send, AlertCircle, Trash2, Clock } from 'lucide-react';

interface ActiveGrant {
    uid: string;
    email: string;
    until: Date;
    days?: number;
}

const PRESETS = [7, 15, 30, 60, 90];

export default function CompAccessPage() {
    const [email, setEmail] = useState('');
    const [days, setDays] = useState(30);
    const [granting, setGranting] = useState(false);
    const [message, setMessage] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);
    const [grants, setGrants] = useState<ActiveGrant[]>([]);
    const [loading, setLoading] = useState(true);

    // Live list of users with an active complimentary access.
    useEffect(() => {
        const q = query(
            collection(db, 'users'),
            where('complimentaryAccessUntil', '>', Timestamp.now())
        );
        const unsub = onSnapshot(q, (snap) => {
            const rows: ActiveGrant[] = snap.docs.map((d) => {
                const data = d.data();
                return {
                    uid: d.id,
                    email: (data.email as string) || '(email inconnu)',
                    until: (data.complimentaryAccessUntil as Timestamp).toDate(),
                    days: data.complimentaryDays as number | undefined,
                };
            });
            rows.sort((a, b) => a.until.getTime() - b.until.getTime());
            setGrants(rows);
            setLoading(false);
        }, () => setLoading(false));
        return () => unsub();
    }, []);

    const handleGrant = async () => {
        const clean = email.trim().toLowerCase();
        if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(clean)) {
            setMessage({ type: 'err', text: 'Adresse e-mail invalide.' });
            return;
        }
        if (days < 1 || days > 366) {
            setMessage({ type: 'err', text: 'Durée invalide (1 à 366 jours).' });
            return;
        }
        setGranting(true);
        setMessage(null);
        try {
            const fn = httpsCallable<{ email: string; days: number }, { ok: boolean; applied: boolean }>(
                functions, 'grantComplimentaryAccess'
            );
            const res = await fn({ email: clean, days });
            setMessage({
                type: 'ok',
                text: res.data.applied
                    ? `✅ Accès de ${days} jours offert à ${clean}. E-mail envoyé.`
                    : `✅ Accès de ${days} jours en attente pour ${clean} — appliqué dès la création du compte.`,
            });
            setEmail('');
        } catch (e) {
            const msg = e instanceof Error ? e.message : 'Erreur';
            setMessage({ type: 'err', text: `Échec : ${msg}` });
        }
        setGranting(false);
    };

    const handleRevoke = async (target: string) => {
        if (!confirm(`Révoquer l'accès gratuit de ${target} ?`)) return;
        try {
            const fn = httpsCallable<{ email: string }, { ok: boolean }>(
                functions, 'revokeComplimentaryAccess'
            );
            await fn({ email: target });
            setMessage({ type: 'ok', text: `Accès révoqué pour ${target}. E-mail envoyé.` });
        } catch (e) {
            const msg = e instanceof Error ? e.message : 'Erreur';
            setMessage({ type: 'err', text: `Échec : ${msg}` });
        }
    };

    return (
        <RoleGuard module="pricing">
            <div>
                <div className="mb-8">
                    <h1 className="text-2xl font-bold text-calx-text flex items-center gap-3">
                        <Gift className="text-gold-400" size={28} />
                        Accès gratuit
                    </h1>
                    <p className="text-calx-text-secondary mt-1">
                        Offre un accès premium complet (testeurs, App Store, presse) — sans paiement
                    </p>
                </div>

                <div className="flex items-start gap-3 p-4 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm mb-6">
                    <AlertCircle size={18} className="flex-shrink-0 mt-0.5" />
                    <p>
                        L&apos;utilisateur reçoit un e-mail confirmant son accès et sa date d&apos;expiration.
                        Si le compte n&apos;existe pas encore, l&apos;accès est appliqué automatiquement à l&apos;inscription.
                        Une révocation envoie aussi un e-mail.
                    </p>
                </div>

                {/* ── Grant form ── */}
                <div className="bg-calx-surface/50 border border-calx-surface rounded-xl p-5 mb-6">
                    <label className="block text-xs text-calx-text-muted mb-2">Adresse e-mail du bénéficiaire</label>
                    <input
                        type="email"
                        inputMode="email"
                        placeholder="reviewer@apple.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full px-4 py-2.5 bg-calx-card/50 border border-calx-surface-variant rounded-xl text-calx-text focus:outline-none focus:ring-2 focus:ring-gold-400/40 transition-all mb-4"
                    />

                    <label className="block text-xs text-calx-text-muted mb-2">Durée</label>
                    <div className="flex flex-wrap items-center gap-2 mb-4">
                        {PRESETS.map((d) => (
                            <button
                                key={d}
                                onClick={() => setDays(d)}
                                className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all border ${days === d
                                    ? 'bg-gold-400/15 border-gold-400 text-calx-text'
                                    : 'bg-calx-card/50 border-calx-surface-variant text-calx-text-secondary hover:border-gold-400/40'
                                    }`}
                            >
                                {d} j
                            </button>
                        ))}
                        <div className="flex items-center gap-2 ml-2">
                            <span className="text-calx-text-muted text-sm">ou</span>
                            <input
                                type="number"
                                min={1}
                                max={366}
                                value={days}
                                onChange={(e) => setDays(parseInt(e.target.value) || 0)}
                                className="w-20 px-3 py-2 bg-calx-card/50 border border-calx-surface-variant rounded-xl text-calx-text focus:outline-none focus:ring-2 focus:ring-gold-400/40"
                            />
                            <span className="text-calx-text-secondary text-sm">jours</span>
                        </div>
                    </div>

                    <button
                        onClick={handleGrant}
                        disabled={granting}
                        className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-gold-400 to-gold-600 text-black font-bold rounded-xl hover:shadow-lg hover:shadow-gold-400/25 transition-all disabled:opacity-50"
                    >
                        <Send size={16} />
                        {granting ? 'Envoi...' : `Offrir ${days} jours d'accès`}
                    </button>

                    {message && (
                        <p className={`mt-3 text-sm ${message.type === 'ok' ? 'text-green-400' : 'text-red-400'}`}>
                            {message.text}
                        </p>
                    )}
                </div>

                {/* ── Active grants ── */}
                <h2 className="text-lg font-semibold text-calx-text mb-3 flex items-center gap-2">
                    <Clock size={18} className="text-gold-400" />
                    Accès actifs ({grants.length})
                </h2>

                {loading ? (
                    <div className="flex items-center justify-center py-12">
                        <div className="w-7 h-7 border-2 border-gold-400 border-t-transparent rounded-full animate-spin" />
                    </div>
                ) : grants.length === 0 ? (
                    <p className="text-calx-text-muted text-sm py-6">Aucun accès gratuit actif.</p>
                ) : (
                    <div className="space-y-2">
                        {grants.map((g) => (
                            <div
                                key={g.uid}
                                className="flex items-center justify-between bg-calx-surface/50 border border-calx-surface rounded-xl p-4"
                            >
                                <div>
                                    <p className="text-calx-text font-medium text-sm">{g.email}</p>
                                    <p className="text-calx-text-muted text-xs mt-0.5">
                                        Expire le {g.until.toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' })}
                                        {g.days ? ` · ${g.days} jours` : ''}
                                    </p>
                                </div>
                                <button
                                    onClick={() => handleRevoke(g.email)}
                                    className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm hover:bg-red-500/20 transition-all"
                                >
                                    <Trash2 size={14} />
                                    Révoquer
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </RoleGuard>
    );
}
