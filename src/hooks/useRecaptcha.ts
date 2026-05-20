'use client';

import { useCallback } from 'react';

const SITE_KEY = '6LdPwZosAAAAAHIUeTn1RBIlipqm_LMvJ7x9qjk4';

/**
 * Wait for the grecaptcha.enterprise object to be ready (max 10s).
 */
function waitForRecaptcha(timeout = 10000): Promise<typeof grecaptcha.enterprise> {
    return new Promise((resolve, reject) => {
        if (typeof window !== 'undefined' && window.grecaptcha?.enterprise) {
            return resolve(window.grecaptcha.enterprise);
        }

        const start = Date.now();
        const interval = setInterval(() => {
            if (window.grecaptcha?.enterprise) {
                clearInterval(interval);
                resolve(window.grecaptcha.enterprise);
            } else if (Date.now() - start > timeout) {
                clearInterval(interval);
                reject(new Error('reCAPTCHA Enterprise failed to load'));
            }
        }, 100);
    });
}

/**
 * Hook providing an `executeRecaptcha(action)` function.
 *
 * Usage:
 * ```tsx
 * const { executeRecaptcha } = useRecaptcha();
 *
 * const handleSubmit = async () => {
 *     const token = await executeRecaptcha('LOGIN');
 *     // Send token to your backend for validation
 * };
 * ```
 *
 * Note: For Firebase App Check, you do NOT need this hook —
 * the SDK handles token generation automatically.
 * This hook is useful for explicit reCAPTCHA validation
 * on specific forms (e.g., contact forms, registration).
 */
export function useRecaptcha() {
    const executeRecaptcha = useCallback(async (action: string): Promise<string> => {
        const enterprise = await waitForRecaptcha();
        return new Promise((resolve, reject) => {
            enterprise.ready(() => {
                enterprise
                    .execute(SITE_KEY, { action })
                    .then(resolve)
                    .catch(reject);
            });
        });
    }, []);

    return { executeRecaptcha };
}
