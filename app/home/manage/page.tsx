import React from 'react'
import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Navbar from '@/components/Navbar'
import DonorManage from './_components/DonorManage'
import OrgManage from './_components/OrgManage'

const Manage = async () => {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect('/login');
    }

    const role = (user.user_metadata?.role || 'donor') as 'donor' | 'organization';

    return (
        <div className="min-h-screen bg-white font-sans flex flex-col">
            <Navbar role={role} />

            {role === 'donor' ? <DonorManage /> : <OrgManage />}
        </div>
    )
}

export default Manage
