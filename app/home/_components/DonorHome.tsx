'use client';

import React, { useState } from 'react';
import DonorDonationDashboard from '@/components/DonorDonationDashboard';
import DisasterWatchClient from '../DisasterWatchClient'
import DiscoverCharitiesClient from '../DiscoverCharitiesClient'
import RecentDonationsClient from '../RecentDonationsClient'

interface Donation {
    id: string
    type: string
    created_at: string
    quantity?: number | null
    [key: string]: any // Allows any other additional fields passed through mappedDonations
}

interface Props {
    donations: Donation[]
}

const DonorHome = ({ donations }: Props) => {
    const [selectedDonation, setSelectedDonation] = useState<Donation | null>(null);

    if (selectedDonation) {
        return (
            <main className="flex-1 w-full py-8 px-4 flex justify-center animate-in fade-in zoom-in-95 duration-500 overflow-x-hidden">
                <DonorDonationDashboard donation={selectedDonation} onClose={() => setSelectedDonation(null)} />
            </main>
        );
    }

    return (
        <main className="flex-1 p-4 md:p-10 flex flex-col md:flex-row gap-6 md:gap-8 overflow-x-hidden">
            {/* LEFT: Disaster Watch */}
            <DisasterWatchClient />

            {/* RIGHT: Discover & Recent */}
            <div className="flex-1 flex flex-col gap-8">
                <DiscoverCharitiesClient />
                <RecentDonationsClient donations={donations} onSelect={setSelectedDonation} />
            </div>
        </main>
    );
};

export default DonorHome;