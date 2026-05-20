import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { I18nProvider } from '@/i18n';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://calx.com'),
  title: {
    default: 'CalX — Simplifier la nutrition avec l\'IA',
    template: '%s | CalX',
  },
  description:
    'Scanne tes repas, suis tes macros et atteins tes objectifs de perte de poids grâce à l\'intelligence artificielle. Rejoins une communauté motivante.',
  keywords: ['nutrition', 'IA', 'perte de poids', 'macros', 'fitness', 'scanner repas', 'CalX'],
  openGraph: {
    type: 'website',
    locale: 'fr_FR',
    siteName: 'CalX',
    title: 'CalX — Simplifier la nutrition avec l\'IA',
    description: 'L\'app qui révolutionne ton suivi nutritionnel grâce à l\'intelligence artificielle.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'CalX — Simplifier la nutrition avec l\'IA',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className={inter.variable} suppressHydrationWarning>
      <head>
        {/*
          IMPORTANT: load reCAPTCHA Enterprise as a synchronous <script> in
          <head> so `grecaptcha.enterprise` is available before App Check
          initializes in client.ts. Using next/script with
          strategy="afterInteractive" causes a race: client.ts imports run
          first, call initializeAppCheck(), which fails because grecaptcha is
          undefined, returns a 403 from the Firebase App Check API, and the
          SDK throttles itself for 24h.
        */}
        <script
          src="https://www.google.com/recaptcha/enterprise.js?render=6LdPwZosAAAAAHIUeTn1RBIlipqm_LMvJ7x9qjk4"
          async
        />
      </head>
      <body className="antialiased">
        <I18nProvider>{children}</I18nProvider>
      </body>
    </html>
  );
}

