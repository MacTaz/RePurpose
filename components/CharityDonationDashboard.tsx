'use client';

import React, { useState } from 'react';
import { acceptDonation, rejectDonation } from '@/lib/donation-actions';
import { createClient } from '@/utils/supabase/client';
import { MapPin, Navigation, Clock, Package, Info, CheckCircle2, X } from 'lucide-react';

// VERSION: 3.1 - Refined Address Layout
interface Donation {
    id: string;
    donor_id: string;
    organization_id: string | null;
    type: string;
    quantity: number | null;
    status: string | null;
    created_at: string;
    donor_name: string;
    description: string | null;
    delivery_preference: string | null;
    donor_address?: string;
    donor_city?: string;
    donor_country?: string;
    donor_lat?: number;
    donor_lng?: number;
    donor_line1?: string;
    donor_line2?: string;
    donor_zip?: string;
}

interface Props {
    donation: Donation;
    onClose?: () => void;
}

const CharityDonationDashboard = ({ donation, onClose }: Props) => {
    const [loading, setLoading] = useState(false);
    const supabase = createClient();

    const handleAction = async (action: (id: string) => Promise<{ success?: boolean; error?: string }>) => {
        setLoading(true);
        const res = await action(donation.id);
        setLoading(false);
        if (res.success) onClose?.();
        else alert(res.error || 'Action failed');
    };

    const imageUrl = supabase.storage
        .from('donations')
        .getPublicUrl(`${donation.donor_id}/donation-${donation.id}/picture.jpg`).data.publicUrl;

    return (
        <div className="w-full max-w-[1500px] mx-auto flex flex-col gap-8 animate-in fade-in duration-500 pb-12">
            {/* Header / Profile Style Bar */}
            <div className="bg-white rounded-[40px] p-8 lg:p-10 shadow-sm border-2 border-[#FFB27D] flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-6">
                    <button
                        onClick={onClose}
                        className="size-12 bg-[#5A2C10] rounded-2xl flex items-center justify-center text-white hover:bg-black transition-colors shrink-0"
                    >
                        <X className="size-6" />
                    </button>
                    <div>
                        <div className="flex items-center gap-3">
                            <h1 className="text-3xl lg:text-4xl font-black text-[#5A2C10] tracking-tight lowercase">
                                {donation.donor_name}'s <span className="text-[#FF9248]">donation</span>
                            </h1>
                            <span className="px-4 py-1.5 bg-[#FF9248]/10 text-[#FF9248] rounded-full text-[10px] font-black uppercase tracking-widest">Awaiting Verification</span>
                        </div>
                        <p className="text-[#5A2C10]/50 font-bold text-sm mt-1 uppercase tracking-tighter">Request ID: #{String(donation.id).slice(0, 8)}</p>
                    </div>
                </div>

                <div className="flex gap-4 w-full md:w-auto">
                    <button
                        disabled={loading}
                        onClick={() => handleAction(acceptDonation)}
                        className="flex-1 md:flex-none px-10 py-5 bg-[#22C55E] text-white rounded-3xl font-black shadow-lg hover:scale-105 active:scale-95 transition-all text-sm uppercase tracking-widest border-4 border-white/20"
                    >
                        {loading ? 'Processing...' : 'Accept Donation'}
                    </button>
                    <button
                        disabled={loading}
                        onClick={() => handleAction(rejectDonation)}
                        className="flex-1 md:flex-none px-10 py-5 bg-white text-red-500 border-2 border-red-100 rounded-3xl font-black shadow-md hover:bg-red-50 transition-all text-sm uppercase tracking-widest"
                    >
                        Reject
                    </button>
                </div>
            </div>

            {/* Content Grid */}
            <div className="grid lg:grid-cols-3 gap-8 items-stretch">
                {/* Left Panel: Item & Narrative */}
                <div className="lg:col-span-2 space-y-8">
                    <div className="bg-white rounded-[40px] p-8 lg:p-12 shadow-sm border-2 border-[#FFB27D] flex flex-col h-full">
                        <h2 className="text-lg font-black text-[#5A2C10] mb-10 flex items-center gap-3 uppercase tracking-tighter opacity-40">
                            <Package className="size-5" /> Donation Details
                        </h2>

                        <div className="flex flex-col xl:flex-row gap-12 flex-1">
                            {/* Prominent Photo Area */}
                            <div className="w-full xl:w-[45%] aspect-square xl:aspect-auto rounded-[3.5rem] overflow-hidden bg-gray-50 border-2 border-[#FFB27D]/20 relative shadow-inner">
                                <img
                                    src={imageUrl}
                                    alt="Donation preview"
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                        (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1559416525-4c6e9cc05a66?auto=format&fit=crop&q=80&w=1000";
                                    }}
                                />
                            </div>

                            <div className="flex-1 flex flex-col justify-center space-y-10">
                                <div className="grid grid-cols-2 gap-6">
                                    <div className="bg-[#FFEDE1] p-6 rounded-[2.5rem] border-2 border-[#FFB27D]/30 relative overflow-hidden group">
                                        <div className="absolute top-0 right-0 w-20 h-20 bg-[#FFB27D]/5 rotate-45 translate-x-10 -translate-y-10"></div>
                                        <p className="text-[10px] font-black text-[#5A2C10]/40 uppercase tracking-widest mb-1">Total Quantity</p>
                                        <p className="text-3xl font-black text-[#5A2C10] leading-none">{donation.quantity} units</p>
                                    </div>
                                    <div className="bg-[#FFEDE1] p-6 rounded-[2.5rem] border-2 border-[#FFB27D]/30 relative overflow-hidden group">
                                        <div className="absolute top-0 right-0 w-20 h-20 bg-[#FFB27D]/5 rotate-45 translate-x-10 -translate-y-10"></div>
                                        <p className="text-[10px] font-black text-[#5A2C10]/40 uppercase tracking-widest mb-1">Item Category</p>
                                        <p className="text-xl font-black text-[#5A2C10] lowercase italic">{donation.type}</p>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div className="flex items-center gap-2 text-[10px] font-black text-[#5A2C10]/30 uppercase tracking-widest ml-1">
                                        <span className="px-5 py-2.5 bg-[#5A2C10] text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg italic mr-4">
                                            {donation.type}
                                        </span>
                                        <Info className="size-3" /> User Narrative
                                    </div>
                                    <div className="bg-gray-50/50 p-10 rounded-[3rem] border-2 border-dashed border-gray-200 min-h-[200px] flex items-center">
                                        <p className="text-[#5A2C10] text-2xl font-bold leading-relaxed lowercase italic">
                                            "{donation.description || "The donor has not provided any specific description for this contribution."}"
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Panel: Clean Address Details (Matching Image Request) */}
                <div className="space-y-8">
                    <div className="bg-white rounded-[40px] p-8 lg:p-10 shadow-sm border-2 border-[#5A2C10] flex flex-col gap-8 h-full">
                        <div className="flex items-center justify-between">
                            <h3 className="text-2xl font-black text-[#5A2C10] uppercase tracking-tighter flex items-center gap-3">
                                <MapPin className="size-6" /> Dispatch Address
                            </h3>
                        </div>

                        <div className="space-y-6">
                            {/* Address Line 1 */}
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-[#5A2C10]/40 uppercase tracking-widest ml-1">Address Line 1</label>
                                <div className="bg-[#F8FAFC] p-6 rounded-3xl border-2 border-transparent hover:border-[#FFB27D]/30 transition-all shadow-sm">
                                    <p className="text-xl font-black text-[#5A2C10]">{donation.donor_line1 || 'Missing Street Address'}</p>
                                </div>
                            </div>

                            {/* Address Line 2 */}
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-[#5A2C10]/40 uppercase tracking-widest ml-1">Address Line 2 (Optional)</label>
                                <div className="bg-[#F8FAFC] p-6 rounded-3xl border-2 border-transparent hover:border-[#FFB27D]/30 transition-all shadow-sm">
                                    <p className="text-base font-bold text-[#5A2C10]/60 italic">
                                        {donation.donor_line2 || 'Apartment, suite, unit, etc.'}
                                    </p>
                                </div>
                            </div>

                            {/* City & Country Grid */}
                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-[#5A2C10]/40 uppercase tracking-widest ml-1">City</label>
                                    <div className="bg-[#F8FAFC] p-6 rounded-3xl border-2 border-transparent hover:border-[#FFB27D]/30 transition-all shadow-sm">
                                        <p className="text-xl font-black text-[#5A2C10]">{donation.donor_city || 'City Not Set'}</p>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-[#5A2C10]/40 uppercase tracking-widest ml-1">Country</label>
                                    <div className="bg-[#F8FAFC] p-6 rounded-3xl border-2 border-transparent hover:border-[#FFB27D]/30 transition-all shadow-sm">
                                        <p className="text-xl font-black text-[#5A2C10]">{donation.donor_country || 'Country Not Set'}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Zip Code */}
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-[#5A2C10]/40 uppercase tracking-widest ml-1">Zip / Postal Code</label>
                                <div className="bg-[#F8FAFC] p-6 rounded-3xl border-2 border-transparent hover:border-[#FFB27D]/30 transition-all shadow-sm">
                                    <p className="text-2xl font-black text-[#5A2C10] tracking-widest">{donation.donor_zip || '----'}</p>
                                </div>
                            </div>

                            {/* Handover Mode */}
                            <div className="bg-[#5A2C10] p-6 rounded-[2.5rem] text-white flex items-center justify-between shadow-xl mt-4">
                                <div className="flex items-center gap-3">
                                    <div className="size-10 bg-white/10 rounded-xl flex items-center justify-center">
                                        <Navigation className="size-5" />
                                    </div>
                                    <span className="text-[10px] font-black uppercase tracking-widest opacity-40">Handover Mode</span>
                                </div>
                                <span className="text-2xl font-black lowercase italic">{donation.delivery_preference || 'pickup'}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <style jsx global>{`
                .animate-in { animation: fade-in 0.6s ease-out forwards; }
                @keyframes fade-in { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
            `}</style>
        </div>
    );
};

export default CharityDonationDashboard;
