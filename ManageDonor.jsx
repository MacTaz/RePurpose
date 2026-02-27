import React from 'react';
import ManageDonorNavBar from '../../components/ManageDonorNavBar';

export default function ManageDonor() {
    return (
        <div className="min-h-screen bg-white font-sans flex flex-col">
            <ManageDonorNavBar />

            <main className="flex-grow p-8 flex flex-col items-center">
                {/* Top box: Donations Sent */}
                <div className="w-full max-w-5xl bg-[#d5d5d5] rounded-3xl p-8 shadow-sm mb-8 pb-32">
                    <div className="flex justify-between items-center mb-6 relative px-4">
                        <h1 className="text-3xl font-extrabold text-black w-full text-center">Donations Sent</h1>
                        <div className="absolute right-4 top-0">
                            {/* Funnel icon */}
                            <svg className="w-10 h-10 text-black" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M4.25 5.61C6.27 8.2 10 13 10 13v6c0 .55.45 1 1 1h2c.55 0 1-.45 1-1v-6c0 0 3.72-4.8 5.74-7.39A.998.998 0 0019 4H5c-.83 0-1.3.95-.75 1.61z" />
                            </svg>
                        </div>
                    </div>

                    <div className="w-full h-[6px] bg-black mb-8"></div>

                    {/* Headers */}
                    <div className="grid grid-cols-4 gap-6 mb-4 px-2">
                        <div className="bg-white rounded-full py-2.5 text-center font-extrabold text-sm shadow-sm">Number</div>
                        <div className="bg-white rounded-full py-2.5 text-center font-extrabold text-sm shadow-sm">Type</div>
                        <div className="bg-white rounded-full py-2.5 text-center font-extrabold text-sm shadow-sm">Charity Sent To</div>
                        <div className="bg-white rounded-full py-2.5 text-center font-extrabold text-sm shadow-sm">Date</div>
                    </div>

                    {/* Rows */}
                    <div className="space-y-4 px-2">
                        {/* Row 1 */}
                        <div className="flex w-full h-12 bg-white rounded-sm">
                            <div className="flex-[0.25] border-r-2 border-[#d5d5d5]"></div>
                            <div className="flex-[0.25] border-r-2 border-[#d5d5d5]"></div>
                            <div className="flex-[0.25] border-r-2 border-[#d5d5d5]"></div>
                            <div className="flex-[0.25]"></div>
                        </div>
                        {/* Row 2 */}
                        <div className="flex w-full h-12 bg-white rounded-sm">
                            <div className="flex-[0.25] border-r-2 border-[#d5d5d5]"></div>
                            <div className="flex-[0.25] border-r-2 border-[#d5d5d5]"></div>
                            <div className="flex-[0.25] border-r-2 border-[#d5d5d5]"></div>
                            <div className="flex-[0.25]"></div>
                        </div>
                    </div>
                </div>

                {/* Bottom two boxes */}
                <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Left box: Overview */}
                    <div className="bg-[#d5d5d5] rounded-3xl p-10 shadow-sm flex flex-col items-center">
                        <h2 className="text-2xl font-extrabold text-black mb-12">Overview</h2>

                        <div className="w-full space-y-8 pl-12 pr-4">
                            <div className="flex items-center justify-between">
                                <span className="text-xl font-extrabold text-black">Clothes</span>
                                <div className="bg-white rounded-full w-32 py-2.5 text-center font-extrabold text-lg shadow-sm">0</div>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-xl font-extrabold text-black">Food</span>
                                <div className="bg-white rounded-full w-32 py-2.5 text-center font-extrabold text-lg shadow-sm">0</div>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-xl font-extrabold text-black">Water</span>
                                <div className="bg-white rounded-full w-32 py-2.5 text-center font-extrabold text-lg shadow-sm">0</div>
                            </div>
                        </div>
                    </div>

                    {/* Right box: Total */}
                    <div className="bg-[#d5d5d5] rounded-3xl p-10 shadow-sm flex flex-col items-center justify-center min-h-[350px]">
                        <h2 className="text-2xl font-extrabold text-black mb-10 text-center">Total Donation Sent</h2>
                        <div className="bg-white rounded-full w-56 py-3.5 text-center font-extrabold text-xl shadow-sm">0</div>
                    </div>
                </div>

            </main>
        </div>
    );
}
