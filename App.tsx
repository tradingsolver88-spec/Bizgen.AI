
import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom';
import Navbar from './components/Navbar';
import LandingPage from './views/LandingPage';
import Dashboard from './views/Dashboard';
import IdeaResults from './views/IdeaResults';
import SavedIdeas from './views/SavedIdeas';
import AdminDashboard from './views/AdminDashboard';
import AuthPage from './views/AuthPage';
import PricingPage from './views/PricingPage';
import { User, BusinessIdea, PaymentRequest } from './types';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(() => {
    try {
      const saved = localStorage.getItem('biz_user');
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      return null;
    }
  });

  const [allUsers, setAllUsers] = useState<User[]>(() => {
    try {
      const saved = localStorage.getItem('biz_all_users');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  const [paymentRequests, setPaymentRequests] = useState<PaymentRequest[]>(() => {
    try {
      const saved = localStorage.getItem('biz_payments');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  const [savedIdeas, setSavedIdeas] = useState<BusinessIdea[]>(() => {
    try {
      const saved = localStorage.getItem('biz_saved_ideas');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  // Simplified Persistent Sync
  useEffect(() => {
    if (user) {
      localStorage.setItem('biz_user', JSON.stringify(user));
      // Sync user back into the master user list
      setAllUsers(prev => {
        const index = prev.findIndex(u => u.email.toLowerCase() === user.email.toLowerCase());
        const updated = [...prev];
        if (index > -1) {
          updated[index] = { ...updated[index], ...user };
        } else {
          updated.push(user);
        }
        localStorage.setItem('biz_all_users', JSON.stringify(updated));
        return updated;
      });
    } else {
      localStorage.removeItem('biz_user');
    }
  }, [user]);

  useEffect(() => {
    localStorage.setItem('biz_saved_ideas', JSON.stringify(savedIdeas));
  }, [savedIdeas]);

  useEffect(() => {
    localStorage.setItem('biz_payments', JSON.stringify(paymentRequests));
  }, [paymentRequests]);

  const logout = () => {
    setUser(null);
  };

  const handleAddPayment = (req: Omit<PaymentRequest, 'id' | 'status' | 'timestamp'>) => {
    const newReq: PaymentRequest = {
      ...req,
      id: Math.random().toString(36).substr(2, 9),
      status: 'pending',
      timestamp: new Date().toISOString()
    };
    setPaymentRequests(prev => [...prev, newReq]);
    if (user) {
      setUser({ ...user, paymentStatus: 'pending' });
    }
  };

  const handleApprovePayment = (id: string) => {
    const req = paymentRequests.find(r => r.id === id);
    if (!req) return;

    setPaymentRequests(prev => prev.map(r => r.id === id ? { ...r, status: 'approved' } : r));
    
    setAllUsers(prev => prev.map(u => {
      if (u.email.toLowerCase() === req.userEmail.toLowerCase()) {
        const updated = { 
          ...u, 
          isPaid: true, 
          planType: 'paid' as const,
          paymentStatus: 'approved' as const, 
          credits: (u.credits || 0) + 100 
        };
        // If current logged in user is this person, update their session too
        if (user && user.email.toLowerCase() === u.email.toLowerCase()) {
          setUser(updated);
        }
        return updated;
      }
      return u;
    }));
  };

  const handleRejectPayment = (id: string) => {
    setPaymentRequests(prev => prev.map(r => r.id === id ? { ...r, status: 'rejected' } : r));
    const req = paymentRequests.find(r => r.id === id);
    if (user && req && user.email.toLowerCase() === req.userEmail.toLowerCase()) {
      setUser({ ...user, paymentStatus: 'none' });
    }
  };

  const handleDeleteUser = (email: string) => {
    if (window.confirm(`Kya aap waqai ${email} ko system se delete karna chahte hain?`)) {
      setAllUsers(prev => prev.filter(u => u.email.toLowerCase() !== email.toLowerCase()));
      if (user && user.email.toLowerCase() === email.toLowerCase()) logout();
    }
  };

  const handleResetUsage = (email: string) => {
    if (window.confirm(`Kya aap ${email} ki usage reset karna chahte hain?`)) {
      setAllUsers(prev => prev.map(u => 
        u.email.toLowerCase() === email.toLowerCase() 
          ? { ...u, freeIdeasUsed: 0, planType: 'free', isPaid: false, credits: 0, paymentStatus: 'none' } 
          : u
      ));
      if (user && user.email.toLowerCase() === email.toLowerCase()) {
        setUser({ ...user, freeIdeasUsed: 0, planType: 'free', isPaid: false, credits: 0, paymentStatus: 'none' });
      }
    }
  };

  const saveIdea = (idea: BusinessIdea) => {
    if (!savedIdeas.find(i => i.id === idea.id)) {
      setSavedIdeas([...savedIdeas, idea]);
    }
  };

  const autoSaveMultipleIdeas = (ideas: BusinessIdea[]) => {
    setSavedIdeas(prev => {
      const newIdeas = ideas.filter(idea => !prev.find(p => p.id === idea.id));
      return [...prev, ...newIdeas];
    });
  };

  const removeIdea = (id: string) => {
    setSavedIdeas(savedIdeas.filter(i => i.id !== id));
  };

  return (
    <Router>
      <div className="min-h-screen flex flex-col bg-slate-50">
        <Navbar user={user} onLogout={logout} />
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<LandingPage user={user} />} />
            <Route path="/login" element={<AuthPage setUser={setUser} allUsers={allUsers} currentUser={user} />} />
            <Route path="/pricing" element={<PricingPage user={user} onPaymentSubmit={handleAddPayment} />} />
            <Route 
              path="/dashboard" 
              element={user ? <Dashboard user={user} setUser={setUser} paymentHistory={paymentRequests.filter(p => p.userEmail.toLowerCase() === user.email.toLowerCase())} onAutoSave={autoSaveMultipleIdeas} /> : <Navigate to="/login" />} 
            />
            <Route 
              path="/results" 
              element={user ? <IdeaResults user={user} onSave={saveIdea} savedIds={savedIdeas.map(i => i.id)} /> : <Navigate to="/login" />} 
            />
            <Route 
              path="/saved" 
              element={user ? <SavedIdeas ideas={savedIdeas} onRemove={removeIdea} /> : <Navigate to="/login" />} 
            />
            <Route 
              path="/admin" 
              element={user?.isAdmin ? (
                <AdminDashboard 
                  users={allUsers} 
                  paymentRequests={paymentRequests} 
                  onApprove={handleApprovePayment} 
                  onReject={handleRejectPayment} 
                  onDeleteUser={handleDeleteUser}
                  onResetUsage={handleResetUsage}
                />
              ) : <Navigate to="/" />} 
            />
          </Routes>
        </main>
        <footer className="bg-slate-900 text-white py-12">
          <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-10">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="bg-indigo-600 p-1.5 rounded-lg">
                  <span className="text-white font-black text-xs">AI</span>
                </div>
                <h3 className="text-xl font-bold">BizGen AI</h3>
              </div>
              <p className="text-slate-400 text-sm leading-relaxed">
                Building the future of entrepreneurship in Pakistan. We help visionaries turn skills into sustainable businesses.
              </p>
            </div>
            <div className="flex flex-col gap-3">
              <h4 className="font-bold text-indigo-400 uppercase text-[10px] tracking-[0.2em] mb-2">Navigation</h4>
              <Link to="/pricing" className="text-slate-400 hover:text-white text-sm transition-colors">Pricing</Link>
              <Link to="/login" className="text-slate-400 hover:text-white text-sm transition-colors">Login / Join</Link>
            </div>
            <div className="flex flex-col gap-3">
              <h4 className="font-bold text-indigo-400 uppercase text-[10px] tracking-[0.2em] mb-2">Legal</h4>
              <button className="text-slate-400 hover:text-white text-sm text-left transition-colors">Privacy Policy</button>
              <button className="text-slate-400 hover:text-white text-sm text-left transition-colors">Terms of Service</button>
            </div>
          </div>
          <div className="max-w-7xl mx-auto px-4 mt-12 pt-8 border-t border-slate-800 text-center text-slate-500 text-[10px] font-medium">
            &copy; {new Date().getFullYear()} BizGen AI. Handcrafted with passion in Pakistan.
          </div>
        </footer>
      </div>
    </Router>
  );
};

export default App;
