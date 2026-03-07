'use client'

import React, { useEffect, useState, useRef, useCallback } from 'react'
import { createClient } from '@/utils/supabase/client'
import { createPortal } from 'react-dom'

interface Donation {
    id: string
    type: string
    quantity: number
    status: 'accepted' | 'in_progress' | 'delivered'
    created_at: string
    donor_id: string
    donor_name: string
}

const STATUS_OPTIONS = ['accepted', 'in_progress', 'delivered'] as const
type Status = typeof STATUS_OPTIONS[number]

const STATUS_CONFIG: Record<Status, { label: string; color: string; bg: string; dot: string }> = {
    accepted:    { label: 'ACCEPTED',    color: 'text-orange-700', bg: 'bg-orange-50 border-orange-200', dot: 'bg-[#FFB27D]' },
    in_progress: { label: 'IN PROGRESS', color: 'text-blue-700',   bg: 'bg-blue-50   border-blue-200',   dot: 'bg-blue-400'  },
    delivered:   { label: 'DELIVERED',   color: 'text-green-700',  bg: 'bg-green-50  border-green-200',  dot: 'bg-green-500' },
}

const TYPE_ICONS: Record<string, string> = {
    food: '🍱', clothes: '👕', clothing: '👕', water: '💧',
    medicine: '💊', blanket: '🛏️', other: '📦',
}
const getIcon = (type: string) => {
    const lower = type.toLowerCase()
    for (const [key, icon] of Object.entries(TYPE_ICONS)) {
        if (lower.includes(key)) return icon
    }
    return '📦'
}

const pad = (n: number) => String(n).padStart(3, '0')

// ── Portal Dropdown ────────────────────────────────────────────────────────
// Renders into document.body so it's never clipped by a scrollable parent
const StatusDropdown = ({
    current,
    anchorRef,
    onSelect,
    onClose,
}: {
    current: Status
    anchorRef: React.RefObject<HTMLButtonElement>
    onSelect: (s: Status) => void
    onClose: () => void
}) => {
    const dropRef = useRef<HTMLDivElement>(null)
    const [pos, setPos] = useState({ top: 0, left: 0 })

    // Position the dropdown right below the anchor button
    useEffect(() => {
        if (anchorRef.current) {
            const rect = anchorRef.current.getBoundingClientRect()
            setPos({
                top: rect.bottom + window.scrollY + 6,
                left: rect.left + window.scrollX,
            })
        }
    }, [])

    // Close on outside click
    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (
                dropRef.current && !dropRef.current.contains(e.target as Node) &&
                anchorRef.current && !anchorRef.current.contains(e.target as Node)
            ) onClose()
        }
        document.addEventListener('mousedown', handler)
        return () => document.removeEventListener('mousedown', handler)
    }, [])

    return createPortal(
        <div
            ref={dropRef}
            style={{ position: 'absolute', top: pos.top, left: pos.left, zIndex: 9999 }}
            className="bg-white rounded-2xl shadow-2xl border border-[#FFB27D]/30 overflow-hidden min-w-[190px]"
            onClick={e => e.stopPropagation()}
        >
            <div className="px-4 py-2.5 border-b border-orange-50">
                <p className="text-[10px] font-black text-orange-300 uppercase tracking-widest">Update Status</p>
            </div>
            {STATUS_OPTIONS.map(s => {
                const cfg = STATUS_CONFIG[s]
                const isActive = s === current
                return (
                    <button
                        key={s}
                        onClick={() => { onSelect(s); onClose() }}
                        className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-orange-50 ${isActive ? 'bg-orange-50/60' : ''}`}
                    >
                        <span className={`w-2 h-2 rounded-full flex-shrink-0 ${cfg.dot}`} />
                        <span className={`text-sm font-bold ${cfg.color}`}>{cfg.label}</span>
                        {isActive && (
                            <svg className="ml-auto w-4 h-4 text-[#FFB27D]" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                                <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        )}
                    </button>
                )
            })}
        </div>,
        document.body
    )
}

// ── Donation Card ──────────────────────────────────────────────────────────
const DonationCard = ({
    donation,
    index,
    onStatusChange,
}: {
    donation: Donation
    index: number
    onStatusChange: (id: string, status: Status) => void
}) => {
    const [open, setOpen] = useState(false)
    const [optimisticStatus, setOptimisticStatus] = useState<Status>(donation.status)
    const anchorRef = useRef<HTMLButtonElement>(null)
    const cfg = STATUS_CONFIG[optimisticStatus]

    const handleSelect = (s: Status) => {
        setOptimisticStatus(s)
        onStatusChange(donation.id, s)
    }

    return (
        <div className="bg-white rounded-2xl border border-[#FFB27D]/30 shadow-sm hover:shadow-md transition-shadow duration-200">
            <div className="grid grid-cols-[60px_1fr_180px_1fr_1fr] items-center px-5 py-4 gap-4">

                {/* # */}
                <div className="text-center">
                    <span className="text-sm font-black text-[#c47a3a]">{pad(index + 1)}</span>
                </div>

                {/* Type */}
                <div className="flex items-center gap-2">
                    <span className="text-xl">{getIcon(donation.type)}</span>
                    <span className="text-sm font-bold text-slate-800 capitalize">{donation.type}</span>
                    {donation.quantity && (
                        <span className="text-xs text-slate-400 font-medium">×{donation.quantity}</span>
                    )}
                </div>

                {/* Status badge — portal dropdown attached here */}
                <div className="flex justify-center">
                    <button
                        ref={anchorRef}
                        onClick={() => setOpen(o => !o)}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-black tracking-wider transition-all hover:shadow-sm ${cfg.bg} ${cfg.color}`}
                    >
                        <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                        {cfg.label}
                        <svg className={`w-3 h-3 transition-transform ${open ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                            <path d="M19 9l-7 7-7-7" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </button>
                    {open && (
                        <StatusDropdown
                            current={optimisticStatus}
                            anchorRef={anchorRef}
                            onSelect={handleSelect}
                            onClose={() => setOpen(false)}
                        />
                    )}
                </div>

                {/* Donor */}
                <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-[#FFE8D4] flex items-center justify-center text-xs font-black text-[#c47a3a] flex-shrink-0">
                        {donation.donor_name.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-sm font-semibold text-slate-700 truncate">{donation.donor_name}</span>
                </div>

                {/* Date */}
                <div className="text-right">
                    <span className="text-xs text-slate-400 font-medium">
                        {new Date(donation.created_at).toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                </div>
            </div>
        </div>
    )
}

// ── Main Component ─────────────────────────────────────────────────────────
const StatusManagement = ({ orgId }: { orgId: string }) => {
    const supabase = createClient()
    const [donations, setDonations] = useState<Donation[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchDonations = async () => {
            const { data, error } = await supabase
                .from('donations')
                .select(`
                    id, type, quantity, status, created_at, donor_id,
                    profiles!donor_id ( full_name )
                `)
                .eq('organization_id', orgId)
                .in('status', ['accepted', 'in_progress', 'delivered'])
                .order('created_at', { ascending: false })

            if (error) { console.error(error); setLoading(false); return }

            const mapped: Donation[] = (data || []).map((d: any) => ({
                id: d.id,
                type: d.type,
                quantity: d.quantity,
                status: d.status,
                created_at: d.created_at,
                donor_id: d.donor_id,
                donor_name: d.profiles?.full_name || 'Unknown Donor',
            }))
            setDonations(mapped)
            setLoading(false)
        }
        fetchDonations()
    }, [orgId])

    const handleStatusChange = async (id: string, newStatus: Status) => {
        const { error } = await supabase
            .from('donations')
            .update({ status: newStatus })
            .eq('id', id)

        if (error) {
            console.error('Failed to update status:', error)
        } else {
            setDonations(prev => prev.map(d => d.id === id ? { ...d, status: newStatus } : d))
        }
    }

    return (
        <div className="flex flex-col h-full">
            {/* Column headers */}
            <div className="grid grid-cols-[60px_1fr_180px_1fr_1fr] items-center px-5 py-3 gap-4 mb-2">
                {['#', 'TYPE', 'STATUS', 'DONOR', 'DATE'].map(h => (
                    <div key={h} className={h === 'STATUS' ? 'text-center' : h === 'DATE' ? 'text-right' : ''}>
                        <span className="text-[10px] font-black text-[#c47a3a]/60 uppercase tracking-widest">{h}</span>
                    </div>
                ))}
            </div>

            {/* Cards */}
            <div className="flex-1 overflow-y-auto space-y-2 pr-1" style={{ scrollbarWidth: 'thin', scrollbarColor: '#FFB27D transparent' }}>
                {loading ? (
                    Array.from({ length: 3 }).map((_, i) => (
                        <div key={i} className="bg-white rounded-2xl border border-[#FFB27D]/20 px-5 py-4 animate-pulse">
                            <div className="grid grid-cols-[60px_1fr_180px_1fr_1fr] gap-4 items-center">
                                <div className="h-4 w-8 bg-orange-100 rounded mx-auto" />
                                <div className="h-4 w-24 bg-orange-100 rounded" />
                                <div className="h-7 w-28 bg-orange-100 rounded-full mx-auto" />
                                <div className="h-4 w-32 bg-orange-100 rounded" />
                                <div className="h-4 w-20 bg-orange-100 rounded ml-auto" />
                            </div>
                        </div>
                    ))
                ) : donations.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 text-center gap-3">
                        <div className="text-4xl opacity-30">📭</div>
                        <p className="text-sm font-semibold text-orange-300">No donations here yet</p>
                        <p className="text-xs text-orange-200">Accepted donations will appear once donors submit them.</p>
                    </div>
                ) : (
                    donations.map((donation, i) => (
                        <DonationCard
                            key={donation.id}
                            donation={donation}
                            index={i}
                            onStatusChange={handleStatusChange}
                        />
                    ))
                )}
            </div>
        </div>
    )
}

export default StatusManagement