'use client'

import Link from 'next/link'
import { signout } from '@/lib/auth-actions'
import { useState, useEffect } from 'react'
import { Menu, X } from 'lucide-react'
import { createClient } from '@/utils/supabase/client'
import NavigationProgressBar from '@/components/NavigationProgressBar'

interface NavbarProps {
    role: 'donor' | 'organization'
    userId?: string
}

const Navbar = ({ role, userId: initialUserId }: NavbarProps) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false)
    const [unreadCount, setUnreadCount] = useState(0)
    const [userId, setUserId] = useState<string | null>(initialUserId || null)
    const normalizedRole = role.toLowerCase().trim()
    const supabase = createClient()

    // Ensure we have current user ID if not passed
    useEffect(() => {
        if (!userId) {
            const fetchUser = async () => {
                const { data: { user } } = await supabase.auth.getUser()
                if (user) setUserId(user.id)
            }
            fetchUser()
        }
    }, [userId, supabase])

    // Initial unread fetch + realtime
    useEffect(() => {
        if (!userId) return

        const fetchUnread = async () => {
            // We fetch conversations and their messages to see which ones are not read
            const { data: conversations } = await supabase
                .from('conversations')
                .select(`
                    id, 
                    messages(id, sender_id, created_at)
                `)
                .or(`donor_id.eq.${userId},org_id.eq.${userId}`)

            if (conversations) {
                let count = 0
                conversations.forEach((convo: any) => {
                    const sortedMsgs = (convo.messages || []).sort((a: any, b: any) =>
                        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
                    )
                    const lastSeenId = typeof window !== 'undefined' ? localStorage.getItem(`seen_${convo.id}`) : null

                    for (const msg of sortedMsgs) {
                        if (msg.id === lastSeenId) break
                        if (msg.sender_id !== userId) {
                            count++
                        }
                    }
                })
                setUnreadCount(count)
            }
        }

        fetchUnread()

        const channel = supabase
            .channel('navbar-realtime')
            .on('postgres_changes', {
                event: 'INSERT',
                schema: 'public',
                table: 'messages',
            }, (payload) => {
                const newMessage = payload.new
                if (newMessage.sender_id !== userId) {
                    fetchUnread()
                }
            })
            .subscribe()

        const handleMessagesRead = () => {
            fetchUnread()
        }

        window.addEventListener('messages_read', handleMessagesRead)
        window.addEventListener('storage', handleMessagesRead)

        return () => {
            supabase.removeChannel(channel)
            window.removeEventListener('messages_read', handleMessagesRead)
            window.removeEventListener('storage', handleMessagesRead)
        }
    }, [userId, supabase])

    return (
        <div className="font-inter sticky top-0 z-50">
            {normalizedRole === 'donor' ? (
                /* DONOR VIEW (BLUE THEME) */
                <nav className="bg-[#3D5082] text-white px-4 md:px-8 py-3 relative shadow-lg">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center gap-4">
                            <h1 className="text-2xl font-black tracking-tight">
                                <Link href="/home">RePurpose</Link>
                            </h1>
                        </div>
                        {/* Mobile Menu Toggle */}
                        <button className="lg:hidden p-2 hover:bg-white/10 rounded-lg transition-colors" onClick={() => setIsMenuOpen(!isMenuOpen)}>
                            {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
                        </button>
                        {/* Desktop Menu */}
                        <div className="hidden lg:flex items-center gap-8 font-konkhmer text-xl font-normal">
                            <Link href="/home/profile" className="hover:text-blue-200 transition-colors">Profile</Link>
                            <Link href="/home/manage" className="hover:text-blue-200 transition-colors">Manage</Link>
                            <Link href="/home/donate" className="hover:text-blue-200 transition-colors">Donate</Link>
                            <Link href="/home/inbox" className="p-1 hover:bg-white/10 rounded-lg transition-colors relative">
                                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                                {unreadCount > 0 && (
                                    <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white ring-2 ring-[#3D5082]">
                                        {unreadCount}
                                    </span>
                                )}
                            </Link>
                            <form action={signout} className="ml-4 font-inter">
                                <button type="submit" className="text-sm bg-white/20 px-4 py-1.5 rounded-lg hover:bg-white/30 transition-all font-bold shadow-sm">Logout</button>
                            </form>
                        </div>
                    </div>
                    {/* Mobile Menu Dropdown */}
                    {isMenuOpen && (
                        <div className="lg:hidden mt-4 pb-4 flex flex-col gap-4 font-konkhmer text-xl font-normal border-t border-white/10 pt-4">
                            <Link href="/home/profile" className="hover:text-blue-200 transition-colors px-2" onClick={() => setIsMenuOpen(false)}>Profile</Link>
                            <Link href="/home/manage" className="hover:text-blue-200 transition-colors px-2" onClick={() => setIsMenuOpen(false)}>Manage</Link>
                            <Link href="/home/donate" className="hover:text-blue-200 transition-colors px-2" onClick={() => setIsMenuOpen(false)}>Donate</Link>
                            <Link href="/home/inbox" className="hover:text-blue-200 transition-colors px-2 flex items-center justify-between" onClick={() => setIsMenuOpen(false)}>
                                <span className="flex items-center gap-2">
                                    Inbox <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                                </span>
                                {unreadCount > 0 && (
                                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                                        {unreadCount}
                                    </span>
                                )}
                            </Link>
                            <form action={signout} className="font-inter mt-2 px-2">
                                <button type="submit" className="w-full text-left text-sm bg-white/20 px-4 py-3 rounded-lg hover:bg-white/30 transition-all font-bold shadow-sm">Logout</button>
                            </form>
                        </div>
                    )}
                </nav>
            ) : (
                /* ORGANIZATION VIEW (ORANGE THEME) */
                <nav className="bg-[#FF9248] text-black px-4 md:px-8 py-3 relative shadow-md">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center gap-4">
                            <h1 className="text-2xl font-black tracking-tight">
                                <Link href="/home">RePurpose</Link>
                            </h1>
                        </div>
                        {/* Mobile Menu Toggle */}
                        <button className="lg:hidden p-2 hover:bg-black/5 rounded-lg transition-colors text-black" onClick={() => setIsMenuOpen(!isMenuOpen)}>
                            {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
                        </button>
                        {/* Desktop Menu */}
                        <div className="hidden lg:flex items-center gap-8 font-konkhmer text-xl font-normal text-[#111]">
                            <Link href="/home/profile" className="hover:opacity-70 transition-opacity">Profile</Link>
                            <Link href="/home/manage" className="hover:opacity-70 transition-opacity">Manage</Link>
                            <Link href="/home/inbox" className="p-1 hover:bg-black/5 rounded-lg transition-colors relative">
                                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                                {unreadCount > 0 && (
                                    <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 text-[10px] font-bold text-white ring-2 ring-[#FF9248]">
                                        {unreadCount}
                                    </span>
                                )}
                            </Link>
                            <form action={signout} className="ml-4 font-inter">
                                <button type="submit" className="text-sm border-2 border-black/20 px-4 py-1.5 rounded-lg hover:bg-black/5 transition-all font-bold shadow-sm">Logout</button>
                            </form>
                        </div>
                    </div>
                    {/* Mobile Menu Dropdown */}
                    {isMenuOpen && (
                        <div className="lg:hidden mt-4 pb-4 flex flex-col gap-4 font-konkhmer text-xl font-normal text-[#111] border-t border-black/10 pt-4">
                            <Link href="/home/profile" className="hover:opacity-70 transition-opacity px-2" onClick={() => setIsMenuOpen(false)}>Profile</Link>
                            <Link href="/home/manage" className="hover:opacity-70 transition-opacity px-2" onClick={() => setIsMenuOpen(false)}>Manage</Link>
                            <Link href="/home/inbox" className="hover:opacity-70 transition-opacity px-2 flex items-center justify-between" onClick={() => setIsMenuOpen(false)}>
                                <span className="flex items-center gap-2">
                                    Inbox <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                                </span>
                                {unreadCount > 0 && (
                                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-600 text-[10px] font-bold text-white">
                                        {unreadCount}
                                    </span>
                                )}
                            </Link>
                            <form action={signout} className="font-inter mt-2 px-2">
                                <button type="submit" className="w-full text-left text-sm border-2 border-black/20 px-4 py-3 rounded-lg hover:bg-black/5 transition-all font-bold shadow-sm">Logout</button>
                            </form>
                        </div>
                    )}
                </nav>
            )}
            {/* Page transition progress bar */}
            <NavigationProgressBar
                color={normalizedRole === 'donor' ? '#93c5fd' : '#FFCF9E'}
            />
        </div>
    )
}

export default Navbar
