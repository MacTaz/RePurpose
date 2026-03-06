'use client';

import React, { useState } from 'react';

export interface Charity {
    id: string;
    name: string;
    address: string;
    email: string;
    deliveryMode: string;
    profilePic?: string;
}

const dummyCharities: Charity[] = [
    {
        id: '1',
        name: 'The Red Cross',
        address: '123 Healing Blvd, Safeville',
        email: 'contact@redcross.org',
        deliveryMode: 'Pickup',
    },
    {
        id: '2',
        name: 'Green Earth Defenders',
        address: '456 Nature Path, Eco City',
        email: 'hello@ged.org',
        deliveryMode: 'Drop-off',
    },
    {
        id: '3',
        name: 'Animal Rescue Alliance',
        address: '789 Pets Lane, Barktown',
        email: 'rescue@ara.org',
        deliveryMode: 'Pickup',
    },
    {
        id: '4',
        name: 'Tech for Good',
        address: '101 Innovation Dr, Silicontown',
        email: 'info@techforgood.org',
        deliveryMode: 'Pickup/Dropoff',
    },
    {
        id: '5',
        name: 'Global Food Fund',
        address: '202 Meal Street, Bread City',
        email: 'donate@globalfood.org',
        deliveryMode: 'Drop-off',
    }
];

const CharityMatching = ({ charities = dummyCharities }: { charities?: Charity[] }) => {
    const [selectedMode, setSelectedMode] = useState<string>('All');

    // Unique modes for the filter buttons
    const filterOptions = ['All', 'Pickup', 'Drop-off', 'Pickup/Dropoff'];

    // Filter charities based on selected mode
    const filteredCharities = charities.filter(charity => {
        if (selectedMode === 'All') return true;
        return charity.deliveryMode === selectedMode;
    });

    return (
        <div className="w-full min-h-screen flex items-center justify-center p-4 sm:p-8">
            {/* Main Outer Container following DonorDonationDashboard's aesthetic */}
            <div className="w-full max-w-5xl bg-[#DDE6ED] border-[6px] border-[#7BA4D5] rounded-[2rem] pt-8 pb-8 px-6 lg:px-10 shadow-sm mx-auto flex flex-col max-h-[85vh]">

                {/* Header */}
                <div className="border-b-[6px] border-black pb-4 mb-6 text-center shrink-0">
                    <h1 className="font-extrabold text-3xl lg:text-4xl text-black">
                        Charities that fit your donation
                    </h1>
                </div>

                {/* Filter section */}
                <div className="flex justify-center gap-3 sm:gap-4 mb-6 flex-wrap shrink-0">
                    {filterOptions.map((mode) => (
                        <button
                            key={mode}
                            onClick={() => setSelectedMode(mode)}
                            className={`px-8 py-3 rounded-full text-lg font-extrabold transition-colors duration-200 outline-none ${selectedMode === mode
                                ? 'bg-black text-white shadow-md'
                                : 'bg-white text-black hover:bg-[#7BA4D5] hover:text-white shadow-sm'
                                }`}
                        >
                            {mode}
                        </button>
                    ))}
                </div>

                {/* Scrollable List Container */}
                <div className="flex-1 overflow-y-auto pr-3 -mr-3 flex flex-col gap-6 items-center custom-scrollbar pb-6">
                    {filteredCharities.length > 0 ? (
                        filteredCharities.map((charity) => (
                            <div
                                key={charity.id}
                                onClick={() => alert(`Redirect to profile of ${charity.name} (Implementation later)`)}
                                className="bg-white rounded-[2rem] w-full max-w-4xl p-5 md:p-6 flex flex-col sm:flex-row items-center sm:items-stretch gap-6 shadow-sm hover:shadow-md hover:-translate-y-1 hover:border-[#7BA4D5] hover:border-transparent transition-all duration-200 cursor-pointer"
                            >

                                {/* Left: Profile Pic */}
                                <div className="flex-shrink-0 w-24 h-24 sm:w-28 sm:h-28 bg-[#DDE6ED] rounded-full flex items-center justify-center overflow-hidden border-[3px] border-white shadow-sm">
                                    {charity.profilePic ? (
                                        <img src={charity.profilePic} alt={charity.name} className="object-cover w-full h-full" />
                                    ) : (
                                        <div className="flex flex-col items-center justify-center text-[#7BA4D5]">
                                            <svg className="w-10 h-10 opacity-70" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"></path></svg>
                                        </div>
                                    )}
                                </div>

                                {/* Right section: Info */}
                                <div className="flex-1 flex flex-col justify-center gap-4 w-full">
                                    {/* Top: Charity Name & Delivery Mode */}
                                    <div className="flex flex-col sm:flex-row gap-4 w-full items-center justify-between">
                                        <div className="flex-1 bg-white border-[3px] border-[#DDE6ED] rounded-2xl px-6 py-2 shadow-sm text-center sm:text-left w-full">
                                            <span className="font-extrabold text-xl text-black">{charity.name}</span>
                                        </div>
                                        <div className="bg-[#7BA4D5] text-white px-5 py-2.5 rounded-full shadow-sm flex items-center justify-center w-full sm:w-auto">
                                            <span className="text-sm font-extrabold uppercase">{charity.deliveryMode}</span>
                                        </div>
                                    </div>

                                    {/* Bottom: Address and Email */}
                                    <div className="flex flex-col sm:flex-row gap-4 w-full mt-auto">
                                        <div className="bg-[#DDE6ED] px-6 py-3 rounded-[1.5rem] shadow-sm flex-[2] text-center sm:text-left flex items-center justify-center sm:justify-start">
                                            <span className="text-sm font-extrabold text-black leading-tight">{charity.address}</span>
                                        </div>
                                        <div className="bg-[#DDE6ED] px-6 py-3 rounded-[1.5rem] shadow-sm flex-1 sm:max-w-[220px] text-center sm:text-left flex items-center justify-center sm:justify-start overflow-hidden">
                                            <span className="text-sm font-extrabold text-black truncate">{charity.email}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="flex flex-col items-center justify-center h-full text-black py-16 space-y-4">
                            <svg className="w-16 h-16 text-[#7BA4D5]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                            <span className="text-xl font-extrabold">No charities found</span>
                            <span className="text-md font-extrabold opacity-75">Try selecting a different delivery mode.</span>
                        </div>
                    )}
                </div>
            </div>

            <style jsx>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 8px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background-color: #7BA4D5;
                    border-radius: 20px;
                }
            `}</style>
        </div>
    );
};

export default CharityMatching;
