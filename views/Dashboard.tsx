import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { History, Sparkles, Loader2, Diamond, LayoutDashboard, BrainCircuit } from 'lucide-react';
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
  const isLimitReached = !user.isAdmin && availableCredits <= 0;

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLimitReached) {
      setError("Limit reached. Please upgrade to Pro.");
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
        if (prev.isAdmin) return prev;
        if (prev.planType === 'free') {
          return { ...prev, freeIdeasUsed: (prev.freeIdeasUsed || 0) + 1 };
        } else {
          return { ...prev, credits: Math.max(0, (prev.credits || 0) - 1) };
        }
      });
      navigate('/results');
    } catch (err: any) {
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 md:py-16">
      <div className="flex justify-center mb-10 bg-white p-1 rounded-2xl w-fit mx-auto border border-slate-200 shadow-sm">
        <button 
          onClick={() => setActiveView('generate')}
          className={`px-6 py-2.5 rounded-xl font-bold text-xs uppercase tracking-widest transition-all flex items-center gap-2 ${activeView === 'generate' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-500 hover:text-slate-800'}`}
        >
          <BrainCircuit size={16} /> Idea Generator
        </button>
        <button 
          onClick={() => setActiveView('history')}
          className={`px-6 py-2.5 rounded-xl font-bold text-xs uppercase tracking-widest transition-all flex items-center gap-2 ${activeView === 'history' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-500 hover:text-slate-800'}`}
        >
          <History size={16} /> Billing History
        </button>
      </div>

      {activeView === 'generate' ? (
        <div className="animate-in">
          <div className="text-center mb-12">
            <h1 className="text-3xl md:text-5xl font-black text-slate-900 mb-4 tracking-tight">Personalized Consultant</h1>
            <p className="text-slate-500 font-medium text-sm md:text-base">Provide few details, humari AI aap ke liye plan banaye gi.</p>
            
            <div className="mt-8">
              <div className={`p-4 md:p-6 rounded-3xl flex items-center justify-between max-w-sm mx-auto border-2 transition-all ${isLimitReached ? 'bg-red-50 border-red-200' : 'bg-white border-slate-200'} shadow-xl`}>
                <div className="flex items-center gap-4">
                   <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${isLimitReached ? 'bg-red-600 text-white' : 'bg-indigo-600 text-white shadow-lg shadow-indigo-200'}`}>
                      {user.isPaid ? <Diamond size={24} /> : <Sparkles size={24} />}
                   </div>
                   <div className="text-left">
                      <p className={`text-[9px] font-black uppercase tracking-widest ${isLimitReached ? 'text-red-600' : 'text-slate-400'}`}>{user.planType} Account</p>
                      <p className={`text-2xl font-black ${isLimitReached ? 'text-red-700' : 'text-slate-900'}`}>{availableCredits} <span className="text-[10px] font-bold text-slate-400">Left</span></p>
                   </div>
                </div>
                {isLimitReached && (
                  <Link to="/pricing" className="bg-indigo-600 text-white px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest shadow-lg">Upgrade</Link>
                )}
              </div>
            </div>
          </div>

          <form onSubmit={handleGenerate} className={`bg-white rounded-[32px] shadow-2xl shadow-slate-200 border border-slate-100 p-8 md:p-12 transition-all ${isLimitReached ? 'opacity-40 grayscale pointer-events-none' : 'opacity-100'}`}>
            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Budget Range</label>
                <select disabled={loading} value={prefs.budgetRange} onChange={e => setPrefs({...prefs, budgetRange: e.target.value})} className="w-full bg-slate-50 border-2 border-slate-50 rounded-2xl px-5 py-4 focus:bg-white focus:border-indigo-600 outline-none font-bold text-slate-900 text-sm transition-all">
                  <option>Rs. 0 - Rs. 50,000</option>
                  <option>Rs. 50,000 - Rs. 2 Lakh</option>
                  <option>Rs. 2 Lakh - Rs. 10 Lakh</option>
                  <option>Rs. 10 Lakh +</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Shehar / Region</label>
                <input disabled={loading} type="text" placeholder="e.g. Karachi, Lahore, Gawadar" required value={prefs.location} onChange={e => setPrefs({...prefs, location: e.target.value})} className="w-full bg-slate-50 border-2 border-slate-50 rounded-2xl px-5 py-4 focus:bg-white focus:border-indigo-600 outline-none font-bold text-slate-900 text-sm transition-all" />
              </div>
              <div className="space-y-2 md:col-span-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Dilchaspi (Industry)</label>
                <input disabled={loading} type="text" placeholder="Food, Tech, Education, Handicrafts..." required value={prefs.industryInterest} onChange={e => setPrefs({...prefs, industryInterest: e.target.value})} className="w-full bg-slate-50 border-2 border-slate-50 rounded-2xl px-5 py-4 focus:bg-white focus:border-indigo-600 outline-none font-bold text-slate-900 text-sm transition-all" />
              </div>
              <div className="space-y-2 md:col-span-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Aap Ke Skills & Experience</label>
                <textarea disabled={loading} placeholder="Sales, Cooking, Digital Marketing, Graphics, etc." required rows={3} value={prefs.skills} onChange={e => setPrefs({...prefs, skills: e.target.value})} className="w-full bg-slate-50 border-2 border-slate-50 rounded-2xl px-5 py-4 focus:bg-white focus:border-indigo-600 outline-none font-bold text-slate-900 text-sm resize-none transition-all" />
              </div>
            </div>

            {error && <div className="mt-6 text-red-500 text-xs font-bold text-center bg-red-50 p-4 rounded-xl border border-red-100">{error}</div>}

            <button type="submit" disabled={loading} className="w-full mt-10 bg-indigo-600 text-white py-5 rounded-2xl font-black text-xl hover:bg-indigo-700 shadow-xl shadow-indigo-100 transition-all flex items-center justify-center gap-3 active:scale-[0.98]">
              {loading ? (
                <>
                  <Loader2 className="animate-spin" size={24} />
                  <span>Thinking Deeply...</span>
                </>
              ) : (
                "Generate My Business Plan"
              )}
            </button>
          </form>
        </div>
      ) : (
        <div className="bg-white rounded-[32px] border border-slate-100 shadow-xl overflow-hidden animate-in">
          <div className="p-8 border-b border-slate-50">
            <h2 className="text-2xl font-black text-slate-900 flex items-center gap-2">
               <History className="text-indigo-600" /> Transaction History
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left min-w-[500px]">
              <thead className="bg-slate-50 text-slate-400 text-[9px] font-black uppercase tracking-widest">
                <tr>
                  <th className="px-8 py-5">Date</th>
                  <th className="px-8 py-5">Plan</th>
                  <th className="px-8 py-5">Amount</th>
                  <th className="px-8 py-5">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {paymentHistory.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-8 py-10 text-center text-slate-400 font-medium">No transactions found.</td>
                  </tr>
                ) : (
                  paymentHistory.map((req) => (
                    <tr key={req.id} className="text-xs hover:bg-slate-50 transition-colors">
                      <td className="px-8 py-5 text-slate-500 font-bold">{new Date(req.timestamp).toLocaleDateString()}</td>
                      <td className="px-8 py-5 font-black text-indigo-600 uppercase">{req.plan}</td>
                      <td className="px-8 py-5 font-black">{req.amount}</td>
                      <td className="px-8 py-5">
                        <span className={`px-3 py-1 rounded-lg font-black text-[9px] uppercase ${req.status === 'approved' ? 'bg-emerald-50 text-emerald-600' : req.status === 'pending' ? 'bg-amber-50 text-amber-600' : 'bg-red-50 text-red-600'}`}>
                          {req.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;