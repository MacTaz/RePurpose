'use client';

import React, { useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { MapPin, Navigation, Clock, Package, Info, CheckCircle2, X } from 'lucide-react';
import { acceptDonation, rejectDonation } from '@/lib/donation-actions';

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

    const acceptDonation = async (id: string): Promise<{ success?: boolean; error?: string }> => {
        const { error } = await supabase
            .from('donations')
            .update({ status: 'accepted' })
            .eq('id', id);
        return error ? { error: error.message } : { success: true };
    };

    const rejectDonation = async (id: string): Promise<{ success?: boolean; error?: string }> => {
        const { error } = await supabase
            .from('donations')
            .update({ status: 'rejected' })
            .eq('id', id);
        return error ? { error: error.message } : { success: true };
    };

    const imageUrl = supabase.storage
        .from('donations')
        .getPublicUrl(`${donation.donor_id}/donation-${donation.id}/picture.jpg`).data.publicUrl;

    return (
        <div className="w-full max-w-[1600px] mx-auto flex flex-col gap-8 animate-in fade-in duration-700 pb-20 px-4 md:px-0">
            {/* Contextual Top Bar */}
            <div className="flex items-center justify-between bg-white/40 backdrop-blur-xl border border-white/60 p-6 rounded-[2.5rem] shadow-2xl shadow-[#5A2C10]/5">
                <div className="flex items-center gap-6">
                    <button
                        onClick={onClose}
                        className="group size-14 bg-white border-2 border-[#5A2C10]/10 rounded-2xl flex items-center justify-center text-[#5A2C10] hover:bg-[#5A2C10] hover:text-white transition-all shadow-sm active:scale-95"
                    >
                        <X className="size-6 group-hover:rotate-90 transition-transform duration-300" />
                    </button>
                    <div>
                        <div className="flex items-center gap-3">
                            <h1 className="text-3xl font-black text-[#5A2C10] tracking-tight">
                                Manage <span className="text-[#FF9248]">Donation</span>
                            </h1>
                            <div className="px-3 py-1 bg-green-500/10 text-green-600 rounded-full text-[9px] font-black uppercase tracking-widest border border-green-500/20">
                                {donation.status || 'Active'}
                            </div>
                        </div>
                        <p className="text-[#5A2C10]/40 font-bold text-xs mt-0.5 tracking-widest uppercase">ID: {String(donation.id).padStart(6, '0')}</p>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <button
                        disabled={loading}
                        onClick={() => handleAction(rejectDonation)}
                        className="px-8 py-4 bg-white text-red-500 border-2 border-red-50 rounded-2xl font-black shadow-sm hover:bg-red-50 active:scale-95 transition-all text-xs uppercase tracking-widest"
                    >
                        Decline
                    </button>
                    <button
                        disabled={loading}
                        onClick={() => handleAction(acceptDonation)}
                        className="px-10 py-4 bg-[#5A2C10] text-white rounded-2xl font-black shadow-xl shadow-[#5A2C10]/20 hover:scale-[1.02] active:scale-95 transition-all text-xs uppercase tracking-widest flex items-center gap-2 group"
                    >
                        {loading ? 'Processing...' : 'Accept Donation'}
                        <CheckCircle2 className="size-4 group-hover:translate-x-1 transition-transform" />
                    </button>
                </div>
            </div>

            <div className="grid lg:grid-cols-12 gap-8 items-start">
                {/* Visual Content Column */}
                <div className="lg:col-span-8 space-y-8">
                    {/* Main Card */}
                    <div className="bg-white rounded-[3.5rem] p-4 lg:p-6 shadow-2xl shadow-[#5A2C10]/10 border border-[#5A2C10]/5 overflow-hidden">
                        <div className="flex flex-col xl:flex-row gap-8">
                            {/* Cinematic Image Frame */}
                            <div className="w-full xl:w-[55%] relative group">
                                <div className="absolute -inset-1 bg-gradient-to-br from-[#FF9248] to-[#5A2C10] rounded-[3rem] blur opacity-10 group-hover:opacity-20 transition duration-1000"></div>
                                <div className="relative aspect-[4/5] rounded-[3rem] overflow-hidden bg-gray-100 shadow-2xl border-4 border-white">
                                    <img
                                        src={imageUrl}
                                        alt="Donation preview"
                                        className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-700"
                                        onError={(e) => {
                                            (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1559416525-4c6e9cc05a66?auto=format&fit=crop&q=80&w=1000";
                                        }}
                                    />
                                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-8">
                                        <div className="flex items-center gap-3">
                                            <div className="px-5 py-2.5 bg-white/20 backdrop-blur-md rounded-full border border-white/30 text-white text-xs font-black uppercase tracking-widest">
                                                {donation.type}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Narrative and Stats */}
                            <div className="flex-1 flex flex-col p-4">
                                <div className="flex items-center gap-3 mb-8">
                                    <div className="size-10 bg-[#FF9248]/10 rounded-xl flex items-center justify-center text-[#FF9248]">
                                        <Info className="size-5" />
                                    </div>
                                    <h3 className="text-xl font-black text-[#5A2C10]">Item Description</h3>
                                </div>

                                <div className="relative mb-10 overflow-hidden">
                                    <div className="absolute top-0 left-0 text-6xl font-serif text-[#FF9248]/10 select-none">"</div>
                                    <p className="relative z-10 text-2xl lg:text-3xl font-bold text-[#5A2C10] leading-relaxed italic px-6 py-4">
                                        {donation.description || "No specific details provided."}
                                    </p>
                                    <div className="absolute bottom-0 right-0 text-6xl font-serif text-[#FF9248]/10 select-none translate-y-4">"</div>
                                </div>

                                <div className="grid grid-cols-2 gap-4 mt-auto">
                                    <div className="bg-[#5A2C10]/5 p-6 rounded-3xl border border-[#5A2C10]/5 transition-colors hover:bg-[#5A2C10]/10">
                                        <p className="text-[9px] font-black text-[#5A2C10]/40 uppercase tracking-[0.2em] mb-2">Quantity</p>
                                        <p className="text-3xl font-black text-[#5A2C10]">{donation.quantity} <span className="text-xs opacity-50 font-bold uppercase ml-1">Units</span></p>
                                    </div>
                                    <div className="bg-[#FF9248]/5 p-6 rounded-3xl border border-[#FF9248]/5 transition-colors hover:bg-[#FF9248]/10">
                                        <p className="text-[9px] font-black text-[#5A2C10]/40 uppercase tracking-[0.2em] mb-2">Category</p>
                                        <p className="text-xl font-black text-[#5A2C10] uppercase tracking-tighter">{donation.type}</p>
                                    </div>
                                </div>

                                <div className="mt-8 pt-8 border-t border-gray-100 flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="size-10 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-600">
                                            <div className="size-2 bg-blue-600 rounded-full animate-pulse" />
                                        </div>
                                        <div>
                                            <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Sent By</p>
                                            <p className="font-black text-[#5A2C10]">{donation.donor_name}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">DONATION METHOD</p>
                                        <p className="font-black text-[#5A2C10] uppercase tracking-tighter">{donation.delivery_preference || 'pickup'}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Logistics Column */}
                <div className="lg:col-span-4 space-y-8">
                    {/* Address Master Card */}
                    <div className="bg-[#5A2C10] rounded-[3.5rem] p-10 text-white shadow-2xl shadow-[#5A2C10]/30 relative overflow-hidden group">
                        {/* Decorative Background Element */}
                        <div className="absolute top-0 right-0 size-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl group-hover:bg-white/10 transition-colors duration-700"></div>

                        <div className="relative z-10">
                            <div className="flex items-center justify-between mb-10">
                                <h3 className="text-2xl font-black tracking-tighter flex items-center gap-3">
                                    Donor <span className="text-[#FF9248]">Address</span>
                                </h3>
                                <MapPin className="size-6 text-[#FF9248]" />
                            </div>

                            <div className="space-y-6">
                                {/* Primary Line */}
                                <div className="space-y-3">
                                    <div className="flex items-center gap-2 opacity-40">
                                        <Navigation className="size-3" />
                                        <span className="text-[9px] font-black uppercase tracking-[0.2em]">Street</span>
                                    </div>
                                    <p className="text-2xl font-black tracking-tight leading-tight">
                                        {donation.donor_line1 || 'Not Set'}
                                    </p>
                                    {donation.donor_line2 && (
                                        <p className="text-sm font-bold opacity-60 bg-white/10 px-4 py-2 rounded-xl inline-block">
                                            {donation.donor_line2}
                                        </p>
                                    )}
                                </div>

                                {/* Secondary Info Grid */}
                                <div className="grid grid-cols-2 gap-6 pt-6 border-t border-white/10">
                                    <div>
                                        <p className="text-[9px] font-black uppercase tracking-[0.2em] opacity-40 mb-1">City</p>
                                        <p className="text-lg font-black">{donation.donor_city || 'Not Set'}</p>
                                    </div>
                                    <div>
                                        <p className="text-[9px] font-black uppercase tracking-[0.2em] opacity-40 mb-1">Country</p>
                                        <p className="text-lg font-black">{donation.donor_country || 'Not Set'}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Integrated Map */}
                    {donation.donor_lat && donation.donor_lng ? (
                        <div className="relative h-[400px] rounded-[3.5rem] overflow-hidden border-4 border-[#5A2C10]/10 shadow-2xl group">
                            <iframe
                                width="100%"
                                height="100%"
                                style={{ border: 0 }}
                                loading="lazy"
                                src={`https://maps.google.com/maps?q=${parseFloat(String(donation.donor_lat))},${parseFloat(String(donation.donor_lng))}&t=&z=15&ie=UTF8&iwloc=&output=embed`}
                                className="grayscale-[0.2] contrast-[1.2] hover:grayscale-0 transition-all duration-700"
                            />
                            {/* Interactive Overlay */}
                            <div className="absolute inset-x-4 bottom-4 ">
                                <div className="bg-white/80 backdrop-blur-md p-4 rounded-[2rem] border border-white flex items-center justify-between shadow-lg">
                                    <div className="flex items-center gap-3">
                                        <div className="size-10 bg-[#5A2C10] rounded-xl flex items-center justify-center text-white">
                                            <MapPin className="size-5" />
                                        </div>
                                        <div>
                                            <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Pin Location</p>
                                            <p className="text-xs font-black text-[#5A2C10]">{donation.donor_name}</p>
                                        </div>
                                    </div>
                                    <a
                                        href={`https://www.google.com/maps/search/?api=1&query=${donation.donor_lat},${donation.donor_lng}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="size-10 bg-[#FF9248]/10 rounded-xl flex items-center justify-center text-[#FF9248] hover:bg-[#FF9248] hover:text-white transition-all shadow-sm active:scale-95"
                                    >
                                        <Navigation className="size-5" />
                                    </a>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="relative h-[300px] rounded-[3.5rem] overflow-hidden border-4 border-[#5A2C10]/10 bg-gray-50 flex flex-col items-center justify-center text-center p-8">
                            <div className="size-16 bg-[#5A2C10]/5 rounded-full flex items-center justify-center text-[#5A2C10]/20 mb-4">
                                <MapPin className="size-8" />
                            </div>
                            <h4 className="text-lg font-black text-[#5A2C10]">Map Unset</h4>
                            <p className="text-sm font-bold text-[#5A2C10]/40 max-w-[200px] mt-2">The donor has not yet specified a pinned location for this address.</p>
                        </div>
                    )}
                </div>
            </div>

            <style jsx global>{`
                .animate-in { animation: fade-up 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
                @keyframes fade-up { 
                    from { opacity: 0; transform: translateY(40px); } 
                    to { opacity: 1; transform: translateY(0); } 
                }
            `}</style>
        </div>
    );
};

export default CharityDonationDashboard;
