import React from 'react'
import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Navbar from '@/components/Navbar'
import DonorProfile from '@/components/DonorProfile'
import CharityProfile from '@/components/CharityProfile'

const ProfilePage = async () => {
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
        <div className="min-h-screen bg-white flex flex-col font-['Inter']">
            <Navbar role={role} />
            {role === 'donor' ? (
                <DonorProfile
                    user={{
                        name: profile?.full_name || 'Donor User',
                        email: user.email || '',
                        role: role
                    }}
                />
            ) : (
                <CharityProfile
                    user={{
                        name: profile?.full_name || 'Organization User',
                        email: user.email || '',
                        role: role
                    }}
                />
            )}
        </div>
    )
}

export default ProfilePage