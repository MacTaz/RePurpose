import { createClient } from '@/utils/supabase/server'
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
            .select('id, type, created_at, quantity')
            .eq('donor_id', user.id)
            .order('created_at', { ascending: false })
            .limit(20)

        return (
            <div className="min-h-screen bg-white flex flex-col font-['Inter']">
                <Navbar role={role} />
                <DonorHome donations={donations || []} />
            </div>
        )
    }

    // Organization — fetch pending donations with donor info + address
    const { data: donations } = await supabase
        .from('donations')
        .select(`
            id, donor_id, organization_id, type, quantity, status, created_at, description, delivery_preference,
            profiles!donations_donor_id_fkey(
                full_name,
                addresses(city, country, latitude, longitude, address_line1, address_line2, zip)
            )
        `)
        .eq('organization_id', user.id)
        .order('created_at', { ascending: false })

    const mappedDonations = (donations || []).map((d: any) => {
        const addr = d.profiles?.addresses?.[0] || {}
        return {
            ...d,
            donor_name: d.profiles?.full_name || 'Anonymous Donor',
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