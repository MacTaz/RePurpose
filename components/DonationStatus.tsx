'use client';

import React, { useState } from 'react';
import { updateDonationStatus } from '@/lib/donation-actions';
import { createClient } from '@/utils/supabase/client';

const DonationStatus = ({ donation, onClose }: any) => {
    const [status, setStatus] = useState<string>(donation.status || "Pending");
    const [isOpen, setIsOpen] = useState<boolean>(false);
    const [updating, setUpdating] = useState(false);

    const supabase = createClient();
    const imageUrl = supabase.storage
        .from('donations')
        .getPublicUrl(`${donation.donor_id}/donation-${donation.id}/picture.jpg`).data.publicUrl;

    const handleUpdate = async (newStat: string) => {
        setUpdating(true);
        setStatus(newStat);
        const res = await updateDonationStatus(donation.id, newStat);
        setUpdating(false);
        if (res.success) {
            setIsOpen(false);
        } else {
            alert(res.error || 'Failed to update status');
        }
    };

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
                    Ongoing <span className="text-[#FF9248]">fulfillment</span>
                </h1>
            </div>

            {/* Solid Divider */}
            <div className="w-full h-2 bg-[#5A2C10] my-8 rounded-full"></div>

            <div className="flex flex-col lg:flex-row w-full gap-12 mt-4 flex-1">
                {/* Visual Section */}
                <div className="w-full lg:w-4/12 flex flex-col gap-8 animate-in slide-in-from-left-8 duration-700">
                    <div className="w-full aspect-square rounded-[3rem] overflow-hidden bg-white shadow-2xl border-4 border-[#FFB27D]">
                        <img
                            src={imageUrl}
                            alt="Donation preview"
                            className="w-full h-full object-cover"
                            onError={(e) => {
                                (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1559416525-4c6e9cc05a66?auto=format&fit=crop&q=80&w=1000";
                            }}
                        />
                    </div>
                </div>

                {/* Tracking Console */}
                <div className="flex-1 flex flex-col gap-10 animate-in slide-in-from-right-8 duration-700">
                    <div className="bg-white rounded-[3rem] p-12 shadow-2xl flex-1 border-4 border-[#FFB27D]/50 relative transition-colors duration-500 overflow-hidden">
                        {updating && <div className="absolute inset-0 bg-[#FFEDE1]/20 backdrop-blur-sm z-50 flex items-center justify-center font-black animate-pulse">Updating...</div>}

                        <h3 className="text-[#5A2C10]/40 text-xs font-black uppercase tracking-[0.3em] mb-12">Tracking Dashboard</h3>

                        <div className="space-y-12">
                            <div className="flex items-center gap-6">
                                <span className="size-16 rounded-3xl bg-[#FFB27D] text-white flex items-center justify-center text-3xl font-black shadow-lg shadow-[#FFB27D]/30 block px-4 py-2">01</span>
                                <div className="flex-1">
                                    <h4 className="text-3xl font-black text-[#5A2C10] lowercase leading-none">Status: <span className="text-[#FF9248] uppercase">{status.replace('_', ' ')}</span></h4>
                                    <div className="w-full h-2 bg-[#5A2C10]/10 rounded-full mt-4 overflow-hidden shadow-inner">
                                        <div className={`h-full bg-[#FF9248] transition-all duration-1000 shadow-[0_0_12px_rgba(255,146,72,0.5)] ${status === 'delivered' ? 'w-full' : status === 'in_progress' ? 'w-2/3' : 'w-1/3'}`} />
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-4">
                                <div className="flex-1 bg-[#FFEDE1] p-8 rounded-[2rem] border-2 border-dashed border-[#FFB27D] text-center">
                                    <span className="text-[#5A2C10]/40 text-[10px] font-black uppercase tracking-widest block mb-1">Items</span>
                                    <span className="text-3xl font-black text-[#5A2C10] lowercase">{donation.type}</span>
                                </div>
                                <div className="flex-1 bg-[#FFEDE1] p-8 rounded-[2rem] border-2 border-dashed border-[#FFB27D] text-center">
                                    <span className="text-[#5A2C10]/40 text-[10px] font-black uppercase tracking-widest block mb-1">Donor</span>
                                    <span className="text-3xl font-black text-[#5A2C10] lowercase">{donation.donor_name}</span>
                                </div>
                            </div>
                        </div>

                        {/* Dropdown Section */}
                        <div className="relative mt-auto pt-16">
                            <button
                                onClick={() => setIsOpen(!isOpen)}
                                className="w-full py-10 bg-[#5A2C10] hover:bg-black active:scale-[0.98] text-white rounded-[2.5rem] shadow-2xl transition-all cursor-pointer font-black text-4xl uppercase tracking-tighter border-8 border-white border-white flex items-center justify-center gap-6"
                            >
                                Update Status
                                <div className={`transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}>
                                    <svg className="size-10" fill="none" stroke="currentColor" strokeWidth="4" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7"></path></svg>
                                </div>
                            </button>

                            {isOpen && (
                                <div className="absolute left-0 right-0 bottom-full mb-4 bg-white rounded-[2.5rem] shadow-3xl p-6 flex flex-col gap-4 border-4 border-[#5A2C10] animate-in slide-in-from-bottom-8 duration-300 z-50">
                                    {(['accepted', 'in_progress', 'delivered'] as const).map((s) => (
                                        <button
                                            key={s}
                                            disabled={status === s}
                                            onClick={() => handleUpdate(s)}
                                            className={`w-full py-6 rounded-2xl font-black text-2xl uppercase tracking-widest transition-all ${status === s ? 'bg-[#5A2C10] text-[#FFB27D]' : 'bg-[#FFEDE1] text-[#5A2C10] hover:bg-[#FFB27D]'}`}
                                        >
                                            {s.replace('_', ' ')}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DonationStatus;
