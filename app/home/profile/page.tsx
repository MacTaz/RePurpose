import React from 'react'
import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Navbar from '@/components/Navbar'

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
        <div className="min-h-screen bg-white flex flex-col font-inter">
            <Navbar role={role} />
            <main className="flex-1 p-10">
                <h1 className="text-3xl font-bold text-slate-800">Profile</h1>
                <div className="mt-8 bg-slate-50 p-6 rounded-2xl border border-slate-200 shadow-sm max-w-2xl">
                    <p className="text-slate-600"><strong>Name:</strong> {profile?.full_name}</p>
                    <p className="text-slate-600"><strong>Email:</strong> {user.email}</p>
                    <p className="text-slate-600 capitalize"><strong>Role:</strong> {role}</p>
                </div>
            </main>
        </div>
    )
}

export default ProfilePage