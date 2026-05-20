// ──────────────────────────────────────────────────────────────
// RBAC — Role-Based Access Control
// ──────────────────────────────────────────────────────────────

export type UserRole = 'super_admin' | 'admin' | 'comptable' | 'technicien';

export interface CustomClaims {
    role?: UserRole;
}

// ── Permissions per module ──────────────────────────────────
export type Module =
    | 'dashboard'
    | 'users'
    | 'roles'
    | 'finance'
    | 'pricing'
    | 'moderation'
    | 'support'
    | 'email';

const PERMISSIONS: Record<UserRole, Module[]> = {
    super_admin: ['dashboard', 'users', 'roles', 'finance', 'pricing', 'moderation', 'support', 'email'],
    admin: ['dashboard', 'users', 'moderation', 'support'],
    comptable: ['dashboard', 'finance'],
    technicien: ['dashboard', 'users', 'moderation'],
};

// ── Helpers ──────────────────────────────────────────────────

/** Check if a role has access to a given module. */
export function hasAccess(role: UserRole | undefined, module: Module): boolean {
    if (!role) return false;
    return PERMISSIONS[role]?.includes(module) ?? false;
}

/** Get all accessible modules for a role. */
export function getAccessibleModules(role: UserRole | undefined): Module[] {
    if (!role) return [];
    return PERMISSIONS[role] ?? [];
}

/** Check if a user can write (modify) in the finance module. */
export function canWriteFinance(role: UserRole | undefined): boolean {
    return role === 'super_admin';
}

/** Check if a user can manage roles. */
export function canManageRoles(role: UserRole | undefined): boolean {
    return role === 'super_admin';
}

/** Human-readable role labels (French). */
export const ROLE_LABELS: Record<UserRole, string> = {
    super_admin: 'Super Admin',
    admin: 'Administrateur',
    comptable: 'Comptable',
    technicien: 'Technicien',
};

/** All available roles for assignment. */
export const ALL_ROLES: UserRole[] = ['admin', 'comptable', 'technicien'];

/** Super admin email (hardcoded for security). */
export const SUPER_ADMIN_EMAIL = 'joelbokomo@gmail.com';
