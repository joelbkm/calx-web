'use client';

import { AuthProvider } from '@/lib/auth/context';
import DashboardLayout from '@/components/layout/DashboardLayout';
import OtpGate from '@/components/auth/OtpGate';

export default function Layout({ children }: { children: React.ReactNode }) {
    return (
        <AuthProvider>
            <OtpGate>
                <DashboardLayout>{children}</DashboardLayout>
            </OtpGate>
        </AuthProvider>
    );
}
