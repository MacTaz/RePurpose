"use client";
import React, { useState } from 'react';
import Link from 'next/link'
import { signout } from '@/lib/auth-actions'
import { Menu, X } from 'lucide-react'

interface NavbarProps {
    role: 'donor' | 'organization'
}

const Navbar = ({ role }: NavbarProps) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="font-inter">
            {role === 'donor' ? (
                /* DONOR VIEW (BLUE THEME) */
                <nav className="bg-[#3D5082] text-white px-6 md:px-8 py-3 relative shadow-lg">
                    <div className="flex justify-between items-center">
                        <h1 className="text-2xl font-black tracking-tight">
                            <Link href="/home">RePurpose</Link>
                        </h1>

                        {/* Desktop Menu */}
                        <div className="hidden md:flex items-center gap-8 font-konkhmer text-xl font-normal">
                            <Link href="/home/profile" className="hover:text-blue-200 transition-colors">Profile</Link>
                            <Link href="/home/manage" className="hover:text-blue-200 transition-colors">Manage</Link>
                            <Link href="/home/donate" className="hover:text-blue-200 transition-colors">Donate</Link>
                            <Link href="/home/inbox" className="p-1 hover:bg-white/10 rounded-lg transition-colors">
                                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                            </Link>
                            <form action={signout} className="ml-4 font-inter">
                                <button type="submit" className="text-sm bg-white/20 px-4 py-1.5 rounded-lg hover:bg-white/30 transition-all font-bold shadow-sm">Logout</button>
                            </form>
                        </div>

                        {/* Mobile Menu Button */}
                        <button className="md:hidden p-2" onClick={() => setIsOpen(!isOpen)}>
                            {isOpen ? <X className="w-7 h-7" /> : <Menu className="w-7 h-7" />}
                        </button>
                    </div>

                    {/* Mobile Menu */}
                    {isOpen && (
                        <div className="md:hidden absolute top-full left-0 w-full bg-[#3D5082] border-t border-white/10 flex flex-col items-center py-4 gap-4 z-50 font-konkhmer text-xl shadow-xl">
                            <Link href="/home/profile" onClick={() => setIsOpen(false)} className="hover:text-blue-200 transition-colors w-full text-center py-2">Profile</Link>
                            <Link href="/home/manage" onClick={() => setIsOpen(false)} className="hover:text-blue-200 transition-colors w-full text-center py-2">Manage</Link>
                            <Link href="/home/donate" onClick={() => setIsOpen(false)} className="hover:text-blue-200 transition-colors w-full text-center py-2">Donate</Link>
                            <Link href="/home/inbox" onClick={() => setIsOpen(false)} className="hover:text-blue-200 transition-colors w-full text-center py-2 flex justify-center items-center gap-2">
                                Inbox <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                            </Link>
                            <form action={signout} className="font-inter mt-2 w-full px-6">
                                <button type="submit" className="w-full text-center text-sm bg-white/20 px-4 py-3 rounded-lg hover:bg-white/30 transition-all font-bold shadow-sm">Logout</button>
                            </form>
                        </div>
                    )}
                </nav>
            ) : (
                /* ORGANIZATION VIEW (ORANGE THEME) */
                <nav className="bg-[#FF9248] text-black px-6 md:px-8 py-3 relative shadow-md">
                    <div className="flex justify-between items-center">
                        <h1 className="text-2xl font-black tracking-tight">
                            <Link href="/home">RePurpose</Link>
                        </h1>

                        {/* Desktop Menu */}
                        <div className="hidden md:flex items-center gap-8 font-konkhmer text-xl font-normal text-[#111]">
                            <Link href="/home/profile" className="hover:opacity-70 transition-opacity">Profile</Link>
                            <Link href="/home/manage" className="hover:opacity-70 transition-opacity">Manage</Link>
                            <Link href="/home/inbox" className="p-1 hover:bg-black/5 rounded-lg transition-colors">
                                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                            </Link>
                            <form action={signout} className="ml-4 font-inter">
                                <button type="submit" className="text-sm border-2 border-black/20 px-4 py-1.5 rounded-lg hover:bg-black/5 transition-all font-bold shadow-sm">Logout</button>
                            </form>
                        </div>

                        {/* Mobile Menu Button */}
                        <button className="md:hidden p-2 text-black" onClick={() => setIsOpen(!isOpen)}>
                            {isOpen ? <X className="w-7 h-7" /> : <Menu className="w-7 h-7" />}
                        </button>
                    </div>

                    {/* Mobile Menu */}
                    {isOpen && (
                        <div className="md:hidden absolute top-full left-0 w-full bg-[#FF9248] border-t border-black/10 flex flex-col items-center py-4 gap-4 z-50 font-konkhmer text-xl shadow-xl text-[#111]">
                            <Link href="/home/profile" onClick={() => setIsOpen(false)} className="hover:opacity-70 transition-opacity w-full text-center py-2">Profile</Link>
                            <Link href="/home/manage" onClick={() => setIsOpen(false)} className="hover:opacity-70 transition-opacity w-full text-center py-2">Manage</Link>
                            <Link href="/home/inbox" onClick={() => setIsOpen(false)} className="hover:opacity-70 transition-opacity w-full text-center py-2 flex justify-center items-center gap-2">
                                Inbox <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                            </Link>
                            <form action={signout} className="font-inter mt-2 w-full px-6">
                                <button type="submit" className="w-full text-center text-sm border-2 border-black/20 px-4 py-3 rounded-lg hover:bg-black/5 transition-all font-bold shadow-sm">Logout</button>
                            </form>
                        </div>
                    )}
                </nav>
            )}
        </div>
    )
}

export default Navbar
