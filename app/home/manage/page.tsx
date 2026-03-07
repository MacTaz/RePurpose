import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Navbar from '@/components/Navbar'
import ManageDonor from '@/components/ManageDonor'
import ManageCharity from '@/components/ManageCharity'

export default async function Manage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    // Fetch profile and role
    const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

    // Debugging (Remove later): Log the exact role being used
    console.log(`MANAGE PAGE ACCESS: User ${user.email} with role: '${profile?.role}'`);

    const rawRole = profile?.role || ''
    const normalizedRole = rawRole.toString().toLowerCase().trim()

    // UI Branching based on normalized role
    if (normalizedRole === 'donor') {
        const { data: donations } = await supabase
            .from('donations')
            .select('id, donor_id, organization_id, type, quantity, status, created_at, target_organization, description, delivery_preference')
            .eq('donor_id', user.id)
            .order('created_at', { ascending: false })

        return (
            <div className="min-h-screen bg-white flex flex-col font-inter">
                <Navbar role="donor" />
                <ManageDonor donations={donations || []} />
            </div>
        )
    }

    if (normalizedRole === 'organization' || normalizedRole === 'charity') {
        const { data: donations } = await supabase
            .from('donations')
            .select(`
                id, donor_id, organization_id, type, quantity, status, created_at, target_organization, description, delivery_preference,
                profiles!donations_donor_id_fkey(
                    full_name,
                    addresses(city, country)
                )
            `)
            .eq('organization_id', user.id)
            .order('created_at', { ascending: false })

        const mappedDonations = donations?.map((d: any) => ({
            ...d,
            donor_name: d.profiles?.full_name || 'Anonymous Donor',
            donor_address: d.profiles?.addresses?.[0]
                ? `${d.profiles.addresses[0].city}, ${d.profiles.addresses[0].country}`
                : 'Central City'
        })) || []

        return (
            <div className="min-h-screen bg-white flex flex-col font-inter">
                <Navbar role="organization" />
                <ManageCharity donations={mappedDonations} />
            </div>
        )
    }

    // fallback for unexpected roles - help developer see why it failed
    const errorMsg = `Unauthorized access attempt or invalid role: [${rawRole}] for user ${user.id}`;
    console.warn(errorMsg);

    // As a final fallback instead of redirect, show a non-blank debug screen if role is truly weird
    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-10 font-mono">
            <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full border border-red-100">
                <h1 className="text-red-500 font-black text-xl mb-4">Role Not Recognized</h1>
                <p className="text-gray-600 mb-2 font-bold">Your database role is: <span className="bg-gray-100 px-2 py-1 rounded text-red-600">"{rawRole}"</span></p>
                <p className="text-gray-500 text-sm leading-relaxed mb-6">Our system expects exactly <span className="underline italic">"donor"</span> or <span className="underline italic">"organization"</span>. Please contact support or check your profile settings.</p>
                <a href="/home" className="block w-full text-center py-3 bg-gray-900 text-white rounded-xl font-bold hover:bg-black transition-all">Return Home</a>
            </div>
        </div>
    );
}