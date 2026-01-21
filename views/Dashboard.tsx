
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Wallet, Briefcase, MapPin, Search, Loader2, Sparkles, AlertCircle, Lock, Info, Clock, History, CheckCircle, XCircle, Diamond } from 'lucide-react';
import { User, UserPreferences, PaymentRequest, BusinessIdea } from '../types';
import { generateBusinessIdeas } from '../services/geminiService';

interface DashboardProps {
  user: User;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
  paymentHistory: PaymentRequest[];
  onAutoSave: (ideas: BusinessIdea[]) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ user, setUser, paymentHistory, onAutoSave }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeView, setActiveView] = useState<'generate' | 'history'>('generate');
  const [prefs, setPrefs] = useState<UserPreferences>({
    budgetRange: 'Rs. 50,000 - Rs. 2 Lakh',
    skills: '',
    industryInterest: '',
    location: ''
  });

  const freeLimit = 3;
  const isFreePlan = user.planType === 'free';
  const freeIdeasUsed = user.freeIdeasUsed || 0;
  const freeCreditsLeft = Math.max(0, freeLimit - freeIdeasUsed);
  const availableCredits = user.isAdmin ? 999 : (isFreePlan ? freeCreditsLeft : (user.credits || 0));
  const isLimitReached = availableCredits <= 0;
  const isPending = user.paymentStatus === 'pending';

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLimitReached) {
      setError("Free limit reached. Mazeed ideas ke liye upgrade karein.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const ideas = await generateBusinessIdeas(prefs);
      localStorage.setItem('biz_last_results', JSON.stringify(ideas));
      onAutoSave(ideas);
      setUser(prev => {
        if (!prev) return null;
        if (prev.planType === 'free') {
          return { ...prev, freeIdeasUsed: (prev.freeIdeasUsed || 0) + 1 };
        } else {
          return { ...prev, credits: Math.max(0, (prev.credits || 0) - 1) };
        }
      });
      navigate('/results');
    } catch (err: any) {
      setError("Idea bananay mein masla hua.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 md:py-12">
      <div className="flex justify-center mb-8 md:mb-10 bg-white/50 backdrop-blur-sm p-1.5 rounded-3xl w-fit mx-auto border border-slate-200 shadow-sm">
        <button 
          onClick={() => setActiveView('generate')}
          className={`px-6 md:px-8 py-3 rounded-2xl font-black text-[10px] md:text-xs uppercase tracking-widest transition-all flex items-center gap-2 ${activeView === 'generate' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-800'}`}
        >
          <Sparkles size={16} /> Idea
        </button>
        <button 
          onClick={() => setActiveView('history')}
          className={`px-6 md:px-8 py-3 rounded-2xl font-black text-[10px] md:text-xs uppercase tracking-widest transition-all flex items-center gap-2 ${activeView === 'history' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-800'}`}
        >
          <History size={16} /> History
        </button>
      </div>

      {activeView === 'generate' ? (
        <>
          <div className="text-center mb-10 md:mb-12">
            <h1 className="text-3xl md:text-4xl font-black text-slate-900 mb-2 tracking-tight">Karobari Consultant</h1>
            <p className="text-slate-500 font-medium text-sm">Provide details to generate custom plans.</p>
            
            <div className="space-y-4 mt-8">
              <div className={`p-5 md:p-6 rounded-[32px] flex items-center justify-between max-w-lg mx-auto border-2 transition-all ${isLimitReached ? 'bg-red-50 border-red-100' : 'bg-slate-50 border-slate-200'} shadow-lg`}>
                <div className="flex items-center gap-4">
                   <div className={`w-10 h-10 md:w-12 md:h-12 rounded-2xl flex items-center justify-center ${isLimitReached ? 'bg-red-600 text-white' : 'bg-indigo-600 text-white'}`}>
                      {user.isPaid ? <Diamond size={20} /> : <Sparkles size={20} />}
                   </div>
                   <div className="text-left">
                      <p className={`text-[8px] font-black uppercase tracking-widest ${isLimitReached ? 'text-red-600' : 'text-slate-400'}`}>Status: {user.planType.toUpperCase()}</p>
                      <p className={`text-xl md:text-2xl font-black ${isLimitReached ? 'text-red-700' : 'text-slate-900'}`}>{availableCredits} <span className="text-[10px] font-bold text-slate-400">Left</span></p>
                   </div>
                </div>
                {isLimitReached && (
                  <Link to="/pricing" className="bg-indigo-600 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase shadow-lg">Upgrade</Link>
                )}
              </div>
            </div>
          </div>

          <form onSubmit={handleGenerate} className={`bg-white rounded-[40px] shadow-2xl border border-slate-100 p-8 md:p-14 relative overflow-hidden ${isLimitReached ? 'opacity-60' : 'opacity-100'}`}>
            <div className="grid md:grid-cols-2 gap-6 md:gap-10 relative z-10">
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-slate-400">Budget Range</label>
                <select disabled={loading || isLimitReached} value={prefs.budgetRange} onChange={e => setPrefs({...prefs, budgetRange: e.target.value})} className="w-full bg-slate-50 border-2 border-slate-50 rounded-2xl px-5 py-4 focus:bg-white focus:border-indigo-600 outline-none font-bold text-slate-900 transition-all text-sm">
                  <option>Rs. 0 - Rs. 50,000</option>
                  <option>Rs. 50,000 - Rs. 2 Lakh</option>
                  <option>Rs. 2 Lakh - Rs. 10 Lakh</option>
                  <option>Rs. 10 Lakh +</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-slate-400">Target Region</label>
                <input disabled={loading || isLimitReached} type="text" placeholder="Karachi, Lahore..." required value={prefs.location} onChange={e => setPrefs({...prefs, location: e.target.value})} className="w-full bg-slate-50 border-2 border-slate-50 rounded-2xl px-5 py-4 focus:bg-white focus:border-indigo-600 outline-none font-bold text-slate-900 text-sm" />
              </div>
              <div className="space-y-2 md:col-span-2">
                <label className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-slate-400">Industry Interest</label>
                <input disabled={loading || isLimitReached} type="text" placeholder="Food, Tech, E-commerce..." required value={prefs.industryInterest} onChange={e => setPrefs({...prefs, industryInterest: e.target.value})} className="w-full bg-slate-50 border-2 border-slate-50 rounded-2xl px-5 py-4 focus:bg-white focus:border-indigo-600 outline-none font-bold text-slate-900 text-sm" />
              </div>
              <div className="space-y-2 md:col-span-2">
                <label className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-slate-400">Expertise & Skills</label>
                <textarea disabled={loading || isLimitReached} placeholder="Sales, Cooking, Digital Art..." required rows={3} value={prefs.skills} onChange={e => setPrefs({...prefs, skills: e.target.value})} className="w-full bg-slate-50 border-2 border-slate-50 rounded-2xl px-5 py-4 focus:bg-white focus:border-indigo-600 outline-none font-bold text-slate-900 text-sm resize-none" />
              </div>
            </div>

            <button type="submit" disabled={loading || isLimitReached} className="w-full mt-8 md:mt-12 bg-indigo-600 text-white py-5 rounded-[24px] font-black text-lg md:text-2xl hover:bg-indigo-700 shadow-xl transition-all disabled:opacity-50">
              {loading ? "Generating Ideas..." : "Build My Business Plan"}
            </button>
          </form>
        </>
      ) : (
        <div className="bg-white rounded-[40px] border border-slate-100 shadow-xl overflow-hidden overflow-x-auto">
          <div className="p-8 border-b border-slate-50">
            <h2 className="text-2xl font-black text-slate-900">Transaction History</h2>
          </div>
          <table className="w-full text-left min-w-[600px]">
            <thead className="bg-slate-50 text-slate-400 text-[9px] font-black uppercase tracking-widest">
              <tr>
                <th className="px-8 py-5">Date</th>
                <th className="px-8 py-5">Plan</th>
                <th className="px-8 py-5">Amount</th>
                <th className="px-8 py-5">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {paymentHistory.map((req) => (
                <tr key={req.id} className="text-xs hover:bg-slate-50 transition-colors">
                  <td className="px-8 py-5 text-slate-500 font-bold">{new Date(req.timestamp).toLocaleDateString()}</td>
                  <td className="px-8 py-5 font-black text-indigo-600">{req.plan}</td>
                  <td className="px-8 py-5 font-black">{req.amount}</td>
                  <td className="px-8 py-5">
                    <span className={`px-3 py-1.5 rounded-lg font-black text-[9px] uppercase ${req.status === 'approved' ? 'bg-emerald-50 text-emerald-600' : req.status === 'pending' ? 'bg-amber-50 text-amber-600' : 'bg-red-50 text-red-600'}`}>
                      {req.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
