import React from 'react'
import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Navbar from '@/components/Navbar'
import InboxClient from './_components/InboxClient'

const InboxPage = async () => {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect('/login');
    }

    // Faster approach: Get role directly from user metadata
    const role = (user.user_metadata?.role || 'donor') as 'donor' | 'organization';

    return (
        <div className="h-screen flex flex-col bg-white overflow-hidden font-inter">
            <Navbar role={role} />
            <main className="flex-1 flex overflow-hidden">
                <InboxClient role={role} />
            </main>
        </div>
    )
}

export default InboxPage