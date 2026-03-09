"use client";
import React, { useState } from 'react'
import Link from 'next/link'
import { login, signInWithGoogle, signInWithFacebook } from '@/lib/auth-actions'
import VideoPanel from '@/components/VideoPanel'

const page = () => {
    const [showPassword, setShowPassword] = useState(false);
    return (
        <div className="relative min-h-screen bg-[#2D3561] flex flex-col md:flex-row">
            {/* Topographic Wave Background */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <svg className="absolute w-[200%] md:w-full h-[200%] md:h-full object-cover top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-70" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 900">
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

            <VideoPanel />

            <div className="w-full md:w-1/2 flex flex-col px-8 md:px-16 py-10 z-10">

                <div className="text-center md:text-left">
                    <Link href="/">
                        <h1 className="text-white font-['Inter'] text-4xl md:text-5xl font-black mb-4 hover:text-[#647BD0] transition-all duration-300">RePurpose</h1>
                    </Link>
                    <hr className="border-white/40" />
                </div>

                <div className="flex flex-col justify-center pt-10 md:pt-17">
                    <h2 className="text-white font-['Inter'] text-3xl md:text-4xl font-bold mb-6 text-center md:text-left">Login</h2>
                    <div className="flex flex-col gap-4 mb-8">
                        <button
                            onClick={() => signInWithGoogle()}
                            className="group flex items-center justify-center gap-3 bg-white/10 hover:bg-white/20 border border-white/20 backdrop-blur-md text-white px-6 py-4 rounded-xl transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] shadow-xl"
                        >
                            <svg className="w-6 h-6" viewBox="0 0 24 24">
                                <path
                                    fill="currentColor"
                                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                />
                                <path
                                    fill="currentColor"
                                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                />
                                <path
                                    fill="currentColor"
                                    d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.84z"
                                />
                                <path
                                    fill="currentColor"
                                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                                />
                            </svg>
                            <span className="font-bold text-lg">Continue with Google</span>
                        </button>

                        <button
                            onClick={() => signInWithFacebook()}
                            className="group flex items-center justify-center gap-3 bg-white/10 hover:bg-white/20 border border-white/20 backdrop-blur-md text-white px-6 py-4 rounded-xl transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] shadow-xl"
                        >
                            <svg className="w-6 h-6" viewBox="0 0 24 24">
                                <path
                                    fill="currentColor"
                                    d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.99 3.66 9.12 8.44 9.88v-6.99H7.9v-2.89h2.54V9.41c0-2.51 1.49-3.89 3.78-3.89 1.09 0 2.23.19 2.23.19v2.47h-1.26c-1.24 0-1.63.77-1.63 1.56v1.88h2.78l-.45 2.89h-2.33v6.99C18.34 21.12 22 16.99 22 12z"
                                />
                            </svg>
                            <span className="font-bold text-lg">Continue with Facebook</span>
                        </button>
                    </div>

                    <div className="flex items-center gap-4 mb-8">
                        <div className="flex-1 h-[1px] bg-white/20"></div>
                        <span className="text-white/40 text-xs font-bold uppercase tracking-widest">or login with email</span>
                        <div className="flex-1 h-[1px] bg-white/20"></div>
                    </div>
                    <form action={login} className="flex flex-col">
                        <label className="text-white font-['Inter'] mb-2">Email</label>
                        <input
                            name="email"
                            type="email"
                            placeholder="Enter your email"
                            required
                            className="bg-white/20 text-white placeholder-white/70 rounded-lg px-4 py-3 mb-4 outline-none"
                        />

                        <label className="text-white font-['Inter'] mb-2">Password</label>
                        <div className="relative mb-0">
                            <input
                                name="password"
                                type={showPassword ? 'text' : 'password'}
                                placeholder="Enter your password"
                                required
                                className="w-full bg-white/20 text-white placeholder-white/70 rounded-lg px-4 py-3 pr-12 outline-none"
                            />
                            <button type="button" onClick={() => setShowPassword(s => !s)}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-white/50 hover:text-white transition-colors duration-200">
                                {showPassword ? (
                                    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                    </svg>
                                ) : (
                                    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                                    </svg>
                                )}
                            </button>
                        </div>

                        <div className="flex justify-end mt-2 mb-6">
                            <Link href="/forgot-password" className="text-white font-bold text-sm hover:text-[#647BD0]">
                                Forgot Password
                            </Link>
                        </div>

                        <button type="submit" className="bg-[#647BD0] text-white font-['Inter'] text-xl font-bold py-3 rounded-lg hover:bg-[#4f63b0] transition-all duration-300">
                            Login
                        </button>
                    </form>

                    <p className="text-white mt-4 text-sm">
                        Dont have an account?{' '}
                        <Link href="/register" className="font-bold italic hover:text-[#647BD0]">
                            Create an account
                        </Link>
                    </p>
                </div>

            </div>
        </div>
    )
}

export default page