
import React from 'react';
import { Link } from 'react-router-dom';
import { Trash2, ExternalLink, Calendar, Search } from 'lucide-react';
import { BusinessIdea } from '../types';

interface SavedIdeasProps {
  ideas: BusinessIdea[];
  onRemove: (id: string) => void;
}

const SavedIdeas: React.FC<SavedIdeasProps> = ({ ideas, onRemove }) => {
  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="flex justify-between items-center mb-10">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Mehfooz Ideas</h1>
          <p className="text-slate-500">Aap ke pas {ideas.length} ideas saved hain.</p>
        </div>
        <Link to="/dashboard" className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-bold shadow-lg hover:bg-indigo-700 transition-all flex items-center gap-2">
          <Search size={20} /> Naya Banayein
        </Link>
      </div>

      {ideas.length === 0 ? (
        <div className="bg-white rounded-3xl border-2 border-dashed border-slate-200 p-20 text-center">
          <h3 className="text-xl font-bold text-slate-700 mb-2">Abhi tak koi idea save nahi kiya</h3>
          <Link to="/dashboard" className="text-indigo-600 font-bold hover:underline">Shuru Karein</Link>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {ideas.map((idea) => (
            <div key={idea.id} className="bg-white rounded-3xl border border-slate-200 shadow-sm hover:shadow-xl transition-all flex flex-col overflow-hidden">
              <div className="p-6 border-b border-slate-50 bg-slate-50/50">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="font-bold text-xl text-slate-900">{idea.name}</h3>
                  <button onClick={() => onRemove(idea.id)} className="p-2 text-slate-400 hover:text-red-500"><Trash2 size={18} /></button>
                </div>
                <p className="text-slate-600 text-sm line-clamp-3 leading-relaxed mb-4">{idea.description}</p>
                <div className="flex items-center gap-1 text-xs font-bold text-slate-400"><Calendar size={14} /> {new Date(idea.generatedAt).toLocaleDateString()}</div>
              </div>
              <div className="p-6 flex-grow bg-white">
                <div className="space-y-4">
                  <div><span className="text-[10px] font-extrabold uppercase text-slate-400 block mb-1">Budget</span><p className="text-slate-700 text-sm font-semibold">{idea.estimatedBudget}</p></div>
                </div>
              </div>
              <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end">
                <button className="flex items-center gap-2 text-indigo-600 text-sm font-bold hover:underline">Poora Plan <ExternalLink size={14} /></button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SavedIdeas;
