
import React from 'react';
import { Link } from 'react-router-dom';
import { Rocket, Target, Zap, CheckCircle, ArrowRight } from 'lucide-react';
import { User } from '../types';

interface LandingPageProps {
  user: User | null;
}

const LandingPage: React.FC<LandingPageProps> = ({ user }) => {
  return (
    <div className="overflow-x-hidden">
      <section className="relative pt-20 pb-24 md:pt-32 md:pb-40 bg-white">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 bg-indigo-50 text-indigo-700 px-4 py-1.5 rounded-full text-sm font-semibold mb-8">
            <Zap size={16} />
            <span>AI Se Chalaen Apna Karobar</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-extrabold text-slate-900 tracking-tight mb-6 leading-tight">
            Apne Hunner Ko <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-600">Kamiyab Business</span> Mein Badlein
          </h1>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto mb-10 leading-relaxed">
            Khwab dekhna chorrein, kaam shuru karein. Apne budget aur hunner ke mutabiq naye karobari ideas hasil karein.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              to={user ? "/dashboard" : "/login"}
              className="bg-indigo-600 text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-indigo-700 transition-all shadow-xl hover:shadow-indigo-200 flex items-center justify-center gap-2 group"
            >
              Pehla Idea Banayein
              <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <div className="mt-20 relative max-w-4xl mx-auto">
            <div className="aspect-[16/9] bg-slate-100 rounded-2xl shadow-2xl border border-slate-200 overflow-hidden relative">
              <img 
                src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=1000" 
                alt="Karobar Dashboard" 
                className="w-full h-full object-cover opacity-80"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent" />
            </div>
          </div>
        </div>
      </section>

      <section className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Ye Kaise Kaam Karta Hai?</h2>
            <p className="text-slate-600">4 asaan steps mein apna naya safar shuru karein</p>
          </div>
          <div className="grid md:grid-cols-4 gap-8">
            {[
              { icon: <Target className="text-indigo-600" />, title: 'Profile Banayein', desc: 'Apna budget, shehar, aur dilchaspi batayein.' },
              { icon: <Rocket className="text-indigo-600" />, title: 'AI Dimagh', desc: 'Humari AI aapke liye behtareen ideas chunay gi.' },
              { icon: <CheckCircle className="text-indigo-600" />, title: 'Tafseelat Dekhein', desc: 'Poora roadmap aur SWOT analysis hasil karein.' },
              { icon: <Rocket className="text-indigo-600" />, title: 'Kaam Shuru!', desc: 'Apna plan download karein aur pehla qadam uthaen.' }
            ].map((step, idx) => (
              <div key={idx} className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
                <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center mb-6">
                  {step.icon}
                </div>
                <h3 className="text-xl font-bold mb-3">{step.title}</h3>
                <p className="text-slate-600 text-sm leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
