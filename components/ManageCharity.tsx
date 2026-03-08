"use client"
import React, { useState } from 'react'
import CharityDonationDashboard from './CharityDonationDashboard'
import DonationStatus from './DonationStatus'
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
    donor_name: string
    description: string | null
    delivery_preference: string | null
    donor_address?: string
    donor_city?: string
    donor_country?: string
    donor_line1?: string
    donor_line2?: string
    donor_zip?: string
    org_zip?: string
    org_lat?: number
    org_lng?: number
    donor_lat?: number
    donor_lng?: number
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
                <svg className="w-6 h-6 text-[#5A2C10]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
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
                            className="w-full text-left px-5 py-2.5 hover:bg-[#FFB27D]/20 text-[#5A2C10] font-medium transition-colors"
                        >
                            {opt}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

const ManageCharity = ({ donations }: Props) => {
    const router = useRouter();
    const [selectedDonation, setSelectedDonation] = useState<Donation | null>(null);
    const [mode, setMode] = useState<'request' | 'status' | null>(null);
    const [isRefreshing, setIsRefreshing] = useState(false);

    const handleRefresh = () => {
        setIsRefreshing(true);
        router.refresh();
        setTimeout(() => setIsRefreshing(false), 1000);
    };

    const pendingDonations = donations.filter(d => d.status === 'pending');
    const acceptedDonations = donations.filter(d => d.status !== 'pending' && d.status !== 'rejected');

    const totalQuantity = donations.reduce((sum, d) => sum + (d.quantity || 1), 0);
    const typeSummary = donations.reduce<Record<string, number>>((acc, d) => {
        const t = d.type || 'Other';
        acc[t] = (acc[t] || 0) + (d.quantity || 1);
        return acc;
    }, {});

    if (mode === 'request' && selectedDonation) {
        return (
            <main className="w-full min-h-screen animate-in fade-in duration-500">
                <CharityDonationDashboard donation={selectedDonation} onClose={() => { setSelectedDonation(null); setMode(null); }} />
            </main>
        );
    }

    if (mode === 'status' && selectedDonation) {
        return (
            <main className="w-full min-h-screen animate-in fade-in duration-500">
                <DonationStatus donation={selectedDonation} onClose={() => { setSelectedDonation(null); setMode(null); }} />
            </main>
        );
    }

    return (
        <main className="w-full py-8 px-4 font-sans animate-in fade-in duration-500 flex-grow">
            <div className="w-full bg-gradient-to-br from-[#FFD1B3] to-[#FFB27D] rounded-[2rem] p-6 lg:p-12 shadow-2xl shadow-[#FFB27D]/30 border border-white/20 flex flex-col gap-10 relative overflow-hidden min-h-[85vh]">
                <div className="absolute top-[-10%] right-[-5%] w-96 h-96 bg-white/30 rounded-full blur-3xl pointer-events-none"></div>
                <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-white/30 rounded-full blur-3xl pointer-events-none"></div>

                {/* Container 1: Pending */}
                <div className="bg-white/40 backdrop-blur-md rounded-3xl overflow-hidden pb-8 shadow-lg border border-white/50 relative z-10 hover:bg-white/50 transition-all">
                    <div className="relative h-auto min-h-[4rem] py-5 flex flex-col md:flex-row items-center border-b border-white/40 bg-white/30 px-8">
                        <div className="flex-1">
                            <h2 className="text-2xl font-black text-[#5A2C10] tracking-tight">Requests Received</h2>
                            <p className="text-[#5A2C10]/60 text-xs font-bold uppercase tracking-widest mt-1">Pending approval</p>
                        </div>
                        <div className="flex items-center gap-3">
                            <button
                                onClick={handleRefresh}
                                disabled={isRefreshing}
                                className={`hover:opacity-80 transition-all bg-white/40 backdrop-blur-sm rounded-full p-2 border border-white/50 shadow-sm hover:scale-110 active:scale-95 ${isRefreshing ? 'animate-spin' : ''}`}
                                title="Refresh data"
                            >
                                <RotateCw className="w-6 h-6 text-[#5A2C10]" />
                            </button>
                            <FilterDropdown options={["Newest", "Quantity", "Type"]} onSelect={() => { }} />
                        </div>
                    </div>

                    <div className="mt-6 px-4 md:px-8 overflow-x-auto pb-4">
                        <div className="min-w-[600px] space-y-4">
                            <div className="flex space-x-4">
                                {["#", "Type", "Quantity", "Donor", "Date"].map(h => (
                                    <div key={h} className="flex-1 bg-white/90 rounded-full py-2.5 text-center text-[#5A2C10] text-[10px] font-black uppercase tracking-widest shadow-sm">{h}</div>
                                ))}
                            </div>

                            {pendingDonations.length === 0 ? (
                                <div className="text-center py-10 bg-white/20 rounded-2xl border border-dashed border-white/40 text-[#5A2C10]/60 font-bold">No pending requests at the moment.</div>
                            ) : (
                                pendingDonations.map((d, i) => (
                                    <div key={d.id} onClick={() => { setSelectedDonation(d); setMode('request'); }}
                                        className="flex w-full h-14 bg-white/80 rounded-xl border border-white/60 cursor-pointer hover:bg-white hover:scale-[1.01] hover:shadow-lg transition-all duration-300">
                                        <div className="flex-1 border-r border-[#FFB27D]/30 flex items-center justify-center font-black text-[#5A2C10]">{String(i + 1).padStart(3, '0')}</div>
                                        <div className="flex-1 border-r border-[#FFB27D]/30 flex items-center justify-center font-bold text-[#5A2C10] capitalize">{d.type}</div>
                                        <div className="flex-1 border-r border-[#FFB27D]/30 flex items-center justify-center font-bold text-[#5A2C10]">{d.quantity} units</div>
                                        <div className="flex-1 border-r border-[#FFB27D]/30 flex items-center justify-center font-bold text-[#5A2C10]">{d.donor_name}</div>
                                        <div className="flex-1 flex items-center justify-center font-bold text-[#5A2C10]">{new Date(d.created_at).toLocaleDateString()}</div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>

                {/* Container 2: Track Progress */}
                <div className="bg-white/40 backdrop-blur-md rounded-3xl overflow-hidden pb-8 shadow-lg border border-white/50 relative z-10 hover:bg-white/50 transition-all">
                    <div className="relative h-auto min-h-[4rem] py-5 flex flex-col md:flex-row items-center border-b border-white/40 bg-white/30 px-8">
                        <div className="flex-1">
                            <h2 className="text-2xl font-black text-[#5A2C10] tracking-tight">Track Progress</h2>
                            <p className="text-[#5A2C10]/60 text-xs font-bold uppercase tracking-widest mt-1">Ongoing fulfillment</p>
                        </div>
                        <div className="flex items-center gap-3">
                            <button
                                onClick={handleRefresh}
                                disabled={isRefreshing}
                                className={`hover:opacity-80 transition-all bg-white/40 backdrop-blur-sm rounded-full p-2 border border-white/50 shadow-sm hover:scale-110 active:scale-95 ${isRefreshing ? 'animate-spin' : ''}`}
                                title="Refresh data"
                            >
                                <RotateCw className="w-6 h-6 text-[#5A2C10]" />
                            </button>
                            <FilterDropdown options={["Newest", "Status", "Type"]} onSelect={() => { }} />
                        </div>
                    </div>

                    <div className="mt-6 px-4 md:px-8 overflow-x-auto pb-4">
                        <div className="min-w-[600px] space-y-4">
                            <div className="flex space-x-4">
                                {["#", "Type", "Status", "Donor", "Updates"].map(h => (
                                    <div key={h} className="flex-1 bg-white/90 rounded-full py-2.5 text-center text-[#5A2C10] text-[10px] font-black uppercase tracking-widest shadow-sm">{h}</div>
                                ))}
                            </div>

                            {acceptedDonations.length === 0 ? (
                                <div className="text-center py-10 bg-white/20 rounded-2xl border border-dashed border-white/40 text-[#5A2C10]/60 font-bold">No accepted donations to track.</div>
                            ) : (
                                acceptedDonations.map((d, i) => (
                                    <div key={d.id} onClick={() => { setSelectedDonation(d); setMode('status'); }}
                                        className="flex w-full h-14 bg-white/80 rounded-xl border border-white/60 cursor-pointer hover:bg-white hover:scale-[1.01] hover:shadow-lg transition-all duration-300">
                                        <div className="flex-1 border-r border-[#FFB27D]/30 flex items-center justify-center font-black text-[#5A2C10]">{String(i + 1).padStart(3, '0')}</div>
                                        <div className="flex-1 border-r border-[#FFB27D]/30 flex items-center justify-center font-bold text-[#5A2C10] capitalize">{d.type}</div>
                                        <div className="flex-1 border-r border-[#FFB27D]/30 flex items-center justify-center">
                                            <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${d.status === 'delivered' ? 'bg-green-100 text-green-700' :
                                                d.status === 'in_progress' ? 'bg-blue-100 text-blue-700' :
                                                    'bg-[#FFD1B3] text-[#5A2C10]'
                                                }`}>{d.status?.replace('_', ' ')}</span>
                                        </div>
                                        <div className="flex-1 border-r border-[#FFB27D]/30 flex items-center justify-center font-bold text-[#5A2C10]">{d.donor_name}</div>
                                        <div className="flex-1 flex items-center justify-center">
                                            <div className="w-full mx-6 h-1 bg-[#5A2C10]/10 rounded-full overflow-hidden">
                                                <div className={`h-full transition-all duration-500 ${d.status === 'delivered' ? 'w-full bg-green-500' : d.status === 'in_progress' ? 'w-2/3 bg-blue-500' : 'w-1/3 bg-[#5A2C10]'}`} />
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
                    <div className="bg-white/50 backdrop-blur-md rounded-[2.5rem] p-8 shadow-xl border border-white/60 transition-all hover:-translate-y-1">
                        <h3 className="text-xl font-black text-[#5A2C10] mb-8 uppercase tracking-widest text-center border-b border-white/40 pb-4">Overview</h3>
                        <div className="space-y-4 px-6">
                            {Object.entries(typeSummary).map(([type, qty]) => (
                                <div key={type} className="flex items-center justify-between group">
                                    <span className="text-xl font-black text-[#5A2C10]/80 group-hover:text-[#5A2C10] transition-colors capitalize">{type}</span>
                                    <div className="bg-white rounded-full w-20 py-2 text-center font-black text-[#5A2C10] shadow-sm transform group-hover:scale-110 transition-all">{qty}</div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="bg-white/50 backdrop-blur-md rounded-[2.5rem] p-8 shadow-xl border border-white/60 flex flex-col items-center justify-center transition-all hover:-translate-y-1">
                        <h3 className="text-lg font-black text-[#5A2C10] mb-6 uppercase tracking-widest">Total Volume</h3>
                        <div className="bg-white rounded-full w-56 h-56 flex flex-col items-center justify-center shadow-2xl border-4 border-white transform hover:scale-105 transition-all">
                            <span className="text-7xl font-black text-[#5A2C10] leading-none">{totalQuantity}</span>
                            <span className="text-[10px] font-black text-[#5A2C10]/40 uppercase tracking-[0.2em] mt-2">Active Units</span>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    )
}

export default ManageCharity
