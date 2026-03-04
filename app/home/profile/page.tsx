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

            {/* 1. Fixed the conditional block here */}
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

            {/* 2. Moved the main content outside the ternary so it actually displays */}
            <main className="flex-1 p-10">
                <h1 className="text-3xl font-bold text-slate-800">Profile</h1>
                <div className="mt-8 bg-slate-50 p-6 rounded-2xl border border-slate-200 shadow-sm max-w-2xl">
                    <p className="text-slate-600"><strong>Name:</strong> {profile?.full_name}</p>
                    <p className="text-slate-600"><strong>Email:</strong> {user.email}</p>
                    <p className="text-slate-600 capitalize"><strong>Role:</strong> {role}</p>
                    
                    {role === 'donor' ? (
                        <p className="text-slate-600"><strong>Bio:</strong> {details?.bio || 'No bio added'}</p>
                    ) : (
                        <>
                            <p className="text-slate-600"><strong>Description:</strong> {details?.description || 'No description added'}</p>
                            <p className="text-slate-600 capitalize"><strong>Donation Method:</strong> {details?.donation_method}</p>
                            <p className="text-slate-600"><strong>Verified:</strong> {details?.is_verified ? 'Yes ✅' : 'No ❌'}</p>
                        </>
                    )}
                </div>
            </main>
        </div>
    )
}

export default ProfilePage;