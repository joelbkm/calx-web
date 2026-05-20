'use client';

import RoleGuard from '@/components/guards/RoleGuard';
import { useState, useEffect, useRef } from 'react';
import { collection, query, orderBy, onSnapshot, doc, updateDoc, arrayUnion, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase/client';
import { useAuth } from '@/lib/auth/context';
import { formatRelativeTime } from '@/lib/utils';
import {
    MessageSquare, Send, CheckCircle, Clock, ChevronRight,
    Headphones, Search, Inbox, AlertCircle, ArrowLeft, User
} from 'lucide-react';

interface Ticket {
    id: string;
    userId: string;
    userName: string;
    userEmail: string;
    subject: string;
    messages: { sender: 'user' | 'admin'; text: string; timestamp: { toDate: () => Date } }[];
    status: 'open' | 'in_progress' | 'closed';
    createdAt: { toDate: () => Date };
}

export default function SupportPage() {
    const { user } = useAuth();
    const [tickets, setTickets] = useState<Ticket[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
    const [reply, setReply] = useState('');
    const [sending, setSending] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<'all' | 'open' | 'in_progress' | 'closed'>('all');
    const messagesEnd = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const q = query(collection(db, 'support_tickets'), orderBy('updatedAt', 'desc'));
        const unsub = onSnapshot(
            q,
            (snap) => {
                const data = snap.docs.map((d) => ({ id: d.id, ...d.data() })) as Ticket[];
                setTickets(data);
                if (selectedTicket) {
                    const updated = data.find((t) => t.id === selectedTicket.id);
                    if (updated) setSelectedTicket(updated);
                }
                setLoading(false);
            },
            (err) => {
                console.error('Support query error:', err);
                setLoading(false);
                setTickets([]);
            }
        );
        return () => unsub();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        messagesEnd.current?.scrollIntoView({ behavior: 'smooth' });
    }, [selectedTicket?.messages]);

    async function sendReply() {
        if (!reply.trim() || !selectedTicket || !user) return;
        setSending(true);
        try {
            await updateDoc(doc(db, 'support_tickets', selectedTicket.id), {
                messages: arrayUnion({
                    sender: 'admin',
                    text: reply.trim(),
                    timestamp: Timestamp.now(),
                }),
                status: 'in_progress',
                assignedTo: user.uid,
                updatedAt: Timestamp.now(),
            });
            setReply('');
        } catch (err) {
            console.error('Error sending reply:', err);
        }
        setSending(false);
    }

    async function closeTicket(ticketId: string) {
        try {
            await updateDoc(doc(db, 'support_tickets', ticketId), {
                status: 'closed',
                updatedAt: Timestamp.now(),
            });
        } catch (err) {
            console.error('Error closing ticket:', err);
        }
    }

    async function reopenTicket(ticketId: string) {
        try {
            await updateDoc(doc(db, 'support_tickets', ticketId), {
                status: 'open',
                updatedAt: Timestamp.now(),
            });
        } catch (err) {
            console.error('Error reopening ticket:', err);
        }
    }

    const statusConfig: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
        open: { label: 'Ouvert', color: 'bg-gold-400/10 text-gold-400 border-gold-400/20', icon: <AlertCircle size={10} /> },
        in_progress: { label: 'En cours', color: 'bg-blue-500/10 text-blue-400 border-blue-500/20', icon: <Clock size={10} /> },
        closed: { label: 'Fermé', color: 'bg-green-500/10 text-green-400 border-green-500/20', icon: <CheckCircle size={10} /> },
    };

    // Filter & search
    const filteredTickets = tickets.filter((t) => {
        if (statusFilter !== 'all' && t.status !== statusFilter) return false;
        if (searchQuery) {
            const q = searchQuery.toLowerCase();
            return t.userName?.toLowerCase().includes(q) || t.subject?.toLowerCase().includes(q) || t.userEmail?.toLowerCase().includes(q);
        }
        return true;
    });

    // Stats
    const openCount = tickets.filter(t => t.status === 'open').length;
    const inProgressCount = tickets.filter(t => t.status === 'in_progress').length;
    const closedCount = tickets.filter(t => t.status === 'closed').length;

    return (
        <RoleGuard module="support">
            <div>
                {/* ── Header ── */}
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-2xl font-bold text-calx-text flex items-center gap-3">
                            <Headphones className="text-gold-400" size={28} />
                            Centre de support
                        </h1>
                        <p className="text-calx-text-secondary mt-1">Gestion des tickets et conversations clients</p>
                    </div>
                </div>

                {/* ── Stats Bar ── */}
                {!loading && (
                    <div className="grid grid-cols-4 gap-4 mb-6">
                        <div className="bg-calx-surface/50 border border-calx-surface rounded-xl p-4 flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-gold-400/10 border border-gold-400/20 flex items-center justify-center">
                                <Inbox size={18} className="text-gold-400" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-calx-text">{tickets.length}</p>
                                <p className="text-xs text-calx-text-secondary">Total tickets</p>
                            </div>
                        </div>
                        <div className="bg-calx-surface/50 border border-calx-surface rounded-xl p-4 flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center">
                                <AlertCircle size={18} className="text-yellow-400" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-calx-text">{openCount}</p>
                                <p className="text-xs text-calx-text-secondary">Ouverts</p>
                            </div>
                        </div>
                        <div className="bg-calx-surface/50 border border-calx-surface rounded-xl p-4 flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                                <Clock size={18} className="text-blue-400" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-calx-text">{inProgressCount}</p>
                                <p className="text-xs text-calx-text-secondary">En cours</p>
                            </div>
                        </div>
                        <div className="bg-calx-surface/50 border border-calx-surface rounded-xl p-4 flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-green-500/10 border border-green-500/20 flex items-center justify-center">
                                <CheckCircle size={18} className="text-green-400" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-calx-text">{closedCount}</p>
                                <p className="text-xs text-calx-text-secondary">Résolus</p>
                            </div>
                        </div>
                    </div>
                )}

                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <div className="w-8 h-8 border-2 border-gold-400 border-t-transparent rounded-full animate-spin" />
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 h-[calc(100vh-320px)]">
                        {/* ── Ticket List Panel ── */}
                        <div className="bg-calx-surface/30 border border-calx-surface rounded-xl overflow-hidden flex flex-col">
                            {/* Search + Filters */}
                            <div className="p-3 border-b border-calx-surface space-y-2">
                                <div className="relative">
                                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-calx-text-muted" />
                                    <input
                                        type="text"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        placeholder="Rechercher un ticket..."
                                        className="w-full pl-9 pr-3 py-2 bg-calx-card/50 border border-calx-surface-variant rounded-lg text-calx-text text-sm placeholder-calx-text-muted focus:outline-none focus:ring-2 focus:ring-gold-400/40"
                                    />
                                </div>
                                <div className="flex gap-1">
                                    {(['all', 'open', 'in_progress', 'closed'] as const).map((s) => (
                                        <button
                                            key={s}
                                            onClick={() => setStatusFilter(s)}
                                            className={`px-2 py-1 rounded text-[11px] font-medium transition-all ${statusFilter === s
                                                ? 'bg-gold-400/10 text-gold-400 border border-gold-400/30'
                                                : 'text-calx-text-muted hover:text-calx-text-secondary border border-transparent'
                                                }`}
                                        >
                                            {s === 'all' ? 'Tous' : s === 'open' ? 'Ouverts' : s === 'in_progress' ? 'En cours' : 'Fermés'}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Ticket count */}
                            <div className="px-3 py-2 border-b border-calx-surface/50">
                                <span className="text-xs font-medium text-calx-text-muted">{filteredTickets.length} tickets</span>
                            </div>

                            {/* Ticket list */}
                            <div className="overflow-y-auto flex-1">
                                {filteredTickets.length === 0 ? (
                                    <div className="p-8 text-center">
                                        <Inbox size={32} className="mx-auto text-calx-text-muted mb-3" />
                                        <p className="text-sm text-calx-text-muted">Aucun ticket</p>
                                        <p className="text-xs text-calx-text-muted mt-1">
                                            {searchQuery ? 'Essayez un autre terme de recherche' : 'Les demandes des utilisateurs apparaîtront ici'}
                                        </p>
                                    </div>
                                ) : (
                                    filteredTickets.map((ticket) => {
                                        const cfg = statusConfig[ticket.status];
                                        const lastMsg = ticket.messages?.[ticket.messages.length - 1];
                                        return (
                                            <button
                                                key={ticket.id}
                                                onClick={() => setSelectedTicket(ticket)}
                                                className={`w-full text-left p-3 border-b border-calx-surface/50 hover:bg-calx-card/30 transition-colors ${selectedTicket?.id === ticket.id ? 'bg-calx-card/40 border-l-2 border-l-gold-400' : ''
                                                    }`}
                                            >
                                                <div className="flex items-center justify-between mb-1.5">
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-7 h-7 rounded-full bg-gold-400/10 border border-gold-400/20 flex items-center justify-center flex-shrink-0">
                                                            <User size={12} className="text-gold-400" />
                                                        </div>
                                                        <span className="text-sm font-medium text-calx-text truncate">{ticket.userName}</span>
                                                    </div>
                                                    <ChevronRight size={14} className="text-calx-text-muted flex-shrink-0" />
                                                </div>
                                                <p className="text-xs font-medium text-calx-text-secondary truncate mb-1.5 pl-9">{ticket.subject}</p>
                                                {lastMsg && (
                                                    <p className="text-[11px] text-calx-text-muted truncate mb-1.5 pl-9">
                                                        {lastMsg.sender === 'admin' ? '↩ Vous : ' : ''}{lastMsg.text}
                                                    </p>
                                                )}
                                                <div className="flex items-center justify-between pl-9">
                                                    <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium border ${cfg.color}`}>
                                                        {cfg.icon}
                                                        {cfg.label}
                                                    </span>
                                                    <span className="text-[10px] text-calx-text-muted">
                                                        {ticket.createdAt ? formatRelativeTime(ticket.createdAt) : ''}
                                                    </span>
                                                </div>
                                            </button>
                                        );
                                    })
                                )}
                            </div>
                        </div>

                        {/* ── Conversation Panel ── */}
                        <div className="lg:col-span-2 bg-calx-surface/30 border border-calx-surface rounded-xl flex flex-col overflow-hidden">
                            {selectedTicket ? (
                                <>
                                    {/* Header */}
                                    <div className="p-4 border-b border-calx-surface bg-calx-surface/20">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <button
                                                    onClick={() => setSelectedTicket(null)}
                                                    className="lg:hidden p-1.5 hover:bg-calx-card rounded-lg transition-colors"
                                                >
                                                    <ArrowLeft size={16} className="text-calx-text-secondary" />
                                                </button>
                                                <div className="w-10 h-10 rounded-full bg-gold-400/10 border border-gold-400/20 flex items-center justify-center">
                                                    <User size={18} className="text-gold-400" />
                                                </div>
                                                <div>
                                                    <h3 className="font-semibold text-calx-text text-sm">{selectedTicket.subject}</h3>
                                                    <p className="text-xs text-calx-text-secondary">{selectedTicket.userName} · {selectedTicket.userEmail}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium border ${statusConfig[selectedTicket.status].color}`}>
                                                    {statusConfig[selectedTicket.status].icon}
                                                    {statusConfig[selectedTicket.status].label}
                                                </span>
                                                {selectedTicket.status !== 'closed' ? (
                                                    <button
                                                        onClick={() => closeTicket(selectedTicket.id)}
                                                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-green-500/10 text-green-400 border border-green-500/20 rounded-lg hover:bg-green-500/20 transition-all"
                                                    >
                                                        <CheckCircle size={12} />
                                                        Fermer le ticket
                                                    </button>
                                                ) : (
                                                    <button
                                                        onClick={() => reopenTicket(selectedTicket.id)}
                                                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-gold-400/10 text-gold-400 border border-gold-400/20 rounded-lg hover:bg-gold-400/20 transition-all"
                                                    >
                                                        <AlertCircle size={12} />
                                                        Rouvrir
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Messages */}
                                    <div className="flex-1 overflow-y-auto p-5 space-y-4">
                                        {selectedTicket.messages?.map((msg, i) => (
                                            <div key={i} className={`flex ${msg.sender === 'admin' ? 'justify-end' : 'justify-start'}`}>
                                                <div className={`max-w-[75%] ${msg.sender === 'admin' ? 'order-2' : 'order-1'}`}>
                                                    <div className={`px-4 py-3 rounded-2xl text-sm leading-relaxed ${msg.sender === 'admin'
                                                        ? 'bg-gold-400/10 text-amber-100 border border-gold-400/20 rounded-tr-sm'
                                                        : 'bg-calx-card text-gray-200 border border-calx-surface-variant rounded-tl-sm'
                                                        }`}>
                                                        <p className="whitespace-pre-wrap">{msg.text}</p>
                                                    </div>
                                                    <div className={`flex items-center gap-1.5 mt-1.5 ${msg.sender === 'admin' ? 'justify-end' : 'justify-start'}`}>
                                                        {msg.sender === 'admin' && (
                                                            <span className="text-[10px] text-gold-400/60 font-medium">Support CalX</span>
                                                        )}
                                                        <span className={`text-[10px] ${msg.sender === 'admin' ? 'text-gold-400/40' : 'text-calx-text-muted'}`}>
                                                            {msg.timestamp ? formatRelativeTime(msg.timestamp) : ''}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                        <div ref={messagesEnd} />
                                    </div>

                                    {/* Reply input */}
                                    {selectedTicket.status !== 'closed' ? (
                                        <div className="p-4 border-t border-calx-surface bg-calx-surface/20">
                                            <div className="flex gap-3">
                                                <input
                                                    value={reply}
                                                    onChange={(e) => setReply(e.target.value)}
                                                    onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && sendReply()}
                                                    placeholder="Écrire une réponse au client..."
                                                    className="flex-1 px-4 py-3 bg-calx-card/50 border border-calx-surface-variant rounded-xl text-calx-text text-sm placeholder-calx-text-muted focus:outline-none focus:ring-2 focus:ring-gold-400/40 transition-all"
                                                />
                                                <button
                                                    onClick={sendReply}
                                                    disabled={!reply.trim() || sending}
                                                    className="px-5 py-3 bg-gold-400 text-black rounded-xl hover:bg-gold-400/90 transition-all disabled:opacity-50 flex items-center gap-2 font-medium text-sm"
                                                >
                                                    <Send size={14} />
                                                    Envoyer
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="p-4 border-t border-calx-surface bg-calx-surface/20 text-center">
                                            <p className="text-xs text-calx-text-muted flex items-center justify-center gap-1.5">
                                                <CheckCircle size={12} className="text-green-400" />
                                                Ce ticket a été fermé
                                            </p>
                                        </div>
                                    )}
                                </>
                            ) : (
                                <div className="flex-1 flex items-center justify-center text-calx-text-muted">
                                    <div className="text-center">
                                        <div className="w-16 h-16 rounded-2xl bg-calx-surface/50 border border-calx-surface flex items-center justify-center mx-auto mb-4">
                                            <MessageSquare size={28} className="text-calx-text-muted" />
                                        </div>
                                        <h3 className="text-sm font-medium text-calx-text-secondary mb-1">Aucun ticket sélectionné</h3>
                                        <p className="text-xs text-calx-text-muted max-w-[200px]">
                                            Sélectionne un ticket dans la liste pour voir la conversation
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </RoleGuard>
    );
}
