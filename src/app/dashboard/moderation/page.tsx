'use client';

import RoleGuard from '@/components/guards/RoleGuard';
import { useState, useEffect, useRef, useMemo } from 'react';
import { collection, query, orderBy, onSnapshot, doc, getDoc, getDocs, limit } from 'firebase/firestore';
import { ref, query as rtdbQuery, orderByChild, limitToLast, get as rtdbGet } from 'firebase/database';
import { httpsCallable } from 'firebase/functions';
import { db, rtdb, functions } from '@/lib/firebase/client';
import { useAuth } from '@/lib/auth/context';
import { formatRelativeTime } from '@/lib/utils';
import {
    Flag, Trash2, Ban, Shield, XCircle, AlertTriangle, Clock, CheckCircle,
    X, User, Users, MessageSquare, Image as ImageIcon, ChevronRight, ChevronDown
} from 'lucide-react';

interface AIVerdict {
    reason: string;
    confidence: number;
    isSafe: boolean;
    suggestedAction: 'delete_post' | 'delete_squad' | 'ban_user' | 'dismiss';
    explanation: string;
    matchedText?: string | null;
    analyzedAt?: { toDate: () => Date };
    model?: string;
    promptVersion?: string;
}

interface Report {
    id: string;
    type: 'post' | 'squad' | 'user';
    targetId: string;
    reporterId: string;
    reporterName?: string;
    reporterPhotoUrl?: string;
    reportedUserId: string;
    reportedUserName?: string;
    reportedUserPhotoUrl?: string;
    reason: string;
    status: 'pending' | 'resolved' | 'dismissed';
    createdAt?: { toDate: () => Date };
    timestamp?: { toDate: () => Date };
    action?: string;
    banDurationLabel?: string;
    postContent?: string;
    postType?: string;
    postImageUrl?: string;
    squadId?: string;
    squadName?: string;
    squadDescription?: string;
    squadPhotoUrl?: string;
    squadMemberCount?: number;
    aiVerdict?: AIVerdict;
}

interface UserProfile {
    name?: string;
    firstName?: string;
    displayName?: string;
    email?: string;
    photoUrl?: string;
    createdAt?: { toDate: () => Date };
}

type FilterType = 'all' | 'pending' | 'dismissed' | 'deleted' | 'banned';

const TYPE_LABELS: Record<string, { label: string; emoji: string }> = {
    post: { label: 'Post', emoji: '📝' },
    squad: { label: 'Squad', emoji: '👥' },
    user: { label: 'Utilisateur', emoji: '👤' },
};

const POST_TYPE_LABELS: Record<string, string> = {
    text: '💬 Message texte',
    mealShare: '🍽️ Partage de repas',
    exerciseShare: '🏋️ Partage d\'exercice',
    milestone: '🏆 Jalon atteint',
    evolutionShare: '📸 Photo d\'évolution',
};

const BAN_OPTIONS = [
    { label: '1 semaine', days: 7 },
    { label: '2 semaines', days: 14 },
    { label: '1 mois', days: 30 },
    { label: '2 mois', days: 60 },
    { label: '6 mois', days: 180 },
    { label: 'Définitivement', days: null },
];

/** Get the border/bg color for a report card */
function getReportColor(report: Report): string {
    if (report.status === 'dismissed') return 'border-green-500/40 bg-green-500/5';
    if (report.action === 'deleted_post' || report.action === 'deleted_squad') return 'border-yellow-500/40 bg-yellow-500/5';
    if (report.action === 'banned_user') return 'border-red-500/40 bg-red-500/5';
    return 'border-calx-surface';
}

/** Get the status badge */
function getStatusBadge(report: Report): { text: string; classes: string } {
    if (report.status === 'dismissed') return { text: '✅ Ignoré', classes: 'bg-green-500/10 text-green-400 border-green-500/20' };
    if (report.action === 'deleted_post') return { text: '🟡 Post supprimé', classes: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' };
    if (report.action === 'deleted_squad') return { text: '🟡 Squad supprimé', classes: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' };
    if (report.action === 'banned_user') return { text: `🔴 Banni${report.banDurationLabel ? ` (${report.banDurationLabel})` : ''}`, classes: 'bg-red-500/10 text-red-400 border-red-500/20' };
    if (report.status === 'pending') return { text: '⏳ En attente', classes: 'bg-orange-500/10 text-orange-400 border-orange-500/20' };
    return { text: 'Résolu', classes: 'bg-gray-500/10 text-calx-text-secondary border-gray-500/20' };
}

/** Classify a report into a filter category */
function getReportCategory(report: Report): FilterType {
    if (report.status === 'pending') return 'pending';
    if (report.status === 'dismissed') return 'dismissed';
    if (report.action === 'deleted_post' || report.action === 'deleted_squad') return 'deleted';
    if (report.action === 'banned_user') return 'banned';
    return 'all';
}

export default function ModerationPage() {
    const { user } = useAuth();
    const [allReports, setAllReports] = useState<Report[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [filter, setFilter] = useState<FilterType>('pending');
    const [selectedReport, setSelectedReport] = useState<Report | null>(null);
    const [reporterProfile, setReporterProfile] = useState<UserProfile | null>(null);
    const [reportedProfile, setReportedProfile] = useState<UserProfile | null>(null);
    const [loadingProfiles, setLoadingProfiles] = useState(false);
    const [actionLoading, setActionLoading] = useState<string | null>(null);
    const [showBanMenu, setShowBanMenu] = useState(false);
    const banMenuRef = useRef<HTMLDivElement>(null);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [squadMessages, setSquadMessages] = useState<any[]>([]);
    const [loadingMessages, setLoadingMessages] = useState(false);
    const [lightboxImage, setLightboxImage] = useState<string | null>(null);

    // Close lightbox on Escape
    useEffect(() => {
        if (!lightboxImage) return;
        function onKey(e: KeyboardEvent) {
            if (e.key === 'Escape') setLightboxImage(null);
        }
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [lightboxImage]);

    // Close ban menu on outside click
    useEffect(() => {
        function handleClick(e: MouseEvent) {
            if (banMenuRef.current && !banMenuRef.current.contains(e.target as Node)) {
                setShowBanMenu(false);
            }
        }
        document.addEventListener('mousedown', handleClick);
        return () => document.removeEventListener('mousedown', handleClick);
    }, []);

    // Load recent reports from Firestore (capped at 200), filter client-side
    useEffect(() => {
        setLoading(true);
        setError(null);

        let q;
        try {
            q = query(collection(db, 'reports'), orderBy('createdAt', 'desc'), limit(200));
        } catch {
            q = query(collection(db, 'reports'), limit(200));
        }

        const unsub = onSnapshot(
            q,
            (snap) => {
                const data = snap.docs.map((d) => {
                    const raw = d.data();
                    return {
                        id: d.id,
                        ...raw,
                        status: raw.status || 'pending',
                        createdAt: raw.createdAt || raw.timestamp,
                        reporterName: raw.reporterName || 'Utilisateur',
                    };
                }) as Report[];

                data.sort((a, b) => {
                    const aTime = (a.createdAt ?? a.timestamp)?.toDate?.()?.getTime?.() ?? 0;
                    const bTime = (b.createdAt ?? b.timestamp)?.toDate?.()?.getTime?.() ?? 0;
                    return bTime - aTime;
                });
                setAllReports(data);
                setLoading(false);
                setError(null);

                // Update selected report if it changed
                if (selectedReport) {
                    const updated = data.find((r) => r.id === selectedReport.id);
                    if (updated) setSelectedReport(updated);
                }
            },
            (err) => {
                console.error('Moderation query error:', err);
                if (err.message?.includes('index')) {
                    const fallbackQ = query(collection(db, 'reports'), limit(200));
                    onSnapshot(
                        fallbackQ,
                        (snap) => {
                            const data = snap.docs.map((d) => {
                                const raw = d.data();
                                return {
                                    id: d.id,
                                    ...raw,
                                    status: raw.status || 'pending',
                                    createdAt: raw.createdAt || raw.timestamp,
                                    reporterName: raw.reporterName || 'Utilisateur',
                                };
                            }) as Report[];
                            data.sort((a, b) => {
                                const aTime = (a.createdAt ?? a.timestamp)?.toDate?.()?.getTime?.() ?? 0;
                                const bTime = (b.createdAt ?? b.timestamp)?.toDate?.()?.getTime?.() ?? 0;
                                return bTime - aTime;
                            });
                            setAllReports(data);
                            setLoading(false);
                            setError(null);
                        },
                        () => {
                            setLoading(false);
                            setAllReports([]);
                        }
                    );
                    return;
                }
                setLoading(false);
                setAllReports([]);
            }
        );
        return () => unsub();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Client-side filtered reports
    const filteredReports = useMemo(() => {
        if (filter === 'all') return allReports;
        return allReports.filter(r => getReportCategory(r) === filter);
    }, [allReports, filter]);

    // Counts for each category
    const counts = useMemo(() => ({
        all: allReports.length,
        pending: allReports.filter(r => r.status === 'pending').length,
        dismissed: allReports.filter(r => r.status === 'dismissed').length,
        deleted: allReports.filter(r => r.action === 'deleted_post' || r.action === 'deleted_squad').length,
        banned: allReports.filter(r => r.action === 'banned_user').length,
    }), [allReports]);

    // Fetch user profiles when a report is selected
    useEffect(() => {
        if (!selectedReport) {
            setReporterProfile(null);
            setReportedProfile(null);
            return;
        }

        async function fetchProfiles() {
            if (!selectedReport) return;
            setLoadingProfiles(true);
            try {
                const [reporterSnap, reportedSnap] = await Promise.all([
                    getDoc(doc(db, 'users', selectedReport.reporterId)),
                    getDoc(doc(db, 'users', selectedReport.reportedUserId)),
                ]);
                setReporterProfile(reporterSnap.exists() ? reporterSnap.data() as UserProfile : null);
                setReportedProfile(reportedSnap.exists() ? reportedSnap.data() as UserProfile : null);
            } catch (err) {
                console.error('Error fetching profiles:', err);
            }
            setLoadingProfiles(false);
        }

        fetchProfiles();

        // Fetch squad messages from RTDB if it's a squad report
        if (selectedReport?.type === 'squad' && selectedReport.targetId) {
            setLoadingMessages(true);
            const messagesRef = rtdbQuery(
                ref(rtdb, `squad_messages/${selectedReport.targetId}`),
                orderByChild('timestamp'),
                limitToLast(20)
            );
            rtdbGet(messagesRef).then((snap) => {
                if (snap.exists()) {
                    const msgs: any[] = []; // eslint-disable-line @typescript-eslint/no-explicit-any
                    snap.forEach((child) => {
                        msgs.push({ id: child.key, ...child.val() });
                    });
                    // Sort by timestamp descending (most recent first)
                    msgs.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
                    setSquadMessages(msgs);
                } else {
                    setSquadMessages([]);
                }
                setLoadingMessages(false);
            }).catch(() => {
                setSquadMessages([]);
                setLoadingMessages(false);
            });
        } else {
            setSquadMessages([]);
        }
    }, [selectedReport?.id]); // eslint-disable-line react-hooks/exhaustive-deps

    // ── MODERATION ACTIONS VIA CLOUD FUNCTION ──

    async function handleDeletePost(reportId: string) {
        if (!confirm('⚠️ Supprimer ce post ?\n\nLe post sera supprimé, l\'utilisateur recevra une notification et un email d\'avertissement.\n\nLe dossier passera en jaune.')) return;
        setActionLoading('delete');
        try {
            const moderate = httpsCallable(functions, 'moderatereport');
            await moderate({ reportId, action: 'delete_post' });
            setFilter('deleted'); // Show yellow filter
        } catch (err) {
            console.error('Error deleting post:', err);
            alert('Erreur : ' + (err as Error).message);
        }
        setActionLoading(null);
    }

    async function handleDeleteSquad(reportId: string) {
        if (!confirm('⚠️ Supprimer ce squad ?\n\nLe squad sera supprimé. Le propriétaire et tous les membres recevront une notification avec la raison du signalement.\n\nLe dossier passera en jaune.')) return;
        setActionLoading('delete');
        try {
            const moderate = httpsCallable(functions, 'moderatereport');
            await moderate({ reportId, action: 'delete_squad' });
            setFilter('deleted');
        } catch (err) {
            console.error('Error deleting squad:', err);
            alert('Erreur : ' + (err as Error).message);
        }
        setActionLoading(null);
    }

    async function handleBanUser(reportId: string, days: number | null, label: string) {
        const durText = days ? label : 'DÉFINITIVEMENT';
        if (!confirm(`🚫 Bannir cet utilisateur ${durText} ?\n\nSon compte sera bloqué et il recevra un email de bannissement.\n\nLe dossier passera en rouge.`)) return;
        setShowBanMenu(false);
        setActionLoading('ban');
        try {
            const moderate = httpsCallable(functions, 'moderatereport');
            await moderate({ reportId, action: 'ban_user', banDuration: days, banDurationLabel: label });
            setFilter('banned'); // Show red filter
        } catch (err) {
            console.error('Error banning user:', err);
            alert('Erreur : ' + (err as Error).message);
        }
        setActionLoading(null);
    }

    async function handleDismiss(reportId: string) {
        if (!confirm('✅ Ignorer ce signalement ?\n\nLe dossier passera en vert.')) return;
        setActionLoading('dismiss');
        try {
            const moderate = httpsCallable(functions, 'moderatereport');
            await moderate({ reportId, action: 'dismiss' });
            setFilter('dismissed'); // Show green filter
        } catch (err) {
            console.error('Error dismissing report:', err);
            alert('Erreur : ' + (err as Error).message);
        }
        setActionLoading(null);
    }

    /**
     * Phase 2: 1-click accept the AI recommendation.
     * Dispatches to the existing handler based on the verdict's suggestedAction.
     */
    async function handleAIRecommendation(report: Report) {
        const action = report.aiVerdict?.suggestedAction;
        if (!action) return;
        switch (action) {
            case 'delete_post': return handleDeletePost(report.id);
            case 'delete_squad': return handleDeleteSquad(report.id);
            case 'ban_user': return handleBanUser(report.id, 7, '1 semaine');
            case 'dismiss': return handleDismiss(report.id);
        }
    }

    function AIVerdictBanner({
        verdict,
        onAccept,
        disabled,
    }: {
        verdict: AIVerdict;
        onAccept: () => void;
        disabled: boolean;
    }) {
        const [expanded, setExpanded] = useState(false);
        const confPct = Math.round(verdict.confidence * 100);
        const isSafeVerdict = verdict.suggestedAction === 'dismiss';

        // Color theme: blue when AI says dismiss, amber when it says delete, red when it says ban.
        const theme = verdict.suggestedAction === 'ban_user'
            ? { ring: 'border-red-500/30', bg: 'bg-red-500/5', text: 'text-red-300', bar: 'bg-red-400' }
            : verdict.suggestedAction === 'dismiss'
            ? { ring: 'border-green-500/30', bg: 'bg-green-500/5', text: 'text-green-300', bar: 'bg-green-400' }
            : { ring: 'border-amber-500/30', bg: 'bg-amber-500/5', text: 'text-amber-300', bar: 'bg-amber-400' };

        const actionLabels: Record<string, string> = {
            delete_post: '🗑️ Supprimer le post',
            delete_squad: '🗑️ Supprimer le squad',
            ban_user: '🚫 Bannir 1 semaine',
            dismiss: '✅ Ignorer le signalement',
        };

        return (
            <div className={`${theme.bg} border ${theme.ring} rounded-xl p-4`}>
                <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                        <span className="text-base">🤖</span>
                        <h4 className="text-xs font-semibold text-calx-text uppercase tracking-wider">
                            Analyse IA
                        </h4>
                    </div>
                    <button
                        onClick={() => setExpanded(!expanded)}
                        className="text-[11px] text-calx-text-muted hover:text-calx-text transition-colors"
                    >
                        {expanded ? 'Réduire ▲' : 'Voir détails ▼'}
                    </button>
                </div>

                <p className="text-sm text-calx-text mb-1">
                    Recommandation : <span className={`font-semibold ${theme.text}`}>
                        {actionLabels[verdict.suggestedAction] || verdict.suggestedAction}
                    </span>
                </p>

                <div className="flex items-center gap-2 mb-3">
                    <span className="text-[11px] text-calx-text-muted w-20">Confiance</span>
                    <div className="flex-1 h-1.5 bg-calx-surface-variant rounded-full overflow-hidden">
                        <div className={`h-full ${theme.bar} transition-all`} style={{ width: `${confPct}%` }} />
                    </div>
                    <span className="text-[11px] text-calx-text-secondary tabular-nums w-9 text-right">{confPct}%</span>
                </div>

                <p className="text-xs text-calx-text-secondary leading-relaxed mb-3">
                    <span className="text-calx-text-muted">Raison : </span>
                    <span className="font-medium">{verdict.reason}</span>
                </p>

                {expanded && (
                    <div className="text-xs text-calx-text-secondary leading-relaxed mb-3 space-y-1.5 border-t border-calx-surface-variant pt-3">
                        <p>{verdict.explanation}</p>
                        {verdict.matchedText && (
                            <p>
                                <span className="text-calx-text-muted">Extrait : </span>
                                <span className="italic">&laquo; {verdict.matchedText} &raquo;</span>
                            </p>
                        )}
                        <p className="text-calx-text-muted text-[10px]">
                            Modèle : {verdict.model || 'gemini-2.5-flash'} ·
                            Prompt : {verdict.promptVersion || 'v1.0'}
                            {!isSafeVerdict && verdict.confidence < 0.95 && (
                                <span className="text-amber-400"> · ⚠️ confiance moyenne, vérifie manuellement</span>
                            )}
                        </p>
                    </div>
                )}

                <button
                    onClick={onAccept}
                    disabled={disabled}
                    className={`w-full px-3 py-2 rounded-lg text-xs font-semibold transition-colors ${
                        disabled
                            ? 'bg-calx-surface-variant text-calx-text-muted cursor-not-allowed'
                            : `${theme.bar} bg-opacity-90 hover:bg-opacity-100 text-calx-bg`
                    }`}
                >
                    {disabled ? 'En cours…' : '✓ Accepter la recommandation IA'}
                </button>
            </div>
        );
    }

    function ProfileCard({ title, name, photoUrl, email, profile, uid }: {
        title: string; name?: string; photoUrl?: string; email?: string;
        profile: UserProfile | null; uid: string;
    }) {
        const displayName = profile?.firstName || profile?.displayName || profile?.name || name || 'Inconnu';
        const displayEmail = profile?.email || email;
        const displayPhoto = profile?.photoUrl || photoUrl;

        return (
            <div className="bg-calx-card/50 border border-calx-surface-variant rounded-xl p-4">
                <h4 className="text-xs font-semibold text-calx-text-muted uppercase tracking-wider mb-3">{title}</h4>
                <div className="flex items-center gap-3">
                    {displayPhoto ? (
                        <img src={displayPhoto} alt={displayName} className="w-11 h-11 rounded-full object-cover border-2 border-gold-400/20" />
                    ) : (
                        <div className="w-11 h-11 rounded-full bg-gold-400/10 border-2 border-gold-400/20 flex items-center justify-center">
                            <User size={18} className="text-gold-400" />
                        </div>
                    )}
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-calx-text truncate">{displayName}</p>
                        {displayEmail && (
                            <p className="text-xs text-calx-text-muted truncate">{displayEmail}</p>
                        )}
                        <p className="text-[10px] text-calx-text-muted font-mono mt-0.5 truncate">UID: {uid.slice(0, 12)}…</p>
                    </div>
                </div>
            </div>
        );
    }

    // Filter button config
    const FILTER_BUTTONS: { key: FilterType; label: string; icon: React.ReactNode; activeClass: string; countKey: FilterType }[] = [
        { key: 'all', label: 'Tous', icon: <Flag size={14} />, activeClass: 'bg-gold-400/10 text-gold-400 border-gold-400/30', countKey: 'all' },
        { key: 'pending', label: 'En attente', icon: <Clock size={14} />, activeClass: 'bg-orange-500/10 text-orange-400 border-orange-500/30', countKey: 'pending' },
        { key: 'dismissed', label: 'Ignorés', icon: <CheckCircle size={14} />, activeClass: 'bg-green-500/10 text-green-400 border-green-500/30', countKey: 'dismissed' },
        { key: 'deleted', label: 'Supprimés', icon: <Trash2 size={14} />, activeClass: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30', countKey: 'deleted' },
        { key: 'banned', label: 'Bannis', icon: <Ban size={14} />, activeClass: 'bg-red-500/10 text-red-400 border-red-500/30', countKey: 'banned' },
    ];

    return (
        <RoleGuard module="moderation">
            <div>
                {/* ── Header ── */}
                <div className="flex items-center justify-between mb-5">
                    <div>
                        <h1 className="text-2xl font-bold text-calx-text flex items-center gap-3">
                            <Flag className="text-gold-400" size={28} />
                            Centre de modération
                        </h1>
                        <p className="text-calx-text-secondary mt-1">Signalements des utilisateurs</p>
                    </div>
                </div>

                {/* ── Color Filter Buttons ── */}
                <div className="flex flex-wrap gap-2 mb-6">
                    {FILTER_BUTTONS.map(btn => (
                        <button
                            key={btn.key}
                            onClick={() => setFilter(btn.key)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium border transition-all ${filter === btn.key
                                ? btn.activeClass
                                : 'text-calx-text-secondary hover:text-calx-text border-calx-surface-variant hover:border-calx-surface bg-calx-surface/30'
                                }`}
                        >
                            {btn.icon}
                            {btn.label}
                            <span className={`ml-1 px-1.5 py-0.5 rounded-md text-xs font-bold ${filter === btn.key ? 'bg-white/10' : 'bg-calx-surface'
                                }`}>
                                {counts[btn.countKey]}
                            </span>
                        </button>
                    ))}
                </div>

                {/* ── Content ── */}
                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <div className="w-8 h-8 border-2 border-gold-400 border-t-transparent rounded-full animate-spin" />
                    </div>
                ) : error ? (
                    <div className="text-center py-20">
                        <AlertTriangle size={48} className="mx-auto text-yellow-400 mb-4" />
                        <h3 className="text-lg font-semibold text-calx-text">Erreur de chargement</h3>
                        <p className="text-calx-text-secondary mt-1 text-sm max-w-md mx-auto">{error}</p>
                    </div>
                ) : filteredReports.length === 0 ? (
                    <div className="text-center py-20">
                        <div className="w-20 h-20 rounded-2xl bg-green-500/10 border border-green-500/20 flex items-center justify-center mx-auto mb-5">
                            <Shield size={36} className="text-green-400" />
                        </div>
                        <h3 className="text-lg font-semibold text-calx-text">Aucun signalement</h3>
                        <p className="text-calx-text-secondary mt-1 text-sm">
                            {filter === 'pending'
                                ? 'Aucun signalement en attente. Tout semble en ordre 🎉'
                                : filter === 'dismissed'
                                    ? 'Aucun signalement ignoré.'
                                    : filter === 'deleted'
                                        ? 'Aucun post supprimé.'
                                        : filter === 'banned'
                                            ? 'Aucun utilisateur banni.'
                                            : 'Aucun signalement enregistré.'}
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
                        {/* ── Report List ── */}
                        <div className={`space-y-3 ${selectedReport ? 'lg:col-span-2' : 'lg:col-span-5'}`}>
                            {filteredReports.map((report) => {
                                const colorClass = getReportColor(report);
                                const badge = getStatusBadge(report);
                                return (
                                    <button
                                        key={report.id}
                                        onClick={() => setSelectedReport(report.id === selectedReport?.id ? null : report)}
                                        className={`w-full text-left bg-calx-surface/50 border-2 rounded-xl p-5 hover:border-calx-surface-variant transition-all ${selectedReport?.id === report.id
                                            ? 'border-gold-400/40 ring-1 ring-gold-400/20'
                                            : colorClass
                                            }`}
                                    >
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <span className="text-lg">{TYPE_LABELS[report.type]?.emoji || '📋'}</span>
                                                    <span className="text-sm font-medium text-calx-text">
                                                        {TYPE_LABELS[report.type]?.label || report.type}
                                                    </span>
                                                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${badge.classes}`}>
                                                        {badge.text}
                                                    </span>
                                                </div>
                                                <p className="text-sm text-calx-text-secondary mb-1 truncate">{report.reason}</p>
                                                {report.postContent && (
                                                    <p className="text-xs text-calx-text-muted mb-1 truncate">« {report.postContent} »</p>
                                                )}
                                                <p className="text-xs text-calx-text-muted">
                                                    Signalé par {report.reporterName || 'Utilisateur'} · {(report.createdAt ?? report.timestamp) ? formatRelativeTime((report.createdAt ?? report.timestamp)!) : '—'}
                                                </p>
                                            </div>
                                            <ChevronRight size={16} className={`text-calx-text-muted flex-shrink-0 transition-transform ${selectedReport?.id === report.id ? 'rotate-90' : ''}`} />
                                        </div>
                                    </button>
                                );
                            })}
                        </div>

                        {/* ── Detail Panel ── */}
                        {selectedReport && (
                            <div className="lg:col-span-3 bg-calx-surface/30 border border-calx-surface rounded-xl overflow-hidden flex flex-col h-[calc(100vh-320px)] sticky top-4">
                                {/* Panel Header */}
                                <div className="p-4 border-b border-calx-surface bg-calx-surface/20 flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <Flag size={16} className="text-gold-400" />
                                        <h3 className="font-semibold text-calx-text text-sm">Détails du signalement</h3>
                                    </div>
                                    <button
                                        onClick={() => setSelectedReport(null)}
                                        className="p-1.5 hover:bg-calx-card rounded-lg transition-colors"
                                    >
                                        <X size={16} className="text-calx-text-secondary" />
                                    </button>
                                </div>

                                {/* Panel Content */}
                                <div className="flex-1 overflow-y-auto p-5 space-y-5">
                                    {/* Reason */}
                                    <div>
                                        <h4 className="text-xs font-semibold text-calx-text-muted uppercase tracking-wider mb-2">Motif du signalement</h4>
                                        <div className="bg-red-500/5 border border-red-500/15 rounded-xl p-4">
                                            <p className="text-sm font-medium text-red-300">{selectedReport.reason}</p>
                                            <p className="text-[11px] text-calx-text-muted mt-2">
                                                {(selectedReport.createdAt ?? selectedReport.timestamp) ? formatRelativeTime((selectedReport.createdAt ?? selectedReport.timestamp)!) : ''}
                                                {selectedReport.squadName && ` · Squad « ${selectedReport.squadName} »`}
                                            </p>
                                        </div>
                                    </div>

                                    {/* AI verdict banner (Phase 2) */}
                                    {selectedReport.aiVerdict && selectedReport.status === 'pending' && (
                                        <AIVerdictBanner
                                            verdict={selectedReport.aiVerdict}
                                            onAccept={() => handleAIRecommendation(selectedReport)}
                                            disabled={actionLoading !== null}
                                        />
                                    )}

                                    {/* Post Content */}
                                    {selectedReport.type === 'post' && (
                                        <div>
                                            <h4 className="text-xs font-semibold text-calx-text-muted uppercase tracking-wider mb-2">Contenu signalé</h4>
                                            <div className="bg-calx-card/50 border border-calx-surface-variant rounded-xl p-4">
                                                {selectedReport.postType && (
                                                    <p className="text-xs text-gold-400 font-medium mb-2">
                                                        {POST_TYPE_LABELS[selectedReport.postType] || selectedReport.postType}
                                                    </p>
                                                )}
                                                {selectedReport.postContent ? (
                                                    <p className="text-sm text-calx-text leading-relaxed whitespace-pre-wrap">{selectedReport.postContent}</p>
                                                ) : (
                                                    <p className="text-sm text-calx-text-muted italic">Contenu non disponible</p>
                                                )}
                                                {selectedReport.postImageUrl && (
                                                    <div className="mt-3">
                                                        <div className="flex items-center gap-1.5 text-xs text-calx-text-muted mb-2">
                                                            <ImageIcon size={12} />
                                                            <span>Image jointe</span>
                                                        </div>
                                                        <img
                                                            src={selectedReport.postImageUrl}
                                                            alt="Contenu signalé"
                                                            onClick={() => setLightboxImage(selectedReport.postImageUrl!)}
                                                            className="max-w-full max-h-64 rounded-lg border border-calx-surface-variant object-contain cursor-zoom-in hover:opacity-90 transition-opacity"
                                                        />
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    {/* Squad Info */}
                                    {selectedReport.type === 'squad' && selectedReport.squadName && (
                                        <div>
                                            <h4 className="text-xs font-semibold text-calx-text-muted uppercase tracking-wider mb-2">Squad signalé</h4>
                                            <div className="bg-calx-card/50 border border-calx-surface-variant rounded-xl p-4">
                                                <div className="flex items-center gap-3 mb-3">
                                                    {selectedReport.squadPhotoUrl ? (
                                                        <img src={selectedReport.squadPhotoUrl} alt={selectedReport.squadName} className="w-11 h-11 rounded-full object-cover border-2 border-gold-400/20" />
                                                    ) : (
                                                        <div className="w-11 h-11 rounded-full bg-gold-400/10 border-2 border-gold-400/20 flex items-center justify-center">
                                                            <Users size={18} className="text-gold-400" />
                                                        </div>
                                                    )}
                                                    <div>
                                                        <p className="text-sm font-semibold text-calx-text">{selectedReport.squadName}</p>
                                                        <p className="text-xs text-calx-text-muted">ID: {selectedReport.targetId?.slice(0, 16)}…</p>
                                                        {selectedReport.squadMemberCount !== undefined && (
                                                            <p className="text-xs text-calx-text-muted">{selectedReport.squadMemberCount} membres</p>
                                                        )}
                                                    </div>
                                                </div>
                                                {selectedReport.squadDescription && (
                                                    <p className="text-sm text-calx-text-secondary leading-relaxed whitespace-pre-wrap">{selectedReport.squadDescription}</p>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    {/* Squad Messages (from RTDB) */}
                                    {selectedReport.type === 'squad' && (
                                        <div>
                                            <h4 className="text-xs font-semibold text-calx-text-muted uppercase tracking-wider mb-2 flex items-center gap-1.5">
                                                <MessageSquare size={12} />
                                                Messages du squad ({squadMessages.length})
                                            </h4>
                                            {loadingMessages ? (
                                                <div className="flex items-center justify-center py-4">
                                                    <div className="w-4 h-4 border-2 border-gold-400 border-t-transparent rounded-full animate-spin" />
                                                    <span className="text-xs text-calx-text-muted ml-2">Chargement…</span>
                                                </div>
                                            ) : squadMessages.length === 0 ? (
                                                <div className="bg-calx-card/50 border border-calx-surface-variant rounded-xl p-4">
                                                    <p className="text-sm text-calx-text-muted italic">Aucun message dans ce squad</p>
                                                </div>
                                            ) : (
                                                <div className="bg-calx-card/50 border border-calx-surface-variant rounded-xl p-3 space-y-2 max-h-80 overflow-y-auto">
                                                    {squadMessages.map((msg) => (
                                                        <div key={msg.id} className="flex gap-2 items-start p-2 rounded-lg bg-calx-surface/30 hover:bg-calx-surface/50 transition-colors">
                                                            <div className="w-7 h-7 rounded-full bg-gold-400/10 border border-gold-400/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                                                                <User size={12} className="text-gold-400" />
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <div className="flex items-baseline gap-2">
                                                                    <span className="text-xs font-semibold text-gold-400">{msg.senderName || 'Anonyme'}</span>
                                                                    <span className="text-[10px] text-calx-text-muted">
                                                                        {msg.timestamp ? new Date(msg.timestamp).toLocaleString('fr-FR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }) : ''}
                                                                    </span>
                                                                    {msg.type && msg.type !== 'text' && (
                                                                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-gold-400/10 text-gold-400">{msg.type}</span>
                                                                    )}
                                                                </div>
                                                                <p className="text-sm text-calx-text leading-snug break-words">{msg.content || '—'}</p>
                                                                {msg.photoUrl && (
                                                                    <img
                                                                        src={msg.photoUrl}
                                                                        alt=""
                                                                        onClick={() => setLightboxImage(msg.photoUrl)}
                                                                        className="mt-1.5 max-w-48 max-h-32 rounded-lg border border-calx-surface-variant object-cover cursor-zoom-in hover:opacity-90 transition-opacity"
                                                                    />
                                                                )}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {/* User Profiles */}
                                    {loadingProfiles ? (
                                        <div className="flex items-center justify-center py-6">
                                            <div className="w-5 h-5 border-2 border-gold-400 border-t-transparent rounded-full animate-spin" />
                                            <span className="text-xs text-calx-text-muted ml-2">Chargement des profils…</span>
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                            <ProfileCard
                                                title="🚩 Rapporteur"
                                                name={selectedReport.reporterName}
                                                photoUrl={selectedReport.reporterPhotoUrl}
                                                profile={reporterProfile}
                                                uid={selectedReport.reporterId}
                                            />
                                            <ProfileCard
                                                title={selectedReport.type === 'squad' ? '👤 Propriétaire du squad' : '⚠️ Personne signalée'}
                                                name={selectedReport.reportedUserName}
                                                photoUrl={selectedReport.reportedUserPhotoUrl}
                                                profile={reportedProfile}
                                                uid={selectedReport.reportedUserId}
                                            />
                                        </div>
                                    )}
                                </div>

                                {/* ── Action Buttons (only for pending) ── */}
                                {selectedReport.status === 'pending' && (
                                    <div className="p-4 border-t border-calx-surface bg-calx-surface/20">
                                        <p className="text-xs text-calx-text-muted mb-3">Actions de modération</p>
                                        <div className="flex gap-2">
                                            {/* Ignorer */}
                                            <button
                                                onClick={() => handleDismiss(selectedReport.id)}
                                                disabled={!!actionLoading}
                                                className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 text-sm bg-green-500/10 text-green-400 border border-green-500/20 rounded-xl hover:bg-green-500/20 transition-all disabled:opacity-50"
                                            >
                                                {actionLoading === 'dismiss' ? (
                                                    <div className="w-4 h-4 border-2 border-green-400 border-t-transparent rounded-full animate-spin" />
                                                ) : (
                                                    <CheckCircle size={14} />
                                                )}
                                                Ignorer
                                            </button>

                                            {/* Supprimer */}
                                            <button
                                                onClick={() => selectedReport.type === 'squad' ? handleDeleteSquad(selectedReport.id) : handleDeletePost(selectedReport.id)}
                                                disabled={!!actionLoading}
                                                className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 text-sm bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 rounded-xl hover:bg-yellow-500/20 transition-all disabled:opacity-50"
                                            >
                                                {actionLoading === 'delete' ? (
                                                    <div className="w-4 h-4 border-2 border-yellow-400 border-t-transparent rounded-full animate-spin" />
                                                ) : (
                                                    <Trash2 size={14} />
                                                )}
                                                {selectedReport.type === 'squad' ? 'Supprimer le squad' : 'Supprimer'}
                                            </button>

                                            {/* Bannir — dropdown (NOT for squads) */}
                                            {selectedReport.type !== 'squad' && (
                                                <div className="relative flex-1" ref={banMenuRef}>
                                                    <button
                                                        onClick={() => setShowBanMenu(!showBanMenu)}
                                                        disabled={!!actionLoading}
                                                        className="w-full flex items-center justify-center gap-2 px-3 py-2.5 text-sm bg-red-500/10 text-red-400 border border-red-500/20 rounded-xl hover:bg-red-500/20 transition-all disabled:opacity-50"
                                                    >
                                                        {actionLoading === 'ban' ? (
                                                            <div className="w-4 h-4 border-2 border-red-400 border-t-transparent rounded-full animate-spin" />
                                                        ) : (
                                                            <Ban size={14} />
                                                        )}
                                                        Bannir
                                                        <ChevronDown size={12} />
                                                    </button>

                                                    {showBanMenu && (
                                                        <div className="absolute bottom-full mb-2 right-0 w-56 bg-calx-card border border-calx-surface-variant rounded-xl shadow-2xl overflow-hidden z-50">
                                                            <div className="p-2 border-b border-calx-surface">
                                                                <p className="text-xs font-semibold text-calx-text-muted uppercase tracking-wider px-2 py-1">Durée du bannissement</p>
                                                            </div>
                                                            <div className="py-1">
                                                                {BAN_OPTIONS.map((opt) => (
                                                                    <button
                                                                        key={opt.label}
                                                                        onClick={() => handleBanUser(selectedReport.id, opt.days, opt.label)}
                                                                        className={`w-full text-left px-4 py-2.5 text-sm hover:bg-calx-surface transition-colors flex items-center gap-2 ${opt.days === null ? 'text-red-400 font-semibold' : 'text-calx-text'
                                                                            }`}
                                                                    >
                                                                        {opt.days === null ? (
                                                                            <Ban size={14} className="text-red-400" />
                                                                        ) : (
                                                                            <Clock size={14} className="text-calx-text-muted" />
                                                                        )}
                                                                        {opt.label}
                                                                    </button>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* Resolved status footer */}
                                {selectedReport.status !== 'pending' && (
                                    <div className={`p-4 border-t text-center ${selectedReport.action === 'banned_user' ? 'border-red-500/30 bg-red-500/5' :
                                        selectedReport.action === 'deleted_post' ? 'border-yellow-500/30 bg-yellow-500/5' :
                                            'border-green-500/30 bg-green-500/5'
                                        }`}>
                                        <p className="text-xs text-calx-text-muted flex items-center justify-center gap-1.5">
                                            {selectedReport.action === 'banned_user' ? (
                                                <Ban size={12} className="text-red-400" />
                                            ) : selectedReport.action === 'deleted_post' ? (
                                                <Trash2 size={12} className="text-yellow-400" />
                                            ) : (
                                                <CheckCircle size={12} className="text-green-400" />
                                            )}
                                            Action prise : <span className={`font-medium ${selectedReport.action === 'banned_user' ? 'text-red-400' :
                                                (selectedReport.action === 'deleted_post' || selectedReport.action === 'deleted_squad') ? 'text-yellow-400' :
                                                    'text-green-400'
                                                }`}>
                                                {selectedReport.action === 'banned_user' ? `Banni${selectedReport.banDurationLabel ? ` (${selectedReport.banDurationLabel})` : ''}` :
                                                    selectedReport.action === 'deleted_squad' ? 'Squad supprimé' :
                                                        selectedReport.action === 'deleted_post' ? 'Post supprimé' : 'Ignoré'}
                                            </span>
                                        </p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Lightbox — fullscreen image preview */}
            {lightboxImage && (
                <div
                    className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4 cursor-zoom-out"
                    onClick={() => setLightboxImage(null)}
                >
                    <button
                        onClick={(e) => { e.stopPropagation(); setLightboxImage(null); }}
                        className="absolute top-4 right-4 w-10 h-10 rounded-full bg-calx-card/80 border border-calx-surface-variant flex items-center justify-center text-calx-text hover:bg-calx-card transition-colors"
                        aria-label="Fermer"
                    >
                        <X size={20} />
                    </button>
                    <img
                        src={lightboxImage}
                        alt="Aperçu"
                        onClick={(e) => e.stopPropagation()}
                        className="max-w-[95vw] max-h-[95vh] object-contain rounded-lg shadow-2xl"
                    />
                </div>
            )}
        </RoleGuard>
    );
}
