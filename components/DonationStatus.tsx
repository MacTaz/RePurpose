'use client';

import React, { useState } from 'react';
import { X, MapPin, Navigation, Clock, Package, Info, CheckCircle2, ChevronLeft, RefreshCcw, ChevronDown } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';
import { updateDonationStatus } from '@/lib/donation-actions';
import { useRouter } from 'next/navigation';
import DistanceMap from './DistanceMap';

interface Donation {
    id: string;
    donor_id: string;
    organization_id: string | null;
    type: string;
    item_name?: string | null;
    quantity: number | null;
    status: string | null;
    created_at: string;
    donor_name: string;
    description: string | null;
    delivery_preference: string | null;
    donor_line1?: string;
    donor_line2?: string;
    donor_city?: string;
    donor_country?: string;
    donor_zip?: string;
    org_lat?: number;
    org_lng?: number;
    donor_lat?: number;
    donor_lng?: number;
}

const DonationStatus = ({ donation, onClose }: { donation: Donation, onClose: () => void }) => {
    const router = useRouter();
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
            router.refresh();
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
                                Tracking <span className="text-[#FF9248]">Donation</span>
                            </h1>
                            <div className="px-3 py-1 bg-[#FF9248]/10 text-[#FF9248] rounded-full text-[9px] font-black uppercase tracking-widest border border-[#FF9248]/20">
                                {status.replace('_', ' ')}
                            </div>
                        </div>
                        <p className="text-[#5A2C10]/40 font-bold text-xs mt-0.5 tracking-widest uppercase italic">Donation Management</p>
                    </div>
                </div>
            </div>

            <div className="grid lg:grid-cols-12 gap-8 items-start">
                {/* Image Column */}
                <div className="lg:col-span-4 space-y-8">
                    <div className="bg-white rounded-[3.5rem] p-4 lg:p-6 shadow-2xl shadow-[#5A2C10]/10 border border-[#5A2C10]/5 overflow-hidden">
                        {/* Cinematic Image Frame */}
                        <div className="relative group">
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
                                            {donation.item_name || donation.type}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Details Column */}
                <div className="lg:col-span-4 space-y-8">
                    <div className="bg-white rounded-[3.5rem] p-8 shadow-2xl shadow-[#5A2C10]/10 border border-[#5A2C10]/5 h-full flex flex-col relative">
                        {updating && (
                            <div className="absolute inset-0 bg-white/60 backdrop-blur-sm z-[100] rounded-[3.5rem] flex flex-col items-center justify-center animate-in fade-in transition-all">
                                <RefreshCcw className="size-12 text-[#5A2C10] animate-spin mb-4" />
                                <p className="font-black text-[#5A2C10] uppercase tracking-widest text-xs">Syncing status...</p>
                            </div>
                        )}

                        <div className="flex items-center gap-3 mb-8">
                            <div className="size-10 bg-[#FF9248]/10 rounded-xl flex items-center justify-center text-[#FF9248]">
                                <Clock className="size-5" />
                            </div>
                            <h3 className="text-xl font-black text-[#5A2C10] italic">Donation Details</h3>
                        </div>

                        <div className="space-y-10 flex-1">
                            <div className="bg-[#5A2C10]/5 p-8 rounded-[2.5rem] border border-[#5A2C10]/5">
                                <div className="mb-6 border-b border-[#5A2C10]/10 pb-4">
                                    <p className="text-[10px] font-black text-[#5A2C10]/40 uppercase tracking-[0.2em] mb-1">Item Name</p>
                                    <h2 className="text-3xl font-black text-[#5A2C10] capitalize tracking-tighter truncate">{donation.item_name || donation.type}</h2>
                                </div>
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
                                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Donor</p>
                                    <p className="text-lg font-black text-[#5A2C10] truncate">{donation.donor_name}</p>
                                </div>
                                <div className="bg-[#5A2C10]/10 p-6 rounded-3xl border border-[#5A2C10]/10">
                                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Volume</p>
                                    <p className="text-lg font-black text-[#5A2C10]">{donation.quantity || 1} units</p>
                                </div>
                            </div>

                            <div className="pt-6 border-t border-gray-100">
                                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-3">Narrative</p>
                                <p className="text-base font-medium text-[#5A2C10] leading-relaxed opacity-80 italic line-clamp-3">
                                    "{donation.description || "No donor narrative provided."}"
                                </p>
                            </div>
                        </div>

                        <div className="mt-10">
                            <div className="relative">
                                <button
                                    onClick={() => setIsOpen(!isOpen)}
                                    className="w-full py-6 bg-[#5A2C10] text-white rounded-[2rem] font-black shadow-xl shadow-[#5A2C10]/20 hover:scale-[1.01] active:scale-[0.98] transition-all flex items-center justify-center gap-4 group uppercase tracking-widest text-sm"
                                >
                                    <ChevronDown className={`size-5 transition-transform duration-500 ${isOpen ? '' : 'rotate-180'}`} />
                                    Update Status
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

                {/* Logistics Column */}
                <div className="lg:col-span-4 space-y-8">
                    {/* Address Card (Donor's) */}
                    <div className="bg-[#5A2C10] rounded-[3.5rem] p-10 text-white shadow-2xl shadow-[#5A2C10]/30 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 size-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl group-hover:bg-white/10 transition-colors duration-700"></div>
                        <div className="relative z-10">
                            <div className="flex items-center justify-between mb-10">
                                <h3 className="text-2xl font-black tracking-tighter flex items-center gap-3">
                                    Donor <span className="text-[#FF9248]">Location</span>
                                </h3>
                                <MapPin className="size-6 text-[#FF9248]" />
                            </div>
                            <div className="space-y-6">
                                <div className="space-y-3">
                                    <div className="flex items-center gap-2 opacity-40">
                                        <Navigation className="size-3" />
                                        <span className="text-[9px] font-black uppercase tracking-[0.2em]">Street</span>
                                    </div>
                                    <p className="text-2xl font-black tracking-tight leading-tight">
                                        {donation.donor_line1 || 'Not Set'}
                                    </p>
                                    {donation.donor_line2 && (
                                        <p className="text-sm font-bold opacity-60 bg-white/10 px-4 py-2 rounded-xl inline-block mt-2">
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
                    <div className="relative h-[400px] rounded-[3.5rem] overflow-hidden border-4 border-[#5A2C10]/10 shadow-2xl group">
                        <DistanceMap
                            orgLat={donation.org_lat || 0}
                            orgLng={donation.org_lng || 0}
                            userLat={donation.donor_lat || 0}
                            userLng={donation.donor_lng || 0}
                        />
                    </div>
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
