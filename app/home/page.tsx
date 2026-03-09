import { createClient, createAdminClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Navbar from '@/components/Navbar'
import DonorHome from './_components/DonorHome'
import OrgHome from './_components/OrgHome'

const Home = async () => {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/login')

    const setupDone = user.user_metadata?.setup_complete === true

    const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle()

    if (!setupDone || !profile?.setup_complete) {
        const isOAuth = user.app_metadata.provider !== 'email'
        if (isOAuth) {
            redirect(`/register?oauth=true&email=${user.email || ''}`)
        } else {
            redirect('/register?step=2')
        }
    }

    const role = (profile?.role || 'donor') as 'donor' | 'organization'

    if (role === 'donor') {
        const { data: donations } = await supabase
            .from('donations')
            .select('*')
            .eq('donor_id', user.id)
            .order('created_at', { ascending: false })
            .limit(20)

        const orgIds = [...new Set((donations || []).map((d: any) => d.organization_id).filter(Boolean))]

        // Fetch org names
        const { data: orgProfiles } = orgIds.length > 0
            ? await supabase.from('profiles').select('id, full_name').in('id', orgIds)
            : { data: [] }

        // Fetch org addresses via admin client to bypass RLS
        const adminSupabase = createAdminClient()
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
            <div className="min-h-screen bg-white flex flex-col font-['Inter']">
                <Navbar role={role} />
                <DonorHome donations={mappedDonations} />
            </div>
        )
    }

    // Organization — fetch pending donations
    const { data: donations } = await supabase
        .from('donations')
        .select('*')
        .eq('organization_id', user.id)
        .order('created_at', { ascending: false })

    const donorIds = [...new Set((donations || []).map((d: any) => d.donor_id).filter(Boolean))]

    const adminSupabase = createAdminClient()

    // Fetch donor names
    const { data: donorProfiles } = donorIds.length > 0
        ? await adminSupabase.from('profiles').select('id, full_name').in('id', donorIds)
        : { data: [] }

    // Fetch donor addresses via admin client to bypass RLS
    const { data: donorAddresses } = donorIds.length > 0
        ? await adminSupabase.from('addresses').select('*').in('user_id', donorIds)
        : { data: [] }

    const donorProfileMap: Record<string, any> = {}
    for (const p of (donorProfiles || [])) donorProfileMap[p.id] = p

    const donorAddressMap: Record<string, any> = {}
    for (const a of (donorAddresses || [])) {
        if (!donorAddressMap[a.user_id]) {
            donorAddressMap[a.user_id] = a // just take the first address
        }
    }

    const mappedDonations = (donations || []).map((d: any) => {
        const profile = donorProfileMap[d.donor_id] || {}
        const addr = donorAddressMap[d.donor_id] || {}
        return {
            ...d,
            donor_name: profile.full_name || 'Anonymous Donor',
            donor_address: addr.city ? `${addr.city}, ${addr.country}` : 'City Not Set',
            donor_city: addr.city || 'City Not Set',
            donor_country: addr.country || 'Country Not Set',
            donor_lat: addr.latitude,
            donor_lng: addr.longitude,
            donor_line1: addr.address_line1 || 'Missing Street Address',
            donor_line2: addr.address_line2,
            donor_zip: addr.zip || '----',
        }
    })

    return (
        <div className="min-h-screen bg-white flex flex-col font-['Inter']">
            <Navbar role="organization" />
            <OrgHome orgId={user.id} donations={mappedDonations} />
        </div>
    )
}

export default Home