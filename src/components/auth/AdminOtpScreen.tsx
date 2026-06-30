'use client';

import { useEffect, useRef, useState } from 'react';
import { httpsCallable } from 'firebase/functions';
import { functions } from '@/lib/firebase/client';
import { useAuth } from '@/lib/auth/context';
import { ShieldCheck, LogOut } from 'lucide-react';

function getDeviceId(): string {
    let id = localStorage.getItem('calx_admin_device_id');
    if (!id) {
        id = crypto.randomUUID();
        localStorage.setItem('calx_admin_device_id', id);
    }
    return id;
}

export default function AdminOtpScreen({ onVerified }: { onVerified: () => void }) {
    const { user, signOut } = useAuth();
    const [code, setCode] = useState('');
    const [remember, setRemember] = useState(false);
    const [sending, setSending] = useState(false);
    const [verifying, setVerifying] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [info, setInfo] = useState<string | null>(null);
    const [cooldown, setCooldown] = useState(0);
    const sentOnce = useRef(false);

    const sendCode = async () => {
        setSending(true);
        setError(null);
        try {
            await httpsCallable(functions, 'requestAdminOtp')({});
            setInfo('Un code à 6 chiffres a été envoyé à ton e-mail.');
            setCooldown(30);
        } catch (e) {
            const msg = e instanceof Error ? e.message : 'Erreur lors de l\'envoi du code.';
            setError(msg);
        }
        setSending(false);
    };

    // Send a code automatically on first mount (guard against double-mount).
    useEffect(() => {
        if (sentOnce.current) return;
        sentOnce.current = true;
        sendCode();
    }, []);

    useEffect(() => {
        if (cooldown <= 0) return;
        const t = setTimeout(() => setCooldown((c) => c - 1), 1000);
        return () => clearTimeout(t);
    }, [cooldown]);

    const verify = async () => {
        if (!/^\d{6}$/.test(code)) {
            setError('Entre le code à 6 chiffres reçu par e-mail.');
            return;
        }
        setVerifying(true);
        setError(null);
        try {
            const res = await httpsCallable<
                { code: string; rememberDevice: boolean; deviceId: string },
                { ok: boolean; sessionToken?: string; deviceToken?: string | null }
            >(functions, 'verifyAdminOtp')({ code, rememberDevice: remember, deviceId: getDeviceId() });
            if (res.data?.sessionToken) sessionStorage.setItem('calx_admin_session', res.data.sessionToken);
            if (res.data?.deviceToken) localStorage.setItem('calx_admin_device_token', res.data.deviceToken);
            onVerified();
        } catch (e) {
            const msg = e instanceof Error ? e.message : 'Code incorrect.';
            setError(msg);
            setVerifying(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-calx-bg px-4">
            <div className="w-full max-w-md bg-calx-surface/60 border border-calx-surface rounded-2xl p-8">
                <div className="flex flex-col items-center text-center mb-6">
                    <div className="w-14 h-14 rounded-2xl bg-gold-400/12 border border-gold-400/25 flex items-center justify-center mb-4">
                        <ShieldCheck className="text-gold-400" size={28} />
                    </div>
                    <h1 className="text-xl font-bold text-calx-text">Vérification en deux étapes</h1>
                    <p className="text-sm text-calx-text-secondary mt-1">
                        Entre le code à 6 chiffres envoyé à
                        <br />
                        <span className="text-calx-text font-medium">{user?.email}</span>
                    </p>
                </div>

                <input
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    maxLength={6}
                    placeholder="000000"
                    value={code}
                    onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    onKeyDown={(e) => { if (e.key === 'Enter') verify(); }}
                    className="w-full text-center tracking-[0.5em] text-2xl font-bold px-4 py-3.5 bg-calx-card/50 border border-calx-surface-variant rounded-xl text-calx-text focus:outline-none focus:ring-2 focus:ring-gold-400/40 transition-all"
                />

                <label className="flex items-center gap-2 mt-4 text-sm text-calx-text-secondary cursor-pointer select-none">
                    <input
                        type="checkbox"
                        checked={remember}
                        onChange={(e) => setRemember(e.target.checked)}
                        className="accent-gold-400 w-4 h-4"
                    />
                    Se souvenir de cet appareil pendant 30 jours
                </label>

                {error && <p className="mt-3 text-sm text-red-400">{error}</p>}
                {!error && info && <p className="mt-3 text-sm text-green-400">{info}</p>}

                <button
                    onClick={verify}
                    disabled={verifying || code.length !== 6}
                    className="w-full mt-5 px-6 py-3 bg-gradient-to-r from-gold-400 to-gold-600 text-black font-bold rounded-xl hover:shadow-lg hover:shadow-gold-400/25 transition-all disabled:opacity-50"
                >
                    {verifying ? 'Vérification...' : 'Valider'}
                </button>

                <div className="flex items-center justify-between mt-4">
                    <button
                        onClick={sendCode}
                        disabled={sending || cooldown > 0}
                        className="text-sm text-gold-400 hover:underline disabled:opacity-50 disabled:no-underline"
                    >
                        {cooldown > 0 ? `Renvoyer le code (${cooldown}s)` : 'Renvoyer le code'}
                    </button>
                    <button
                        onClick={() => signOut()}
                        className="flex items-center gap-1.5 text-sm text-calx-text-muted hover:text-calx-text"
                    >
                        <LogOut size={14} /> Se déconnecter
                    </button>
                </div>
            </div>
        </div>
    );
}
