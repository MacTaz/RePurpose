'use client'

import React, { useState, useEffect, useRef } from 'react'
import { createClient } from '@/utils/supabase/client'
import CharityDonationDashboard from '@/components/CharityDonationDashboard'

interface Donation {
    id: string
    donor_id: string
    organization_id: string | null
    type: string
    quantity: number | null
    status: string | null
    created_at: string
    donor_name: string
    description: string | null
    delivery_preference: string | null
    donor_address?: string
    donor_city?: string
    donor_country?: string
    donor_line1?: string
    donor_line2?: string
    donor_zip?: string
    donor_lat?: number
    donor_lng?: number
}

interface Props {
    donations: Donation[]
    orgId: string
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

const IncomingMatches = ({ donations, orgId }: Props) => {
    const supabase = createClient()
    const [localDonations, setLocalDonations] = useState<Donation[]>(donations)
    const [selected, setSelected] = useState<Donation | null>(null)
    const [newIds, setNewIds] = useState<Set<string>>(new Set()) // tracks freshly arrived cards for animation
    const channelRef = useRef<any>(null)

    // Realtime subscription — listens for new pending donations for this org
    useEffect(() => {
        channelRef.current = supabase
            .channel(`incoming_matches:${orgId}`)
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'donations',
                    filter: `organization_id=eq.${orgId}`,
                },
                async (payload: any) => {
                    const d = payload.new
                    if (d.status !== 'pending') return

                    // Fetch donor name + address from profiles
                    const { data: profile } = await supabase
                        .from('profiles')
                        .select(`full_name, addresses(city, country, address_line1, address_line2, zip, latitude, longitude)`)
                        .eq('id', d.donor_id)
                        .single()

                    const addr = (profile as any)?.addresses?.[0] || {}

                    const newDonation: Donation = {
                        id: d.id,
                        donor_id: d.donor_id,
                        organization_id: d.organization_id,
                        type: d.type,
                        quantity: d.quantity,
                        status: d.status,
                        created_at: d.created_at,
                        description: d.description ?? null,
                        delivery_preference: d.delivery_preference ?? null,
                        donor_name: profile?.full_name || 'Anonymous Donor',
                        donor_address: addr.city ? `${addr.city}, ${addr.country}` : 'City Not Set',
                        donor_city: addr.city || 'City Not Set',
                        donor_country: addr.country || 'Country Not Set',
                        donor_line1: addr.address_line1 || 'Missing Street Address',
                        donor_line2: addr.address_line2,
                        donor_zip: addr.zip || '----',
                        donor_lat: addr.latitude,
                        donor_lng: addr.longitude,
                    }

                    // Prepend to list and mark as new for highlight animation
                    setLocalDonations(prev => {
                        if (prev.find(x => x.id === d.id)) return prev
                        return [newDonation, ...prev]
                    })
                    setNewIds(prev => new Set(prev).add(d.id))

                    // Remove highlight after 3s
                    setTimeout(() => {
                        setNewIds(prev => {
                            const next = new Set(prev)
                            next.delete(d.id)
                            return next
                        })
                    }, 3000)
                }
            )
            .subscribe()

        return () => {
            if (channelRef.current) supabase.removeChannel(channelRef.current)
        }
    }, [orgId])

    const handleClose = () => setSelected(null)

    const handleAccepted = (donationId: string) => {
        setLocalDonations(prev => prev.filter(d => d.id !== donationId))
        setSelected(null)
    }

    if (selected) {
        return (
            <div className="w-full h-full animate-in fade-in duration-300">
                <CharityDonationDashboard
                    donation={selected}
                    onClose={handleClose}
                />
            </div>
        )
    }

    return (
        <div className="flex flex-col h-full">
            {/* Column headers */}
            <div className="grid grid-cols-[50px_1fr_80px_1fr] gap-3 px-4 pt-4 pb-2">
                {['#', 'TYPE', 'QTY', 'DONOR'].map(h => (
                    <div key={h} className={h === '#' ? 'text-center' : ''}>
                        <span className="text-[10px] font-black text-[#c47a3a]/60 uppercase tracking-widest">{h}</span>
                    </div>
                ))}
            </div>

            {/* Cards */}
            <div
                className="flex-1 overflow-y-auto px-3 pb-3 space-y-2"
                style={{ scrollbarWidth: 'thin', scrollbarColor: '#FFB27D transparent' }}
            >
                {localDonations.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full py-12 text-center gap-3">
                        <div className="text-4xl opacity-30">📭</div>
                        <p className="text-sm font-semibold text-orange-300">No incoming matches</p>
                        <p className="text-xs text-orange-200">Pending donations will appear here in real time.</p>
                    </div>
                ) : (
                    localDonations.map((d, i) => {
                        const isNew = newIds.has(d.id)
                        return (
                            <button
                                key={d.id}
                                onClick={() => setSelected(d)}
                                className={`w-full grid grid-cols-[50px_1fr_80px_1fr] gap-3 items-center px-4 py-3 rounded-2xl border shadow-sm hover:shadow-md hover:scale-[1.01] transition-all duration-300 text-left group
                                    ${isNew
                                        ? 'bg-orange-50 border-[#FFB27D] ring-2 ring-[#FFB27D]/40 animate-pulse'
                                        : 'bg-white border-[#FFB27D]/30 hover:border-[#FFB27D]/60'
                                    }`}
                            >
                                {/* # */}
                                <div className="text-center">
                                    <span className="text-sm font-black text-[#c47a3a]">
                                        {String(i + 1).padStart(3, '0')}
                                    </span>
                                </div>

                                {/* Type */}
                                <div className="flex items-center gap-2 min-w-0">
                                    <span className="text-lg">{getIcon(d.type)}</span>
                                    <span className="text-sm font-bold text-slate-800 capitalize truncate">{d.type}</span>
                                    {isNew && (
                                        <span className="ml-1 text-[9px] font-black text-[#FFB27D] uppercase tracking-widest bg-orange-50 px-1.5 py-0.5 rounded-full border border-[#FFB27D]/40">
                                            New
                                        </span>
                                    )}
                                </div>

                                {/* Quantity */}
                                <div>
                                    <span className="text-sm font-semibold text-slate-500">
                                        ×{d.quantity ?? '—'}
                                    </span>
                                </div>

                                {/* Donor */}
                                <div className="flex items-center gap-2 min-w-0">
                                    <div className="w-6 h-6 rounded-md bg-[#FFE8D4] flex items-center justify-center text-[10px] font-black text-[#c47a3a] flex-shrink-0">
                                        {d.donor_name.charAt(0).toUpperCase()}
                                    </div>
                                    <span className="text-sm font-semibold text-slate-700 truncate">{d.donor_name}</span>
                                    <svg
                                        className="ml-auto w-4 h-4 text-[#FFB27D] opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
                                        fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"
                                    >
                                        <path d="M9 18l6-6-6-6" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                </div>
                            </button>
                        )
                    })
                )}
            </div>
        </div>
    )
}

export default IncomingMatches