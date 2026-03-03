import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Navbar from '@/components/Navbar'
import DisasterWatchClient from './DisasterWatchClient'
import DiscoverCharitiesClient from './DiscoverCharitiesClient'
import RecentDonationsClient from './RecentDonationsClient'

const Home = async () => {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/login')

    const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

    // Fetch donations server-side and pass as props — no client supabase needed
    const { data: donations } = await supabase
        .from('donations')
        .select('id, type, created_at, amount')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(20)

    const role = (profile?.role || 'donor') as 'donor' | 'organization'

    return (
        <div className="min-h-screen bg-white flex flex-col font-['Inter']">
            <Navbar role={role} />

            {role === 'donor' ? (
                <main className="flex-1 p-10 flex gap-8">
                    {/* LEFT: Disaster Watch */}
                    <DisasterWatchClient />

                    {/* RIGHT: Discover & Recent */}
                    <div className="flex-1 flex flex-col gap-8">
                        <DiscoverCharitiesClient />
                        <RecentDonationsClient donations={donations || []} />
                    </div>
                </main>
            ) : (
                <main className="flex-1 p-10 flex flex-col gap-8">
                    <div className="flex-[0.8] border-[6px] border-[#FFB27D] rounded-xl overflow-hidden shadow-sm flex flex-col">
                        <div className="bg-[#FFD1B3] px-6 py-2 border-b-2 border-[#FFB27D]">
                            <h2 className="text-black text-lg font-extrabold">Status Management</h2>
                        </div>
                        <div className="flex-1 bg-white p-5 flex flex-col gap-4">
                            <div className="flex-1 bg-[#FFEDE1] rounded-lg"></div>
                            <div className="flex-1 bg-[#FFEDE1] rounded-lg"></div>
                            <div className="flex-1 bg-[#FFEDE1] rounded-lg"></div>
                        </div>
                    </div>
                    <div className="flex-[1.2] flex gap-8">
                        <div className="flex-[0.4] border-[6px] border-[#FFB27D] rounded-xl overflow-hidden shadow-sm flex flex-col">
                            <div className="bg-[#FFD1B3] px-4 py-2 border-b-2 border-[#FFB27D]">
                                <h2 className="text-black text-lg font-extrabold">Inventory Needs</h2>
                            </div>
                            <div className="flex-1 bg-white p-4 flex flex-col gap-3">
                                <div className="bg-[#FFEDE1] h-12 rounded-lg"></div>
                                <div className="bg-[#FFEDE1] h-12 rounded-lg"></div>
                                <div className="bg-[#FFEDE1] h-12 rounded-lg"></div>
                            </div>
                        </div>
                        <div className="flex-1 border-[6px] border-[#FFB27D] rounded-xl overflow-hidden shadow-sm flex flex-col">
                            <div className="bg-[#FFD1B3] px-6 py-2 border-b-2 border-[#FFB27D]">
                                <h2 className="text-black text-lg font-extrabold">Incoming Matches</h2>
                            </div>
                            <div className="flex-1 bg-white p-4">
                                <div className="bg-[#FFEDE1] w-full h-full rounded-lg"></div>
                            </div>
                        </div>
                    </div>
                </main>
            )}
        </div>
    )
}

export default Home