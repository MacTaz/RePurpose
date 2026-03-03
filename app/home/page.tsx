import React from 'react'
import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import { AlertTriangle, Home as HomeIcon, Clock, Package, CheckCircle, Truck, ClipboardList, Zap, ArrowRight, Activity } from 'lucide-react'

const Home = async () => {
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
        <div className="min-h-screen bg-[#F8F9FA] flex flex-col font-['Inter'] selection:bg-[#7BA4D5]/30">
            <Navbar role={role} />

            {role === 'donor' ? (
                /* DONOR VIEW (BLUE THEME) */
                <main className="flex-1 p-8 lg:p-12 flex flex-col lg:flex-row gap-10 max-w-[1600px] mx-auto w-full">
                    {/* LEFT: Disaster Watch */}
                    <div className="flex-[1.2] flex flex-col border-[6px] border-[#7BA4D5] rounded-[2rem] overflow-hidden shadow-sm bg-white">
                        <div className="bg-[#7BA4D5] px-8 py-5 flex items-center justify-between">
                            <h2 className="text-white text-2xl font-extrabold tracking-wide flex items-center gap-3">
                                <AlertTriangle className="w-7 h-7" /> Disaster Watch
                            </h2>
                            <span className="px-3 py-1 bg-white/20 text-white rounded-full text-sm font-semibold backdrop-blur-sm border border-white/30 flex items-center gap-2">
                                <Activity className="w-4 h-4" /> Live Updates
                            </span>
                        </div>

                        <div className="flex-1 p-6 flex flex-col xl:flex-row gap-6">
                            {/* Main Image Placeholder */}
                            <div className="flex-[3] bg-[#DDE6ED] rounded-2xl relative overflow-hidden group/image min-h-[300px]">
                                <div className="absolute inset-0 bg-black/5 flex items-center justify-center">
                                    <span className="text-[#7BA4D5]/60 font-bold text-xl uppercase tracking-widest">Featured Report</span>
                                </div>
                                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-[#2C4663]/90 to-transparent p-6 translate-y-2 opacity-0 group-hover/image:translate-y-0 group-hover/image:opacity-100 transition-all duration-300">
                                    <h3 className="text-white font-bold text-lg">Typhoon Relief Operation</h3>
                                    <p className="text-white/90 text-sm">Critical supplies needed in coastal areas.</p>
                                </div>
                            </div>

                            {/* Side Feed */}
                            <div className="flex-1 flex flex-col gap-4">
                                <h3 className="text-[#2C4663] font-bold text-sm uppercase tracking-wider mb-1 px-1 opacity-70">Recent Alerts</h3>
                                {[1, 2, 3, 4, 5].map((i) => (
                                    <div key={i} className="flex-1 min-h-[70px] bg-[#F4F7FA] rounded-xl border border-[#DDE6ED] hover:bg-[#EBF2F8] transition-colors p-4 flex gap-4 items-center cursor-pointer group/card">
                                        <div className="w-2 h-2 rounded-full bg-[#E58066] animate-pulse"></div>
                                        <div className="flex-1">
                                            <div className="h-3 w-3/4 bg-[#DDE6ED] rounded mb-2 group-hover/card:bg-[#7BA4D5]/40 transition-colors"></div>
                                            <div className="h-2 w-1/2 bg-[#DDE6ED] rounded"></div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* RIGHT: Discover & Recent */}
                    <div className="flex-1 flex flex-col gap-10">
                        {/* Top: Discover Charities */}
                        <div className="flex-[0.6] flex flex-col border-[6px] border-[#7BA4D5] rounded-[2rem] overflow-hidden shadow-sm bg-white">
                            <div className="bg-[#7BA4D5] px-8 py-4">
                                <h2 className="text-white text-xl font-bold flex items-center gap-3">
                                    <HomeIcon className="w-6 h-6" /> Discover Charities
                                </h2>
                            </div>
                            <div className="flex-1 p-6 flex flex-col gap-4 overflow-y-auto">
                                {[1, 2, 3, 4, 5].map((i) => (
                                    <div key={i} className="bg-[#F8FAFC] border border-[#DDE6ED] hover:border-[#7BA4D5]/50 h-16 min-h-[64px] rounded-2xl w-full flex items-center px-6 transition-colors cursor-pointer group/charity shrink-0">
                                        <div className="w-10 h-10 rounded-full bg-[#DDE6ED] mr-4 flex items-center justify-center text-[#7BA4D5] font-bold group-hover/charity:bg-[#7BA4D5] group-hover/charity:text-white transition-colors">C{i}</div>
                                        <div className="flex-1">
                                            <div className="h-3 w-1/3 bg-[#DDE6ED] rounded mb-1"></div>
                                            <div className="h-2 w-1/4 bg-[#E8EEF3] rounded"></div>
                                        </div>
                                        <div className="text-[#7BA4D5] opacity-50 group-hover/charity:opacity-100 transition-opacity">
                                            <ArrowRight className="w-5 h-5" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Bottom: Recent Donations */}
                        <div className="flex-1 flex flex-col border-[6px] border-[#7BA4D5] rounded-[2rem] overflow-hidden shadow-sm bg-white">
                            <div className="bg-[#7BA4D5] px-8 py-4">
                                <h2 className="text-white text-xl font-bold flex items-center gap-3">
                                    <Clock className="w-6 h-6" /> Recent Donations
                                </h2>
                            </div>
                            <div className="flex-1 p-6">
                                <div className="w-full h-full bg-[#F4F7FA] border border-[#DDE6ED] rounded-2xl flex items-center justify-center p-8">
                                    <div className="text-center flex flex-col items-center">
                                        <div className="w-16 h-16 bg-[#DDE6ED] rounded-full mb-4 flex items-center justify-center text-[#7BA4D5]">
                                            <Package className="w-8 h-8" />
                                        </div>
                                        <h3 className="text-[#2C4663] font-bold text-lg mb-2">No recent donations</h3>
                                        <p className="text-[#7BA4D5] text-sm font-medium">Your donation history will appear here.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </main>
            ) : (
                /* ORGANIZATION VIEW (ORANGE THEME) */
                <main className="flex-1 p-8 lg:p-12 flex flex-col gap-10 max-w-[1600px] mx-auto w-full">
                    {/* TOP: Status Management */}
                    <div className="flex-[0.8] flex flex-col border-[6px] border-[#FFB27D] rounded-[2rem] overflow-hidden shadow-sm bg-white">
                        <div className="bg-[#FFD1B3] px-8 py-4 border-b-2 border-[#FFB27D] flex items-center justify-between">
                            <h2 className="text-[#5A2C10] text-xl font-black uppercase tracking-widest flex items-center gap-3">
                                <Activity className="w-6 h-6" /> Status Management
                            </h2>
                            <button className="text-[#FF944D] bg-white px-4 py-1.5 rounded-full text-sm font-bold shadow-sm hover:bg-[#FFF5F0] border border-[#FFB27D]/30 transition-colors">View All</button>
                        </div>
                        <div className="flex-1 p-8 grid grid-cols-1 md:grid-cols-3 gap-8">
                            {[
                                { title: "Pending Pickups", count: 12, icon: <Truck className="w-7 h-7" /> },
                                { title: "Awaiting Matches", count: 5, icon: <HomeIcon className="w-7 h-7" /> },
                                { title: "Completed Today", count: 28, icon: <CheckCircle className="w-7 h-7" /> }
                            ].map((stat, i) => (
                                <div key={i} className="flex-1 bg-[#FFF5F0] rounded-2xl border border-[#FFD1B3] hover:bg-[#FFEDE1] transition-colors p-6 flex flex-col justify-between group/stat cursor-pointer">
                                    <div className="flex justify-between items-start mb-4">
                                        <span className="bg-white p-3 rounded-2xl shadow-sm border border-[#FFD1B3]/50 text-[#FF944D] group-hover/stat:bg-[#FF944D] group-hover/stat:text-white transition-colors">{stat.icon}</span>
                                        <span className="text-[#5A2C10] font-black text-4xl">{stat.count}</span>
                                    </div>
                                    <h3 className="text-[#5A2C10]/70 font-bold uppercase tracking-wider text-sm">{stat.title}</h3>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* BOTTOM ROW */}
                    <div className="flex-[1.2] flex flex-col lg:flex-row gap-10">
                        {/* Inventory Needs */}
                        <div className="flex-[0.4] flex flex-col border-[6px] border-[#FFB27D] rounded-[2rem] overflow-hidden shadow-sm bg-white">
                            <div className="bg-[#FFD1B3] px-8 py-4 border-b-2 border-[#FFB27D]">
                                <h2 className="text-[#5A2C10] text-lg font-black uppercase tracking-wider flex items-center gap-3">
                                    <ClipboardList className="w-6 h-6" /> Inventory Needs
                                </h2>
                            </div>
                            <div className="flex-1 p-6 flex flex-col gap-4 overflow-y-auto">
                                {['Canned Goods', 'Bottled Water', 'Blankets'].map((item, i) => (
                                    <div key={i} className="bg-[#FFF5F0] h-16 rounded-xl border border-[#FFD1B3] flex items-center justify-between px-5 hover:bg-[#FFEDE1] transition-colors cursor-pointer">
                                        <div className="flex items-center gap-3">
                                            <div className="w-2 h-2 rounded-full bg-[#E58066]"></div>
                                            <span className="text-[#5A2C10] font-bold">{item}</span>
                                        </div>
                                        <span className="text-xs font-bold text-[#FF944D] bg-white border border-[#FFD1B3] px-2 py-1 rounded-md">High Prio</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Incoming Matches */}
                        <div className="flex-1 flex flex-col border-[6px] border-[#FFB27D] rounded-[2rem] overflow-hidden shadow-sm bg-white">
                            <div className="bg-[#FFD1B3] px-8 py-4 border-b-2 border-[#FFB27D]">
                                <h2 className="text-[#5A2C10] text-lg font-black uppercase tracking-wider flex items-center gap-3">
                                    <Zap className="w-6 h-6" /> Incoming Matches
                                </h2>
                            </div>
                            <div className="flex-1 p-6">
                                <div className="w-full h-full bg-[#FFF5F0] border border-[#FFD1B3] rounded-2xl flex items-center justify-center p-8">
                                    <div className="text-center flex flex-col items-center">
                                        <div className="w-20 h-20 bg-white rounded-full mb-5 flex items-center justify-center shadow-sm border border-[#FFD1B3]">
                                            <Activity className="w-10 h-10 text-[#FF944D] animate-pulse" />
                                        </div>
                                        <h3 className="text-[#5A2C10] font-bold text-xl mb-2">Scanning for matches...</h3>
                                        <p className="text-[#FF944D] text-sm font-medium">New donor offerings will appear here.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </main>
            )}
        </div>
    )
}

export default Home
