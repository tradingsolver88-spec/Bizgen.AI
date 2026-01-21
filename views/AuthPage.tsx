
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Mail, Lock, User as UserIcon, ArrowRight, ShieldAlert, AlertCircle } from 'lucide-react';
import { User } from '../types';

interface AuthPageProps {
  setUser: (user: User) => void;
  allUsers: User[];
  currentUser: User | null;
}

const AuthPage: React.FC<AuthPageProps> = ({ setUser, allUsers, currentUser }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  const navigate = useNavigate();
  const location = useLocation();

  const queryParams = new URLSearchParams(location.search);
  const showAdminMode = queryParams.get('access') === 'secure_portal';

  // AUTH GUARD: Strict redirect if already logged in
  useEffect(() => {
    if (currentUser) {
      navigate('/dashboard');
    }
  }, [currentUser, navigate]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // SERVER-SIDE SIMULATION: Block if session exists
    if (currentUser) {
      setError("Aap pehle se logged in hain. Please logout before creating a new account.");
      return;
    }

    setError(null);
    setIsLoading(true);
    
    setTimeout(() => {
      const normalizedEmail = email.toLowerCase().trim();
      
      // 1. Admin Auth Check
      if (showAdminMode) {
        if (normalizedEmail === 'admin@bizgen.ai' && password === 'admin123') {
          const adminUser: User = {
            name: 'Super Admin',
            email: normalizedEmail,
            isAdmin: true,
            freeIdeasUsed: 0,
            planType: 'paid',
            credits: 9999,
            isPaid: true
          };
          setUser(adminUser);
          navigate('/admin');
          setIsLoading(false);
          return;
        } else {
          setError("Ghalat Admin credentials. Dubara koshish karein.");
          setIsLoading(false);
          return;
        }
      }

      // 2. User Authentication
      const existingUser = allUsers.find(u => u.email.toLowerCase() === normalizedEmail);

      if (isLogin) {
        // --- LOGIN FLOW ---
        if (!existingUser || existingUser.password !== password) {
          setError("Invalid email or password.");
          setIsLoading(false);
          return;
        }

        // Successful login - usage counters are restored from DB
        setUser(existingUser);
        navigate('/dashboard');
      } else {
        // --- SIGN UP FLOW ---
        if (existingUser) {
          setError("Ye email pehle se istemal mein hai. Please login karein.");
          setIsLoading(false);
          return;
        }

        if (password.length < 6) {
          setError("Password kam az kam 6 characters ka hona chahiye.");
          setIsLoading(false);
          return;
        }

        const newUser: User = {
          name: name || 'Naya Dost',
          email: normalizedEmail,
          password: password, 
          isAdmin: false,
          freeIdeasUsed: 0, // NEW FIELD
          planType: 'free', // NEW FIELD
          credits: 0,
          isPaid: false,
          paymentStatus: 'none'
        };
        
        setUser(newUser);
        navigate('/dashboard');
      }
      setIsLoading(false);
    }, 800);
  };

  if (currentUser) return null;

  return (
    <div className="min-h-[calc(100vh-64px)] flex">
      <div className="hidden lg:flex w-1/2 bg-indigo-600 p-12 flex-col justify-between relative overflow-hidden">
        <div className="z-10">
          <div className="bg-white/20 backdrop-blur-md w-12 h-12 rounded-xl flex items-center justify-center mb-8">
            <UserIcon className="text-white" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-4 leading-tight">
            Mehfooz Aur Ba-Aitebar <br /> Authentication.
          </h1>
          <p className="text-indigo-100 text-lg max-w-md">
            Aap ka data aur history hamare pas hamesha mehfooz hai. Aaj hi apna safar shuru karein.
          </p>
        </div>
        <div className="z-10 bg-indigo-700/50 p-6 rounded-2xl backdrop-blur-sm border border-indigo-400/20 text-white font-medium italic">
          "BizGen AI ensures your startup roadmap is always available across devices."
        </div>
      </div>

      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-white">
        <div className="max-w-md w-full">
          <div className="mb-10 text-center lg:text-left">
            <h2 className="text-3xl font-black text-slate-900 mb-2 tracking-tight">
              {showAdminMode ? 'Admin Portal' : isLogin ? 'Account Mein Aayein' : 'Naya Account Banayein'}
            </h2>
            <p className="text-slate-500 font-medium">
              {showAdminMode ? 'Authorized staff only.' : isLogin ? 'Login karein aur apna progress dobara dekhein.' : 'Apna safar aaj hi shuru karein.'}
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3 text-red-600 font-bold text-sm animate-in fade-in slide-in-from-top-2">
              <AlertCircle size={20} />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {!isLogin && !showAdminMode && (
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Pura Naam</label>
                <div className="relative">
                  <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input type="text" required value={name} onChange={e => setName(e.target.value)} placeholder="Ali Khan" className="w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:ring-0 focus:border-indigo-600 outline-none transition-all" />
                </div>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder={showAdminMode ? "admin@bizgen.ai" : "ali@gmail.com"} className="w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:ring-0 focus:border-indigo-600 outline-none transition-all" />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input type="password" required value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" className="w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:ring-0 focus:border-indigo-600 outline-none transition-all" />
              </div>
            </div>

            <button 
              type="submit" 
              disabled={isLoading}
              className="w-full bg-indigo-600 text-white py-5 rounded-2xl font-black text-xl shadow-xl shadow-indigo-100 hover:bg-indigo-700 active:scale-[0.98] transition-all flex items-center justify-center gap-2 group disabled:opacity-50"
            >
              {isLoading ? (
                <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  {showAdminMode ? 'Access Portal' : isLogin ? 'Login Karein' : 'Register Karein'}
                  <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          {!showAdminMode && (
            <p className="mt-10 text-center text-slate-500 font-medium">
              {isLogin ? "Account nahi hai?" : "Pehle se account hai?"}{' '}
              <button onClick={() => { setIsLogin(!isLogin); setError(null); }} className="text-indigo-600 font-black hover:underline ml-1">
                {isLogin ? 'Abhi Banayein' : 'Login Karein'}
              </button>
            </p>
          )}

          {showAdminMode && (
            <div className="mt-8 p-5 bg-amber-50 rounded-2xl border border-amber-100 flex items-start gap-3">
              <ShieldAlert className="text-amber-600 flex-shrink-0" size={24} />
              <p className="text-xs text-amber-700 leading-relaxed font-bold">
                Authorized access only. Authenticity failures are logged and persistent usage counters are monitored.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
