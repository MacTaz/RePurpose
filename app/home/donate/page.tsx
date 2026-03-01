import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Navbar from '@/components/Navbar'
import DonationForm from './_components/DonationForm'

export default async function Donate() {
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
        <div className="min-h-screen bg-[#9dbcd4] flex flex-col font-['Inter']">
            <Navbar role={role} />
            <main className="flex-1">
                <DonationForm />
            </main>
        </div>
    )
}