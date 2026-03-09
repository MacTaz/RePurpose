"use client"
import React, { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { createClient } from '@/utils/supabase/client'
import { setupProfile } from '@/lib/auth-actions'
import VideoPanel from '@/components/VideoPanel'
import { useRouter, useSearchParams } from 'next/navigation'

// ── PH phone validator: 10 digits, must start with 9 ─────────────────────
const isValidPHPhone = (v: string) => {
    const d = v.replace(/\D/g, '');
    return d.length === 10 && d.startsWith('9');
};

// ── Eye icon ──────────────────────────────────────────────────────────────
const EyeIcon = ({ open }: { open: boolean }) => open ? (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
    </svg>
) : (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
    </svg>
);

// ── Password input with show/hide toggle ──────────────────────────────────
const PasswordInput = ({ value, onChange, placeholder, className }: {
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    placeholder: string;
    className: string;
}) => {
    const [show, setShow] = useState(false);
    return (
        <div className="relative">
            <input value={value} onChange={onChange} required
                type={show ? 'text' : 'password'}
                placeholder={placeholder}
                className={`${className} pr-12`} />
            <button type="button" onClick={() => setShow(s => !s)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-white/50 hover:text-white transition-colors duration-200">
                <EyeIcon open={show} />
            </button>
        </div>
    );
};

// ── Main Page ─────────────────────────────────────────────────────────────
const RegisterPage = () => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const supabase = createClient();

    const isOAuth = searchParams.get('oauth') === 'true';
    const oauthEmail = searchParams.get('email') ?? '';
    const queryStep = searchParams.get('step');
    const resumeStep2 = queryStep === '2';
    const finalizeStep = queryStep === '1' || isOAuth;

    // steps: 0 = email only, 'pending' = check email, 1 = finalize (name/pass/role), 2 = profile (phone/bio)
    const [step, setStep] = useState<0 | 1 | 2 | 'pending'>(
        resumeStep2 ? 2 : (finalizeStep ? 1 : 0)
    );
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Step 1
    const [userType, setUserType] = useState<'donor' | 'organization'>('donor');
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState(oauthEmail);
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    // Step 2
    const [phone, setPhone] = useState('');
    const [bio, setBio] = useState('');
    const [description, setDescription] = useState('');
    const [donationMethod, setDonationMethod] = useState<'pickup' | 'delivery' | 'both'>('both');
    const [profilePic, setProfilePic] = useState<string | null>(null);
    const [profileFile, setProfileFile] = useState<File | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (finalizeStep || resumeStep2) {
            supabase.auth.getUser().then(({ data: { user } }) => {
                if (user) {
                    if (user.email) setEmail(user.email);
                    if (user.user_metadata?.full_name) setFullName(user.user_metadata.full_name);
                    if (user.user_metadata?.role) setUserType(user.user_metadata.role);
                }
            });
        }
    }, [finalizeStep, resumeStep2]);

    const isDonor = userType === 'donor';
    const bgColor = isDonor ? 'bg-[#2D3561]' : 'bg-[#c9621a]';
    const accentBg = isDonor ? 'bg-[#647BD0]' : 'bg-[#FF9248]';
    const accentShadow = isDonor ? 'shadow-[#647BD0]/30' : 'shadow-[#FF9248]/30';
    const accentHover = isDonor ? 'hover:text-[#647BD0]' : 'hover:text-[#FF9248]';
    const accentFocus = isDonor ? 'focus:border-[#647BD0]' : 'focus:border-[#FF9248]';

    const inputClass = `w-full bg-white/20 text-white placeholder-white/70 rounded-lg px-4 py-3 outline-none ${accentFocus} transition-colors duration-300`;

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setProfileFile(file);
            const reader = new FileReader();
            reader.onloadend = () => setProfilePic(reader.result as string);
            reader.readAsDataURL(file);
        }
    };

    const handleStep0 = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const { error: otpError } = await supabase.auth.signInWithOtp({
                email,
                options: {
                    emailRedirectTo: `${window.location.origin}/auth/confirm`,
                    shouldCreateUser: true
                }
            });
            if (otpError) throw otpError;
            setStep('pending');
        } catch (err: any) {
            setError(err.message || 'An error occurred. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleStep1 = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        if (password !== confirmPassword) { setError('Passwords do not match.'); return; }
        setLoading(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error("No user session found. Please try logging in or verifying your email again.");

            const { error: updateError } = await supabase.auth.updateUser({
                password,
                data: {
                    full_name: fullName,
                    role: userType,
                    identity_confirmed: true
                }
            });
            if (updateError) throw updateError;
            setStep(2);
        } catch (err: any) {
            setError(err.message || 'An error occurred during account finalization');
        } finally {
            setLoading(false);
        }
    };

    const handleResendEmail = async () => {
        setError('');
        setLoading(true);
        try {
            const { error } = await supabase.auth.resend({
                type: 'signup',
                email,
                options: {
                    emailRedirectTo: `${window.location.origin}/auth/confirm`,
                },
            });
            if (error) throw error;
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleStep2 = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!isValidPHPhone(phone)) {
            setError('Please enter a valid PH mobile number (10 digits starting with 9).');
            return;
        }
        setLoading(true);
        setError('');
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('No authenticated user found.');

            let finalProfilePicUrl: string | null = profilePic?.startsWith('http') ? profilePic : null;
            if (profileFile) {
                const fileExt = profileFile.name.split('.').pop();
                const filePath = `${user.id}/avatar.${fileExt}`;
                const { error: uploadError } = await supabase.storage
                    .from('avatars').upload(filePath, profileFile, { upsert: true });
                if (uploadError) throw uploadError;
                const { data: urlData } = supabase.storage.from('avatars').getPublicUrl(filePath);
                finalProfilePicUrl = urlData.publicUrl;
            }

            const result = await setupProfile({
                name: fullName,
                phone: `+63 ${phone}`,
                role: userType,
                bio, description, donationMethod,
                profilePicUrl: finalProfilePicUrl,
            });

            if (result?.error) throw new Error(result.error);

            router.push('/home');
            router.refresh();
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const RoleTabs = () => (
        <div className="flex gap-3 mb-7 p-1 bg-white/10 rounded-2xl border border-white/10">
            <button type="button" onClick={() => setUserType('donor')}
                className={`flex-1 py-3 rounded-xl font-bold text-sm tracking-wide transition-all duration-300 flex items-center justify-center gap-2
                    ${isDonor ? `${accentBg} text-white shadow-lg ${accentShadow} scale-[1.02]` : 'text-white/50 hover:text-white/80'}`}>
                🤝 Donor
            </button>
            <button type="button" onClick={() => setUserType('organization')}
                className={`flex-1 py-3 rounded-xl font-bold text-sm tracking-wide transition-all duration-300 flex items-center justify-center gap-2
                    ${!isDonor ? `${accentBg} text-white shadow-lg ${accentShadow} scale-[1.02]` : 'text-white/50 hover:text-white/80'}`}>
                🏢 Organization
            </button>
        </div>
    );

    const phoneDigits = phone.replace(/\D/g, '');
    const phoneValid = isValidPHPhone(phone);
    const phoneTouched = phone.length > 0;
    const phoneRingClass = phoneTouched ? (phoneValid ? 'ring-1 ring-green-400/60' : 'ring-1 ring-red-400/60') : '';

    return (
        <div className={`relative h-screen overflow-hidden ${bgColor} transition-colors duration-700 flex flex-col lg:flex-row`}>
            {/* Wave background */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <svg className="absolute w-full h-full top-0 left-0 opacity-70" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 900">
                    <path fill="white" fillOpacity="0.04" d="M0 0 L1200 0 C1100 250, 1000 400, 800 550 C600 700, 400 850, 0 900 Z" />
                    <path fill="white" fillOpacity="0.06" d="M0 0 L900 0 C800 200, 750 400, 600 550 C450 700, 250 800, 0 850 Z" />
                    <path fill="white" fillOpacity="0.08" d="M0 0 L600 0 C550 150, 450 300, 350 450 C250 600, 150 700, 0 750 Z" />
                    <path fill="white" fillOpacity="0.1" d="M0 0 L300 0 C250 100, 200 200, 150 300 C100 400, 50 500, 0 550 Z" />
                    <path fill="white" fillOpacity="0.15" d="M0 0 L100 0 C80 50, 60 100, 40 150 C20 200, 10 250, 0 300 Z" />
                    <path fill="white" fillOpacity="0.04" d="M 1440 900 L 240 900 C 340 650, 440 500, 640 350 C 840 200, 1040 50, 1440 0 Z" />
                    <path fill="white" fillOpacity="0.06" d="M 1440 900 L 540 900 C 640 700, 690 500, 840 350 C 990 200, 1190 100, 1440 50 Z" />
                    <path fill="white" fillOpacity="0.08" d="M 1440 900 L 840 900 C 890 750, 990 600, 1090 450 C 1190 300, 1290 200, 1440 150 Z" />
                    <path fill="white" fillOpacity="0.1" d="M 1440 900 L 1140 900 C 1190 800, 1240 700, 1290 600 C 1340 500, 1390 400, 1440 350 Z" />
                    <path fill="white" fillOpacity="0.15" d="M 1440 900 L 1340 900 C 1360 850, 1380 800, 1400 750 C 1420 700, 1430 650, 1440 600 Z" />
                </svg>
            </div>

            <VideoPanel />

            {/* Right form */}
            <div className="relative z-10 w-full lg:w-1/2 h-full flex flex-col px-5 sm:px-10 lg:px-16 pt-8 lg:pt-10 pb-10 overflow-y-auto">

                {/* Logo */}
                <div className="mb-8">
                    <Link href="/">
                        <h1 className={`text-white font-['Inter'] font-black text-4xl lg:text-5xl mb-4 ${accentHover} transition-all duration-300`}>
                            RePurpose
                        </h1>
                    </Link>
                    <hr className="border-white/40" />
                </div>

                {/* Step indicator — Hidden for step 0 and pendng */}
                {step !== 0 && step !== 'pending' && !resumeStep2 && (
                    <div className="flex items-center gap-3 mb-8">
                        <div className={`flex items-center justify-center w-8 h-8 rounded-full text-xs font-black transition-all duration-500 ${step >= 1 ? `${accentBg} text-white` : 'bg-white/10 text-white/40'}`}>1</div>
                        <div className={`flex-1 h-[2px] rounded-full transition-all duration-700 ${accentBg} ${step === 2 ? 'opacity-100' : 'opacity-20'}`} />
                        <div className={`flex items-center justify-center w-8 h-8 rounded-full text-xs font-black transition-all duration-500 ${step === 2 ? `${accentBg} text-white` : 'bg-white/10 text-white/40'}`}>2</div>
                        <div className="flex-1 h-[2px] rounded-full bg-white/20" />
                        <span className="text-white/30 text-[10px] font-black uppercase tracking-widest">Done</span>
                    </div>
                )}

                {/* ── STEP 0: Email Only ── */}
                {step === 0 && (
                    <div className="animate-in fade-in slide-in-from-right-4 duration-500">
                        <h2 className="text-white font-['Inter'] text-2xl lg:text-4xl font-bold mb-6 text-center lg:text-left">Get Started</h2>
                        <form onSubmit={handleStep0} className="flex flex-col">
                            <label className="text-white font-['Inter'] mb-2">Email Address</label>
                            <input
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                required
                                type="email"
                                placeholder="name@example.com"
                                className={`${inputClass} mb-6`} />

                            {error && <p className="text-red-300 text-sm mb-4 font-semibold italic">⚠️ {error}</p>}

                            <button type="submit" disabled={loading}
                                className={`w-full ${accentBg} text-white font-['Inter'] text-xl font-bold py-3 rounded-lg hover:brightness-110 shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed`}>
                                {loading ? (
                                    <span className="flex items-center justify-center gap-2">
                                        <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        Sending Link...
                                    </span>
                                ) : 'Send Verification Link'}
                            </button>
                        </form>

                        <p className="text-white mt-4 text-sm">
                            Already have an account?{' '}
                            <Link href="/login" className={`font-bold italic ${accentHover} transition-colors`}>Login here</Link>
                        </p>
                    </div>
                )}

                {/* ── PENDING: Check Email ── */}
                {step === 'pending' && (
                    <div className="animate-in fade-in slide-in-from-right-4 duration-500 text-center lg:text-left py-10">
                        <div className={`w-20 h-20 ${accentBg} rounded-[2rem] flex items-center justify-center mb-8 mx-auto lg:mx-0 shadow-2xl animate-bounce`}>
                            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                        </div>
                        <h2 className="text-white font-['Inter'] text-4xl font-bold mb-4">Check Your Email</h2>
                        <p className="text-white/70 text-lg mb-8 max-w-md leading-relaxed font-medium">
                            We've sent a secure verification link to <span className="text-white font-black underline decoration-[#FF9248] underline-offset-4">{email}</span>. Click it to finalize your account.
                        </p>
                        <div className="flex flex-col lg:flex-row gap-4">
                            <button
                                onClick={() => setStep(0)}
                                className="px-8 py-3 rounded-xl border border-white/20 text-white font-bold hover:bg-white/10 transition-all text-sm">
                                ← Change Email
                            </button>
                            <button
                                onClick={handleResendEmail}
                                disabled={loading}
                                className={`px-8 py-3 rounded-xl bg-white/10 text-white font-bold hover:bg-white/20 transition-all text-sm ${loading ? 'opacity-50' : ''}`}>
                                {loading ? 'Sending...' : 'Resend Link'}
                            </button>
                        </div>
                        {error && <p className="text-red-300 text-sm mt-6 font-black italic">⚠️ {error}</p>}
                    </div>
                )}

                {/* ── STEP 1: Finalize Account ── */}
                {step === 1 && (
                    <div className="animate-in fade-in slide-in-from-right-4 duration-500">
                        <h2 className="text-white font-['Inter'] text-2xl lg:text-4xl font-bold mb-6">Finalize Account</h2>
                        <RoleTabs />

                        <form onSubmit={handleStep1} className="flex flex-col">
                            <label className="text-white font-['Inter'] mb-2">{isDonor ? 'Full Name' : 'Organization Name'}</label>
                            <input value={fullName} onChange={e => setFullName(e.target.value)} required type="text"
                                placeholder={isDonor ? 'Enter your name' : 'Enter org name'}
                                className={`${inputClass} mb-4`} />

                            <label className="text-white font-['Inter'] mb-2">Email</label>
                            <input value={email} readOnly type="email"
                                className={`w-full bg-white/10 text-white/50 rounded-lg px-4 py-3 outline-none cursor-not-allowed mb-4`} />

                            <label className="text-white font-['Inter'] mb-2">Password</label>
                            <div className="mb-4">
                                <PasswordInput value={password} onChange={e => setPassword(e.target.value)}
                                    placeholder="Enter your password" className={inputClass} />
                            </div>

                            <label className="text-white font-['Inter'] mb-2">Confirm Password</label>
                            <input value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)}
                                required type="password" placeholder="Re-enter your password"
                                className={`${inputClass} ${confirmPassword && password !== confirmPassword ? 'ring-1 ring-red-400/60' : confirmPassword && password === confirmPassword ? 'ring-1 ring-green-400/60' : ''}`} />

                            {error && <p className="text-red-300 text-sm mt-2 mb-2">⚠️ {error}</p>}

                            <button type="submit" disabled={loading}
                                className={`mt-4 w-full ${accentBg} text-white font-['Inter'] text-xl font-bold py-3 rounded-lg hover:brightness-110 transition-all duration-300 disabled:opacity-50`}>
                                {loading ? 'Processing...' : 'Continue →'}
                            </button>
                        </form>
                    </div>
                )}

                {/* ── STEP 2: Complete Profile ── */}
                {step === 2 && (
                    <div className="animate-in fade-in slide-in-from-right-4 duration-500">
                        <h2 className="text-white font-['Inter'] text-2xl lg:text-4xl font-bold mb-6">Complete Profile</h2>

                        <form onSubmit={handleStep2} className="flex flex-col">
                            {/* Profile picture */}
                            <div className="flex flex-col items-center mb-10">
                                <div onClick={() => fileInputRef.current?.click()}
                                    className={`w-32 h-32 rounded-[3rem] border-4 border-dashed border-white/30 flex items-center justify-center cursor-pointer transition-all duration-500 overflow-hidden relative group shadow-inner hover:border-white/50 hover:bg-white/5`}>
                                    {profilePic ? (
                                        <img src={profilePic} alt="Profile" className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="text-white/30 flex flex-col items-center">
                                            <svg className="w-12 h-12 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                            </svg>
                                            <span className="text-xs font-bold">Choose Image</span>
                                        </div>
                                    )}
                                </div>
                                <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />
                                <span className="mt-2 text-white/30 text-xs font-medium">{profilePic ? 'Tap to change' : 'Avatar Recommended'}</span>
                            </div>

                            {/* PH Phone */}
                            <label className="text-white font-['Inter'] mb-2">Contact Number</label>
                            <div className={`flex rounded-lg overflow-hidden bg-white/20 mb-1 ${phoneRingClass}`}>
                                <span className="flex items-center gap-1.5 px-3 py-3 bg-white/10 border-r border-white/20 text-white font-medium text-sm select-none">
                                    🇵🇭 +63
                                </span>
                                <input
                                    type="tel" value={phone} required
                                    onChange={e => setPhone(e.target.value.replace(/[^\d]/g, ''))}
                                    placeholder="9XX XXX XXXX"
                                    maxLength={10}
                                    className="flex-1 bg-transparent text-white placeholder-white/40 px-4 py-3 outline-none text-sm font-medium"
                                />
                            </div>
                            {phoneTouched && (
                                <p className={`text-xs font-semibold mb-4 ml-1 ${phoneValid ? 'text-green-300' : 'text-red-300'}`}>
                                    {phoneValid ? '✓ Valid Number' : 'Invalid Format'}
                                </p>
                            )}
                            {!phoneTouched && <div className="mb-4" />}

                            {/* Role fields */}
                            {isDonor ? (
                                <div className="space-y-4">
                                    <label className="text-white font-['Inter'] mb-2">Bio</label>
                                    <textarea value={bio} onChange={e => setBio(e.target.value)}
                                        placeholder="Describe yourself briefly..."
                                        rows={3} className={`${inputClass} resize-none mb-4`} />
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    <label className="text-white font-['Inter'] mb-2">Organization Mission</label>
                                    <textarea value={description} onChange={e => setDescription(e.target.value)}
                                        placeholder="What is your organization's focus?"
                                        rows={3} className={`${inputClass} resize-none mb-4`} />

                                    <label className="text-white font-['Inter'] mb-2">Donation Preference</label>
                                    <div className="flex gap-2 p-1 bg-white/20 rounded-lg mb-4">
                                        {(['pickup', 'delivery', 'both'] as const).map(method => (
                                            <button key={method} type="button" onClick={() => setDonationMethod(method)}
                                                className={`flex-1 py-2.5 rounded-md text-sm font-bold capitalize transition-all duration-300
                                                    ${donationMethod === method ? `${accentBg} text-white shadow-md` : 'text-white/60 hover:text-white'}`}>
                                                {method}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {error && <p className="text-red-300 text-sm mb-4 font-semibold italic">⚠️ {error}</p>}

                            <button type="submit" disabled={loading}
                                className={`w-full ${accentBg} text-white font-['Inter'] text-xl font-bold py-3 rounded-lg hover:brightness-110 shadow-xl transition-all duration-300 disabled:opacity-50`}>
                                {loading ? 'Finalizing...' : 'Finish Registration'}
                            </button>
                        </form>
                    </div>
                )}
            </div>
        </div>
    );
};

export default RegisterPage;
