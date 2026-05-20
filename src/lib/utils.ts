/** Format a number as compact (1k, 1.2M, etc.) */
export function formatCompact(n: number): string {
    if (n < 1000) return n.toString();
    if (n < 1_000_000) {
        const k = n / 1000;
        return k >= 10 ? `${Math.round(k)}k` : `${k.toFixed(1)}k`;
    }
    const m = n / 1_000_000;
    return m >= 10 ? `${Math.round(m)}M` : `${m.toFixed(1)}M`;
}

/** Format currency in EUR */
export function formatEUR(cents: number): string {
    return new Intl.NumberFormat('fr-FR', {
        style: 'currency',
        currency: 'EUR',
    }).format(cents / 100);
}

/** Format a Firestore Timestamp or Date to a readable French date */
export function formatDate(date: Date | { toDate: () => Date }): string {
    const d = 'toDate' in date ? date.toDate() : date;
    return new Intl.DateTimeFormat('fr-FR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    }).format(d);
}

/** Format a relative time (e.g., "il y a 2 min") */
export function formatRelativeTime(date: Date | { toDate: () => Date }): string {
    const d = 'toDate' in date ? date.toDate() : date;
    const diff = Date.now() - d.getTime();
    const minutes = Math.floor(diff / 60_000);

    if (minutes < 1) return "À l'instant";
    if (minutes < 60) return `Il y a ${minutes} min`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `Il y a ${hours}h`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `Il y a ${days}j`;

    return formatDate(d);
}

/** Truncate text with ellipsis */
export function truncate(text: string, maxLength: number): string {
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength - 1) + '…';
}
