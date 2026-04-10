import React from 'react';
import { FileText, ShieldCheck, AlertTriangle, CheckCircle2 } from 'lucide-react';

export const Compliance = () => {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Compliance Tracking</h1>
        <p className="text-slate-500">Monitor adherence to Mental Health Care Act regulations.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm space-y-6">
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <ShieldCheck className="text-green-500" size={24} />
            Regulatory Status
          </h2>
          <div className="space-y-4">
            {[
              { label: 'MHCA-04 Intake Completion', status: '98%', color: 'text-green-600' },
              { label: '72h Observation Adherence', status: '92%', color: 'text-green-600' },
              { label: 'Review Board Notification Time', status: '85%', color: 'text-amber-600' }
            ].map((item, i) => (
              <div key={i} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                <span className="text-sm font-medium text-slate-700">{item.label}</span>
                <span className={`font-bold ${item.color}`}>{item.status}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm space-y-6">
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <AlertTriangle className="text-amber-500" size={24} />
            Pending Actions
          </h2>
          <div className="space-y-4">
            {[
              { patient: 'Thabo Mbeki', action: 'Missing MHCA-05 (Second)', due: '2h' },
              { patient: 'Zanele Sithole', action: 'Review Board Signature', due: 'Overdue' }
            ].map((item, i) => (
              <div key={i} className="flex items-center justify-between p-4 border border-slate-100 rounded-xl">
                <div>
                  <p className="text-sm font-bold text-slate-900">{item.patient}</p>
                  <p className="text-xs text-slate-500">{item.action}</p>
                </div>
                <span className="text-xs font-bold px-2 py-1 bg-red-50 text-red-600 rounded-md">{item.due}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-slate-900 text-white p-8 rounded-2xl shadow-xl shadow-slate-900/20">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2">
            <h3 className="text-xl font-bold">Annual Compliance Audit</h3>
            <p className="text-slate-400 text-sm">The next regulatory audit is scheduled for May 15th, 2026.</p>
          </div>
          <button className="px-6 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all">
            Prepare Audit Pack
          </button>
        </div>
      </div>
    </div>
  );
};
