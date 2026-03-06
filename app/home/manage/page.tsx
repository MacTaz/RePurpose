// app/manage/page.tsx — SERVER COMPONENT
import React from 'react'
import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Navbar from '@/components/Navbar'
import ManageDonor from '@/components/ManageDonor'
import ManageCharity from '@/components/ManageCharity'

const Manage = async () => {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/login')

    const role = (user.user_metadata?.role || 'donor') as 'donor' | 'organization'

    // Fetch this donor's donations from Supabase
    const { data: donations } = await supabase
        .from('donations')
        .select('id, donor_id, organization_id, type, quantity, status, created_at, target_organization')
        .eq('donor_id', user.id)
        .order('created_at', { ascending: false })

    return (
        <div className="min-h-screen bg-white flex flex-col font-inter">
            <Navbar role={role} />

            {role === 'donor' ? (
                <ManageDonor donations={donations || []} />
            ) : (
                <ManageCharity />
            )}
        </div>
    )
}

export default Manage