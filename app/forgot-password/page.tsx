"use client";
import React, { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/utils/supabase/client'
import VideoPanel from '@/components/VideoPanel'

const page = () => {
    const [submitted, setSubmitted] = useState(false)
    const [email, setEmail] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)
    const supabase = createClient()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')
        setLoading(true)
        try {
            // Priority: Current window origin (for localhost) > Env var > Fallback
            const siteUrl = window.location.origin || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

            const { error } = await supabase.auth.resetPasswordForEmail(email, {
                // This sends the reset link through your custom SMTP (Gmail)
                // and routes the token through your confirm route
                redirectTo: `${siteUrl}/auth/confirm?next=/reset-password&type=recovery`,
            })
            if (error) throw error
            setSubmitted(true)
        } catch (err: any) {
            setError(err.message || 'Something went wrong. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="relative min-h-screen bg-[#2D3561] flex flex-col md:flex-row">
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

            <VideoPanel />

            {/* Right Side - Form */}
            <div className="w-full md:w-1/2 flex flex-col px-8 md:px-16 pt-10 z-10 pb-10">
                <div>
                    <Link href="/">
                        <h1 className="text-white font-['Inter'] text-5xl font-black mb-4 hover:text-[#647BD0] transition-all duration-300">RePurpose</h1>
                    </Link>
                    <hr className="border-white/40" />
                </div>

                <div className="flex flex-col justify-center pt-17">
                    {!submitted ? (
                        <>
                            <h2 className="text-white font-['Inter'] text-4xl font-bold mb-3">Forgot Password</h2>
                            <p className="text-white/60 text-sm mb-8">
                                Enter your email and we'll send you a link to reset your password.
                            </p>

                            {error && (
                                <div className="bg-red-500/20 border border-red-500/40 text-red-200 rounded-lg px-4 py-3 mb-6 text-sm">
                                    ⚠️ {error}
                                </div>
                            )}

                            <form onSubmit={handleSubmit} className="flex flex-col">
                                <label className="text-white font-['Inter'] mb-2">Email</label>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="Enter your email"
                                    required
                                    className="bg-white/20 text-white placeholder-white/70 rounded-lg px-4 py-3 mb-6 outline-none"
                                />
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="bg-[#647BD0] text-white font-['Inter'] text-xl font-bold py-3 rounded-lg hover:bg-[#4f63b0] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                    {loading ? (
                                        <><span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Sending...</>
                                    ) : 'Send Reset Link'}
                                </button>
                            </form>
                        </>
                    ) : (
                        <>
                            <div className="text-6xl mb-6">📬</div>
                            <h2 className="text-white font-['Inter'] text-4xl font-bold mb-3">Check your email!</h2>
                            <p className="text-white/60 text-sm mb-4">
                                We sent a password reset link to{' '}
                                <span className="text-white font-bold">{email}</span>.
                            </p>
                            <p className="text-white/40 text-xs mb-8">
                                Click the link in the email to reset your password. The link expires in 1 hour.
                            </p>
                            <button
                                onClick={() => { setSubmitted(false); setError('') }}
                                className="text-white/50 hover:text-white text-sm transition-colors duration-200 text-left"
                            >
                                ← Try a different email
                            </button>
                        </>
                    )}

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
