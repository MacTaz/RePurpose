import React from 'react'

interface Props {
    onClose?: () => void;
}

const CharityDonationDashboard = ({ onClose }: Props) => {
    return (
        <div className="w-full max-w-5xl mx-auto bg-[#FFEDE1] border-[6px] border-[#FFB27D] rounded-[2rem] p-10 shadow-sm relative flex flex-col items-center">
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
                <h1 className="text-4xl font-extrabold text-black">Name's Donation Request</h1>
            </div>

            {/* Divider */}
            <div className="w-full h-[6px] bg-black mb-10"></div>

            {/* Top Section */}
            <div className="flex flex-col lg:flex-row w-full gap-8 mb-8">
                {/* Left side: Username and Category */}
                <div className="flex flex-col gap-6 w-full lg:w-1/4">
                    <div className="bg-white rounded-full py-3 px-6 text-center shadow-sm flex items-center justify-center">
                        <span className="font-extrabold text-black text-lg">Joel2x67</span>
                    </div>
                    <div className="bg-white rounded-full py-3 px-6 text-center shadow-sm flex items-center justify-center mt-2">
                        <span className="font-extrabold text-black text-lg">Clothes</span>
                    </div>
                </div>

                {/* Right side: Description */}
                <div className="bg-white rounded-3xl py-8 px-10 flex-1 flex flex-col justify-center text-center shadow-sm h-[140px]">
                    <div className="w-full h-full overflow-y-auto pr-2 custom-scrollbar">
                        <p className="font-extrabold text-black text-lg leading-relaxed">
                            Blablabla blebleble bluhbluhbluhh<br />
                            avawefawdawdawdawdaw<br />
                            This text is slightly longer now to demonstrate<br />
                            how the scrolling will work when there is<br />
                            too much text to fit inside the given space.<br />
                            More text goes here.<br />
                            And more text.<br />
                            And some more.
                        </p>
                    </div>
                </div>
            </div>

            {/* Bottom Section */}
            <div className="flex flex-col lg:flex-row w-full gap-12 mt-4">
                {/* Left side: Image */}
                <div className="w-full lg:w-1/2 aspect-[4/5] rounded-[2rem] overflow-hidden bg-gray-300 shadow-sm">
                    {/* Placeholder image that looks like the plushie photo structure */}
                    <img
                        src="https://images.unsplash.com/photo-1559416525-4c6e9cc05a66?auto=format&fit=crop&q=80&w=800"
                        alt="Donation Image"
                        className="w-full h-full object-cover"
                    />
                </div>

                {/* Right side: Details & Actions */}
                <div className="flex flex-col w-full lg:w-1/2 justify-center space-y-12">
                    <div className="space-y-6 flex flex-col items-center">
                        <div className="w-80 bg-white rounded-full py-3.5 px-6 text-center shadow-sm">
                            <span className="font-extrabold text-black text-lg">Optional Details</span>
                        </div>
                        <div className="w-80 bg-white rounded-full py-3.5 px-6 text-center shadow-sm">
                            <span className="font-extrabold text-black text-lg">Sender Address</span>
                        </div>
                    </div>

                    {/* Delivery Section */}
                    <div className="flex flex-col items-center mt-4">
                        <h3 className="text-center font-extrabold text-black mb-4 text-xl">Mode of Delivery</h3>
                        <div className="flex items-center justify-center bg-[#ffcba4] rounded-full py-3.5 w-80 shadow-sm space-x-6 px-4">
                            <label className="flex items-center space-x-3 font-extrabold text-black cursor-pointer">
                                <span className="w-5 h-5 rounded-full border-[3px] border-black flex items-center justify-center">
                                    <span className="w-2.5 h-2.5 bg-black rounded-full"></span>
                                </span>
                                <span className="text-lg">Pickup</span>
                            </label>
                            <label className="flex items-center space-x-3 font-extrabold text-black cursor-pointer">
                                <span className="w-5 h-5 rounded-full border-[3px] border-black flex items-center justify-center"></span>
                                <span className="text-lg flex flex-col leading-none">
                                    <span>Delivery</span>
                                    <span>Service</span>
                                </span>
                            </label>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex justify-center gap-6 mt-6">
                        <button className="w-40 bg-[#ffcba4] hover:bg-[#ffb380] transition-colors rounded-full py-3 shadow-sm font-extrabold text-black text-xl">
                            Accept
                        </button>
                        <button className="w-40 bg-[#ffcba4] hover:bg-[#ffb380] transition-colors rounded-full py-3 shadow-sm font-extrabold text-black text-xl">
                            Reject
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CharityDonationDashboard;
