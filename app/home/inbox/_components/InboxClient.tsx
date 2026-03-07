"use client";

import React, { useState, useEffect, useRef } from 'react';
import { createClient } from '@/utils/supabase/client';

export interface Contact {
    id: string;
    partnerId: string;
    name: string;
    avatar: string;
    lastMessage: string;
    time: string;
    unread: number;
}

export interface ChatMessage {
    id: string;
    text: string;
    sender: 'user' | 'other';
    time: string;
}

interface OrgResult {
    id: string;
    full_name: string;
}

interface InboxClientProps {
    role: 'donor' | 'organization';
    userId: string;
    userDisplayName: string;
}

// ── Confirmation Modal ────────────────────────────────────────────────────────
const DeleteModal = ({
    contact,
    deleting,
    onConfirm,
    onCancel,
}: {
    contact: Contact;
    deleting: boolean;
    onConfirm: () => void;
    onCancel: () => void;
}) => (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={onCancel}
        />
        {/* Modal */}
        <div className="relative bg-white rounded-3xl shadow-2xl p-8 max-w-sm w-full flex flex-col items-center gap-5 animate-in fade-in zoom-in-95 duration-200">
            <div className="w-16 h-16 rounded-2xl bg-red-50 flex items-center justify-center text-3xl">
                🗑️
            </div>
            <div className="text-center">
                <h3 className="text-lg font-black text-slate-900 mb-1">Delete Conversation?</h3>
                <p className="text-sm text-slate-500 leading-relaxed">
                    This will permanently delete your conversation with{' '}
                    <span className="font-bold text-slate-700">{contact.name}</span> and all messages within it. This cannot be undone.
                </p>
            </div>
            <div className="flex gap-3 w-full">
                <button
                    onClick={onCancel}
                    disabled={deleting}
                    className="flex-1 py-3 rounded-2xl border-2 border-slate-200 text-slate-600 font-bold text-sm hover:bg-slate-50 transition-colors disabled:opacity-50"
                >
                    Cancel
                </button>
                <button
                    onClick={onConfirm}
                    disabled={deleting}
                    className="flex-1 py-3 rounded-2xl bg-red-500 text-white font-bold text-sm hover:bg-red-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                    {deleting ? (
                        <>
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            Deleting...
                        </>
                    ) : (
                        'Delete'
                    )}
                </button>
            </div>
        </div>
    </div>
);

// Main Component
const InboxClient = ({ role, userId, userDisplayName }: InboxClientProps) => {
    const supabase = createClient();

    const [contacts, setContacts] = useState<Contact[]>([]);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [inputValue, setInputValue] = useState('');
    const [sending, setSending] = useState(false);

    // Search
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<OrgResult[]>([]);
    const [searching, setSearching] = useState(false);
    const [showResults, setShowResults] = useState(false);
    const searchRef = useRef<HTMLDivElement>(null);

    // Delete
    const [deleteTarget, setDeleteTarget] = useState<Contact | null>(null);
    const [deleting, setDeleting] = useState(false);

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const realtimeRef = useRef<any>(null);

    const isOrg = role === 'organization';
    const selectedContact = contacts.find(c => c.id === selectedId);

    const accentColor = isOrg ? 'bg-[#FF9248]' : 'bg-blue-600';
    const accentText = isOrg ? 'text-[#FF9248]' : 'text-blue-700';
    const accentBg = isOrg ? 'bg-[#FFF5ED]' : 'bg-[#EEF2FF]';
    const accentRing = isOrg ? 'ring-[#FF9248]/10' : 'ring-blue-600/10';
    const accentShadow = isOrg ? 'shadow-[#FF9248]/20' : 'shadow-blue-200';

    // Close search dropdown on outside click
    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (searchRef.current && !searchRef.current.contains(e.target as Node))
                setShowResults(false);
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    // Auto scroll
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // Search orgs (donor only, debounced)
    useEffect(() => {
        if (isOrg || !searchQuery.trim()) {
            setSearchResults([]);
            setShowResults(false);
            return;
        }
        const delay = setTimeout(async () => {
            setSearching(true);
            const { data, error } = await supabase
                .from('profiles')
                .select('id, full_name')
                .eq('role', 'organization')
                .ilike('full_name', `%${searchQuery}%`)
                .limit(6);
            if (!error && data) { setSearchResults(data); setShowResults(true); }
            setSearching(false);
        }, 300);
        return () => clearTimeout(delay);
    }, [searchQuery, isOrg]);

    // Start or open conversation
    const handleStartConversation = async (org: OrgResult) => {
        setShowResults(false);
        setSearchQuery('');

        const { data: existing } = await supabase
            .from('conversations')
            .select('id')
            .eq('donor_id', userId)
            .eq('org_id', org.id)
            .single();

        if (existing) {
            handleSelectContact(existing.id);
            if (!contacts.find(c => c.id === existing.id)) {
                setContacts(prev => [{
                    id: existing.id, partnerId: org.id,
                    name: org.full_name, avatar: org.full_name.charAt(0).toUpperCase(),
                    lastMessage: 'No messages yet', time: '', unread: 0,
                }, ...prev]);
            }
            return;
        }

        const { data: newConvo, error } = await supabase
            .from('conversations')
            .insert({ donor_id: userId, org_id: org.id })
            .select('id')
            .single();

        if (error || !newConvo) { console.error('Failed to create conversation:', error); return; }

        const newContact: Contact = {
            id: newConvo.id, partnerId: org.id,
            name: org.full_name, avatar: org.full_name.charAt(0).toUpperCase(),
            lastMessage: 'No messages yet', time: '', unread: 0,
        };
        setContacts(prev => [newContact, ...prev]);
        handleSelectContact(newConvo.id);
    };

    // Fetch conversations
    useEffect(() => {
        const fetchConversations = async () => {
            const { data: convos, error } = await supabase
                .from('conversations')
                .select(`id, donor_id, org_id, messages(content, created_at, sender_id)`)
                .or(`donor_id.eq.${userId},org_id.eq.${userId}`)
                .order('created_at', { referencedTable: 'messages', ascending: false });

            if (error || !convos) return;

            const contactList: Contact[] = await Promise.all(
                convos.map(async (convo: any) => {
                    const partnerId = isOrg ? convo.donor_id : convo.org_id;
                    const { data: profile } = await supabase
                        .from('profiles').select('full_name').eq('id', partnerId).single();
                    const partnerName = profile?.full_name || (isOrg ? 'Donor' : 'Organization');
                    const msgs = convo.messages || [];
                    const lastMsg = msgs[0];
                    return {
                        id: convo.id, partnerId,
                        name: partnerName, avatar: partnerName.charAt(0).toUpperCase(),
                        lastMessage: lastMsg?.content || 'No messages yet',
                        time: lastMsg?.created_at
                            ? new Date(lastMsg.created_at).toLocaleTimeString('en-PH', { hour: '2-digit', minute: '2-digit' })
                            : '',
                        unread: msgs.filter((m: any) => m.sender_id !== userId).length > 0 ? 1 : 0,
                    };
                })
            );
            setContacts(contactList);
        };
        fetchConversations();
    }, [userId, role]);

    // Fetch messages + realtime
    useEffect(() => {
        if (!selectedId) return;

        const fetchMessages = async () => {
            const { data, error } = await supabase
                .from('messages').select('id, content, sender_id, created_at')
                .eq('conversation_id', selectedId).order('created_at', { ascending: true });
            if (error || !data) return;
            setMessages(data.map((m: any) => ({
                id: m.id, text: m.content,
                sender: m.sender_id === userId ? 'user' : 'other',
                time: new Date(m.created_at).toLocaleTimeString('en-PH', { hour: '2-digit', minute: '2-digit' }),
            })));
        };
        fetchMessages();

        if (realtimeRef.current) supabase.removeChannel(realtimeRef.current);
        const channel = supabase
            .channel(`messages:${selectedId}`)
            .on('postgres_changes', {
                event: 'INSERT', schema: 'public', table: 'messages',
                filter: `conversation_id=eq.${selectedId}`,
            }, (payload: any) => {
                const m = payload.new;
                setMessages(prev => {
                    if (prev.find(x => x.id === m.id)) return prev;
                    return [...prev, {
                        id: m.id, text: m.content,
                        sender: m.sender_id === userId ? 'user' : 'other',
                        time: new Date(m.created_at).toLocaleTimeString('en-PH', { hour: '2-digit', minute: '2-digit' }),
                    }];
                });
            })
            .subscribe();
        realtimeRef.current = channel;
        return () => { supabase.removeChannel(channel); };
    }, [selectedId, userId]);

    // Send message
    const handleSendMessage = async (text: string) => {
        if (!text.trim() || !selectedId || sending) return;
        setSending(true);
        const { error } = await supabase.from('messages')
            .insert({ conversation_id: selectedId, sender_id: userId, content: text.trim() });
        if (error) console.error('Failed to send:', error);
        setSending(false);
        setInputValue('');
    };

    // Select conversation
    const handleSelectContact = (contactId: string) => {
        setSelectedId(contactId);
        setMessages([]);
        setContacts(prev => prev.map(c => c.id === contactId ? { ...c, unread: 0 } : c));
    };

    const handleDeleteConfirmed = async () => {
        if (!deleteTarget) return;
        setDeleting(true);

        const { error } = await supabase
            .from('conversations')
            .delete()
            .eq('id', deleteTarget.id);

        if (error) {
            console.error('Failed to delete conversation:', error);
            setDeleting(false);
            return;
        }

        // Remove from UI
        setContacts(prev => prev.filter(c => c.id !== deleteTarget.id));
        if (selectedId === deleteTarget.id) {
            setSelectedId(null);
            setMessages([]);
        }
        setDeleteTarget(null);
        setDeleting(false);
    };

    return (
        <>
            {/* Delete confirmation modal */}
            {deleteTarget && (
                <DeleteModal
                    contact={deleteTarget}
                    deleting={deleting}
                    onConfirm={handleDeleteConfirmed}
                    onCancel={() => !deleting && setDeleteTarget(null)}
                />
            )}

            <div className="flex-1 flex overflow-hidden bg-[#F8F9FB] font-['Inter']">
                {/* LEFT: Contact Stack */}
                <div className="w-[380px] border-r border-slate-200 flex flex-col bg-white">
                    <div className="p-6 border-b border-slate-100 bg-white">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-2xl font-black text-slate-900 tracking-tight">Messages</h2>
                        </div>

                        <div className="relative" ref={searchRef}>
                            <div className="relative">
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={e => setSearchQuery(e.target.value)}
                                    onFocus={() => searchResults.length > 0 && setShowResults(true)}
                                    placeholder={isOrg ? 'Search conversations...' : 'Search organizations to message...'}
                                    className="w-full bg-slate-100 border-none rounded-xl py-3 pl-11 pr-4 text-sm focus:ring-2 focus:ring-slate-200 transition-all outline-none"
                                />
                                <svg className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                    <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                                {searching && (
                                    <div className="absolute right-4 top-1/2 -translate-y-1/2">
                                        <div className="w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
                                    </div>
                                )}
                            </div>

                            {!isOrg && showResults && (
                                <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden z-50">
                                    {searchResults.length === 0 ? (
                                        <div className="px-5 py-4 text-sm text-slate-400 text-center">No organizations found</div>
                                    ) : (
                                        <>
                                            <div className="px-4 py-2 border-b border-slate-50">
                                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Organizations</p>
                                            </div>
                                            {searchResults.map(org => (
                                                <button key={org.id} onClick={() => handleStartConversation(org)}
                                                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-50 transition-colors text-left">
                                                    <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 font-bold text-sm flex-shrink-0">
                                                        {org.full_name.charAt(0).toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-semibold text-slate-800">{org.full_name}</p>
                                                        <p className="text-xs text-slate-400">Organization · Click to message</p>
                                                    </div>
                                                    <svg className="ml-auto text-slate-300" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                                        <path d="M9 18l6-6-6-6" />
                                                    </svg>
                                                </button>
                                            ))}
                                        </>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Conversations list */}
                    <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-2">
                        {contacts.length > 0 ? (
                            contacts.map(contact => (
                                <div
                                    key={contact.id}
                                    className={`relative group w-full p-4 rounded-2xl transition-all duration-200 flex gap-4 cursor-pointer hover:shadow-md ${selectedId === contact.id ? `${accentBg} shadow-sm` : 'hover:bg-slate-50'}`}
                                    onClick={() => handleSelectContact(contact.id)}
                                >
                                    <div className="w-14 h-14 rounded-2xl bg-white border border-slate-100 flex items-center justify-center text-2xl font-bold shadow-sm group-hover:scale-105 transition-transform duration-200 text-slate-600 flex-shrink-0">
                                        {contact.avatar}
                                    </div>
                                    <div className="flex-1 min-w-0 py-1">
                                        <div className="flex justify-between items-start mb-0.5">
                                            <h3 className={`font-bold truncate ${selectedId === contact.id ? accentText : 'text-slate-900'}`}>
                                                {contact.name}
                                            </h3>
                                            <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">{contact.time}</span>
                                        </div>
                                        <p className={`text-sm truncate ${contact.unread > 0 ? 'text-slate-900 font-semibold' : 'text-slate-500 font-light'}`}>
                                            {contact.lastMessage}
                                        </p>
                                    </div>
                                    {contact.unread > 0 && (
                                        <div className="flex items-center">
                                            <div className={`w-5 h-5 rounded-full ${accentColor} text-white text-[10px] flex items-center justify-center font-bold ring-4 ${accentRing}`}>
                                                {contact.unread}
                                            </div>
                                        </div>
                                    )}

                                    {/* Delete button — appears on hover */}
                                    <button
                                        onClick={e => { e.stopPropagation(); setDeleteTarget(contact); }}
                                        className="absolute top-3 right-3 w-7 h-7 rounded-lg bg-red-50 text-red-400 hover:bg-red-100 hover:text-red-600 transition-colors opacity-0 group-hover:opacity-100 flex items-center justify-center"
                                        title="Delete conversation"
                                    >
                                        <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                            <path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" strokeLinecap="round" strokeLinejoin="round" />
                                        </svg>
                                    </button>
                                </div>
                            ))
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center text-slate-400 px-6 py-12 text-center">
                                <div className="text-4xl mb-3 opacity-40">📭</div>
                                <p className="text-sm">No conversations yet.</p>
                                <p className="text-xs mt-1 text-slate-300">
                                    {isOrg ? 'Donors will appear here when they message you.' : 'Search for an organization above to start chatting.'}
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                {/* RIGHT: Conversation View */}
                <div className="flex-1 flex flex-col bg-white">
                    {selectedContact ? (
                        <>
                            <div className="h-20 px-8 border-b border-slate-100 flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-xl font-bold text-slate-600">
                                        {selectedContact.avatar}
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-slate-900 leading-none">{selectedContact.name}</h3>
                                        <span className="text-xs text-green-500 font-medium flex items-center gap-1 mt-1">
                                            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                                            Online
                                        </span>
                                    </div>
                                </div>
                                {/* Delete button in chat header */}
                                <button
                                    onClick={() => setDeleteTarget(selectedContact)}
                                    className="flex items-center gap-2 px-4 py-2 rounded-xl border border-red-100 text-red-400 hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-colors text-sm font-semibold"
                                >
                                    <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                        <path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                    Delete
                                </button>
                            </div>

                            <div className="flex-1 overflow-y-auto p-8 space-y-6 bg-[#FBFCFE] custom-scrollbar">
                                {messages.length === 0 && (
                                    <div className="flex justify-center">
                                        <span className="px-4 py-1.5 bg-white border border-slate-100 rounded-full text-[11px] font-bold text-slate-400 uppercase tracking-widest shadow-sm">
                                            Start of conversation
                                        </span>
                                    </div>
                                )}
                                {messages.map(msg => (
                                    <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'flex-row-reverse' : 'flex-row'} gap-3 max-w-[75%] ${msg.sender === 'user' ? 'ml-auto' : ''}`}>
                                        <div className={`w-8 h-8 rounded-lg flex-shrink-0 flex items-center justify-center text-sm font-bold ${msg.sender === 'user' ? `${accentColor} text-white shadow-sm` : 'bg-slate-200 text-slate-600'}`}>
                                            {msg.sender === 'user' ? userDisplayName.charAt(0).toUpperCase() : selectedContact.avatar}
                                        </div>
                                        <div className="space-y-1">
                                            <div className={`p-4 rounded-2xl leading-relaxed text-sm ${msg.sender === 'user' ? `${accentColor} text-white shadow-lg ${accentShadow} rounded-tr-none` : 'bg-white border border-slate-100 text-slate-800 shadow-sm rounded-tl-none'}`}>
                                                {msg.text}
                                            </div>
                                            <div className={`flex items-center gap-1 font-bold text-[10px] text-slate-400 ${msg.sender === 'user' ? 'justify-end mr-1' : 'ml-1'}`}>
                                                {msg.time}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                <div ref={messagesEndRef} />
                            </div>

                            <div className="p-6 bg-white border-t border-slate-100">
                                <div className="bg-slate-50 rounded-2xl p-2 flex items-end gap-2 border border-slate-100 focus-within:ring-2 focus-within:ring-slate-200 transition-all">
                                    <textarea
                                        value={inputValue}
                                        onChange={e => setInputValue(e.target.value)}
                                        placeholder="Type your message..."
                                        className="flex-1 bg-transparent border-none outline-none py-3 px-2 resize-none text-sm max-h-32 min-h-[44px]"
                                        rows={1}
                                        onKeyDown={e => {
                                            if (e.key === 'Enter' && !e.shiftKey) {
                                                e.preventDefault();
                                                handleSendMessage(inputValue);
                                            }
                                        }}
                                    />
                                    <button
                                        onClick={() => handleSendMessage(inputValue)}
                                        disabled={sending || !inputValue.trim()}
                                        className={`p-3 ${accentColor} text-white rounded-xl hover:opacity-90 transition-all shadow-lg ${accentShadow} disabled:opacity-40 disabled:cursor-not-allowed`}
                                    >
                                        <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                            <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" />
                                        </svg>
                                    </button>
                                </div>
                                <p className="text-[10px] text-slate-300 mt-2 ml-2">Press Enter to send · Shift+Enter for new line</p>
                            </div>
                        </>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center text-slate-400 p-12 text-center">
                            <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center text-4xl mb-6 grayscale opacity-50">📬</div>
                            <h3 className="text-xl font-bold text-slate-900 mb-2">Your Inbox</h3>
                            <p className="max-w-xs text-slate-500 font-light">
                                {isOrg ? 'Select a conversation to start chatting.' : 'Search for an organization above or select an existing conversation.'}
                            </p>
                        </div>
                    )}
                </div>

                <style jsx global>{`
                    .custom-scrollbar::-webkit-scrollbar { width: 4px; }
                    .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                    .custom-scrollbar::-webkit-scrollbar-thumb { background: #E2E8F0; border-radius: 20px; }
                    .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #CBD5E1; }
                `}</style>
            </div>
        </>
    );
};

export default InboxClient;