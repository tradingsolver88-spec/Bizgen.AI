
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Bookmark, Download, ArrowLeft, PieChart, TrendingUp, ListChecks, Lock, Sparkles, CheckCircle, MessageSquare, Send, Printer } from 'lucide-react';
import { BusinessIdea, User } from '../types';
import { refineIdea } from '../services/geminiService';

interface IdeaResultsProps {
  onSave: (idea: BusinessIdea) => void;
  savedIds: string[];
  user: User | null;
}

const IdeaResults: React.FC<IdeaResultsProps> = ({ onSave, savedIds, user }) => {
  const [ideas, setIdeas] = useState<BusinessIdea[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [activeTab, setActiveTab] = useState<'roadmap' | 'analysis' | 'revenue' | 'chat'>('roadmap');
  const [showAutoSaveNotif, setShowAutoSaveNotif] = useState(true);
  
  const [chatInput, setChatInput] = useState('');
  const [chatHistory, setChatHistory] = useState<{role: 'user' | 'ai', text: string}[]>([]);
  const [isTyping, setIsTyping] = useState(false);

  const isPaid = user?.isPaid || user?.isAdmin;

  useEffect(() => {
    const saved = localStorage.getItem('biz_last_results');
    if (saved) setIdeas(JSON.parse(saved));
    const timer = setTimeout(() => setShowAutoSaveNotif(false), 5000);
    return () => clearTimeout(timer);
  }, []);

  if (ideas.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <h2 className="text-2xl font-bold mb-4 text-slate-400">Abhi koi idea nahi bana.</h2>
        <Link to="/dashboard" className="bg-indigo-600 text-white px-8 py-3 rounded-xl font-bold">Wapis Jayein</Link>
      </div>
    );
  }

  const idea = ideas[selectedIndex];

  const handlePrint = () => {
    if (!isPaid) return;
    window.print();
  };

  const handleChatSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || isTyping) return;
    const userMsg = chatInput;
    setChatInput('');
    setChatHistory(prev => [...prev, { role: 'user', text: userMsg }]);
    setIsTyping(true);
    try {
      const response = await refineIdea(idea, userMsg);
      setChatHistory(prev => [...prev, { role: 'ai', text: response }]);
    } catch (err) {
      setChatHistory(prev => [...prev, { role: 'ai', text: "Maaf kijiye, kuch masla hua." }]);
    } finally {
      setIsTyping(false);
    }
  };

  const renderUpgradeOverlay = (title: string, desc: string) => (
    <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-white/80 backdrop-blur-md rounded-[40px] p-6 text-center border-2 border-dashed border-indigo-200">
      <div className="w-12 h-12 bg-indigo-600 text-white rounded-full flex items-center justify-center mb-4">
        <Lock size={24} />
      </div>
      <h3 className="text-xl font-black text-slate-900 mb-2">{title}</h3>
      <p className="text-slate-600 text-xs mb-6 max-w-sm font-medium">{desc}</p>
      <Link to="/pricing" className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg">
        Upgrade to Pro
      </Link>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 md:py-12 print:p-0">
      {showAutoSaveNotif && (
        <div className="fixed top-20 right-4 z-[60] bg-slate-900 text-white px-4 py-3 rounded-xl shadow-2xl flex items-center gap-3 animate-in slide-in-from-right duration-500 border border-slate-700 text-xs font-bold">
          <div className="bg-emerald-500 p-1 rounded-full"><CheckCircle size={14} /></div>
          Ideas saved to Library!
        </div>
      )}

      <div className="flex flex-col lg:flex-row gap-8 print:hidden">
        {/* Mobile Idea Selector */}
        <div className="lg:w-1/3 space-y-4">
          <Link to="/dashboard" className="text-slate-500 hover:text-indigo-600 flex items-center gap-2 font-black text-[10px] uppercase tracking-widest mb-4">
            <ArrowLeft size={14} /> Back to Dashboard
          </Link>
          
          <div className="flex lg:flex-col gap-3 overflow-x-auto no-scrollbar pb-2 lg:pb-0">
            {ideas.map((item, idx) => (
              <button
                key={item.id}
                onClick={() => { setSelectedIndex(idx); setActiveTab('roadmap'); setChatHistory([]); }}
                className={`min-w-[200px] lg:min-w-0 flex-shrink-0 text-left p-4 lg:p-6 rounded-[24px] border-2 transition-all ${selectedIndex === idx ? 'bg-indigo-600 border-indigo-600 text-white shadow-xl' : 'bg-white border-slate-100 text-slate-700'}`}
              >
                <p className="font-black text-sm lg:text-lg leading-tight mb-1 truncate">{item.name}</p>
                <p className={`text-[8px] font-black uppercase tracking-widest ${selectedIndex === idx ? 'text-indigo-200' : 'text-slate-400'}`}>Option {idx + 1}</p>
              </button>
            ))}
          </div>
        </div>

        <div className="lg:w-2/3">
          <div className="bg-white rounded-[40px] shadow-2xl border border-slate-100 overflow-hidden">
            <div className="p-6 md:p-10 border-b border-slate-50">
              <div className="flex flex-col md:flex-row items-start justify-between gap-6 mb-8">
                <div className="space-y-2">
                  <h1 className="text-2xl md:text-4xl font-black text-slate-900 tracking-tight leading-tight">{idea.name}</h1>
                  <p className="text-slate-500 font-bold text-sm md:text-lg leading-relaxed">{idea.description}</p>
                </div>
                <button 
                  onClick={handlePrint}
                  className={`${isPaid ? 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-100' : 'bg-slate-200 cursor-not-allowed'} text-white w-full md:w-auto px-6 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-3 transition-all shadow-lg`}
                >
                  {isPaid ? <Printer size={18} /> : <Lock size={16} />}
                  Print Plan
                </button>
              </div>

              <div className="flex gap-1 overflow-x-auto no-scrollbar border-b border-slate-50">
                {[
                  { id: 'roadmap', icon: <ListChecks size={16} />, label: 'Steps' },
                  { id: 'analysis', icon: <PieChart size={16} />, label: 'SWOT', pro: true },
                  { id: 'revenue', icon: <TrendingUp size={16} />, label: 'Money', pro: true },
                  { id: 'chat', icon: <MessageSquare size={16} />, label: 'Refine', pro: true }
                ].map(tab => (
                  <button 
                    key={tab.id} 
                    onClick={() => setActiveTab(tab.id as any)} 
                    className={`flex items-center gap-2 px-6 py-4 font-black text-[10px] uppercase tracking-[0.1em] border-b-4 transition-all whitespace-nowrap ${activeTab === tab.id ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-400'}`}
                  >
                    {tab.icon} {tab.label}
                    {tab.pro && !isPaid && <Lock size={10} className="text-amber-500" />}
                  </button>
                ))}
              </div>
            </div>

            <div className="p-6 md:p-10 bg-slate-50/50 relative min-h-[400px]">
              {activeTab === 'roadmap' && (
                <div className="grid md:grid-cols-2 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div className="space-y-4">
                    <h3 className="text-[10px] font-black text-indigo-500 uppercase tracking-widest mb-4">Implementation Steps</h3>
                    <div className="space-y-3">
                      {idea.firstSteps.map((step, i) => (
                        <div key={i} className="flex gap-4 p-4 bg-white rounded-2xl border border-slate-100 shadow-sm">
                          <span className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-black text-xs flex-shrink-0">{i+1}</span>
                          <p className="text-xs font-bold text-slate-700 leading-relaxed">{step}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm text-center">
                      <h3 className="text-[9px] font-black text-slate-400 mb-3 uppercase tracking-widest">Estimated Budget</h3>
                      <div className="bg-indigo-600 text-white p-4 rounded-xl text-xl font-black">{idea.estimatedBudget}</div>
                    </div>
                    <div className="bg-slate-900 text-white p-6 rounded-[32px] shadow-lg">
                      <h3 className="text-[9px] font-black text-indigo-400 mb-4 uppercase tracking-widest">Resources Needed</h3>
                      <div className="flex flex-wrap gap-2">
                        {idea.resources.map((res, i) => (
                          <span key={i} className="bg-white/10 px-3 py-1.5 rounded-lg text-[10px] font-bold border border-white/10">{res}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'analysis' && (
                <div className="relative min-h-[300px]">
                  {!isPaid && renderUpgradeOverlay("SWOT Analysis Lock", "Unlock detailed market analysis with Pro.")}
                  <div className={`grid md:grid-cols-2 gap-4 animate-in fade-in duration-300 ${!isPaid ? 'blur-md' : ''}`}>
                    <div className="bg-white p-6 rounded-[32px] border border-emerald-100 shadow-sm">
                      <h4 className="text-emerald-600 font-black text-[10px] uppercase mb-4 flex items-center gap-2">Strengths</h4>
                      <ul className="space-y-3">
                        {idea.swot.strengths.map((s, i) => <li key={i} className="text-[11px] font-bold text-slate-600 bg-emerald-50/30 p-2.5 rounded-xl border border-emerald-50">{s}</li>)}
                      </ul>
                    </div>
                    <div className="bg-white p-6 rounded-[32px] border border-red-100 shadow-sm">
                      <h4 className="text-red-600 font-black text-[10px] uppercase mb-4 flex items-center gap-2">Weaknesses</h4>
                      <ul className="space-y-3">
                        {idea.swot.weaknesses.map((s, i) => <li key={i} className="text-[11px] font-bold text-slate-600 bg-red-50/30 p-2.5 rounded-xl border border-red-50">{s}</li>)}
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'revenue' && (
                <div className="relative min-h-[300px]">
                  {!isPaid && renderUpgradeOverlay("Revenue Model Lock", "Complete profit structure for Pro users.")}
                  <div className={`max-w-md mx-auto space-y-4 animate-in fade-in duration-300 ${!isPaid ? 'blur-md' : ''}`}>
                    {idea.revenueStreams.map((stream, i) => (
                      <div key={i} className="bg-white p-6 rounded-[24px] border border-slate-100 flex items-center gap-4 shadow-sm">
                        <div className="w-10 h-10 bg-indigo-600 text-white rounded-xl flex items-center justify-center font-black text-xs">PKR</div>
                        <div className="flex flex-col">
                          <span className="text-[8px] font-black text-slate-400 uppercase">Stream {i+1}</span>
                          <span className="font-black text-sm text-slate-900 leading-tight">{stream}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'chat' && (
                <div className="relative h-full flex flex-col min-h-[400px]">
                   {!isPaid && renderUpgradeOverlay("AI Refiner Lock", "Ask custom implementation questions with Pro.")}
                   <div className={`flex flex-col flex-grow ${!isPaid ? 'blur-md' : ''}`}>
                      <div className="flex-grow space-y-4 mb-6 max-h-[300px] overflow-y-auto p-4 bg-white rounded-[24px] border border-slate-100 no-scrollbar">
                         {chatHistory.length === 0 && (
                           <div className="text-center py-12">
                             <MessageSquare className="mx-auto text-slate-200 mb-2" size={24} />
                             <p className="text-[10px] text-slate-400 font-bold">Ask about marketing or scale...</p>
                           </div>
                         )}
                         {chatHistory.map((msg, i) => (
                           <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                              <div className={`max-w-[85%] p-4 rounded-[20px] text-xs font-bold leading-relaxed ${msg.role === 'user' ? 'bg-indigo-600 text-white rounded-tr-none' : 'bg-slate-100 text-slate-800 rounded-tl-none'}`}>
                                {msg.text}
                              </div>
                           </div>
                         ))}
                         {isTyping && <div className="text-[10px] text-slate-400 animate-pulse font-bold ml-2 italic">AI typing...</div>}
                      </div>
                      <form onSubmit={handleChatSubmit} className="relative">
                         <input 
                           type="text" 
                           value={chatInput}
                           onChange={e => setChatInput(e.target.value)}
                           placeholder="Enter question..."
                           className="w-full bg-white border-2 border-slate-100 rounded-2xl pl-6 pr-14 py-4 focus:border-indigo-600 outline-none font-bold text-xs"
                         />
                         <button type="submit" className="absolute right-2 top-2 bg-indigo-600 text-white p-2 rounded-xl"><Send size={18} /></button>
                      </form>
                   </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IdeaResults;
