import React from 'react';

const OrgHome = () => {
    return (
        <main className="flex-1 p-10 flex flex-col gap-8">
            {/* TOP: Status Management */}
            <div className="flex-[0.8] border-[6px] border-[#FFB27D] rounded-xl overflow-hidden shadow-sm flex flex-col">
                <div className="bg-[#FFD1B3] px-6 py-2 border-b-2 border-[#FFB27D]">
                    <h2 className="text-black text-lg font-extrabold">Status Management</h2>
                </div>
                <div className="flex-1 bg-white p-5 flex flex-col gap-4">
                    <div className="flex-1 bg-[#FFEDE1] rounded-lg"></div>
                    <div className="flex-1 bg-[#FFEDE1] rounded-lg"></div>
                    <div className="flex-1 bg-[#FFEDE1] rounded-lg"></div>
                </div>
            </div>

            {/* BOTTOM ROW */}
            <div className="flex-[1.2] flex gap-8">
                {/* Inventory Needs */}
                <div className="flex-[0.4] border-[6px] border-[#FFB27D] rounded-xl overflow-hidden shadow-sm flex flex-col">
                    <div className="bg-[#FFD1B3] px-4 py-2 border-b-2 border-[#FFB27D]">
                        <h2 className="text-black text-lg font-extrabold">Inventory Needs</h2>
                    </div>
                    <div className="flex-1 bg-white p-4 flex flex-col gap-3">
                        <div className="bg-[#FFEDE1] h-12 rounded-lg"></div>
                        <div className="bg-[#FFEDE1] h-12 rounded-lg"></div>
                        <div className="bg-[#FFEDE1] h-12 rounded-lg"></div>
                    </div>
                </div>

                {/* Incoming Matches */}
                <div className="flex-1 border-[6px] border-[#FFB27D] rounded-xl overflow-hidden shadow-sm flex flex-col">
                    <div className="bg-[#FFD1B3] px-6 py-2 border-b-2 border-[#FFB27D]">
                        <h2 className="text-black text-lg font-extrabold">Incoming Matches</h2>
                    </div>
                    <div className="flex-1 bg-white p-4">
                        <div className="bg-[#FFEDE1] w-full h-full rounded-lg"></div>
                    </div>
                </div>
            </div>
        </main>
    );
};

export default OrgHome;
