'use client';

import { useAuth } from '@/lib/auth/context';
import { ROLE_LABELS } from '@/lib/auth/rbac';
import { Users, TrendingUp, Flag, CreditCard, Activity, BarChart3, UserMinus } from 'lucide-react';
import { useState, useEffect } from 'react';
import { collection, query, where, getCountFromServer } from 'firebase/firestore';
import { db } from '@/lib/firebase/client';

interface DashboardStats {
    totalUsers: number | null;
    activeSubscribers: number | null;
    mrr: number | null;
    pendingReports: number | null;
    deletedAccounts: number | null;
}

export default function DashboardOverview() {
    const { user, role } = useAuth();
    const [stats, setStats] = useState<DashboardStats>({
        totalUsers: null,
        activeSubscribers: null,
        mrr: null,
        pendingReports: null,
        deletedAccounts: null,
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // ── 1. Total users: efficient server-side count (1 read per ~1000 docs) ──
        getCountFromServer(collection(db, 'users'))
            .then(snap => {
                setStats(prev => ({ ...prev, totalUsers: snap.data().count }));
                setLoading(false);
            })
            .catch((err) => {
                console.error('Error counting users:', err);
                setStats(prev => ({ ...prev, totalUsers: 0 }));
                setLoading(false);
            });

        // ── 2. Active subscribers: server-side count excluding blocked users ──
        const blockedQuery = query(collection(db, 'users'), where('blocked', '==', true));
        Promise.all([
            getCountFromServer(collection(db, 'users')),
            getCountFromServer(blockedQuery),
        ])
            .then(([totalSnap, blockedSnap]) => {
                const active = totalSnap.data().count - blockedSnap.data().count;
                setStats(prev => ({ ...prev, activeSubscribers: active }));
            })
            .catch(() => setStats(prev => ({ ...prev, activeSubscribers: 0 })));

        // ── 3. Pending reports: real-time count ──
        // ── 3. Pending reports: efficient server-side count ──
        const reportsQuery = query(
            collection(db, 'reports'),
            where('status', '==', 'pending')
        );
        getCountFromServer(reportsQuery)
            .then(snap => setStats(prev => ({ ...prev, pendingReports: snap.data().count })))
            .catch(() => {
                // Fallback: count all reports if index is missing
                getCountFromServer(collection(db, 'reports'))
                    .then(snap => setStats(prev => ({ ...prev, pendingReports: snap.data().count })))
                    .catch(() => setStats(prev => ({ ...prev, pendingReports: 0 })));
            });

        // ── 4. MRR: placeholder for now (needs Stripe integration) ──
        setStats(prev => ({ ...prev, mrr: 0 }));

        // ── 5. Deleted accounts: efficient server-side count ──
        getCountFromServer(collection(db, 'account_deletions'))
            .then(snap => setStats(prev => ({ ...prev, deletedAccounts: snap.data().count })))
            .catch(() => setStats(prev => ({ ...prev, deletedAccounts: 0 })));
    }, []);

    const formatNumber = (n: number | null) => {
        if (n === null) return '…';
        if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
        return n.toString();
    };

    const cards = [
        {
            label: 'Utilisateurs totaux',
            value: formatNumber(stats.totalUsers),
            icon: <Users size={20} />,
            color: 'from-blue-500 to-blue-600',
        },
        {
            label: 'Abonnés actifs',
            value: formatNumber(stats.activeSubscribers),
            icon: <Activity size={20} />,
            color: 'from-green-500 to-green-600',
        },
        {
            label: 'MRR',
            value: stats.mrr !== null ? `$${stats.mrr.toFixed(0)}` : '…',
            icon: <TrendingUp size={20} />,
            color: 'from-gold-400 to-gold-600',
        },
        {
            label: 'Signalements en attente',
            value: formatNumber(stats.pendingReports),
            icon: <Flag size={20} />,
            color: stats.pendingReports && stats.pendingReports > 0 ? 'from-red-500 to-red-600' : 'from-green-500 to-green-600',
        },
        {
            label: 'Comptes supprimés',
            value: formatNumber(stats.deletedAccounts),
            icon: <UserMinus size={20} />,
            color: stats.deletedAccounts && stats.deletedAccounts > 0 ? 'from-red-500 to-red-600' : 'from-green-500 to-green-600',
        },
    ];

    return (
        <div>
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-calx-text">
                    Bonjour, {user?.displayName || user?.email?.split('@')[0]} 👋
                </h1>
                <p className="text-calx-text-secondary mt-1">
                    Rôle : <span className="text-gold-400 font-medium">{role ? ROLE_LABELS[role] : '—'}</span>
                </p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                {cards.map((card, i) => (
                    <div key={i} className="bg-calx-surface/50 border border-calx-surface rounded-xl p-5 card-glow hover:border-calx-surface-variant transition-all">
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-sm text-calx-text-secondary">{card.label}</span>
                            <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${card.color} flex items-center justify-center text-calx-text`}>
                                {card.icon}
                            </div>
                        </div>
                        <p className="text-2xl font-bold text-calx-text">
                            {loading && card.value === '…' ? (
                                <span className="inline-block w-5 h-5 border-2 border-gold-400 border-t-transparent rounded-full animate-spin" />
                            ) : (
                                card.value
                            )}
                        </p>
                    </div>
                ))}
            </div>

            {/* Quick Summary Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="bg-calx-surface/30 border border-calx-surface rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-calx-text mb-3 flex items-center gap-2">
                        <BarChart3 size={20} className="text-gold-400" />
                        Vue d&apos;ensemble
                    </h3>
                    <div className="space-y-3">
                        <div className="flex justify-between items-center py-2 border-b border-calx-surface/50">
                            <span className="text-sm text-calx-text-secondary">Utilisateurs inscrits</span>
                            <span className="text-sm font-semibold text-calx-text">{formatNumber(stats.totalUsers)}</span>
                        </div>
                        <div className="flex justify-between items-center py-2 border-b border-calx-surface/50">
                            <span className="text-sm text-calx-text-secondary">Comptes actifs</span>
                            <span className="text-sm font-semibold text-green-400">{formatNumber(stats.activeSubscribers)}</span>
                        </div>
                        <div className="flex justify-between items-center py-2 border-b border-calx-surface/50">
                            <span className="text-sm text-calx-text-secondary">Signalements en attente</span>
                            <span className={`text-sm font-semibold ${stats.pendingReports && stats.pendingReports > 0 ? 'text-red-400' : 'text-green-400'}`}>
                                {formatNumber(stats.pendingReports)}
                            </span>
                        </div>
                        <div className="flex justify-between items-center py-2">
                            <span className="text-sm text-calx-text-secondary">Revenus mensuels (MRR)</span>
                            <span className="text-sm font-semibold text-gold-400">{stats.mrr !== null ? `$${stats.mrr.toFixed(0)}` : '…'}</span>
                        </div>
                    </div>
                </div>

                <div className="bg-calx-surface/30 border border-calx-surface rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-calx-text mb-3 flex items-center gap-2">
                        <CreditCard size={20} className="text-gold-400" />
                        Statut des modules
                    </h3>
                    <div className="space-y-3">
                        <div className="flex justify-between items-center py-2 border-b border-calx-surface/50">
                            <span className="text-sm text-calx-text-secondary">Modération</span>
                            <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-green-500/10 text-green-400 border border-green-500/20">Actif</span>
                        </div>
                        <div className="flex justify-between items-center py-2 border-b border-calx-surface/50">
                            <span className="text-sm text-calx-text-secondary">Notifications push</span>
                            <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-green-500/10 text-green-400 border border-green-500/20">Actif</span>
                        </div>
                        <div className="flex justify-between items-center py-2 border-b border-calx-surface/50">
                            <span className="text-sm text-calx-text-secondary">Emails transactionnels</span>
                            <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-green-500/10 text-green-400 border border-green-500/20">Actif</span>
                        </div>
                        <div className="flex justify-between items-center py-2">
                            <span className="text-sm text-calx-text-secondary">Paiements (Stripe)</span>
                            <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-500/10 text-yellow-400 border border-yellow-500/20">À configurer</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
