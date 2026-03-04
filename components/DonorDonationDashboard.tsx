import React from 'react'

interface Props {
    onClose?: () => void;
}

const DonorDonationDashboard = ({ onClose }: Props) => {
    return (
        <div className="w-full max-w-5xl mx-auto bg-[#DDE6ED] border-[6px] border-[#7BA4D5] rounded-[2rem] p-10 shadow-sm relative flex flex-col items-center">
            {/* Back / Close Button */}
            {onClose && (
                <button
                    onClick={onClose}
                    className="absolute top-8 left-8 font-extrabold text-black hover:opacity-70 text-lg"
                >
                    &larr; Back
                </button>
            )}

            {/* Header */}
            <div className="w-full text-center mt-4 mb-4">
                <h1 className="text-4xl font-extrabold text-black">Donation Form #</h1>
            </div>

            {/* Divider */}
            <div className="w-full h-[6px] bg-black mb-10"></div>

            {/* Top Section */}
            <div className="flex flex-col lg:flex-row w-full gap-8 mb-8">
                {/* Left side: Empty Pills */}
                <div className="flex flex-col gap-6 w-full lg:w-1/4">
                    <div className="bg-white rounded-full py-4 px-6 shadow-sm w-48"></div>
                    <div className="bg-white rounded-full py-4 px-6 shadow-sm w-48 mt-2"></div>
                </div>

                {/* Right side: Description */}
                <div className="bg-white rounded-3xl py-8 px-10 flex-1 flex flex-col justify-center text-center shadow-sm h-[140px]">
                    <div className="w-full h-full overflow-y-auto pr-2 custom-scrollbar">
                        <p className="font-extrabold text-black text-lg leading-relaxed">
                            Blablabla blebleble bluhbluhbluhh<br />
                            avawefawdawdawdawdaw
                        </p>
                    </div>
                </div>
            </div>

            {/* Bottom Section */}
            <div className="flex flex-col lg:flex-row w-full gap-12 mt-4">
                {/* Left side: Image placeholder */}
                <div className="w-full lg:w-1/2 aspect-[4/5] rounded-[2rem] bg-white shadow-sm">
                    {/* Placeholder for the user's actual image */}
                </div>

                {/* Right side: Details & Actions */}
                <div className="flex flex-col w-full lg:w-1/2 justify-center items-center">

                    <div className="space-y-6 flex flex-col items-center flex-grow pt-4">
                        <div className="w-80 bg-white rounded-full py-3.5 px-6 text-center shadow-sm">
                            <span className="font-extrabold text-black text-lg">Other Details</span>
                        </div>
                        <div className="w-80 bg-white rounded-[2rem] py-6 px-6 text-center shadow-sm min-h-[100px] flex items-center justify-center">
                            <span className="font-extrabold text-black text-lg">Address</span>
                        </div>
                    </div>

                    {/* Cancel Button */}
                    <div className="flex justify-center mt-auto pb-4 pt-16">
                        <button
                            onClick={onClose}
                            className="w-40 bg-white hover:bg-gray-100 transition-colors rounded-full py-2 shadow-sm font-extrabold text-black text-xl"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DonorDonationDashboard;
