'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/lib/auth/context';
import { AuthProvider } from '@/lib/auth/context';
import { Eye, EyeOff, AlertCircle } from 'lucide-react';
import { Suspense } from 'react';

function LoginForm() {
    const { signIn } = useAuth();
    const router = useRouter();
    const searchParams = useSearchParams();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const noRole = searchParams.get('error') === 'no_role';

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            await signIn(email, password);
            router.push('/dashboard');
        } catch (err: unknown) {
            const firebaseError = err as { code?: string };
            switch (firebaseError.code) {
                case 'auth/user-not-found':
                case 'auth/wrong-password':
                case 'auth/invalid-credential':
                    setError('Email ou mot de passe incorrect.');
                    break;
                case 'auth/too-many-requests':
                    setError('Trop de tentatives. Réessaie dans quelques minutes.');
                    break;
                default:
                    setError('Une erreur est survenue. Réessaie.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-calx-bg px-4">
            {/* Background glow */}
            <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[400px] h-[400px] bg-gold-400/5 rounded-full blur-[100px]" />

            <div className="relative w-full max-w-md">
                {/* Logo */}
                <div className="text-center mb-8 flex flex-col items-center">
                    <Image
                        src="/officel_web_logo.png"
                        alt="CalX Logo"
                        width={80}
                        height={80}
                        className="object-contain mb-3"
                    />
                    <p className="text-calx-text-secondary mt-2">Back-Office de gestion</p>
                </div>

                {/* Card */}
                <div className="bg-calx-surface/50 border border-calx-surface rounded-2xl p-8">
                    <h2 className="text-xl font-bold text-calx-text mb-6">Connexion</h2>

                    {noRole && (
                        <div className="flex items-start gap-3 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm mb-4">
                            <AlertCircle size={18} className="flex-shrink-0 mt-0.5" />
                            <p>Votre compte n&apos;a pas de rôle attribué. Contactez l&apos;administrateur.</p>
                        </div>
                    )}

                    {error && (
                        <div className="flex items-start gap-3 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm mb-4">
                            <AlertCircle size={18} className="flex-shrink-0 mt-0.5" />
                            <p>{error}</p>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-calx-text-secondary mb-1.5">
                                Email
                            </label>
                            <input
                                id="email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="admin@calx.com"
                                required
                                className="w-full px-4 py-3 bg-calx-card/50 border border-calx-surface-variant rounded-xl text-calx-text placeholder-calx-text-muted focus:outline-none focus:ring-2 focus:ring-gold-400/40 focus:border-gold-400/60 transition-all"
                            />
                        </div>

                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-calx-text-secondary mb-1.5">
                                Mot de passe
                            </label>
                            <div className="relative">
                                <input
                                    id="password"
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    required
                                    className="w-full px-4 py-3 pr-12 bg-calx-card/50 border border-calx-surface-variant rounded-xl text-calx-text placeholder-calx-text-muted focus:outline-none focus:ring-2 focus:ring-gold-400/40 focus:border-gold-400/60 transition-all"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-calx-text-muted hover:text-calx-text transition-colors"
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3 bg-gradient-to-r from-gold-400 to-gold-600 text-black font-bold rounded-xl hover:shadow-lg hover:shadow-gold-400/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? (
                                <span className="flex items-center justify-center gap-2">
                                    <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                                    Connexion...
                                </span>
                            ) : (
                                'Se connecter'
                            )}
                        </button>
                    </form>
                </div>

                <p className="text-center text-xs text-calx-text-muted mt-6">
                    Accès réservé aux administrateurs CalX
                </p>
            </div>
        </div>
    );
}

export default function LoginPage() {
    return (
        <AuthProvider>
            <Suspense fallback={
                <div className="min-h-screen flex items-center justify-center bg-calx-bg">
                    <div className="w-8 h-8 border-2 border-gold-400 border-t-transparent rounded-full animate-spin" />
                </div>
            }>
                <LoginForm />
            </Suspense>
        </AuthProvider>
    );
}
