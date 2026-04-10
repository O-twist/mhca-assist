import React from 'react';
import { BarChart as LucideBarChart, Download, Filter, TrendingUp, ShieldCheck, AlertCircle } from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  PieChart, 
  Pie, 
  Cell,
  Legend
} from 'recharts';

const admissionData = [
  { name: 'Jan', admissions: 45 },
  { name: 'Feb', admissions: 52 },
  { name: 'Mar', admissions: 48 },
  { name: 'Apr', admissions: 61 },
  { name: 'May', admissions: 55 },
  { name: 'Jun', admissions: 67 },
];

const complianceData = [
  { name: 'MHCA-04', completed: 98, pending: 2 },
  { name: 'MHCA-05', completed: 85, pending: 15 },
  { name: 'MHCA-14', completed: 92, pending: 8 },
  { name: 'Consent', completed: 100, pending: 0 },
];

const riskData = [
  { name: 'Low Risk', value: 45, color: '#22c55e' },
  { name: 'Medium Risk', value: 35, color: '#f59e0b' },
  { name: 'High Risk', value: 20, color: '#ef4444' },
];

export const Reports = () => {
  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Clinical Analytics</h1>
          <p className="text-slate-500">Real-time insights from MHCA patient data.</p>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-50 transition-colors">
            <Filter size={16} />
            Filter
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20">
            <Download size={16} />
            Export All
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Admission Trends */}
        <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <TrendingUp className="text-blue-500" size={20} />
                Admission Trends
              </h3>
              <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Last 6 Months</p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-black text-slate-900">328</p>
              <p className="text-[10px] font-bold text-green-500 uppercase">+12% vs LY</p>
            </div>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={admissionData}>
                <defs>
                  <linearGradient id="colorAdmissions" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 500 }}
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 500 }}
                />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#fff', borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  itemStyle={{ fontSize: '12px', fontWeight: 'bold' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="admissions" 
                  stroke="#3b82f6" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#colorAdmissions)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Compliance Distribution */}
        <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <ShieldCheck className="text-green-500" size={20} />
                Form Compliance
              </h3>
              <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Completion Rates</p>
            </div>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={complianceData} layout="vertical" margin={{ left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                <XAxis type="number" hide />
                <YAxis 
                  dataKey="name" 
                  type="category" 
                  axisLine={false} 
                  tickLine={false}
                  tick={{ fill: '#475569', fontSize: 12, fontWeight: 700 }}
                />
                <Tooltip 
                  cursor={{ fill: '#f8fafc' }}
                  contentStyle={{ backgroundColor: '#fff', borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="completed" fill="#3b82f6" radius={[0, 4, 4, 0]} barSize={20} />
                <Bar dataKey="pending" fill="#e2e8f0" radius={[0, 4, 4, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Risk Distribution */}
        <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <AlertCircle className="text-amber-500" size={20} />
                Risk Profile
              </h3>
              <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Current Patient Load</p>
            </div>
          </div>
          <div className="h-[300px] w-full flex items-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={riskData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={8}
                  dataKey="value"
                >
                  {riskData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#fff', borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                <Legend 
                  verticalAlign="middle" 
                  align="right" 
                  layout="vertical"
                  iconType="circle"
                  formatter={(value) => <span className="text-sm font-bold text-slate-600">{value}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-2 gap-6">
          <div className="bg-blue-600 p-6 rounded-3xl text-white space-y-2 shadow-xl shadow-blue-600/20">
            <p className="text-[10px] font-bold uppercase tracking-widest opacity-80">Avg. Stay</p>
            <p className="text-3xl font-black">4.2 Days</p>
            <p className="text-xs font-medium opacity-80">Within MHCA guidelines</p>
          </div>
          <div className="bg-slate-900 p-6 rounded-3xl text-white space-y-2 shadow-xl shadow-slate-900/20">
            <p className="text-[10px] font-bold uppercase tracking-widest opacity-80">Staff Ratio</p>
            <p className="text-3xl font-black">1:8</p>
            <p className="text-xs font-medium opacity-80">Optimal clinical load</p>
          </div>
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-2 col-span-2">
            <div className="flex items-center justify-between">
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">System Health</p>
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                <div className="w-[94%] h-full bg-blue-500"></div>
              </div>
              <span className="text-sm font-black text-slate-900">94%</span>
            </div>
            <p className="text-[10px] text-slate-400 font-medium">Data integrity and sync status</p>
          </div>
        </div>
      </div>
    </div>
  );
};
