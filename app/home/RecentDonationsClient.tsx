'use client'

import React from 'react'

interface Donation {
    id: string
    type: string
    created_at: string
    amount?: number | null
    status?: string | null
}

interface Props {
    donations: Donation[]
    onSelect?: (donation: Donation) => void
}

const TYPE_ICONS: Record<string, string> = {
    food: '🍱', Clothes: '👕', clothes: '👕', clothing: '👕',
    Food: '🍱', Water: '💧', water: '💧', other: '📦',
}

const getIcon = (type: string) => {
    const lower = (type || '').toLowerCase()
    for (const [key, icon] of Object.entries(TYPE_ICONS)) {
        if (lower.includes(key)) return icon
    }
    return '📦'
}

const RecentDonationsClient = ({ donations, onSelect }: Props) => {
    return (
        <div className="flex-1 border-[6px] border-[#7BA4D5] rounded-xl overflow-hidden shadow-sm flex flex-col">
            <div className="bg-[#7BA4D5] px-6 py-3">
                <h2 className="text-white text-xl font-bold">Recent Donations</h2>
            </div>
            <div className="flex-1 bg-white overflow-hidden flex flex-col">
                {donations.length === 0 ? (
                    <div className="flex-1 flex flex-col items-center justify-center p-6 text-center gap-3">
                        <div className="w-14 h-14 rounded-full bg-[#DDE6ED] flex items-center justify-center text-2xl">
                            💙
                        </div>
                        <p className="text-gray-700 font-semibold text-sm">No donations yet</p>
                        <p className="text-gray-400 text-xs leading-relaxed max-w-[200px]">
                            Sorry, we couldn't find any donation records for your account. Your generosity starts here — make your first donation today!
                        </p>
                    </div>
                ) : (
                    <div className="flex-1 overflow-y-auto divide-y divide-gray-50" style={{ scrollbarWidth: 'thin', scrollbarColor: '#DDE6ED transparent' }}>
                        {donations.map((donation) => (
                            <div
                                key={donation.id}
                                onClick={() => onSelect?.(donation)}
                                className="flex items-center gap-3 px-5 py-3 hover:bg-[#F5F8FA] transition-colors cursor-pointer group"
                            >
                                <div className="w-9 h-9 rounded-lg bg-[#EEF3F9] flex items-center justify-center text-lg flex-shrink-0">
                                    {getIcon(donation.type)}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-semibold text-gray-800 capitalize truncate">{donation.type}</p>
                                    <p className="text-xs text-gray-400">
                                        {new Date(donation.created_at).toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' })}
                                    </p>
                                </div>
                                {donation.status && (
                                    <span className={`text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-widest flex-shrink-0 ${donation.status === 'rejected'
                                            ? 'bg-red-100 text-red-500'
                                            : donation.status === 'delivered'
                                                ? 'bg-green-100 text-green-600'
                                                : donation.status === 'in_progress'
                                                    ? 'bg-yellow-100 text-yellow-600'
                                                    : 'bg-blue-100 text-[#3a5f8a]'
                                        }`}>
                                        {donation.status.replace('_', ' ')}
                                    </span>
                                )}
                                {donation.amount != null && (
                                    <span className="text-sm font-bold text-[#7BA4D5] flex-shrink-0">
                                        ₱{Number(donation.amount).toLocaleString()}
                                    </span>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}

export default RecentDonationsClient