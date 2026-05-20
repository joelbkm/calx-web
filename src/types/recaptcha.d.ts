/* Type declarations for reCAPTCHA Enterprise */

interface RecaptchaEnterprise {
    ready(callback: () => void): void;
    execute(siteKey: string, options: { action: string }): Promise<string>;
}

interface Grecaptcha {
    enterprise: RecaptchaEnterprise;
}

interface Window {
    grecaptcha: Grecaptcha;
}

declare const grecaptcha: Grecaptcha;
