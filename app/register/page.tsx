"use client"
import React, { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { createClient } from '@/utils/supabase/client'
import { setupProfile } from '@/lib/auth-actions'
import { useRouter, useSearchParams } from 'next/navigation'

// ── PH phone validator: 10 digits, must start with 9 ──────────────────────
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
    // Redirected from login when setup_complete is false
    const resumeStep = searchParams.get('step') === '2';

    const [step, setStep] = useState<1 | 2>((isOAuth || resumeStep) ? 2 : 1);
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
        // Pre-fill from session for: OAuth users, incomplete-registration resumers
        if (isOAuth || resumeStep) {
            supabase.auth.getUser().then(({ data: { user } }) => {
                if (user?.email) setEmail(user.email);
                if (user?.user_metadata?.full_name) setFullName(user.user_metadata.full_name);
                if (user?.user_metadata?.avatar_url) setProfilePic(user.user_metadata.avatar_url);
            });
        }
    }, [isOAuth, resumeStep]);

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

    const handleStep1 = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        if (password !== confirmPassword) { setError('Passwords do not match.'); return; }
        setLoading(true);
        try {
            const { error: signUpError } = await supabase.auth.signUp({
                email, password,
                options: { data: { full_name: fullName, role: userType, email } },
            });
            if (signUpError) throw signUpError;
            setStep(2);
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
                className={`flex-1 py-3 rounded-xl font-black text-sm tracking-widest uppercase transition-all duration-300 flex items-center justify-center gap-2
                    ${isDonor ? `${accentBg} text-white shadow-lg ${accentShadow} scale-[1.02]` : 'text-white/50 hover:text-white/80'}`}>
                🤝 Donor
            </button>
            <button type="button" onClick={() => setUserType('organization')}
                className={`flex-1 py-3 rounded-xl font-black text-sm tracking-widest uppercase transition-all duration-300 flex items-center justify-center gap-2
                    ${!isDonor ? `${accentBg} text-white shadow-lg ${accentShadow} scale-[1.02]` : 'text-white/50 hover:text-white/80'}`}>
                🏢 Organization
            </button>
        </div>
    );

    // Phone field: strip non-digits, show validation
    const phoneDigits = phone.replace(/\D/g, '');
    const phoneValid = isValidPHPhone(phone);
    const phoneTouched = phone.length > 0;
    const phoneRingClass = phoneTouched ? (phoneValid ? 'ring-1 ring-green-400/60' : 'ring-1 ring-red-400/60') : '';

    return (
        <div className={`relative h-screen overflow-hidden ${bgColor} transition-colors duration-700 flex`}>
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

            {/* Left decorative panel */}
            <div className="hidden lg:flex w-1/2 h-full items-center justify-center px-10">
                <div className="bg-white rounded-3xl w-full h-4/5 opacity-10 border border-white/20 backdrop-blur-sm" />
            </div>

            {/* Right form — scrolls independently, background stays fixed */}
            <div className="relative z-10 w-full lg:w-1/2 h-full flex flex-col px-6 md:px-16 pt-10 pb-10 overflow-y-auto">

                {/* Logo */}
                <div className="mb-8">
                    <Link href="/">
                        <h1 className={`text-white font-['Inter'] font-black text-5xl mb-4 ${accentHover} transition-all duration-300`}>
                            RePurpose
                        </h1>
                    </Link>
                    <hr className="border-white/40" />
                </div>

                {/* Step indicator — hidden for OAuth and resume flows */}
                {!isOAuth && !resumeStep && (
                    <div className="flex items-center gap-3 mb-8">
                        <div className={`flex items-center justify-center w-8 h-8 rounded-full text-xs font-black transition-all duration-500 ${step >= 1 ? `${accentBg} text-white` : 'bg-white/10 text-white/40'}`}>1</div>
                        <div className={`flex-1 h-[2px] rounded-full transition-all duration-700 ${accentBg} ${step === 2 ? 'opacity-100' : 'opacity-20'}`} />
                        <div className={`flex items-center justify-center w-8 h-8 rounded-full text-xs font-black transition-all duration-500 ${step === 2 ? `${accentBg} text-white` : 'bg-white/10 text-white/40'}`}>2</div>
                        <div className="flex-1 h-[2px] rounded-full bg-white/20" />
                        <span className="text-white/30 text-[10px] font-black uppercase tracking-widest">Done</span>
                    </div>
                )}

                {/* ── STEP 1 ── */}
                {step === 1 && (
                    <div className="animate-in fade-in slide-in-from-right-4 duration-500">
                        <h2 className="text-white font-['Inter'] text-4xl font-bold mb-6">Create Account</h2>
                        <RoleTabs />

                        <form onSubmit={handleStep1} className="flex flex-col">
                            <label className="text-white font-['Inter'] mb-2">{isDonor ? 'Full Name' : 'Organization Name'}</label>
                            <input value={fullName} onChange={e => setFullName(e.target.value)} required type="text"
                                placeholder={isDonor ? 'Enter your full name' : 'Enter organization name'}
                                className={`${inputClass} mb-4`} />

                            <label className="text-white font-['Inter'] mb-2">Email</label>
                            <input value={email} onChange={e => setEmail(e.target.value)} required type="email"
                                placeholder="Enter your email" className={`${inputClass} mb-4`} />

                            <label className="text-white font-['Inter'] mb-2">Password</label>
                            <div className="mb-4">
                                <PasswordInput value={password} onChange={e => setPassword(e.target.value)}
                                    placeholder="Enter your password" className={inputClass} />
                            </div>

                            <label className="text-white font-['Inter'] mb-2">Confirm Password</label>
                            <input value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)}
                                required type="password" placeholder="Re-enter your password"
                                className={`${inputClass} ${confirmPassword && password !== confirmPassword ? 'ring-1 ring-red-400/60' : confirmPassword && password === confirmPassword ? 'ring-1 ring-green-400/60' : ''}`} />
                            {confirmPassword && password !== confirmPassword && (
                                <p className="text-red-300 text-xs font-semibold mt-1.5 mb-2 ml-1">Passwords do not match</p>
                            )}
                            {confirmPassword && password === confirmPassword && (
                                <p className="text-green-300 text-xs font-semibold mt-1.5 mb-2 ml-1">✓ Passwords match</p>
                            )}

                            {error && <p className="text-red-300 text-sm mt-2 mb-2">{error}</p>}

                            <button type="submit" disabled={loading}
                                className={`mt-4 w-full ${accentBg} text-white font-['Inter'] text-xl font-bold py-3 rounded-lg hover:brightness-110 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed`}>
                                {loading ? (
                                    <span className="flex items-center justify-center gap-2">
                                        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        Creating Account...
                                    </span>
                                ) : 'Continue →'}
                            </button>
                        </form>

                        <p className="text-white mt-4 text-sm">
                            Already have an account?{' '}
                            <Link href="/login" className={`font-bold italic ${accentHover}`}>Login here</Link>
                        </p>
                    </div>
                )}

                {/* ── STEP 2 ── */}
                {step === 2 && (
                    <div className="animate-in fade-in slide-in-from-right-4 duration-500">
                        <h2 className="text-white font-['Inter'] text-4xl font-bold mb-6">Complete Profile</h2>
                        {/* Show role tabs for OAuth and resume-step users (they skipped step 1) */}
                        {(isOAuth || resumeStep) && <RoleTabs />}

                        <form onSubmit={handleStep2} className="flex flex-col">
                            {/* Profile picture */}
                            <div className="flex flex-col items-center mb-6">
                                <div onClick={() => fileInputRef.current?.click()}
                                    className="w-24 h-24 rounded-full border-4 border-dashed border-white/30 flex items-center justify-center cursor-pointer transition-all duration-500 overflow-hidden relative group shadow-inner hover:border-white/50">
                                    {profilePic ? (
                                        <img src={profilePic} alt="Profile" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                                    ) : (
                                        <div className="text-white/40 flex flex-col items-center group-hover:text-white/60 transition-colors">
                                            <svg className="w-8 h-8 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                                            </svg>
                                            <span className="text-[9px] font-bold tracking-wide">Add Photo</span>
                                        </div>
                                    )}
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                        <span className="text-white text-xs font-bold">Change</span>
                                    </div>
                                </div>
                                <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />
                                <span className="mt-2 text-white/40 text-xs">{profilePic ? 'Click to change' : 'Optional'}</span>
                            </div>

                            {/* Full name */}
                            <label className="text-white font-['Inter'] mb-2">{isDonor ? 'Full Name' : 'Organization Name'}</label>
                            <input value={fullName} onChange={e => setFullName(e.target.value)} required type="text"
                                placeholder={isDonor ? 'Enter your full name' : 'Enter organization name'}
                                className={`${inputClass} mb-4`} />

                            {/* Email locked for OAuth or resume users */}
                            {(isOAuth || resumeStep) && (
                                <>
                                    <label className="text-white font-['Inter'] mb-2">Email <span className="text-white/40 text-sm font-normal">(from your account)</span></label>
                                    <input value={oauthEmail || email} readOnly type="email"
                                        className="w-full bg-white/10 text-white/50 rounded-lg px-4 py-3 outline-none cursor-not-allowed mb-4" />
                                </>
                            )}

                            {/* PH Phone */}
                            <label className="text-white font-['Inter'] mb-2">Contact Number</label>
                            <div className={`flex rounded-lg overflow-hidden bg-white/20 mb-1 ${phoneRingClass}`}>
                                <span className="flex items-center gap-1.5 px-3 py-3 bg-white/10 border-r border-white/20 text-white font-medium text-sm whitespace-nowrap select-none">
                                    🇵🇭 +63
                                </span>
                                <input
                                    type="tel" value={phone} required
                                    onChange={e => setPhone(e.target.value.replace(/[^\d\s]/g, ''))}
                                    placeholder="9XX XXX XXXX"
                                    maxLength={13}
                                    className="flex-1 bg-transparent text-white placeholder-white/40 px-4 py-3 outline-none text-sm font-medium"
                                />
                            </div>
                            {phoneTouched && (
                                <p className={`text-xs font-semibold mb-4 ml-1 ${phoneValid ? 'text-green-300' : 'text-red-300'}`}>
                                    {phoneValid
                                        ? '✓ Valid mobile number'
                                        : `Must be 10 digits starting with 9 (${phoneDigits.length}/10)`}
                                </p>
                            )}
                            {!phoneTouched && <div className="mb-4" />}

                            {/* Donor / Org fields */}
                            {isDonor ? (
                                <>
                                    <label className="text-white font-['Inter'] mb-2">Bio</label>
                                    <textarea value={bio} onChange={e => setBio(e.target.value)}
                                        placeholder="Short description for your profile..."
                                        rows={3} className={`${inputClass} resize-none mb-4`} />
                                </>
                            ) : (
                                <>
                                    <label className="text-white font-['Inter'] mb-2">Organization Details</label>
                                    <textarea value={description} onChange={e => setDescription(e.target.value)}
                                        placeholder="What is your organization's mission?"
                                        rows={3} className={`${inputClass} resize-none mb-4`} />

                                    <label className="text-white font-['Inter'] mb-2">Donation Capability</label>
                                    <div className="flex gap-2 p-1 bg-white/20 rounded-lg mb-4">
                                        {(['pickup', 'delivery', 'both'] as const).map(method => (
                                            <button key={method} type="button" onClick={() => setDonationMethod(method)}
                                                className={`flex-1 py-2.5 rounded-md text-sm font-bold capitalize transition-all duration-300
                                                    ${donationMethod === method ? `${accentBg} text-white shadow-md` : 'text-white/60 hover:text-white'}`}>
                                                {method}
                                            </button>
                                        ))}
                                    </div>
                                </>
                            )}

                            {error && <p className="text-red-300 text-sm mb-3">{error}</p>}

                            <div className="flex gap-3">
                                {/* Back button only for standard multi-step flow */}
                                {!isOAuth && !resumeStep && (
                                    <button type="button" onClick={() => { setStep(1); setError(''); }}
                                        className="flex-none px-6 py-3 rounded-lg border border-white/30 text-white font-bold hover:bg-white/10 transition-all duration-300">
                                        ← Back
                                    </button>
                                )}
                                <button type="submit" disabled={loading}
                                    className={`flex-1 ${accentBg} text-white font-['Inter'] text-xl font-bold py-3 rounded-lg hover:brightness-110 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed`}>
                                    {loading ? (
                                        <span className="flex items-center justify-center gap-2">
                                            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                            Setting up...
                                        </span>
                                    ) : 'Finish Setup'}
                                </button>
                            </div>
                        </form>
                    </div>
                )}
            </div>
        </div>
    );
};

export default RegisterPage;
