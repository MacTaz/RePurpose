import { Link } from 'react-router-dom';

export default function Navbar() {
  return (
    <nav className="flex items-center justify-between p-6 bg-white shadow-sm">
      <div className="text-xl font-bold text-blue-600">RePurpose</div>
      
      <div className="space-x-8 text-gray-600 font-medium">
        <Link to="/" className="hover:text-blue-600">Home</Link>
        <Link to="/donate" className="hover:text-blue-600">Donate</Link>
        <Link to="/profile" className="hover:text-blue-600">Profile</Link>
        <Link to="/manage" className="hover:text-blue-600">Manage</Link>
        <Link to="/landing" className="hover:text-blue-600">Landing</Link>
        <Link to="/donate" className="hover:text-blue-600">Donate</Link>
      </div>

    </nav>
  );
}