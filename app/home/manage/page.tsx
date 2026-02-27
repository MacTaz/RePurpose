import React from 'react'
import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Navbar from '@/components/Navbar'

const Manage = async () => {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect('/login');
    }

    // Fetch the profile to get the role
    const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

    const role = (profile?.role || 'donor') as 'donor' | 'organization';

    return (
        <div className="min-h-screen bg-white font-sans flex flex-col">
            <Navbar role={role} />

            {role === 'donor' ? (
                /* DONOR VIEW */
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
            ) : (
                /* ORGANIZATION VIEW */
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
            )}
        </div>
    )
}

export default Manage
