import React from 'react'

const OrgManage = () => {
    return (
        <main className="max-w-5xl mx-auto py-8 px-4 w-full space-y-10 flex-grow">
            {/* Container 1: Donations Request Recieved */}
            <div className="bg-[#d5d5d5] rounded-2xl overflow-hidden pb-48">
                <div className="relative h-14 flex items-center justify-center">
                    <h2 className="text-xl font-extrabold text-black">Donations Request Recieved</h2>
                    <div className="absolute right-4">
                        <svg className="w-8 h-8 text-black" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M4 4h16v2.5l-6 7.5v6l-4 2v-8L4 6.5V4z" />
                        </svg>
                    </div>
                </div>
                <div className="w-full h-1.5 bg-black"></div>

                <div className="mt-4 px-6 space-y-4">
                    {/* Headers */}
                    <div className="flex space-x-4">
                        <div className="flex-1 bg-white rounded-full py-1.5 text-center text-xs font-extrabold shadow-sm">Number</div>
                        <div className="flex-1 bg-white rounded-full py-1.5 text-center text-xs font-extrabold shadow-sm">Type</div>
                        <div className="flex-1 bg-white rounded-full py-1.5 text-center text-xs font-extrabold shadow-sm">Quantity</div>
                        <div className="flex-1 bg-white rounded-full py-1.5 text-center text-xs font-extrabold shadow-sm">Date</div>
                    </div>

                    {/* Rows */}
                    <div className="flex w-full h-8 bg-white rounded-sm">
                        <div className="flex-1 border-r-2 border-[#d5d5d5]"></div>
                        <div className="flex-1 border-r-2 border-[#d5d5d5]"></div>
                        <div className="flex-1 border-r-2 border-[#d5d5d5]"></div>
                        <div className="flex-1"></div>
                    </div>
                    <div className="flex w-full h-8 bg-white rounded-sm">
                        <div className="flex-1 border-r-2 border-[#d5d5d5]"></div>
                        <div className="flex-1 border-r-2 border-[#d5d5d5]"></div>
                        <div className="flex-1 border-r-2 border-[#d5d5d5]"></div>
                        <div className="flex-1"></div>
                    </div>
                </div>
            </div>

            {/* Container 2: Accepted Donation Requests */}
            <div className="bg-[#d5d5d5] rounded-2xl overflow-hidden pb-32">
                <div className="relative h-14 flex items-center justify-center">
                    <h2 className="text-xl font-extrabold text-black">Accepted Donation Requests</h2>
                    <div className="absolute right-4">
                        <svg className="w-8 h-8 text-black" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M4 4h16v2.5l-6 7.5v6l-4 2v-8L4 6.5V4z" />
                        </svg>
                    </div>
                </div>
                <div className="w-full h-1.5 bg-black"></div>

                <div className="mt-4 px-6 space-y-4">
                    {/* Headers */}
                    <div className="flex space-x-4">
                        <div className="flex-1 bg-white rounded-full py-1.5 text-center text-xs font-extrabold shadow-sm">Number</div>
                        <div className="flex-1 bg-white rounded-full py-1.5 text-center text-xs font-extrabold shadow-sm">Type</div>
                        <div className="flex-1 bg-white rounded-full py-1.5 text-center text-xs font-extrabold shadow-sm">Status</div>
                    </div>

                    {/* Rows */}
                    <div className="flex w-full h-8 bg-white rounded-sm">
                        <div className="flex-1 border-r-2 border-[#d5d5d5]"></div>
                        <div className="flex-1 border-r-2 border-[#d5d5d5]"></div>
                        <div className="flex-1"></div>
                    </div>
                    <div className="flex w-full h-8 bg-white rounded-sm">
                        <div className="flex-1 border-r-2 border-[#d5d5d5]"></div>
                        <div className="flex-1 border-r-2 border-[#d5d5d5]"></div>
                        <div className="flex-1"></div>
                    </div>
                </div>
            </div>

            {/* Bottom Section */}
            <div>
                <h2 className="text-2xl font-extrabold text-center text-black mb-6">Accepted Donation Requests</h2>

                <div className="flex justify-center gap-6">
                    {/* Overview Card */}
                    <div className="bg-[#d5d5d5] rounded-2xl p-8 w-[400px]">
                        <h3 className="text-xl font-extrabold text-center mb-8">Overview</h3>

                        <div className="space-y-6">
                            <div className="flex items-center justify-between">
                                <span className="text-lg font-extrabold ml-4">Clothes</span>
                                <div className="bg-white rounded-full w-32 py-1.5 text-center font-extrabold text-sm">0</div>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-lg font-extrabold ml-4">Food</span>
                                <div className="bg-white rounded-full w-32 py-1.5 text-center font-extrabold text-sm">0</div>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-lg font-extrabold ml-4">Water</span>
                                <div className="bg-white rounded-full w-32 py-1.5 text-center font-extrabold text-sm">0</div>
                            </div>
                        </div>
                    </div>

                    {/* Total Donation Card */}
                    <div className="bg-[#d5d5d5] rounded-2xl p-8 w-[280px] flex flex-col items-center">
                        <h3 className="text-xl font-extrabold text-center mt-8 mb-8">Total Donation</h3>
                        <div className="bg-white rounded-full w-40 py-1.5 text-center font-extrabold text-sm">0</div>
                    </div>
                </div>
            </div>
        </main>
    )
}

export default OrgManage
