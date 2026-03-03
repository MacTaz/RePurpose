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

    const role = (user.user_metadata?.role || 'donor') as 'donor' | 'organization';

    return (
        <div className="min-h-screen bg-white flex flex-col font-inter">
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
