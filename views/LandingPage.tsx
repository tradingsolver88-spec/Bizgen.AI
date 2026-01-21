import React from 'react';
import { Link } from 'react-router-dom';
import { Rocket, Target, Zap, CheckCircle, ArrowRight, Star } from 'lucide-react';
import { User } from '../types';

interface LandingPageProps {
  user: User | null;
}

const LandingPage: React.FC<LandingPageProps> = ({ user }) => {
  return (
    <div className="overflow-x-hidden">
      {/* Hero Section */}
      <section className="relative pt-20 pb-24 md:pt-32 md:pb-40 bg-white">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 bg-indigo-50 text-indigo-700 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest mb-8 border border-indigo-100">
            <Zap size={14} className="fill-indigo-600" />
            <span>AI Powered Karobar Generator</span>
          </div>
          <h1 className="text-4xl md:text-7xl font-black text-slate-900 tracking-tight mb-6 leading-[1.1]">
            Pakistan Mein Apna <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-indigo-400">Karobar Shuru Karein</span>
          </h1>
          <p className="text-lg md:text-xl text-slate-500 max-w-2xl mx-auto mb-10 leading-relaxed font-medium">
            Apne budget aur skills ke mutabiq personalized business ideas aur roadmap hasil karein. Humari AI aapko kamiyabi ki taraf le jayegi.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link 
              to={user ? "/dashboard" : "/login"}
              className="bg-indigo-600 text-white px-10 py-5 rounded-[20px] font-black text-lg hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 flex items-center justify-center gap-3 active:scale-95 group w-full sm:w-auto"
            >
              Get Started Now
              <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link 
              to="/pricing"
              className="text-slate-600 px-10 py-5 rounded-[20px] font-black text-lg border-2 border-slate-100 hover:bg-slate-50 transition-all w-full sm:w-auto"
            >
              Check Pricing
            </Link>
          </div>

          <div className="mt-20 flex justify-center items-center gap-8 opacity-50 grayscale hover:grayscale-0 transition-all">
             <div className="flex items-center gap-2 text-sm font-bold"><Star size={16} fill="currentColor" /> Trusted by 500+ Users</div>
             <div className="flex items-center gap-2 text-sm font-bold"><Rocket size={16} fill="currentColor" /> 1000+ Ideas Generated</div>
          </div>
        </div>
      </section>

      {/* Steps Section */}
      <section className="py-24 bg-slate-50 border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.3em] mb-4">The Process</h2>
            <h3 className="text-3xl md:text-4xl font-black text-slate-900">4 Asaan Steps Mein Apna Plan Banayein</h3>
          </div>
          <div className="grid md:grid-cols-4 gap-8">
            {[
              { icon: <Target />, title: 'Profile Details', desc: 'Apna budget aur skills batayein.' },
              { icon: <Zap />, title: 'AI Synthesis', desc: 'Humari AI aapke liye ideas generate karegi.' },
              { icon: <CheckCircle />, title: 'Full Roadmap', desc: 'Poora step-by-step implementation plan.' },
              { icon: <Rocket />, title: 'Launch Time', desc: 'Apne khwab ko haqiqat mein badlein.' }
            ].map((step, idx) => (
              <div key={idx} className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm hover:shadow-xl hover:translate-y-[-4px] transition-all">
                <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mb-6">
                  {React.cloneElement(step.icon as React.ReactElement, { size: 28 })}
                </div>
                <h3 className="text-xl font-black mb-3 text-slate-900">{step.title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed font-medium">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;