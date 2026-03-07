import React from 'react';
import DisasterWatchClient from '../DisasterWatchClient'
import DiscoverCharitiesClient from '../DiscoverCharitiesClient'
import RecentDonationsClient from '../RecentDonationsClient'

interface Donation {
    id: string
    type: string
    created_at: string
    quantity?: number | null
}

interface Props {
    donations: Donation[]
}

const DonorHome = ({ donations }: Props) => {
    return (
        <main className="flex-1 p-4 md:p-10 flex flex-col md:flex-row gap-6 md:gap-8 overflow-x-hidden">
            {/* LEFT: Disaster Watch */}
            <DisasterWatchClient />

            {/* RIGHT: Discover & Recent */}
            <div className="flex-1 flex flex-col gap-8">
                <DiscoverCharitiesClient />
                <RecentDonationsClient donations={donations} />
            </div>
        </main>
    );
};

export default DonorHome;