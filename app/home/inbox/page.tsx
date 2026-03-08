// app/home/inbox/page.tsx — SERVER COMPONENT
import React from 'react'
import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Navbar from '@/components/Navbar'
import InboxClient from './_components/InboxClient'

const InboxPage = async () => {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) redirect('/login')

    const role = (user.user_metadata?.role || 'donor') as 'donor' | 'organization'

    // Fetch the user's display name from profiles
    const { data: profile } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', user.id)
        .single()

    const displayName = profile?.full_name || user.email || 'You'

    return (
        <div className="h-screen bg-[#F8F9FA] flex flex-col overflow-hidden font-['Inter']">
            <Navbar role={role} />
            <main className="flex-1 flex flex-col max-w-[1600px] mx-auto w-full overflow-hidden" style={{ height: 'calc(100vh - 80px)' }}>
                <InboxClient
                    role={role}
                    userId={user.id}
                    userDisplayName={displayName}
                />
            </main>
        </div>
    )
}

export default InboxPage