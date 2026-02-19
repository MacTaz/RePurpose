import { Link } from 'react-router-dom';

export default function Login() {
  return (
    <div className="relative min-h-screen bg-[url('/login_sign_up_BG.png')] bg-cover bg-center flex">

      <div className="w-1/2 flex items-center justify-center px-10">
        <div className="bg-white rounded-3xl w-full h-full">
        </div>
      </div>

      <div className="w-1/2 flex flex-col px-16 pt-10">
  
          <div>
            <Link to="/landing">
              <h1 className="text-white font-['Inter'] text-5xl font-black mb-4 hover:text-[#647BD0] transition-all duration-300">RePurpose</h1>
            </Link>
            <hr className="border-white/40" />
          </div>
        
          <div className="flex flex-col justify-center pt-17">
            <h2 className="text-white font-['Inter'] text-4xl font-bold mb-6">Login</h2>
        
            <label className="text-white font-['Inter'] mb-2">Email</label>
            <input
              type="email"
              placeholder="Enter your email"
              className="bg-white/20 text-white placeholder-white/70 rounded-lg px-4 py-3 mb-4 outline-none"
            />
        
            <label className="text-white font-['Inter'] mb-2">Password</label>
            <input
              type="password"
              placeholder="Enter your password"
              className="bg-white/20 text-white placeholder-white/70 rounded-lg px-4 py-3 outline-none"
            />
        
            <div className="flex justify-end mt-2 mb-6">
              <Link to="/forgot-password" className="text-white font-bold text-sm hover:text-[#647BD0]">
                Forgot Password
              </Link>
            </div>
        
            <button className="bg-[#647BD0] text-white font-['Inter'] text-xl font-bold py-3 rounded-lg hover:bg-[#4f63b0] transition-all duration-300">
              Login
            </button>
        
            <p className="text-white mt-4 text-sm">
              Dont have an account?{' '}
              <Link to="/signup" className="font-bold italic hover:text-[#647BD0]">
                Create an account
              </Link>
            </p>
          </div>
        
        </div>
    </div>
  );
}