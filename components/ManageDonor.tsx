"use client"
import React, { useState } from 'react'
import DonorDonationDashboard from './DonorDonationDashboard';
import { useRouter } from 'next/navigation'
import { RotateCw } from 'lucide-react'

interface Donation {
    id: string
    donor_id: string
    organization_id: string | null
    type: string
    quantity: number | null
    status: string | null
    created_at: string
    target_organization: string | null
    org_name?: string
    org_address?: string
    org_city?: string
    org_country?: string
    org_lat?: number
    org_lng?: number
    org_line1?: string
    org_line2?: string
    org_zip?: string
}

interface Props {
    donations: Donation[]
}

const FilterDropdown = ({ options, onSelect }: { options: string[], onSelect: (val: string) => void }) => {
    const [isOpen, setIsOpen] = useState(false);
    return (
        <div className="relative z-20">
            <button
                onClick={(e) => { e.stopPropagation(); setIsOpen(!isOpen) }}
                className="hover:opacity-80 transition-all bg-white/40 backdrop-blur-sm rounded-full p-2 border border-white/50 shadow-sm hover:scale-105"
            >
                <svg className="w-6 h-6 text-[#30496E]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 3c2.755 0 5.455.232 8.083.678.533.09.917.556.917 1.096v1.044a2.25 2.25 0 0 1-.659 1.591l-5.432 5.432a2.25 2.25 0 0 0-.659 1.591v2.927a2.25 2.25 0 0 1-1.244 2.013L9.75 21v-6.568a2.25 2.25 0 0 0-.659-1.591L3.659 7.409A2.25 2.25 0 0 1 3 5.818V4.774c0-.54.384-1.006.917-1.096A48.32 48.32 0 0 1 12 3Z" />
                </svg>
            </button>
            {isOpen && (
                <div className="absolute right-0 top-full mt-2 w-48 bg-white/90 backdrop-blur-md rounded-2xl shadow-xl border border-white/50 py-2 animate-in fade-in zoom-in-95 duration-200">
                    {options.map((opt) => (
                        <button
                            key={opt}
                            onClick={(e) => {
                                e.stopPropagation();
                                onSelect(opt);
                                setIsOpen(false);
                            }}
                            className="w-full text-left px-5 py-2.5 hover:bg-[#9BBAD0]/20 text-[#30496E] font-medium transition-colors"
                        >
                            {opt}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

const ManageDonor = ({ donations }: Props) => {
    const router = useRouter();
    const [selectedDonation, setSelectedDonation] = useState<Donation | null>(null);
    const [isRefreshing, setIsRefreshing] = useState(false);

    const handleRefresh = () => {
        setIsRefreshing(true);
        router.refresh();
        setTimeout(() => setIsRefreshing(false), 1000);
    };

    const isEmpty = donations.length === 0
    const totalDonated = donations.reduce((sum, d) => sum + (d.quantity || 1), 0)
    const categorySummary = donations.reduce<Record<string, number>>((acc, d) => {
        const key = (d.type || 'other')
        acc[key] = (acc[key] || 0) + (d.quantity || 1)
        return acc
    }, {})
    const categoryEntries = Object.entries(categorySummary).sort((a, b) => b[1] - a[1])

    if (selectedDonation) {
        return (
            <main className="w-full py-8 px-4 flex justify-center animate-in fade-in zoom-in-95 duration-500">
                <DonorDonationDashboard donation={selectedDonation} onClose={() => setSelectedDonation(null)} />
            </main>
        );
    }

    return (
        <main className="w-full py-8 px-4 font-sans animate-in fade-in duration-500 flex-grow">
            <div className="w-full bg-gradient-to-br from-[#9BBAD0] to-[#80A6C2] rounded-[2rem] p-6 lg:p-12 shadow-2xl shadow-[#9BBAD0]/30 border border-white/20 flex flex-col gap-10 relative overflow-hidden min-h-[85vh]">
                <div className="absolute top-[-10%] right-[-5%] w-96 h-96 bg-white/10 rounded-full blur-3xl pointer-events-none"></div>
                <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-white/10 rounded-full blur-3xl pointer-events-none"></div>

                <div className="bg-white/30 backdrop-blur-md rounded-3xl overflow-hidden pb-8 shadow-lg border border-white/40 relative z-10 transition-all hover:bg-white/40">
                    <div className="relative h-auto min-h-[5rem] py-5 flex flex-col md:flex-row items-center border-b border-white/30 bg-white/20 px-8">
                        <div className="flex-1">
                            <h1 className="text-2xl font-black text-white tracking-tight">Donations Sent</h1>
                            <p className="text-white/60 text-xs font-bold uppercase tracking-widest mt-1">History of contributions</p>
                        </div>
                        <div className="flex items-center gap-3">
                            <button
                                onClick={handleRefresh}
                                disabled={isRefreshing}
                                className={`hover:opacity-80 transition-all bg-white/40 backdrop-blur-sm rounded-full p-2 border border-white/50 shadow-sm hover:scale-110 active:scale-95 ${isRefreshing ? 'animate-spin' : ''}`}
                                title="Refresh data"
                            >
                                <RotateCw className="w-6 h-6 text-[#30496E]" />
                            </button>
                            <FilterDropdown options={["All", "Type", "Charity", "Date"]} onSelect={() => { }} />
                        </div>
                    </div>

                    <div className="mt-8 px-4 md:px-8 pb-4 overflow-x-auto relative z-10">
                        <div className="min-w-[700px] space-y-4">
                            <div className="flex space-x-4">
                                {["#", "Type", "Charity Sent To", "Status", "Date"].map(h => (
                                    <div key={h} className="flex-1 bg-white/80 rounded-full py-2.5 text-center text-[#30496E] text-[10px] font-black uppercase tracking-widest shadow-sm">{h}</div>
                                ))}
                            </div>

                            {isEmpty ? (
                                <div className="text-center py-10 bg-white/10 rounded-2xl border border-dashed border-white/30 text-white/60 font-bold">No donations reported yet.</div>
                            ) : (
                                donations.map((donation, index) => (
                                    <div key={donation.id} onClick={() => setSelectedDonation(donation)}
                                        className="flex w-full h-14 bg-white/70 backdrop-blur-sm rounded-xl border border-white/50 cursor-pointer hover:bg-white hover:scale-[1.01] hover:shadow-lg transition-all duration-300">
                                        <div className="flex-1 border-r border-[#9BBAD0]/30 flex items-center justify-center font-black text-[#30496E]">{String(index + 1).padStart(3, '0')}</div>
                                        <div className="flex-1 border-r border-[#9BBAD0]/30 flex items-center justify-center font-bold text-[#30496E] capitalize">{donation.type}</div>
                                        <div className="flex-1 border-r border-[#9BBAD0]/30 flex items-center justify-center font-bold text-[#30496E]">{donation.org_name || donation.target_organization || '—'}</div>
                                        <div className="flex-1 border-r border-[#9BBAD0]/30 flex items-center justify-center font-bold text-[#30496E]">
                                            <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${donation.status === 'delivered' ? 'bg-green-100 text-green-700' :
                                                donation.status === 'pending' ? 'bg-orange-100 text-orange-700' :
                                                    'bg-blue-100 text-blue-700'
                                                }`}>{donation.status?.replace('_', ' ')}</span>
                                        </div>
                                        <div className="flex-1 flex items-center justify-center font-bold text-[#30496E]">
                                            {new Date(donation.created_at).toLocaleDateString()}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10 w-full">
                    <div className="bg-white/40 backdrop-blur-md rounded-[2.5rem] p-10 shadow-xl border border-white/50 transition-all hover:-translate-y-1 flex flex-col items-center">
                        <h2 className="text-2xl font-black text-[#30496E] mb-8 uppercase tracking-widest border-b border-white/40 pb-4 w-full text-center">Overview</h2>
                        <div className="w-full space-y-4 px-6">
                            {categoryEntries.map(([type, total]) => (
                                <div key={type} className="flex items-center justify-between group">
                                    <span className="text-xl font-black text-white group-hover:text-[#30496E] transition-colors capitalize">{type}</span>
                                    <div className="bg-white rounded-full w-24 py-2 text-center font-black text-[#30496E] shadow-sm transform group-hover:scale-110 transition-all">{total}</div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="bg-white/40 backdrop-blur-md rounded-[2.5rem] p-10 shadow-xl border border-white/50 flex flex-col items-center justify-center transition-all hover:-translate-y-1">
                        <h2 className="text-lg font-black text-[#30496E] mb-6 uppercase tracking-widest text-center">Total Volume</h2>
                        <div className="bg-white rounded-full w-56 h-56 flex flex-col items-center justify-center shadow-2xl border-4 border-white transform hover:scale-105 transition-all">
                            <span className="text-7xl font-black text-[#30496E] leading-none">{totalDonated}</span>
                            <span className="text-[10px] font-black text-[#30496E]/40 uppercase tracking-[0.2em] mt-2">Contributions</span>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    )
}

export default ManageDonor