"use client"
import React, { useState, useRef } from 'react';
import AddressMap from '@/components/AddressMap'

interface DonorProfileProps {
    userId: string;
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

const DonorProfile = ({ user, userId }: DonorProfileProps) => {
    const [activeTab, setActiveTab] = useState<'Profile' | 'Address'>('Profile');

    // Profile State
    const [isProfileEditing, setIsProfileEditing] = useState(false);
    const [profileImage, setProfileImage] = useState<string | null>(null);
    const [donorName, setDonorName] = useState(user.name || '');
    const [facebook, setFacebook] = useState(user.facebook || '');
    const [facebookError, setFacebookError] = useState('');

    const validateFacebook = (value: string) => {
        if (!value) { setFacebookError(''); return; }
        const fbRegex = /^https?:\/\/(www\.|m\.)?facebook\.com\/[a-zA-Z0-9(.\-_]{1,}/i;
        if (!fbRegex.test(value)) {
            setFacebookError('Please enter a valid Facebook URL (e.g. https://facebook.com/username)');
        } else {
            setFacebookError('');
        }
    };
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
            <div className="w-full bg-gradient-to-br from-[#9BBAD0] to-[#80A6C2] rounded-[2rem] p-8 lg:p-12 shadow-2xl shadow-[#9BBAD0]/30 border border-white/20 flex flex-col relative overflow-visible">
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
                                                <div className="flex flex-col gap-1">
                                                    <input
                                                        type="text"
                                                        value={facebook}
                                                        onChange={(e) => { setFacebook(e.target.value); validateFacebook(e.target.value); }}
                                                        onBlur={(e) => validateFacebook(e.target.value)}
                                                        placeholder="https://facebook.com/username"
                                                        className={`w-full bg-white/20 border-b focus:outline-none text-white placeholder-white/50 py-1 ${facebookError ? 'border-red-400' : 'border-white/40 focus:border-white'}`}
                                                    />
                                                    {facebookError && <p className="text-red-300 text-xs font-semibold mt-0.5">{facebookError}</p>}
                                                </div>
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
                                        onClick={() => { if (!facebookError) setIsProfileEditing(false); }}
                                        disabled={!!facebookError}
                                        className="w-64 bg-[#30496E] hover:bg-[#233855] transition-all duration-300 transform hover:-translate-y-1 hover:shadow-xl rounded-full py-3.5 shadow-lg font-medium tracking-wide text-white text-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                                    >
                                        Confirm
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                ) : (
                    <AddressMap userId={userId} />
                )}
            </div>
        </div >
    );
};

export default DonorProfile;
