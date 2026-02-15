import { Link } from 'react-router-dom';

export default function Navbar() {
  return (
    <nav className="flex items-center justify-between p-6 bg-white shadow-sm">
      <div className="text-xl font-bold text-blue-600">MyLogo</div>
      
      <div className="space-x-8 text-gray-600 font-medium">
        <Link to="/" className="hover:text-blue-600">Home</Link>
        <Link to="/donate" className="hover:text-blue-600">Donate</Link>
        <Link to="/profile" className="hover:text-blue-600">Profile</Link>
      </div>

      <button className="bg-gray-100 px-4 py-2 rounded-md hover:bg-gray-200">
        Login
      </button>
    </nav>
  );
}