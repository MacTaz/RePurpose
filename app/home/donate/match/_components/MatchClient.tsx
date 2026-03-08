'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { Search, MapPin, Globe, Mail, Phone, Clock, ArrowRight, ChevronRight, CheckCircle2, X, Truck, Package, AlertTriangle } from 'lucide-react';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { signout } from '@/lib/auth-actions';
import { createClient } from '@/utils/supabase/client';

interface Donation {
    id: string;
    donor_id: string;
    organization_id: string | null;
    type: string;
    quantity: number | null;
    status: string | null;
    created_at: string;
    donor_name: string;
    description: string | null;
    delivery_preference: string | null;
    donor_address?: string;
}

interface Organization {
    id: string;
    full_name: string;
    phone?: string;
    avatar_url?: string;
    description?: string;
    donation_method?: string;
    is_verified?: boolean;
    availability?: string;
    categories_accepted?: string[];
    website?: string;
    facebook_url?: string;
    email?: string;
    tagline?: string;
    location: string;
}

interface MatchClientProps {
    organizations: Organization[];
    role: 'donor' | 'organization';
}

export default function MatchClient({ organizations, role }: MatchClientProps) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const supabase = createClient();

    const [selectedId, setSelectedId] = useState<string>(organizations[0]?.id || '');
    const [showSidebar, setShowSidebar] = useState(true);
    const [showWarning, setShowWarning] = useState(false);
    const [pendingUrl, setPendingUrl] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);

    // Prevent accidental navigation via browser refresh/close
    useEffect(() => {
        const handleBeforeUnload = (e: BeforeUnloadEvent) => {
            e.preventDefault();
            e.returnValue = '';
        };
        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => window.removeEventListener('beforeunload', handleBeforeUnload);
    }, []);

    const selectedOrg = useMemo(() => {
        return organizations.find(org => org.id === selectedId) || organizations[0];
    }, [selectedId, organizations]);

    const handleSelect = (id: string) => {
        setSelectedId(id);
        if (window.innerWidth < 1024) {
            setShowSidebar(false);
        }
    };

    const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, url: string) => {
        e.preventDefault();
        setPendingUrl(url);
        setShowWarning(true);
    };

    const confirmNavigation = () => {
        if (pendingUrl) {
            router.push(pendingUrl);
        }
        setShowWarning(false);
        setPendingUrl(null);
    };

    const handleSubmitDonation = async () => {
        if (!selectedOrg) return;

        setIsSubmitting(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                router.push('/login');
                return;
            }

            const category = searchParams.get('category');
            const quantity = parseInt(searchParams.get('quantity') || '1');
            const itemName = searchParams.get('itemName');
            const description = searchParams.get('description');
            const pref = searchParams.get('pref');
            const hasImage = searchParams.get('hasImage') === 'true';

            const { data: newDonations, error } = await supabase
                .from('donations')
                .insert({
                    donor_id: user.id,
                    organization_id: selectedOrg.id,
                    type: category || 'Other',
                    quantity: quantity,
                    status: 'pending',
                    target_organization: selectedOrg.full_name,
                    description: description,
                    delivery_preference: pref
                })
                .select();

            if (error) throw error;

            const newDonation = newDonations?.[0];

            if (hasImage && newDonation) {
                // Defensive check to avoid "Object not found" if temp file is already gone
                const tempPath = `${user.id}/temp`;
                const { data: files, error: listError } = await supabase.storage
                    .from('donations')
                    .list(tempPath, {
                        limit: 100,
                        offset: 0,
                        sortBy: { column: 'name', order: 'asc' },
                        search: 'current.jpg'
                    });

                if (listError) {
                    console.error('List temp files error:', listError);
                } else if (files && files.length > 0) {
                    const finalPath = `${user.id}/donation-${newDonation.id}/picture.jpg`;
                    const { error: moveError } = await supabase.storage
                        .from('donations')
                        .move(`${tempPath}/current.jpg`, finalPath);

                    if (moveError) {
                        console.error('Storage move error:', moveError);
                        alert(`Warning: Donation saved but image move failed: ${moveError.message}`);
                    }
                } else {
                    console.warn('Temp image not found for moving. Path tried:', tempPath);
                }
            }

            // Auto-create a conversation tied to this donation
            if (newDonation) {
                await supabase.from('conversations').insert({
                    donor_id: user.id,
                    org_id: selectedOrg.id,
                    donation_id: newDonation.id,
                });
            }

            setSuccess(true);
            setTimeout(() => {
                router.push('/home/manage');
            }, 2000);
        } catch (err: any) {
            console.error('Donation error:', err);
            // More descriptive error for the user to help debug
            const msg = err.message || 'Unknown error';
            alert(`Failed to process donation: ${msg}`);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="flex flex-col h-screen overflow-hidden">
            {/* Custom Navbar that handles the guard */}
            <div className="font-inter">
                <nav className={`px-8 py-3 flex justify-between items-center shadow-lg transition-colors ${role === 'donor' ? 'bg-[#3D5082] text-white' : 'bg-[#FF9248] text-black'}`}>
                    <div className="flex items-center gap-4">
                        <h1 className="text-2xl font-black tracking-tight cursor-pointer" onClick={(e) => handleNavClick(e as any, '/home')}>
                            RePurpose
                        </h1>
                    </div>
                    <div className="flex items-center gap-8 font-konkhmer text-xl font-normal">
                        <a href="/home/profile" onClick={(e) => handleNavClick(e, '/home/profile')} className="hover:opacity-70 transition-all cursor-pointer">Profile</a>
                        <a href="/home/manage" onClick={(e) => handleNavClick(e, '/home/manage')} className="hover:opacity-70 transition-all cursor-pointer">Manage</a>
                        <a href="/home/donate" onClick={(e) => handleNavClick(e, '/home/donate')} className="hover:opacity-70 transition-all cursor-pointer">Donate</a>
                        <a href="/home/inbox" onClick={(e) => handleNavClick(e, '/home/inbox')} className="p-1 hover:bg-white/10 rounded-lg transition-colors cursor-pointer">
                            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={role === 'donor' ? 'text-white' : 'text-black'}><path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                        </a>
                        <form action={signout} className="ml-4 font-inter">
                            <button type="submit" className={`text-sm px-4 py-1.5 rounded-lg transition-all font-bold shadow-sm ${role === 'donor' ? 'bg-white/20 hover:bg-white/30 text-white' : 'border-2 border-black/20 hover:bg-black/5 text-black'}`}>Logout</button>
                        </form>
                    </div>
                </nav>
            </div>

            <div className="flex-1 w-full flex flex-col lg:flex-row bg-[#9dbcd4] lg:p-4 overflow-hidden relative">

                {/* Navigation Warning Popup - Now absolute within content area to keep Navbar clear */}
                {showWarning && (
                    <div className="absolute inset-0 z-[100] flex items-center justify-center p-4 bg-[#30496E]/20 backdrop-blur-md animate-in fade-in duration-300">
                        <div className="bg-white rounded-[40px] shadow-2xl max-w-sm w-full p-8 text-center border-4 border-[#30496E]/5 animate-in zoom-in-95 duration-500">
                            <div className="size-20 bg-red-50 rounded-[24px] flex items-center justify-center mx-auto mb-6 text-red-500 shadow-inner rotate-3">
                                <AlertTriangle className="size-10" />
                            </div>
                            <h3 className="text-2xl font-black text-[#30496E] mb-3 tracking-tight">Wait!</h3>
                            <p className="text-gray-500 font-bold leading-relaxed mb-8 text-sm">
                                Leaving this page will reset your donation process. You'll need to <span className="text-[#30496E]">fill out the form again</span> if you leave now.
                            </p>
                            <div className="flex flex-col gap-3">
                                <button
                                    onClick={() => { setShowWarning(false); setPendingUrl(null); }}
                                    className="w-full bg-[#304674] text-white py-4 rounded-2xl font-black shadow-lg hover:scale-102 active:scale-95 transition-all text-sm"
                                >
                                    Stay & Finish
                                </button>
                                <button
                                    onClick={confirmNavigation}
                                    className="w-full py-2 text-gray-400 font-black hover:text-red-500 transition-all text-[10px] uppercase tracking-widest"
                                >
                                    I'm okay with losing progress
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Sidebar - Organization List */}
                <div className={`
                    ${showSidebar ? 'flex flex-1 lg:flex-none' : 'hidden lg:flex'} 
                    w-full lg:w-[400px] bg-white lg:rounded-3xl border-r lg:border-r-0 border-gray-200 flex-col shadow-xl z-20 transition-all duration-300
                `}>
                    <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                        <div>
                            <h3 className="text-xl font-black text-[#30496E]">Matches</h3>
                            <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-1">Found in your area</p>
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto custom-scrollbar">
                        {organizations.map((org) => (
                            <button
                                key={org.id}
                                onClick={() => handleSelect(org.id)}
                                className={`w-full text-left p-6 transition-all border-b border-gray-50 flex items-center gap-4 group relative ${selectedId === org.id
                                    ? 'bg-blue-50/80'
                                    : 'hover:bg-gray-50'
                                    }`}
                            >
                                {selectedId === org.id && (
                                    <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-[#304674] rounded-r-full"></div>
                                )}
                                <div className="size-16 rounded-2xl overflow-hidden shrink-0 border-2 border-white shadow-md ring-1 ring-gray-100 relative">
                                    <Image
                                        src={org.avatar_url || 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?q=80&w=2013&auto=format&fit=crop'}
                                        alt={org.full_name}
                                        fill
                                        className="object-cover"
                                        unoptimized
                                    />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-center mb-0.5">
                                        <h4 className={`font-black truncate ${selectedId === org.id ? 'text-[#304674]' : 'text-gray-700'}`}>
                                            {org.full_name}
                                        </h4>
                                        {org.is_verified && (
                                            <div className="size-2 bg-green-500 rounded-full shrink-0 shadow-[0_0_8px_rgba(34,197,94,0.5)]"></div>
                                        )}
                                    </div>
                                    <p className="text-xs text-gray-400 font-bold truncate mb-2 uppercase tracking-tight">
                                        {org.tagline || 'Ready to accept donations'}
                                    </p>
                                    <div className="flex items-center gap-2">
                                        <span className="text-[10px] bg-[#30496E]/10 text-[#30496E] font-black px-2 py-0.5 rounded uppercase tracking-tighter">
                                            {org.donation_method?.toLowerCase() === 'both'
                                                ? (searchParams.get('pref') === 'pickup' ? 'Pickup' : searchParams.get('pref') === 'delivery' ? 'Delivery' : 'Delivery & Pickup')
                                                : (org.donation_method || 'Organization')}
                                        </span>
                                        <span className="text-[10px] text-gray-400 flex items-center gap-1 font-bold">
                                            <MapPin className="size-2.5" /> {org.location.split(',')[0]}
                                        </span>
                                    </div>
                                </div>
                                <ChevronRight className={`size-5 text-gray-300 transition-transform ${selectedId === org.id ? 'translate-x-1 text-[#304674]' : ''}`} />
                            </button>
                        ))}
                    </div>
                </div>

                {/* Main Content Detail Area */}
                <div className={`
                    ${!showSidebar ? 'flex' : 'hidden lg:flex'} 
                    flex-1 flex flex-col bg-white lg:rounded-3xl lg:ml-4 shadow-xl overflow-hidden relative
                `}>
                    <div className="lg:hidden absolute top-4 left-4 z-30">
                        <button
                            onClick={() => setShowSidebar(true)}
                            className="size-10 bg-white shadow-lg rounded-full flex items-center justify-center text-[#30496E]"
                        >
                            <X className="size-6" />
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto no-scrollbar pb-40 lg:pb-32 pt-16 lg:pt-8 px-4 sm:px-8 lg:px-12">
                        {/* Compact Profile Header */}
                        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6 mb-8 lg:mb-10 text-center sm:text-left">
                            <div className="size-24 rounded-3xl overflow-hidden border-2 border-white shadow-lg shrink-0 relative">
                                {selectedOrg && (
                                    <Image
                                        src={selectedOrg.avatar_url || 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?q=80&w=2013&auto=format&fit=crop'}
                                        alt={selectedOrg.full_name}
                                        fill
                                        className="object-cover"
                                        unoptimized
                                    />
                                )}
                            </div>
                            <div className="flex-1">
                                <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-3 mb-2">
                                    <h1 className="text-3xl lg:text-4xl font-black text-[#30496E] leading-tight text-center sm:text-left">
                                        {selectedOrg?.full_name}
                                    </h1>
                                    {selectedOrg?.is_verified && (
                                        <div className="p-1 bg-green-100 rounded-full">
                                            <CheckCircle2 className="size-5 text-green-600" />
                                        </div>
                                    )}
                                </div>
                                <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4 text-gray-400 font-bold text-xs uppercase tracking-widest justify-center sm:justify-start">
                                    <div className="flex items-center gap-1.5">
                                        <div className={`size-2 rounded-full shadow-[0_0_8px_rgba(34,197,94,0.4)] ${selectedOrg?.is_verified ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                                        {selectedOrg?.is_verified ? 'Fully Verified Partner' : 'Verification Pending'}
                                    </div>
                                    <div className="hidden sm:block border-l border-gray-200 h-4 pl-4"></div>
                                    <div className="flex items-center gap-1.5">
                                        <MapPin className="size-3.5" />
                                        {selectedOrg?.location}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="py-2">
                            <div className="grid xl:grid-cols-3 gap-8 lg:gap-12 mt-4">
                                <div className="xl:col-span-2 space-y-8 lg:space-y-10">
                                    <div>
                                        <h3 className="text-xl lg:text-2xl font-black text-[#30496E] mb-6 flex flex-col sm:flex-row items-center gap-3 tracking-tight">
                                            <span className="hidden sm:inline">Profile Description</span>
                                            <div className="hidden sm:block h-1 flex-1 bg-[#9dbcd4]/20 rounded-full"></div>
                                        </h3>
                                        <p className="text-gray-600 text-base lg:text-lg leading-relaxed font-medium text-center sm:text-left">
                                            {selectedOrg?.description || 'No description provided by this organization.'}
                                        </p>
                                    </div>

                                    <div className="space-y-6">
                                        <h4 className="text-lg lg:text-xl font-black text-[#30496E] flex flex-col sm:flex-row items-center gap-3 tracking-tight">
                                            <span className="hidden sm:inline">Accepted Categories</span>
                                            <div className="hidden sm:block h-1 w-12 bg-[#30496E]/10 rounded-full"></div>
                                        </h4>
                                        <div className="flex flex-wrap justify-center sm:justify-start gap-2 lg:gap-3">
                                            {selectedOrg?.categories_accepted && selectedOrg.categories_accepted.length > 0 ? (
                                                selectedOrg.categories_accepted.map(cat => (
                                                    <div key={cat} className="px-4 py-2 lg:px-5 lg:py-3 bg-[#30496E]/5 border border-[#30496E]/10 rounded-2xl flex items-center gap-2 lg:gap-3 group hover:bg-[#30496E] hover:text-white transition-all cursor-default shadow-sm text-center">
                                                        <div className="size-1.5 lg:size-2 bg-[#30496E] rounded-full group-hover:bg-white hidden sm:block"></div>
                                                        <span className="font-bold text-[#30496E] group-hover:text-white uppercase text-[10px] lg:text-xs tracking-widest">{cat}</span>
                                                    </div>
                                                ))
                                            ) : (
                                                <p className="text-gray-400 italic">No categories listed.</p>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-6 lg:space-y-8">
                                    <div className="bg-[#f0f4f8] p-6 lg:p-8 rounded-[32px] lg:rounded-[40px] border-2 border-dashed border-[#9dbcd4] shadow-inner">
                                        <h4 className="text-lg lg:text-xl font-black text-[#30496E] mb-6 lg:mb-8 lowercase tracking-tight text-center sm:text-left"><span className="hidden sm:inline">/</span> connectivity</h4>
                                        <div className="space-y-4 lg:space-y-6">
                                            {[
                                                { icon: Globe, val: selectedOrg?.website, label: 'Website' },
                                                { icon: Mail, val: selectedOrg?.email, label: 'Email' },
                                                { icon: Phone, val: selectedOrg?.phone, label: 'Phone' },
                                                { icon: Clock, val: selectedOrg?.availability, label: 'Availability' },
                                                {
                                                    icon: Truck,
                                                    val: selectedOrg?.donation_method?.toLowerCase() === 'both'
                                                        ? (searchParams.get('pref') === 'pickup' ? 'Pickup Selected' : searchParams.get('pref') === 'delivery' ? 'Delivery Selected' : 'Delivery & Pickup')
                                                        : selectedOrg?.donation_method,
                                                    label: 'Donation Method'
                                                }
                                            ].map((item, i) => (
                                                <div key={i} className="flex flex-col sm:flex-row items-center sm:items-start gap-2 sm:gap-4 group text-center sm:text-left">
                                                    <div className="size-10 lg:size-12 rounded-xl lg:rounded-2xl bg-white shadow-sm flex items-center justify-center text-[#30496E] border border-white group-hover:border-[#30496E]/20 group-hover:scale-105 transition-all">
                                                        <item.icon className="size-4 lg:size-5" />
                                                    </div>
                                                    <div className="min-w-0 flex-1">
                                                        <p className="text-[9px] lg:text-[10px] font-black text-gray-400 uppercase tracking-widest mb-0.5">{item.label}</p>
                                                        <p className="text-sm lg:text-sm font-bold text-[#30496E] break-words sm:truncate">{item.val || 'Not listed'}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="p-4 lg:p-6 bg-[#30496E] rounded-[24px] lg:rounded-[32px] text-white flex flex-col sm:flex-row items-center gap-3 lg:gap-4 shadow-lg text-center sm:text-left">
                                        <div className="size-10 lg:size-12 bg-white/20 rounded-xl lg:rounded-2xl flex items-center justify-center backdrop-blur-md">
                                            <Truck className="size-5 lg:size-6 text-white" />
                                        </div>
                                        <div>
                                            <p className="text-[9px] lg:text-[10px] font-black text-blue-200 uppercase tracking-widest">Support Mode</p>
                                            <p className="font-bold text-base lg:text-lg">
                                                {selectedOrg?.donation_method?.toLowerCase() === 'both'
                                                    ? (searchParams.get('pref') === 'pickup' ? 'Pickup Selected' : searchParams.get('pref') === 'delivery' ? 'Delivery Selected' : 'Delivery & Pickup')
                                                    : (selectedOrg?.donation_method || 'Pickup/Delivery')}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Sticky Action Footer - Fixed at bottom */}
                    <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6 lg:p-8 bg-white/90 backdrop-blur-md border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4 z-40 text-center sm:text-left">
                        <div className="hidden sm:block">
                            <p className="text-sm text-gray-400 font-bold uppercase tracking-tight">Donation Request for</p>
                            <h4 className="text-xl font-black text-[#30496E]">{selectedOrg?.full_name}</h4>
                        </div>
                        {success ? (
                            <div className="flex items-center gap-2 text-green-600 font-black text-lg animate-in fade-in zoom-in-95">
                                <CheckCircle2 className="size-6" /> Donation Processed! Redirecting...
                            </div>
                        ) : (
                            <button
                                onClick={handleSubmitDonation}
                                disabled={isSubmitting || !selectedOrg}
                                className="w-full sm:w-auto bg-[#304674] text-white px-8 py-3.5 rounded-full text-lg font-black shadow-[0_8px_30px_rgba(48,70,116,0.25)] hover:bg-[#1e2e4f] hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-3 border-[3px] border-white disabled:opacity-50"
                            >
                                {isSubmitting ? 'Processing...' : 'Match & Contact'} <ArrowRight className="size-5" />
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}