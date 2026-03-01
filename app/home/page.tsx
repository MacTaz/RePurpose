import React from 'react'
import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Navbar from '@/components/Navbar'
import DonorHome from './_components/DonorHome'
import OrgHome from './_components/OrgHome'

const Home = async () => {
    const supabase = await createClient();

    // 1. Check if user is logged in
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        redirect('/login');
    }

    // 2. Faster approach: Check metadata for setup status
    // If not complete in metadata, check the 'profiles' table as a fallback
    const setupComplete = user.user_metadata?.setup_complete;

    if (!setupComplete) {
        const { data: profile } = await supabase
            .from('profiles')
            .select('id')
            .eq('id', user.id)
            .maybeSingle();

        if (!profile) {
            redirect('/setup');
        }
    }

    // 3. Get role directly from user metadata for speed
    const role = (user.user_metadata?.role || 'donor') as 'donor' | 'organization';

    return (
        <div className="min-h-screen bg-white flex flex-col font-['Inter']">
            <Navbar role={role} />

            {role === 'donor' ? <DonorHome /> : <OrgHome />}
        </div>
    )
}

export default Home
