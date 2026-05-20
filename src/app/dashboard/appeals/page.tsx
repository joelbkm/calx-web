'use client';

import RoleGuard from '@/components/guards/RoleGuard';
import { useState, useEffect } from 'react';
import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import { httpsCallable } from 'firebase/functions';
import { db, functions } from '@/lib/firebase/client';
import { formatRelativeTime } from '@/lib/utils';
import { Scale, Check, X, User as UserIcon } from 'lucide-react';

interface Appeal {
    id: string;
    uid: string;
    contentType: 'profile' | 'squad' | 'post';
    contentId: string;
    userMessage: string;
    originalVerdict?: {
        reason: string;
        confidence: number;
        explanation: string;
        matchedText?: string | null;
    };
    status: 'pending' | 'accepted' | 'rejected';
    createdAt?: { toDate: () => Date };
    resolvedAt?: { toDate: () => Date };
    resolvedBy?: string;
    resolvedReason?: string;
}

type StatusFilter = 'pending' | 'accepted' | 'rejected';

export default function AppealsPage() {
    return (
        <RoleGuard module="moderation">
            <AppealsInner />
        </RoleGuard>
    );
}

function AppealsInner() {
    const [appeals, setAppeals] = useState<Appeal[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<StatusFilter>('pending');
    const [actionLoading, setActionLoading] = useState<string | null>(null);
    const [adminReason, setAdminReason] = useState<Record<string, string>>({});

    useEffect(() => {
        const q = query(
            collection(db, 'appeals'),
            where('status', '==', filter),
            orderBy('createdAt', 'desc')
        );
        const unsub = onSnapshot(q, (snap) => {
            setAppeals(snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Appeal, 'id'>) })));
            setLoading(false);
        }, (err) => {
            console.error('Appeals listener error:', err);
            setLoading(false);
        });
        return () => unsub();
    }, [filter]);

    async function resolve(appealId: string, decision: 'accepted' | 'rejected') {
        const verb = decision === 'accepted' ? 'accepter' : 'rejeter';
        if (!confirm(`${decision === 'accepted' ? '✓' : '✗'} ${verb.charAt(0).toUpperCase() + verb.slice(1)} cet appel ?`)) return;
        setActionLoading(appealId);
        try {
            const fn = httpsCallable(functions, 'resolveAppeal');
            await fn({
                appealId,
                decision,
                adminReason: adminReason[appealId] || null,
            });
        } catch (err) {
            console.error('resolveAppeal error:', err);
            alert('Erreur : ' + (err as Error).message);
        }
        setActionLoading(null);
    }

    const counts = {
        pending: appeals.filter((a) => a.status === 'pending').length,
    };

    return (
        <div className="min-h-screen bg-calx-bg p-6">
            <header className="mb-6 flex items-center gap-3">
                <Scale size={28} className="text-gold-400" />
                <div>
                    <h1 className="text-2xl font-bold text-calx-text">Appels</h1>
                    <p className="text-sm text-calx-text-muted">
                        Utilisateurs contestant une décision de modération
                    </p>
                </div>
            </header>

            <div className="flex gap-2 mb-6">
                {(['pending', 'accepted', 'rejected'] as StatusFilter[]).map((s) => (
                    <button
                        key={s}
                        onClick={() => setFilter(s)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-medium transition-colors ${
                            filter === s
                                ? 'bg-gold-400/15 border border-gold-400/30 text-gold-300'
                                : 'bg-calx-card border border-calx-surface-variant text-calx-text-secondary hover:text-calx-text'
                        }`}
                    >
                        {s === 'pending' ? '⏳ En attente' :
                         s === 'accepted' ? '✓ Acceptés' : '✗ Rejetés'}
                        {s === 'pending' && counts.pending > 0 && (
                            <span className="ml-1 px-1.5 py-0.5 rounded text-[10px] bg-gold-400/20 text-gold-200">
                                {counts.pending}
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
                ) : appeals.length === 0 ? (
                    <div className="text-center py-12 bg-calx-card border border-calx-surface-variant rounded-xl">
                        <Scale size={32} className="mx-auto text-calx-text-muted mb-3" />
                        <p className="text-sm text-calx-text-muted">
                            {filter === 'pending'
                                ? 'Aucun appel en attente 🎉'
                                : `Aucun appel ${filter === 'accepted' ? 'accepté' : 'rejeté'}.`}
                        </p>
                    </div>
                ) : (
                    appeals.map((a) => (
                        <AppealCard
                            key={a.id}
                            appeal={a}
                            disabled={actionLoading !== null}
                            adminReason={adminReason[a.id] || ''}
                            onAdminReasonChange={(v) => setAdminReason((prev) => ({ ...prev, [a.id]: v }))}
                            onAccept={() => resolve(a.id, 'accepted')}
                            onReject={() => resolve(a.id, 'rejected')}
                        />
                    ))
                )}
            </div>
        </div>
    );
}

function AppealCard({ appeal, disabled, adminReason, onAdminReasonChange, onAccept, onReject }: {
    appeal: Appeal;
    disabled: boolean;
    adminReason: string;
    onAdminReasonChange: (v: string) => void;
    onAccept: () => void;
    onReject: () => void;
}) {
    const verdict = appeal.originalVerdict;
    return (
        <div className="bg-calx-card border border-calx-surface-variant rounded-xl p-5">
            <div className="flex items-center gap-2 mb-3">
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-calx-surface-variant text-calx-text-muted uppercase tracking-wider">
                    {appeal.contentType}
                </span>
                <span className="text-[11px] text-calx-text-muted">
                    {appeal.createdAt && formatRelativeTime(appeal.createdAt)}
                </span>
                {appeal.status !== 'pending' && (
                    <span className={`ml-auto text-[10px] px-2 py-0.5 rounded ${
                        appeal.status === 'accepted'
                            ? 'bg-green-500/15 text-green-300'
                            : 'bg-amber-500/15 text-amber-300'
                    }`}>
                        {appeal.status === 'accepted' ? '✓ Accepté' : '✗ Rejeté'}
                    </span>
                )}
            </div>

            <div className="flex items-center gap-2 text-xs text-calx-text-muted mb-3">
                <UserIcon size={12} />
                <span>UID : {appeal.uid.slice(0, 20)}…</span>
                <span>·</span>
                <span>Content : {appeal.contentId.slice(0, 20)}…</span>
            </div>

            {/* Original AI verdict context */}
            {verdict && (
                <div className="bg-amber-500/5 border border-amber-500/15 rounded-lg p-3 mb-3">
                    <p className="text-[10px] text-amber-300 font-semibold uppercase tracking-wider mb-1">
                        Verdict IA original
                    </p>
                    <p className="text-xs text-calx-text-secondary mb-1">
                        <span className="font-medium">{verdict.reason}</span> · confiance {Math.round(verdict.confidence * 100)}%
                    </p>
                    <p className="text-xs text-calx-text-secondary leading-relaxed">
                        {verdict.explanation}
                    </p>
                </div>
            )}

            {/* User's appeal message */}
            <div className="bg-calx-surface/50 border border-calx-surface-variant rounded-lg p-3 mb-3">
                <p className="text-[10px] text-calx-text-muted uppercase tracking-wider mb-1">
                    Message de l&apos;utilisateur
                </p>
                <p className="text-sm text-calx-text leading-relaxed whitespace-pre-wrap">
                    {appeal.userMessage}
                </p>
            </div>

            {appeal.status === 'pending' && (
                <>
                    <textarea
                        value={adminReason}
                        onChange={(e) => onAdminReasonChange(e.target.value)}
                        placeholder="Raison de votre décision (optionnel, communiquée à l'utilisateur via email)"
                        rows={2}
                        className="w-full bg-calx-surface border border-calx-surface-variant rounded-lg p-3 text-xs text-calx-text resize-none focus:outline-none focus:border-gold-400/50 mb-3"
                    />
                    <div className="flex gap-2">
                        <button
                            onClick={onAccept}
                            disabled={disabled}
                            className="flex-1 px-3 py-2 rounded-lg bg-green-500/15 border border-green-500/30 text-green-300 text-xs font-semibold hover:bg-green-500/25 disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            <Check size={14} /> Accepter (restaurer)
                        </button>
                        <button
                            onClick={onReject}
                            disabled={disabled}
                            className="flex-1 px-3 py-2 rounded-lg bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-semibold hover:bg-amber-500/25 disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            <X size={14} /> Rejeter (maintenir)
                        </button>
                    </div>
                </>
            )}

            {appeal.status !== 'pending' && appeal.resolvedReason && (
                <p className="text-[11px] text-calx-text-muted mt-2 italic">
                    Note admin : {appeal.resolvedReason}
                </p>
            )}
        </div>
    );
}
