import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import MatchClient from './_components/MatchClient'

export default async function MatchPage({ searchParams }: { searchParams: Promise<{ category?: string, pref?: string }> }) {
    const { category, pref } = await searchParams;
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect('/login');
    }

    const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

    const role = (profile?.role || 'donor') as 'donor' | 'organization';

    const { data: orgData } = await supabase
        .from('profiles')
        .select(`
            id,
            full_name,
            phone,
            profile_pic,
            organization_profiles!inner (
                description,
                donation_method,
                is_verified,
                availability,
                categories_accepted,
                website,
                email,
                tagline
            ),
            addresses (
                city,
                country
            )
        `)
        .eq('role', 'organization')
        .order('full_name', { ascending: true });

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
            website: details?.website,
            email: details?.email,
            tagline: details?.tagline,
            location: org.addresses?.[0]
                ? `${org.addresses[0].city}, ${org.addresses[0].country}`
                : 'Location not set'
        };
    });

    if (category) {
        organizations = organizations.filter(org => (org.categories_accepted || []).some((c: string) => c.toLowerCase() === category.toLowerCase()));
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
                <MatchClient organizations={organizations} role={role} />
            </main>
        </div>
    )
}
