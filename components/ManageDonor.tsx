"use client"
import React, { useState } from 'react'
import DonorDonationDashboard from './DonorDonationDashboard';

interface Donation {
    id: string
    donor_id: string
    organization_id: string | null
    type: string
    quantity: number | null
    status: string | null
    created_at: string
    target_organization: string | null
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
                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M4.25 5.61C6.27 8.2 10 13 10 13v6c0 .55.45 1 1 1h2c.55 0 1-.45 1-1v-6c0 0 3.72-4.8 5.74-7.39A.998.998 0 0019 4H5c-.83 0-1.3.95-.75 1.61z" />
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

// Skeleton pulse row for empty state
const SkeletonRow = () => (
    <div className="flex w-full h-14 bg-white/40 backdrop-blur-sm rounded-xl border border-white/30 animate-pulse">
        <div className="flex-[0.25] border-r border-[#9BBAD0]/30 flex items-center justify-center">
            <div className="h-3 w-10 bg-white/60 rounded-full" />
        </div>
        <div className="flex-[0.25] border-r border-[#9BBAD0]/30 flex items-center justify-center">
            <div className="h-3 w-16 bg-white/60 rounded-full" />
        </div>
        <div className="flex-[0.25] border-r border-[#9BBAD0]/30 flex items-center justify-center">
            <div className="h-3 w-20 bg-white/60 rounded-full" />
        </div>
        <div className="flex-[0.25] flex items-center justify-center">
            <div className="h-3 w-16 bg-white/60 rounded-full" />
        </div>
    </div>
)

const ManageDonor = ({ donations }: Props) => {
    const [selectedRequest, setSelectedRequest] = useState<boolean>(false);
    const isEmpty = donations.length === 0

    // Build category summary: { type -> total quantity }
    const categorySummary = donations.reduce<Record<string, number>>((acc, d) => {
        const key = (d.type || 'other')
        acc[key] = (acc[key] || 0) + (d.quantity || 1)
        return acc
    }, {})
    const categoryEntries = Object.entries(categorySummary).sort((a, b) => b[1] - a[1])

    // Total = sum of all quantities
    const totalDonated = donations.reduce((sum, d) => sum + (d.quantity || 1), 0)

    if (selectedRequest) {
        return (
            <main className="max-w-7xl mx-auto py-8 px-4 w-full flex-grow flex justify-center">
                <DonorDonationDashboard onClose={() => setSelectedRequest(false)} />
            </main>
        );
    }

    return (
        <main className="w-full max-w-6xl mx-auto py-8 px-4 font-sans animate-in fade-in duration-500 flex-grow">
            <div className="w-full bg-gradient-to-br from-[#9BBAD0] to-[#80A6C2] rounded-[2rem] p-8 lg:p-12 shadow-2xl shadow-[#9BBAD0]/30 border border-white/20 flex flex-col gap-10 relative overflow-hidden min-h-[800px]">
                {/* Decorative background circles */}
                <div className="absolute top-[-10%] right-[-5%] w-96 h-96 bg-white/10 rounded-full blur-3xl pointer-events-none"></div>
                <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-white/10 rounded-full blur-3xl pointer-events-none"></div>

                {/* Top box: Donations Sent */}
                <div className="bg-white/30 backdrop-blur-md rounded-3xl overflow-hidden pb-8 md:pb-12 shadow-lg border border-white/40 relative z-10 transition-all hover:bg-white/40">
                    <div className="relative h-auto min-h-[5rem] py-4 flex flex-col md:flex-row items-center justify-center border-b border-white/30 bg-white/20 px-4 md:px-8 gap-4">
                        <h1 className="text-xl md:text-2xl font-extrabold text-white tracking-wide w-full text-center md:text-left">Donations Sent</h1>
                        <div className="md:absolute right-4 md:right-6 flex items-center h-full">
                            <FilterDropdown
                                options={["All", "Type", "Charity Sent To", "Date"]}
                                onSelect={(val) => console.log("Selected filter:", val)}
                            />
                        </div>
                    </div>

                    <div className="mt-6 md:mt-8 px-4 md:px-8 pb-4 overflow-x-auto relative z-10">
                        <div className="min-w-[600px] space-y-4">
                            {/* Headers */}
                            <div className="flex space-x-4 mb-3">
                                <div className="flex-[0.25] bg-white/80 backdrop-blur-sm rounded-full py-2.5 text-center text-[#30496E] font-bold text-xs uppercase tracking-wider shadow-sm">Number</div>
                                <div className="flex-[0.25] bg-white/80 backdrop-blur-sm rounded-full py-2.5 text-center text-[#30496E] font-bold text-xs uppercase tracking-wider shadow-sm">Type</div>
                                <div className="flex-[0.25] bg-white/80 backdrop-blur-sm rounded-full py-2.5 text-center text-[#30496E] font-bold text-xs uppercase tracking-wider shadow-sm">Charity Sent To</div>
                                <div className="flex-[0.25] bg-white/80 backdrop-blur-sm rounded-full py-2.5 text-center text-[#30496E] font-bold text-xs uppercase tracking-wider shadow-sm">Date</div>
                            </div>

                            {/* Empty state: skeleton rows + message */}
                            {isEmpty && (
                                <>
                                    <SkeletonRow />
                                    <SkeletonRow />
                                    <SkeletonRow />
                                    <p className="text-center text-white/60 text-sm pt-2">
                                        No donations sent yet. Your records will appear here once you make a donation.
                                    </p>
                                </>
                            )}

                            {/* Real rows from Supabase */}
                            {donations.map((donation, index) => (
                                <div
                                    key={donation.id}
                                    className="flex w-full h-14 bg-white/70 backdrop-blur-sm rounded-xl border border-white/50 cursor-pointer hover:bg-white hover:shadow-md hover:scale-[1.01] transition-all duration-300"
                                    onClick={() => setSelectedRequest(true)}
                                >
                                    <div className="flex-[0.25] border-r border-[#9BBAD0]/30 flex items-center justify-center font-medium text-[#30496E]">
                                        {String(index + 1).padStart(3, '0')}
                                    </div>
                                    <div className="flex-[0.25] border-r border-[#9BBAD0]/30 flex items-center justify-center font-medium text-[#30496E] capitalize">
                                        {donation.type}
                                    </div>
                                    <div className="flex-[0.25] border-r border-[#9BBAD0]/30 flex items-center justify-center font-medium text-[#30496E]">
                                        {donation.target_organization || '—'}
                                    </div>
                                    <div className="flex-[0.25] flex items-center justify-center font-medium text-[#30496E]">
                                        {new Date(donation.created_at).toLocaleDateString('en-PH', {
                                            month: 'short', day: 'numeric', year: 'numeric'
                                        })}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Bottom two boxes */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10 w-full">

                    {/* Left box: Overview */}
                    <div className="bg-white/40 backdrop-blur-md rounded-3xl p-6 md:p-10 shadow-xl border border-white/50 transition-all hover:bg-white/50 hover:-translate-y-1 flex flex-col items-center">
                        <h2 className="text-xl md:text-2xl font-extrabold text-[#30496E] mb-6 md:mb-8 uppercase tracking-widest border-b border-white/40 pb-4 w-full md:w-[80%] text-center">Overview</h2>

                        <div className="w-full md:w-[80%] space-y-4 md:space-y-6">
                            {isEmpty && (
                                <>
                                    {/* Skeleton category rows */}
                                    {['', '', ''].map((_, i) => (
                                        <div key={i} className="flex items-center justify-between animate-pulse">
                                            <div className="h-4 w-20 bg-white/50 rounded-full" />
                                            <div className="bg-white/50 rounded-full w-24 py-1.5 h-8" />
                                        </div>
                                    ))}
                                    <p className="text-center text-white/50 text-xs pt-2">
                                        Category totals will appear here
                                    </p>
                                </>
                            )}

                            {categoryEntries.map(([type, total]) => (
                                <div key={type} className="flex items-center justify-between group">
                                    <span className="text-xl font-bold text-white tracking-wide group-hover:text-[#30496E] transition-colors capitalize">
                                        {type}
                                    </span>
                                    <div className="bg-white/90 rounded-full w-24 py-1.5 text-center font-extrabold text-[#30496E] shadow-sm transform group-hover:scale-110 transition-transform">
                                        {total}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Right box: Total */}
                    <div className="bg-white/40 backdrop-blur-md rounded-3xl p-6 md:p-10 shadow-xl border border-white/50 flex flex-col items-center justify-center transition-all hover:bg-white/50 hover:-translate-y-1">
                        <h2 className="text-lg md:text-xl font-extrabold text-[#30496E] mb-6 uppercase tracking-widest text-center">Total Donations Sent</h2>
                        {isEmpty ? (
                            <div className="flex flex-col items-center gap-3">
                                <div className="bg-white/50 rounded-full w-48 py-4 animate-pulse h-16" />
                                <p className="text-white/50 text-xs">No donations recorded yet</p>
                            </div>
                        ) : (
                            <div className="bg-white/90 rounded-full w-48 py-4 text-center shadow-lg border border-white/50 transform hover:scale-105 transition-all">
                                <span className="text-4xl font-black text-[#30496E]">{totalDonated}</span>
                            </div>
                        )}
                    </div>

                </div>
            </div>
        </main>
    )
}

export default ManageDonor