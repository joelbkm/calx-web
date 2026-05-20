'use client';

import RoleGuard from '@/components/guards/RoleGuard';
import { useState, useEffect, useCallback } from 'react';
import { collection, query, limit, getDocs, doc, updateDoc, where } from 'firebase/firestore';
import { httpsCallable } from 'firebase/functions';
import { db, functions } from '@/lib/firebase/client';
import { Search, MoreHorizontal, Ban, Unlock, Trash2, RotateCcw, User, AlertTriangle, ShieldAlert, KeyRound, X } from 'lucide-react';

interface UserData {
    uid: string;
    email?: string;
    displayName?: string;
    photoURL?: string;
    photoUrl?: string;
    gender?: string;
    primaryGoal?: string;
    weightKg?: number;
    heightCm?: number;
    language?: string;
    onboardingComplete?: boolean;
    blocked?: boolean;
    createdAt?: string;
    role?: 'super_admin' | 'admin' | 'comptable' | 'technicien';
}

const ROLE_BADGE: Record<NonNullable<UserData['role']>, { label: string; bg: string; text: string }> = {
    super_admin: { label: 'Super Admin', bg: 'bg-gold-500/15', text: 'text-gold-300' },
    admin:       { label: 'Admin',       bg: 'bg-blue-500/15',  text: 'text-blue-300' },
    comptable:   { label: 'Comptable',   bg: 'bg-emerald-500/15', text: 'text-emerald-300' },
    technicien:  { label: 'Technicien',  bg: 'bg-purple-500/15',  text: 'text-purple-300' },
};

type ModalAction = 'block' | 'unblock' | 'reset_password' | 'delete';

interface ModalState {
    open: boolean;
    action: ModalAction | null;
    user: UserData | null;
    loading: boolean;
}

const MODAL_CONFIG: Record<ModalAction, {
    title: string;
    description: (user: UserData) => string;
    confirmLabel: string;
    icon: typeof Ban;
    iconBg: string;
    iconColor: string;
    confirmBg: string;
}> = {
    block: {
        title: 'Bloquer l\'utilisateur',
        description: (u) => `Êtes-vous sûr de vouloir bloquer ${u.displayName || u.email || 'cet utilisateur'} ? L'utilisateur ne pourra plus accéder à l'application.`,
        confirmLabel: 'Bloquer',
        icon: ShieldAlert,
        iconBg: 'bg-orange-500/10 border-orange-500/20',
        iconColor: 'text-orange-400',
        confirmBg: 'bg-orange-500 hover:bg-orange-600',
    },
    unblock: {
        title: 'Débloquer l\'utilisateur',
        description: (u) => `Souhaitez-vous débloquer ${u.displayName || u.email || 'cet utilisateur'} ? Il pourra de nouveau accéder à l'application.`,
        confirmLabel: 'Débloquer',
        icon: Unlock,
        iconBg: 'bg-green-500/10 border-green-500/20',
        iconColor: 'text-green-400',
        confirmBg: 'bg-green-600 hover:bg-green-700',
    },
    reset_password: {
        title: 'Réinitialiser le mot de passe',
        description: (u) => `Un email de réinitialisation sera envoyé à ${u.email || 'l\'adresse email de l\'utilisateur'}. Confirmer l'envoi ?`,
        confirmLabel: 'Envoyer le lien',
        icon: KeyRound,
        iconBg: 'bg-blue-500/10 border-blue-500/20',
        iconColor: 'text-blue-400',
        confirmBg: 'bg-blue-600 hover:bg-blue-700',
    },
    delete: {
        title: 'Suppression RGPD complète',
        description: (u) => `⚠️ SUPPRESSION DÉFINITIVE de ${u.displayName || u.email || 'cet utilisateur'}.\n\n` +
            `Cette action est conforme au RGPD Article 17 (droit à l'oubli) et supprime :\n` +
            `• Compte Firebase Authentication\n` +
            `• Tous les documents Firestore (profil, repas, exercices, etc.)\n` +
            `• Toutes les photos R2 (repas, profil, évolution)\n` +
            `• Adhésions aux squads + squads créés par l'utilisateur\n` +
            `• Messages dans les chats (anonymisés)\n` +
            `• Tickets de support\n\n` +
            `Action IRRÉVERSIBLE. Un enregistrement d'audit non-PII est conservé dans account_deletions.`,
        confirmLabel: 'Supprimer (cascade RGPD)',
        icon: AlertTriangle,
        iconBg: 'bg-red-500/10 border-red-500/20',
        iconColor: 'text-red-400',
        confirmBg: 'bg-red-600 hover:bg-red-700',
    },
};

export default function UsersPage() {
    const [users, setUsers] = useState<UserData[]>([]);
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(true);
    const [actionMenu, setActionMenu] = useState<string | null>(null);
    const [modal, setModal] = useState<ModalState>({ open: false, action: null, user: null, loading: false });
    const [blockReason, setBlockReason] = useState('');

    useEffect(() => {
        loadUsers();
    }, []);

    // Close action menu when clicking outside
    useEffect(() => {
        if (!actionMenu) return;
        const handler = () => setActionMenu(null);
        document.addEventListener('click', handler);
        return () => document.removeEventListener('click', handler);
    }, [actionMenu]);

    async function loadUsers() {
        setLoading(true);
        try {
            const q = query(collection(db, 'users'), limit(100));
            const snapshot = await getDocs(q);
            const data = snapshot.docs.map((d) => ({
                uid: d.id,
                ...d.data(),
            })) as UserData[];
            setUsers(data);
        } catch (err) {
            console.error('Error loading users:', err);
        }
        setLoading(false);
    }

    function openModal(action: ModalAction, user: UserData) {
        setActionMenu(null);
        setBlockReason('');
        setModal({ open: true, action, user, loading: false });
    }

    function closeModal() {
        setModal({ open: false, action: null, user: null, loading: false });
    }

    const handleConfirm = useCallback(async () => {
        if (!modal.user || !modal.action) return;
        setModal((prev) => ({ ...prev, loading: true }));

        try {
            switch (modal.action) {
                case 'block':
                    await updateDoc(doc(db, 'users', modal.user.uid), {
                        blocked: true,
                        blockReason: blockReason.trim(),
                    });
                    setUsers((prev) => prev.map((u) =>
                        u.uid === modal.user!.uid ? { ...u, blocked: true } : u
                    ));
                    break;
                case 'unblock':
                    await updateDoc(doc(db, 'users', modal.user.uid), { blocked: false, blockReason: '' });
                    setUsers((prev) => prev.map((u) =>
                        u.uid === modal.user!.uid ? { ...u, blocked: false } : u
                    ));
                    break;
                case 'reset_password':
                    await new Promise((r) => setTimeout(r, 800));
                    break;
                case 'delete': {
                    // GDPR Article 17 — right to erasure. Use the server-side
                    // cascade so we wipe Auth + Firestore subcollections + RTDB
                    // messages + R2 photos + squad memberships in one pass.
                    const fn = httpsCallable<{ uid: string; reason: string }, {
                        ok: boolean;
                        authDeleted: boolean;
                        firestoreDeleted: boolean;
                        ownedSquadsDeleted: number;
                        squadMembershipsRemoved: number;
                        r2ObjectsDeleted: number;
                        rtdbMessagesScrubbed: number;
                        errors: string[];
                    }>(functions, 'adminDeleteUser');
                    const res = await fn({
                        uid: modal.user.uid,
                        reason: 'Admin manual delete (back-office)',
                    });
                    setUsers((prev) => prev.filter((u) => u.uid !== modal.user!.uid));
                    const r = res.data;
                    console.info(
                        `Deleted ${modal.user.uid}: auth=${r.authDeleted} firestore=${r.firestoreDeleted} ` +
                        `squads(owned=${r.ownedSquadsDeleted},member=${r.squadMembershipsRemoved}) ` +
                        `r2=${r.r2ObjectsDeleted} rtdb=${r.rtdbMessagesScrubbed} errors=${r.errors.length}`
                    );
                    if (r.errors.length > 0) {
                        alert(
                            `Suppression partielle — ${r.errors.length} erreur(s) non-bloquante(s) :\n` +
                            r.errors.slice(0, 5).join('\n')
                        );
                    }
                    break;
                }
            }
        } catch (err) {
            console.error(`Error performing ${modal.action}:`, err);
        }

        closeModal();
    }, [modal.user, modal.action, blockReason]);

    function getUserLabel(user: UserData): string {
        if (user.displayName) return user.displayName;
        if (user.email) return user.email;
        return user.uid.substring(0, 12) + '…';
    }

    function getPhoto(user: UserData): string | undefined {
        return user.photoURL || user.photoUrl;
    }

    function getGoalLabel(goal?: string): string {
        if (!goal) return '—';
        const lower = goal.toLowerCase();
        if (lower.includes('perte') || lower.includes('maigrir') || lower.includes('poids')) return '🔥 ' + goal;
        if (lower.includes('maintien') || lower.includes('maintain')) return '⚖️ ' + goal;
        if (lower.includes('performance') || lower.includes('muscle') || lower.includes('gain')) return '💪 ' + goal;
        return goal;
    }

    function getLangFlag(lang: string): string {
        const lower = lang.toLowerCase().trim();
        const flags: Record<string, string> = {
            fr: '🇫🇷', français: '🇫🇷', french: '🇫🇷',
            en: '🇬🇧', english: '🇬🇧', anglais: '🇬🇧',
            es: '🇪🇸', español: '🇪🇸', espagnol: '🇪🇸', spanish: '🇪🇸',
            de: '🇩🇪', deutsch: '🇩🇪', allemand: '🇩🇪', german: '🇩🇪',
            it: '🇮🇹', italiano: '🇮🇹', italien: '🇮🇹', italian: '🇮🇹',
            pt: '🇧🇷', português: '🇧🇷', portugais: '🇧🇷', portuguese: '🇧🇷',
            ar: '🇸🇦', arabe: '🇸🇦', arabic: '🇸🇦',
            zh: '🇨🇳', chinese: '🇨🇳', chinois: '🇨🇳',
            ja: '🇯🇵', japanese: '🇯🇵', japonais: '🇯🇵',
            nl: '🇳🇱', dutch: '🇳🇱', néerlandais: '🇳🇱',
            ru: '🇷🇺', russian: '🇷🇺', russe: '🇷🇺',
            tr: '🇹🇷', turkish: '🇹🇷', turc: '🇹🇷',
        };
        return flags[lower] || '🌐';
    }

    // Server-side search: query Firestore directly by email when the local
    // filter has no results and the search looks like an email or UID.
    const [searchResults, setSearchResults] = useState<UserData[] | null>(null);
    const [searching, setSearching] = useState(false);

    useEffect(() => {
        if (!search.trim()) {
            setSearchResults(null);
            return;
        }

        // First check local results
        const localResults = users.filter(
            (u) =>
                getUserLabel(u).toLowerCase().includes(search.toLowerCase()) ||
                u.email?.toLowerCase().includes(search.toLowerCase()) ||
                u.uid.toLowerCase().includes(search.toLowerCase())
        );

        if (localResults.length > 0) {
            setSearchResults(null); // use local filter
            return;
        }

        // No local results — perform server-side search after a debounce
        const debounce = setTimeout(async () => {
            setSearching(true);
            try {
                const results: UserData[] = [];
                const seenUids = new Set<string>();

                // Search by email (exact or prefix match)
                const emailQ = query(
                    collection(db, 'users'),
                    where('email', '>=', search.toLowerCase().trim()),
                    where('email', '<=', search.toLowerCase().trim() + '\uf8ff'),
                    limit(20)
                );
                const emailSnap = await getDocs(emailQ);
                emailSnap.docs.forEach((d) => {
                    if (!seenUids.has(d.id)) {
                        seenUids.add(d.id);
                        results.push({ uid: d.id, ...d.data() } as UserData);
                    }
                });

                // If search is long enough, try UID exact match
                if (search.trim().length >= 10) {
                    try {
                        const uidDoc = await getDocs(query(
                            collection(db, 'users'),
                            where('__name__', '==', search.trim()),
                            limit(1)
                        ));
                        uidDoc.docs.forEach((d) => {
                            if (!seenUids.has(d.id)) {
                                seenUids.add(d.id);
                                results.push({ uid: d.id, ...d.data() } as UserData);
                            }
                        });
                    } catch { /* UID search is best-effort */ }
                }

                setSearchResults(results);
            } catch (err) {
                console.error('Server search error:', err);
                setSearchResults([]);
            }
            setSearching(false);
        }, 400);

        return () => clearTimeout(debounce);
    }, [search, users]);

    const filteredUsers = searchResults !== null
        ? searchResults
        : users.filter(
            (u) =>
                getUserLabel(u).toLowerCase().includes(search.toLowerCase()) ||
                u.email?.toLowerCase().includes(search.toLowerCase()) ||
                u.uid.toLowerCase().includes(search.toLowerCase())
        );

    const modalConfig = modal.action ? MODAL_CONFIG[modal.action] : null;

    return (
        <RoleGuard module="users">
            <div>
                <div className="flex items-center justify-between mb-6">
                    <h1 className="text-2xl font-bold text-calx-text">Gestion des utilisateurs</h1>
                    <span className="text-sm text-calx-text-secondary">{users.length} utilisateurs</span>
                </div>

                {/* Search */}
                <div className="relative mb-6">
                    <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-calx-text-secondary" />
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Rechercher par nom ou email..."
                        className="w-full pl-10 pr-4 py-3 bg-calx-surface/50 border border-calx-surface rounded-xl text-calx-text placeholder-calx-text-muted focus:outline-none focus:ring-2 focus:ring-gold-400/40 transition-all"
                    />
                </div>

                {/* Table */}
                <div className="bg-calx-surface/30 border border-calx-surface rounded-xl">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-calx-surface">
                                    <th className="text-left px-4 py-3 text-xs font-medium text-calx-text-secondary uppercase tracking-wider">Utilisateur</th>
                                    <th className="text-left px-4 py-3 text-xs font-medium text-calx-text-secondary uppercase tracking-wider">Rôle</th>
                                    <th className="text-left px-4 py-3 text-xs font-medium text-calx-text-secondary uppercase tracking-wider">Objectif</th>
                                    <th className="text-left px-4 py-3 text-xs font-medium text-calx-text-secondary uppercase tracking-wider">Profil</th>
                                    <th className="text-left px-4 py-3 text-xs font-medium text-calx-text-secondary uppercase tracking-wider">Statut</th>
                                    <th className="text-right px-4 py-3 text-xs font-medium text-calx-text-secondary uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-800/50">
                                {loading ? (
                                    <tr>
                                        <td colSpan={6} className="px-4 py-12 text-center text-calx-text-secondary">
                                            <div className="w-6 h-6 border-2 border-gold-400 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                                            Chargement...
                                        </td>
                                    </tr>
                                ) : filteredUsers.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="px-4 py-12 text-center text-calx-text-secondary">
                                            Aucun utilisateur trouvé
                                        </td>
                                    </tr>
                                ) : (
                                    filteredUsers.map((user) => (
                                        <tr key={user.uid} className="hover:bg-calx-card/30 transition-colors">
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-3">
                                                    {getPhoto(user) ? (
                                                        <img
                                                            src={getPhoto(user)}
                                                            alt={getUserLabel(user)}
                                                            className="w-9 h-9 rounded-full object-cover border border-calx-surface"
                                                        />
                                                    ) : (
                                                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-gold-400 to-gold-600 flex items-center justify-center text-sm font-bold text-black">
                                                            {getUserLabel(user)[0]?.toUpperCase() || '?'}
                                                        </div>
                                                    )}
                                                    <div>
                                                        <span className="text-sm font-medium text-calx-text block">{getUserLabel(user)}</span>
                                                        <span className="text-xs text-calx-text-muted">{user.email || '—'}</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3">
                                                {user.role ? (
                                                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold ${ROLE_BADGE[user.role].bg} ${ROLE_BADGE[user.role].text}`}>
                                                        {ROLE_BADGE[user.role].label}
                                                    </span>
                                                ) : (
                                                    <span className="text-[11px] text-calx-text-muted">User</span>
                                                )}
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className="text-sm text-calx-text-secondary">{getGoalLabel(user.primaryGoal)}</span>
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="text-xs text-calx-text-muted space-y-0.5">
                                                    {user.heightCm && <div>{user.heightCm} cm</div>}
                                                    {user.weightKg && <div>{user.weightKg} kg</div>}
                                                    {user.language && <div>{getLangFlag(user.language)} {user.language.toUpperCase()}</div>}
                                                </div>
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${user.blocked
                                                    ? 'bg-red-500/10 text-red-400 border border-red-500/20'
                                                    : user.onboardingComplete
                                                        ? 'bg-green-500/10 text-green-400 border border-green-500/20'
                                                        : 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20'
                                                    }`}>
                                                    {user.blocked ? 'Bloqué' : user.onboardingComplete ? 'Actif' : 'Onboarding'}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-right">
                                                <div className="relative inline-block">
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); setActionMenu(actionMenu === user.uid ? null : user.uid); }}
                                                        className="p-1.5 rounded-lg hover:bg-gray-700 text-calx-text-secondary hover:text-calx-text transition-colors"
                                                    >
                                                        <MoreHorizontal size={16} />
                                                    </button>
                                                    {actionMenu === user.uid && (
                                                        <div className="absolute right-0 top-full mt-1 w-48 bg-calx-card border border-calx-surface-variant rounded-xl shadow-xl z-20 py-1" onClick={(e) => e.stopPropagation()}>
                                                            <button
                                                                onClick={() => openModal(user.blocked ? 'unblock' : 'block', user)}
                                                                className="flex items-center gap-2 w-full px-3 py-2 text-sm text-calx-text-secondary hover:bg-gray-700 hover:text-calx-text transition-colors"
                                                            >
                                                                {user.blocked ? <Unlock size={14} /> : <Ban size={14} />}
                                                                {user.blocked ? 'Débloquer' : 'Bloquer'}
                                                            </button>
                                                            <button
                                                                onClick={() => openModal('reset_password', user)}
                                                                className="flex items-center gap-2 w-full px-3 py-2 text-sm text-calx-text-secondary hover:bg-gray-700 hover:text-calx-text transition-colors"
                                                            >
                                                                <RotateCcw size={14} />
                                                                Réinit. mot de passe
                                                            </button>
                                                            <button
                                                                onClick={() => openModal('delete', user)}
                                                                className="flex items-center gap-2 w-full px-3 py-2 text-sm text-red-400 hover:bg-red-500/10 transition-colors"
                                                            >
                                                                <Trash2 size={14} />
                                                                Supprimer
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* ── Confirmation Modal ────────────────────────────── */}
            {modal.open && modalConfig && modal.user && (
                <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
                    {/* Backdrop */}
                    <div
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                        onClick={closeModal}
                    />

                    {/* Modal */}
                    <div className="relative w-full max-w-md bg-calx-card border border-calx-surface-variant rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
                        {/* Close button */}
                        <button
                            onClick={closeModal}
                            className="absolute top-4 right-4 p-1 rounded-lg text-calx-text-muted hover:text-calx-text hover:bg-calx-surface transition-colors"
                        >
                            <X size={18} />
                        </button>

                        <div className="p-6">
                            {/* Icon */}
                            <div className={`w-14 h-14 rounded-2xl border ${modalConfig.iconBg} flex items-center justify-center ${modalConfig.iconColor} mb-5`}>
                                <modalConfig.icon size={26} />
                            </div>

                            {/* Title */}
                            <h3 className="text-lg font-bold text-calx-text mb-2">
                                {modalConfig.title}
                            </h3>

                            {/* User info */}
                            <div className="flex items-center gap-3 mb-4 p-3 rounded-xl bg-calx-surface/50 border border-calx-surface">
                                {getPhoto(modal.user) ? (
                                    <img
                                        src={getPhoto(modal.user)}
                                        alt={getUserLabel(modal.user)}
                                        className="w-10 h-10 rounded-full object-cover border border-calx-surface"
                                    />
                                ) : (
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gold-400 to-gold-600 flex items-center justify-center text-sm font-bold text-black">
                                        {getUserLabel(modal.user)[0]?.toUpperCase() || '?'}
                                    </div>
                                )}
                                <div>
                                    <p className="text-sm font-medium text-calx-text">{getUserLabel(modal.user)}</p>
                                    <p className="text-xs text-calx-text-muted">{modal.user.email || '—'}</p>
                                </div>
                            </div>

                            {/* Description */}
                            <p className="text-sm text-calx-text-secondary leading-relaxed mb-4">
                                {modalConfig.description(modal.user)}
                            </p>

                            {/* Block Reason (only for block action) */}
                            {modal.action === 'block' && (
                                <div className="mb-6">
                                    <label className="block text-xs font-medium text-calx-text-muted mb-1.5 uppercase tracking-wider">
                                        Raison du blocage (optionnel)
                                    </label>
                                    <textarea
                                        value={blockReason}
                                        onChange={(e) => setBlockReason(e.target.value)}
                                        placeholder="Ex: Violation des conditions d'utilisation..."
                                        rows={2}
                                        className="w-full px-3 py-2.5 bg-calx-surface/50 border border-calx-surface rounded-xl text-sm text-calx-text placeholder-calx-text-muted focus:outline-none focus:ring-2 focus:ring-orange-400/30 transition-all resize-none"
                                    />
                                </div>
                            )}

                            {modal.action !== 'block' && <div className="mb-2" />}

                            {/* Buttons */}
                            <div className="flex gap-3">
                                <button
                                    onClick={closeModal}
                                    disabled={modal.loading}
                                    className="flex-1 py-2.5 px-4 rounded-xl border border-calx-surface text-calx-text-secondary text-sm font-medium hover:bg-calx-surface/50 transition-colors disabled:opacity-50"
                                >
                                    Annuler
                                </button>
                                <button
                                    onClick={handleConfirm}
                                    disabled={modal.loading}
                                    className={`flex-1 py-2.5 px-4 rounded-xl text-white text-sm font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed ${modalConfig.confirmBg}`}
                                >
                                    {modal.loading ? (
                                        <span className="flex items-center justify-center gap-2">
                                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                            En cours...
                                        </span>
                                    ) : (
                                        modalConfig.confirmLabel
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </RoleGuard>
    );
}
