
import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
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
    const saved = localStorage.getItem('biz_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [allUsers, setAllUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem('biz_all_users');
    return saved ? JSON.parse(saved) : [];
  });

  const [paymentRequests, setPaymentRequests] = useState<PaymentRequest[]>(() => {
    const saved = localStorage.getItem('biz_payments');
    return saved ? JSON.parse(saved) : [];
  });

  const [savedIdeas, setSavedIdeas] = useState<BusinessIdea[]>(() => {
    const saved = localStorage.getItem('biz_saved_ideas');
    return saved ? JSON.parse(saved) : [];
  });

  // Sync session and "Database"
  useEffect(() => {
    if (user) {
      localStorage.setItem('biz_user', JSON.stringify(user));
      setAllUsers(prev => {
        const exists = prev.find(u => u.email.toLowerCase() === user.email.toLowerCase());
        if (!exists) {
          const updated = [...prev, user];
          localStorage.setItem('biz_all_users', JSON.stringify(updated));
          return updated;
        }
        // Strict mapping to ensure persistent usage counters are never lost
        const updated = prev.map(u => u.email.toLowerCase() === user.email.toLowerCase() ? { ...u, ...user } : u);
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
    localStorage.removeItem('biz_user');
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
    const creditBonus = 100;

    setAllUsers(prev => prev.map(u => {
      if (u.email.toLowerCase() === req.userEmail.toLowerCase()) {
        return { 
          ...u, 
          isPaid: true, 
          planType: 'paid',
          paymentStatus: 'approved', 
          credits: (u.credits || 0) + creditBonus 
        };
      }
      return u;
    }));
    
    if (user && user.email.toLowerCase() === req.userEmail.toLowerCase()) {
      setUser({ 
        ...user, 
        isPaid: true, 
        planType: 'paid',
        paymentStatus: 'approved', 
        credits: (user.credits || 0) + creditBonus 
      });
    }
  };

  const handleRejectPayment = (id: string) => {
    setPaymentRequests(prev => prev.map(r => r.id === id ? { ...r, status: 'rejected' } : r));
    const req = paymentRequests.find(r => r.id === id);
    if (user && req && user.email.toLowerCase() === req.userEmail.toLowerCase()) {
      setUser({ ...user, paymentStatus: 'none' });
    }
  };

  const handleDeleteUser = (email: string) => {
    if (window.confirm(`Kya aap waqai ${email} ko system se delete karna chahte hain? Iska tamam data khatam ho jaye ga.`)) {
      setAllUsers(prev => prev.filter(u => u.email.toLowerCase() !== email.toLowerCase()));
      if (user && user.email.toLowerCase() === email.toLowerCase()) {
        logout();
      }
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
      <div className="min-h-screen flex flex-col">
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
          <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-xl font-bold mb-4">BizGen AI</h3>
              <p className="text-slate-400 text-sm">Building the future of entrepreneurship, one idea at a time.</p>
            </div>
            <div className="flex flex-col gap-2">
              <h4 className="font-bold text-slate-200 uppercase text-xs tracking-widest mb-2">Product</h4>
              <button className="text-slate-400 hover:text-white text-sm text-left">How it works</button>
              <button className="text-slate-400 hover:text-white text-sm text-left">Pricing</button>
              <button className="text-slate-400 hover:text-white text-sm text-left">Success Stories</button>
            </div>
            <div className="flex flex-col gap-2">
              <h4 className="font-bold text-slate-200 uppercase text-xs tracking-widest mb-2">Support</h4>
              <button className="text-slate-400 hover:text-white text-sm text-left">FAQ</button>
              <button className="text-slate-400 hover:text-white text-sm text-left">Contact Us</button>
              <button className="text-slate-400 hover:text-white text-sm text-left">Privacy Policy</button>
            </div>
          </div>
          <div className="max-w-7xl mx-auto px-4 mt-12 pt-8 border-t border-slate-800 text-center text-slate-500 text-xs">
            &copy; 2024 AI Small Business Idea Generator. Handcrafted for founders.
          </div>
        </footer>
      </div>
    </Router>
  );
};

export default App;
