'use client';

import RoleGuard from '@/components/guards/RoleGuard';
import { useState, useEffect } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase/client';
import { formatEUR } from '@/lib/utils';
import { TrendingUp, Users, CreditCard, Calendar } from 'lucide-react';

interface RevenueData {
    mrr: number;
    totalSubscribers: number;
    activeTrials: number;
    monthlyHistory: Record<string, { revenue: number; subscribers: number }>;
}

export default function FinancePage() {
    const [data, setData] = useState<RevenueData | null>(null);
    const [loading, setLoading] = useState(true);
    const [period, setPeriod] = useState<'month' | 'year'>('month');

    useEffect(() => {
        const unsub = onSnapshot(doc(db, 'aggregates', 'revenue'), (snap) => {
            if (snap.exists()) {
                setData(snap.data() as RevenueData);
            }
            setLoading(false);
        });
        return () => unsub();
    }, []);

    const historyEntries = data?.monthlyHistory
        ? Object.entries(data.monthlyHistory)
            .sort(([a], [b]) => b.localeCompare(a))
            .slice(0, period === 'month' ? 6 : 12)
        : [];

    return (
        <RoleGuard module="finance">
            <div>
                <div className="mb-8">
                    <h1 className="text-2xl font-bold text-calx-text flex items-center gap-3">
                        <TrendingUp className="text-gold-400" size={28} />
                        Finance & Analytique
                    </h1>
                    <p className="text-calx-text-secondary mt-1">Revenus et statistiques d&apos;abonnement</p>
                </div>

                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <div className="w-8 h-8 border-2 border-gold-400 border-t-transparent rounded-full animate-spin" />
                    </div>
                ) : (
                    <>
                        {/* KPI Cards */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                            <div className="bg-calx-surface/50 border border-calx-surface rounded-xl p-5 card-glow">
                                <div className="flex items-center justify-between mb-3">
                                    <span className="text-sm text-calx-text-secondary">MRR</span>
                                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-gold-400 to-gold-600 flex items-center justify-center text-calx-text">
                                        <TrendingUp size={16} />
                                    </div>
                                </div>
                                <p className="text-3xl font-bold text-calx-text">{data ? formatEUR(data.mrr) : '—'}</p>
                                <p className="text-xs text-calx-text-muted mt-1">Revenu mensuel récurrent</p>
                            </div>

                            <div className="bg-calx-surface/50 border border-calx-surface rounded-xl p-5 card-glow">
                                <div className="flex items-center justify-between mb-3">
                                    <span className="text-sm text-calx-text-secondary">Abonnés actifs</span>
                                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center text-calx-text">
                                        <Users size={16} />
                                    </div>
                                </div>
                                <p className="text-3xl font-bold text-calx-text">{data?.totalSubscribers ?? '—'}</p>
                                <p className="text-xs text-calx-text-muted mt-1">Abonnements en cours</p>
                            </div>

                            <div className="bg-calx-surface/50 border border-calx-surface rounded-xl p-5 card-glow">
                                <div className="flex items-center justify-between mb-3">
                                    <span className="text-sm text-calx-text-secondary">Essais gratuits</span>
                                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center text-calx-text">
                                        <CreditCard size={16} />
                                    </div>
                                </div>
                                <p className="text-3xl font-bold text-calx-text">{data?.activeTrials ?? '—'}</p>
                                <p className="text-xs text-calx-text-muted mt-1">Périodes d&apos;essai actives</p>
                            </div>
                        </div>

                        {/* Period filter */}
                        <div className="flex items-center gap-2 mb-4">
                            <Calendar size={16} className="text-calx-text-secondary" />
                            <span className="text-sm text-calx-text-secondary">Période :</span>
                            <button
                                onClick={() => setPeriod('month')}
                                className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${period === 'month' ? 'bg-gold-400/10 text-gold-400 border border-gold-400/30' : 'text-calx-text-secondary hover:text-calx-text'
                                    }`}
                            >
                                6 mois
                            </button>
                            <button
                                onClick={() => setPeriod('year')}
                                className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${period === 'year' ? 'bg-gold-400/10 text-gold-400 border border-gold-400/30' : 'text-calx-text-secondary hover:text-calx-text'
                                    }`}
                            >
                                12 mois
                            </button>
                        </div>

                        {/* History table */}
                        <div className="bg-calx-surface/30 border border-calx-surface rounded-xl overflow-hidden">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-calx-surface">
                                        <th className="text-left px-4 py-3 text-xs font-medium text-calx-text-secondary uppercase">Mois</th>
                                        <th className="text-right px-4 py-3 text-xs font-medium text-calx-text-secondary uppercase">Revenu</th>
                                        <th className="text-right px-4 py-3 text-xs font-medium text-calx-text-secondary uppercase">Abonnés</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-800/50">
                                    {historyEntries.length === 0 ? (
                                        <tr>
                                            <td colSpan={3} className="px-4 py-12 text-center text-calx-text-secondary">
                                                Aucune donnée disponible. Les Cloud Functions d&apos;agrégation doivent être déployées.
                                            </td>
                                        </tr>
                                    ) : (
                                        historyEntries.map(([month, d]) => (
                                            <tr key={month} className="hover:bg-calx-card/30 transition-colors">
                                                <td className="px-4 py-3 text-sm text-calx-text font-medium">{month}</td>
                                                <td className="px-4 py-3 text-sm text-right text-green-400 font-medium">{formatEUR(d.revenue)}</td>
                                                <td className="px-4 py-3 text-sm text-right text-calx-text-secondary">{d.subscribers}</td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </>
                )}
            </div>
        </RoleGuard>
    );
}
