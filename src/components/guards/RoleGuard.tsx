'use client';

import { useAuth } from '@/lib/auth/context';
import { hasAccess, type Module } from '@/lib/auth/rbac';
import { useRouter } from 'next/navigation';
import { useEffect, type ReactNode } from 'react';

interface RoleGuardProps {
    module: Module;
    children: ReactNode;
    fallback?: ReactNode;
}

/**
 * Protects a component by checking if the user has access to a specific module.
 * Redirects to /cockpit/admin if not authenticated, shows nothing if not authorized.
 */
export default function RoleGuard({ module, children, fallback }: RoleGuardProps) {
    const { user, role, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!loading && !user) {
            router.replace('/cockpit/admin');
        }
    }, [loading, user, router]);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    if (!user) return null;

    if (!hasAccess(role, module)) {
        return fallback ? (
            <>{fallback}</>
        ) : (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
                <div className="text-6xl mb-4">🔒</div>
                <h2 className="text-2xl font-bold text-white mb-2">Accès refusé</h2>
                <p className="text-gray-400">
                    Vous n&apos;avez pas les permissions nécessaires pour accéder à cette section.
                </p>
            </div>
        );
    }

    return <>{children}</>;
}
