import React, { useState } from 'react'

interface Props {
    onClose?: () => void;
}

const DonationStatus = ({ onClose }: Props) => {
    // We can use a dropdown state if needed, though the UI shows the box out in the open.
    // I'll build it as shown in the screenshot, like it's an open dropdown box.
    const [status, setStatus] = useState<string>("Pending");
    const [isOpen, setIsOpen] = useState<boolean>(false);

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

                {/* Right side: Details & Status Actions */}
                <div className="flex flex-col w-full lg:w-1/2 justify-center items-center">

                    {/* Mode of Delivery Readonly */}
                    <div className="w-80 bg-white rounded-full py-3 px-6 text-center shadow-sm mb-6">
                        <span className="font-extrabold text-black text-lg">Mode of Delivery</span>
                    </div>
                    <div className="mb-14">
                        <span className="font-extrabold text-black text-xl">Pickup</span>
                    </div>

                    {/* Donation Status Header / Dropdown Toggle */}
                    <button
                        onClick={() => setIsOpen(!isOpen)}
                        className="w-80 bg-white rounded-full py-3 px-6 text-center shadow-sm z-20 relative cursor-pointer hover:bg-gray-50 flex items-center justify-center transition-colors mb-4"
                    >
                        <span className="font-extrabold text-black text-lg">Donation Status: {status}</span>
                        <div className={`absolute right-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}>
                            <svg className="w-6 h-6 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                            </svg>
                        </div>
                    </button>

                    {/* Status Dropdown Box */}
                    {isOpen && (
                        <div className="bg-white rounded-xl shadow-md w-80 p-6 flex flex-col gap-4 relative -mt-8 pt-8 z-10 animate-in fade-in slide-in-from-top-4 duration-200">
                            <button
                                onClick={() => {
                                    setStatus("Pending");
                                    setIsOpen(false);
                                }}
                                className={`w-full ${status === 'Pending' ? 'bg-[#FFD1B3]' : 'bg-[#FFEDE1]'} hover:bg-[#FFD1B3] transition-colors rounded-full py-2.5 font-extrabold text-black text-lg shadow-sm`}
                            >
                                Pending
                            </button>
                            <button
                                onClick={() => {
                                    setStatus("In transit");
                                    setIsOpen(false);
                                }}
                                className={`w-full ${status === 'In transit' ? 'bg-[#FFD1B3]' : 'bg-[#FFEDE1]'} hover:bg-[#FFD1B3] transition-colors rounded-full py-2.5 font-extrabold text-black text-lg shadow-sm`}
                            >
                                In transit
                            </button>
                            <button
                                onClick={() => {
                                    setStatus("Received");
                                    setIsOpen(false);
                                }}
                                className={`w-full ${status === 'Received' ? 'bg-[#FFD1B3]' : 'bg-[#FFEDE1]'} hover:bg-[#FFD1B3] transition-colors rounded-full py-2.5 font-extrabold text-black text-lg shadow-sm`}
                            >
                                Received
                            </button>
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
};

export default DonationStatus;
