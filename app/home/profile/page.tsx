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
        .select(`
            *,
            donor_profiles(bio),
            organization_profiles(description, donation_method, is_verified)
        `)
        .eq('id', user.id)
        .maybeSingle();

    const role = (profile?.role || 'donor') as 'donor' | 'organization';

    // Accessing nested data safely
    const details = role === 'donor'
        ? profile?.donor_profiles?.[0]
        : profile?.organization_profiles?.[0];

    return (
        <div className="min-h-screen bg-white flex flex-col font-inter">
            <Navbar role={role} />

            {/* 1. Profile Rendering */}
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
                        role: role,
                        isVerified: details?.is_verified || false
                    }}
                />
            )}
        </div>
    )
}

export default ProfilePage;