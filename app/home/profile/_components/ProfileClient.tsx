'use client';

import React, { useState, useRef, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import {
    User, Mail, Phone, MapPin, Globe, Facebook, Instagram,
    Camera, CheckCircle2, AlertCircle, Save, X, Edit3,
    Truck, Package, Info, Clock, Tag, Trash2, AlertTriangle, Lock
} from 'lucide-react';
import Image from 'next/image';
import AddressMap from '@/components/AddressMap';
import { deleteAccount } from '@/lib/auth-actions';

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
    const [isMounted, setIsMounted] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isDeleting, setIsDeleting] = useState(false);
    const [showCatError, setShowCatError] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    // Profile Data State
    const [profileData, setProfileData] = useState({
        full_name: initialProfile.full_name || '',
        phone: initialProfile.phone || '',
        profile_pic: initialProfile.profile_pic || '',
        role: initialProfile.role || 'donor',
        facebook_url: initialProfile.facebook_url || '',
    });

    // Role Specific Data
    const [details, setDetails] = useState(initialProfile.details || {});
    const [address, setAddress] = useState(initialProfile.address || {});

    const fileInputRef = useRef<HTMLInputElement>(null);

    const role = profileData.role;
    const isDonor = role === 'donor';
    const themeColor = isDonor ? '#30496E' : '#FF9248';
    const bgColor = isDonor ? 'bg-[#30496E]' : 'bg-[#FF9248]';
    const textColor = isDonor ? 'text-[#30496E]' : 'text-[#FF9248]';
    const borderColor = isDonor ? 'border-[#30496E]' : 'border-[#FF9248]';
    const focusBorder = isDonor ? 'focus:border-[#30496E]/20' : 'focus:border-[#FF9248]/20';
    const accentBg = isDonor ? 'bg-[#30496E]/10' : 'bg-[#FF9248]/10';

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
                    facebook_url: profileData.facebook_url,
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
                // Validation: At least one category required for organizations
                if (!details.categories_accepted || details.categories_accepted.length === 0) {
                    setMessage({ type: 'error', text: 'At least one accepted category is required for organizations.' });
                    setIsLoading(false);
                    return;
                }

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
                        categories_accepted: details.categories_accepted
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
            const fileName = `avatar-${Date.now()}.${fileExt}`;
            const filePath = `${userId}/${fileName}`;

            // 1. Upload new image
            const { error: uploadError } = await supabase.storage
                .from('avatars')
                .upload(filePath, file);

            if (uploadError) throw uploadError;

            // 2. Get URL with cache buster
            const { data: { publicUrl } } = supabase.storage
                .from('avatars')
                .getPublicUrl(filePath);

            const finalUrl = `${publicUrl}?t=${Date.now()}`;

            // 3. Update profile record
            const { error: updateError } = await supabase
                .from('profiles')
                .update({ profile_pic: finalUrl })
                .eq('id', userId);

            if (updateError) throw updateError;

            // 4. Update state
            setProfileData(prev => ({ ...prev, profile_pic: finalUrl }));
            setMessage({ type: 'success', text: 'Profile picture updated!' });

            // 5. Optionally refresh to ensure everything is synced
            setTimeout(() => window.location.reload(), 1500);
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

    const handleDeleteAccount = async () => {
        setIsDeleting(true);
        try {
            const res = await deleteAccount(confirmPassword);
            if (res?.success) {
                window.location.href = '/';
            } else {
                setMessage({ type: 'error', text: res?.error || 'Failed to delete account' });
                setIsDeleting(false);
            }
        } catch (err: any) {
            console.error('Client delete error:', err);
            setMessage({ type: 'error', text: `System error: ${err.message || 'Unknown error'}` });
            setIsDeleting(false);
        }
    };

    if (!isMounted) {
        return (
            <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
                <div className="size-12 border-4 border-[#30496E] border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="h-full w-full flex flex-col bg-[#F8FAFC]">
            {/* Content Area */}
            <div className="flex-1 px-6 lg:px-16 py-12 overflow-y-auto no-scrollbar">
                {/* Compact Profile Info */}
                <div className={`mb-12 flex flex-col lg:flex-row items-center lg:items-end gap-8 bg-white p-8 rounded-[40px] shadow-sm border-2 ${borderColor}`}>
                    <div className="relative group">
                        <div className={`size-32 lg:size-40 rounded-[40px] bg-gray-50 p-1 shadow-inner overflow-hidden relative border-4 ${borderColor}`}>
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
                            <h1 className={`text-3xl lg:text-4xl font-black ${textColor}`}>
                                {profileData.full_name || 'Your Name'}
                            </h1>
                            <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${accentBg} ${textColor}`}>
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
                                    disabled={isLoading || (!isDonor && (!details.categories_accepted || details.categories_accepted.length === 0))}
                                    className={`px-8 py-3 ${bgColor} text-white rounded-2xl font-black shadow-lg hover:scale-105 active:scale-95 transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed`}
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
                                            facebook_url: initialProfile.facebook_url || '',
                                        });
                                        setDetails(initialProfile.details || {});
                                    }}
                                    className="px-6 py-3 bg-white text-gray-400 rounded-2xl font-black shadow-md hover:bg-gray-50 transition-all flex items-center gap-2 border-2 border-transparent hover:border-gray-200"
                                >
                                    <X className="size-5" /> Cancel
                                </button>
                            </>
                        ) : (
                            <button
                                onClick={() => setIsEditing(true)}
                                className={`px-8 py-3 bg-white ${textColor} rounded-2xl font-black shadow-lg hover:scale-105 active:scale-95 transition-all flex items-center gap-2 border-2 ${borderColor}`}
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
                            className={`px-8 py-4 rounded-3xl font-black flex items-center gap-3 transition-all border-2 ${activeTab === tab.id ? `${bgColor} text-white shadow-xl scale-105 ${borderColor}` : 'bg-white text-gray-400 border-transparent hover:text-gray-600 shadow-sm hover:border-gray-200'}`}
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
                            <div className={`bg-white rounded-[40px] p-8 lg:p-12 shadow-sm border-2 ${borderColor}`}>
                                <h2 className={`text-2xl font-black ${textColor} mb-8 flex items-center gap-3`}>
                                    <Info className={`size-6 ${textColor}`} />
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
                                                    className={`w-full h-14 bg-gray-50 border-2 border-gray-100 rounded-2xl px-5 font-bold ${textColor} ${focusBorder} focus:outline-none transition-all`}
                                                />
                                            ) : (
                                                <p className={`px-5 h-14 flex items-center bg-gray-50 rounded-2xl font-bold ${textColor}`}>{profileData.full_name || 'Not set'}</p>
                                            )}
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-black uppercase tracking-widest text-gray-400 ml-1">Phone Number</label>
                                            {isEditing ? (
                                                <input
                                                    type="text"
                                                    value={profileData.phone}
                                                    onChange={e => setProfileData({ ...profileData, phone: e.target.value })}
                                                    className={`w-full h-14 bg-gray-50 border-2 border-gray-100 rounded-2xl px-5 font-bold ${textColor} ${focusBorder} focus:outline-none transition-all`}
                                                />
                                            ) : (
                                                <p className={`px-5 h-14 flex items-center bg-gray-50 rounded-2xl font-bold ${textColor}`}>{profileData.phone || 'Not set'}</p>
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
                                                    className={`w-full min-h-[160px] bg-gray-50 border-2 border-gray-100 rounded-2xl p-5 font-bold ${textColor} ${focusBorder} focus:outline-none transition-all resize-none`}
                                                    placeholder="Tell us about yourself..."
                                                />
                                            ) : (
                                                <div className={`p-6 bg-gray-50 rounded-2xl font-bold ${textColor} min-h-[120px] whitespace-pre-wrap leading-relaxed`}>
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
                                                            className={`w-full h-14 bg-gray-50 border-2 border-transparent rounded-2xl px-5 font-bold ${textColor} ${focusBorder} focus:outline-none transition-all`}
                                                        />
                                                    ) : (
                                                        <p className={`px-5 h-14 flex items-center bg-gray-50 rounded-2xl font-bold ${textColor} tracking-tight truncate`}>
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
                                                                            if (isSelected && current.length <= 1) return; // Prevent deselecting the last category

                                                                            const updated = isSelected
                                                                                ? current.filter((c: string) => c !== cat)
                                                                                : [...current, cat];
                                                                            setDetails({ ...details, categories_accepted: updated });
                                                                        }}
                                                                        className={`px-4 h-14 rounded-2xl font-bold transition-all border-2 ${isSelected ? `${bgColor} text-white ${borderColor}` : 'bg-gray-50 text-gray-400 border-transparent hover:border-gray-200'}`}
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
                                                                    <span key={cat} className={`px-2 py-0.5 ${accentBg} ${textColor} rounded text-[10px] font-black uppercase whitespace-nowrap`}>{cat}</span>
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
                                                        className={`w-full min-h-[160px] bg-gray-50 border-2 border-transparent rounded-2xl p-5 font-bold ${textColor} ${focusBorder} focus:outline-none transition-all resize-none`}
                                                    />
                                                ) : (
                                                    <div className={`p-6 bg-gray-50 rounded-2xl font-bold ${textColor} min-h-[120px] whitespace-pre-wrap leading-relaxed opacity-70`}>
                                                        {details.description || 'No description provided.'}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ) : (
                            <div className={`bg-white rounded-[40px] p-4 lg:p-8 shadow-sm border-2 ${borderColor} min-h-[600px] overflow-hidden`}>
                                <AddressMap userId={userId} role={role} />
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
                                                <option value="pickup" className={textColor}>Pickup Only</option>
                                                <option value="delivery" className={textColor}>Delivery Only</option>
                                                <option value="both" className={textColor}>Pickup & Delivery</option>
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
                                            <div className="flex items-center gap-3">
                                                <div className="flex-1 relative">
                                                    <input
                                                        type="time"
                                                        value={(details.availability || '').split(' - ')[0] || ''}
                                                        onChange={e => {
                                                            const parts = (details.availability || '').split(' - ');
                                                            const end = parts[1] || '';
                                                            setDetails({ ...details, availability: `${e.target.value} - ${end}` });
                                                        }}
                                                        className="w-full h-12 bg-white/10 border border-white/20 rounded-xl px-4 font-black focus:outline-none cursor-pointer scheme-dark"
                                                    />
                                                </div>
                                                <span className="text-white/50 font-black tracking-widest uppercase text-[10px]">TO</span>
                                                <div className="flex-1 relative">
                                                    <input
                                                        type="time"
                                                        value={(details.availability || '').split(' - ')[1] || ''}
                                                        onChange={e => {
                                                            const parts = (details.availability || '').split(' - ');
                                                            const start = parts[0] || '';
                                                            setDetails({ ...details, availability: `${start} - ${e.target.value}` });
                                                        }}
                                                        className="w-full h-12 bg-white/10 border border-white/20 rounded-xl px-4 font-black focus:outline-none cursor-pointer scheme-dark"
                                                    />
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-3 h-12 bg-white/10 rounded-xl px-4 font-black text-sm text-orange-50">
                                                <Clock className="size-4" />
                                                <span>
                                                    {details.availability ? (() => {
                                                        const p = details.availability.split(' - ');
                                                        if (p.length === 2) {
                                                            const f = (t: string) => {
                                                                if (!t) return '';
                                                                let [h, m] = t.split(':');
                                                                let numH = parseInt(h);
                                                                if (isNaN(numH)) return t;
                                                                let ampm = numH >= 12 ? 'PM' : 'AM';
                                                                numH = numH % 12 || 12;
                                                                return `${numH}:${m} ${ampm}`;
                                                            };
                                                            return `${f(p[0])} - ${f(p[1])}`;
                                                        }
                                                        return details.availability;
                                                    })() : 'Not specified'}
                                                </span>
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
                        <div className={`bg-white rounded-[40px] p-10 shadow-sm border-2 ${borderColor}`}>
                            <h3 className={`text-xl font-black ${textColor} mb-8`}>Connectivity</h3>
                            <div className="space-y-6">
                                {/* Sign-in Email (Read Only) */}
                                <div className="group">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 block ml-1">Sign-in Email</label>
                                    <div className="flex items-center gap-4">
                                        <div className="size-10 rounded-xl flex items-center justify-center bg-purple-50 text-purple-600 shadow-inner">
                                            <Mail className="size-5" />
                                        </div>
                                        <p className={`flex-1 font-bold ${textColor} truncate opacity-60 cursor-not-allowed`}>{email}</p>
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
                                                value={profileData.facebook_url || ''}
                                                onChange={e => setProfileData({ ...profileData, facebook_url: e.target.value })}
                                                placeholder="facebook.com/your-page"
                                                className={`flex-1 h-10 bg-gray-50 border-b-2 border-transparent ${focusBorder} focus:outline-none font-bold ${textColor} transition-all`}
                                            />
                                        ) : (
                                            profileData.facebook_url ? (
                                                <a
                                                    href={profileData.facebook_url.startsWith('http') ? profileData.facebook_url : `https://${profileData.facebook_url}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className={`flex-1 font-bold ${textColor} underline hover:opacity-70 transition-all`}
                                                >
                                                    Facebook
                                                </a>
                                            ) : (
                                                <p className={`flex-1 font-bold ${textColor} truncate`}>Not linked</p>
                                            )
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Danger Zone */}
                        <div className="bg-red-50 rounded-[40px] p-10 border-2 border-dashed border-red-100 mt-8">
                            <h3 className="text-xl font-black text-red-600 mb-2 flex items-center gap-2">
                                <AlertTriangle className="size-5" /> Danger Zone
                            </h3>
                            <p className="text-red-600/60 font-bold text-xs mb-8">Beware: These actions are irreversible.</p>

                            <button
                                onClick={() => setShowDeleteConfirm(true)}
                                className="w-full py-4 bg-white text-red-500 border-2 border-red-100 rounded-2xl font-black shadow-sm hover:bg-red-500 hover:text-white hover:border-red-500 transition-all flex items-center justify-center gap-3 group"
                            >
                                <Trash2 className="size-5 group-hover:scale-110 transition-transform" />
                                Permanently Delete Account
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Delete Confirmation Modal */}
            {showDeleteConfirm && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="bg-white rounded-[40px] shadow-2xl max-w-sm w-full p-8 text-center border-4 border-red-50 animate-in zoom-in-95 duration-500">
                        <div className="size-20 bg-red-50 rounded-[24px] flex items-center justify-center mx-auto mb-6 text-red-500 shadow-inner rotate-3">
                            <AlertTriangle className="size-10" />
                        </div>
                        <h3 className="text-2xl font-black text-[#30496E] mb-3 tracking-tight">Serious Action.</h3>
                        <p className="text-gray-500 font-bold leading-relaxed mb-6 text-sm">
                            This will permanently delete your account, your profile data, and all your images. This action <span className="text-red-500">cannot be undone</span>.
                        </p>

                        <div className="space-y-4 mb-8">
                            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 block text-left ml-4">Confirm Password</label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-gray-300" />
                                <input
                                    type="password"
                                    value={confirmPassword}
                                    onChange={e => setConfirmPassword(e.target.value)}
                                    placeholder="Enter your password"
                                    className="w-full h-12 bg-gray-50 border-2 border-transparent focus:border-red-200 focus:outline-none rounded-2xl pl-10 pr-4 font-bold text-[#30496E] transition-all"
                                />
                            </div>
                        </div>

                        <div className="flex flex-col gap-3">
                            <button
                                onClick={handleDeleteAccount}
                                disabled={isDeleting || !confirmPassword}
                                className="w-full bg-red-500 text-white py-4 rounded-2xl font-black shadow-lg hover:bg-red-600 active:scale-95 transition-all text-sm flex items-center justify-center gap-2 disabled:opacity-50"
                            >
                                {isDeleting ? 'Deleting Forever...' : 'Yes, Delete Everything'}
                            </button>
                            <button
                                onClick={() => { setShowDeleteConfirm(false); setConfirmPassword(''); }}
                                className="w-full py-2 text-gray-400 font-black hover:text-[#30496E] transition-all text-[10px] uppercase tracking-widest"
                            >
                                I changed my mind
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <style jsx global>{`
            @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
            @keyframes zoom-in-95 { from { transform: scale(0.95); opacity: 0; } to { transform: scale(1); opacity: 1; } }
            @keyframes shake {
                0%, 100% { transform: translateX(0); }
                25% { transform: translateX(-4px); }
                75% { transform: translateX(4px); }
            }
            .animate-shake { animation: shake 0.2s ease-in-out 0s 2; }
            .animate-in { animation-fill-mode: forwards; }
            .fade-in { animation-name: fade-in; }
            .zoom-in-95 { animation-name: zoom-in-95; }
        `}</style>
        </div>
    );
}
