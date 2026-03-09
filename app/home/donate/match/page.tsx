import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import MatchClient from './_components/MatchClient'
import { createClient as createAdminClient } from '@supabase/supabase-js'
export default async function MatchPage({ searchParams }: { searchParams: Promise<{ category?: string, pref?: string }> }) {
    const { category, pref } = await searchParams;
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect('/login');
    }

    const adminSupabase = createAdminClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY!);
    const { data: usersData } = await adminSupabase.auth.admin.listUsers();
    const userEmails: Record<string, string> = {};
    if (usersData?.users) {
        usersData.users.forEach(u => {
            if (u.email) userEmails[u.id] = u.email;
        });
    }

    const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

    const role = (profile?.role || 'donor') as 'donor' | 'organization';

    const { data: userAddr } = await adminSupabase
        .from('addresses')
        .select('latitude, longitude')
        .eq('user_id', user.id)
        .single();
    const userLocation = userAddr ? { latitude: userAddr.latitude, longitude: userAddr.longitude } : undefined;

    const { data: orgData } = await adminSupabase
        .from('profiles')
        .select(`
            id,
            full_name,
            phone,
            profile_pic,
            facebook_url,
            organization_profiles!inner (
                description,
                donation_method,
                is_verified,
                availability,
                categories_accepted,
                website,
                email,
                tagline,
                urgent_need
            )
        `)
        .eq('role', 'organization')
        .order('full_name', { ascending: true });

    const orgIds = (orgData || []).map((o: any) => o.id);
    const { data: orgAddresses } = orgIds.length > 0
        ? await adminSupabase.from('addresses').select('*').in('user_id', orgIds)
        : { data: null };

    const orgAddressMap: Record<string, any> = {};
    (orgAddresses || []).forEach(addr => {
        orgAddressMap[addr.user_id] = addr;
    });

    let organizations = (orgData || []).map((org: any) => {
        const details = Array.isArray(org.organization_profiles)
            ? org.organization_profiles[0]
            : org.organization_profiles;

        return {
            id: org.id,
            full_name: org.full_name,
            phone: org.phone,
            avatar_url: org.profile_pic,
            description: details?.description,
            donation_method: details?.donation_method,
            is_verified: details?.is_verified,
            availability: details?.availability,
            categories_accepted: details?.categories_accepted,
            facebook_url: org.facebook_url,
            website: details?.website,
            email: userEmails[org.id] || details?.email,
            tagline: details?.tagline,
            urgent_need: details?.urgent_need,
            location: orgAddressMap[org.id]?.country && orgAddressMap[org.id]?.city
                ? `${orgAddressMap[org.id].country}, ${orgAddressMap[org.id].city}`
                : 'Location not set',
            latitude: orgAddressMap[org.id]?.latitude,
            longitude: orgAddressMap[org.id]?.longitude,
        };
    });

    if (category) {
        organizations = organizations.filter(org => {
            const accepted = org.categories_accepted || [];
            return accepted.some((c: string) => c.trim().toLowerCase() === category.trim().toLowerCase());
        });
    }

    if (pref) {
        organizations = organizations.filter(org => {
            const method = org.donation_method?.toLowerCase();
            if (method === 'both') return true;
            return method === pref.toLowerCase();
        });
    }

    return (
        <div className="min-h-screen bg-[#9dbcd4] flex flex-col font-['Inter'] overflow-hidden">
            <main className="flex-1 overflow-hidden">
                <MatchClient organizations={organizations} role={role} userLocation={userLocation} />
            </main>
        </div>
    )
}
