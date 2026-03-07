'use client';

import React from 'react';

const DonorDonationDashboard = ({ donation, onClose }: any) => {
    return (
        <div className="w-full max-w-7xl mx-auto bg-[#DDE6ED] border-[10px] border-[#7BA4D5] rounded-[4rem] p-10 lg:p-16 shadow-2xl relative flex flex-col items-center animate-in zoom-in-95 duration-500 min-h-[90vh]">
            {/* Back Button */}
            {onClose && (
                <button
                    onClick={onClose}
                    className="absolute top-10 left-10 flex items-center gap-2 font-black text-[#2D3561] hover:scale-105 active:scale-95 transition-all group"
                >
                    <div className="size-10 bg-[#7BA4D5] rounded-full flex items-center justify-center group-hover:bg-[#5A8CC9] text-white transition-colors">←</div>
                    <span className="text-xl uppercase tracking-widest">Back</span>
                </button>
            )}

            {/* Header */}
            <div className="w-full text-center mt-8 mb-4">
                <h1 className="text-5xl lg:text-7xl font-black text-[#2D3561] tracking-tighter lowercase">
                    charity <span className="text-[#7BA4D5]">details</span>
                </h1>
            </div>

            <div className="w-full h-2 bg-[#2D3561] my-8 rounded-full"></div>

            <div className="flex flex-col lg:flex-row w-full gap-12 mt-4 flex-1">
                <div className="w-full lg:w-5/12 animate-in slide-in-from-left-8 duration-700">
                    <div className="w-full aspect-[4/5] rounded-[3rem] overflow-hidden bg-white shadow-2xl border-4 border-[#7BA4D5]">
                        <img
                            src="https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?q=80&w=1000"
                            alt="Organization"
                            className="w-full h-full object-cover"
                        />
                    </div>
                </div>

                <div className="flex-1 flex flex-col gap-10 animate-in slide-in-from-right-8 duration-700">
                    <div className="bg-white rounded-[3rem] p-12 shadow-2xl flex-1 border-4 border-[#7BA4D5]/50">
                        <h3 className="text-[#2D3561]/40 text-xs font-black uppercase tracking-[0.3em] mb-6">Tracking Information</h3>
                        <div className="space-y-8">
                            <div className="flex items-center gap-6">
                                <span className="size-16 rounded-3xl bg-[#7BA4D5] text-white flex items-center justify-center text-3xl font-black shadow-lg block px-4 py-2">01</span>
                                <div className="flex-1">
                                    <h4 className="text-3xl font-black text-[#2D3561] lowercase leading-none">Status: <span className="text-[#7BA4D5] uppercase">{donation?.status?.replace('_', ' ') || 'PENDING'}</span></h4>
                                    <div className="w-full h-2 bg-[#2D3561]/10 rounded-full mt-4 overflow-hidden">
                                        <div className={`h-full bg-[#7BA4D5] transition-all duration-1000 ${donation?.status === 'delivered' ? 'w-full' : donation?.status === 'in_progress' ? 'w-2/3' : 'w-1/3'}`} />
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-[#DDE6ED] p-6 rounded-2xl border-2 border-dashed border-[#7BA4D5] text-center">
                                    <span className="text-[10px] font-black uppercase text-[#2D3561]/40 block mb-1">Items</span>
                                    <span className="text-2xl font-black text-[#2D3561] lowercase">{donation?.type}</span>
                                </div>
                                <div className="bg-[#DDE6ED] p-6 rounded-2xl border-2 border-dashed border-[#7BA4D5] text-center">
                                    <span className="text-[10px] font-black uppercase text-[#2D3561]/40 block mb-1">To</span>
                                    <span className="text-2xl font-black text-[#2D3561] lowercase truncate block">{donation?.target_organization}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <button
                        onClick={onClose}
                        className="w-full py-10 bg-[#2D3561] hover:bg-black active:scale-[0.98] text-white rounded-[2.5rem] shadow-2xl transition-all cursor-pointer font-black text-4xl uppercase tracking-tighter border-8 border-white"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DonorDonationDashboard;
