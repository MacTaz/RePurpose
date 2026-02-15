import { Outlet } from 'react-router-dom';
import Navbar from '../components/Navbar';

export default function MainLayout() {
  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar /> 
      {/* The <Outlet /> is where the specific page content (Home, Donate, etc.) will appear */}
      <main className="p-8">
        <Outlet />
      </main>
    </div>
  );
}

