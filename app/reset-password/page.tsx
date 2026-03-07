"use client";
import React, { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'

const page = () => {
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)
    const [error, setError] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const router = useRouter()
    const supabase = createClient()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')

        if (password !== confirmPassword) {
            setError('Passwords do not match!')
            return
        }

        if (password.length < 6) {
            setError('Password must be at least 6 characters!')
            return
        }

        setIsLoading(true)
        const { error } = await supabase.auth.updateUser({ password })

        if (error) {
            setError(error.message)
            setIsLoading(false)
            return
        }

        router.push('/login')
    }

    return (
        <div className="relative min-h-screen bg-[#2D3561] flex">
            {/* Topographic Wave Background */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <svg className="absolute w-[200%] md:w-full h-[200%] md:h-full object-cover top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-70" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 900">
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

            {/* Left Side - Placeholder */}
            <div className="w-1/2 flex items-center justify-center px-10">
                <div className="bg-white rounded-3xl w-full h-full">
                </div>
            </div>

            {/* Right Side - Form */}
            <div className="w-1/2 flex flex-col px-16 pt-10">
                <div>
                    <Link href="/">
                        <h1 className="text-white font-['Inter'] text-5xl font-black mb-4 hover:text-[#647BD0] transition-all duration-300">RePurpose</h1>
                    </Link>
                    <hr className="border-white/40" />
                </div>

                <div className="flex flex-col justify-center pt-17">
                    <h2 className="text-white font-['Inter'] text-4xl font-bold mb-3">Reset Password</h2>
                    <p className="text-white/60 text-sm mb-8">Enter your new password below.</p>

                    {error && (
                        <div className="bg-red-500/20 border border-red-500/40 text-red-200 rounded-lg px-4 py-3 mb-6 text-sm">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="flex flex-col">
                        <label className="text-white font-['Inter'] mb-2">New Password</label>
                        <div className="relative mb-4">
                            <input
                                type={showPassword ? 'text' : 'password'}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Enter new password"
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

                        <label className="text-white font-['Inter'] mb-2">Confirm Password</label>
                        <div className="relative mb-6">
                            <input
                                type={showConfirmPassword ? 'text' : 'password'}
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                placeholder="Confirm new password"
                                required
                                className="w-full bg-white/20 text-white placeholder-white/70 rounded-lg px-4 py-3 pr-12 outline-none"
                            />
                            <button type="button" onClick={() => setShowConfirmPassword(s => !s)}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-white/50 hover:text-white transition-colors duration-200">
                                {showConfirmPassword ? (
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

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="bg-[#647BD0] text-white font-['Inter'] text-xl font-bold py-3 rounded-lg hover:bg-[#4f63b0] transition-all duration-300 disabled:opacity-50"
                        >
                            {isLoading ? 'Updating...' : 'Reset Password'}
                        </button>
                    </form>

                    <p className="text-white mt-6 text-sm">
                        Remember your password?{' '}
                        <Link href="/login" className="font-bold italic hover:text-[#647BD0]">
                            Back to Login
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    )
}

export default page