'use client';

import RoleGuard from '@/components/guards/RoleGuard';
import { useState, useEffect, useMemo } from 'react';
import { doc, onSnapshot, setDoc, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase/client';
import { useAuth } from '@/lib/auth/context';
import { CreditCard, Save, AlertCircle, Calculator, Gift, Clock } from 'lucide-react';

interface PricingConfig {
    monthlyPrice: number;
    freeMonthsOffered: number;
    annualPrice: number;
    savingsPercent: number;
    trialDays: number;
    currency: string;
    updatedAt?: unknown;
    updatedBy?: string;
}

const DEFAULT_CONFIG: PricingConfig = {
    monthlyPrice: 9.99,
    freeMonthsOffered: 2,
    annualPrice: 99.90,
    savingsPercent: 17,
    trialDays: 2,
    currency: 'USD',
};

export default function PricingPage() {
    const { user } = useAuth();
    const [config, setConfig] = useState<PricingConfig | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);

    useEffect(() => {
        const unsub = onSnapshot(doc(db, 'app_config', 'pricing'), (snap) => {
            if (snap.exists()) {
                const data = snap.data();
                setConfig({
                    monthlyPrice: data.monthlyPrice ?? DEFAULT_CONFIG.monthlyPrice,
                    freeMonthsOffered: data.freeMonthsOffered ?? DEFAULT_CONFIG.freeMonthsOffered,
                    annualPrice: data.annualPrice ?? DEFAULT_CONFIG.annualPrice,
                    savingsPercent: data.savingsPercent ?? DEFAULT_CONFIG.savingsPercent,
                    trialDays: data.trialDays ?? DEFAULT_CONFIG.trialDays,
                    currency: data.currency ?? DEFAULT_CONFIG.currency,
                    updatedAt: data.updatedAt,
                    updatedBy: data.updatedBy,
                });
            } else {
                setConfig({ ...DEFAULT_CONFIG });
            }
            setLoading(false);
        });
        return () => unsub();
    }, []);

    // Auto-compute annual price & savings when monthly price or free months change
    const computed = useMemo(() => {
        if (!config) return { annualPrice: 0, savingsPercent: 0 };
        const fullYear = config.monthlyPrice * 12;
        const annualPrice = Math.round(config.monthlyPrice * (12 - config.freeMonthsOffered) * 100) / 100;
        const savingsPercent = fullYear > 0 ? Math.round((1 - annualPrice / fullYear) * 100) : 0;
        return { annualPrice, savingsPercent };
    }, [config?.monthlyPrice, config?.freeMonthsOffered]);

    const handleSave = async () => {
        if (!config) return;
        setSaving(true);
        try {
            await setDoc(doc(db, 'app_config', 'pricing'), {
                monthlyPrice: config.monthlyPrice,
                freeMonthsOffered: config.freeMonthsOffered,
                annualPrice: computed.annualPrice,
                savingsPercent: computed.savingsPercent,
                trialDays: config.trialDays,
                currency: config.currency,
                updatedAt: Timestamp.now(),
                updatedBy: user?.uid,
            });
            setSaved(true);
            setTimeout(() => setSaved(false), 3000);
        } catch (err) {
            console.error('Error saving pricing:', err);
        }
        setSaving(false);
    };

    return (
        <RoleGuard module="pricing">
            <div>
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-2xl font-bold text-calx-text flex items-center gap-3">
                            <CreditCard className="text-gold-400" size={28} />
                            Contrôle du Paywall
                        </h1>
                        <p className="text-calx-text-secondary mt-1">Modifie les tarifs — l&apos;app mobile les lit en temps réel</p>
                    </div>
                </div>

                {/* Info banner */}
                <div className="flex items-start gap-3 p-4 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm mb-6">
                    <AlertCircle size={18} className="flex-shrink-0 mt-0.5" />
                    <p>
                        Les modifications sont instantanément reflétées dans l&apos;app mobile CalX via le document
                        Firestore <code className="bg-blue-500/20 px-1 rounded">app_config/pricing</code>. Aucune mise à jour de l&apos;App Store requise.
                    </p>
                </div>

                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <div className="w-8 h-8 border-2 border-gold-400 border-t-transparent rounded-full animate-spin" />
                    </div>
                ) : config ? (
                    <div className="space-y-6">
                        {/* ── Trial Days ── */}
                        <div className="bg-calx-surface/50 border border-calx-surface rounded-xl p-5">
                            <div className="flex items-center gap-2 mb-3">
                                <Clock size={18} className="text-gold-400" />
                                <h3 className="text-base font-semibold text-calx-text">Période d&apos;essai gratuit</h3>
                            </div>
                            <p className="text-xs text-calx-text-muted mb-3">L&apos;utilisateur doit entrer sa carte bancaire. Le paiement démarre automatiquement après la période d&apos;essai.</p>
                            <div className="flex items-center gap-3">
                                <input
                                    type="number"
                                    min={0}
                                    max={90}
                                    value={config.trialDays}
                                    onChange={(e) => setConfig({ ...config, trialDays: parseInt(e.target.value) || 0 })}
                                    className="w-24 px-4 py-2.5 bg-calx-card/50 border border-calx-surface-variant rounded-xl text-calx-text focus:outline-none focus:ring-2 focus:ring-gold-400/40 transition-all"
                                />
                                <span className="text-calx-text-secondary text-sm">jours</span>
                            </div>
                        </div>

                        {/* ── Monthly Price ── */}
                        <div className="bg-calx-surface/50 border border-calx-surface rounded-xl p-5">
                            <div className="flex items-center gap-2 mb-3">
                                <CreditCard size={18} className="text-gold-400" />
                                <h3 className="text-base font-semibold text-calx-text">Abonnement mensuel (CalX Pro)</h3>
                            </div>
                            <div className="flex items-center gap-3">
                                <input
                                    type="number"
                                    step="0.01"
                                    min={0}
                                    value={config.monthlyPrice}
                                    onChange={(e) => setConfig({ ...config, monthlyPrice: parseFloat(e.target.value) || 0 })}
                                    className="w-32 px-4 py-2.5 bg-calx-card/50 border border-calx-surface-variant rounded-xl text-calx-text focus:outline-none focus:ring-2 focus:ring-gold-400/40 transition-all"
                                />
                                <span className="text-calx-text-secondary text-sm">$ / mois</span>
                            </div>
                        </div>

                        {/* ── Free Months Offered (Annual Discount) ── */}
                        <div className="bg-calx-surface/50 border border-calx-surface rounded-xl p-5">
                            <div className="flex items-center gap-2 mb-3">
                                <Gift size={18} className="text-gold-400" />
                                <h3 className="text-base font-semibold text-calx-text">Rabais annuel (mois offerts)</h3>
                            </div>
                            <p className="text-xs text-calx-text-muted mb-3">
                                Le prix annuel est calculé automatiquement : prix mensuel × (12 − mois offerts).
                            </p>
                            <div className="flex items-center gap-3">
                                <input
                                    type="number"
                                    min={0}
                                    max={11}
                                    value={config.freeMonthsOffered}
                                    onChange={(e) => setConfig({ ...config, freeMonthsOffered: parseInt(e.target.value) || 0 })}
                                    className="w-24 px-4 py-2.5 bg-calx-card/50 border border-calx-surface-variant rounded-xl text-calx-text focus:outline-none focus:ring-2 focus:ring-gold-400/40 transition-all"
                                />
                                <span className="text-calx-text-secondary text-sm">mois offerts</span>
                            </div>
                        </div>

                        {/* ── Computed Values Preview ── */}
                        <div className="bg-gold-400/5 border border-gold-400/20 rounded-xl p-5">
                            <div className="flex items-center gap-2 mb-4">
                                <Calculator size={18} className="text-gold-400" />
                                <h3 className="text-base font-semibold text-calx-text">Aperçu (calculé automatiquement)</h3>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                <div className="bg-calx-card/50 rounded-lg p-4 border border-calx-surface">
                                    <p className="text-xs text-calx-text-muted mb-1">Prix mensuel</p>
                                    <p className="text-lg font-bold text-calx-text">${config.monthlyPrice.toFixed(2)} / mois</p>
                                </div>
                                <div className="bg-calx-card/50 rounded-lg p-4 border border-calx-surface">
                                    <p className="text-xs text-calx-text-muted mb-1">Prix annuel</p>
                                    <p className="text-lg font-bold text-calx-text">${computed.annualPrice.toFixed(2)} / an</p>
                                    <p className="text-xs text-calx-text-muted mt-1">
                                        ({config.monthlyPrice.toFixed(2)} × {12 - config.freeMonthsOffered} mois)
                                    </p>
                                </div>
                                <div className="bg-calx-card/50 rounded-lg p-4 border border-calx-surface">
                                    <p className="text-xs text-calx-text-muted mb-1">Économie affichée</p>
                                    <p className="text-lg font-bold text-green-400">Économisez {computed.savingsPercent}%</p>
                                    <p className="text-xs text-calx-text-muted mt-1">
                                        {config.freeMonthsOffered} mois offerts sur 12
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Save button */}
                        <button
                            onClick={handleSave}
                            disabled={saving}
                            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-gold-400 to-gold-600 text-black font-bold rounded-xl hover:shadow-lg hover:shadow-gold-400/25 transition-all disabled:opacity-50"
                        >
                            <Save size={16} />
                            {saving ? 'Enregistrement...' : saved ? '✅ Enregistré !' : 'Enregistrer les modifications'}
                        </button>
                    </div>
                ) : null}
            </div>
        </RoleGuard>
    );
}
