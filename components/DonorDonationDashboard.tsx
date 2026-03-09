import { X, MapPin, Navigation, Clock, Package, Info, CheckCircle2, ChevronLeft, RefreshCcw } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';
import { updateDonationStatus } from '@/lib/donation-actions';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import DistanceMap from './DistanceMap';

const DonorDonationDashboard = ({ donation, onClose }: any) => {
    const router = useRouter();
    const [status, setStatus] = useState<string>(donation.status || "pending");
    const [updating, setUpdating] = useState(false);

    const supabase = createClient();
    const imageUrl = supabase.storage
        .from('donations')
        .getPublicUrl(`${donation.donor_id}/donation-${donation.id}/picture.jpg`).data.publicUrl;

    return (
        <div className="w-full max-w-[1600px] mx-auto flex flex-col gap-8 animate-in fade-in duration-700 pb-20 px-4 md:px-0">
            {/* Contextual Top Bar */}
            <div className="flex items-center justify-between bg-white/40 backdrop-blur-xl border border-white/60 p-6 rounded-[2.5rem] shadow-2xl shadow-[#30496E]/5">
                <div className="flex items-center gap-6">
                    <button
                        onClick={onClose}
                        className="group size-14 bg-white border-2 border-[#30496E]/10 rounded-2xl flex items-center justify-center text-[#30496E] hover:bg-[#30496E] hover:text-white transition-all shadow-sm active:scale-95"
                    >
                        <ChevronLeft className="size-6 group-hover:-translate-x-1 transition-transform" />
                    </button>
                    <div>
                        <div className="flex items-center gap-3">
                            <h1 className="text-3xl font-black text-[#30496E] tracking-tight">
                                Donation <span className="text-[#80A6C2]">Details</span>
                            </h1>
                            <div className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${status === 'rejected' || status === 'cancelled' ? 'bg-red-500/10 text-red-600 border-red-500/20' :
                                status === 'pending' ? 'bg-orange-500/10 text-orange-600 border-orange-500/20' :
                                    status === 'delivered' ? 'bg-green-500/10 text-green-600 border-green-500/20' :
                                        'bg-blue-500/10 text-[#30496E] border-[#30496E]/20'
                                }`}>
                                {status || 'Active'}
                            </div>
                        </div>
                        <p className="text-[#30496E]/40 font-bold text-xs mt-0.5 tracking-widest uppercase italic">Donation History</p>
                    </div>
                </div>
            </div>

            <div className="grid lg:grid-cols-12 gap-8 items-start">
                {/* Image Column */}
                <div className="lg:col-span-4 space-y-8">
                    <div className="bg-white rounded-[3.5rem] p-4 lg:p-6 shadow-2xl shadow-[#30496E]/10 border border-[#30496E]/5 overflow-hidden">
                        {/* Cinematic Image Frame */}
                        <div className="relative group">
                            <div className="absolute -inset-1 bg-gradient-to-br from-[#80A6C2] to-[#30496E] rounded-[3rem] blur opacity-10 group-hover:opacity-20 transition duration-1000"></div>
                            <div className="relative aspect-[4/5] rounded-[3rem] overflow-hidden bg-gray-100 shadow-2xl border-4 border-white">
                                <img
                                    src={imageUrl}
                                    alt="Donation Image"
                                    className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-700"
                                    onError={(e) => {
                                        (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1559416525-4c6e9cc05a66?auto=format&fit=crop&q=80&w=1000";
                                    }}
                                />
                                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-8">
                                    <div className="flex items-center gap-3">
                                        <div className="px-5 py-2.5 bg-white/20 backdrop-blur-md rounded-full border border-white/30 text-white text-xs font-black uppercase tracking-widest">
                                            Donation Image
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Details Column */}
                <div className="lg:col-span-4 space-y-8">
                    <div className="bg-white rounded-[3.5rem] p-8 shadow-2xl shadow-[#30496E]/10 border border-[#30496E]/5 h-full flex flex-col">
                        <div className="flex-1 flex flex-col relative">
                            {updating && (
                                <div className="absolute inset-0 bg-white/40 backdrop-blur-sm z-[100] flex flex-col items-center justify-center animate-in fade-in transition-all">
                                    <RefreshCcw className="size-12 text-[#30496E] animate-spin mb-4" />
                                    <p className="font-black text-[#30496E] uppercase tracking-widest text-xs">Syncing...</p>
                                </div>
                            )}

                            <div className="bg-[#30496E]/5 p-8 rounded-[2.5rem] border border-[#30496E]/5 mb-8">
                                <div className="mb-6 border-b border-[#30496E]/10 pb-4">
                                    <p className="text-[10px] font-black text-[#30496E]/40 uppercase tracking-[0.2em] mb-1">Item Name</p>
                                    <h2 className="text-3xl font-black text-[#30496E] capitalize tracking-tighter">{donation.item_name || donation.type}</h2>
                                </div>
                                <div className="flex items-center justify-between mb-4">
                                    <p className="text-[10px] font-black text-[#30496E]/40 uppercase tracking-[0.2em]">Current Phase</p>
                                    <p className={`text-sm font-black uppercase tracking-tighter ${donation?.status === 'rejected' ? 'text-red-500' : 'text-[#30496E]'}`}>
                                        {status?.replace('_', ' ') || 'PROCESSING'}
                                    </p>
                                </div>
                                <div className="w-full h-4 bg-[#30496E]/10 rounded-full overflow-hidden p-1 shadow-inner relative">
                                    <div
                                        className={`h-full rounded-full transition-all duration-1000 relative ${status === 'rejected' || status === 'cancelled'
                                            ? 'bg-gradient-to-r from-red-300 to-red-500'
                                            : 'bg-gradient-to-r from-[#80A6C2] to-[#30496E]'
                                            }`}
                                        style={{
                                            width: status === 'rejected' || status === 'cancelled' ? '100%'
                                                : status === 'delivered' ? '100%'
                                                    : status === 'in_progress' ? '66%'
                                                        : '33%'
                                        }}
                                    >
                                        <div className="absolute top-0 right-0 h-full w-4 bg-white/20 skew-x-12 animate-[pulse_2s_infinite]"></div>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-3 mb-6">
                                <div className="size-10 bg-[#80A6C2]/10 rounded-xl flex items-center justify-center text-[#30496E]">
                                    <Info className="size-5" />
                                </div>
                                <h3 className="text-xl font-black text-[#30496E] capitalize">Item Description</h3>
                            </div>

                            <div className="relative mb-8 overflow-hidden">
                                <div className="absolute -left-4 top-0 h-full w-1 bg-gradient-to-b from-transparent via-[#80A6C2] to-transparent opacity-30"></div>
                                <p className="text-[#30496E] text-base font-medium leading-relaxed italic opacity-80 pl-2">
                                    "{donation.description || "No specific details provided for this gift."}"
                                </p>
                            </div>

                            <div className="grid grid-cols-2 gap-4 mt-auto">
                                <div className="bg-[#80A6C2]/10 p-6 rounded-3xl border border-[#80A6C2]/10 transition-colors hover:bg-[#80A6C2]/20">
                                    <p className="text-[9px] font-black text-[#30496E]/40 uppercase tracking-[0.2em] mb-2">Item Type</p>
                                    <p className="text-xl font-black text-[#30496E] capitalize italic truncate">{donation?.type}</p>
                                </div>
                                <div className="bg-[#30496E]/10 p-6 rounded-3xl border border-[#30496E]/10 transition-colors hover:bg-[#30496E]/20">
                                    <p className="text-[9px] font-black text-[#30496E]/40 uppercase tracking-[0.2em] mb-2">Quantity</p>
                                    <p className="text-xl font-black text-[#30496E]">{donation?.quantity || 1} <span className="text-xs opacity-50 font-bold uppercase ml-1">Units</span></p>
                                </div>
                            </div>
                            <div className="mt-4 bg-[#30496E]/5 p-6 rounded-3xl border border-[#30496E]/10 transition-colors hover:bg-[#30496E]/10">
                                <p className="text-[9px] font-black text-[#30496E]/40 uppercase tracking-[0.2em] mb-2">Donated To</p>
                                <p className="text-xl font-black text-[#30496E] uppercase tracking-tighter truncate">{donation?.org_name || donation?.target_organization}</p>
                            </div>

                            <div className="mt-8 pt-8 border-t border-gray-100 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="size-10 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-600">
                                        <div className="size-2 bg-blue-600 rounded-full" />
                                    </div>
                                    <div>
                                        <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Sent By</p>
                                        <p className="font-black text-[#30496E] truncate max-w-[150px]">{donation?.donor_name || 'You'}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Logged On</p>
                                    <p className="font-black text-[#30496E] uppercase tracking-tighter">{new Date(donation?.created_at).toLocaleDateString() || 'Recently'}</p>
                                </div>
                            </div>

                            {status === 'pending' && (
                                <div className="mt-8 border-t border-gray-100 pt-8">
                                    <button
                                        onClick={async () => {
                                            if (confirm('Are you sure you want to cancel this donation?')) {
                                                setUpdating(true);
                                                const res = await updateDonationStatus(donation.id, 'cancelled');
                                                if (res.success) {
                                                    setStatus('cancelled');
                                                    router.refresh();
                                                } else {
                                                    alert(res.error || 'Failed to cancel donation');
                                                }
                                                setUpdating(false);
                                            }
                                        }}
                                        disabled={updating}
                                        className="w-full py-4 bg-red-50 text-red-500 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all shadow-sm border-2 border-red-500/10 flex items-center justify-center gap-2"
                                    >
                                        {updating ? (
                                            <RefreshCcw className="size-4 animate-spin" />
                                        ) : (
                                            <X className="size-4" />
                                        )}
                                        Cancel Donation
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Logistics Column */}
                <div className="lg:col-span-4 space-y-8">
                    {/* Address Master Card */}
                    <div className="bg-[#30496E] rounded-[3.5rem] p-10 text-white shadow-2xl shadow-[#30496E]/30 relative overflow-hidden group">
                        {/* Decorative Background Element */}
                        <div className="absolute top-0 right-0 size-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl group-hover:bg-white/10 transition-colors duration-700"></div>

                        <div className="relative z-10">
                            <div className="flex items-center justify-between mb-10">
                                <h3 className="text-2xl font-black tracking-tighter flex items-center gap-3 capitalize">
                                    Organization <span className="text-[#80A6C2]">Location</span>
                                </h3>
                                <MapPin className="size-6 text-[#80A6C2]" />
                            </div>

                            <div className="space-y-6">
                                {/* Primary Line */}
                                <div className="space-y-3">
                                    <div className="flex items-center gap-2 opacity-40">
                                        <Navigation className="size-3" />
                                        <span className="text-[9px] font-black uppercase tracking-[0.2em]">Street</span>
                                    </div>
                                    <p className="text-2xl font-black tracking-tight leading-tight">
                                        {donation?.org_line1 || 'Not Set'}
                                    </p>
                                    {donation?.org_line2 && (
                                        <p className="text-sm font-bold opacity-60 bg-white/10 px-4 py-2 rounded-xl inline-block">
                                            {donation?.org_line2}
                                        </p>
                                    )}
                                </div>

                                {/* Secondary Info Grid */}
                                <div className="grid grid-cols-2 gap-6 pt-6 border-t border-white/10">
                                    <div>
                                        <p className="text-[9px] font-black uppercase tracking-[0.2em] opacity-40 mb-1">City</p>
                                        <p className="text-lg font-black">{donation?.org_city || 'Not Set'}</p>
                                    </div>
                                    <div>
                                        <p className="text-[9px] font-black uppercase tracking-[0.2em] opacity-40 mb-1">Country</p>
                                        <p className="text-lg font-black">{donation?.org_country || 'Not Set'}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Integrated Map */}
                    <div className="relative h-[400px] rounded-[3.5rem] overflow-hidden border-4 border-[#30496E]/10 shadow-2xl group">
                        <DistanceMap
                            orgLat={donation.org_lat || 14.5995}
                            orgLng={donation.org_lng || 120.9842}
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

export default DonorDonationDashboard;
