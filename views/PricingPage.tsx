
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, Zap, Rocket, ShieldCheck, X, Send, CreditCard, Copy, Info } from 'lucide-react';
import { User, PaymentRequest } from '../types';

interface PricingPageProps {
  user: User | null;
  onPaymentSubmit: (req: Omit<PaymentRequest, 'id' | 'status' | 'timestamp'>) => void;
}

const PricingPage: React.FC<PricingPageProps> = ({ user, onPaymentSubmit }) => {
  const [selectedPlan, setSelectedPlan] = useState<any>(null);
  const [tid, setTid] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const plans = [
    {
      name: 'Starter',
      price: 'Muft',
      desc: 'Pehle 3 ideas bilkul muft hasil karein.',
      features: ['3 Business Ideas', 'Sada Business Models', 'Saved Ideas list', 'Standard Support'],
      cta: 'Shuru Karein',
      highlight: false,
      icon: <Zap className="text-slate-400" />
    },
    {
      name: 'Pro',
      price: 'Rs. 2,500',
      rawPrice: '2500',
      period: '/mahina',
      desc: 'Jo log apna karobar waqai shuru karna chahte hain.',
      features: ['100 Ideas Credits', 'SWOT Analysis Unlocked', 'Revenue Breakdown', 'Priority Support', 'PDF Download'],
      cta: 'Pro Pe Jayein',
      highlight: true,
      icon: <Rocket className="text-indigo-600" />
    }
  ];

  const handlePlanSelection = (plan: any) => {
    if (!user) {
      // Auth Gate: Redirect to login if trying to buy without an account
      navigate('/login');
      return;
    }
    if (plan.name !== 'Starter') {
      setSelectedPlan(plan);
    } else {
      navigate('/dashboard');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setIsSubmitting(true);
    onPaymentSubmit({
      userId: user.email,
      userName: user.name,
      userEmail: user.email,
      plan: selectedPlan.name,
      transactionId: tid,
      amount: selectedPlan.price
    });
    setTimeout(() => {
      setIsSubmitting(false);
      setSelectedPlan(null);
      setTid('');
      alert("Shukriya! Aap ki payment request bhej di gayi hai. Admin ki tasdeeq ke baad aap ka account upgrade ho jaye ga.");
    }, 1000);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-12 md:py-20">
      <div className="text-center mb-12 md:mb-16">
        <h1 className="text-3xl md:text-5xl font-extrabold text-slate-900 mb-4 tracking-tight">Apna Karobari Safar Shuru Karein</h1>
        <p className="text-slate-600 text-sm md:text-lg max-w-2xl mx-auto leading-relaxed">
          Behtareen results ke liye sahi plan ka intekhab karein. Humara AI model aap ke karobar ko kamiyabi ki unchaiyon tak le jaye ga.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8 items-stretch max-w-4xl mx-auto">
        {plans.map((plan, idx) => (
          <div 
            key={idx} 
            className={`relative p-6 md:p-8 rounded-[32px] border transition-all flex flex-col ${plan.highlight ? 'bg-white border-indigo-600 shadow-2xl md:scale-105 z-10' : 'bg-white border-slate-200 shadow-sm'}`}
          >
            {plan.highlight && (
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-indigo-600 text-white px-6 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg">
                Behtareen Choice
              </div>
            )}
            
            <div className="w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-slate-50 flex items-center justify-center mb-6">
              {plan.icon}
            </div>

            <h3 className="text-xl md:text-2xl font-black text-slate-900 mb-2">{plan.name}</h3>
            <div className="flex items-baseline gap-1 mb-4">
              <span className="text-3xl md:text-4xl font-black tracking-tight">{plan.price}</span>
              {plan.period && <span className="text-slate-400 font-bold text-xs uppercase">{plan.period}</span>}
            </div>
            <p className="text-slate-500 text-xs md:text-sm mb-6 leading-relaxed font-medium">{plan.desc}</p>

            <ul className="space-y-3 mb-8 flex-grow">
              {plan.features.map((f, i) => (
                <li key={i} className="flex items-start gap-3 text-xs md:text-sm text-slate-600 font-semibold">
                  <div className="mt-0.5 text-indigo-600 bg-indigo-50 p-0.5 rounded-full flex-shrink-0"><Check size={12} /></div>
                  {f}
                </li>
              ))}
            </ul>

            <button 
              onClick={() => handlePlanSelection(plan)}
              disabled={user?.isPaid || (plan.name === 'Starter' && (user?.freeIdeasUsed || 0) >= 3)}
              className={`w-full py-4 md:py-5 rounded-2xl font-black text-sm md:text-lg transition-all ${plan.highlight ? 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-xl' : 'bg-slate-100 text-slate-900'}`}
            >
              {user?.isPaid ? 'Premium Active' : plan.cta}
            </button>
          </div>
        ))}
      </div>

      {selectedPlan && (
        <div className="fixed inset-0 z-[100] flex items-end md:items-center justify-center p-0 md:p-4 bg-slate-900/80 backdrop-blur-md">
          <div className="bg-white w-full max-w-lg rounded-t-[40px] md:rounded-[40px] shadow-2xl overflow-hidden relative animate-in slide-in-from-bottom-full md:zoom-in duration-300">
            <div className="absolute top-6 right-6 z-10">
              <button 
                onClick={() => setSelectedPlan(null)}
                className="p-2 text-slate-400 hover:text-slate-900 bg-slate-100 rounded-full"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="p-8 md:p-10">
              <div className="flex items-center gap-4 mb-6 md:mb-8">
                <div className="w-12 h-12 bg-indigo-600 text-white rounded-[16px] flex items-center justify-center">
                  <CreditCard size={28} />
                </div>
                <div>
                  <h3 className="text-xl md:text-2xl font-black text-slate-900">Payment Karein</h3>
                  <p className="text-slate-500 font-bold text-[10px] uppercase tracking-wider">{selectedPlan.name} Plan Upgrade</p>
                </div>
              </div>

              <div className="space-y-6 max-h-[70vh] overflow-y-auto no-scrollbar pb-4">
                <div className="relative overflow-hidden bg-gradient-to-br from-indigo-700 to-indigo-900 text-white p-6 md:p-8 rounded-[32px] shadow-xl">
                   <div className="relative space-y-4">
                      <div className="flex justify-between items-center border-b border-white/10 pb-4">
                        <span className="text-indigo-200 text-[10px] font-black uppercase tracking-widest">EasyPaisa</span>
                        <div className="flex items-center gap-2">
                          <button onClick={() => copyToClipboard('03448725929')} className="p-1 hover:bg-white/10 rounded-md transition-all text-white/50 hover:text-white">
                            <Copy size={16} />
                          </button>
                          <span className="font-mono font-black text-lg">0344 8725929</span>
                        </div>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-indigo-200 text-[10px] font-black uppercase tracking-widest">Name</span>
                        <span className="font-black text-sm">MANGA RAM</span>
                      </div>
                      <div className="flex justify-between items-center pt-2">
                        <span className="text-indigo-200 text-[10px] font-black uppercase tracking-widest">Amount</span>
                        <span className="font-black text-2xl tracking-tighter">{selectedPlan.price}</span>
                      </div>
                   </div>
                </div>

                <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100 space-y-3">
                  <h4 className="flex items-center gap-2 font-black text-slate-800 text-[10px] uppercase tracking-widest">
                    <Info size={14} className="text-indigo-600" /> Instructions
                  </h4>
                  <div className="space-y-2">
                    {[
                      { step: 1, text: `Pay ${selectedPlan.price} to EasyPaisa.` },
                      { step: 2, text: "Copy Transaction ID (TID) from SMS." },
                      { step: 3, text: "Submit TID below to unlock." }
                    ].map((item) => (
                      <div key={item.step} className="flex gap-2 items-start">
                        <span className="w-4 h-4 rounded-full bg-indigo-600 text-white flex items-center justify-center font-black text-[8px] flex-shrink-0 mt-0.5">{item.step}</span>
                        <p className="text-xs font-bold text-slate-600">{item.text}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">TID Number</label>
                    <input 
                      required
                      type="text" 
                      value={tid}
                      onChange={(e) => setTid(e.target.value)}
                      placeholder="1029384756" 
                      className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-6 py-4 focus:border-indigo-600 focus:bg-white outline-none font-mono font-bold text-slate-900"
                    />
                  </div>
                  <button 
                    type="submit"
                    disabled={isSubmitting || !tid}
                    className="w-full bg-indigo-600 text-white py-4 rounded-[20px] font-black text-lg hover:bg-indigo-700 active:scale-[0.98] transition-all disabled:opacity-50"
                  >
                    {isSubmitting ? "Submitting..." : "Submit Payment"}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PricingPage;
