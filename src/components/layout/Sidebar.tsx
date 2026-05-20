'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth/context';
import { hasAccess, ROLE_LABELS, type Module } from '@/lib/auth/rbac';
import {
    LayoutDashboard,
    Users,
    Shield,
    TrendingUp,
    CreditCard,
    Package,
    Flag,
    Bot,
    Scale,
    UserMinus,
    Clock,
    MessageSquare,
    Mail,
    LogOut,
    ChevronLeft,
    ChevronRight,
} from 'lucide-react';
import { useState, type ReactNode } from 'react';

interface NavItem {
    label: string;
    href: string;
    icon: ReactNode;
    module: Module;
}

const NAV_ITEMS: NavItem[] = [
    { label: 'Tableau de bord', href: '/dashboard', icon: <LayoutDashboard size={20} />, module: 'dashboard' },
    { label: 'Utilisateurs', href: '/dashboard/users', icon: <Users size={20} />, module: 'users' },
    { label: 'Rôles', href: '/dashboard/roles', icon: <Shield size={20} />, module: 'roles' },
    { label: 'Finance', href: '/dashboard/finance', icon: <TrendingUp size={20} />, module: 'finance' },
    { label: 'Tarification', href: '/dashboard/pricing', icon: <CreditCard size={20} />, module: 'pricing' },
    { label: 'Offres d\'abonnement', href: '/dashboard/offerings', icon: <Package size={20} />, module: 'pricing' },
    { label: 'Modération', href: '/dashboard/moderation', icon: <Flag size={20} />, module: 'moderation' },
    { label: 'Review IA', href: '/dashboard/ai-review', icon: <Bot size={20} />, module: 'moderation' },
    { label: 'Appels', href: '/dashboard/appeals', icon: <Scale size={20} />, module: 'moderation' },
    { label: 'Suppressions', href: '/dashboard/deletions', icon: <UserMinus size={20} />, module: 'users' },
    { label: 'Suppr. programmées', href: '/dashboard/scheduled-deletions', icon: <Clock size={20} />, module: 'users' },
    { label: 'Support', href: '/dashboard/support', icon: <MessageSquare size={20} />, module: 'support' },
    { label: 'Paramètres Email', href: '/dashboard/email', icon: <Mail size={20} />, module: 'email' },
];

export default function Sidebar() {
    const { user, role, signOut } = useAuth();
    const pathname = usePathname();
    const [collapsed, setCollapsed] = useState(false);

    // Filter nav items based on role
    const visibleItems = NAV_ITEMS.filter((item) => hasAccess(role, item.module));

    return (
        <aside
            className={`flex flex-col bg-calx-bg border-r border-calx-surface h-screen sticky top-0 transition-all duration-300 ${collapsed ? 'w-16' : 'w-64'
                }`}
        >
            {/* Logo */}
            <div className="flex items-center justify-between px-4 h-16 border-b border-calx-surface">
                <Link href="/dashboard" className="flex items-center gap-2">
                    <Image
                        src="/officel_web_logo.png"
                        alt="CalX Logo"
                        width={collapsed ? 28 : 36}
                        height={collapsed ? 28 : 36}
                        className="object-contain transition-all duration-300"
                    />
                    {!collapsed && (
                        <span className="text-xs text-calx-text-muted font-medium">Admin</span>
                    )}
                </Link>
                <button
                    onClick={() => setCollapsed(!collapsed)}
                    className="p-1.5 rounded-lg hover:bg-calx-surface text-calx-text-muted hover:text-calx-text transition-colors"
                >
                    {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
                </button>
            </div>

            {/* Navigation */}
            <nav className="flex-1 py-4 px-2 space-y-1 overflow-y-auto">
                {visibleItems.map((item) => {
                    const isActive =
                        pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${isActive
                                ? 'bg-gold-400/10 text-gold-400 border border-gold-400/20'
                                : 'text-calx-text-secondary hover:text-calx-text hover:bg-calx-surface/60'
                                }`}
                            title={collapsed ? item.label : undefined}
                        >
                            <span className="flex-shrink-0">{item.icon}</span>
                            {!collapsed && <span>{item.label}</span>}
                        </Link>
                    );
                })}
            </nav>

            {/* User info */}
            <div className="border-t border-calx-surface p-3">
                {!collapsed && user && (
                    <div className="mb-3 px-2">
                        <p className="text-sm font-medium text-calx-text truncate">
                            {user.displayName || user.email}
                        </p>
                        <p className="text-xs text-gold-400">
                            {role ? ROLE_LABELS[role] : 'Aucun rôle'}
                        </p>
                    </div>
                )}
                <button
                    onClick={signOut}
                    className="flex items-center gap-3 w-full px-3 py-2 rounded-lg text-sm text-calx-text-secondary hover:text-red-400 hover:bg-red-500/10 transition-all"
                    title={collapsed ? 'Déconnexion' : undefined}
                >
                    <LogOut size={18} />
                    {!collapsed && <span>Déconnexion</span>}
                </button>
            </div>
        </aside>
    );
}
