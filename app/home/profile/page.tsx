import React from 'react'
import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Navbar from '@/components/Navbar'
import ProfileClient from './_components/ProfileClient'

export default async function ProfilePage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect('/login');
    }

    // Fetch comprehensive profile data
    const { data: profile } = await supabase
        .from('profiles')
        .select(`
            *,
            donor_profiles(*),
            organization_profiles(*),
            addresses(*)
        `)
        .eq('id', user.id)
        .maybeSingle();

    if (!profile) {
        redirect('/home');
    }

    const role = (profile.role || 'donor') as 'donor' | 'organization';

    // Flatten data for the client component
    const processedProfile = {
        ...profile,
        details: role === 'donor'
            ? (Array.isArray(profile.donor_profiles) ? profile.donor_profiles[0] : profile.donor_profiles) || {}
            : (Array.isArray(profile.organization_profiles) ? profile.organization_profiles[0] : profile.organization_profiles) || {},
        address: (Array.isArray(profile.addresses) ? profile.addresses[0] : profile.addresses) || {}
    };

    return (
        <div className="min-h-screen bg-[#F8FAFC] flex flex-col font-inter overflow-hidden">
            <Navbar role={role} />
            <main className="flex-1 overflow-hidden">
                <ProfileClient
                    initialProfile={processedProfile}
                    userId={user.id}
                    email={user.email || ''}
                />
            </main>
        </div>
    )
}