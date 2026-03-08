import { createClient, createAdminClient } from '@/utils/supabase/server'
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

    const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

    const rawRole = profile?.role || ''
    const normalizedRole = rawRole.toString().toLowerCase().trim()

    // Admin client bypasses RLS — needed to read other users' addresses
    const adminSupabase = createAdminClient()

    // ─── DONOR VIEW ───────────────────────────────────────────────────────────
    if (normalizedRole === 'donor') {
        const { data: donations } = await supabase
            .from('donations')
            .select('*')
            .eq('donor_id', user.id)
            .order('created_at', { ascending: false })

        const orgIds = [...new Set((donations || []).map((d: any) => d.organization_id).filter(Boolean))]

        // Fetch org names (regular client is fine — profiles are public)
        const { data: orgProfiles } = orgIds.length > 0
            ? await supabase.from('profiles').select('id, full_name').in('id', orgIds)
            : { data: [] }

        // Use admin client to bypass RLS on addresses
        const { data: orgAddresses } = orgIds.length > 0
            ? await adminSupabase.from('addresses').select('*').in('user_id', orgIds)
            : { data: [] }

        const orgProfileMap: Record<string, any> = {}
        for (const p of (orgProfiles || [])) orgProfileMap[p.id] = p

        const orgAddressMap: Record<string, any> = {}
        for (const a of (orgAddresses || [])) orgAddressMap[a.user_id] = a

        const mappedDonations = (donations || []).map((d: any) => {
            const op = orgProfileMap[d.organization_id] || null
            const addr = orgAddressMap[d.organization_id] || null
            return {
                ...d,
                org_name: op?.full_name || d.target_organization || 'Unknown Organization',
                org_address: addr?.city ? `${addr.city}, ${addr.country}` : '',
                org_city: addr?.city || '',
                org_country: addr?.country || '',
                org_lat: addr?.latitude || null,
                org_lng: addr?.longitude || null,
                org_line1: addr?.address_line1 || '',
                org_line2: addr?.address_line2 || '',
                org_zip: addr?.zip || ''
            }
        })

        return (
            <div className="min-h-screen bg-white flex flex-col font-inter">
                <Navbar role="donor" />
                <ManageDonor donations={mappedDonations} />
            </div>
        )
    }

    // ─── ORGANIZATION VIEW ────────────────────────────────────────────────────
    if (normalizedRole === 'organization' || normalizedRole === 'charity' || normalizedRole === 'admin') {
        const { data: donations } = await supabase
            .from('donations')
            .select('*')
            .eq('organization_id', user.id)
            .order('created_at', { ascending: false })

        const donorIds = [...new Set((donations || []).map((d: any) => d.donor_id).filter(Boolean))]

        // Fetch donor names (regular client is fine — profiles are public)
        const { data: donorProfiles } = donorIds.length > 0
            ? await supabase.from('profiles').select('id, full_name').in('id', donorIds)
            : { data: [] }

        // Use admin client to bypass RLS on addresses
        const { data: donorAddresses } = donorIds.length > 0
            ? await adminSupabase.from('addresses').select('*').in('user_id', donorIds)
            : { data: [] }

        const donorProfileMap: Record<string, any> = {}
        for (const p of (donorProfiles || [])) donorProfileMap[p.id] = p

        const donorAddressMap: Record<string, any> = {}
        for (const a of (donorAddresses || [])) donorAddressMap[a.user_id] = a

        const mappedDonations = (donations || []).map((d: any) => {
            const dp = donorProfileMap[d.donor_id] || null
            const addr = donorAddressMap[d.donor_id] || null
            return {
                ...d,
                donor_name: dp?.full_name || 'Anonymous Donor',
                donor_address: addr?.city ? `${addr.city}, ${addr.country}` : '',
                donor_city: addr?.city || '',
                donor_country: addr?.country || '',
                donor_lat: addr?.latitude || null,
                donor_lng: addr?.longitude || null,
                donor_line1: addr?.address_line1 || '',
                donor_line2: addr?.address_line2 || '',
                donor_zip: addr?.zip || ''
            }
        })

        return (
            <div className="min-h-screen bg-white flex flex-col font-inter">
                <Navbar role="organization" />
                <ManageCharity donations={mappedDonations} />
            </div>
        )
    }

    // Fallback
    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-10 font-mono">
            <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full border border-red-100">
                <h1 className="text-red-500 font-black text-xl mb-4">Role Not Recognized</h1>
                <p className="text-gray-600 mb-2 font-bold">Your database role is: <span className="bg-gray-100 px-2 py-1 rounded text-red-600">"{rawRole}"</span></p>
                <p className="text-gray-500 text-sm leading-relaxed mb-6">Our system expects <span className="underline italic">"donor"</span> or <span className="underline italic">"organization"</span>.</p>
                <a href="/home" className="block w-full text-center py-3 bg-gray-900 text-white rounded-xl font-bold hover:bg-black transition-all">Return Home</a>
            </div>
        </div>
    )
}