'use client';

import React, { useState } from 'react';
import { acceptDonation, rejectDonation } from '@/lib/donation-actions';
import { createClient } from '@/utils/supabase/client';

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
        <div className="w-full max-w-5xl mx-auto bg-[#FFEDE1] border-[8px] border-[#FFB27D] rounded-[3.5rem] p-8 lg:p-12 shadow-2xl relative flex flex-col items-center animate-in zoom-in-95 duration-500 min-h-[85vh] my-4">
            {/* Back Button */}
            {onClose && (
                <button
                    onClick={onClose}
                    className="absolute top-10 left-10 flex items-center gap-2 font-black text-[#5A2C10] hover:scale-105 active:scale-95 transition-all group"
                >
                    <div className="size-10 bg-[#FFB27D] rounded-full flex items-center justify-center group-hover:bg-[#FF9248] text-white transition-colors">←</div>
                    <span className="text-xl uppercase tracking-widest">Back</span>
                </button>
            )}

            {/* Header */}
            <div className="w-full text-center mt-8 mb-4">
                <h1 className="text-5xl lg:text-7xl font-black text-[#5A2C10] tracking-tighter lowercase">
                    {donation.donor_name}'s <span className="text-[#FF9248]">request</span>
                </h1>
            </div>

            {/* Solid Divider */}
            <div className="w-full h-2 bg-[#5A2C10] my-8 rounded-full"></div>

            {/* Content Grid */}
            <div className="flex flex-col xl:flex-row w-full gap-12 mt-4 flex-1">
                {/* Left Side: Photo & Quick Stats */}
                <div className="w-full xl:w-5/12 flex flex-col gap-8">
                    <div className="w-full aspect-[4/5] rounded-[3rem] overflow-hidden bg-white shadow-2xl border-4 border-[#FFB27D] animate-in slide-in-from-left-8 duration-700">
                        <img
                            src={imageUrl}
                            alt="Donation preview"
                            className="w-full h-full object-cover"
                            onError={(e) => {
                                // Fallback to placeholder if image fails to load
                                (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1559416525-4c6e9cc05a66?auto=format&fit=crop&q=80&w=1000";
                            }}
                        />
                    </div>
                </div>

                {/* Right Side: Detailed View */}
                <div className="flex-1 flex flex-col gap-10 animate-in slide-in-from-right-8 duration-700">
                    <div className="flex flex-wrap gap-4">
                        <div className="px-10 py-5 bg-white rounded-full shadow-lg border-2 border-[#FFB27D] text-[#5A2C10] font-black text-2xl lowercase tracking-tighter">
                            Category: {donation.type}
                        </div>
                        <div className="px-10 py-5 bg-white rounded-full shadow-lg border-2 border-[#FFB27D] text-[#5A2C10] font-black text-2xl lowercase tracking-tighter">
                            Quantity: {donation.quantity} units
                        </div>
                    </div>

                    <div className="bg-white rounded-[3rem] p-12 shadow-2xl flex-1 border-4 border-[#FFB27D]/50">
                        <h3 className="text-[#5A2C10]/40 text-xs font-black uppercase tracking-[0.3em] mb-6">User Description</h3>
                        <p className="text-[#5A2C10] text-2xl md:text-3xl font-black leading-tight lowercase">
                            {donation.description || "The donor wants to give items of high quality and durability. No specific damage noted. Items are ready for immediate collection or shipment."}
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
                        <div className="bg-[#FFB27D] p-8 rounded-[2.5rem] shadow-xl text-white flex flex-col items-center">
                            <span className="text-sm font-black uppercase tracking-widest mb-4 opacity-70">Handover Mode</span>
                            <span className="text-3xl font-black lowercase">{donation.delivery_preference || 'Pickup'}</span>
                        </div>
                        <div className="bg-[#5A2C10] p-8 rounded-[2.5rem] shadow-xl text-white flex flex-col items-center">
                            <span className="text-sm font-black uppercase tracking-widest mb-4 opacity-50">Origin</span>
                            <span className="text-2xl font-black lowercase truncate w-full text-center">
                                {donation.donor_address || 'Central City'}
                            </span>
                        </div>
                    </div>

                    {/* Action Bar */}
                    <div className="flex gap-6 pt-6">
                        <button
                            disabled={loading}
                            onClick={() => handleAction(acceptDonation)}
                            className="flex-1 bg-green-500 hover:bg-green-600 active:scale-95 text-white font-black text-4xl py-10 rounded-[2.5rem] shadow-2xl shadow-green-200 transition-all uppercase tracking-tighter border-8 border-white group"
                        >
                            Accept
                        </button>
                        <button
                            disabled={loading}
                            onClick={() => handleAction(rejectDonation)}
                            className="flex-1 bg-red-500 hover:bg-red-600 active:scale-95 text-white font-black text-4xl py-10 rounded-[2.5rem] shadow-2xl shadow-red-200 transition-all uppercase tracking-tighter border-8 border-white group"
                        >
                            Reject
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CharityDonationDashboard;
