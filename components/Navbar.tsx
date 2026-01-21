
import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Lightbulb, ShieldCheck, LogOut, Sparkles, Menu, X, BookOpen, LayoutDashboard } from 'lucide-react';
import { User } from '../types';

interface NavbarProps {
  user: User | null;
  onLogout: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ user, onLogout }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [logoClicks, setLogoClicks] = useState(0);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'a') {
        e.preventDefault();
        navigate('/login?access=secure_portal');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [navigate]);

  const handleLogoClick = (e: React.MouseEvent) => {
    e.preventDefault();
    const newCount = logoClicks + 1;
    setLogoClicks(newCount);
    if (newCount === 10) {
      setLogoClicks(0);
      navigate('/login?access=secure_portal');
    }
    setTimeout(() => setLogoClicks(0), 3000);
  };

  const isActive = (path: string) => location.pathname === path;

  const closeMenu = () => setIsMobileMenuOpen(false);

  return (
    <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div onClick={handleLogoClick} className="flex items-center gap-2 cursor-pointer select-none group">
            <div className="bg-indigo-600 p-1.5 rounded-lg text-white group-active:scale-90 transition-transform">
              <Lightbulb size={24} />
            </div>
            <span className="font-bold text-xl tracking-tight">BizGen AI</span>
          </div>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-6">
            {user ? (
              <>
                <Link to="/dashboard" className={`text-sm font-bold transition-colors ${isActive('/dashboard') ? 'text-indigo-600' : 'text-slate-600 hover:text-indigo-600'}`}>Naya Khayal</Link>
                <Link to="/saved" className={`text-sm font-bold transition-colors ${isActive('/saved') ? 'text-indigo-600' : 'text-slate-600 hover:text-indigo-600'}`}>Library</Link>
                {!user.isPaid && (
                  <Link to="/pricing" className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-indigo-50 text-indigo-700 text-xs font-extrabold hover:bg-indigo-100 border border-indigo-200">
                    <Sparkles size={14} /> Upgrade
                  </Link>
                )}
                {user.isAdmin && (
                  <Link to="/admin" className={`flex items-center gap-1 text-sm font-bold ${isActive('/admin') ? 'text-indigo-600' : 'text-slate-500 hover:text-indigo-600'}`}>
                    <ShieldCheck size={16} /> Admin
                  </Link>
                )}
                <div className="h-6 w-px bg-slate-200 mx-1" />
                <div className="flex items-center gap-3">
                  <div className="flex flex-col items-end">
                    <span className="text-sm font-bold text-slate-800">{user.name}</span>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
                      {user.isAdmin ? 'Administrator' : user.isPaid ? 'Premium' : 'Aam Member'}
                    </span>
                  </div>
                  <button onClick={onLogout} className="p-2 text-slate-400 hover:text-red-500 transition-colors"><LogOut size={18} /></button>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-3">
                <Link to="/pricing" className="text-sm font-bold text-slate-600 hover:text-indigo-600 px-4">Qemat</Link>
                <Link to="/login" className="bg-indigo-600 text-white text-sm font-bold px-6 py-2.5 rounded-xl hover:bg-indigo-700 transition-all shadow-lg active:scale-95">Login</Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <button 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 text-slate-600 hover:bg-slate-50 rounded-lg transition-colors"
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {isMobileMenuOpen && (
        <div className="md:hidden absolute top-16 left-0 w-full bg-white border-b border-slate-200 shadow-xl p-4 space-y-2 animate-in slide-in-from-top-4 duration-300">
          {user ? (
            <>
              <Link to="/dashboard" onClick={closeMenu} className={`flex items-center gap-3 p-4 rounded-xl font-bold ${isActive('/dashboard') ? 'bg-indigo-50 text-indigo-600' : 'text-slate-600'}`}>
                <LayoutDashboard size={20} /> Dashboard
              </Link>
              <Link to="/saved" onClick={closeMenu} className={`flex items-center gap-3 p-4 rounded-xl font-bold ${isActive('/saved') ? 'bg-indigo-50 text-indigo-600' : 'text-slate-600'}`}>
                <BookOpen size={20} /> Library
              </Link>
              <Link to="/pricing" onClick={closeMenu} className={`flex items-center gap-3 p-4 rounded-xl font-bold ${isActive('/pricing') ? 'bg-indigo-50 text-indigo-600' : 'text-slate-600'}`}>
                <Sparkles size={20} /> Upgrade Plan
              </Link>
              {user.isAdmin && (
                <Link to="/admin" onClick={closeMenu} className={`flex items-center gap-3 p-4 rounded-xl font-bold ${isActive('/admin') ? 'bg-indigo-50 text-indigo-600' : 'text-slate-600'}`}>
                  <ShieldCheck size={20} /> Admin Control
                </Link>
              )}
              <div className="border-t border-slate-100 my-2 pt-2">
                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                  <div>
                    <p className="font-bold text-slate-800">{user.name}</p>
                    <p className="text-[10px] uppercase font-black text-slate-400">{user.isPaid ? 'Premium' : 'Free Plan'}</p>
                  </div>
                  <button onClick={() => { onLogout(); closeMenu(); }} className="p-2 bg-red-50 text-red-500 rounded-lg"><LogOut size={20} /></button>
                </div>
              </div>
            </>
          ) : (
            <>
              <Link to="/pricing" onClick={closeMenu} className="block p-4 rounded-xl font-bold text-slate-600">Pricing</Link>
              <Link to="/login" onClick={closeMenu} className="block p-4 rounded-xl font-black bg-indigo-600 text-white text-center">Login / Sign Up</Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
