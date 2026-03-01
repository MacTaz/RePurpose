"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { setupProfile } from "@/lib/auth-actions";

export default function SetupPage() {
    const [role, setRole] = useState<"donor" | "organization">("donor");
    const [name, setName] = useState("");
    const [number, setNumber] = useState("");
    const [bio, setBio] = useState("");
    const [description, setDescription] = useState("");
    const [donationMethod, setDonationMethod] = useState<"pickup" | "delivery" | "both">("both");
    const [profilePic, setProfilePic] = useState<string | null>(null);
    const [profileFile, setProfileFile] = useState<File | null>(null);
    const [loading, setLoading] = useState(false);

    const fileInputRef = useRef<HTMLInputElement>(null);
    const router = useRouter();
    const supabase = createClient();

    // Pre-fill from Google/Facebook metadata
    useEffect(() => {
        async function fetchInitialData() {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                if (user.user_metadata?.full_name) setName(user.user_metadata.full_name);
                if (user.user_metadata?.avatar_url) setProfilePic(user.user_metadata.avatar_url);
                if (user.user_metadata?.role) setRole(user.user_metadata.role);
            }
        }
        fetchInitialData();
    }, [supabase]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setProfileFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setProfilePic(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error("No authenticated user found.");

            // 1. Upload avatar client-side (File objects can't be passed to server actions)
            let finalProfilePicUrl: string | null = profilePic?.startsWith('http') ? profilePic : null;

            if (profileFile) {
                const fileExt = profileFile.name.split('.').pop();
                // Path must be {userId}/avatar.{fileExt} so storage RLS foldername() check matches
                const filePath = `${user.id}/avatar.${fileExt}`;

                const { error: uploadError } = await supabase.storage
                    .from('avatars')
                    .upload(filePath, profileFile, { upsert: true });

                if (uploadError) throw uploadError;

                const { data: urlData } = supabase.storage
                    .from('avatars')
                    .getPublicUrl(filePath);

                finalProfilePicUrl = urlData.publicUrl;
            }

            // 2. All DB writes go through the server action (cookie-authenticated, always passes RLS)
            const result = await setupProfile({
                name,
                phone: number,
                role,
                bio,
                description,
                donationMethod,
                profilePicUrl: finalProfilePicUrl,
            });

            if (result?.error) throw new Error(result.error);

            router.push('/home');
            router.refresh();
        } catch (error: any) {
            console.error("Setup error:", error.message);
            alert("Error saving profile: " + error.message);
        } finally {
            setLoading(false);
        }
    };

    const bgColor = role === "donor" ? "bg-[#647BD0]" : "bg-[#FF9248]";
    const accentColor = role === "donor" ? "text-[#647BD0]" : "text-[#FF9248]";
    const buttonColor = role === "donor" ? "bg-[#647BD0]" : "bg-[#FF9248]";
    const shadowColor = role === "donor" ? "shadow-[#647BD0]/20" : "shadow-[#FF9248]/20";

    return (
        <div className={`min-h-screen ${bgColor} transition-all duration-1000 ease-in-out flex items-center justify-center p-4 md:p-10 font-inter`}>
            {/* Topographic Wave Background */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <svg className="absolute w-[200%] md:w-full h-[200%] md:h-full object-cover top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-70" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 900">
                    <rect width="1440" height="900" fill="black" fillOpacity="0.3" />

                    {/* Top Left Waves */}
                    <path fill="white" fillOpacity="0.04" d="M0 0 L1200 0 C1100 250, 1000 400, 800 550 C600 700, 400 850, 0 900 Z" />
                    <path fill="white" fillOpacity="0.06" d="M0 0 L900 0 C800 200, 750 400, 600 550 C450 700, 250 800, 0 850 Z" />
                    <path fill="white" fillOpacity="0.08" d="M0 0 L600 0 C550 150, 450 300, 350 450 C250 600, 150 700, 0 750 Z" />
                    <path fill="white" fillOpacity="0.1" d="M0 0 L300 0 C250 100, 200 200, 150 300 C100 400, 50 500, 0 550 Z" />
                    <path fill="white" fillOpacity="0.15" d="M0 0 L100 0 C80 50, 60 100, 40 150 C20 200, 10 250, 0 300 Z" />

                    {/* Bottom Right Waves */}
                    <path fill="white" fillOpacity="0.04" d="M 1440 900 L 240 900 C 340 650, 440 500, 640 350 C 840 200, 1040 50, 1440 0 Z" />
                    <path fill="white" fillOpacity="0.06" d="M 1440 900 L 540 900 C 640 700, 690 500, 840 350 C 990 200, 1190 100, 1440 50 Z" />
                    <path fill="white" fillOpacity="0.08" d="M 1440 900 L 840 900 C 890 750, 990 600, 1090 450 C 1190 300, 1290 200, 1440 150 Z" />
                    <path fill="white" fillOpacity="0.1" d="M 1440 900 L 1140 900 C 1190 800, 1240 700, 1290 600 C 1340 500, 1390 400, 1440 350 Z" />
                    <path fill="white" fillOpacity="0.15" d="M 1440 900 L 1340 900 C 1360 850, 1380 800, 1400 750 C 1420 700, 1430 650, 1440 600 Z" />
                </svg>
            </div>

            <div className={`relative z-10 bg-white/95 backdrop-blur-sm rounded-[2.5rem] shadow-2xl ${shadowColor} w-full max-w-4xl overflow-hidden flex flex-col md:flex-row transition-all duration-500`}>

                {/* Left Side: Dynamic Welcome Sidebar */}
                <div className={`md:w-5/12 p-10 md:p-12 flex flex-col justify-between items-center text-white transition-all duration-1000 ${bgColor} relative overflow-hidden`}>
                    {/* Subtle pattern overlay */}
                    <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '24px 24px' }}></div>

                    <div className="relative z-10 flex flex-col items-center">
                        <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mb-8 backdrop-blur-md">
                            <span className="text-2xl font-black italic">R</span>
                        </div>
                        <h1 className="text-4xl font-black mb-6 text-center leading-[1.1]">Complete Your Profile</h1>
                        <p className="text-center text-base font-medium opacity-80 leading-relaxed max-w-xs">
                            {role === "donor"
                                ? "Start your journey of giving and make an impact in your community today."
                                : "Register your organization to begin receiving donations and managing requests."}
                        </p>
                    </div>

                    <div className="relative z-10 mt-12 w-full space-y-3">
                        <button
                            onClick={() => setRole("donor")}
                            className={`w-full py-4 px-6 rounded-2xl border-2 transition-all duration-500 font-black tracking-wide text-sm flex items-center justify-between ${role === "donor" ? "bg-white text-[#647BD0] border-white shadow-lg translate-x-1" : "border-white/20 hover:border-white/50 text-white/70"}`}
                        >
                            DONOR
                            {role === "donor" && <div className="w-2 h-2 rounded-full bg-[#647BD0] animate-ping"></div>}
                        </button>
                        <button
                            onClick={() => setRole("organization")}
                            className={`w-full py-4 px-6 rounded-2xl border-2 transition-all duration-500 font-black tracking-wide text-sm flex items-center justify-between ${role === "organization" ? "bg-white text-[#FF9248] border-white shadow-lg translate-x-1" : "border-white/20 hover:border-white/50 text-white/70"}`}
                        >
                            ORGANIZATION
                            {role === "organization" && <div className="w-2 h-2 rounded-full bg-[#FF9248] animate-ping"></div>}
                        </button>
                    </div>
                </div>

                {/* Right Side: Clean Modern Form */}
                <form onSubmit={handleSubmit} className="md:w-7/12 p-8 md:p-14 bg-white flex flex-col">
                    <div className="flex flex-col items-center mb-10 group">
                        <div
                            onClick={() => fileInputRef.current?.click()}
                            className={`w-32 h-32 rounded-full border-4 border-dashed border-gray-100 flex items-center justify-center cursor-pointer transition-all duration-500 overflow-hidden relative group shadow-inner ${role === "donor" ? "hover:border-[#647BD0]/30" : "hover:border-[#FF9248]/30"}`}
                        >
                            {profilePic ? (
                                <img src={profilePic} alt="Profile" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                            ) : (
                                <div className="text-gray-300 flex flex-col items-center group-hover:text-gray-400 transition-colors">
                                    <svg className="w-10 h-10 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                    <span className="text-[10px] font-black tracking-widest uppercase">Add Photo</span>
                                </div>
                            )}
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px]">
                                <span className="text-white text-xs font-black tracking-tighter">CHANGE</span>
                            </div>
                        </div>
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleFileChange}
                            className="hidden"
                            accept="image/*"
                        />
                    </div>

                    <div className="space-y-6 flex-1">
                        <div className="relative">
                            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2 ml-1">Display Name</label>
                            <input
                                required
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="How should we call you?"
                                className="w-full px-5 py-4 rounded-2xl bg-gray-50/50 border border-gray-100 focus:bg-white focus:border-gray-200 focus:ring-4 focus:ring-gray-100/30 outline-none transition-all font-semibold text-gray-700 placeholder:text-gray-300"
                            />
                        </div>

                        <div className="relative">
                            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2 ml-1">Contact Number</label>
                            <input
                                required
                                type="tel"
                                value={number}
                                onChange={(e) => setNumber(e.target.value)}
                                placeholder="+63 900 000 0000"
                                className="w-full px-5 py-4 rounded-2xl bg-gray-50/50 border border-gray-100 focus:bg-white focus:border-gray-200 focus:ring-4 focus:ring-gray-100/30 outline-none transition-all font-semibold text-gray-700 placeholder:text-gray-300"
                            />
                        </div>

                        <div className="transition-all duration-500 ease-in-out">
                            {role === "donor" ? (
                                <div className="animate-in fade-in slide-in-from-bottom-2 duration-700">
                                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2 ml-1">Bio</label>
                                    <textarea
                                        value={bio}
                                        onChange={(e) => setBio(e.target.value)}
                                        placeholder="Short description for your profile..."
                                        rows={3}
                                        className="w-full px-5 py-4 rounded-2xl bg-gray-50/50 border border-gray-100 focus:bg-white focus:border-gray-200 focus:ring-4 focus:ring-gray-100/30 outline-none transition-all font-semibold text-gray-700 placeholder:text-gray-300 resize-none"
                                    />
                                </div>
                            ) : (
                                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-700">
                                    <div>
                                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2 ml-1">Organization Details</label>
                                        <textarea
                                            value={description}
                                            onChange={(e) => setDescription(e.target.value)}
                                            placeholder="What is your organization's mission?"
                                            rows={3}
                                            className="w-full px-5 py-4 rounded-2xl bg-gray-50/50 border border-gray-100 focus:bg-white focus:border-gray-200 focus:ring-4 focus:ring-gray-100/30 outline-none transition-all font-semibold text-gray-700 placeholder:text-gray-300 resize-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-3 ml-1">Donation Capability</label>
                                        <div className="flex gap-2 p-1 bg-gray-50/80 rounded-2xl border border-gray-100">
                                            {["pickup", "delivery", "both"].map((method) => (
                                                <button
                                                    key={method}
                                                    type="button"
                                                    onClick={() => setDonationMethod(method as any)}
                                                    className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${donationMethod === method ? `${buttonColor} text-white shadow-md` : "text-gray-400 hover:text-gray-600"}`}
                                                >
                                                    {method}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className={`w-full py-5 ${buttonColor} text-white rounded-[1.5rem] font-black text-lg tracking-wider shadow-xl ${shadowColor} hover:brightness-110 hover:-translate-y-1 active:translate-y-0 active:scale-[0.98] transition-all duration-300 mt-6 uppercase disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none`}
                        >
                            {loading ? (
                                <div className="flex items-center justify-center gap-2">
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                    <span>Saving...</span>
                                </div>
                            ) : "Complete Setup"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
