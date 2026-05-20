'use client';

import RoleGuard from '@/components/guards/RoleGuard';
import { useState, useEffect } from 'react';
import { doc, onSnapshot, setDoc, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase/client';
import { useAuth } from '@/lib/auth/context';
import { Mail, Save, Eye, EyeOff, Building2, Phone, MapPin, Globe } from 'lucide-react';

interface EmailConfig {
    companyName: string;
    websiteUrl: string;
    address: string;
    phone: string;
    supportEmail: string;
    footerFr: string;
    footerEn: string;
    updatedAt?: unknown;
    updatedBy?: string;
}

const DEFAULT_CONFIG: EmailConfig = {
    companyName: 'CalX',
    websiteUrl: 'https://calx.com',
    address: '',
    phone: '',
    supportEmail: 'support@calx.com',
    footerFr: '© 2025-2026 CalX. Tous droits réservés.',
    footerEn: '© 2025-2026 CalX. All rights reserved.',
};

export default function EmailSettingsPage() {
    const { user } = useAuth();
    const [config, setConfig] = useState<EmailConfig>(DEFAULT_CONFIG);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const [showPreview, setShowPreview] = useState(false);
    const [previewLang, setPreviewLang] = useState<'fr' | 'en'>('fr');

    useEffect(() => {
        const unsub = onSnapshot(doc(db, 'app_config', 'email'), (snap) => {
            if (snap.exists()) {
                setConfig({ ...DEFAULT_CONFIG, ...snap.data() as EmailConfig });
            }
            setLoading(false);
        });
        return () => unsub();
    }, []);

    const handleSave = async () => {
        setSaving(true);
        try {
            await setDoc(doc(db, 'app_config', 'email'), {
                ...config,
                updatedAt: Timestamp.now(),
                updatedBy: user?.uid,
            });
            setSaved(true);
            setTimeout(() => setSaved(false), 3000);
        } catch (err) {
            console.error('Error saving email config:', err);
        }
        setSaving(false);
    };

    // Generate the email HTML preview
    const generateEmailPreview = (lang: 'fr' | 'en') => {
        const t = {
            fr: {
                greeting: 'Bonjour',
                welcomeTitle: 'Bienvenue sur CalX ! 🎉',
                welcomeText: 'Merci de nous avoir rejoint. Vous êtes maintenant prêt à transformer votre nutrition grâce à l\'intelligence artificielle.',
                ctaButton: 'Ouvrir CalX',
                features: 'Ce que vous pouvez faire :',
                feature1: '📸 Scanner vos repas avec l\'IA',
                feature2: '📊 Suivre vos macros en temps réel',
                feature3: '🤖 Parler à votre Coach IA',
                feature4: '👥 Rejoindre des Squads motivants',
                contactTitle: 'Besoin d\'aide ?',
                contactText: 'Notre équipe est là pour vous.',
                footer: config.footerFr,
                unsubscribe: 'Se désabonner',
            },
            en: {
                greeting: 'Hello',
                welcomeTitle: 'Welcome to CalX! 🎉',
                welcomeText: 'Thank you for joining us. You\'re now ready to transform your nutrition with artificial intelligence.',
                ctaButton: 'Open CalX',
                features: 'What you can do:',
                feature1: '📸 Scan your meals with AI',
                feature2: '📊 Track your macros in real time',
                feature3: '🤖 Talk to your AI Coach',
                feature4: '👥 Join motivating Squads',
                contactTitle: 'Need help?',
                contactText: 'Our team is here for you.',
                footer: config.footerEn,
                unsubscribe: 'Unsubscribe',
            },
        }[lang];

        return `
<!DOCTYPE html>
<html lang="${lang}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${t.welcomeTitle}</title>
  <!--[if mso]><noscript><xml><o:OfficeDocumentSettings><o:PixelsPerInch>96</o:PixelsPerInch></o:OfficeDocumentSettings></xml></noscript><![endif]-->
</head>
<body style="margin:0;padding:0;background-color:#0D0D0D;font-family:'Inter','Helvetica Neue',Arial,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#0D0D0D;">
    <tr>
      <td align="center" style="padding:40px 16px;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;">

          <!-- Logo -->
          <tr>
            <td align="center" style="padding-bottom:32px;">
              <table role="presentation" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="background:linear-gradient(135deg,#D4A843,#F5D380);-webkit-background-clip:text;-webkit-text-fill-color:transparent;font-size:36px;font-weight:900;letter-spacing:-1px;">
                    CalX
                  </td>
                </tr>
              </table>
              <!-- Fallback for email clients that don't support gradient text -->
              <!--[if mso]>
              <h1 style="color:#D4A843;font-size:36px;font-weight:900;margin:0;">CalX</h1>
              <![endif]-->
            </td>
          </tr>

          <!-- Main Card -->
          <tr>
            <td style="background-color:#1A1A2E;border-radius:20px;border:1px solid #2A2A4A;overflow:hidden;">

              <!-- Gold accent bar -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="height:4px;background:linear-gradient(90deg,#D4A843,#F5D380,#D4A843);"></td>
                </tr>
              </table>

              <!-- Content -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="padding:40px 32px;">

                    <!-- Greeting -->
                    <p style="color:#B0B0B0;font-size:14px;margin:0 0 8px 0;">${t.greeting},</p>

                    <!-- Title -->
                    <h1 style="color:#F5F5F5;font-size:28px;font-weight:800;margin:0 0 16px 0;line-height:1.2;">
                      ${t.welcomeTitle}
                    </h1>

                    <!-- Description -->
                    <p style="color:#B0B0B0;font-size:15px;line-height:1.7;margin:0 0 32px 0;">
                      ${t.welcomeText}
                    </p>

                    <!-- CTA Button -->
                    <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 auto 32px auto;">
                      <tr>
                        <td style="background:linear-gradient(135deg,#39FF14,#CCFF00);border-radius:14px;padding:14px 40px;">
                          <a href="${config.websiteUrl}" style="color:#0D0D0D;text-decoration:none;font-size:16px;font-weight:700;display:block;">
                            ${t.ctaButton}
                          </a>
                        </td>
                      </tr>
                    </table>

                    <!-- Divider -->
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="border-top:1px solid #2A2A4A;padding-top:24px;">
                          <p style="color:#F5F5F5;font-size:16px;font-weight:700;margin:0 0 16px 0;">
                            ${t.features}
                          </p>
                        </td>
                      </tr>
                    </table>

                    <!-- Features List -->
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                      ${[t.feature1, t.feature2, t.feature3, t.feature4].map(f => `
                      <tr>
                        <td style="padding:10px 16px;background-color:#16213E;border-radius:12px;margin-bottom:8px;">
                          <p style="color:#F5F5F5;font-size:14px;margin:0;">${f}</p>
                        </td>
                      </tr>
                      <tr><td style="height:8px;"></td></tr>
                      `).join('')}
                    </table>

                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Contact Section -->
          <tr>
            <td style="padding-top:24px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#1A1A2E;border-radius:16px;border:1px solid #2A2A4A;">
                <tr>
                  <td style="padding:24px 32px;">
                    <p style="color:#D4A843;font-size:14px;font-weight:700;margin:0 0 12px 0;">
                      ${t.contactTitle}
                    </p>
                    <p style="color:#B0B0B0;font-size:13px;margin:0 0 16px 0;">${t.contactText}</p>
                    <table role="presentation" cellpadding="0" cellspacing="0">
                      ${config.supportEmail ? `
                      <tr>
                        <td style="padding:4px 0;">
                          <a href="mailto:${config.supportEmail}" style="color:#39FF14;font-size:13px;text-decoration:none;">
                            ✉️ ${config.supportEmail}
                          </a>
                        </td>
                      </tr>` : ''}
                      ${config.phone ? `
                      <tr>
                        <td style="padding:4px 0;">
                          <a href="tel:${config.phone}" style="color:#39FF14;font-size:13px;text-decoration:none;">
                            📞 ${config.phone}
                          </a>
                        </td>
                      </tr>` : ''}
                      ${config.address ? `
                      <tr>
                        <td style="padding:4px 0;">
                          <span style="color:#B0B0B0;font-size:13px;">📍 ${config.address}</span>
                        </td>
                      </tr>` : ''}
                      ${config.websiteUrl ? `
                      <tr>
                        <td style="padding:4px 0;">
                          <a href="${config.websiteUrl}" style="color:#39FF14;font-size:13px;text-decoration:none;">
                            🌐 ${config.websiteUrl}
                          </a>
                        </td>
                      </tr>` : ''}
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:32px 0 0 0;text-align:center;">
              <p style="color:#6C6C6C;font-size:11px;margin:0 0 8px 0;">
                ${t.footer}
              </p>
              <a href="#" style="color:#6C6C6C;font-size:11px;text-decoration:underline;">
                ${t.unsubscribe}
              </a>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
    };

    if (loading) {
        return (
            <RoleGuard module="email">
                <div className="flex items-center justify-center py-20">
                    <div className="w-8 h-8 border-2 border-gold-400 border-t-transparent rounded-full animate-spin" />
                </div>
            </RoleGuard>
        );
    }

    return (
        <RoleGuard module="email">
            <div>
                <div className="mb-8">
                    <h1 className="text-2xl font-bold text-calx-text flex items-center gap-3">
                        <Mail className="text-gold-400" size={28} />
                        Configuration Email
                    </h1>
                    <p className="text-calx-text-secondary mt-1">Personnalisez les informations des emails transactionnels</p>
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                    {/* ── Configuration Form ─────────────────────────── */}
                    <div className="space-y-6">

                        {/* Company Information */}
                        <div className="bg-calx-surface/50 border border-calx-surface rounded-xl p-6">
                            <h3 className="text-base font-semibold text-calx-text mb-4 flex items-center gap-2">
                                <Building2 size={16} className="text-gold-400" />
                                Informations de l&apos;entreprise
                            </h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs text-calx-text-secondary mb-1.5">Nom de l&apos;entreprise</label>
                                    <input
                                        value={config.companyName}
                                        onChange={(e) => setConfig({ ...config, companyName: e.target.value })}
                                        placeholder="CalX"
                                        className="w-full px-4 py-2.5 bg-calx-card/50 border border-calx-surface-variant rounded-xl text-calx-text text-sm placeholder-calx-text-muted focus:outline-none focus:ring-2 focus:ring-gold-400/40 transition-all"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs text-calx-text-secondary mb-1.5">URL du site web</label>
                                    <div className="relative">
                                        <Globe size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-calx-text-muted" />
                                        <input
                                            value={config.websiteUrl}
                                            onChange={(e) => setConfig({ ...config, websiteUrl: e.target.value })}
                                            placeholder="https://calx.com"
                                            className="w-full pl-9 pr-4 py-2.5 bg-calx-card/50 border border-calx-surface-variant rounded-xl text-calx-text text-sm placeholder-calx-text-muted focus:outline-none focus:ring-2 focus:ring-gold-400/40 transition-all"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Contact Information */}
                        <div className="bg-calx-surface/50 border border-calx-surface rounded-xl p-6">
                            <h3 className="text-base font-semibold text-calx-text mb-4 flex items-center gap-2">
                                <Phone size={16} className="text-gold-400" />
                                Informations de contact
                            </h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                                <div>
                                    <label className="block text-xs text-calx-text-secondary mb-1.5">Adresse</label>
                                    <div className="relative">
                                        <MapPin size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-calx-text-muted" />
                                        <input
                                            value={config.address}
                                            onChange={(e) => setConfig({ ...config, address: e.target.value })}
                                            placeholder="123 Rue de l'Innovation"
                                            className="w-full pl-9 pr-4 py-2.5 bg-calx-card/50 border border-calx-surface-variant rounded-xl text-calx-text text-sm placeholder-calx-text-muted focus:outline-none focus:ring-2 focus:ring-gold-400/40 transition-all"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs text-calx-text-secondary mb-1.5">Téléphone</label>
                                    <div className="relative">
                                        <Phone size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-calx-text-muted" />
                                        <input
                                            value={config.phone}
                                            onChange={(e) => setConfig({ ...config, phone: e.target.value })}
                                            placeholder="+33 1 23 45 67 89"
                                            className="w-full pl-9 pr-4 py-2.5 bg-calx-card/50 border border-calx-surface-variant rounded-xl text-calx-text text-sm placeholder-calx-text-muted focus:outline-none focus:ring-2 focus:ring-gold-400/40 transition-all"
                                        />
                                    </div>
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs text-calx-text-secondary mb-1.5">Email de support</label>
                                <div className="relative">
                                    <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-calx-text-muted" />
                                    <input
                                        value={config.supportEmail}
                                        onChange={(e) => setConfig({ ...config, supportEmail: e.target.value })}
                                        placeholder="support@calx.com"
                                        className="w-full pl-9 pr-4 py-2.5 bg-calx-card/50 border border-calx-surface-variant rounded-xl text-calx-text text-sm placeholder-calx-text-muted focus:outline-none focus:ring-2 focus:ring-gold-400/40 transition-all"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Footer Text */}
                        <div className="bg-calx-surface/50 border border-calx-surface rounded-xl p-6">
                            <h3 className="text-base font-semibold text-calx-text mb-4">Texte du pied de page</h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs text-calx-text-secondary mb-1.5">Footer (Français)</label>
                                    <input
                                        value={config.footerFr}
                                        onChange={(e) => setConfig({ ...config, footerFr: e.target.value })}
                                        placeholder="© 2025-2026 CalX. Tous droits réservés."
                                        className="w-full px-4 py-2.5 bg-calx-card/50 border border-calx-surface-variant rounded-xl text-calx-text text-sm placeholder-calx-text-muted focus:outline-none focus:ring-2 focus:ring-gold-400/40 transition-all"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs text-calx-text-secondary mb-1.5">Footer (English)</label>
                                    <input
                                        value={config.footerEn}
                                        onChange={(e) => setConfig({ ...config, footerEn: e.target.value })}
                                        placeholder="© 2025-2026 CalX. All rights reserved."
                                        className="w-full px-4 py-2.5 bg-calx-card/50 border border-calx-surface-variant rounded-xl text-calx-text text-sm placeholder-calx-text-muted focus:outline-none focus:ring-2 focus:ring-gold-400/40 transition-all"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-3">
                            <button
                                onClick={handleSave}
                                disabled={saving}
                                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-gold-400 to-gold-600 text-black font-bold rounded-xl hover:shadow-lg hover:shadow-gold-400/25 transition-all disabled:opacity-50"
                            >
                                <Save size={16} />
                                {saving ? 'Enregistrement...' : saved ? '✅ Enregistré !' : 'Enregistrer la configuration'}
                            </button>
                            <button
                                onClick={() => setShowPreview(!showPreview)}
                                className="flex items-center gap-2 px-5 py-3 border border-calx-surface-variant text-calx-text font-medium rounded-xl hover:bg-calx-card/50 transition-all"
                            >
                                {showPreview ? <EyeOff size={16} /> : <Eye size={16} />}
                                {showPreview ? 'Masquer' : 'Prévisualiser'}
                            </button>
                        </div>
                    </div>

                    {/* ── Email Preview ──────────────────────────────── */}
                    <div className={`${showPreview ? 'block' : 'hidden xl:block'}`}>
                        <div className="sticky top-6">
                            <div className="flex items-center justify-between mb-3">
                                <h3 className="text-sm font-medium text-calx-text-secondary">Prévisualisation</h3>
                                <div className="flex gap-1">
                                    <button
                                        onClick={() => setPreviewLang('fr')}
                                        className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${previewLang === 'fr' ? 'bg-gold-400/10 text-gold-400 border border-gold-400/30' : 'text-calx-text-secondary hover:text-calx-text border border-calx-surface-variant'
                                            }`}
                                    >
                                        🇫🇷 Français
                                    </button>
                                    <button
                                        onClick={() => setPreviewLang('en')}
                                        className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${previewLang === 'en' ? 'bg-gold-400/10 text-gold-400 border border-gold-400/30' : 'text-calx-text-secondary hover:text-calx-text border border-calx-surface-variant'
                                            }`}
                                    >
                                        🇬🇧 English
                                    </button>
                                </div>
                            </div>
                            <div className="bg-calx-surface/30 border border-calx-surface rounded-xl overflow-hidden">
                                <div className="bg-calx-card/50 px-4 py-2 border-b border-calx-surface flex items-center gap-2">
                                    <div className="flex gap-1.5">
                                        <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
                                        <div className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
                                        <div className="w-2.5 h-2.5 rounded-full bg-green-400" />
                                    </div>
                                    <span className="text-[10px] text-calx-text-muted ml-2">Email Preview — {previewLang === 'fr' ? 'Français' : 'English'}</span>
                                </div>
                                <iframe
                                    srcDoc={generateEmailPreview(previewLang)}
                                    title="Email Preview"
                                    className="w-full"
                                    style={{ height: '700px', border: 'none' }}
                                    sandbox="allow-same-origin"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </RoleGuard>
    );
}
