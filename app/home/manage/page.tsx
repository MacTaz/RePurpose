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
            .select(`
                *,
                organizationProfile:profiles!donations_organization_id_fkey(
                    full_name,
                    addresses(
                        *
                    )
                )
            `)
            .eq('donor_id', user.id)
            .order('created_at', { ascending: false })

        const mappedDonations = (donations || []).map((d: any) => {
            // Robustly extract the organization profile
            const rawOrg = d.organizationProfile || d.profiles || d.organization;
            const profile = Array.isArray(rawOrg) ? rawOrg[0] : rawOrg;
            const addressArray = profile?.addresses || [];
            const addr = Array.isArray(addressArray) ? addressArray[0] : addressArray;

            return {
                ...d,
                org_name: profile?.full_name || d.target_organization || 'Unknown Organization',
                org_address: addr?.city ? `${addr.city}, ${addr.country}` : (addr?.full_address || 'City Not Set'),
                org_city: addr?.city || 'City Not Set',
                org_country: addr?.country || 'Country Not Set',
                org_lat: addr?.latitude,
                org_lng: addr?.longitude,
                org_line1: addr?.address_line1 || addr?.full_address || 'Missing Street Address',
                org_line2: addr?.address_line2,
                org_zip: addr?.zip || '----'
            };
        })

        return (
            <div className="min-h-screen bg-white flex flex-col font-inter">
                <Navbar role="donor" />
                <ManageDonor donations={mappedDonations || []} />
            </div>
        )
    }

    if (normalizedRole === 'organization' || normalizedRole === 'charity' || normalizedRole === 'admin') {
        const { data: donations } = await supabase
            .from('donations')
            .select(`
                *,
                donorProfile:profiles!donations_donor_id_fkey(
                    full_name,
                    addresses(*)
                )
            `)
            .eq('organization_id', user.id)
            .order('created_at', { ascending: false })

        const mappedDonations = (donations || []).map((d: any) => {
            // Robustly extract the donor profile
            const rawDonor = d.donorProfile || d.profiles || d.donor;
            const profile = Array.isArray(rawDonor) ? rawDonor[0] : rawDonor;
            const addressArray = profile?.addresses || [];
            const addr = Array.isArray(addressArray) ? addressArray[0] : addressArray;

            return {
                ...d,
                donor_name: profile?.full_name || 'Anonymous Donor',
                donor_address: addr?.city ? `${addr.city}, ${addr.country}` : (addr?.full_address || 'City Not Set'),
                donor_city: addr?.city || 'City Not Set',
                donor_country: addr?.country || 'Country Not Set',
                donor_lat: addr?.latitude,
                donor_lng: addr?.longitude,
                donor_line1: addr?.address_line1 || addr?.full_address || 'Missing Street Address',
                donor_line2: addr?.address_line2,
                donor_zip: addr?.zip || '----'
            };
        })

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