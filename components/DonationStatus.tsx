'use client';

import React, { useState } from 'react';
import { X, MapPin, Navigation, Clock, Package, Info, CheckCircle2, ChevronLeft, RefreshCcw } from 'lucide-react';
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
        <div className="w-full max-w-[1600px] mx-auto flex flex-col gap-8 animate-in fade-in duration-700 pb-20 px-4 md:px-0">
            {/* Contextual Top Bar */}
            <div className="flex items-center justify-between bg-white/40 backdrop-blur-xl border border-white/60 p-6 rounded-[2.5rem] shadow-2xl shadow-[#5A2C10]/5">
                <div className="flex items-center gap-6">
                    <button
                        onClick={onClose}
                        className="group size-14 bg-white border-2 border-[#5A2C10]/10 rounded-2xl flex items-center justify-center text-[#5A2C10] hover:bg-[#5A2C10] hover:text-white transition-all shadow-sm active:scale-95"
                    >
                        <ChevronLeft className="size-6 group-hover:-translate-x-1 transition-transform" />
                    </button>
                    <div>
                        <div className="flex items-center gap-3">
                            <h1 className="text-3xl font-black text-[#5A2C10] tracking-tight">
                                Tracking <span className="text-[#FF9248]">Fulfillment</span>
                            </h1>
                            <div className="px-3 py-1 bg-[#FF9248]/10 text-[#FF9248] rounded-full text-[9px] font-black uppercase tracking-widest border border-[#FF9248]/20">
                                {status.replace('_', ' ')}
                            </div>
                        </div>
                        <p className="text-[#5A2C10]/40 font-bold text-xs mt-0.5 tracking-widest uppercase italic">Live Logistics Console</p>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <button
                        onClick={onClose}
                        className="px-10 py-4 bg-[#5A2C10] text-white rounded-2xl font-black shadow-xl shadow-[#5A2C10]/20 hover:scale-[1.02] active:scale-95 transition-all text-xs uppercase tracking-widest flex items-center gap-2 group"
                    >
                        Return to Manage
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
                            <div className="w-full xl:w-[50%] relative group">
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

                            {/* Logistics and Controls */}
                            <div className="flex-1 flex flex-col p-4 relative">
                                {updating && (
                                    <div className="absolute inset-0 bg-white/60 backdrop-blur-sm z-[100] flex flex-col items-center justify-center animate-in fade-in transition-all">
                                        <RefreshCcw className="size-12 text-[#5A2C10] animate-spin mb-4" />
                                        <p className="font-black text-[#5A2C10] uppercase tracking-widest text-xs">Syncing status...</p>
                                    </div>
                                )}

                                <div className="flex items-center gap-3 mb-8">
                                    <div className="size-10 bg-[#FF9248]/10 rounded-xl flex items-center justify-center text-[#FF9248]">
                                        <Clock className="size-5" />
                                    </div>
                                    <h3 className="text-xl font-black text-[#5A2C10] lowercase italic">Fulfillment Phase</h3>
                                </div>

                                <div className="space-y-10 flex-1">
                                    <div className="bg-[#5A2C10]/5 p-8 rounded-[2.5rem] border border-[#5A2C10]/5">
                                        <div className="flex items-center justify-between mb-4">
                                            <p className="text-[10px] font-black text-[#5A2C10]/40 uppercase tracking-[0.2em]">Live Status</p>
                                            <p className="text-sm font-black text-[#5A2C10] uppercase tracking-tighter">{status.replace('_', ' ')}</p>
                                        </div>
                                        <div className="w-full h-4 bg-[#5A2C10]/10 rounded-full overflow-hidden p-1 shadow-inner relative">
                                            <div
                                                className={`h-full bg-gradient-to-r from-[#FF9248] to-[#5A2C10] rounded-full transition-all duration-1000 relative shadow-[0_0_12px_rgba(255,146,72,0.3)]`}
                                                style={{ width: status === 'delivered' ? '100%' : status === 'in_progress' ? '66%' : '33%' }}
                                            >
                                                <div className="absolute top-0 right-0 h-full w-4 bg-white/20 skew-x-12 animate-[pulse_2s_infinite]"></div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="bg-[#FF9248]/10 p-6 rounded-3xl border border-[#FF9248]/10">
                                            <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Donor Profile</p>
                                            <p className="text-lg font-black text-[#5A2C10]">{donation.donor_name}</p>
                                        </div>
                                        <div className="bg-[#5A2C10]/10 p-6 rounded-3xl border border-[#5A2C10]/10">
                                            <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Volume</p>
                                            <p className="text-lg font-black text-[#5A2C10]">{donation.quantity || 1} units</p>
                                        </div>
                                    </div>

                                    {/* Item Description Section */}
                                    <div className="pt-6 border-t border-gray-100">
                                        <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-3">Item Description</p>
                                        <p className="text-base font-medium text-[#5A2C10] leading-relaxed opacity-80 italic">
                                            "{donation.description || "No donor narrative provided for this item."}"
                                        </p>
                                    </div>
                                </div>

                                <div className="mt-10">
                                    <div className="relative">
                                        <button
                                            onClick={() => setIsOpen(!isOpen)}
                                            className="w-full py-6 bg-[#5A2C10] text-white rounded-[2rem] font-black shadow-xl shadow-[#5A2C10]/20 hover:scale-[1.01] active:scale-[0.98] transition-all flex items-center justify-center gap-4 group uppercase tracking-widest text-sm"
                                        >
                                            <RefreshCcw className={`size-5 transition-transform duration-500 ${isOpen ? 'rotate-180' : ''}`} />
                                            Update Fulfillment Stage
                                        </button>

                                        {isOpen && (
                                            <div className="absolute bottom-full left-0 right-0 mb-4 bg-white/95 backdrop-blur-xl rounded-[2.5rem] shadow-[0_20px_60px_-15px_rgba(90,44,16,0.2)] p-4 border border-[#5A2C10]/10 animate-in slide-in-from-bottom-4 duration-300 z-[100] grid grid-cols-1 gap-2">
                                                {(['accepted', 'in_progress', 'delivered'] as const).map((s) => (
                                                    <button
                                                        key={s}
                                                        disabled={status === s}
                                                        onClick={() => handleUpdate(s)}
                                                        className={`w-full py-5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] transition-all ${status === s ? 'bg-[#5A2C10] text-[#FF9248] opacity-50 cursor-not-allowed' : 'bg-gray-50 text-[#5A2C10] hover:bg-[#FF9248] hover:text-white'}`}
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
                </div>

                {/* Logistics Column */}
                <div className="lg:col-span-4 space-y-8">
                    {/* Address Card (Donor's) */}
                    <div className="bg-[#5A2C10] rounded-[3.5rem] p-10 text-white shadow-2xl shadow-[#5A2C10]/30 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 size-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl group-hover:bg-white/10 transition-colors duration-700"></div>
                        <div className="relative z-10">
                            <div className="flex items-center justify-between mb-10">
                                <h3 className="text-2xl font-black lowercase tracking-tighter flex items-center gap-3">
                                    Collection <span className="text-[#FF9248]">Address</span>
                                </h3>
                                <MapPin className="size-6 text-[#FF9248]" />
                            </div>
                            <div className="space-y-6">
                                <div className="space-y-3">
                                    <div className="flex items-center gap-2 opacity-40">
                                        <Navigation className="size-3" />
                                        <span className="text-[9px] font-black uppercase tracking-[0.2em]">Donor's Location</span>
                                    </div>
                                    <p className="text-2xl font-black tracking-tight leading-tight">
                                        {donation.donor_line1 || 'Not Set'}
                                    </p>
                                    {(donation.donor_city || donation.donor_country) && (
                                        <p className="text-sm font-bold opacity-60 bg-white/10 px-4 py-2 rounded-xl inline-block mt-2">
                                            {[donation.donor_city, donation.donor_country].filter(Boolean).join(', ')}
                                        </p>
                                    )}
                                </div>
                                <div className="pt-4 border-t border-white/10">
                                    <div className="bg-white/10 px-6 py-4 rounded-3xl flex items-center justify-between group-hover:bg-white/20 transition-all">
                                        <div>
                                            <p className="text-[8px] font-black uppercase tracking-widest opacity-40 mb-0.5">Zip Code</p>
                                            <p className="text-sm font-black italic">{donation.donor_zip || '----'}</p>
                                        </div>
                                        <div className="size-8 bg-[#FF9248] rounded-xl flex items-center justify-center text-white shadow-lg">
                                            <Package className="size-4" />
                                        </div>
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
                            <div className="absolute inset-x-4 bottom-4 ">
                                <div className="bg-white/80 backdrop-blur-md p-4 rounded-[2rem] border border-white flex items-center justify-between shadow-lg">
                                    <div className="flex items-center gap-3">
                                        <div className="size-10 bg-[#5A2C10] rounded-xl flex items-center justify-center text-white">
                                            <MapPin className="size-5" />
                                        </div>
                                        <div>
                                            <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Pin Location</p>
                                            <p className="text-xs font-black text-[#5A2C10]">Verified Coordinates</p>
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
                            <p className="text-sm font-bold text-[#5A2C10]/40 max-w-[200px] mt-2">The location for this donation has not been pinned on the map.</p>
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

export default DonationStatus;
