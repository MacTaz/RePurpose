import React from 'react';
import StatusManagement from './StatusManagement'
import IncomingMatches from './IncomingMatches'
import InventoryManagement from './InventoryManagement'

interface Donation {
    id: string
    donor_id: string
    organization_id: string | null
    type: string
    quantity: number | null
    status: string | null
    created_at: string
    donor_name: string
    description: string | null
    delivery_preference: string | null
    donor_address?: string
    donor_city?: string
    donor_country?: string
    donor_line1?: string
    donor_line2?: string
    donor_zip?: string
}

interface Props {
    orgId: string
    donations: Donation[]
}

const OrgHome = ({ orgId, donations }: Props) => {
    const pendingDonations = donations.filter(d => d.status === 'pending')

    return (
        <main className="flex-1 p-4 sm:p-6 lg:p-10 flex flex-col gap-6 lg:gap-8">
            {/* TOP: Status Management */}
            <div className="border-[6px] border-[#FFB27D] rounded-xl overflow-hidden shadow-sm flex flex-col min-h-[280px] lg:min-h-[300px]">
                <div className="bg-[#FFD1B3] px-4 sm:px-6 py-2 border-b-2 border-[#FFB27D]">
                    <h2 className="text-black text-lg font-extrabold">Status Management</h2>
                </div>
                <div className="flex-1 bg-white p-3 sm:p-5 overflow-auto">
                    <StatusManagement orgId={orgId} />
                </div>
            </div>

            {/* BOTTOM ROW — stacks on mobile, side-by-side on lg+ */}
            <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
                {/* Inventory Needs */}
                <div className="lg:flex-[0.4] border-[6px] border-[#FFB27D] rounded-xl overflow-hidden shadow-sm flex flex-col">
                    <div className="bg-[#FFD1B3] px-4 py-2 border-b-2 border-[#FFB27D]">
                        <h2 className="text-black text-lg font-extrabold">Inventory</h2>
                    </div>
                    <div className="bg-white p-4">
                        <InventoryManagement orgId={orgId} />
                    </div>
                </div>

                {/* Incoming Matches */}
                <div className="lg:flex-1 border-[6px] border-[#FFB27D] rounded-xl overflow-hidden shadow-sm flex flex-col min-h-[300px]">
                    <div className="bg-[#FFD1B3] px-4 sm:px-6 py-2 border-b-2 border-[#FFB27D]">
                        <h2 className="text-black text-lg font-extrabold">Incoming Matches</h2>
                    </div>
                    <div className="flex-1 bg-white overflow-hidden">
                        <IncomingMatches donations={pendingDonations} orgId={orgId} />
                    </div>
                </div>
            </div>
        </main>
    );
};

export default OrgHome;