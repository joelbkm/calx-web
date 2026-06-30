'use client';

import { useEffect, useState, type ReactNode } from 'react';
import { httpsCallable } from 'firebase/functions';
import { functions } from '@/lib/firebase/client';
import { useAuth } from '@/lib/auth/context';
import AdminOtpScreen from './AdminOtpScreen';

function getDeviceId(): string {
    if (typeof window === 'undefined') return '';
    let id = localStorage.getItem('calx_admin_device_id');
    if (!id) {
        id = crypto.randomUUID();
        localStorage.setItem('calx_admin_device_id', id);
    }
    return id;
}

type GateStatus = 'checking' | 'otp' | 'passed';

/**
 * Second factor for the admin dashboard. After Firebase Auth login, the
 * session must be OTP-verified (or come from a remembered device) before any
 * dashboard content renders. All validation happens server-side
 * (checkAdminAccess) — the client only holds opaque, server-issued tokens.
 */
export default function OtpGate({ children }: { children: ReactNode }) {
    const { user, role, loading } = useAuth();
    const [status, setStatus] = useState<GateStatus>('checking');

    useEffect(() => {
        if (loading) return;
        // No authenticated admin → let the page-level RoleGuard handle the
        // redirect to /cockpit/admin. Nothing to gate here.
        if (!user || !role) {
            setStatus('passed');
            return;
        }

        let cancelled = false;
        (async () => {
            try {
                const deviceId = getDeviceId();
                const sessionToken = sessionStorage.getItem('calx_admin_session') || undefined;
                const deviceToken = localStorage.getItem('calx_admin_device_token') || undefined;
                const res = await httpsCallable<
                    { sessionToken?: string; deviceId?: string; deviceToken?: string },
                    { ok: boolean; sessionToken?: string }
                >(functions, 'checkAdminAccess')({ sessionToken, deviceId, deviceToken });
                if (cancelled) return;
                if (res.data?.ok) {
                    if (res.data.sessionToken) {
                        sessionStorage.setItem('calx_admin_session', res.data.sessionToken);
                    }
                    setStatus('passed');
                } else {
                    // A remembered-device token that no longer validates is stale.
                    localStorage.removeItem('calx_admin_device_token');
                    setStatus('otp');
                }
            } catch {
                if (!cancelled) setStatus('otp');
            }
        })();
        return () => { cancelled = true; };
    }, [loading, user, role]);

    if (loading || status === 'checking') {
        return (
            <div className="min-h-screen flex items-center justify-center bg-calx-bg">
                <div className="w-8 h-8 border-2 border-gold-400 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    if (status === 'otp') {
        return <AdminOtpScreen onVerified={() => setStatus('passed')} />;
    }

    return <>{children}</>;
}
