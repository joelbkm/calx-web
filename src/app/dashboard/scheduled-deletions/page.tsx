'use client';

import RoleGuard from '@/components/guards/RoleGuard';
import { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot, orderBy, type Timestamp } from 'firebase/firestore';
import { httpsCallable } from 'firebase/functions';
import { db, functions } from '@/lib/firebase/client';
import { formatRelativeTime } from '@/lib/utils';
import { Clock, Undo2, User as UserIcon, AlertTriangle } from 'lucide-react';

interface ScheduledUser {
    uid: string;
    email?: string;
    displayName?: string;
    photoUrl?: string;
    deletionScheduledFor?: Timestamp;
    deletionRequestedAt?: Timestamp;
    deletionReason?: string;
    deletionLanguage?: string;
}

export default function ScheduledDeletionsPage() {
    return (
        <RoleGuard module="users">
            <ScheduledDeletionsInner />
        </RoleGuard>
    );
}

function ScheduledDeletionsInner() {
    const [users, setUsers] = useState<ScheduledUser[]>([]);
    const [loading, setLoading] = useState(true);
    const [cancellingUid, setCancellingUid] = useState<string | null>(null);

    useEffect(() => {
        const q = query(
            collection(db, 'users'),
            where('deletionRequested', '==', true),
            orderBy('deletionScheduledFor', 'asc'),
        );
        const unsub = onSnapshot(q, (snap) => {
            const items: ScheduledUser[] = snap.docs.map((d) => {
                const data = d.data();
                return {
                    uid: d.id,
                    email: data.email,
                    displayName: data.displayName,
                    photoUrl: data.photoUrl || data.photoURL,
                    deletionScheduledFor: data.deletionScheduledFor as Timestamp | undefined,
                    deletionRequestedAt: data.deletionRequestedAt as Timestamp | undefined,
                    deletionReason: data.deletionReason,
                    deletionLanguage: data.deletionLanguage,
                };
            });
            setUsers(items);
            setLoading(false);
        }, (err) => {
            console.error('Scheduled deletions listener error:', err);
            setLoading(false);
        });
        return () => unsub();
    }, []);

    async function handleCancel(u: ScheduledUser) {
        const ok = confirm(`Annuler la suppression programmée de ${u.email || u.uid} ?`);
        if (!ok) return;
        setCancellingUid(u.uid);
        try {
            const fn = httpsCallable<{ uid: string }, { ok: boolean }>(functions, 'adminCancelDeletion');
            await fn({ uid: u.uid });
            // List auto-updates via onSnapshot.
        } catch (err) {
            console.error('adminCancelDeletion error:', err);
            alert('Erreur : ' + (err as Error).message);
        }
        setCancellingUid(null);
    }

    function daysUntil(ts?: Timestamp): number | null {
        if (!ts) return null;
        const ms = ts.toDate().getTime() - Date.now();
        if (ms < 0) return 0;
        return Math.ceil(ms / (24 * 60 * 60 * 1000));
    }

    return (
        <div className="min-h-screen bg-calx-bg p-6">
            <header className="mb-6 flex items-center gap-3">
                <Clock size={28} className="text-amber-400" />
                <div>
                    <h1 className="text-2xl font-bold text-calx-text">Suppressions programmées</h1>
                    <p className="text-sm text-calx-text-muted">
                        Utilisateurs ayant demandé la suppression — délai de grâce 15 jours
                    </p>
                </div>
            </header>

            <div className="bg-calx-card border border-calx-surface-variant rounded-xl p-4 mb-6">
                <div className="flex items-start gap-3">
                    <AlertTriangle size={18} className="text-amber-400 mt-0.5 flex-shrink-0" />
                    <p className="text-xs text-calx-text-secondary leading-relaxed">
                        Le compte est SUPPRIMÉ DÉFINITIVEMENT à la date programmée. L&apos;annulation
                        ici (en cas de demande du support) restaure immédiatement l&apos;accès de l&apos;utilisateur.
                        Une fois la date passée, la suppression est <strong>irréversible</strong>.
                    </p>
                </div>
            </div>

            {loading ? (
                <div className="text-center py-10">
                    <div className="inline-block w-6 h-6 border-2 border-gold-400 border-t-transparent rounded-full animate-spin" />
                </div>
            ) : users.length === 0 ? (
                <div className="text-center py-12 bg-calx-card border border-calx-surface-variant rounded-xl">
                    <Clock size={32} className="mx-auto text-calx-text-muted mb-3" />
                    <p className="text-sm text-calx-text-muted">
                        Aucune suppression programmée pour le moment.
                    </p>
                </div>
            ) : (
                <div className="space-y-3">
                    {users.map((u) => {
                        const days = daysUntil(u.deletionScheduledFor);
                        const urgent = days !== null && days <= 2;
                        return (
                            <div
                                key={u.uid}
                                className={`bg-calx-card border rounded-xl p-4 ${
                                    urgent ? 'border-red-500/40' : 'border-calx-surface-variant'
                                }`}
                            >
                                <div className="flex items-start gap-3">
                                    {u.photoUrl ? (
                                        // eslint-disable-next-line @next/next/no-img-element
                                        <img src={u.photoUrl} alt="" className="w-11 h-11 rounded-full object-cover border border-calx-surface-variant flex-shrink-0" />
                                    ) : (
                                        <div className="w-11 h-11 rounded-full bg-calx-surface flex items-center justify-center flex-shrink-0">
                                            <UserIcon size={18} className="text-calx-text-muted" />
                                        </div>
                                    )}
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-semibold text-calx-text truncate">
                                            {u.displayName || u.email || u.uid.slice(0, 16) + '…'}
                                        </p>
                                        {u.displayName && u.email && (
                                            <p className="text-xs text-calx-text-muted truncate">{u.email}</p>
                                        )}
                                        <div className="flex items-center gap-2 mt-2">
                                            <span className={`text-[10px] px-1.5 py-0.5 rounded uppercase tracking-wider ${
                                                urgent
                                                    ? 'bg-red-500/15 text-red-300'
                                                    : 'bg-amber-500/15 text-amber-300'
                                            }`}>
                                                {days !== null ? `${days} jour${days > 1 ? 's' : ''} restants` : 'Programmée'}
                                            </span>
                                            {u.deletionScheduledFor && (
                                                <span className="text-[11px] text-calx-text-muted">
                                                    → {u.deletionScheduledFor.toDate().toLocaleDateString('fr-FR', {
                                                        day: '2-digit', month: 'long', year: 'numeric',
                                                    })}
                                                </span>
                                            )}
                                            {u.deletionRequestedAt && (
                                                <span className="text-[11px] text-calx-text-muted">
                                                    · demandée {formatRelativeTime(u.deletionRequestedAt)}
                                                </span>
                                            )}
                                        </div>
                                        {u.deletionReason && (
                                            <p className="text-xs text-calx-text-secondary mt-2 italic">
                                                « {u.deletionReason} »
                                            </p>
                                        )}
                                    </div>
                                    <button
                                        onClick={() => handleCancel(u)}
                                        disabled={cancellingUid === u.uid}
                                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-green-500/10 border border-green-500/30 text-green-300 text-xs font-semibold hover:bg-green-500/20 disabled:opacity-50 flex-shrink-0"
                                        title="Annuler la suppression"
                                    >
                                        <Undo2 size={14} />
                                        {cancellingUid === u.uid ? 'Annulation…' : 'Annuler'}
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
