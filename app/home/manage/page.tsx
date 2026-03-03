import React from 'react'
import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Navbar from '@/components/Navbar'
import ManageDonor from '@/components/ManageDonor'
import ManageCharity from '@/components/ManageCharity'

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
                <ManageDonor />
            ) : (
                /* ORGANIZATION VIEW */
                <ManageCharity />
            )}
        </div>
    )
}

export default Manage
