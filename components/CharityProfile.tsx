"use client"
import React, { useState, useRef } from 'react';

interface CharityProfileProps {
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

const CharityProfile = ({ user }: CharityProfileProps) => {
    // 3 Tabs matching the wireframe: Profile, Address, Contact
    const [activeTab, setActiveTab] = useState<'Profile' | 'Address' | 'Contact'>('Profile');

    // Profile State
    const [isProfileEditing, setIsProfileEditing] = useState(false);
    const [profileImage, setProfileImage] = useState<string | null>(null);
    const [orgName, setOrgName] = useState(user.name || '');
    const [facebook, setFacebook] = useState(user.facebook || '');
    const [instagram, setInstagram] = useState(user.instagram || '');
    const [website, setWebsite] = useState(user.website || '');
    const [description, setDescription] = useState(user.description || '');
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Delivery / Pick-up Toggles (Wireframe specifics)
    const [isDelivery, setIsDelivery] = useState(false);
    const [isPickUp, setIsPickUp] = useState(false);

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

    // Contact State (3 people matching wireframe)
    const [contacts, setContacts] = useState([
        { person: '', role: '', phone: '', hours: '' },
        { person: '', role: '', phone: '', hours: '' },
        { person: '', role: '', phone: '', hours: '' }
    ]);
    const [isContactEditing, setIsContactEditing] = useState(false);

    // Switch to view the actual address after confirmation
    const [isAddressConfirmed, setIsAddressConfirmed] = useState(false);

    const handleConfirmAddress = () => setIsAddressConfirmed(true);
    const handleEditAddress = () => setIsAddressConfirmed(false);

    return (
        <div className="w-full max-w-5xl mx-auto min-h-screen py-8 px-4 font-sans">
            {/* Tabs */}
            <div className="flex space-x-8 border-b-2 border-transparent mb-2 pl-4">
                <button
                    onClick={() => setActiveTab('Profile')}
                    className={`text-2xl font-extrabold pb-2 px-2 transition-colors ${activeTab === 'Profile' ? 'border-b-4 border-[#FFB27D] text-[#FFB27D]' : 'text-[#FFB27D]/70 hover:text-[#FFB27D]'}`}
                >
                    Profile
                </button>
                <button
                    onClick={() => setActiveTab('Address')}
                    className={`text-2xl font-extrabold pb-2 px-2 transition-colors ${activeTab === 'Address' ? 'border-b-4 border-[#FFB27D] text-[#FFB27D]' : 'text-[#FFB27D]/70 hover:text-[#FFB27D]'}`}
                >
                    Address
                </button>
                <button
                    onClick={() => setActiveTab('Contact')}
                    className={`text-2xl font-extrabold pb-2 px-2 transition-colors ${activeTab === 'Contact' ? 'border-b-4 border-[#FFB27D] text-[#FFB27D]' : 'text-[#FFB27D]/70 hover:text-[#FFB27D]'}`}
                >
                    Contact
                </button>
            </div>

            {/* Container - Orange/Peach Gradient matching Charity Theme */}
            <div className="w-full bg-gradient-to-br from-[#FFD1B3] to-[#FFB27D] rounded-[2rem] p-8 lg:p-12 shadow-2xl shadow-[#FFB27D]/30 border border-white/20 min-h-[600px] flex flex-col relative overflow-hidden">
                {/* Decorative background circle */}
                <div className="absolute top-[-10%] right-[-5%] w-96 h-96 bg-white/30 rounded-full blur-3xl pointer-events-none"></div>

                {activeTab === 'Profile' && (
                    <div className="flex flex-col h-full w-full relative z-10 animate-in fade-in duration-500">
                        <div className="flex flex-col lg:flex-row w-full gap-12">
                            {/* Left Column (Image & Socials) */}
                            <div className="flex flex-col lg:w-1/3">
                                {/* Profile Picture */}
                                <div className="ml-4 mb-8 relative w-40 h-40 group">
                                    <div
                                        className={`w-full h-full rounded-full bg-[#FFEDE1] shadow-xl ring-4 ring-white/60 overflow-hidden flex items-center justify-center transition-all duration-300 ${isProfileEditing ? 'cursor-pointer hover:bg-white hover:ring-white/80 hover:scale-105' : ''}`}
                                        onClick={() => isProfileEditing && fileInputRef.current?.click()}
                                        title={isProfileEditing ? "Click to upload image" : ""}
                                    >
                                        {profileImage ? (
                                            <img src={profileImage} alt="Profile" className="w-full h-full object-cover" />
                                        ) : (
                                            isProfileEditing && <span className="text-[#5A2C10] text-4xl pb-1">+</span>
                                        )}
                                    </div>
                                    <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageChange} />
                                </div>

                                {/* Social Links */}
                                <div className="space-y-5 ml-4 mb-8">
                                    <div className="flex flex-col group/social">
                                        <div className="flex items-center space-x-4 mb-1 cursor-pointer">
                                            <div className="w-10 h-10 rounded-full bg-white/60 backdrop-blur-sm shadow-md flex-shrink-0 flex items-center justify-center text-[#5A2C10] font-bold transition-all group-hover/social:bg-white/90 group-hover/social:scale-110">F</div>
                                            <span className="text-white font-semibold text-xl tracking-wide group-hover/social:text-white/90 transition-colors">Facebook</span>
                                        </div>
                                        <div className="pl-14 text-white/90 text-lg break-all">
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
                                            <div className="w-10 h-10 rounded-full bg-white/60 backdrop-blur-sm shadow-md flex-shrink-0 flex items-center justify-center text-[#5A2C10] font-bold transition-all group-hover/social:bg-white/90 group-hover/social:scale-110">I</div>
                                            <span className="text-white font-semibold text-xl tracking-wide group-hover/social:text-white/90 transition-colors">Instagram</span>
                                        </div>
                                        <div className="pl-14 text-white/90 text-lg break-all">
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
                                            <div className="w-10 h-10 rounded-full bg-white/60 backdrop-blur-sm shadow-md flex-shrink-0 flex items-center justify-center text-[#5A2C10] font-bold transition-all group-hover/social:bg-white/90 group-hover/social:scale-110">W</div>
                                            <span className="text-white font-semibold text-xl tracking-wide group-hover/social:text-white/90 transition-colors">Website</span>
                                        </div>
                                        <div className="pl-14 text-white/90 text-lg break-all">
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

                            {/* Center/Right Column (Info & Toggles) */}
                            <div className="flex flex-col lg:w-2/3 space-y-7 lg:pl-10">
                                {!isProfileEditing ? (
                                    <div className="flex flex-col h-full pt-4 animate-in fade-in duration-500">
                                        <div className="space-y-4 text-[#5A2C10] bg-white/50 backdrop-blur-md p-10 rounded-2xl shadow-xl shadow-black/5 border border-white/60 w-full transition-all hover:bg-white/60">
                                            <p className="text-lg flex items-center"><span className="w-36 font-bold opacity-80 uppercase tracking-wider text-sm">Org Name</span> <span className="text-2xl font-semibold">{orgName || 'NA'}</span></p>
                                            <p className="text-lg flex items-center"><span className="w-36 font-bold opacity-80 uppercase tracking-wider text-sm">Email</span> <span className="text-xl font-medium">{user.email || 'NA'}</span></p>

                                            <div className="text-lg flex items-start pt-1">
                                                <span className="w-36 font-bold opacity-80 uppercase tracking-wider text-sm mt-1 shrink-0">Address</span>
                                                <span className="text-xl font-medium">
                                                    {[addressForm.line1, addressForm.line2, addressForm.city, addressForm.country, addressForm.zip].filter(Boolean).join(', ') || 'NA'}
                                                </span>
                                            </div>

                                            {/* Read-Only Toggles */}
                                            <div className="mt-8 pt-6 border-t border-[#5A2C10]/10 flex gap-12">
                                                <div className="flex items-center space-x-4">
                                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${isDelivery ? 'bg-[#FF944D] text-white shadow-md' : 'bg-white/50'}`}>
                                                        {isDelivery && '✓'}
                                                    </div>
                                                    <span className="font-bold uppercase tracking-wider text-sm opacity-80">Delivery</span>
                                                </div>
                                                <div className="flex items-center space-x-4">
                                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${isPickUp ? 'bg-[#FF944D] text-white shadow-md' : 'bg-white/50'}`}>
                                                        {isPickUp && '✓'}
                                                    </div>
                                                    <span className="font-bold uppercase tracking-wider text-sm opacity-80">Pick-Up</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex flex-col h-full space-y-6 animate-in slide-in-from-right-4 duration-500">
                                        <div className="space-y-5 bg-white/40 backdrop-blur-md p-8 rounded-2xl shadow-lg border border-white/50">
                                            <div>
                                                <label className="text-[#5A2C10] font-bold tracking-wide mb-1.5 block">Organization Name</label>
                                                <input type="text" value={orgName} onChange={(e) => setOrgName(e.target.value)} className="w-full h-12 bg-white/80 backdrop-blur-sm border border-white/60 focus:bg-white focus:ring-2 focus:ring-white/80 focus:border-white focus:outline-none rounded-xl px-4 text-[#5A2C10] font-medium transition-all shadow-sm" />
                                            </div>
                                            <div>
                                                <label className="text-[#5A2C10] font-bold tracking-wide mb-1.5 block">Email</label>
                                                <input type="email" defaultValue={user.email} className="w-full h-12 bg-white/80 backdrop-blur-sm border border-white/60 focus:bg-white focus:ring-2 focus:ring-white/80 focus:border-white focus:outline-none rounded-xl px-4 text-[#5A2C10] font-medium transition-all shadow-sm" />
                                            </div>

                                            {/* Edit Toggles */}
                                            <div className="mt-6 flex gap-12 pt-4">
                                                <label className="flex items-center space-x-4 cursor-pointer group">
                                                    <div className={`w-10 h-10 rounded-full border-2 border-white flex items-center justify-center transition-all group-hover:scale-105 ${isDelivery ? 'bg-[#FF944D]' : 'bg-white/50'}`} onClick={() => setIsDelivery(!isDelivery)}>
                                                        {isDelivery && <span className="text-white font-bold">✓</span>}
                                                    </div>
                                                    <span className="text-[#5A2C10] font-bold tracking-wide">Delivery</span>
                                                </label>
                                                <label className="flex items-center space-x-4 cursor-pointer group">
                                                    <div className={`w-10 h-10 rounded-full border-2 border-white flex items-center justify-center transition-all group-hover:scale-105 ${isPickUp ? 'bg-[#FF944D]' : 'bg-white/50'}`} onClick={() => setIsPickUp(!isPickUp)}>
                                                        {isPickUp && <span className="text-white font-bold">✓</span>}
                                                    </div>
                                                    <span className="text-[#5A2C10] font-bold tracking-wide">Pick-Up</span>
                                                </label>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Contact Persons Read-Only Display */}
                        <div className="w-full mt-8 animate-in fade-in duration-500">
                            <p className="text-sm font-bold opacity-80 uppercase tracking-wider text-[#5A2C10] mb-3 ml-2">Contact Persons</p>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {contacts.map((contact, index) => (
                                    <div key={index} className="bg-white/50 backdrop-blur-md p-6 rounded-2xl shadow-xl shadow-black/5 border border-white/60 transition-all hover:bg-white/60">
                                        <p className="text-xl font-bold text-[#5A2C10] mb-1">{contact.person || '...'}</p>
                                        <p className="text-sm font-bold opacity-70 uppercase tracking-wider text-[#5A2C10] mb-4">{contact.role || '...'}</p>
                                        <div className="space-y-2">
                                            <p className="text-base font-medium text-[#5A2C10] flex items-start"><span className="opacity-70 w-16 shrink-0">Phone:</span> <span className="break-words">{contact.phone || '...'}</span></p>
                                            <p className="text-base font-medium text-[#5A2C10] flex items-start"><span className="opacity-70 w-16 shrink-0">Hours:</span> <span className="break-words">{contact.hours || '...'}</span></p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Bottom Row: Description & Confirm */}
                        <div className="flex flex-col lg:flex-row w-full gap-12 mt-8 flex-grow">
                            <div className="flex flex-col w-full lg:w-[60%] justify-end">
                                {isProfileEditing ? (
                                    <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
                                        <label className="text-white font-medium text-lg tracking-wide mb-3 block">Organization Description</label>
                                        <textarea
                                            value={description}
                                            onChange={(e) => setDescription(e.target.value)}
                                            className="w-full min-h-[140px] bg-white/60 backdrop-blur-sm border border-white/60 focus:bg-white focus:ring-2 focus:ring-white/80 focus:border-white focus:outline-none rounded-xl p-5 resize-none text-[#5A2C10] font-medium transition-all shadow-sm"
                                            placeholder="Tell us about your organization..."></textarea>
                                    </div>
                                ) : (
                                    description && (
                                        <div className="animate-in fade-in duration-500 bg-white/50 backdrop-blur-md p-8 rounded-2xl shadow-xl shadow-black/5 border border-white/60 transition-all hover:bg-white/60">
                                            <p className="text-sm font-bold opacity-80 uppercase tracking-wider text-[#5A2C10] mb-3">Organization Description</p>
                                            <p className="text-lg text-[#5A2C10] leading-relaxed whitespace-pre-wrap">{description}</p>
                                        </div>
                                    )
                                )}
                            </div>
                            <div className="w-full lg:w-[40%] flex items-end justify-center lg:justify-end pb-4 pt-12 lg:pt-0">
                                {isProfileEditing ? (
                                    <button
                                        onClick={() => setIsProfileEditing(false)}
                                        className="bg-[#FF944D] hover:bg-[#E87A30] text-white font-bold text-xl py-4 px-16 rounded-full shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 w-full lg:w-auto"
                                    >
                                        Confirm
                                    </button>
                                ) : (
                                    <button
                                        onClick={() => setIsProfileEditing(true)}
                                        className="bg-white/40 hover:bg-white/60 backdrop-blur-md border border-white/60 text-[#5A2C10] font-bold text-xl py-4 px-16 rounded-full shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 w-full lg:w-auto"
                                    >
                                        Edit Profile
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'Address' && (
                    <div className="flex flex-col h-full w-full relative z-10 animate-in fade-in duration-500">
                        {/* Map & Address Columns identically styled to Donor but painted Orange/Peach */}
                        <div className="flex flex-col lg:flex-row h-full w-full gap-12">
                            {/* Left Column: Map */}
                            <div className="w-full lg:w-1/2 rounded-3xl overflow-hidden shadow-xl border border-white/60 min-h-[400px] relative bg-white/30 backdrop-blur-sm">
                                {isAddressConfirmed && <div className="absolute inset-0 z-10 bg-white/20 backdrop-blur-[2px] cursor-not-allowed transition-all duration-300"></div>}
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

                            {/* Right Column: Fields */}
                            <div className="w-full lg:w-1/2 flex flex-col justify-between">
                                {!isAddressConfirmed ? (
                                    <div className="space-y-5 animate-in slide-in-from-right-4 duration-500 bg-white/40 backdrop-blur-md p-8 rounded-3xl shadow-lg border border-white/60">
                                        <div>
                                            <label className="text-[#5A2C10] font-bold text-lg tracking-wide mb-1.5 block">Address line 1</label>
                                            <input
                                                type="text"
                                                value={addressForm.line1}
                                                onChange={(e) => setAddressForm({ ...addressForm, line1: e.target.value })}
                                                placeholder="e.g. 123 Main Street"
                                                className="w-full h-12 bg-white/80 backdrop-blur-sm border border-white/60 focus:bg-white focus:ring-2 focus:ring-[#FF944D]/50 focus:border-white focus:outline-none rounded-xl px-4 text-[#5A2C10] font-medium transition-all shadow-sm placeholder-[#5A2C10]/40"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-[#5A2C10] font-bold text-lg tracking-wide mb-1.5 block">Address line 2</label>
                                            <input
                                                type="text"
                                                value={addressForm.line2}
                                                onChange={(e) => setAddressForm({ ...addressForm, line2: e.target.value })}
                                                placeholder="e.g. Unit 4B, Building Name, Subdivision"
                                                className="w-full h-12 bg-white/80 backdrop-blur-sm border border-white/60 focus:bg-white focus:ring-2 focus:ring-[#FF944D]/50 focus:border-white focus:outline-none rounded-xl px-4 text-[#5A2C10] font-medium transition-all shadow-sm placeholder-[#5A2C10]/40"
                                            />
                                        </div>
                                        <div className="grid grid-cols-2 gap-5">
                                            <div>
                                                <label className="text-[#5A2C10] font-bold text-lg tracking-wide mb-1.5 block">City</label>
                                                <input
                                                    type="text"
                                                    value={addressForm.city}
                                                    onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })}
                                                    placeholder="e.g. Quezon City"
                                                    className="w-full h-12 bg-white/80 backdrop-blur-sm border border-white/60 focus:bg-white focus:ring-2 focus:ring-[#FF944D]/50 focus:border-white focus:outline-none rounded-xl px-4 text-[#5A2C10] font-medium transition-all shadow-sm placeholder-[#5A2C10]/40"
                                                />
                                            </div>
                                            <div>
                                                <label className="text-[#5A2C10] font-bold text-lg tracking-wide mb-1.5 block">Country</label>
                                                <input
                                                    type="text"
                                                    value={addressForm.country}
                                                    onChange={(e) => setAddressForm({ ...addressForm, country: e.target.value })}
                                                    placeholder="e.g. Philippines"
                                                    className="w-full h-12 bg-white/80 backdrop-blur-sm border border-white/60 focus:bg-white focus:ring-2 focus:ring-[#FF944D]/50 focus:border-white focus:outline-none rounded-xl px-4 text-[#5A2C10] font-medium transition-all shadow-sm placeholder-[#5A2C10]/40"
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="text-[#5A2C10] font-bold text-lg tracking-wide mb-1.5 block">Zip/Postal Code</label>
                                            <input
                                                type="text"
                                                value={addressForm.zip}
                                                onChange={(e) => setAddressForm({ ...addressForm, zip: e.target.value })}
                                                placeholder="e.g. 1101"
                                                className="w-full h-12 bg-white/80 backdrop-blur-sm border border-white/60 focus:bg-white focus:ring-2 focus:ring-[#FF944D]/50 focus:border-white focus:outline-none rounded-xl px-4 text-[#5A2C10] font-medium transition-all shadow-sm placeholder-[#5A2C10]/40"
                                            />
                                        </div>
                                    </div>
                                ) : (
                                    <div className="bg-white/50 backdrop-blur-md p-10 rounded-3xl shadow-xl shadow-black/5 border border-white/60 animate-in fade-in duration-500 h-full transition-all hover:bg-white/60">
                                        <div className="space-y-6 text-[#5A2C10]">
                                            <div>
                                                <p className="text-sm font-bold opacity-80 uppercase tracking-wider mb-2">Address Line 1</p>
                                                <p className="text-2xl font-semibold border-b border-[#5A2C10]/10 pb-2">{addressForm.line1 || '...'}</p>
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold opacity-80 uppercase tracking-wider mb-2">Address Line 2</p>
                                                <p className="text-xl font-medium border-b border-[#5A2C10]/10 pb-2">{addressForm.line2 || '...'}</p>
                                            </div>
                                            <div className="grid grid-cols-2 gap-8">
                                                <div>
                                                    <p className="text-sm font-bold opacity-80 uppercase tracking-wider mb-2">City</p>
                                                    <p className="text-xl font-medium border-b border-[#5A2C10]/10 pb-2">{addressForm.city || '...'}</p>
                                                </div>
                                                <div>
                                                    <p className="text-sm font-bold opacity-80 uppercase tracking-wider mb-2">Country</p>
                                                    <p className="text-xl font-medium border-b border-[#5A2C10]/10 pb-2">{addressForm.country || '...'}</p>
                                                </div>
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold opacity-80 uppercase tracking-wider mb-2">Zip Code</p>
                                                <p className="text-xl font-medium">{addressForm.zip || '...'}</p>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                <div className="mt-8 flex justify-center lg:justify-end">
                                    {!isAddressConfirmed ? (
                                        <button
                                            onClick={handleConfirmAddress}
                                            className="bg-[#FF944D] hover:bg-[#E87A30] text-white font-bold text-xl py-4 px-16 rounded-full shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 w-full lg:w-auto"
                                        >
                                            Confirm
                                        </button>
                                    ) : (
                                        <button
                                            onClick={handleEditAddress}
                                            className="bg-white/40 hover:bg-white/60 backdrop-blur-md border border-white/60 text-[#5A2C10] font-bold text-xl py-4 px-16 rounded-full shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 w-full lg:w-auto"
                                        >
                                            Edit Address
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'Contact' && (
                    <div className="flex flex-col h-full w-full relative z-10 animate-in fade-in duration-500">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full mb-12">
                            {contacts.map((contact, index) => (
                                <div key={index} className="flex flex-col space-y-5 bg-white/40 backdrop-blur-md p-8 rounded-3xl shadow-lg border border-white/60 transition-all hover:bg-white/50">
                                    <h3 className="text-xl font-extrabold text-[#5A2C10] mb-4 border-b border-white/50 pb-2">Contact {index + 1}</h3>

                                    {!isContactEditing ? (
                                        <div className="space-y-6 text-[#5A2C10]">
                                            <div>
                                                <p className="text-sm font-bold opacity-80 uppercase tracking-wider mb-1">Contact Person</p>
                                                <p className="text-lg font-semibold">{contact.person || '...'}</p>
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold opacity-80 uppercase tracking-wider mb-1">Role</p>
                                                <p className="text-lg font-medium">{contact.role || '...'}</p>
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold opacity-80 uppercase tracking-wider mb-1">Phone Number</p>
                                                <p className="text-lg font-medium">{contact.phone || '...'}</p>
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold opacity-80 uppercase tracking-wider mb-1">Operating Hours</p>
                                                <p className="text-lg font-medium">{contact.hours || '...'}</p>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="space-y-4">
                                            <div>
                                                <label className="text-[#5A2C10] font-bold tracking-wide mb-1.5 block text-sm">Contact Person</label>
                                                <input
                                                    type="text"
                                                    value={contact.person}
                                                    onChange={(e) => {
                                                        const newContacts = [...contacts];
                                                        newContacts[index].person = e.target.value;
                                                        setContacts(newContacts);
                                                    }}
                                                    className="w-full h-10 bg-white/80 backdrop-blur-sm border border-white/60 focus:bg-white focus:ring-2 focus:ring-[#FF944D]/50 focus:border-white focus:outline-none rounded-xl px-3 text-[#5A2C10] font-medium transition-all shadow-sm"
                                                />
                                            </div>
                                            <div>
                                                <label className="text-[#5A2C10] font-bold tracking-wide mb-1.5 block text-sm">Role</label>
                                                <input
                                                    type="text"
                                                    value={contact.role}
                                                    onChange={(e) => {
                                                        const newContacts = [...contacts];
                                                        newContacts[index].role = e.target.value;
                                                        setContacts(newContacts);
                                                    }}
                                                    className="w-full h-10 bg-white/80 backdrop-blur-sm border border-white/60 focus:bg-white focus:ring-2 focus:ring-[#FF944D]/50 focus:border-white focus:outline-none rounded-xl px-3 text-[#5A2C10] font-medium transition-all shadow-sm"
                                                />
                                            </div>
                                            <div>
                                                <label className="text-[#5A2C10] font-bold tracking-wide mb-1.5 block text-sm">Phone Number</label>
                                                <input
                                                    type="text"
                                                    value={contact.phone}
                                                    onChange={(e) => {
                                                        const newContacts = [...contacts];
                                                        newContacts[index].phone = e.target.value;
                                                        setContacts(newContacts);
                                                    }}
                                                    className="w-full h-10 bg-white/80 backdrop-blur-sm border border-white/60 focus:bg-white focus:ring-2 focus:ring-[#FF944D]/50 focus:border-white focus:outline-none rounded-xl px-3 text-[#5A2C10] font-medium transition-all shadow-sm"
                                                />
                                            </div>
                                            <div>
                                                <label className="text-[#5A2C10] font-bold tracking-wide mb-1.5 block text-sm">Operating Hours</label>
                                                <input
                                                    type="text"
                                                    value={contact.hours}
                                                    onChange={(e) => {
                                                        const newContacts = [...contacts];
                                                        newContacts[index].hours = e.target.value;
                                                        setContacts(newContacts);
                                                    }}
                                                    className="w-full h-10 bg-white/80 backdrop-blur-sm border border-white/60 focus:bg-white focus:ring-2 focus:ring-[#FF944D]/50 focus:border-white focus:outline-none rounded-xl px-3 text-[#5A2C10] font-medium transition-all shadow-sm"
                                                />
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>

                        <div className="flex justify-center mt-auto">
                            {!isContactEditing ? (
                                <button
                                    onClick={() => setIsContactEditing(true)}
                                    className="bg-white/40 hover:bg-white/60 backdrop-blur-md border border-white/60 text-[#5A2C10] font-bold text-xl py-4 px-16 rounded-full shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 w-full md:w-auto"
                                >
                                    Edit Contacts
                                </button>
                            ) : (
                                <button
                                    onClick={() => setIsContactEditing(false)}
                                    className="bg-[#FF944D] hover:bg-[#E87A30] text-white font-bold text-xl py-4 px-16 rounded-full shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 w-full md:w-auto"
                                >
                                    Confirm
                                </button>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CharityProfile;
