import React from 'react';

const DonorHome = () => {
    return (
        <main className="flex-1 p-10 flex gap-8">
            {/* LEFT: Disaster Watch */}
            <div className="flex-[1.2] flex flex-col border-[6px] border-[#7BA4D5] rounded-xl overflow-hidden shadow-sm">
                <div className="bg-[#7BA4D5] px-6 py-3">
                    <h2 className="text-white text-xl font-bold">Disaster Watch</h2>
                </div>
                <div className="flex-1 bg-white p-4 flex gap-4">
                    <div className="flex-[3] bg-[#DDE6ED] rounded-lg"></div>
                    <div className="flex-1 flex flex-col gap-4">
                        {[1, 2, 3, 4, 5].map((i) => (
                            <div key={i} className="flex-1 bg-[#DDE6ED] rounded-lg"></div>
                        ))}
                    </div>
                </div>
            </div>

            {/* RIGHT: Discover & Recent */}
            <div className="flex-1 flex flex-col gap-8">
                {/* Top: Discover Charities */}
                <div className="flex-[0.6] border-[6px] border-[#7BA4D5] rounded-xl overflow-hidden shadow-sm flex flex-col">
                    <div className="bg-[#7BA4D5] px-6 py-3">
                        <h2 className="text-white text-xl font-bold">Discover Charities</h2>
                    </div>
                    <div className="flex-1 bg-white p-6 flex flex-col gap-4">
                        <div className="bg-[#DDE6ED] h-8 rounded-md w-full"></div>
                        <div className="bg-[#DDE6ED] h-8 rounded-md w-full"></div>
                    </div>
                </div>

                {/* Bottom: Recent Donations */}
                <div className="flex-1 border-[6px] border-[#7BA4D5] rounded-xl overflow-hidden shadow-sm flex flex-col">
                    <div className="bg-[#7BA4D5] px-6 py-3">
                        <h2 className="text-white text-xl font-bold">Recent Donations</h2>
                    </div>
                    <div className="flex-1 bg-white p-4">
                        <div className="bg-[#DDE6ED] w-full h-full rounded-lg"></div>
                    </div>
                </div>
            </div>
        </main>
    );
};

export default DonorHome;
