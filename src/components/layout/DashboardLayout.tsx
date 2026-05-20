'use client';

import { useAuth } from '@/lib/auth/context';
import { useRouter } from 'next/navigation';
import { useEffect, type ReactNode } from 'react';
import Sidebar from './Sidebar';

export default function DashboardLayout({ children }: { children: ReactNode }) {
    const { user, role, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!loading && !user) {
            router.replace('/cockpit/admin');
        }
        // If user has no role, they can't access the dashboard
        if (!loading && user && !role) {
            router.replace('/cockpit/admin?error=no_role');
        }
    }, [loading, user, role, router]);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-calx-bg">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-10 h-10 border-3 border-gold-400 border-t-transparent rounded-full animate-spin" />
                    <p className="text-calx-text-secondary text-sm">Chargement...</p>
                </div>
            </div>
        );
    }

    if (!user || !role) return null;

    return (
        <div className="flex min-h-screen bg-calx-bg">
            <Sidebar />
            <main className="flex-1 overflow-x-hidden">
                <div className="p-6 lg:p-8 max-w-7xl mx-auto">
                    {children}
                </div>
            </main>
        </div>
    );
}
