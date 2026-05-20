'use client';

import { useState, useEffect } from 'react';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase/client';
import { UserMinus, TrendingDown, MessageSquareWarning, Calendar, Search } from 'lucide-react';

interface DeletionRequest {
    id: string;
    uid: string;
    email: string;
    displayName: string;
    reason: string;
    status: string;
    language: string;
    requestedAt: { seconds: number } | null;
}

export default function DeletionsPage() {
    const [deletions, setDeletions] = useState<DeletionRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        const q = query(
            collection(db, 'account_deletions'),
            orderBy('requestedAt', 'desc')
        );

        const unsub = onSnapshot(
            q,
            (snap) => {
                const items = snap.docs.map((doc) => ({
                    id: doc.id,
                    ...doc.data(),
                })) as DeletionRequest[];
                setDeletions(items);
                setLoading(false);
            },
            (err) => {
                console.error('Error loading deletions:', err);
                // Fallback without ordering (no index)
                const fallbackUnsub = onSnapshot(
                    collection(db, 'account_deletions'),
                    (snap) => {
                        const items = snap.docs
                            .map((doc) => ({ id: doc.id, ...doc.data() } as DeletionRequest))
                            .sort((a, b) => {
                                const aTime = a.requestedAt?.seconds ?? 0;
                                const bTime = b.requestedAt?.seconds ?? 0;
                                return bTime - aTime;
                            });
                        setDeletions(items);
                        setLoading(false);
                    },
                    () => {
                        setLoading(false);
                    }
                );
                return () => fallbackUnsub();
            }
        );

        return () => unsub();
    }, []);

    // ── Stats ──
    const totalDeletions = deletions.length;

    const now = new Date();
    const thisMonth = deletions.filter((d) => {
        if (!d.requestedAt) return false;
        const date = new Date(d.requestedAt.seconds * 1000);
        return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
    }).length;

    // ── Reason breakdown ──
    const reasonCounts: Record<string, number> = {};
    deletions.forEach((d) => {
        const reason = d.reason || 'Non spécifié';
        reasonCounts[reason] = (reasonCounts[reason] || 0) + 1;
    });
    const sortedReasons = Object.entries(reasonCounts).sort((a, b) => b[1] - a[1]);
    const topReason = sortedReasons.length > 0 ? sortedReasons[0][0] : '—';

    // ── Search filter ──
    const filtered = deletions.filter((d) => {
        if (!searchQuery) return true;
        const q = searchQuery.toLowerCase();
        return (
            d.email?.toLowerCase().includes(q) ||
            d.displayName?.toLowerCase().includes(q) ||
            d.reason?.toLowerCase().includes(q)
        );
    });

    const formatDate = (ts: { seconds: number } | null) => {
        if (!ts) return '—';
        const date = new Date(ts.seconds * 1000);
        return date.toLocaleDateString('fr-FR', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const statusBadge = (status: string) => {
        const styles: Record<string, string> = {
            email_sent: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
            confirmed: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
            deleted: 'bg-red-500/10 text-red-400 border-red-500/20',
            pending: 'bg-gray-500/10 text-gray-400 border-gray-500/20',
        };
        const labels: Record<string, string> = {
            email_sent: 'Email envoyé',
            confirmed: 'Confirmé',
            deleted: 'Supprimé',
            pending: 'En attente',
        };
        return (
            <span
                className={`px-2 py-0.5 rounded-full text-xs font-medium border ${styles[status] || styles.pending}`}
            >
                {labels[status] || status}
            </span>
        );
    };

    const statCards = [
        {
            label: 'Total suppressions',
            value: totalDeletions,
            icon: <UserMinus size={20} />,
            color: 'from-red-500 to-red-600',
        },
        {
            label: 'Ce mois-ci',
            value: thisMonth,
            icon: <Calendar size={20} />,
            color: 'from-orange-500 to-orange-600',
        },
        {
            label: 'Raison #1',
            value: topReason.length > 25 ? topReason.substring(0, 25) + '…' : topReason,
            icon: <MessageSquareWarning size={20} />,
            color: 'from-purple-500 to-purple-600',
            isText: true,
        },
        {
            label: 'Taux ce mois',
            value: totalDeletions > 0 ? `${((thisMonth / Math.max(totalDeletions, 1)) * 100).toFixed(0)}%` : '0%',
            icon: <TrendingDown size={20} />,
            color: thisMonth > 5 ? 'from-red-500 to-red-600' : 'from-green-500 to-green-600',
        },
    ];

    return (
        <div>
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-calx-text">Suppressions de comptes</h1>
                <p className="text-calx-text-secondary mt-1">
                    Suivez les demandes de suppression et analysez les raisons pour améliorer l&apos;application.
                </p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                {statCards.map((card, i) => (
                    <div
                        key={i}
                        className="bg-calx-surface/50 border border-calx-surface rounded-xl p-5 card-glow hover:border-calx-surface-variant transition-all"
                    >
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-sm text-calx-text-secondary">{card.label}</span>
                            <div
                                className={`w-8 h-8 rounded-lg bg-gradient-to-br ${card.color} flex items-center justify-center text-calx-text`}
                            >
                                {card.icon}
                            </div>
                        </div>
                        <p className={`font-bold text-calx-text ${card.isText ? 'text-sm' : 'text-2xl'}`}>
                            {loading ? (
                                <span className="inline-block w-5 h-5 border-2 border-gold-400 border-t-transparent rounded-full animate-spin" />
                            ) : (
                                card.value
                            )}
                        </p>
                    </div>
                ))}
            </div>

            {/* Two-column layout: Table + Reasons */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main table — 2/3 */}
                <div className="lg:col-span-2 bg-calx-surface/30 border border-calx-surface rounded-xl overflow-hidden">
                    {/* Search bar */}
                    <div className="p-4 border-b border-calx-surface/50">
                        <div className="relative">
                            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-calx-text-muted" />
                            <input
                                type="text"
                                placeholder="Rechercher par nom, email ou raison…"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 bg-calx-bg border border-calx-surface rounded-lg text-sm text-calx-text placeholder:text-calx-text-muted focus:outline-none focus:border-gold-400/50 transition-colors"
                            />
                        </div>
                    </div>

                    {/* Table */}
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead>
                                <tr className="border-b border-calx-surface/50">
                                    <th className="px-4 py-3 text-calx-text-secondary font-medium">Utilisateur</th>
                                    <th className="px-4 py-3 text-calx-text-secondary font-medium">Raison</th>
                                    <th className="px-4 py-3 text-calx-text-secondary font-medium">Statut</th>
                                    <th className="px-4 py-3 text-calx-text-secondary font-medium">Date</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr>
                                        <td colSpan={4} className="px-4 py-8 text-center text-calx-text-muted">
                                            <span className="inline-block w-5 h-5 border-2 border-gold-400 border-t-transparent rounded-full animate-spin" />
                                        </td>
                                    </tr>
                                ) : filtered.length === 0 ? (
                                    <tr>
                                        <td colSpan={4} className="px-4 py-8 text-center text-calx-text-muted">
                                            {searchQuery ? 'Aucun résultat trouvé.' : 'Aucune suppression de compte.'}
                                        </td>
                                    </tr>
                                ) : (
                                    filtered.map((d) => (
                                        <tr
                                            key={d.id}
                                            className="border-b border-calx-surface/30 hover:bg-calx-surface/20 transition-colors"
                                        >
                                            <td className="px-4 py-3">
                                                <div>
                                                    <p className="text-calx-text font-medium text-sm">
                                                        {d.displayName || '—'}
                                                    </p>
                                                    <p className="text-calx-text-muted text-xs">{d.email}</p>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 text-calx-text-secondary text-sm max-w-[200px] truncate">
                                                {d.reason || '—'}
                                            </td>
                                            <td className="px-4 py-3">{statusBadge(d.status)}</td>
                                            <td className="px-4 py-3 text-calx-text-muted text-xs whitespace-nowrap">
                                                {formatDate(d.requestedAt)}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Reason breakdown — 1/3 */}
                <div className="bg-calx-surface/30 border border-calx-surface rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-calx-text mb-4 flex items-center gap-2">
                        <MessageSquareWarning size={20} className="text-gold-400" />
                        Raisons de suppression
                    </h3>

                    {sortedReasons.length === 0 ? (
                        <p className="text-calx-text-muted text-sm">Aucune donnée disponible.</p>
                    ) : (
                        <div className="space-y-3">
                            {sortedReasons.slice(0, 10).map(([reason, count], i) => {
                                const percentage = ((count / totalDeletions) * 100).toFixed(0);
                                return (
                                    <div key={i}>
                                        <div className="flex justify-between items-center mb-1">
                                            <span className="text-sm text-calx-text-secondary truncate max-w-[180px]">
                                                {reason}
                                            </span>
                                            <span className="text-xs text-calx-text-muted ml-2 whitespace-nowrap">
                                                {count} ({percentage}%)
                                            </span>
                                        </div>
                                        <div className="w-full bg-calx-bg rounded-full h-1.5">
                                            <div
                                                className="bg-gradient-to-r from-red-500 to-orange-500 h-1.5 rounded-full transition-all"
                                                style={{ width: `${percentage}%` }}
                                            />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
