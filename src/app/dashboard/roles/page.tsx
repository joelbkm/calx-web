'use client';

import RoleGuard from '@/components/guards/RoleGuard';
import { useState, useEffect } from 'react';
import { httpsCallable } from 'firebase/functions';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db, functions } from '@/lib/firebase/client';
import { ALL_ROLES, ROLE_LABELS, type UserRole } from '@/lib/auth/rbac';
import { UserPlus, Shield, Mail, Users, X } from 'lucide-react';

interface StaffMember {
    uid: string;
    email?: string;
    displayName?: string;
    role: UserRole;
    photoUrl?: string;
}

const ROLE_PILL: Record<UserRole, { bg: string; text: string }> = {
    super_admin: { bg: 'bg-gold-500/15',    text: 'text-gold-300' },
    admin:       { bg: 'bg-blue-500/15',    text: 'text-blue-300' },
    comptable:   { bg: 'bg-emerald-500/15', text: 'text-emerald-300' },
    technicien:  { bg: 'bg-purple-500/15',  text: 'text-purple-300' },
};

export default function RolesPage() {
    const [email, setEmail] = useState('');
    const [selectedRole, setSelectedRole] = useState<UserRole>('admin');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);
    const [staff, setStaff] = useState<StaffMember[]>([]);
    const [staffLoading, setStaffLoading] = useState(true);
    const [revoking, setRevoking] = useState<string | null>(null);

    // Real-time listener: every user in Firestore that has a role.
    useEffect(() => {
        const q = query(
            collection(db, 'users'),
            where('role', 'in', ['super_admin', 'admin', 'comptable', 'technicien']),
        );
        const unsub = onSnapshot(q, (snap) => {
            const items: StaffMember[] = snap.docs.map((d) => {
                const data = d.data();
                return {
                    uid: d.id,
                    email: data.email,
                    displayName: data.displayName,
                    role: data.role as UserRole,
                    photoUrl: data.photoUrl || data.photoURL,
                };
            }).sort((a, b) => {
                // super_admin first, then alpha by email
                const order = { super_admin: 0, admin: 1, comptable: 2, technicien: 3 };
                if (order[a.role] !== order[b.role]) return order[a.role] - order[b.role];
                return (a.email || '').localeCompare(b.email || '');
            });
            setStaff(items);
            setStaffLoading(false);
        }, (err) => {
            console.error('Staff listener error:', err);
            setStaffLoading(false);
        });
        return () => unsub();
    }, []);

    async function handleRevoke(member: StaffMember) {
        if (member.role === 'super_admin') return; // safety
        if (!confirm(`Révoquer le rôle "${ROLE_LABELS[member.role]}" de ${member.email} ?\n\nCe collaborateur perdra l'accès au back-office.`)) return;
        setRevoking(member.uid);
        try {
            const callable = httpsCallable<{ email: string; role: string }, { ok: boolean }>(functions, 'setUserRole');
            await callable({ email: member.email || '', role: 'none' });
            // The onSnapshot listener will auto-update the UI.
        } catch (err) {
            alert((err as { message?: string }).message || 'Erreur lors de la révocation.');
        }
        setRevoking(null);
    }

    const handleAssignRole = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setResult(null);

        try {
            // Calls the Cloud Function callable. The previous /api/roles route
            // was a Next.js handler that never reached prod (static export).
            const callable = httpsCallable<
                { email: string; role: UserRole },
                { ok: boolean; uid: string; previousRole: string | null; newRole: string | null; emailSent: boolean }
            >(functions, 'setUserRole');
            const res = await callable({ email, role: selectedRole });
            const emailNote = res.data.emailSent
                ? ' Un email de bienvenue a été envoyé.'
                : ' (Aucun email envoyé — rôle modifié, pas créé.)';
            setResult({
                success: true,
                message: `✅ Rôle "${ROLE_LABELS[selectedRole]}" attribué à ${email}.${emailNote}`,
            });
            setEmail('');
        } catch (err) {
            const msg = (err as { message?: string }).message
                || 'Erreur lors de l\'attribution du rôle.';
            setResult({ success: false, message: msg });
        }

        setLoading(false);
    };

    return (
        <RoleGuard module="roles">
            <div>
                <div className="mb-8">
                    <h1 className="text-2xl font-bold text-calx-text flex items-center gap-3">
                        <Shield className="text-gold-400" size={28} />
                        Gestion des rôles
                    </h1>
                    <p className="text-calx-text-secondary mt-1">Accès réservé au Super Admin</p>
                </div>

                {/* Assign role form */}
                <div className="bg-calx-surface/50 border border-calx-surface rounded-xl p-6 max-w-xl mb-8">
                    <h3 className="text-lg font-semibold text-calx-text mb-4 flex items-center gap-2">
                        <UserPlus size={20} className="text-gold-400" />
                        Attribuer un rôle
                    </h3>

                    <form onSubmit={handleAssignRole} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-calx-text-secondary mb-1.5">
                                <Mail size={14} className="inline mr-1" />
                                Email du collaborateur
                            </label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="collaborateur@email.com"
                                required
                                className="w-full px-4 py-3 bg-calx-card/50 border border-calx-surface-variant rounded-xl text-calx-text placeholder-calx-text-muted focus:outline-none focus:ring-2 focus:ring-gold-400/40 transition-all"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-calx-text-secondary mb-1.5">Rôle</label>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                                {ALL_ROLES.map((r) => (
                                    <button
                                        key={r}
                                        type="button"
                                        onClick={() => setSelectedRole(r)}
                                        className={`px-4 py-2.5 rounded-xl text-sm font-medium border transition-all ${selectedRole === r
                                                ? 'bg-gold-400/10 border-gold-400/40 text-gold-400'
                                                : 'bg-calx-card/30 border-calx-surface-variant text-calx-text-secondary hover:border-gray-600'
                                            }`}
                                    >
                                        {ROLE_LABELS[r]}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3 bg-gradient-to-r from-gold-400 to-gold-600 text-black font-bold rounded-xl hover:shadow-lg hover:shadow-gold-400/25 transition-all disabled:opacity-50"
                        >
                            {loading ? 'Attribution...' : 'Attribuer le rôle'}
                        </button>
                    </form>

                    {result && (
                        <div className={`mt-4 p-3 rounded-lg text-sm ${result.success
                                ? 'bg-green-500/10 border border-green-500/20 text-green-400'
                                : 'bg-red-500/10 border border-red-500/20 text-red-400'
                            }`}>
                            {result.message}
                        </div>
                    )}
                </div>

                {/* Current staff */}
                <div className="bg-calx-surface/50 border border-calx-surface rounded-xl p-6 mb-8">
                    <h3 className="text-lg font-semibold text-calx-text mb-4 flex items-center gap-2">
                        <Users size={20} className="text-gold-400" />
                        Collaborateurs actuels
                        <span className="text-xs text-calx-text-muted font-normal">({staff.length})</span>
                    </h3>
                    {staffLoading ? (
                        <div className="py-6 text-center">
                            <div className="inline-block w-5 h-5 border-2 border-gold-400 border-t-transparent rounded-full animate-spin" />
                        </div>
                    ) : staff.length === 0 ? (
                        <p className="text-sm text-calx-text-muted text-center py-6">
                            Aucun collaborateur pour le moment. Utilisez le formulaire ci-dessus pour attribuer le premier rôle.
                        </p>
                    ) : (
                        <div className="space-y-2">
                            {staff.map((m) => (
                                <div key={m.uid} className="flex items-center gap-3 p-3 bg-calx-card/40 border border-calx-surface-variant rounded-lg">
                                    {m.photoUrl ? (
                                        // eslint-disable-next-line @next/next/no-img-element
                                        <img src={m.photoUrl} alt="" className="w-9 h-9 rounded-full object-cover border border-calx-surface-variant" />
                                    ) : (
                                        <div className="w-9 h-9 rounded-full bg-calx-surface flex items-center justify-center text-xs text-calx-text-muted">
                                            {(m.email || m.displayName || '?')[0].toUpperCase()}
                                        </div>
                                    )}
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-calx-text truncate">
                                            {m.displayName || m.email || m.uid.slice(0, 12) + '…'}
                                        </p>
                                        {m.displayName && m.email && (
                                            <p className="text-xs text-calx-text-muted truncate">{m.email}</p>
                                        )}
                                    </div>
                                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold ${ROLE_PILL[m.role].bg} ${ROLE_PILL[m.role].text}`}>
                                        {ROLE_LABELS[m.role]}
                                    </span>
                                    {m.role !== 'super_admin' && (
                                        <button
                                            onClick={() => handleRevoke(m)}
                                            disabled={revoking === m.uid}
                                            className="p-1.5 text-calx-text-muted hover:text-red-400 hover:bg-red-500/10 rounded transition-colors disabled:opacity-40"
                                            title={`Révoquer le rôle de ${m.email || m.uid}`}
                                        >
                                            <X size={16} />
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Roles matrix */}
                <div className="bg-calx-surface/30 border border-calx-surface rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-calx-text mb-4">📋 Matrice des permissions</h3>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-calx-surface">
                                    <th className="text-left px-3 py-2 text-xs text-calx-text-secondary uppercase">Module</th>
                                    <th className="text-center px-3 py-2 text-xs text-calx-text-secondary uppercase">Super Admin</th>
                                    <th className="text-center px-3 py-2 text-xs text-calx-text-secondary uppercase">Admin</th>
                                    <th className="text-center px-3 py-2 text-xs text-calx-text-secondary uppercase">Comptable</th>
                                    <th className="text-center px-3 py-2 text-xs text-calx-text-secondary uppercase">Technicien</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-800/50">
                                {[
                                    { module: 'Dashboard', perms: [true, true, true, true] },
                                    { module: 'Utilisateurs', perms: [true, true, false, true] },
                                    { module: 'Rôles', perms: [true, false, false, false] },
                                    { module: 'Finance', perms: [true, false, true, false] },
                                    { module: 'Tarification', perms: [true, false, false, false] },
                                    { module: 'Modération', perms: [true, true, false, true] },
                                    { module: 'Support', perms: [true, true, false, false] },
                                ].map((row, i) => (
                                    <tr key={i}>
                                        <td className="px-3 py-2.5 text-sm text-calx-text font-medium">{row.module}</td>
                                        {row.perms.map((p, j) => (
                                            <td key={j} className="text-center px-3 py-2.5 text-sm">
                                                {p ? '✅' : '❌'}
                                            </td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </RoleGuard>
    );
}
