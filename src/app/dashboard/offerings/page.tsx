'use client';

import RoleGuard from '@/components/guards/RoleGuard';
import { useState, useEffect } from 'react';
import {
    collection, doc, onSnapshot, setDoc, deleteDoc, Timestamp,
} from 'firebase/firestore';
import { httpsCallable } from 'firebase/functions';
import { db, functions } from '@/lib/firebase/client';
import { useAuth } from '@/lib/auth/context';
import {
    Package, Save, AlertCircle, Plus, Trash2, Eye, EyeOff,
    Star, Globe, Tag, Settings2, CheckCircle2, XCircle, Loader2,
} from 'lucide-react';

// ─────────────────────────────────────────────────────────────────
// Types — must mirror lib/core/models/subscription_offering.dart
// ─────────────────────────────────────────────────────────────────

interface OfferingDoc {
    product_id: string;
    marketing_title: Record<string, string>;
    marketing_description: Record<string, string>;
    is_visible: boolean;
    display_order: number;
    badge?: string;
    highlighted?: boolean;
    accent_color_hex?: string;
    compare_at_product_id?: string;
    trial_text_override?: string;
    target_countries?: string[];
    target_user_segments?: string[];
    min_app_version?: string;
    experiment_id?: string;
    variant?: string;
    updated_at?: Timestamp;
    updated_by?: string;
}

const COLLECTION = 'subscriptions_config';
const SUPPORTED_LANGS = ['fr', 'en', 'es', 'de', 'it', 'pt', 'ru', 'zh', 'ja', 'hi', 'ko', 'ar'];

const NEW_TEMPLATE = (id: string): OfferingDoc => ({
    product_id: id,
    marketing_title: { fr: '', en: '', default: '' },
    marketing_description: { fr: '', en: '', default: '' },
    is_visible: true,
    display_order: 100,
    highlighted: false,
});

// ─────────────────────────────────────────────────────────────────
// RevenueCat product validator (Cloud Function)
// ─────────────────────────────────────────────────────────────────

interface ValidateResult {
    exists: boolean;
    message: string;
    storeProduct?: { identifier: string; title?: string; type?: string };
}

const validateProductInRevenueCat = async (productId: string): Promise<ValidateResult & { skipped?: boolean }> => {
    try {
        const fn = httpsCallable<{ productId: string }, ValidateResult>(
            functions, 'validateSubscriptionOffering'
        );
        const { data } = await fn({ productId });
        return data;
    } catch (e) {
        // Cloud Function unreachable or auth/permission error → fail-open so the
        // admin is never blocked, but flag it so the UI can warn.
        console.warn('Validation function unavailable:', e);
        const msg = e instanceof Error ? e.message : 'unknown error';
        return {
            exists: true,
            skipped: true,
            message: `Validation indisponible (${msg}). L'écriture continue sans vérification.`,
        };
    }
};

// ─────────────────────────────────────────────────────────────────
// Page
// ─────────────────────────────────────────────────────────────────

export default function OfferingsPage() {
    const { user } = useAuth();
    const [offerings, setOfferings] = useState<OfferingDoc[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [draft, setDraft] = useState<OfferingDoc | null>(null);
    const [saving, setSaving] = useState(false);
    const [savedId, setSavedId] = useState<string | null>(null);
    const [validation, setValidation] = useState<ValidationState>({ state: 'idle' });

    useEffect(() => {
        const unsub = onSnapshot(collection(db, COLLECTION), (snap) => {
            const list: OfferingDoc[] = [];
            snap.forEach((d) => list.push({ ...(d.data() as OfferingDoc), product_id: d.data().product_id ?? d.id }));
            list.sort((a, b) => (a.display_order ?? 999) - (b.display_order ?? 999));
            setOfferings(list);
            setLoading(false);
        }, (err) => {
            console.error('subscriptions_config snapshot error', err);
            setLoading(false);
        });
        return () => unsub();
    }, []);

    const startEdit = (o: OfferingDoc) => {
        setEditingId(o.product_id);
        setDraft({ ...o });
        setValidation({ state: 'idle' });
    };
    const startNew = () => {
        const id = `calx_premium_new_${Date.now()}`;
        setEditingId(id);
        setDraft(NEW_TEMPLATE(id));
        setValidation({ state: 'idle' });
    };
    const cancelEdit = () => {
        setEditingId(null);
        setDraft(null);
        setValidation({ state: 'idle' });
    };

    /** Save flow: validate product_id against RevenueCat first, then write to Firestore. */
    const saveDraft = async (opts?: { skipValidation?: boolean }) => {
        if (!draft) return;
        if (!draft.product_id.trim()) {
            alert('Product ID requis');
            return;
        }
        setSaving(true);

        // Step 1 — Validate product_id exists in RevenueCat (unless skipped)
        if (!opts?.skipValidation) {
            setValidation({ state: 'checking' });
            const result = await validateProductInRevenueCat(draft.product_id.trim());
            if (!result.exists) {
                setValidation({ state: 'failed', message: result.message });
                setSaving(false);
                return; // BLOCK save — admin must confirm via "Force save"
            }
            // Show "skipped" banner briefly if the function was unreachable.
            if (result.skipped) {
                setValidation({ state: 'skipped', message: result.message });
                await new Promise((r) => setTimeout(r, 1500));
            } else {
                setValidation({ state: 'ok', message: result.message });
            }
        }

        // Step 2 — Write to Firestore
        try {
            await setDoc(doc(db, COLLECTION, draft.product_id), {
                ...draft,
                updated_at: Timestamp.now(),
                updated_by: user?.email ?? user?.uid ?? 'unknown',
            }, { merge: true });
            setSavedId(draft.product_id);
            setTimeout(() => setSavedId(null), 2500);
            cancelEdit();
        } catch (err) {
            console.error('Save offering error', err);
            alert('Erreur lors de l\'enregistrement Firestore');
        }
        setSaving(false);
    };

    const remove = async (id: string) => {
        if (!confirm(`Supprimer l'offre "${id}" ? L'app n'affichera plus cette offre.`)) return;
        await deleteDoc(doc(db, COLLECTION, id));
    };

    return (
        <RoleGuard module="pricing">
            <div className="space-y-6">
                <Header onAdd={startNew} />
                <InfoBanner />

                {loading ? (
                    <p className="text-calx-text-secondary">Chargement…</p>
                ) : offerings.length === 0 ? (
                    <EmptyState onAdd={startNew} />
                ) : (
                    <div className="space-y-3">
                        {offerings.map((o) => (
                            <OfferingRow
                                key={o.product_id}
                                offering={o}
                                isEditing={editingId === o.product_id}
                                draft={editingId === o.product_id ? draft : null}
                                setDraft={setDraft}
                                onEdit={() => startEdit(o)}
                                onCancel={cancelEdit}
                                onSave={saveDraft}
                                onDelete={() => remove(o.product_id)}
                                saving={saving}
                                justSaved={savedId === o.product_id}
                                validation={validation}
                            />
                        ))}
                    </div>
                )}

                {editingId && draft && !offerings.some((o) => o.product_id === editingId) && (
                    <OfferingRow
                        offering={draft}
                        isEditing
                        draft={draft}
                        setDraft={setDraft}
                        onEdit={() => {}}
                        onCancel={cancelEdit}
                        onSave={saveDraft}
                        onDelete={() => {}}
                        saving={saving}
                        justSaved={false}
                        validation={validation}
                        isNew
                    />
                )}
            </div>
        </RoleGuard>
    );
}

// ─────────────────────────────────────────────────────────────────
// Subcomponents
// ─────────────────────────────────────────────────────────────────

function Header({ onAdd }: { onAdd: () => void }) {
    return (
        <div className="flex items-center justify-between">
            <div>
                <h1 className="text-2xl font-bold text-calx-text flex items-center gap-3">
                    <Package className="text-gold-400" size={28} />
                    Offres d&apos;abonnement
                </h1>
                <p className="text-calx-text-secondary mt-1">
                    Marketing &amp; visibilité — les prix viennent toujours de RevenueCat
                </p>
            </div>
            <button
                onClick={onAdd}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gold-400 text-black font-semibold hover:bg-gold-300 transition-colors">
                <Plus size={18} /> Nouvelle offre
            </button>
        </div>
    );
}

function InfoBanner() {
    return (
        <div className="flex items-start gap-3 p-4 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-300 text-sm">
            <AlertCircle size={18} className="flex-shrink-0 mt-0.5" />
            <div>
                <p className="font-medium text-blue-200 mb-1">Architecture hybride</p>
                <p>
                    Cette page contrôle uniquement le <strong>marketing</strong> (titre, description, ordre, visibilité, badge).
                    Les <strong>prix</strong>, <strong>devises</strong> et <strong>périodes d&apos;essai</strong> restent gérés
                    dans RevenueCat. L&apos;app mobile lit cette config en temps réel via la collection{' '}
                    <code className="bg-blue-500/20 px-1 rounded">subscriptions_config</code> et la fusionne avec
                    les <code className="bg-blue-500/20 px-1 rounded">offerings</code> RevenueCat avant affichage.
                </p>
            </div>
        </div>
    );
}

function EmptyState({ onAdd }: { onAdd: () => void }) {
    return (
        <div className="text-center py-16 border border-dashed border-calx-border rounded-2xl">
            <Package size={48} className="mx-auto text-calx-text-secondary mb-4" />
            <h2 className="text-lg font-semibold text-calx-text mb-2">Aucune offre configurée</h2>
            <p className="text-calx-text-secondary mb-6 max-w-md mx-auto">
                L&apos;app utilisera ses valeurs par défaut codées en dur. Crée une offre pour
                personnaliser le marketing.
            </p>
            <button
                onClick={onAdd}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gold-400 text-black font-semibold hover:bg-gold-300 transition-colors">
                <Plus size={18} /> Créer la première offre
            </button>
        </div>
    );
}

type ValidationState = { state: 'idle' | 'checking' | 'ok' | 'failed' | 'skipped'; message?: string };

interface RowProps {
    offering: OfferingDoc;
    isEditing: boolean;
    draft: OfferingDoc | null;
    setDraft: (d: OfferingDoc | null) => void;
    onEdit: () => void;
    onCancel: () => void;
    onSave: (opts?: { skipValidation?: boolean }) => void;
    onDelete: () => void;
    saving: boolean;
    justSaved: boolean;
    validation: ValidationState;
    isNew?: boolean;
}

function OfferingRow({
    offering, isEditing, draft, setDraft, onEdit, onCancel, onSave, onDelete, saving, justSaved, validation, isNew,
}: RowProps) {
    if (!isEditing) {
        return <OfferingViewRow offering={offering} onEdit={onEdit} onDelete={onDelete} justSaved={justSaved} />;
    }
    if (!draft) return null;
    return (
        <OfferingEditForm
            draft={draft} setDraft={setDraft} onCancel={onCancel}
            onSave={onSave} saving={saving} validation={validation} isNew={isNew}
        />
    );
}

function OfferingViewRow({
    offering: o, onEdit, onDelete, justSaved,
}: { offering: OfferingDoc; onEdit: () => void; onDelete: () => void; justSaved: boolean }) {
    const title = o.marketing_title?.fr || o.marketing_title?.en || o.marketing_title?.default || o.product_id;
    const description = o.marketing_description?.fr || o.marketing_description?.en || o.marketing_description?.default || '';

    return (
        <div className={`p-5 rounded-2xl border transition-colors ${
            justSaved ? 'border-green-500/60 bg-green-500/5' :
            o.highlighted ? 'border-gold-400/40 bg-gold-400/5' : 'border-calx-border bg-calx-card'
        }`}>
            <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className="text-xs font-mono text-calx-text-secondary">{o.product_id}</span>
                        {o.badge && (
                            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-gold-400/20 text-gold-300">
                                {o.badge}
                            </span>
                        )}
                        {o.highlighted && <Star size={14} className="text-gold-400 fill-gold-400" />}
                        {!o.is_visible && (
                            <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-red-500/20 text-red-300 inline-flex items-center gap-1">
                                <EyeOff size={12} /> Caché
                            </span>
                        )}
                        {o.target_countries && o.target_countries.length > 0 && (
                            <span className="text-xs px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 inline-flex items-center gap-1">
                                <Globe size={12} /> {o.target_countries.join(', ')}
                            </span>
                        )}
                        {o.experiment_id && (
                            <span className="text-xs px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300">
                                A/B {o.experiment_id}{o.variant ? ` · ${o.variant}` : ''}
                            </span>
                        )}
                    </div>
                    <h3 className="text-lg font-semibold text-calx-text">{title}</h3>
                    <p className="text-sm text-calx-text-secondary mt-1">{description}</p>
                    <p className="text-xs text-calx-text-secondary mt-2">
                        Ordre : <strong className="text-calx-text">{o.display_order}</strong>
                        {o.compare_at_product_id && <> · Comparé à <code>{o.compare_at_product_id}</code></>}
                    </p>
                </div>
                <div className="flex gap-2 flex-shrink-0">
                    <button onClick={onEdit} className="p-2 rounded-lg bg-calx-card hover:bg-calx-card-hover border border-calx-border text-calx-text">
                        <Settings2 size={16} />
                    </button>
                    <button onClick={onDelete} className="p-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400">
                        <Trash2 size={16} />
                    </button>
                </div>
            </div>
        </div>
    );
}

function OfferingEditForm({
    draft, setDraft, onCancel, onSave, saving, validation, isNew,
}: {
    draft: OfferingDoc; setDraft: (d: OfferingDoc) => void;
    onCancel: () => void; onSave: (opts?: { skipValidation?: boolean }) => void;
    saving: boolean; validation: ValidationState; isNew?: boolean;
}) {
    const [activeLang, setActiveLang] = useState('fr');

    const update = (patch: Partial<OfferingDoc>) => setDraft({ ...draft, ...patch });
    const updateI18n = (field: 'marketing_title' | 'marketing_description', lang: string, value: string) =>
        setDraft({ ...draft, [field]: { ...(draft[field] ?? {}), [lang]: value } });

    return (
        <div className="p-6 rounded-2xl border border-gold-400/30 bg-calx-card space-y-5">
            <div className="flex items-center justify-between gap-3 flex-wrap">
                <h3 className="text-lg font-semibold text-calx-text">
                    {isNew ? 'Nouvelle offre' : 'Modifier l\'offre'}
                </h3>
                <div className="flex gap-2 items-center">
                    {validation.state === 'failed' && (
                        <button
                            onClick={() => onSave({ skipValidation: true })}
                            disabled={saving}
                            className="inline-flex items-center gap-2 px-3 py-2 rounded-xl border border-orange-500/40 bg-orange-500/10 text-orange-300 text-sm hover:bg-orange-500/20 disabled:opacity-50">
                            Forcer l&apos;enregistrement
                        </button>
                    )}
                    <button onClick={onCancel} className="px-4 py-2 rounded-xl border border-calx-border text-calx-text hover:bg-calx-card-hover">
                        Annuler
                    </button>
                    <button onClick={() => onSave()} disabled={saving} className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gold-400 text-black font-semibold hover:bg-gold-300 disabled:opacity-50">
                        {validation.state === 'checking'
                            ? <><Loader2 size={16} className="animate-spin"/> Validation…</>
                            : saving
                                ? <><Loader2 size={16} className="animate-spin"/> Enregistrement…</>
                                : <><Save size={16}/> Valider et enregistrer</>}
                    </button>
                </div>
            </div>

            {/* Validation banner */}
            {validation.state !== 'idle' && (
                <ValidationBanner validation={validation} productId={draft.product_id} />
            )}

            {/* Product ID */}
            <Field label="Product ID (RevenueCat)" hint="Doit correspondre exactement à un produit configuré dans RevenueCat">
                <input
                    type="text"
                    value={draft.product_id}
                    onChange={(e) => update({ product_id: e.target.value.trim() })}
                    placeholder="calx_premium_monthly"
                    className="w-full px-3 py-2 rounded-lg bg-calx-bg border border-calx-border text-calx-text font-mono text-sm"
                    disabled={!isNew}
                />
            </Field>

            {/* I18n title + description */}
            <div className="space-y-3">
                <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-medium text-calx-text">Langue d&apos;édition :</span>
                    {SUPPORTED_LANGS.map((lang) => (
                        <button
                            key={lang}
                            onClick={() => setActiveLang(lang)}
                            className={`text-xs px-2 py-1 rounded-md font-mono ${
                                activeLang === lang
                                    ? 'bg-gold-400 text-black'
                                    : 'bg-calx-bg border border-calx-border text-calx-text-secondary hover:text-calx-text'
                            }`}>
                            {lang}
                        </button>
                    ))}
                </div>

                <Field label={`Titre marketing (${activeLang})`}>
                    <input
                        type="text"
                        value={draft.marketing_title[activeLang] ?? ''}
                        onChange={(e) => updateI18n('marketing_title', activeLang, e.target.value)}
                        placeholder="Pass Illimité"
                        className="w-full px-3 py-2 rounded-lg bg-calx-bg border border-calx-border text-calx-text"
                    />
                </Field>
                <Field label={`Description marketing (${activeLang})`}>
                    <textarea
                        value={draft.marketing_description[activeLang] ?? ''}
                        onChange={(e) => updateI18n('marketing_description', activeLang, e.target.value)}
                        rows={2}
                        placeholder="Accès à toutes les fonctions IA de CalX"
                        className="w-full px-3 py-2 rounded-lg bg-calx-bg border border-calx-border text-calx-text resize-none"
                    />
                </Field>
            </div>

            {/* Display + visibility */}
            <div className="grid grid-cols-2 gap-4">
                <Field label="Ordre d'affichage" hint="Plus petit = plus haut">
                    <input
                        type="number"
                        value={draft.display_order}
                        onChange={(e) => update({ display_order: parseInt(e.target.value || '0', 10) })}
                        className="w-full px-3 py-2 rounded-lg bg-calx-bg border border-calx-border text-calx-text"
                    />
                </Field>
                <Field label="Badge (optionnel)" hint="Ex: BEST VALUE, ÉCONOMIE 30%">
                    <input
                        type="text"
                        value={draft.badge ?? ''}
                        onChange={(e) => update({ badge: e.target.value || undefined })}
                        placeholder="BEST VALUE"
                        className="w-full px-3 py-2 rounded-lg bg-calx-bg border border-calx-border text-calx-text"
                    />
                </Field>
            </div>

            <div className="flex flex-wrap gap-3">
                <Toggle
                    label={draft.is_visible ? 'Visible' : 'Cachée'}
                    icon={draft.is_visible ? <Eye size={14}/> : <EyeOff size={14}/>}
                    checked={draft.is_visible}
                    onChange={(v) => update({ is_visible: v })}
                />
                <Toggle
                    label="Mise en avant"
                    icon={<Star size={14}/>}
                    checked={draft.highlighted ?? false}
                    onChange={(v) => update({ highlighted: v })}
                />
            </div>

            {/* Advanced */}
            <details className="rounded-xl border border-calx-border">
                <summary className="px-4 py-3 cursor-pointer text-sm font-medium text-calx-text inline-flex items-center gap-2 list-none">
                    <Tag size={14}/> Ciblage avancé (A/B testing &amp; segmentation)
                </summary>
                <div className="p-4 space-y-3 border-t border-calx-border">
                    <Field label="Pays cibles (codes ISO séparés par virgule)">
                        <input
                            type="text"
                            value={(draft.target_countries ?? []).join(', ')}
                            onChange={(e) => update({ target_countries: e.target.value.split(',').map((s) => s.trim().toUpperCase()).filter(Boolean) })}
                            placeholder="FR, CA, BE"
                            className="w-full px-3 py-2 rounded-lg bg-calx-bg border border-calx-border text-calx-text font-mono text-sm"
                        />
                    </Field>
                    <Field label="Segments d'utilisateurs cibles">
                        <input
                            type="text"
                            value={(draft.target_user_segments ?? []).join(', ')}
                            onChange={(e) => update({ target_user_segments: e.target.value.split(',').map((s) => s.trim()).filter(Boolean) })}
                            placeholder="new_user, returning, lapsed"
                            className="w-full px-3 py-2 rounded-lg bg-calx-bg border border-calx-border text-calx-text font-mono text-sm"
                        />
                    </Field>
                    <div className="grid grid-cols-2 gap-3">
                        <Field label="Version min. de l'app">
                            <input type="text" value={draft.min_app_version ?? ''}
                                onChange={(e) => update({ min_app_version: e.target.value || undefined })}
                                placeholder="1.2.0"
                                className="w-full px-3 py-2 rounded-lg bg-calx-bg border border-calx-border text-calx-text font-mono text-sm"
                            />
                        </Field>
                        <Field label="Compare-at product ID">
                            <input type="text" value={draft.compare_at_product_id ?? ''}
                                onChange={(e) => update({ compare_at_product_id: e.target.value || undefined })}
                                placeholder="calx_premium_monthly"
                                className="w-full px-3 py-2 rounded-lg bg-calx-bg border border-calx-border text-calx-text font-mono text-sm"
                            />
                        </Field>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <Field label="Experiment ID">
                            <input type="text" value={draft.experiment_id ?? ''}
                                onChange={(e) => update({ experiment_id: e.target.value || undefined })}
                                placeholder="paywall_v2_test"
                                className="w-full px-3 py-2 rounded-lg bg-calx-bg border border-calx-border text-calx-text font-mono text-sm"
                            />
                        </Field>
                        <Field label="Variant">
                            <input type="text" value={draft.variant ?? ''}
                                onChange={(e) => update({ variant: e.target.value || undefined })}
                                placeholder="control / B"
                                className="w-full px-3 py-2 rounded-lg bg-calx-bg border border-calx-border text-calx-text font-mono text-sm"
                            />
                        </Field>
                    </div>
                </div>
            </details>
        </div>
    );
}

function ValidationBanner({
    validation, productId,
}: { validation: ValidationState; productId: string }) {
    if (validation.state === 'checking') {
        return (
            <div className="flex items-center gap-3 p-3 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-300 text-sm">
                <Loader2 size={16} className="animate-spin flex-shrink-0"/>
                <span>Vérification du <code className="bg-blue-500/20 px-1 rounded">{productId}</code> auprès de RevenueCat…</span>
            </div>
        );
    }
    if (validation.state === 'ok') {
        return (
            <div className="flex items-center gap-3 p-3 rounded-xl bg-green-500/10 border border-green-500/20 text-green-300 text-sm">
                <CheckCircle2 size={16} className="flex-shrink-0"/>
                <span>Product ID validé dans RevenueCat ✓</span>
            </div>
        );
    }
    if (validation.state === 'skipped') {
        return (
            <div className="flex items-start gap-3 p-3 rounded-xl bg-yellow-500/10 border border-yellow-500/20 text-yellow-300 text-sm">
                <AlertCircle size={16} className="flex-shrink-0 mt-0.5"/>
                <div>
                    <p className="font-medium text-yellow-200">Validation skippée</p>
                    <p className="mt-0.5 text-yellow-300/80">{validation.message}</p>
                </div>
            </div>
        );
    }
    if (validation.state === 'failed') {
        return (
            <div className="flex items-start gap-3 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-sm">
                <XCircle size={16} className="flex-shrink-0 mt-0.5"/>
                <div>
                    <p className="font-medium text-red-200">Product ID introuvable dans RevenueCat</p>
                    <p className="mt-0.5 text-red-300/80">{validation.message}</p>
                    <p className="mt-1 text-xs text-red-300/60">
                        Vérifie que <code className="bg-red-500/20 px-1 rounded">{productId}</code> existe dans
                        ton dashboard RevenueCat (Product catalog → Products). Si tu es sûr du nom, utilise
                        &quot;Forcer l&apos;enregistrement&quot;.
                    </p>
                </div>
            </div>
        );
    }
    return null;
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
    return (
        <label className="block">
            <div className="text-sm font-medium text-calx-text mb-1.5">{label}</div>
            {children}
            {hint && <p className="text-xs text-calx-text-secondary mt-1">{hint}</p>}
        </label>
    );
}

function Toggle({
    label, icon, checked, onChange,
}: { label: string; icon: React.ReactNode; checked: boolean; onChange: (v: boolean) => void }) {
    return (
        <button
            type="button"
            onClick={() => onChange(!checked)}
            className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm border transition-colors ${
                checked
                    ? 'bg-gold-400/20 border-gold-400/40 text-gold-300'
                    : 'bg-calx-bg border-calx-border text-calx-text-secondary'
            }`}>
            {icon} {label}
        </button>
    );
}
