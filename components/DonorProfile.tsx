"use client"
import React, { useState, useRef } from 'react';

interface DonorProfileProps {
    user: {
        name: string;
        email: string;
        role: string;
        phone?: string;
        facebook?: string;
        instagram?: string;
        website?: string;
        description?: string;
    };
}

const DonorProfile = ({ user }: DonorProfileProps) => {
    const [activeTab, setActiveTab] = useState<'Profile' | 'Address'>('Profile');

    // Profile State
    const [isProfileEditing, setIsProfileEditing] = useState(false);
    const [profileImage, setProfileImage] = useState<string | null>(null);
    const [donorName, setDonorName] = useState(user.name || '');
    const [facebook, setFacebook] = useState(user.facebook || '');
    const [instagram, setInstagram] = useState(user.instagram || '');
    const [website, setWebsite] = useState(user.website || '');
    const [description, setDescription] = useState(user.description || '');
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const imageUrl = URL.createObjectURL(file);
            setProfileImage(imageUrl);
        }
    };

    // Address State
    const [addressForm, setAddressForm] = useState({
        line1: '',
        line2: '',
        city: '',
        country: '',
        zip: ''
    });

    // Switch to view the actual address after confirmation
    const [isAddressConfirmed, setIsAddressConfirmed] = useState(false);

    const handleConfirmAddress = () => {
        setIsAddressConfirmed(true);
    };

    const handleEditAddress = () => {
        setIsAddressConfirmed(false);
    };

    return (
        <div className="w-full max-w-5xl mx-auto min-h-screen py-8 px-4 font-sans">
            {/* Tabs */}
            <div className="flex space-x-8 border-b-2 border-transparent mb-2 pl-4">
                <button
                    onClick={() => setActiveTab('Profile')}
                    className={`text-2xl font-extrabold pb-2 px-2 transition-colors ${activeTab === 'Profile' ? 'border-b-4 border-[#30496E] text-[#30496E]' : 'text-[#30496E]'}`}
                >
                    Profile
                </button>
                <button
                    onClick={() => setActiveTab('Address')}
                    className={`text-2xl font-extrabold pb-2 px-2 transition-colors ${activeTab === 'Address' ? 'border-b-4 border-[#30496E] text-[#30496E]' : 'text-[#30496E]'}`}
                >
                    Address
                </button>
            </div>

            {/* Container */}
            <div className="w-full bg-gradient-to-br from-[#9BBAD0] to-[#80A6C2] rounded-[2rem] p-8 lg:p-12 shadow-2xl shadow-[#9BBAD0]/30 border border-white/20 min-h-[600px] flex flex-col relative overflow-hidden">
                {/* Decorative background circle */}
                <div className="absolute top-[-10%] right-[-5%] w-96 h-96 bg-white/10 rounded-full blur-3xl pointer-events-none"></div>

                {activeTab === 'Profile' ? (
                    <div className="flex flex-col h-full w-full relative z-10">
                        <div className="flex flex-col lg:flex-row w-full gap-12">
                            {/* Left Column */}
                            <div className="flex flex-col lg:w-1/3">
                                {/* Profile Picture */}
                                <div className="ml-4 mb-8 relative w-40 h-40 group">
                                    <div
                                        className={`w-full h-full rounded-full bg-[#DEE6ED] shadow-xl ring-4 ring-white/60 overflow-hidden flex items-center justify-center transition-all duration-300 ${isProfileEditing ? 'cursor-pointer hover:bg-slate-300 hover:ring-white/80 hover:scale-105' : ''}`}
                                        onClick={() => isProfileEditing && fileInputRef.current?.click()}
                                        title={isProfileEditing ? "Click to upload image" : ""}
                                    >
                                        {profileImage ? (
                                            <img src={profileImage} alt="Profile" className="w-full h-full object-cover" />
                                        ) : (
                                            isProfileEditing && <span className="text-[#30496E] text-4xl pb-1">+</span>
                                        )}
                                    </div>
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        className="hidden"
                                        accept="image/*"
                                        onChange={handleImageChange}
                                    />
                                </div>

                                {/* Social Links */}
                                <div className="space-y-5 ml-4 mb-8">
                                    <div className="flex flex-col group/social">
                                        <div className="flex items-center space-x-4 mb-1 cursor-pointer">
                                            <div className="w-10 h-10 rounded-full bg-white/60 backdrop-blur-sm shadow-md flex-shrink-0 flex items-center justify-center text-[#30496E] font-bold transition-all group-hover/social:bg-white/90 group-hover/social:scale-110">F</div>
                                            <span className="text-white font-semibold text-xl tracking-wide group-hover/social:text-white/90 transition-colors">Facebook</span>
                                        </div>
                                        <div className="pl-14 text-white/80 text-lg break-all">
                                            {isProfileEditing ? (
                                                <input
                                                    type="text"
                                                    value={facebook}
                                                    onChange={(e) => setFacebook(e.target.value)}
                                                    placeholder="Username or Link"
                                                    className="w-full bg-white/20 border-b border-white/40 focus:border-white focus:outline-none text-white placeholder-white/50 py-1"
                                                />
                                            ) : (
                                                facebook || 'NA'
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex flex-col group/social">
                                        <div className="flex items-center space-x-4 mb-1 cursor-pointer">
                                            <div className="w-10 h-10 rounded-full bg-white/60 backdrop-blur-sm shadow-md flex-shrink-0 flex items-center justify-center text-[#30496E] font-bold transition-all group-hover/social:bg-white/90 group-hover/social:scale-110">I</div>
                                            <span className="text-white font-semibold text-xl tracking-wide group-hover/social:text-white/90 transition-colors">Instagram</span>
                                        </div>
                                        <div className="pl-14 text-white/80 text-lg break-all">
                                            {isProfileEditing ? (
                                                <input
                                                    type="text"
                                                    value={instagram}
                                                    onChange={(e) => setInstagram(e.target.value)}
                                                    placeholder="Username or Link"
                                                    className="w-full bg-white/20 border-b border-white/40 focus:border-white focus:outline-none text-white placeholder-white/50 py-1"
                                                />
                                            ) : (
                                                instagram || 'NA'
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex flex-col group/social">
                                        <div className="flex items-center space-x-4 mb-1 cursor-pointer">
                                            <div className="w-10 h-10 rounded-full bg-white/60 backdrop-blur-sm shadow-md flex-shrink-0 flex items-center justify-center text-[#30496E] font-bold transition-all group-hover/social:bg-white/90 group-hover/social:scale-110">W</div>
                                            <span className="text-white font-semibold text-xl tracking-wide group-hover/social:text-white/90 transition-colors">Website</span>
                                        </div>
                                        <div className="pl-14 text-white/80 text-lg break-all">
                                            {isProfileEditing ? (
                                                <input
                                                    type="text"
                                                    value={website}
                                                    onChange={(e) => setWebsite(e.target.value)}
                                                    placeholder="Website URL"
                                                    className="w-full bg-white/20 border-b border-white/40 focus:border-white focus:outline-none text-white placeholder-white/50 py-1"
                                                />
                                            ) : (
                                                website || 'NA'
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Right Column */}
                            <div className="flex flex-col lg:w-2/3 space-y-7 lg:pl-10">
                                {!isProfileEditing ? (
                                    <div className="flex flex-col h-full pt-4 animate-in fade-in duration-500">
                                        <div className="space-y-4 text-[#30496E] bg-white/80 backdrop-blur-md p-10 rounded-2xl shadow-xl shadow-black/5 border border-white/50 w-full xl:w-[80%] transition-all hover:bg-white/90">
                                            <p className="text-lg flex items-center"><span className="w-32 font-bold opacity-80 uppercase tracking-wider text-sm">Name</span> <span className="text-2xl font-semibold">{donorName || 'NA'}</span></p>
                                            <p className="text-lg flex items-center"><span className="w-32 font-bold opacity-80 uppercase tracking-wider text-sm">Email</span> <span className="text-xl font-medium">{user.email || 'NA'}</span></p>
                                            <p className="text-lg flex items-center"><span className="w-32 font-bold opacity-80 uppercase tracking-wider text-sm">Phone</span> <span className="text-xl font-medium">{user.phone || 'NA'}</span></p>
                                            <p className="text-lg flex items-center"><span className="w-32 font-bold opacity-80 uppercase tracking-wider text-sm">Role</span> <span className="text-xl capitalize font-medium px-4 py-1 bg-[#9BBAD0]/30 rounded-full text-[#30496E]">{user.role || 'NA'}</span></p>

                                            <div className="mt-6 pt-6 border-t border-[#30496E]/10">
                                                <p className="text-sm font-bold opacity-80 uppercase tracking-wider mb-3">Address</p>
                                                {isAddressConfirmed ? (
                                                    <div className="bg-[#9BBAD0]/20 p-4 rounded-xl">
                                                        <p className="text-lg font-medium">{addressForm.line1 || 'NA'}</p>
                                                        {addressForm.line2 && <p className="text-lg">{addressForm.line2}</p>}
                                                        <p className="text-lg text-[#30496E]/80">{addressForm.city || 'NA'}, {addressForm.country || 'NA'}</p>
                                                        <p className="text-lg text-[#30496E]/80">{addressForm.zip || 'NA'}</p>
                                                    </div>
                                                ) : (
                                                    <p className="text-lg italic text-[#30496E]/50">NA</p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="animate-in fade-in slide-in-from-right-4 duration-500 space-y-6">
                                        <div>
                                            <label className="text-white font-medium text-lg tracking-wide mb-2 block">Full Name</label>
                                            <input type="text" value={donorName} onChange={(e) => setDonorName(e.target.value)} className="w-full lg:w-[450px] h-12 bg-white/80 backdrop-blur-sm border border-white/40 focus:bg-white focus:ring-2 focus:ring-white/80 focus:border-white focus:outline-none rounded-xl px-5 text-slate-800 font-medium transition-all shadow-sm placeholder-slate-400" />
                                        </div>

                                        <div className="flex flex-col lg:flex-row gap-6">
                                            <div className="w-full">
                                                <label className="text-white font-medium text-lg tracking-wide mb-2 block">E-mail</label>
                                                <input type="email" defaultValue={user.email} className="w-full h-12 bg-white/80 backdrop-blur-sm border border-white/40 focus:bg-white focus:ring-2 focus:ring-white/80 focus:border-white focus:outline-none rounded-xl px-5 text-slate-800 font-medium transition-all shadow-sm placeholder-slate-400" />
                                            </div>
                                            <div className="w-full">
                                                <label className="text-white font-medium text-lg tracking-wide mb-2 block">Phone Number</label>
                                                <input type="tel" className="w-full h-12 bg-white/80 backdrop-blur-sm border border-white/40 focus:bg-white focus:ring-2 focus:ring-white/80 focus:border-white focus:outline-none rounded-xl px-5 text-slate-800 font-medium transition-all shadow-sm placeholder-slate-400" />
                                            </div>
                                        </div>

                                        <div className="flex flex-col lg:flex-row gap-6">
                                            <div className="w-full">
                                                <label className="text-white font-medium text-lg tracking-wide mb-2 block">Password</label>
                                                <input type="password" placeholder="••••••••" className="w-full h-12 bg-white/80 backdrop-blur-sm border border-white/40 focus:bg-white focus:ring-2 focus:ring-white/80 focus:border-white focus:outline-none rounded-xl px-5 text-slate-800 font-medium transition-all shadow-sm placeholder-slate-400" />
                                            </div>
                                            <div className="w-full">
                                                <label className="text-white font-medium text-lg tracking-wide mb-2 block">Repeat Password</label>
                                                <input type="password" placeholder="••••••••" className="w-full h-12 bg-white/80 backdrop-blur-sm border border-white/40 focus:bg-white focus:ring-2 focus:ring-white/80 focus:border-white focus:outline-none rounded-xl px-5 text-slate-800 font-medium transition-all shadow-sm placeholder-slate-400" />
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Bottom Row: Description & Confirm */}
                        <div className="flex flex-col lg:flex-row w-full gap-12 mt-8 flex-grow">
                            <div className="flex flex-col w-full lg:w-[60%] justify-end">
                                {isProfileEditing ? (
                                    <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
                                        <label className="text-white font-medium text-lg tracking-wide mb-3 block">Description</label>
                                        <textarea
                                            value={description}
                                            onChange={(e) => setDescription(e.target.value)}
                                            className="w-full min-h-[140px] bg-white/80 backdrop-blur-sm border border-white/40 focus:bg-white focus:ring-2 focus:ring-white/80 focus:border-white focus:outline-none rounded-xl p-5 resize-none text-slate-800 font-medium transition-all shadow-sm"
                                            placeholder="Tell us about yourself..."></textarea>
                                    </div>
                                ) : (
                                    description && (
                                        <div className="animate-in fade-in duration-500 bg-white/80 backdrop-blur-md p-8 rounded-2xl shadow-xl shadow-black/5 border border-white/50 transition-all hover:bg-white/90">
                                            <p className="text-sm font-bold opacity-80 uppercase tracking-wider text-[#30496E] mb-3">Description</p>
                                            <p className="text-lg text-[#30496E] leading-relaxed whitespace-pre-wrap">{description}</p>
                                        </div>
                                    )
                                )}
                            </div>
                            <div className="w-full lg:w-[40%] flex items-end justify-center lg:justify-end pb-4 pt-12 lg:pt-0">
                                {!isProfileEditing ? (
                                    <button
                                        onClick={() => setIsProfileEditing(true)}
                                        className="w-64 bg-white hover:bg-[#f0f4f8] transition-all duration-300 transform hover:-translate-y-1 hover:shadow-xl rounded-full py-3.5 shadow-lg font-bold tracking-wide text-[#30496E] text-xl border border-white/50"
                                    >
                                        Edit Profile
                                    </button>
                                ) : (
                                    <button
                                        onClick={() => setIsProfileEditing(false)}
                                        className="w-64 bg-[#30496E] hover:bg-[#233855] transition-all duration-300 transform hover:-translate-y-1 hover:shadow-xl rounded-full py-3.5 shadow-lg font-medium tracking-wide text-white text-xl"
                                    >
                                        Confirm
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-col lg:flex-row h-full w-full gap-12 relative z-10 animate-in fade-in duration-500">
                        {/* Left Column: Map */}
                        <div className="w-full lg:w-1/2 rounded-2xl overflow-hidden shadow-xl border border-white/50 min-h-[400px] relative">
                            {/* We keep the map behind a frosted glass overlay if the user shouldn't interact, but when editing they can interact (zoom/pan) */}
                            {isAddressConfirmed && <div className="absolute inset-0 z-10 bg-white/10 backdrop-blur-[1px] cursor-not-allowed"></div>}
                            <iframe
                                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d15446.4632824982!2d121.0476839!3d14.5645063!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3397c8f2ba53de75%3A0x6bbaaaa9bb70be10!2sBonifacio%20Global%20City%2C%20Taguig%2C%20Metro%20Manila!5e0!3m2!1sen!2sph!4v1700000000000!5m2!1sen!2sph"
                                width="100%"
                                height="100%"
                                style={{ border: 0 }}
                                allowFullScreen={true}
                                loading="lazy"
                                referrerPolicy="no-referrer-when-downgrade"
                                className="opacity-90 hover:opacity-100 transition-opacity duration-300 absolute inset-0"
                            />
                        </div>

                        {/* Right Column: Address Fields */}
                        <div className="w-full lg:w-1/2 flex flex-col justify-between pt-2">
                            {!isAddressConfirmed ? (
                                <div className="space-y-5 animate-in slide-in-from-right-4 duration-500">
                                    <div>
                                        <label className="text-white font-medium text-lg tracking-wide mb-1.5 block">Address line 1</label>
                                        <input
                                            type="text"
                                            value={addressForm.line1}
                                            onChange={(e) => setAddressForm({ ...addressForm, line1: e.target.value })}
                                            placeholder="e.g. 123 Main Street"
                                            className="w-full h-12 bg-white/80 backdrop-blur-sm border border-white/40 focus:bg-white focus:ring-2 focus:ring-white/80 focus:border-white focus:outline-none rounded-xl px-4 text-slate-800 font-medium transition-all shadow-sm placeholder-slate-400"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-white font-medium text-lg tracking-wide mb-1.5 block">Address line 2</label>
                                        <input
                                            type="text"
                                            value={addressForm.line2}
                                            onChange={(e) => setAddressForm({ ...addressForm, line2: e.target.value })}
                                            placeholder="e.g. Unit 4B, Building Name, Subdivision"
                                            className="w-full h-12 bg-white/80 backdrop-blur-sm border border-white/40 focus:bg-white focus:ring-2 focus:ring-white/80 focus:border-white focus:outline-none rounded-xl px-4 text-slate-800 font-medium transition-all shadow-sm placeholder-slate-400"
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-5">
                                        <div>
                                            <label className="text-white font-medium text-lg tracking-wide mb-1.5 block">City</label>
                                            <input
                                                type="text"
                                                value={addressForm.city}
                                                onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })}
                                                placeholder="e.g. Quezon City"
                                                className="w-full h-12 bg-white/80 backdrop-blur-sm border border-white/40 focus:bg-white focus:ring-2 focus:ring-white/80 focus:border-white focus:outline-none rounded-xl px-4 text-slate-800 font-medium transition-all shadow-sm placeholder-slate-400"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-white font-medium text-lg tracking-wide mb-1.5 block">Country</label>
                                            <input
                                                type="text"
                                                value={addressForm.country}
                                                onChange={(e) => setAddressForm({ ...addressForm, country: e.target.value })}
                                                placeholder="e.g. Philippines"
                                                className="w-full h-12 bg-white/80 backdrop-blur-sm border border-white/40 focus:bg-white focus:ring-2 focus:ring-white/80 focus:border-white focus:outline-none rounded-xl px-4 text-slate-800 font-medium transition-all shadow-sm placeholder-slate-400"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-white font-medium text-lg tracking-wide mb-1.5 block">Zip/Postal Code</label>
                                        <input
                                            type="text"
                                            value={addressForm.zip}
                                            onChange={(e) => setAddressForm({ ...addressForm, zip: e.target.value })}
                                            placeholder="e.g. 1101"
                                            className="w-full h-12 bg-white/80 backdrop-blur-sm border border-white/40 focus:bg-white focus:ring-2 focus:ring-white/80 focus:border-white focus:outline-none rounded-xl px-4 text-slate-800 font-medium transition-all shadow-sm placeholder-slate-400"
                                        />
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-6 mt-4 animate-in fade-in slide-in-from-bottom-2 duration-500">
                                    <div className="bg-white/80 backdrop-blur-md rounded-2xl p-10 shadow-xl border border-white/50 text-[#30496E] h-full transition-all hover:bg-white/90">
                                        <div className="flex items-center space-x-3 mb-6 border-b border-[#30496E]/10 pb-4">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-[#9BBAD0]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                            </svg>
                                            <h3 className="text-2xl font-extrabold tracking-wide">Your Saved Address</h3>
                                        </div>
                                        <div className="space-y-3 text-xl font-medium pt-2 pl-2">
                                            <p className="flex items-center"><span className="w-1.5 h-1.5 rounded-full bg-[#30496E] mr-3"></span>{addressForm.line1}</p>
                                            {addressForm.line2 && <p className="flex items-center"><span className="w-1.5 h-1.5 rounded-full bg-[#30496E] mr-3"></span>{addressForm.line2}</p>}
                                            <p className="flex items-center"><span className="w-1.5 h-1.5 rounded-full bg-[#30496E] mr-3"></span>{addressForm.city}, {addressForm.country}</p>
                                            <p className="flex items-center text-slate-500 text-lg mt-4 pl-4">{addressForm.zip}</p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Confirm/Edit Button */}
                            <div className="flex justify-center mt-12 pb-2">
                                {!isAddressConfirmed ? (
                                    <button
                                        onClick={handleConfirmAddress}
                                        className="w-64 bg-[#30496E] hover:bg-[#233855] transition-all duration-300 transform hover:-translate-y-1 hover:shadow-xl rounded-full py-3.5 shadow-lg font-medium tracking-wide text-white text-xl"
                                    >
                                        Confirm
                                    </button>
                                ) : (
                                    <button
                                        onClick={handleEditAddress}
                                        className="w-64 bg-white hover:bg-[#f0f4f8] transition-all duration-300 transform hover:-translate-y-1 hover:shadow-xl rounded-full py-3.5 shadow-lg font-bold tracking-wide text-[#30496E] text-xl border border-white/50"
                                    >
                                        Edit Address
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div >
    );
};

export default DonorProfile;
