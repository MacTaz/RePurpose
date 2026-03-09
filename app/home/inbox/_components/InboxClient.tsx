"use client";

import React, { useState, useEffect, useRef } from 'react';
import { createClient } from '@/utils/supabase/client';

// ── Types ─────────────────────────────────────────────────────────────────────

interface DonationThread {
    conversationId: string;
    donationId: string | null;
    donationType: string;
    donationStatus: string;
    donationQuantity: number;
    lastMessage: string;
    time: string;
    unread: number;
}

interface OrgGroup {
    partnerId: string;
    partnerName: string;
    partnerAvatar: string;   // initials fallback
    partnerAvatarUrl?: string | null;  // real photo URL
    facebookUrl?: string;
    threads: DonationThread[];
}

interface ChatMessage {
    id: string;
    text: string;
    imageUrl?: string | null;
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

// ── Helpers ───────────────────────────────────────────────────────────────────

const TYPE_ICONS: Record<string, string> = {
    food: '🍱', clothes: '👕', clothing: '👕', water: '💧',
    medicine: '💊', blanket: '🛏️', other: '📦',
}
const getIcon = (type: string) => {
    const lower = (type || '').toLowerCase()
    for (const [key, icon] of Object.entries(TYPE_ICONS)) {
        if (lower.includes(key)) return icon
    }
    return '📦'
}

const STATUS_CONFIG: Record<string, { label: string; color: string; bar: string; width: string }> = {
    pending: { label: 'Pending', color: 'text-amber-600', bar: 'bg-amber-400', width: 'w-[10%]' },
    accepted: { label: 'Accepted', color: 'text-orange-600', bar: 'bg-orange-400', width: 'w-1/3' },
    in_progress: { label: 'In Progress', color: 'text-blue-600', bar: 'bg-blue-500', width: 'w-2/3' },
    delivered: { label: 'Delivered', color: 'text-green-600', bar: 'bg-green-500', width: 'w-full' },
    rejected: { label: 'Rejected', color: 'text-red-500', bar: 'bg-red-400', width: 'w-0' },
}

// ── Delete Modal ──────────────────────────────────────────────────────────────

const DeleteModal = ({
    name, deleting, onConfirm, onCancel,
}: { name: string; deleting: boolean; onConfirm: () => void; onCancel: () => void }) => (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onCancel} />
        <div className="relative bg-white rounded-3xl shadow-2xl p-8 max-w-sm w-full flex flex-col items-center gap-5">
            <div className="w-16 h-16 rounded-2xl bg-red-50 flex items-center justify-center text-3xl">🗑️</div>
            <div className="text-center">
                <h3 className="text-lg font-black text-slate-900 mb-1">Delete Thread?</h3>
                <p className="text-sm text-slate-500 leading-relaxed">
                    This will permanently delete the <span className="font-bold text-slate-700">{name}</span> thread and all its messages.
                </p>
            </div>
            <div className="flex gap-3 w-full">
                <button onClick={onCancel} disabled={deleting}
                    className="flex-1 py-3 rounded-2xl border-2 border-slate-200 text-slate-600 font-bold text-sm hover:bg-slate-50 transition-colors disabled:opacity-50">
                    Cancel
                </button>
                <button onClick={onConfirm} disabled={deleting}
                    className="flex-1 py-3 rounded-2xl bg-red-500 text-white font-bold text-sm hover:bg-red-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
                    {deleting ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Deleting...</> : 'Delete'}
                </button>
            </div>
        </div>
    </div>
)

// ── Main Component ────────────────────────────────────────────────────────────

const InboxClient = ({ role, userId, userDisplayName }: InboxClientProps) => {
    const supabase = createClient()
    const isOrg = role === 'organization'

    // Grouped org data
    const [orgGroups, setOrgGroups] = useState<OrgGroup[]>([])
    const [expandedOrgId, setExpandedOrgId] = useState<string | null>(null)

    // Active chat
    const [selectedConvoId, setSelectedConvoId] = useState<string | null>(null)
    const [selectedThread, setSelectedThread] = useState<DonationThread | null>(null)
    const [selectedOrgGroup, setSelectedOrgGroup] = useState<OrgGroup | null>(null)
    const [messages, setMessages] = useState<ChatMessage[]>([])

    // Input
    const [inputValue, setInputValue] = useState('')
    const [sending, setSending] = useState(false)
    const [uploadingImage, setUploadingImage] = useState(false)
    const fileInputRef = useRef<HTMLInputElement>(null)

    // Search (donor only)
    const [searchQuery, setSearchQuery] = useState('')
    const [searchResults, setSearchResults] = useState<OrgResult[]>([])
    const [searching, setSearching] = useState(false)
    const [showResults, setShowResults] = useState(false)
    const searchRef = useRef<HTMLDivElement>(null)

    // Delete
    const [deleteTarget, setDeleteTarget] = useState<{ convoId: string; name: string } | null>(null)
    const [deleting, setDeleting] = useState(false)

    const messagesEndRef = useRef<HTMLDivElement>(null)
    const realtimeRef = useRef<any>(null)

    const accentColor = isOrg ? 'bg-[#FF9248]' : 'bg-blue-600'
    const accentText = isOrg ? 'text-[#FF9248]' : 'text-blue-700'
    const accentBg = isOrg ? 'bg-[#FFF5ED]' : 'bg-[#EEF2FF]'
    const accentShadow = isOrg ? 'shadow-[#FF9248]/20' : 'shadow-blue-200'

    // ── Auto scroll ───────────────────────────────────────────────────────────
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [messages])

    // ── Close search on outside click ─────────────────────────────────────────
    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (searchRef.current && !searchRef.current.contains(e.target as Node))
                setShowResults(false)
        }
        document.addEventListener('mousedown', handler)
        return () => document.removeEventListener('mousedown', handler)
    }, [])

    // ── Fetch & group conversations ───────────────────────────────────────────
    const fetchConversations = async () => {
        const { data: convos, error } = await supabase
            .from('conversations')
            .select(`id, donor_id, org_id, donation_id, messages(id, content, image_url, created_at, sender_id)`)
            .or(`donor_id.eq.${userId},org_id.eq.${userId}`)

        if (error || !convos) return

        // Group by partner
        const groupMap: Record<string, OrgGroup> = {}

        await Promise.all(convos.map(async (convo: any) => {
            const partnerId = isOrg ? convo.donor_id : convo.org_id
            if (!partnerId) return

            // Fetch partner profile if not cached
            if (!groupMap[partnerId]) {
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('full_name, facebook_url')
                    .eq('id', partnerId)
                    .single()

                // Fetch avatar from storage bucket
                let partnerAvatarUrl: string | null = null
                const { data: avatarFiles } = await supabase.storage
                    .from('avatars')
                    .list(partnerId, { limit: 1, sortBy: { column: 'created_at', order: 'desc' } })
                if (avatarFiles && avatarFiles.length > 0) {
                    const { data: urlData } = supabase.storage
                        .from('avatars')
                        .getPublicUrl(`${partnerId}/${avatarFiles[0].name}`)
                    partnerAvatarUrl = urlData.publicUrl
                }

                groupMap[partnerId] = {
                    partnerId,
                    partnerName: profile?.full_name || (isOrg ? 'Donor' : 'Organization'),
                    partnerAvatar: (profile?.full_name || '?').charAt(0).toUpperCase(),
                    partnerAvatarUrl,
                    facebookUrl: profile?.facebook_url,
                    threads: [],
                }
            }

            // Fetch donation details
            let donationType = 'Donation'
            let donationStatus = 'pending'
            let donationQuantity = 1
            if (convo.donation_id) {
                const { data: don } = await supabase
                    .from('donations')
                    .select('type, status, quantity')
                    .eq('id', convo.donation_id)
                    .single()
                if (don) {
                    donationType = don.type
                    donationStatus = don.status
                    donationQuantity = don.quantity || 1
                }
            }

            const msgs = convo.messages || []
            const sortedMsgs = [...msgs].sort((a: any, b: any) =>
                new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
            )
            const lastMsg = sortedMsgs[0]

            const lastSeenId = typeof window !== 'undefined' ? localStorage.getItem(`seen_${convo.id}`) : null
            let unreadCount = 0
            for (const m of sortedMsgs) {
                if (m.id === lastSeenId) break
                if (m.sender_id !== userId) unreadCount++
            }

            const thread: DonationThread = {
                conversationId: convo.id,
                donationId: convo.donation_id,
                donationType,
                donationStatus,
                donationQuantity,
                lastMessage: lastMsg?.image_url ? '📷 Image' : (lastMsg?.content || 'No messages yet'),
                time: lastMsg?.created_at
                    ? new Date(lastMsg.created_at).toLocaleTimeString('en-PH', { hour: '2-digit', minute: '2-digit' })
                    : '',
                unread: unreadCount,
            }

            groupMap[partnerId].threads.push(thread)
        }))

        // Sort threads within each group by most recent
        Object.values(groupMap).forEach(g => {
            g.threads.sort((a, b) => (b.time > a.time ? 1 : -1))
        })

        setOrgGroups(Object.values(groupMap))
    }

    useEffect(() => {
        fetchConversations()
        const handleRead = () => fetchConversations()
        window.addEventListener('messages_read', handleRead)
        return () => window.removeEventListener('messages_read', handleRead)
    }, [userId, role])

    // ── Fetch messages + realtime ─────────────────────────────────────────────
    useEffect(() => {
        if (!selectedConvoId) return
        let cancelled = false  // stale-fetch guard

        const fetch = async () => {
            const { data, error } = await supabase
                .from('messages')
                .select('id, content, image_url, sender_id, created_at')
                .eq('conversation_id', selectedConvoId)
                .order('created_at', { ascending: true })
            if (cancelled || error || !data) return
            // Only replace messages once the full result is ready — no blank flash
            setMessages(data.map((m: any) => ({
                id: m.id, text: m.content, imageUrl: m.image_url,
                sender: m.sender_id === userId ? 'user' : 'other',
                time: new Date(m.created_at).toLocaleTimeString('en-PH', { hour: '2-digit', minute: '2-digit' }),
            })))

            if (data.length > 0) {
                const lastMsg = data[data.length - 1]
                const currentSeen = localStorage.getItem(`seen_${selectedConvoId}`)
                if (currentSeen !== lastMsg.id) {
                    localStorage.setItem(`seen_${selectedConvoId}`, lastMsg.id)
                    window.dispatchEvent(new Event('messages_read'))
                }
            }
        }
        fetch()

        if (realtimeRef.current) supabase.removeChannel(realtimeRef.current)
        const channel = supabase
            .channel(`messages:${selectedConvoId}`)
            .on('postgres_changes', {
                event: 'INSERT', schema: 'public', table: 'messages',
                filter: `conversation_id=eq.${selectedConvoId}`,
            }, (payload: any) => {
                const m = payload.new
                setMessages(prev => {
                    if (prev.find(x => x.id === m.id)) return prev
                    return [...prev, {
                        id: m.id, text: m.content, imageUrl: m.image_url,
                        sender: m.sender_id === userId ? 'user' : 'other',
                        time: new Date(m.created_at).toLocaleTimeString('en-PH', { hour: '2-digit', minute: '2-digit' }),
                    }]
                })

                localStorage.setItem(`seen_${selectedConvoId}`, m.id)
                window.dispatchEvent(new Event('messages_read'))
            })
            .subscribe()
        realtimeRef.current = channel
        return () => { cancelled = true; supabase.removeChannel(channel) }
    }, [selectedConvoId, userId])

    // ── Search orgs (donor only) ──────────────────────────────────────────────
    useEffect(() => {
        if (isOrg || !searchQuery.trim()) {
            setSearchResults([]); setShowResults(false); return
        }
        const delay = setTimeout(async () => {
            setSearching(true)
            const { data } = await supabase.from('profiles').select('id, full_name')
                .eq('role', 'organization').ilike('full_name', `%${searchQuery}%`).limit(6)
            if (data) { setSearchResults(data); setShowResults(true) }
            setSearching(false)
        }, 300)
        return () => clearTimeout(delay)
    }, [searchQuery, isOrg])

    // ── Start new conversation (donor searching org manually) ─────────────────
    const handleStartConversation = async (org: OrgResult) => {
        setShowResults(false); setSearchQuery('')
        // Create a new standalone conversation with no donation_id
        const { data: newConvo, error } = await supabase
            .from('conversations')
            .insert({ donor_id: userId, org_id: org.id, donation_id: null })
            .select('id').single()
        if (error || !newConvo) { console.error(error); return }

        const thread: DonationThread = {
            conversationId: newConvo.id, donationId: null,
            donationType: 'General', donationStatus: 'pending',
            donationQuantity: 0, lastMessage: 'No messages yet', time: '', unread: 0,
        }
        setOrgGroups(prev => {
            const existing = prev.find(g => g.partnerId === org.id)
            if (existing) {
                return prev.map(g => g.partnerId === org.id
                    ? { ...g, threads: [thread, ...g.threads] } : g)
            }
            return [{
                partnerId: org.id,
                partnerName: org.full_name,
                partnerAvatar: org.full_name.charAt(0).toUpperCase(),
                threads: [thread],
            }, ...prev]
        })
        setExpandedOrgId(org.id)
        openThread(thread, {
            partnerId: org.id, partnerName: org.full_name,
            partnerAvatar: org.full_name.charAt(0).toUpperCase(), threads: [thread],
        })
    }

    // ── Open a thread ─────────────────────────────────────────────────────────
    const openThread = (thread: DonationThread, group: OrgGroup) => {
        setSelectedConvoId(thread.conversationId)
        setSelectedThread(thread)
        setSelectedOrgGroup(group)
        // Don't clear messages here — let the fetch useEffect replace them
        // once loaded to avoid a blank flash
    }

    // ── Send text ─────────────────────────────────────────────────────────────
    const handleSendMessage = async (text: string) => {
        if (!text.trim() || !selectedConvoId || sending) return
        setSending(true)
        await supabase.from('messages')
            .insert({ conversation_id: selectedConvoId, sender_id: userId, content: text.trim() })
        setSending(false)
        setInputValue('')
    }

    // ── Send image ────────────────────────────────────────────────────────────
    const handleSendImage = async (file: File) => {
        if (!selectedConvoId || uploadingImage) return
        setUploadingImage(true)
        const ext = file.name.split('.').pop()
        const fileName = `${selectedConvoId}/${Date.now()}.${ext}`
        const { error: uploadError } = await supabase.storage
            .from('chat-images').upload(fileName, file, { cacheControl: '3600', upsert: false })
        if (uploadError) { console.error(uploadError); setUploadingImage(false); return }
        const { data: urlData } = supabase.storage.from('chat-images').getPublicUrl(fileName)
        await supabase.from('messages').insert({
            conversation_id: selectedConvoId, sender_id: userId,
            content: '', image_url: urlData.publicUrl,
        })
        setUploadingImage(false)
    }

    // ── Delete thread ─────────────────────────────────────────────────────────
    const handleDeleteConfirmed = async () => {
        if (!deleteTarget) return
        setDeleting(true)
        const { error } = await supabase.from('conversations').delete().eq('id', deleteTarget.convoId)
        if (!error) {
            if (selectedConvoId === deleteTarget.convoId) {
                setSelectedConvoId(null); setSelectedThread(null); setMessages([])
            }
            setOrgGroups(prev => prev.map(g => ({
                ...g, threads: g.threads.filter(t => t.conversationId !== deleteTarget.convoId)
            })).filter(g => g.threads.length > 0))
        }
        setDeleteTarget(null); setDeleting(false)
    }

    // ── Filtered org groups for org-side search ───────────────────────────────
    const filteredGroups = isOrg && searchQuery.trim()
        ? orgGroups.filter(g => g.partnerName.toLowerCase().includes(searchQuery.toLowerCase()))
        : orgGroups

    return (
        <>
            {deleteTarget && (
                <DeleteModal
                    name={deleteTarget.name} deleting={deleting}
                    onConfirm={handleDeleteConfirmed}
                    onCancel={() => !deleting && setDeleteTarget(null)}
                />
            )}

            <div className="flex-1 flex overflow-hidden bg-[#F8F9FB] font-['Inter']">
                {/* ── LEFT: Grouped contact list ── */}
                <div className="w-[380px] border-r border-slate-200 flex flex-col bg-white">
                    <div className="p-6 border-b border-slate-100">
                        <h2 className="text-2xl font-black text-slate-900 tracking-tight mb-4">Messages</h2>

                        {/* Search */}
                        <div className="relative" ref={searchRef}>
                            <div className="relative">
                                <input type="text" value={searchQuery}
                                    onChange={e => setSearchQuery(e.target.value)}
                                    onFocus={() => searchResults.length > 0 && setShowResults(true)}
                                    placeholder={isOrg ? 'Search conversations...' : 'Search organizations to message...'}
                                    className="w-full bg-slate-100 border-none rounded-xl py-3 pl-11 pr-4 text-sm focus:ring-2 focus:ring-slate-200 outline-none"
                                />
                                <svg className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                    <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                                {searching && <div className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />}
                            </div>

                            {/* Org search dropdown (donor only) */}
                            {!isOrg && showResults && (
                                <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden z-50">
                                    {searchResults.length === 0
                                        ? <div className="px-5 py-4 text-sm text-slate-400 text-center">No organizations found</div>
                                        : searchResults.map(org => (
                                            <button key={org.id} onClick={() => handleStartConversation(org)}
                                                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-50 transition-colors text-left">
                                                <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 font-bold text-sm flex-shrink-0">
                                                    {org.full_name.charAt(0).toUpperCase()}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-semibold text-slate-800">{org.full_name}</p>
                                                    <p className="text-xs text-slate-400">Organization · Click to message</p>
                                                </div>
                                            </button>
                                        ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Org group cards */}
                    <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-2">
                        {filteredGroups.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center text-slate-400 px-6 py-12 text-center">
                                <div className="text-4xl mb-3 opacity-40">📭</div>
                                <p className="text-sm">No conversations yet.</p>
                                <p className="text-xs mt-1 text-slate-300">
                                    {isOrg ? 'Donors will appear here when they message you.' : 'Search for an organization above to start chatting.'}
                                </p>
                            </div>
                        ) : filteredGroups.map(group => {
                            const isExpanded = expandedOrgId === group.partnerId
                            const totalUnread = group.threads.reduce((s, t) => s + t.unread, 0)
                            const latestThread = group.threads[0]

                            return (
                                <div key={group.partnerId}>
                                    {/* Org card */}
                                    <div
                                        className={`relative group w-full p-4 rounded-2xl transition-all duration-200 flex gap-4 cursor-pointer hover:shadow-md
                                            ${isExpanded ? `${accentBg} shadow-sm` : 'hover:bg-slate-50'}`}
                                        onClick={() => setExpandedOrgId(isExpanded ? null : group.partnerId)}
                                    >
                                        <div className="w-14 h-14 rounded-2xl bg-white border border-slate-100 flex items-center justify-center text-2xl font-bold shadow-sm flex-shrink-0 text-slate-600 overflow-hidden">
                                            {group.partnerAvatarUrl
                                                ? <img src={group.partnerAvatarUrl} alt={group.partnerName} className="w-full h-full object-cover" onError={e => { (e.target as HTMLImageElement).style.display = 'none' }} />
                                                : group.partnerAvatar}
                                        </div>
                                        <div className="flex-1 min-w-0 py-1">
                                            <div className="flex justify-between items-start mb-0.5">
                                                <h3 className={`font-bold truncate ${isExpanded ? accentText : 'text-slate-900'}`}>
                                                    {group.partnerName}
                                                </h3>
                                                <div className="flex items-center gap-1.5 flex-shrink-0">
                                                    <span className="text-[11px] font-medium text-slate-400">{latestThread?.time}</span>
                                                    <svg className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
                                                        fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                                                        <path d="M19 9l-7 7-7-7" strokeLinecap="round" strokeLinejoin="round" />
                                                    </svg>
                                                </div>
                                            </div>
                                            <p className="text-sm text-slate-500 font-light truncate">
                                                {group.threads.length} donation thread{group.threads.length !== 1 ? 's' : ''}
                                                {latestThread ? ` · ${latestThread.lastMessage}` : ''}
                                            </p>
                                        </div>
                                        {totalUnread > 0 && (
                                            <div className={`absolute top-3 right-3 w-5 h-5 rounded-full ${accentColor} text-white text-[10px] flex items-center justify-center font-bold`}>
                                                {totalUnread}
                                            </div>
                                        )}
                                    </div>

                                    {/* Accordion: donation threads */}
                                    {isExpanded && (
                                        <div className="ml-4 mt-1 mb-2 space-y-1 border-l-2 border-slate-100 pl-3">
                                            {group.threads.map(thread => {
                                                const status = STATUS_CONFIG[thread.donationStatus] || STATUS_CONFIG.pending
                                                const isActive = selectedConvoId === thread.conversationId
                                                return (
                                                    <div key={thread.conversationId}
                                                        className={`relative group/thread flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all duration-150
                                                            ${isActive ? `${accentBg} shadow-sm` : 'hover:bg-slate-50'}`}
                                                        onClick={() => openThread(thread, group)}
                                                    >
                                                        <span className="text-xl flex-shrink-0">{getIcon(thread.donationType)}</span>
                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex items-center justify-between gap-1">
                                                                <p className={`text-sm font-bold capitalize truncate ${isActive ? accentText : 'text-slate-800'}`}>
                                                                    {thread.donationType}
                                                                    <span className="text-slate-400 font-normal ml-1">×{thread.donationQuantity}</span>
                                                                </p>
                                                                <span className="text-[10px] text-slate-400 flex-shrink-0">{thread.time}</span>
                                                            </div>
                                                            {/* Status bar */}
                                                            <div className="flex items-center gap-2 mt-1.5">
                                                                <div className="flex-1 h-1 bg-slate-100 rounded-full overflow-hidden">
                                                                    <div className={`h-full rounded-full transition-all duration-500 ${status.bar} ${status.width}`} />
                                                                </div>
                                                                <span className={`text-[9px] font-black uppercase tracking-wide flex-shrink-0 ${status.color}`}>
                                                                    {status.label}
                                                                </span>
                                                            </div>
                                                            <p className="text-xs text-slate-400 truncate mt-0.5">{thread.lastMessage}</p>
                                                        </div>
                                                        {/* Delete thread button */}
                                                        <button
                                                            onClick={e => {
                                                                e.stopPropagation()
                                                                setDeleteTarget({ convoId: thread.conversationId, name: thread.donationType })
                                                            }}
                                                            className="w-6 h-6 rounded-lg bg-red-50 text-red-400 hover:bg-red-100 hover:text-red-600 transition-colors opacity-0 group-hover/thread:opacity-100 flex items-center justify-center flex-shrink-0"
                                                        >
                                                            <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                                                <path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" strokeLinecap="round" strokeLinejoin="round" />
                                                            </svg>
                                                        </button>
                                                    </div>
                                                )
                                            })}
                                        </div>
                                    )}
                                </div>
                            )
                        })}
                    </div>
                </div>

                {/* ── RIGHT: Chat view ── */}
                <div className="flex-1 flex flex-col bg-white">
                    {selectedConvoId && selectedThread && selectedOrgGroup ? (
                        <>
                            {/* Chat header */}
                            <div className="h-20 px-8 border-b border-slate-100 flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-xl font-bold text-slate-600">
                                        {getIcon(selectedThread.donationType)}
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-slate-900 leading-none capitalize">
                                            {selectedThread.donationType}
                                            <span className="text-slate-400 font-normal ml-1.5 text-sm">×{selectedThread.donationQuantity}</span>
                                        </h3>
                                        <div className="flex items-center gap-2 mt-1">
                                            <span className="text-xs text-slate-500 font-medium">{selectedOrgGroup.partnerName}</span>
                                            <span className="text-slate-300">·</span>
                                            {(() => {
                                                const s = STATUS_CONFIG[selectedThread.donationStatus] || STATUS_CONFIG.pending
                                                return <span className={`text-[10px] font-black uppercase tracking-widest ${s.color}`}>{s.label}</span>
                                            })()}
                                        </div>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setDeleteTarget({ convoId: selectedConvoId, name: selectedThread.donationType })}
                                    className="flex items-center gap-2 px-4 py-2 rounded-xl border border-red-100 text-red-400 hover:bg-red-50 hover:text-red-600 transition-colors text-sm font-semibold"
                                >
                                    <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                        <path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                    Delete
                                </button>
                            </div>

                            {/* Messages */}
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
                                        <div className={`w-8 h-8 rounded-lg flex-shrink-0 flex items-center justify-center text-sm font-bold overflow-hidden ${msg.sender === 'user' ? `${accentColor} text-white shadow-sm` : 'bg-slate-200 text-slate-600'}`}>
                                            {msg.sender === 'user'
                                                ? userDisplayName.charAt(0).toUpperCase()
                                                : selectedOrgGroup.partnerAvatarUrl
                                                    ? <img src={selectedOrgGroup.partnerAvatarUrl} alt={selectedOrgGroup.partnerName} className="w-full h-full object-cover" onError={e => { (e.target as HTMLImageElement).style.display = 'none' }} />
                                                    : selectedOrgGroup.partnerAvatar}
                                        </div>
                                        <div className="space-y-1">
                                            <div className={`rounded-2xl leading-relaxed text-sm overflow-hidden ${msg.sender === 'user' ? `${accentColor} text-white shadow-lg ${accentShadow} rounded-tr-none` : 'bg-white border border-slate-100 text-slate-800 shadow-sm rounded-tl-none'}`}>
                                                {msg.imageUrl ? (
                                                    <a href={msg.imageUrl} target="_blank" rel="noopener noreferrer">
                                                        <img src={msg.imageUrl} alt="Shared image"
                                                            className="max-w-[280px] max-h-[320px] w-full object-cover rounded-2xl cursor-pointer hover:opacity-90 transition-opacity"
                                                            onError={e => { (e.target as HTMLImageElement).style.display = 'none' }}
                                                        />
                                                    </a>
                                                ) : (
                                                    <div className="p-4">{msg.text}</div>
                                                )}
                                            </div>
                                            <div className={`flex items-center gap-1 font-bold text-[10px] text-slate-400 ${msg.sender === 'user' ? 'justify-end mr-1' : 'ml-1'}`}>
                                                {msg.time}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                <div ref={messagesEndRef} />
                            </div>

                            {/* Input */}
                            <div className="p-6 bg-white border-t border-slate-100">
                                <div className="bg-slate-50 rounded-2xl p-2 flex items-end gap-2 border border-slate-100 focus-within:ring-2 focus-within:ring-slate-200 transition-all">
                                    <input ref={fileInputRef} type="file" accept="image/*" className="hidden"
                                        onChange={e => { const f = e.target.files?.[0]; if (f) handleSendImage(f); e.target.value = '' }}
                                    />
                                    <button onClick={() => fileInputRef.current?.click()}
                                        disabled={uploadingImage || sending}
                                        className="p-2.5 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-xl transition-all disabled:opacity-40 flex-shrink-0"
                                        title="Send image"
                                    >
                                        {uploadingImage
                                            ? <div className="w-5 h-5 border-2 border-slate-400 border-t-transparent rounded-full animate-spin" />
                                            : <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><path d="M21 15l-5-5L5 21" /></svg>
                                        }
                                    </button>
                                    <textarea value={inputValue} onChange={e => setInputValue(e.target.value)}
                                        placeholder="Type your message..."
                                        className="flex-1 bg-transparent border-none outline-none py-3 px-2 resize-none text-sm max-h-32 min-h-[44px]"
                                        rows={1}
                                        onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendMessage(inputValue) } }}
                                    />
                                    <button onClick={() => handleSendMessage(inputValue)}
                                        disabled={sending || uploadingImage || !inputValue.trim()}
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
                                {isOrg ? 'Select a conversation to start chatting.' : 'Click an organization to see your donation threads.'}
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </>
    )
}

export default InboxClient