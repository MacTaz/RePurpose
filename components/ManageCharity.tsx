"use client"
import React, { useState } from 'react'
import CharityDonationDashboard from './CharityDonationDashboard'
import DonationStatus from './DonationStatus'

const FilterDropdown = ({ options, onSelect }: { options: string[], onSelect: (val: string) => void }) => {
    const [isOpen, setIsOpen] = useState(false);
    return (
        <div className="relative z-20">
            <button
                onClick={(e) => { e.stopPropagation(); setIsOpen(!isOpen) }}
                className="hover:opacity-80 transition-all bg-white/40 backdrop-blur-sm rounded-full p-2 border border-white/50 shadow-sm hover:scale-105"
            >
                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M4 4h16v2.5l-6 7.5v6l-4 2v-8L4 6.5V4z" />
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

const ManageCharity = () => {
    const [selectedRequest, setSelectedRequest] = useState<boolean>(false);
    const [selectedAcceptedRequest, setSelectedAcceptedRequest] = useState<boolean>(false);

    if (selectedRequest) {
        return (
            <main className="max-w-7xl mx-auto py-8 px-4 w-full flex-grow flex justify-center">
                <CharityDonationDashboard onClose={() => setSelectedRequest(false)} />
            </main>
        );
    }

    if (selectedAcceptedRequest) {
        return (
            <main className="max-w-7xl mx-auto py-8 px-4 w-full flex-grow flex justify-center">
                <DonationStatus onClose={() => setSelectedAcceptedRequest(false)} />
            </main>
        );
    }

    return (
        <main className="w-full max-w-6xl mx-auto py-8 px-4 font-sans animate-in fade-in duration-500 flex-grow">
            <div className="w-full bg-gradient-to-br from-[#FFD1B3] to-[#FFB27D] rounded-[2rem] p-8 lg:p-12 shadow-2xl shadow-[#FFB27D]/30 border border-white/20 flex flex-col gap-10 relative overflow-hidden min-h-[800px]">
                <div className="absolute top-[-10%] right-[-5%] w-96 h-96 bg-white/30 rounded-full blur-3xl pointer-events-none"></div>
                <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-white/30 rounded-full blur-3xl pointer-events-none"></div>

                {/* Container 1: Donations Request Received */}
                <div className="bg-white/40 backdrop-blur-md rounded-3xl overflow-hidden pb-12 shadow-lg border border-white/50 relative z-10 transition-all hover:bg-white/50">
                    <div className="relative h-16 flex items-center justify-center border-b border-white/40 bg-white/30">
                        <h2 className="text-xl font-extrabold text-[#5A2C10] tracking-wide">Donation Requests Received</h2>
                        <div className="absolute right-4 flex items-center">
                            <FilterDropdown
                                options={["All", "Type", "Quantity", "Date"]}
                                onSelect={(val) => console.log("Selected filter:", val)}
                            />
                        </div>
                    </div>

                    <div className="mt-6 px-6 space-y-3">
                        {/* Headers */}
                        <div className="flex space-x-4 mb-2">
                            <div className="flex-1 bg-white/90 backdrop-blur-sm rounded-full py-2 text-center text-[#5A2C10] text-xs font-bold uppercase tracking-wider shadow-sm">Number</div>
                            <div className="flex-1 bg-white/90 backdrop-blur-sm rounded-full py-2 text-center text-[#5A2C10] text-xs font-bold uppercase tracking-wider shadow-sm">Type</div>
                            <div className="flex-1 bg-white/90 backdrop-blur-sm rounded-full py-2 text-center text-[#5A2C10] text-xs font-bold uppercase tracking-wider shadow-sm">Quantity</div>
                            <div className="flex-1 bg-white/90 backdrop-blur-sm rounded-full py-2 text-center text-[#5A2C10] text-xs font-bold uppercase tracking-wider shadow-sm">Date</div>
                        </div>

                        {/* Rows */}
                        <div
                            className="flex w-full h-12 bg-white/80 backdrop-blur-sm rounded-xl border border-white/60 cursor-pointer hover:bg-white hover:shadow-md hover:scale-[1.01] transition-all duration-300"
                            onClick={() => setSelectedRequest(true)}
                        >
                            <div className="flex-1 border-r border-[#FFB27D]/30 flex items-center justify-center font-medium text-[#5A2C10]">001</div>
                            <div className="flex-1 border-r border-[#FFB27D]/30 flex items-center justify-center font-medium text-[#5A2C10]">Clothes</div>
                            <div className="flex-1 border-r border-[#FFB27D]/30 flex items-center justify-center font-medium text-[#5A2C10]">5 boxes</div>
                            <div className="flex-1 flex items-center justify-center font-medium text-[#5A2C10]">Oct 24, 2023</div>
                        </div>
                        <div
                            className="flex w-full h-12 bg-white/80 backdrop-blur-sm rounded-xl border border-white/60 cursor-pointer hover:bg-white hover:shadow-md hover:scale-[1.01] transition-all duration-300"
                            onClick={() => setSelectedRequest(true)}
                        >
                            <div className="flex-1 border-r border-[#FFB27D]/30 flex items-center justify-center font-medium text-[#5A2C10]">002</div>
                            <div className="flex-1 border-r border-[#FFB27D]/30 flex items-center justify-center font-medium text-[#5A2C10]">Food</div>
                            <div className="flex-1 border-r border-[#FFB27D]/30 flex items-center justify-center font-medium text-[#5A2C10]">10 kg</div>
                            <div className="flex-1 flex items-center justify-center font-medium text-[#5A2C10]">Oct 25, 2023</div>
                        </div>
                    </div>
                </div>

                {/* Container 2: Accepted Donation Requests */}
                <div className="bg-white/40 backdrop-blur-md rounded-3xl overflow-hidden pb-12 shadow-lg border border-white/50 relative z-10 transition-all hover:bg-white/50">
                    <div className="relative h-16 flex items-center justify-center border-b border-white/40 bg-white/30">
                        <h2 className="text-xl font-extrabold text-[#5A2C10] tracking-wide">Accepted Donation Requests</h2>
                        <div className="absolute right-4 flex items-center">
                            <FilterDropdown
                                options={["All", "Type", "Status"]}
                                onSelect={(val) => console.log("Selected filter:", val)}
                            />
                        </div>
                    </div>

                    <div className="mt-6 px-6 space-y-3">
                        {/* Headers */}
                        <div className="flex space-x-4 mb-2">
                            <div className="flex-1 bg-white/90 backdrop-blur-sm rounded-full py-2 text-center text-[#5A2C10] text-xs font-bold uppercase tracking-wider shadow-sm">Number</div>
                            <div className="flex-1 bg-white/90 backdrop-blur-sm rounded-full py-2 text-center text-[#5A2C10] text-xs font-bold uppercase tracking-wider shadow-sm">Type</div>
                            <div className="flex-1 bg-white/90 backdrop-blur-sm rounded-full py-2 text-center text-[#5A2C10] text-xs font-bold uppercase tracking-wider shadow-sm">Status</div>
                        </div>

                        {/* Rows */}
                        <div
                            className="flex w-full h-12 bg-white/80 backdrop-blur-sm rounded-xl border border-white/60 cursor-pointer hover:bg-white hover:shadow-md hover:scale-[1.01] transition-all duration-300"
                            onClick={() => setSelectedAcceptedRequest(true)}
                        >
                            <div className="flex-1 border-r border-[#FFB27D]/30 flex items-center justify-center font-medium text-[#5A2C10]">003</div>
                            <div className="flex-1 border-r border-[#FFB27D]/30 flex items-center justify-center font-medium text-[#5A2C10]">Water</div>
                            <div className="flex-1 flex items-center justify-center font-medium text-[#5A2C10]">In Transit</div>
                        </div>
                        <div
                            className="flex w-full h-12 bg-white/80 backdrop-blur-sm rounded-xl border border-white/60 cursor-pointer hover:bg-white hover:shadow-md hover:scale-[1.01] transition-all duration-300"
                            onClick={() => setSelectedAcceptedRequest(true)}
                        >
                            <div className="flex-1 border-r border-[#FFB27D]/30 flex items-center justify-center font-medium text-[#5A2C10]">004</div>
                            <div className="flex-1 border-r border-[#FFB27D]/30 flex items-center justify-center font-medium text-[#5A2C10]">Clothes</div>
                            <div className="flex-1 flex items-center justify-center font-medium text-[#5A2C10]">Picked Up</div>
                        </div>
                    </div>
                </div>

                {/* Bottom Section */}
                <div className="relative z-10 pt-4">
                    <div className="flex flex-col md:flex-row justify-center gap-8">
                        {/* Overview Card */}
                        <div className="bg-white/50 backdrop-blur-md rounded-3xl p-8 w-full md:w-[450px] shadow-xl border border-white/60 transition-all hover:bg-white/60 hover:-translate-y-1">
                            <h3 className="text-2xl font-extrabold text-[#5A2C10] text-center mb-8 uppercase tracking-widest border-b border-white/50 pb-4">Overview</h3>
                            <div className="space-y-6">
                                <div className="flex items-center justify-between group">
                                    <span className="text-xl font-bold text-[#8A4A20] tracking-wide group-hover:text-[#5A2C10] transition-colors">Clothes</span>
                                    <div className="bg-white/90 rounded-full w-24 py-1.5 text-center font-extrabold text-[#5A2C10] shadow-sm transform group-hover:scale-110 transition-transform">12</div>
                                </div>
                                <div className="flex items-center justify-between group">
                                    <span className="text-xl font-bold text-[#8A4A20] tracking-wide group-hover:text-[#5A2C10] transition-colors">Food</span>
                                    <div className="bg-white/90 rounded-full w-24 py-1.5 text-center font-extrabold text-[#5A2C10] shadow-sm transform group-hover:scale-110 transition-transform">8</div>
                                </div>
                                <div className="flex items-center justify-between group">
                                    <span className="text-xl font-bold text-[#8A4A20] tracking-wide group-hover:text-[#5A2C10] transition-colors">Water</span>
                                    <div className="bg-white/90 rounded-full w-24 py-1.5 text-center font-extrabold text-[#5A2C10] shadow-sm transform group-hover:scale-110 transition-transform">4</div>
                                </div>
                            </div>
                        </div>

                        {/* Total Donation Card */}
                        <div className="bg-white/50 backdrop-blur-md rounded-3xl p-8 w-full md:w-[350px] flex flex-col items-center shadow-xl border border-white/60 transition-all hover:bg-white/60 hover:-translate-y-1 justify-center">
                            <h3 className="text-xl font-extrabold text-[#5A2C10] text-center mb-6 uppercase tracking-widest">Total Donations</h3>
                            <div className="bg-white/90 rounded-full w-48 py-4 text-center shadow-lg border border-white/60 transform hover:scale-105 transition-all">
                                <span className="text-4xl font-black text-[#5A2C10]">24</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    )
}

export default ManageCharity
