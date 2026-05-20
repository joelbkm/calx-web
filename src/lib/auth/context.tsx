'use client';

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import {
    onAuthStateChanged,
    signInWithEmailAndPassword,
    signOut as firebaseSignOut,
    type User,
} from 'firebase/auth';
import { auth } from '@/lib/firebase/client';
import type { UserRole } from './rbac';

interface AuthContextType {
    user: User | null;
    role: UserRole | undefined;
    loading: boolean;
    signIn: (email: string, password: string) => Promise<void>;
    signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    role: undefined,
    loading: true,
    signIn: async () => { },
    signOut: async () => { },
});

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [role, setRole] = useState<UserRole | undefined>(undefined);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            if (firebaseUser) {
                setUser(firebaseUser);

                // Get custom claims (role)
                const tokenResult = await firebaseUser.getIdTokenResult(true);
                const claims = tokenResult.claims;
                setRole(claims.role as UserRole | undefined);
            } else {
                setUser(null);
                setRole(undefined);
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const signIn = async (email: string, password: string) => {
        const credential = await signInWithEmailAndPassword(auth, email, password);
        const tokenResult = await credential.user.getIdTokenResult(true);
        setRole(tokenResult.claims.role as UserRole | undefined);
    };

    const signOut = async () => {
        await firebaseSignOut(auth);
        setUser(null);
        setRole(undefined);
    };

    return (
        <AuthContext.Provider value={{ user, role, loading, signIn, signOut }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
