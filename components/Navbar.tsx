import Link from 'next/link'
import { signout } from '@/lib/auth-actions'

interface NavbarProps {
    role: 'donor' | 'organization'
}

const Navbar = ({ role }: NavbarProps) => {
    return (
        <div className="font-inter">
            {role === 'donor' ? (
                /* DONOR VIEW (BLUE THEME) */
                <nav className="bg-[#3D5082] text-white px-8 py-3 flex justify-between items-center shadow-lg">
                    <div className="flex items-center gap-4">
                        <h1 className="text-2xl font-black tracking-tight">
                            <Link href="/home">RePurpose</Link>
                        </h1>
                    </div>
                    <div className="flex items-center gap-8 font-konkhmer text-xl font-normal">
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
                </nav>
            ) : (
                /* ORGANIZATION VIEW (ORANGE THEME) */
                <nav className="bg-[#FF9248] text-black px-8 py-3 flex justify-between items-center shadow-md">
                    <div className="flex items-center gap-4">
                        <h1 className="text-2xl font-black tracking-tight">
                            <Link href="/home">RePurpose</Link>
                        </h1>
                    </div>
                    <div className="flex items-center gap-8 font-konkhmer text-xl font-normal text-[#111]">
                        <Link href="/home/profile" className="hover:opacity-70 transition-opacity">Profile</Link>
                        <Link href="/home/manage" className="hover:opacity-70 transition-opacity">Manage</Link>
                        <Link href="/home/inbox" className="p-1 hover:bg-black/5 rounded-lg transition-colors">
                            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                        </Link>
                        <form action={signout} className="ml-4 font-inter">
                            <button type="submit" className="text-sm border-2 border-black/20 px-4 py-1.5 rounded-lg hover:bg-black/5 transition-all font-bold shadow-sm">Logout</button>
                        </form>
                    </div>
                </nav>
            )}
        </div>
    )
}

export default Navbar
