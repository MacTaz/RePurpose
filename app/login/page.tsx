"use client";
import React from 'react'
import Link from 'next/link'
import { login, signInWithGoogle } from '@/lib/auth-actions'

const page = () => {
    return (
        <div className="relative min-h-screen bg-[url('/login_sign_up_BG.png')] bg-cover bg-center flex">

            <div className="w-1/2 flex items-center justify-center px-10">
                <div className="bg-white rounded-3xl w-full h-full">
                </div>
            </div>

            <div className="w-1/2 flex flex-col px-16 pt-10">

                <div>
                    <Link href="/">
                        <h1 className="text-white font-['Inter'] text-5xl font-black mb-4 hover:text-[#647BD0] transition-all duration-300">RePurpose</h1>
                    </Link>
                    <hr className="border-white/40" />
                </div>

                <div className="flex flex-col justify-center pt-17">
                    <h2 className="text-white font-['Inter'] text-4xl font-bold mb-6">Login</h2>
                    <button
                        onClick={() => signInWithGoogle()}
                        className="group flex items-center justify-center gap-3 bg-white/10 hover:bg-white/20 border border-white/20 backdrop-blur-md text-white px-6 py-4 rounded-xl transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] shadow-xl mb-8"
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
                        <input
                            name="password"
                            type="password"
                            placeholder="Enter your password"
                            required
                            className="bg-white/20 text-white placeholder-white/70 rounded-lg px-4 py-3 outline-none"
                        />

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
