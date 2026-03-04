"use client"
import React, { useState } from 'react'
import Link from 'next/link'
import { signup } from '@/lib/auth-actions'

const RegisterPage = () => {
    const [userType, setUserType] = useState<'donor' | 'organization'>('donor');

    return (
        <div className="relative min-h-screen bg-[url('/login_sign_up_BG.png')] bg-cover bg-center flex">
            {/* Left side spacer */}
            <div className="w-1/2 flex items-center justify-center px-10">
                <div className="bg-white rounded-3xl w-full h-[80%] opacity-20 border border-white/30 backdrop-blur-sm">
                </div>
            </div>

            {/* Right side form */}
            <div className="w-1/2 flex flex-col px-16 pt-10">
                <div>
                    <Link href="/">
                        <h1 className="text-white font-['Inter'] text-5xl font-black mb-4 hover:text-[#647BD0] transition-all duration-300">RePurpose</h1>
                    </Link>
                    <hr className="border-white/40" />
                </div>

                <div className="flex flex-col justify-center pt-8">
                    <h2 className="text-white font-['Inter'] text-4xl font-bold mb-4">Create Account</h2>
                    <p className="text-white/80 mb-6 italic">Join us as a donor or an organization to start making a difference.</p>

                    {/* Role Selection Tabs */}
                    <div className="flex gap-4 mb-8">
                        <button
                            type="button"
                            onClick={() => setUserType('donor')}
                            className={`flex-1 py-3 rounded-xl font-bold transition-all duration-300 flex items-center justify-center gap-2 ${userType === 'donor' ? 'bg-[#647BD0] text-white shadow-lg shadow-[#647BD0]/30 scale-105' : 'bg-white/10 text-white/70 hover:bg-white/20 border border-white/10'}`}
                        >
                            <span className="text-xl">🤝</span> Donor
                        </button>
                        <button
                            type="button"
                            onClick={() => setUserType('organization')}
                            className={`flex-1 py-3 rounded-xl font-bold transition-all duration-300 flex items-center justify-center gap-2 ${userType === 'organization' ? 'bg-[#647BD0] text-white shadow-lg shadow-[#647BD0]/30 scale-105' : 'bg-white/10 text-white/70 hover:bg-white/20 border border-white/10'}`}
                        >
                            <span className="text-xl">🏢</span> Organization
                        </button>
                    </div>

                    <form action={signup} className="flex flex-col">
                        <input type="hidden" name="user-type" value={userType} />

                        <label className="text-white font-['Inter'] mb-2 text-sm font-medium">Full Name / Org Name</label>
                        <input
                            name="full-name"
                            type="text"
                            required
                            placeholder={userType === 'donor' ? "Enter your full name" : "Enter organization name"}
                            className="bg-white/10 border border-white/20 text-white placeholder-white/50 rounded-lg px-4 py-3 mb-4 outline-none focus:border-[#647BD0] transition-colors"
                        />

                        <label className="text-white font-['Inter'] mb-2 text-sm font-medium">Email Address</label>
                        <input
                            name="email"
                            type="email"
                            required
                            placeholder="example@repurpose.com"
                            className="bg-white/10 border border-white/20 text-white placeholder-white/50 rounded-lg px-4 py-3 mb-4 outline-none focus:border-[#647BD0] transition-colors"
                        />

                        <label className="text-white font-['Inter'] mb-2 text-sm font-medium">Password</label>
                        <input
                            name="password"
                            type="password"
                            required
                            placeholder="••••••••"
                            className="bg-white/10 border border-white/20 text-white placeholder-white/50 rounded-lg px-4 py-3 mb-8 outline-none focus:border-[#647BD0] transition-colors"
                        />

                        <button type="submit" className="bg-[#647BD0] text-white font-['Inter'] text-xl font-bold py-4 rounded-lg hover:bg-[#4f63b0] transition-all duration-300 transform hover:scale-[1.02] active:scale-95 shadow-xl shadow-blue-900/20">
                            Sign up as {userType === 'donor' ? 'Donor' : 'Organization'}
                        </button>
                    </form>

                    <p className="text-white mt-6 text-center text-sm">
                        Already have an account?{' '}
                        <Link href="/login" className="font-bold underline hover:text-[#647BD0] transition-colors">
                            Login here
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    )
}

export default RegisterPage
