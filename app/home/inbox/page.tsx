import React from 'react'
import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Navbar from '@/components/Navbar'
import { Search, Send, MoreVertical, MessageSquare, Phone, MapPin, User, ChevronRight } from 'lucide-react'

const InboxPage = async () => {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect('/login');
    }

    const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

    const role = (profile?.role || 'donor') as 'donor' | 'organization';

    return (
        <div className="min-h-screen bg-[#F8F9FA] flex flex-col font-['Inter']">
            <Navbar role={role} />
            <main className="flex-1 p-6 lg:p-10 flex flex-col max-w-[1600px] mx-auto w-full h-[calc(100vh-80px)]">
                {role === 'donor' ? (
                    /* DONOR VIEW (BLUE THEME) */
                    <div className="flex-1 flex flex-col md:flex-row gap-6 h-full overflow-hidden">
                        {/* LEFT PANE: Conversations List */}
                        <div className="w-full md:w-[380px] flex-shrink-0 flex flex-col border-[6px] border-[#7BA4D5] rounded-[2rem] overflow-hidden bg-white shadow-sm h-full">
                            <div className="bg-[#7BA4D5] px-6 py-5 flex items-center justify-between">
                                <h2 className="text-white text-xl font-bold flex items-center gap-2">
                                    <MessageSquare className="w-6 h-6" /> Messages
                                </h2>
                                <button className="p-2 bg-white/20 text-white rounded-full hover:bg-white/30 transition-colors">
                                    <Search className="w-5 h-5" />
                                </button>
                            </div>
                            <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
                                {[1, 2, 3, 4, 5, 6].map((i) => (
                                    <div key={i} className={`p-4 rounded-2xl border flex items-center gap-4 cursor-pointer transition-colors ${i === 1 ? 'bg-[#F4F7FA] border-[#7BA4D5] shadow-sm' : 'bg-white border-[#DDE6ED] hover:border-[#7BA4D5]/50 hover:bg-[#F8FAFC]'}`}>
                                        <div className="w-12 h-12 rounded-full bg-[#DDE6ED] flex items-center justify-center text-[#7BA4D5] font-bold text-lg flex-shrink-0">
                                            C{i}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex justify-between items-center mb-1">
                                                <h3 className="text-[#2C4663] font-bold truncate">Charity Organization {i}</h3>
                                                <span className="text-xs font-semibold text-[#7BA4D5]">{i}m ago</span>
                                            </div>
                                            <p className="text-[#2C4663]/60 text-sm truncate">Thank you for your generous contribution!</p>
                                        </div>
                                        {i === 1 && <div className="w-3 h-3 rounded-full bg-[#E58066]"></div>}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* RIGHT PANE: Active Chat */}
                        <div className="flex-1 flex flex-col border-[6px] border-[#7BA4D5] rounded-[2rem] overflow-hidden bg-white shadow-sm h-full max-md:hidden">
                            {/* Chat Header */}
                            <div className="bg-white border-b-2 border-[#DDE6ED] px-8 py-5 flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-full bg-[#7BA4D5] flex items-center justify-center text-white font-bold text-lg">C1</div>
                                    <div>
                                        <h2 className="text-[#2C4663] text-xl font-bold">Charity Organization 1</h2>
                                        <p className="text-[#7BA4D5] text-sm font-medium flex items-center gap-1">
                                            <User className="w-3 h-3" /> Sarah (Coordinator)
                                        </p>
                                    </div>
                                </div>
                                <button className="p-2 text-[#7BA4D5] hover:bg-[#F4F7FA] rounded-full transition-colors">
                                    <MoreVertical className="w-6 h-6" />
                                </button>
                            </div>

                            {/* Chat Messages */}
                            <div className="flex-1 overflow-y-auto p-8 flex flex-col gap-6 bg-[#F8FAFC]">
                                <div className="text-center font-medium text-xs text-[#7BA4D5] mb-4">Today, 9:41 AM</div>

                                <div className="flex items-start gap-4 max-w-[80%]">
                                    <div className="w-8 h-8 rounded-full bg-[#7BA4D5] flex-shrink-0 mt-1"></div>
                                    <div className="bg-white border border-[#DDE6ED] p-4 rounded-2xl rounded-tl-sm shadow-sm text-[#2C4663] text-sm leading-relaxed">
                                        Hi there! We received your donation of canned goods. We really appreciate your support for our ongoing typhoon relief operations.
                                    </div>
                                </div>

                                <div className="flex items-start gap-4 max-w-[80%] self-end flex-row-reverse">
                                    <div className="bg-[#7BA4D5] p-4 rounded-2xl rounded-tr-sm shadow-sm text-white text-sm leading-relaxed">
                                        You're very welcome! Let me know if you need any other specific items, I can check my pantry.
                                    </div>
                                </div>

                                <div className="flex items-start gap-4 max-w-[80%]">
                                    <div className="w-8 h-8 rounded-full bg-[#7BA4D5] flex-shrink-0 mt-1"></div>
                                    <div className="bg-white border border-[#DDE6ED] p-4 rounded-2xl rounded-tl-sm shadow-sm text-[#2C4663] text-sm leading-relaxed">
                                        Currently we are very short on bottled water and blankets. If you happen to have any spare, that would be wonderful!
                                    </div>
                                </div>
                            </div>

                            {/* Chat Input */}
                            <div className="bg-white p-6 border-t-2 border-[#DDE6ED]">
                                <div className="flex items-center gap-4 bg-[#F4F7FA] rounded-full p-2 border border-[#DDE6ED]">
                                    <input
                                        type="text"
                                        placeholder="Type your message..."
                                        className="flex-1 bg-transparent border-none outline-none px-4 text-[#2C4663] placeholder-[#7BA4D5]/60"
                                    />
                                    <button className="bg-[#7BA4D5] text-white p-3 rounded-full hover:bg-[#608EС7] transition-colors shadow-sm">
                                        <Send className="w-5 h-5 ml-1" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    /* ORGANIZATION VIEW (ORANGE THEME) */
                    <div className="flex-1 flex flex-col md:flex-row gap-6 h-full overflow-hidden">
                        {/* LEFT PANE: Conversations List */}
                        <div className="w-full md:w-[380px] flex-shrink-0 flex flex-col border-[6px] border-[#FFB27D] rounded-[2rem] overflow-hidden bg-white shadow-sm h-full">
                            <div className="bg-[#FFD1B3] px-6 py-5 flex items-center justify-between border-b-2 border-[#FFB27D]">
                                <h2 className="text-[#5A2C10] text-lg font-black uppercase tracking-widest flex items-center gap-2">
                                    <MessageSquare className="w-6 h-6" /> Inquiries
                                </h2>
                                <button className="p-2 bg-white text-[#FF944D] rounded-full hover:bg-[#FFF5F0] transition-colors border border-[#FFB27D]/30 shadow-sm">
                                    <Search className="w-5 h-5" />
                                </button>
                            </div>
                            <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
                                {[1, 2, 3, 4, 5, 6].map((i) => (
                                    <div key={i} className={`p-4 rounded-2xl border flex items-center gap-4 cursor-pointer transition-colors ${i === 1 ? 'bg-[#FFF5F0] border-[#FFB27D] shadow-sm' : 'bg-white border-[#FFD1B3] hover:border-[#FFB27D]/50 hover:bg-[#FFF5F0]'}`}>
                                        <div className="w-12 h-12 rounded-full bg-[#FFEDE1] flex items-center justify-center text-[#FF944D] font-black text-lg flex-shrink-0">
                                            D{i}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex justify-between items-center mb-1">
                                                <h3 className="text-[#5A2C10] font-bold truncate">Donor Profile {i}</h3>
                                                <span className="text-xs font-bold text-[#FF944D]">{i * 2}h ago</span>
                                            </div>
                                            <p className="text-[#5A2C10]/60 text-sm font-medium truncate">I have some clothes to drop off...</p>
                                        </div>
                                        {i === 1 && <div className="w-3 h-3 rounded-full bg-[#5A2C10]"></div>}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* RIGHT PANE: Active Chat */}
                        <div className="flex-1 flex flex-col border-[6px] border-[#FFB27D] rounded-[2rem] overflow-hidden bg-white shadow-sm h-full max-md:hidden">
                            {/* Chat Header */}
                            <div className="bg-[#FFF5F0] border-b-2 border-[#FFB27D] px-8 py-5 flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-full bg-white border-2 border-[#FFB27D] flex items-center justify-center text-[#FF944D] font-black text-lg shadow-sm">D1</div>
                                    <div>
                                        <h2 className="text-[#5A2C10] text-xl font-black uppercase tracking-wider">Donor Profile 1</h2>
                                        <p className="text-[#FF944D] text-sm font-bold flex items-center gap-1">
                                            Pending Pickup Arrangement
                                        </p>
                                    </div>
                                </div>
                                <button className="p-2 text-[#5A2C10] bg-white hover:bg-[#FFD1B3] border border-[#FFD1B3] rounded-full transition-colors shadow-sm">
                                    <MoreVertical className="w-6 h-6" />
                                </button>
                            </div>

                            {/* Chat Messages */}
                            <div className="flex-1 overflow-y-auto p-8 flex flex-col gap-6 bg-white">
                                <div className="text-center font-bold text-xs uppercase tracking-widest text-[#FF944D] mb-4">Yesterday</div>

                                <div className="flex items-start gap-4 max-w-[80%]">
                                    <div className="w-8 h-8 rounded-full bg-[#FFEDE1] border border-[#FFD1B3] flex-shrink-0 mt-1"></div>
                                    <div className="bg-[#FFF5F0] border border-[#FFD1B3] p-4 rounded-xl rounded-tl-sm shadow-sm text-[#5A2C10] text-sm font-medium leading-relaxed">
                                        Hello! I have about 3 boxes of winter clothes. Do you still need these for the upcoming drive?
                                    </div>
                                </div>

                                <div className="flex items-start gap-4 max-w-[80%] self-end flex-row-reverse">
                                    <div className="bg-white border-2 border-[#FFB27D] p-4 rounded-xl rounded-tr-sm shadow-sm text-[#5A2C10] text-sm font-medium leading-relaxed">
                                        Yes, absolutely! Winter clothes are high priority right now. When are you available to drop them off, or do you need a pickup?
                                    </div>
                                </div>

                                <div className="flex items-start gap-4 max-w-[80%]">
                                    <div className="w-8 h-8 rounded-full bg-[#FFEDE1] border border-[#FFD1B3] flex-shrink-0 mt-1"></div>
                                    <div className="bg-[#FFF5F0] border border-[#FFD1B3] p-4 rounded-xl rounded-tl-sm shadow-sm text-[#5A2C10] text-sm font-medium leading-relaxed">
                                        I can drop them off tomorrow afternoon around 2 PM.
                                    </div>
                                </div>
                            </div>

                            {/* Chat Input */}
                            <div className="bg-[#FFF5F0] p-6 border-t-2 border-[#FFB27D]">
                                <div className="flex items-center gap-4 bg-white rounded-full p-2 border border-[#FFD1B3] shadow-sm">
                                    <input
                                        type="text"
                                        placeholder="Send a message to Donor..."
                                        className="flex-1 bg-transparent border-none outline-none px-4 text-[#5A2C10] placeholder-[#FF944D]/50 font-medium"
                                    />
                                    <button className="bg-[#FF944D] text-white p-3 rounded-full hover:bg-[#E58066] transition-colors shadow">
                                        <Send className="w-5 h-5 ml-1" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    )
}

export default InboxPage