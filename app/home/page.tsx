import React from 'react'
import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Navbar from '@/components/Navbar'
import DonorHome from './_components/DonorHome'
import OrgHome from './_components/OrgHome'

const Home = async () => {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect('/login');
    }

    // Faster approach: Get role directly from user metadata
    // This avoids an extra database call to the 'profiles' table
    const role = (user.user_metadata?.role || 'donor') as 'donor' | 'organization';

    return (
        <div className="min-h-screen bg-white flex flex-col font-['Inter']">
            <Navbar role={role} />

            {role === 'donor' ? <DonorHome /> : <OrgHome />}
        </div>
    )
}

export default Home
