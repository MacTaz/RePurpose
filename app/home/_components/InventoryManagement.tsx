'use client'

import React, { useState, useEffect, useRef } from 'react'
import { createClient } from '@/utils/supabase/client'

interface Inventory {
    food: number
    water: number
    clothes: number
}

interface Props {
    orgId: string
}

type ItemType = 'Food' | 'Water' | 'Clothes'

const ITEMS: { type: ItemType; icon: string; color: string; bg: string; border: string; key: keyof Inventory }[] = [
    { type: 'Food',    icon: '🍱', color: 'text-orange-700', bg: 'bg-orange-50',  border: 'border-orange-200', key: 'food'    },
    { type: 'Water',   icon: '💧', color: 'text-blue-700',   bg: 'bg-blue-50',    border: 'border-blue-200',   key: 'water'   },
    { type: 'Clothes', icon: '👕', color: 'text-purple-700', bg: 'bg-purple-50',  border: 'border-purple-200', key: 'clothes' },
]

const InventoryManagement = ({ orgId }: Props) => {
    const supabase = createClient()
    const [inventory, setInventory] = useState<Inventory>({ food: 0, water: 0, clothes: 0 })
    const [urgentNeed, setUrgentNeed] = useState<string | null>(null)
    const [loading, setLoading] = useState(true)
    const [updatingUrgent, setUpdatingUrgent] = useState(false)
    const channelRef = useRef<any>(null)

    // Fetch inventory + urgent_need on mount
    useEffect(() => {
        const fetchData = async () => {
            const [{ data: inv }, { data: orgProfile }] = await Promise.all([
                supabase
                    .from('organization_inventory')
                    .select('food, water, clothes')
                    .eq('org_id', orgId)
                    .single(),
                supabase
                    .from('organization_profiles')
                    .select('urgent_need')
                    .eq('profile_id', orgId)
                    .single(),
            ])

            if (inv) setInventory({ food: inv.food, water: inv.water, clothes: inv.clothes })
            if (orgProfile) setUrgentNeed(orgProfile.urgent_need)
            setLoading(false)
        }
        fetchData()

        // Realtime — watch inventory table for changes
        channelRef.current = supabase
            .channel(`inventory:${orgId}`)
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'organization_inventory',
                    filter: `org_id=eq.${orgId}`,
                },
                (payload: any) => {
                    const d = payload.new
                    if (d) setInventory({ food: d.food, water: d.water, clothes: d.clothes })
                }
            )
            .subscribe()

        return () => {
            if (channelRef.current) supabase.removeChannel(channelRef.current)
        }
    }, [orgId])

    // Toggle urgent need — clicking the active one clears it, clicking another sets it
    const handleUrgentToggle = async (type: ItemType) => {
        if (updatingUrgent) return
        setUpdatingUrgent(true)

        const newValue = urgentNeed?.toLowerCase() === type.toLowerCase() ? null : type.toLowerCase()

        const { error } = await supabase
            .from('organization_profiles')
            .update({ urgent_need: newValue })
            .eq('profile_id', orgId)

        if (!error) setUrgentNeed(newValue)
        setUpdatingUrgent(false)
    }

    const isUrgent = (type: ItemType) =>
        urgentNeed?.toLowerCase() === type.toLowerCase()

    return (
        <div className="flex flex-col h-full gap-4">
            {/* Inventory counts */}
            <div className="grid grid-cols-3 gap-3">
                {ITEMS.map(item => (
                    <div
                        key={item.type}
                        className={`flex flex-col items-center justify-center p-4 rounded-2xl border-2 ${item.bg} ${item.border} transition-all duration-300`}
                    >
                        {loading ? (
                            <div className="w-10 h-8 bg-white/60 rounded-lg animate-pulse mb-2" />
                        ) : (
                            <span className={`text-3xl font-black ${item.color} leading-none`}>
                                {inventory[item.key]}
                            </span>
                        )}
                        <div className="flex items-center gap-1.5 mt-2">
                            <span className="text-base">{item.icon}</span>
                            <span className={`text-xs font-black uppercase tracking-widest ${item.color}`}>
                                {item.type}
                            </span>
                        </div>
                        <span className="text-[10px] text-slate-400 font-medium mt-1">units</span>
                    </div>
                ))}
            </div>

            {/* Divider */}
            <div className="flex items-center gap-3">
                <div className="flex-1 h-px bg-[#FFB27D]/30" />
                <span className="text-[10px] font-black text-[#c47a3a]/50 uppercase tracking-widest">Urgent Need</span>
                <div className="flex-1 h-px bg-[#FFB27D]/30" />
            </div>

            {/* Urgent need buttons */}
            <div className="grid grid-cols-3 gap-3">
                {ITEMS.map(item => {
                    const active = isUrgent(item.type)
                    return (
                        <button
                            key={item.type}
                            onClick={() => handleUrgentToggle(item.type)}
                            disabled={updatingUrgent}
                            className={`relative flex flex-col items-center justify-center gap-1.5 py-3 px-2 rounded-2xl border-2 font-black text-xs uppercase tracking-widest transition-all duration-200 disabled:opacity-50
                                ${active
                                    ? `${item.bg} ${item.border} ${item.color} shadow-md scale-[1.03]`
                                    : 'bg-white border-[#FFB27D]/30 text-slate-400 hover:border-[#FFB27D]/60 hover:text-slate-600 hover:scale-[1.02]'
                                }`}
                        >
                            {active && (
                                <span className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center shadow-md">
                                    <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                                        <path d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                </span>
                            )}
                            <span className="text-xl">{item.icon}</span>
                            <span>{item.type}</span>
                            {active && (
                                <span className="text-[9px] font-black opacity-70">URGENT ✕ tap to clear</span>
                            )}
                        </button>
                    )
                })}
            </div>
        </div>
    )
}

export default InventoryManagement