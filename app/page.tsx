import { createClient } from "@/utils/supabase/server";
import Link from 'next/link'

export default async function LandingPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <div className='h-screen flex flex-col'>
      <div className="relative flex-[8]">

        <video
          className="absolute inset-0 w-full h-full object-cover"
          autoPlay
          muted
          loop
          playsInline
        >
          <source src="/Background_Video.mp4" type="video/mp4" />
        </video>

        <div className='absolute inset-0 bg-[linear-gradient(0deg,_rgba(0,0,0,0.87)_0%,_rgba(0,0,0,0.35)_52.4%,_rgba(102,102,102,0)_100%)] flex flex-col'>

          <div className="border-b border-white/20 mx-8">
            <nav className="flex items-center justify-between p-6">
              <h1 className="text-white font-inter text-4xl font-black">RePurpose</h1>
              <div className='flex gap-x-10 text-white font-konkhmer text-[26px] font-normal'>
                {user ? (
                  <Link href="/home" className="relative text-[#647BD0] font-bold after:absolute after:bottom-0 after:left-0 after:w-full after:h-[2px] after:bg-[#647BD0]">Dashboard</Link>
                ) : (
                  <>
                    <Link href="/login" className="relative text-white after:absolute after:bottom-0 after:left-0 after:w-0 after:h-[2px] after:bg-[#647BD0] after:transition-all after:duration-300 hover:text-[#647BD0] hover:after:w-full">Login</Link>
                    <Link href="/register" className="relative text-white after:absolute after:bottom-0 after:left-0 after:w-0 after:h-[2px] after:bg-[#647BD0] after:transition-all after:duration-300 hover:text-[#647BD0] hover:after:w-full">Sign up</Link>
                  </>
                )}
              </div>
            </nav>
          </div>

          {/* Content centers in remaining space below navbar */}
          <div className='flex-1 flex flex-col items-center justify-center'>
            <h1 className="text-white text-center font-montserrat text-[70px] font-light leading-[1] mb-4">Give Your Pre-Loved<br />Items a New Purpose</h1>
            <p className="text-white text-center font-hind-guntur text-1xl font-extralight">Connect with local organizations and ensure your usable<br />goods go where they're needed most</p>
            <Link href={user ? "/home" : "/register"} className="block text-center relative py-3 px-8 text-white text-base font-bold rounded-full overflow-hidden bg-[#647BD0] w-[275px] max-w-full transition-all duration-400 ease-in-out shadow-md hover:scale-105 hover:text-white hover:shadow-lg active:scale-90 before:absolute before:top-0 before:-left-full before:w-full before:h-full before:bg-gradient-to-r before:from-[#647BD0] before:to-[#FF9248] before:transition-all before:duration-500 before:ease-in-out before:z-[-1] before:rounded-full hover:before:left-0 mt-7">
              {user ? "Go to Dashboard" : "Get Started"}
            </Link>
          </div>

        </div>

      </div>


      <div className='flex-[3] bg-white flex flex-col items-center justify-center'>
        <h3 className="text-black text-center font-koulen text-[30px] font-normal mb-6">HOW IT WORKS</h3>

        <div className="flex justify-center items-start gap-x-16">

          <div className="flex flex-col items-center gap-y-3 w-35 max-w-full">
            <img src="/Camera_Icon.png" alt="Camera" className="w-12 h-12 object-contain" />
            <p className="text-black text-center font-koulen text-[20px]">1. Snap & Describe</p>
          </div>

          <div className="flex flex-col items-center gap-y-3 w-35 max-w-full">
            <img src="/Contact_Icon.png" alt="Contact" className="w-12 h-12 object-contain" />
            <p className="text-black text-center font-koulen text-[20px]">2. Get Matched</p>
          </div>

          <div className="flex flex-col items-center gap-y-3 w-35 max-w-full">
            <img src="/Donate_Icon.png" alt="Donate" className="w-12 h-12 object-contain" />
            <p className="text-black text-center font-koulen text-[20px]">3. Donate</p>
          </div>
        </div>
      </div>

      <div className='flex-none bg-[#6A7397] flex items-center justify-center'>
        <h6 className='text-white text-center font-ibm-plex-sans-hebrew text-1xl font-normal my-2'>©2026 RePurpose | Group 10 | Mapúa University</h6>
      </div>

    </div>
  );
}