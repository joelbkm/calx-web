'use client';

import RoleGuard from '@/components/guards/RoleGuard';
import { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { httpsCallable } from 'firebase/functions';
import { db, functions } from '@/lib/firebase/client';
import { formatRelativeTime } from '@/lib/utils';
import { Bot, User, Users, Shield, Check, X, Ban, Eye, EyeOff } from 'lucide-react';

interface ModerationVerdict {
    reason: string;
    confidence: number;
    suggestedAction?: string;
    explanation: string;
    matchedText?: string | null;
    analyzedAt?: { toDate: () => Date };
    model?: string;
    promptVersion?: string;
}

interface ReviewItem {
    id: string;
    type: 'user' | 'squad';
    displayName?: string;
    name?: string;
    photoUrl?: string;
    description?: string;
    creatorId?: string;
    moderationVerdict?: ModerationVerdict;
    moderationStatus?: string;
}

type FilterType = 'all' | 'user' | 'squad';

const REASON_LABELS: Record<string, { fr: string; severity: 'low' | 'medium' | 'high' }> = {
    safe: { fr: 'Safe', severity: 'low' },
    nudity_explicit: { fr: 'Nudité explicite', severity: 'high' },
    violence_or_self_harm: { fr: 'Violence / auto-mutilation', severity: 'high' },
    eating_disorder_promotion: { fr: 'Promotion TCA', severity: 'high' },
    dangerous_health_advice: { fr: 'Conseil santé dangereux', severity: 'high' },
    body_shaming_or_harassment: { fr: 'Body shaming / harcèlement', severity: 'medium' },
    weight_loss_scam: { fr: 'Arnaque minceur / MLM', severity: 'medium' },
    hate_speech: { fr: 'Discours haineux', severity: 'high' },
    spam_or_advertising: { fr: 'Spam / publicité', severity: 'low' },
    unclear: { fr: 'Ambigu', severity: 'low' },
};

export default function AIReviewPage() {
    return (
        <RoleGuard module="moderation">
            <AIReviewInner />
        </RoleGuard>
    );
}

function AIReviewInner() {
    const [users, setUsers] = useState<ReviewItem[]>([]);
    const [squads, setSquads] = useState<ReviewItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<FilterType>('all');
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [actionLoading, setActionLoading] = useState<string | null>(null);
    const [revealedImages, setRevealedImages] = useState<Set<string>>(new Set());

    // Real-time listener: users in manual_review
    useEffect(() => {
        const q = query(
            collection(db, 'users'),
            where('moderationStatus', '==', 'manual_review')
        );
        const unsub = onSnapshot(q, (snap) => {
            const items: ReviewItem[] = snap.docs.map((d) => {
                const data = d.data();
                return {
                    id: d.id,
                    type: 'user',
                    displayName: data.displayName,
                    photoUrl: data.photoUrl,
                    moderationVerdict: data.moderationVerdict,
                    moderationStatus: data.moderationStatus,
                };
            });
            setUsers(items);
            setLoading(false);
        }, (err) => {
            console.error('AI review users listener error:', err);
            setLoading(false);
        });
        return () => unsub();
    }, []);

    // Real-time listener: squads in manual_review
    useEffect(() => {
        const q = query(
            collection(db, 'squads'),
            where('moderationStatus', '==', 'manual_review')
        );
        const unsub = onSnapshot(q, (snap) => {
            const items: ReviewItem[] = snap.docs.map((d) => {
                const data = d.data();
                return {
                    id: d.id,
                    type: 'squad',
                    name: data.name,
                    photoUrl: data.photoUrl,
                    description: data.description,
                    creatorId: data.creatorId,
                    moderationVerdict: data.moderationVerdict,
                    moderationStatus: data.moderationStatus,
                };
            });
            setSquads(items);
        }, (err) => console.error('AI review squads listener error:', err));
        return () => unsub();
    }, []);

    const allItems = [...users, ...squads];
    const visibleItems = filter === 'all' ? allItems : allItems.filter((i) => i.type === filter);
    const selected = visibleItems.find((i) => i.id === selectedId) || null;

    function toggleReveal(itemId: string) {
        const next = new Set(revealedImages);
        if (next.has(itemId)) next.delete(itemId);
        else next.add(itemId);
        setRevealedImages(next);
    }

    async function callResolve(item: ReviewItem, decision: 'approve' | 'reject' | 'ban', banDays?: number) {
        const verb = decision === 'approve' ? 'approuver' : decision === 'ban' ? 'bannir' : 'rejeter';
        const confirmMsg = decision === 'ban'
            ? `🚫 Bannir l'utilisateur ${banDays} jour(s) ?\n\nLe contenu sera rejeté et l'utilisateur sera banni temporairement.`
            : `${decision === 'approve' ? '✓' : '✗'} ${verb.charAt(0).toUpperCase() + verb.slice(1)} ce ${item.type} ?`;
        if (!confirm(confirmMsg)) return;

        setActionLoading(item.id);
        try {
            const fn = httpsCallable(functions, 'resolveManualReview');
            await fn({
                targetType: item.type,
                targetId: item.id,
                decision,
                banDays,
            });
            if (selectedId === item.id) setSelectedId(null);
        } catch (err) {
            console.error('resolveManualReview error:', err);
            alert('Erreur : ' + (err as Error).message);
        }
        setActionLoading(null);
    }

    return (
        <div className="min-h-screen bg-calx-bg p-6">
            <header className="mb-6 flex items-center gap-3">
                <Bot size={28} className="text-gold-400" />
                <div>
                    <h1 className="text-2xl font-bold text-calx-text">Review IA</h1>
                    <p className="text-sm text-calx-text-muted">
                        Contenus en attente de validation manuelle après analyse IA
                    </p>
                </div>
            </header>

            {/* Filters */}
            <div className="flex gap-2 mb-6">
                <FilterButton
                    active={filter === 'all'}
                    onClick={() => setFilter('all')}
                    icon={<Shield size={14} />}
                    label="Tous"
                    count={allItems.length}
                />
                <FilterButton
                    active={filter === 'user'}
                    onClick={() => setFilter('user')}
                    icon={<User size={14} />}
                    label="Utilisateurs"
                    count={users.length}
                />
                <FilterButton
                    active={filter === 'squad'}
                    onClick={() => setFilter('squad')}
                    icon={<Users size={14} />}
                    label="Squads"
                    count={squads.length}
                />
            </div>

            {/* List + detail panel */}
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-4">
                <div className="space-y-3">
                    {loading ? (
                        <div className="text-center py-10">
                            <div className="inline-block w-6 h-6 border-2 border-gold-400 border-t-transparent rounded-full animate-spin" />
                            <p className="text-xs text-calx-text-muted mt-3">Chargement…</p>
                        </div>
                    ) : visibleItems.length === 0 ? (
                        <div className="text-center py-12 bg-calx-card border border-calx-surface-variant rounded-xl">
                            <Bot size={32} className="mx-auto text-calx-text-muted mb-3" />
                            <p className="text-sm text-calx-text-muted">
                                Aucun contenu en attente de review IA 🎉
                            </p>
                        </div>
                    ) : (
                        visibleItems.map((item) => (
                            <ReviewCard
                                key={item.id}
                                item={item}
                                selected={selectedId === item.id}
                                onSelect={() => setSelectedId(item.id)}
                                revealed={revealedImages.has(item.id)}
                                onToggleReveal={() => toggleReveal(item.id)}
                            />
                        ))
                    )}
                </div>

                {/* Detail panel */}
                {selected && (
                    <DetailPanel
                        item={selected}
                        revealed={revealedImages.has(selected.id)}
                        onToggleReveal={() => toggleReveal(selected.id)}
                        onApprove={() => callResolve(selected, 'approve')}
                        onReject={() => callResolve(selected, 'reject')}
                        onBan={(days) => callResolve(selected, 'ban', days)}
                        actionLoading={actionLoading === selected.id}
                        onClose={() => setSelectedId(null)}
                    />
                )}
            </div>
        </div>
    );
}

function FilterButton({ active, onClick, icon, label, count }: {
    active: boolean; onClick: () => void; icon: React.ReactNode; label: string; count: number;
}) {
    return (
        <button
            onClick={onClick}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-medium transition-colors ${
                active
                    ? 'bg-gold-400/15 border border-gold-400/30 text-gold-300'
                    : 'bg-calx-card border border-calx-surface-variant text-calx-text-secondary hover:text-calx-text'
            }`}
        >
            {icon}
            <span>{label}</span>
            <span className={`ml-1 px-1.5 py-0.5 rounded text-[10px] ${
                active ? 'bg-gold-400/20 text-gold-200' : 'bg-calx-surface text-calx-text-muted'
            }`}>{count}</span>
        </button>
    );
}

function ReviewCard({ item, selected, onSelect, revealed, onToggleReveal }: {
    item: ReviewItem;
    selected: boolean;
    onSelect: () => void;
    revealed: boolean;
    onToggleReveal: () => void;
}) {
    const verdict = item.moderationVerdict;
    const reasonLabel = verdict ? REASON_LABELS[verdict.reason] : null;

    return (
        <div
            className={`bg-calx-card border rounded-xl p-4 cursor-pointer transition-all ${
                selected ? 'border-gold-400/50 ring-1 ring-gold-400/20' : 'border-calx-surface-variant hover:border-calx-text-muted/30'
            }`}
            onClick={onSelect}
        >
            <div className="flex items-start gap-3">
                {/* Image with blur */}
                <div className="relative flex-shrink-0">
                    {item.photoUrl ? (
                        <>
                            <img
                                src={item.photoUrl}
                                alt=""
                                className={`w-14 h-14 rounded-lg object-cover border border-calx-surface-variant transition-all ${
                                    revealed ? '' : 'blur-md'
                                }`}
                            />
                            <button
                                onClick={(e) => { e.stopPropagation(); onToggleReveal(); }}
                                className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-calx-bg border border-calx-surface-variant flex items-center justify-center text-calx-text-muted hover:text-calx-text"
                                title={revealed ? 'Re-flouter' : 'Afficher'}
                            >
                                {revealed ? <EyeOff size={11} /> : <Eye size={11} />}
                            </button>
                        </>
                    ) : (
                        <div className="w-14 h-14 rounded-lg bg-calx-surface flex items-center justify-center">
                            {item.type === 'user' ? <User size={20} className="text-calx-text-muted" /> : <Users size={20} className="text-calx-text-muted" />}
                        </div>
                    )}
                </div>

                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-calx-surface-variant text-calx-text-muted uppercase tracking-wider">
                            {item.type === 'user' ? 'Profil' : 'Squad'}
                        </span>
                        {reasonLabel && (
                            <span className={`text-[10px] px-1.5 py-0.5 rounded ${
                                reasonLabel.severity === 'high' ? 'bg-red-500/15 text-red-300' :
                                reasonLabel.severity === 'medium' ? 'bg-amber-500/15 text-amber-300' :
                                'bg-calx-surface-variant text-calx-text-muted'
                            }`}>
                                {reasonLabel.fr}
                            </span>
                        )}
                    </div>
                    <p className="text-sm font-semibold text-calx-text truncate">
                        {item.type === 'user' ? (item.displayName || '(sans nom)') : (item.name || '(sans nom)')}
                    </p>
                    {verdict && (
                        <p className="text-xs text-calx-text-secondary line-clamp-2 mt-1">
                            {verdict.explanation}
                        </p>
                    )}
                    {verdict && (
                        <div className="flex items-center gap-2 mt-2">
                            <span className="text-[10px] text-calx-text-muted">Confiance</span>
                            <div className="flex-1 max-w-[100px] h-1 bg-calx-surface-variant rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-gold-400"
                                    style={{ width: `${Math.round(verdict.confidence * 100)}%` }}
                                />
                            </div>
                            <span className="text-[10px] text-calx-text-secondary tabular-nums">
                                {Math.round(verdict.confidence * 100)}%
                            </span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

function DetailPanel({ item, revealed, onToggleReveal, onApprove, onReject, onBan, actionLoading, onClose }: {
    item: ReviewItem;
    revealed: boolean;
    onToggleReveal: () => void;
    onApprove: () => void;
    onReject: () => void;
    onBan: (days: number) => void;
    actionLoading: boolean;
    onClose: () => void;
}) {
    const [showBanMenu, setShowBanMenu] = useState(false);
    const verdict = item.moderationVerdict;
    const reasonLabel = verdict ? REASON_LABELS[verdict.reason] : null;

    return (
        <div className="bg-calx-card border border-calx-surface-variant rounded-xl p-5 sticky top-6 max-h-[calc(100vh-3rem)] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-calx-text">Détails</h3>
                <button onClick={onClose} className="p-1 hover:bg-calx-surface rounded">
                    <X size={14} className="text-calx-text-secondary" />
                </button>
            </div>

            {/* Image */}
            {item.photoUrl && (
                <div className="relative mb-4">
                    <img
                        src={item.photoUrl}
                        alt=""
                        className={`w-full max-h-72 object-contain rounded-lg border border-calx-surface-variant transition-all ${
                            revealed ? '' : 'blur-xl'
                        }`}
                    />
                    <button
                        onClick={onToggleReveal}
                        className="absolute top-2 right-2 px-2 py-1 rounded bg-calx-bg/80 backdrop-blur border border-calx-surface-variant text-[11px] text-calx-text-secondary hover:text-calx-text flex items-center gap-1"
                    >
                        {revealed ? <><EyeOff size={11} /> Flouter</> : <><Eye size={11} /> Afficher</>}
                    </button>
                </div>
            )}

            <p className="text-sm font-semibold text-calx-text mb-1">
                {item.type === 'user' ? (item.displayName || '(sans nom)') : (item.name || '(sans nom)')}
            </p>
            <p className="text-[11px] text-calx-text-muted mb-4">
                ID : {item.id.slice(0, 16)}…
                {verdict?.analyzedAt && ` · Analysé ${formatRelativeTime(verdict.analyzedAt)}`}
            </p>

            {/* Verdict */}
            {verdict && (
                <div className="bg-amber-500/5 border border-amber-500/20 rounded-lg p-3 mb-4">
                    <div className="flex items-center gap-2 mb-2">
                        <Bot size={14} className="text-amber-300" />
                        <span className="text-[11px] font-semibold uppercase tracking-wider text-amber-300">
                            Verdict IA
                        </span>
                    </div>
                    <p className="text-xs text-calx-text mb-2">
                        Catégorie : <span className="font-medium">{reasonLabel?.fr || verdict.reason}</span>
                    </p>
                    <div className="flex items-center gap-2 mb-2">
                        <span className="text-[10px] text-calx-text-muted w-16">Confiance</span>
                        <div className="flex-1 h-1.5 bg-calx-surface-variant rounded-full overflow-hidden">
                            <div className="h-full bg-amber-400" style={{ width: `${Math.round(verdict.confidence * 100)}%` }} />
                        </div>
                        <span className="text-[10px] text-calx-text-secondary tabular-nums">{Math.round(verdict.confidence * 100)}%</span>
                    </div>
                    <p className="text-xs text-calx-text-secondary leading-relaxed">
                        {verdict.explanation}
                    </p>
                    {verdict.matchedText && (
                        <p className="text-xs italic text-calx-text-muted mt-2">
                            &laquo; {verdict.matchedText} &raquo;
                        </p>
                    )}
                </div>
            )}

            {/* Actions */}
            <div className="space-y-2">
                <button
                    onClick={onApprove}
                    disabled={actionLoading}
                    className="w-full px-3 py-2 rounded-lg bg-green-500/15 border border-green-500/30 text-green-300 text-xs font-semibold hover:bg-green-500/25 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                    <Check size={14} /> Approuver
                </button>
                <button
                    onClick={onReject}
                    disabled={actionLoading}
                    className="w-full px-3 py-2 rounded-lg bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-semibold hover:bg-amber-500/25 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                    <X size={14} /> Rejeter (+ strike)
                </button>
                <div className="relative">
                    <button
                        onClick={() => setShowBanMenu(!showBanMenu)}
                        disabled={actionLoading}
                        className="w-full px-3 py-2 rounded-lg bg-red-500/15 border border-red-500/30 text-red-300 text-xs font-semibold hover:bg-red-500/25 disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                        <Ban size={14} /> Bannir l&apos;utilisateur
                    </button>
                    {showBanMenu && (
                        <div className="absolute top-full mt-1 left-0 right-0 bg-calx-bg border border-calx-surface-variant rounded-lg overflow-hidden z-10">
                            {[
                                { label: '1 semaine', days: 7 },
                                { label: '2 semaines', days: 14 },
                                { label: '1 mois', days: 30 },
                            ].map((opt) => (
                                <button
                                    key={opt.days}
                                    onClick={() => { setShowBanMenu(false); onBan(opt.days); }}
                                    className="w-full px-3 py-2 text-left text-xs text-calx-text hover:bg-calx-surface"
                                >
                                    {opt.label}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
