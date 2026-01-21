
import React, { useState, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Users, Star, TrendingUp, CreditCard, Filter, Search, Download, Clock, CheckCircle, XCircle, RotateCcw, Trash2, MoreVertical } from 'lucide-react';
import { User, PaymentRequest } from '../types';

interface AdminDashboardProps {
  users: User[];
  paymentRequests: PaymentRequest[];
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
  onDeleteUser: (email: string) => void;
  onResetUsage: (email: string) => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ users, paymentRequests, onApprove, onReject, onDeleteUser, onResetUsage }) => {
  const [activeTab, setActiveTab] = useState<'stats' | 'payments' | 'users'>('stats');
  const [payStatusFilter, setPayStatusFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [payPlanFilter, setPayPlanFilter] = useState<'all' | 'Starter' | 'Pro'>('all');
  const [userSearchTerm, setUserSearchTerm] = useState('');

  const filteredPayments = useMemo(() => {
    return paymentRequests.filter(req => {
      const matchesStatus = payStatusFilter === 'all' || req.status === payStatusFilter;
      const matchesPlan = payPlanFilter === 'all' || req.plan === payPlanFilter;
      return matchesStatus && matchesPlan;
    });
  }, [paymentRequests, payStatusFilter, payPlanFilter]);

  const filteredUsers = useMemo(() => {
    return users.filter(u => 
      u.name.toLowerCase().includes(userSearchTerm.toLowerCase()) || 
      u.email.toLowerCase().includes(userSearchTerm.toLowerCase())
    );
  }, [users, userSearchTerm]);

  const categoryData = [
    { name: 'Food', value: 420 },
    { name: 'Tech', value: 310 },
    { name: 'Retail', value: 540 },
    { name: 'Services', value: 280 },
    { name: 'Agri', value: 190 },
  ];

  const COLORS = ['#4f46e5', '#8b5cf6', '#ec4899', '#f43f5e', '#f59e0b'];

  // Fix: Corrected syntax error in 'Pending' stat by adding .length and fixing property structure
  const stats = [
    { label: 'Total Users', value: users.length, change: '+12%', icon: <Users className="text-indigo-600" /> },
    { label: 'Paid Members', value: users.filter(u => u.isPaid).length, icon: <Star className="text-emerald-600" /> },
    { label: 'Pending', value: paymentRequests.filter(p => p.status === 'pending').length, icon: <Clock className="text-amber-600" /> },
    { label: 'Revenue', value: 'PKR ' + paymentRequests.filter(p => p.status === 'approved').reduce((acc, curr) => acc + parseInt(curr.amount.replace(/\D/g, '') || "0"), 0).toLocaleString(), icon: <TrendingUp className="text-blue-600" /> },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 mb-1 tracking-tight">Admin Control Center</h1>
          <p className="text-slate-500 font-medium">Platform operations and payment verification dashboard.</p>
        </div>
        <div className="flex gap-2 bg-white p-1 rounded-2xl border border-slate-200 shadow-sm">
          {['stats', 'payments', 'users'].map(tab => (
            <button 
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === tab ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-800'}`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {activeTab === 'stats' && (
        <div className="animate-in fade-in duration-500 space-y-10">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat, i) => (
              <div key={i} className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-xl shadow-slate-200/40">
                <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center mb-4">{stat.icon}</div>
                <p className="text-slate-400 text-[10px] font-black uppercase mb-1">{stat.label}</p>
                <p className="text-2xl font-black text-slate-900">{stat.value}</p>
              </div>
            ))}
          </div>

          <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-xl shadow-slate-200/40">
            <h3 className="font-black text-xl text-slate-900 mb-10">Market Interest by Category</h3>
            <div className="h-80 w-full" style={{ minHeight: '320px' }}>
              <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                <BarChart data={categoryData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 12, fontWeight: 'bold', fill: '#94a3b8'}} />
                  <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fontWeight: 'bold', fill: '#94a3b8'}} />
                  <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{borderRadius: '24px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)'}} />
                  <Bar dataKey="value" radius={[10, 10, 0, 0]} barSize={40}>
                    {categoryData.map((entry, index) => <Cell key={index} fill={COLORS[index % COLORS.length]} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'payments' && (
        <div className="bg-white rounded-[40px] border border-slate-100 shadow-xl shadow-slate-200/40 overflow-hidden">
          <div className="p-8 border-b border-slate-50 flex flex-col md:flex-row justify-between gap-6">
            <h3 className="text-2xl font-black text-slate-900">Payment Approvals</h3>
            <div className="flex gap-2">
              <select value={payStatusFilter} onChange={e => setPayStatusFilter(e.target.value as any)} className="bg-slate-50 border-none rounded-xl px-4 py-2 text-xs font-black uppercase">
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
              </select>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50 text-[10px] font-black uppercase text-slate-400">
                <tr>
                  <th className="px-10 py-6">Customer</th>
                  <th className="px-10 py-6">TID</th>
                  <th className="px-10 py-6">Amount</th>
                  <th className="px-10 py-6">Status</th>
                  <th className="px-10 py-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredPayments.map(req => (
                  <tr key={req.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-10 py-6">
                      <div className="font-black text-slate-900">{req.userName}</div>
                      <div className="text-[10px] text-slate-400 font-bold">{req.userEmail}</div>
                    </td>
                    <td className="px-10 py-6 font-mono text-xs font-bold text-indigo-600">{req.transactionId}</td>
                    <td className="px-10 py-6 font-black text-slate-900">{req.amount}</td>
                    <td className="px-10 py-6">
                      <span className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase ${req.status === 'pending' ? 'bg-amber-50 text-amber-600' : req.status === 'approved' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                        {req.status}
                      </span>
                    </td>
                    <td className="px-10 py-6 text-right">
                      {req.status === 'pending' && (
                        <div className="flex justify-end gap-2">
                          <button onClick={() => onApprove(req.id)} className="p-2 bg-emerald-50 text-emerald-600 rounded-lg hover:bg-emerald-600 hover:text-white transition-all"><CheckCircle size={18} /></button>
                          <button onClick={() => onReject(req.id)} className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-600 hover:text-white transition-all"><XCircle size={18} /></button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'users' && (
        <div className="bg-white rounded-[40px] border border-slate-100 shadow-xl shadow-slate-200/40 overflow-hidden">
          <div className="p-8 border-b border-slate-50 flex justify-between items-center">
            <h3 className="text-2xl font-black text-slate-900">User Management</h3>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
              <input type="text" placeholder="Search users..." value={userSearchTerm} onChange={e => setUserSearchTerm(e.target.value)} className="pl-10 pr-4 py-2 bg-slate-50 rounded-xl border-none outline-none text-sm font-bold w-64" />
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50 text-[10px] font-black uppercase text-slate-400">
                <tr>
                  <th className="px-10 py-6">User</th>
                  <th className="px-10 py-6">Plan</th>
                  <th className="px-10 py-6 text-center">Usage</th>
                  <th className="px-10 py-6 text-right">Control</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredUsers.map((u, i) => (
                  <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-10 py-6">
                      <div className="font-black text-slate-900">{u.name}</div>
                      <div className="text-[10px] text-slate-400 font-bold uppercase">{u.email}</div>
                    </td>
                    <td className="px-10 py-6">
                      <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase ${u.isPaid ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-500'}`}>
                        {u.planType}
                      </span>
                    </td>
                    <td className="px-10 py-6 text-center font-black text-slate-900">{u.freeIdeasUsed}/3</td>
                    <td className="px-10 py-6 text-right">
                      <div className="flex justify-end gap-2">
                        <button onClick={() => onResetUsage(u.email)} className="p-2 bg-amber-50 text-amber-600 rounded-lg hover:bg-amber-600 hover:text-white transition-all"><RotateCcw size={16} /></button>
                        {!u.isAdmin && <button onClick={() => onDeleteUser(u.email)} className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-600 hover:text-white transition-all"><Trash2 size={16} /></button>}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
