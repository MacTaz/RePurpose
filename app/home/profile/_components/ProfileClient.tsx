'use client';

import React, { useState, useRef, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import {
    User, Mail, Phone, MapPin, Globe, Facebook, Instagram,
    Camera, CheckCircle2, AlertCircle, Save, X, Edit3,
    Truck, Package, Info, Clock, Tag
} from 'lucide-react';
import Image from 'next/image';
import AddressMap from '@/components/AddressMap';

interface ProfileClientProps {
    initialProfile: any;
    userId: string;
    email: string;
}

export default function ProfileClient({ initialProfile, userId, email }: ProfileClientProps) {
    const supabase = createClient();
    const [activeTab, setActiveTab] = useState<'Profile' | 'Address'>('Profile');
    const [isEditing, setIsEditing] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    // Profile Data State
    const [profileData, setProfileData] = useState({
        full_name: initialProfile.full_name || '',
        phone: initialProfile.phone || '',
        profile_pic: initialProfile.profile_pic || '',
        role: initialProfile.role || 'donor',
    });

    // Role Specific Data
    const [details, setDetails] = useState(initialProfile.details || {});
    const [address, setAddress] = useState(initialProfile.address || {});

    const role = profileData.role;
    const isDonor = role === 'donor';
    const themeColor = isDonor ? '#30496E' : '#FF9248';
    const bgColor = isDonor ? 'bg-[#30496E]' : 'bg-[#FF9248]';

    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleSave = async () => {
        setIsLoading(true);
        setMessage(null);

        try {
            // 1. Update Profiles table
            const { error: profileError } = await supabase
                .from('profiles')
                .update({
                    full_name: profileData.full_name,
                    phone: profileData.phone,
                })
                .eq('id', userId);

            if (profileError) throw profileError;

            // 2. Update Role Table
            if (isDonor) {
                const { error: donorError } = await supabase
                    .from('donor_profiles')
                    .upsert({
                        profile_id: userId,
                        bio: details.bio
                    }, { onConflict: 'profile_id' });
                if (donorError) throw donorError;
            } else {
                const { error: orgError } = await supabase
                    .from('organization_profiles')
                    .upsert({
                        profile_id: userId,
                        description: details.description,
                        tagline: details.tagline,
                        website: details.website,
                        email: details.email,
                        availability: details.availability,
                        donation_method: details.donation_method,
                        categories_accepted: details.categories_accepted || []
                    }, { onConflict: 'profile_id' });
                if (orgError) throw orgError;
            }

            setMessage({ type: 'success', text: 'Profile updated successfully!' });
            setIsEditing(false);

            // Force refresh server data
            window.location.reload();
        } catch (error: any) {
            console.error('Save error:', error);
            setMessage({ type: 'error', text: error.message || 'Failed to save profile' });
        } finally {
            setIsLoading(false);
        }
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsLoading(true);
        try {
            const fileExt = file.name.split('.').pop();
            const filePath = `${userId}/avatar.${fileExt}`;

            const { error: uploadError } = await supabase.storage
                .from('avatars')
                .upload(filePath, file, { upsert: true });

            if (uploadError) throw uploadError;

            const { data: { publicUrl } } = supabase.storage
                .from('avatars')
                .getPublicUrl(filePath);

            const { error: updateError } = await supabase
                .from('profiles')
                .update({ profile_pic: publicUrl })
                .eq('id', userId);

            if (updateError) throw updateError;

            setProfileData(prev => ({ ...prev, profile_pic: publicUrl }));
            setMessage({ type: 'success', text: 'Profile picture updated!' });
        } catch (error: any) {
            setMessage({ type: 'error', text: 'Failed to upload image' });
        } finally {
            setIsLoading(false);
        }
    };

    const handleRequestVerification = () => {
        const subject = encodeURIComponent(`[Verification Request] ${profileData.full_name}`);
        const body = encodeURIComponent(
            `Hello RePurpose Team,\n\nI would like to request verification for my organization: ${profileData.full_name}.\n\nOrganization Details:\n- Name: ${profileData.full_name}\n- ID: ${userId}\n- Email: ${email}\n\nPlease let us know the next steps or documents required for verification.\n\nThank you!`
        );
        window.location.href = `mailto:micotazarte@gmail.com?subject=${subject}&body=${body}`;
    };

    return (
        <div className="h-full w-full flex flex-col bg-[#F8FAFC]">
            {/* Content Area */}
            <div className="flex-1 px-6 lg:px-16 py-12 overflow-y-auto no-scrollbar">
                {/* Compact Profile Info */}
                <div className="mb-12 flex flex-col lg:flex-row items-center lg:items-end gap-8 bg-white p-8 rounded-[40px] shadow-sm border border-gray-100">
                    <div className="relative group">
                        <div className="size-32 lg:size-40 rounded-[40px] bg-gray-50 p-1 shadow-inner overflow-hidden relative border-2 border-white">
                            {profileData.profile_pic ? (
                                <Image
                                    src={profileData.profile_pic}
                                    alt="Profile"
                                    fill
                                    className="object-cover rounded-[36px]"
                                    unoptimized
                                />
                            ) : (
                                <div className="w-full h-full bg-[#E2E8F0] rounded-[36px] flex items-center justify-center">
                                    <User className="size-16 text-gray-400" />
                                </div>
                            )}

                            <button
                                onClick={() => fileInputRef.current?.click()}
                                className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-[36px]"
                            >
                                <Camera className="size-8 text-white" />
                            </button>
                            <input type="file" ref={fileInputRef} className="hidden" onChange={handleImageUpload} accept="image/*" />
                        </div>
                    </div>

                    <div className="flex-1 text-center lg:text-left">
                        <div className="flex flex-col lg:flex-row items-center gap-3 lg:gap-4 mb-2">
                            <h1 className="text-3xl lg:text-4xl font-black text-[#30496E]">
                                {profileData.full_name || 'Your Name'}
                            </h1>
                            <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${isDonor ? 'bg-[#30496E]/10 text-[#30496E]' : 'bg-[#FF9248]/10 text-[#FF9248]'}`}>
                                {profileData.role}
                            </span>
                        </div>
                        <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 text-gray-500 font-bold text-sm">
                            <div className="flex items-center gap-2">
                                <Mail className="size-4" /> {email}
                            </div>
                            {profileData.phone && (
                                <div className="flex items-center gap-2 border-l border-gray-200 pl-4">
                                    <Phone className="size-4" /> {profileData.phone}
                                </div>
                            )}
                        </div>

                        {!isDonor && (
                            <div className="mt-4 flex items-center justify-center lg:justify-start">
                                {details.is_verified ? (
                                    <div className="flex items-center gap-1.5 px-4 py-1.5 bg-green-50 text-green-600 rounded-full text-[10px] font-black uppercase tracking-widest border border-green-100">
                                        <CheckCircle2 className="size-3" /> Verified Organization
                                    </div>
                                ) : (
                                    <button
                                        onClick={handleRequestVerification}
                                        className="flex items-center gap-2 px-4 py-1.5 bg-orange-50 text-orange-600 rounded-full text-[10px] font-black uppercase tracking-widest border border-orange-100 hover:bg-orange-100 transition-all shadow-sm hover:shadow-md active:scale-95"
                                    >
                                        <AlertCircle className="size-3" /> Get Verified
                                    </button>
                                )}
                            </div>
                        )}
                    </div>

                    <div className="flex gap-4">
                        {isEditing ? (
                            <>
                                <button
                                    onClick={handleSave}
                                    disabled={isLoading}
                                    className="px-8 py-3 bg-[#30496E] text-white rounded-2xl font-black shadow-lg hover:scale-105 active:scale-95 transition-all flex items-center gap-2 disabled:opacity-50"
                                >
                                    <Save className="size-5" /> {isLoading ? 'Saving...' : 'Save Changes'}
                                </button>
                                <button
                                    onClick={() => {
                                        setIsEditing(false);
                                        setProfileData({
                                            full_name: initialProfile.full_name || '',
                                            phone: initialProfile.phone || '',
                                            profile_pic: initialProfile.profile_pic || '',
                                            role: initialProfile.role || 'donor',
                                        });
                                        setDetails(initialProfile.details || {});
                                    }}
                                    className="px-6 py-3 bg-white text-gray-400 rounded-2xl font-black shadow-md hover:bg-gray-50 transition-all flex items-center gap-2 border border-gray-100"
                                >
                                    <X className="size-5" /> Cancel
                                </button>
                            </>
                        ) : (
                            <button
                                onClick={() => setIsEditing(true)}
                                className="px-8 py-3 bg-white text-[#30496E] rounded-2xl font-black shadow-lg hover:scale-105 active:scale-95 transition-all flex items-center gap-2 border border-[#30496E]/10"
                            >
                                <Edit3 className="size-5" /> Edit Profile
                            </button>
                        )}
                    </div>
                </div>
                {/* Status Messages */}
                {message && (
                    <div className={`mb-8 p-4 rounded-2xl flex items-center gap-3 animate-in fade-in slide-in-from-top-4 ${message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-red-50 text-red-700 border border-red-100'}`}>
                        {message.type === 'success' ? <CheckCircle2 className="size-5" /> : <AlertCircle className="size-5" />}
                        <p className="font-bold">{message.text}</p>
                    </div>
                )}

                {/* Tabs Toggle */}
                <div className="flex gap-4 mb-8">
                    {[
                        { id: 'Profile', icon: User },
                        { id: 'Address', icon: MapPin }
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            className={`px-8 py-4 rounded-3xl font-black flex items-center gap-3 transition-all ${activeTab === tab.id ? `${bgColor} text-white shadow-xl scale-105` : 'bg-white text-gray-400 hover:text-gray-600 shadow-sm'}`}
                        >
                            <tab.icon className="size-5" />
                            {tab.id}
                        </button>
                    ))}
                </div>

                <div className="grid lg:grid-cols-3 gap-8">
                    {/* Left Panel: Primary Info */}
                    <div className="lg:col-span-2 space-y-8">
                        {activeTab === 'Profile' ? (
                            <div className="bg-white rounded-[40px] p-8 lg:p-12 shadow-sm border border-gray-100">
                                <h2 className="text-2xl font-black text-[#30496E] mb-8 flex items-center gap-3">
                                    <Info className="size-6 text-[#30496E]" />
                                    General Information
                                </h2>

                                <div className="grid gap-8">
                                    <div className="grid lg:grid-cols-2 gap-8">
                                        <div className="space-y-2">
                                            <label className="text-xs font-black uppercase tracking-widest text-gray-400 ml-1">Full Name</label>
                                            {isEditing ? (
                                                <input
                                                    type="text"
                                                    value={profileData.full_name}
                                                    onChange={e => setProfileData({ ...profileData, full_name: e.target.value })}
                                                    className="w-full h-14 bg-gray-50 border-2 border-gray-100 rounded-2xl px-5 font-bold text-[#30496E] focus:border-[#30496E]/20 focus:outline-none transition-all"
                                                />
                                            ) : (
                                                <p className="px-5 h-14 flex items-center bg-gray-50 rounded-2xl font-bold text-[#30496E]">{profileData.full_name || 'Not set'}</p>
                                            )}
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-black uppercase tracking-widest text-gray-400 ml-1">Phone Number</label>
                                            {isEditing ? (
                                                <input
                                                    type="text"
                                                    value={profileData.phone}
                                                    onChange={e => setProfileData({ ...profileData, phone: e.target.value })}
                                                    className="w-full h-14 bg-gray-50 border-2 border-gray-100 rounded-2xl px-5 font-bold text-[#30496E] focus:border-[#30496E]/20 focus:outline-none transition-all"
                                                />
                                            ) : (
                                                <p className="px-5 h-14 flex items-center bg-gray-50 rounded-2xl font-bold text-[#30496E]">{profileData.phone || 'Not set'}</p>
                                            )}
                                        </div>
                                    </div>

                                    {/* Role Specific Fields */}
                                    {isDonor ? (
                                        <div className="space-y-2">
                                            <label className="text-xs font-black uppercase tracking-widest text-gray-400 ml-1">Bio</label>
                                            {isEditing ? (
                                                <textarea
                                                    value={details.bio}
                                                    onChange={e => setDetails({ ...details, bio: e.target.value })}
                                                    className="w-full min-h-[160px] bg-gray-50 border-2 border-gray-100 rounded-2xl p-5 font-bold text-[#30496E] focus:border-[#30496E]/20 focus:outline-none transition-all resize-none"
                                                    placeholder="Tell us about yourself..."
                                                />
                                            ) : (
                                                <div className="p-6 bg-gray-50 rounded-2xl font-bold text-[#30496E] min-h-[120px] whitespace-pre-wrap leading-relaxed">
                                                    {details.bio || 'Your bio is empty. Click edit to add one!'}
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="grid gap-8">
                                            <div className="grid lg:grid-cols-2 gap-8">
                                                <div className="space-y-2">
                                                    <label className="text-xs font-black uppercase tracking-widest text-gray-400 ml-1">Tagline / Mission</label>
                                                    {isEditing ? (
                                                        <input
                                                            type="text"
                                                            value={details.tagline || ''}
                                                            onChange={e => setDetails({ ...details, tagline: e.target.value })}
                                                            placeholder="e.g. Empowering local communities"
                                                            className="w-full h-14 bg-gray-50 border-2 border-transparent rounded-2xl px-5 font-bold text-[#30496E] focus:border-[#30496E]/20 focus:outline-none transition-all"
                                                        />
                                                    ) : (
                                                        <p className="px-5 h-14 flex items-center bg-gray-50 rounded-2xl font-bold text-[#30496E] tracking-tight truncate">
                                                            {details.tagline || 'No tagline set'}
                                                        </p>
                                                    )}
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-xs font-black uppercase tracking-widest text-gray-400 ml-1">Accepted Categories</label>
                                                    {isEditing ? (
                                                        <div className="flex gap-2">
                                                            {['Clothes', 'Food', 'Water'].map(cat => {
                                                                const isSelected = (details.categories_accepted || []).includes(cat);
                                                                return (
                                                                    <button
                                                                        key={cat}
                                                                        type="button"
                                                                        onClick={() => {
                                                                            const current = details.categories_accepted || [];
                                                                            const updated = isSelected
                                                                                ? current.filter((c: string) => c !== cat)
                                                                                : [...current, cat];
                                                                            setDetails({ ...details, categories_accepted: updated });
                                                                        }}
                                                                        className={`px-4 h-14 rounded-2xl font-bold transition-all border-2 ${isSelected ? 'bg-[#30496E] text-white border-[#30496E]' : 'bg-gray-50 text-gray-400 border-transparent hover:border-gray-200'}`}
                                                                    >
                                                                        {cat}
                                                                    </button>
                                                                )
                                                            })}
                                                        </div>
                                                    ) : (
                                                        <div className="px-5 h-14 flex items-center bg-gray-50 rounded-2xl overflow-hidden">
                                                            <div className="flex gap-2 truncate">
                                                                {(details.categories_accepted || []).map((cat: string) => (
                                                                    <span key={cat} className="px-2 py-0.5 bg-[#30496E]/10 text-[#30496E] rounded text-[10px] font-black uppercase whitespace-nowrap">{cat}</span>
                                                                ))}
                                                                {(details.categories_accepted || []).length === 0 && (
                                                                    <span className="text-gray-400 text-sm font-bold italic">No categories selected</span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-xs font-black uppercase tracking-widest text-gray-400 ml-1">Description</label>
                                                {isEditing ? (
                                                    <textarea
                                                        value={details.description || ''}
                                                        onChange={e => setDetails({ ...details, description: e.target.value })}
                                                        className="w-full min-h-[160px] bg-gray-50 border-2 border-transparent rounded-2xl p-5 font-bold text-[#30496E] focus:border-[#30496E]/20 focus:outline-none transition-all resize-none"
                                                    />
                                                ) : (
                                                    <div className="p-6 bg-gray-50 rounded-2xl font-bold text-[#30496E] min-h-[120px] whitespace-pre-wrap leading-relaxed opacity-70">
                                                        {details.description || 'No description provided.'}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ) : (
                            <div className="bg-white rounded-[40px] p-4 lg:p-8 shadow-sm border border-gray-100 min-h-[600px] overflow-hidden">
                                <AddressMap userId={userId} />
                            </div>
                        )}
                    </div>

                    {/* Right Panel: Supplementary Info */}
                    <div className="space-y-8">
                        {!isDonor && (
                            <div className="bg-[#FF9248] rounded-[40px] p-8 text-white shadow-xl shadow-[#FF9248]/20">
                                <h3 className="text-xl font-black mb-8 flex items-center gap-3">
                                    <Truck className="size-6 text-orange-100" />
                                    Donation Settings
                                </h3>

                                <div className="space-y-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-orange-100 ml-1 opacity-70">Mode</label>
                                        {isEditing ? (
                                            <select
                                                value={details.donation_method}
                                                onChange={e => setDetails({ ...details, donation_method: e.target.value })}
                                                className="w-full h-12 bg-white/10 border border-white/20 rounded-xl px-4 font-black focus:outline-none"
                                            >
                                                <option value="pickup" className="text-[#30496E]">Pickup Only</option>
                                                <option value="delivery" className="text-[#30496E]">Delivery Only</option>
                                                <option value="both" className="text-[#30496E]">Pickup & Delivery</option>
                                            </select>
                                        ) : (
                                            <div className="h-12 flex items-center bg-white/10 rounded-xl px-4 font-black uppercase tracking-wider text-sm">
                                                {details.donation_method === 'both' ? 'Delivery & Pickup' : (details.donation_method || 'Method Not Set')}
                                            </div>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-orange-100 ml-1 opacity-70">Availability</label>
                                        {isEditing ? (
                                            <input
                                                type="text"
                                                value={details.availability}
                                                onChange={e => setDetails({ ...details, availability: e.target.value })}
                                                placeholder="e.g. 8:00 AM - 5:00 PM"
                                                className="w-full h-12 bg-white/10 border border-white/20 rounded-xl px-4 font-black focus:outline-none placeholder:text-white/30"
                                            />
                                        ) : (
                                            <div className="flex items-center gap-3 h-12 bg-white/10 rounded-xl px-4 font-black text-sm text-orange-50">
                                                <Clock className="size-4" /> {details.availability || 'Not specified'}
                                            </div>
                                        )}
                                    </div>

                                    <div className="space-y-3 pt-4">
                                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-orange-100 ml-1 opacity-70">Categories Accepted</label>
                                        <div className="flex flex-wrap gap-2">
                                            {(details.categories_accepted || []).map((cat: string) => (
                                                <span key={cat} className="px-3 py-1.5 bg-white/20 rounded-lg text-xs font-black uppercase tracking-tight">
                                                    {cat}
                                                </span>
                                            ))}
                                            {(!details.categories_accepted || details.categories_accepted.length === 0) && (
                                                <p className="text-white/50 italic text-sm font-bold">No categories added</p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Connectivity / Links */}
                        <div className="bg-white rounded-[40px] p-10 shadow-sm border border-gray-100">
                            <h3 className="text-xl font-black text-[#30496E] mb-8">Connectivity</h3>
                            <div className="space-y-6">
                                {/* Sign-in Email (Read Only) */}
                                <div className="group">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 block ml-1">Sign-in Email</label>
                                    <div className="flex items-center gap-4">
                                        <div className="size-10 rounded-xl flex items-center justify-center bg-purple-50 text-purple-600 shadow-inner">
                                            <Mail className="size-5" />
                                        </div>
                                        <p className="flex-1 font-bold text-[#30496E] truncate opacity-60 cursor-not-allowed">{email}</p>
                                    </div>
                                </div>

                                {/* Facebook Link */}
                                <div className="group">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 block ml-1">Facebook Profile</label>
                                    <div className="flex items-center gap-4">
                                        <div className="size-10 rounded-xl flex items-center justify-center bg-blue-50 text-blue-600 shadow-inner">
                                            <Facebook className="size-5" />
                                        </div>
                                        {isEditing ? (
                                            <input
                                                type="text"
                                                value={details.website || ''}
                                                onChange={e => setDetails({ ...details, website: e.target.value })}
                                                placeholder="facebook.com/your-page"
                                                className="flex-1 h-10 bg-gray-50 border-b-2 border-transparent focus:border-[#30496E]/20 focus:outline-none font-bold text-[#30496E] transition-all"
                                            />
                                        ) : (
                                            <p className="flex-1 font-bold text-[#30496E] truncate">{details.website || 'Not linked'}</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <style jsx global>{`
                .no-scrollbar::-webkit-scrollbar {
                    display: none;
                }
                .no-scrollbar {
                    -ms-overflow-style: none;
                    scrollbar-width: none;
                }
                @keyframes fade-in {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                @keyframes slide-in-from-top {
                    from { transform: translateY(-20px); opacity: 0; }
                    to { transform: translateY(0); opacity: 1; }
                }
                .animate-in {
                    animation-fill-mode: forwards;
                }
                .fade-in {
                    animation-name: fade-in;
                }
                .slide-in-from-top-4 {
                    animation-name: slide-in-from-top;
                }
            `}</style>
        </div>
    );
}
