import React, { useState, useEffect } from 'react';
import { calculateRiskScore } from '../lib/riskEngine';
import { Activity, AlertTriangle, ShieldAlert, MessageSquare, RefreshCw } from 'lucide-react';
import { cn } from '../lib/utils';

export const RiskDashboard = () => {
  const [patients, setPatients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/mock-patients.json')
      .then(res => res.json())
      .then(data => {
        setPatients(data);
        setLoading(false);
      });
  }, []);

  const handleFollowUp = (patientName: string) => {
    console.log(`[FOLLOW-UP] Triggered notification for ${patientName}`);
    alert(`Notification queued for ${patientName}. Placeholder for SMS/WhatsApp integration.`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="animate-spin text-blue-500" size={32} />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
            <ShieldAlert className="text-red-500" size={32} />
            AI Risk Dashboard
          </h1>
          <p className="text-slate-500 mt-1">Rule-based clinical risk scoring and early warning system.</p>
        </div>
        <div className="bg-amber-50 border border-amber-200 p-3 rounded-xl flex items-center gap-3">
          <AlertTriangle className="text-amber-600" size={20} />
          <p className="text-xs text-amber-800 font-medium max-w-xs">
            *Mock demonstration. Actual model will be trained on local clinical data for POPIA compliance.
          </p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Patient</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">MHCA ID</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">Risk Score</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Risk Level</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {patients.map((patient) => {
                const risk = calculateRiskScore(patient);
                return (
                  <tr key={patient.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-bold text-slate-900">{patient.name}</div>
                      <div className="text-xs text-slate-500">{patient.status}</div>
                    </td>
                    <td className="px-6 py-4 font-mono text-xs text-slate-600">{patient.mhcaId}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center">
                        <div className="w-12 h-12 rounded-full border-4 border-slate-100 flex items-center justify-center font-bold text-slate-700">
                          {risk.score}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={cn(
                        "px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider",
                        risk.color
                      )}>
                        {risk.level}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleFollowUp(patient.name)}
                        className="inline-flex items-center gap-2 bg-slate-900 text-white px-4 py-2 rounded-lg text-xs font-bold hover:bg-slate-800 transition-all"
                      >
                        <MessageSquare size={14} />
                        Trigger Follow-Up
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 bg-white rounded-2xl border border-slate-100 shadow-sm space-y-2">
          <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
            <Activity size={20} />
          </div>
          <h3 className="font-bold text-slate-900">Real-time Monitoring</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Scores are recalculated every time patient data is updated or observation milestones are reached.
          </p>
        </div>
        <div className="p-6 bg-white rounded-2xl border border-slate-100 shadow-sm space-y-2">
          <div className="w-10 h-10 bg-red-50 text-red-600 rounded-xl flex items-center justify-center">
            <ShieldAlert size={20} />
          </div>
          <h3 className="font-bold text-slate-900">Escalation Protocol</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            High-risk patients are automatically flagged for Review Board priority and senior clinician oversight.
          </p>
        </div>
        <div className="p-6 bg-white rounded-2xl border border-slate-100 shadow-sm space-y-2">
          <div className="w-10 h-10 bg-green-50 text-green-600 rounded-xl flex items-center justify-center">
            <RefreshCw size={20} />
          </div>
          <h3 className="font-bold text-slate-900">FHIR R4 Ready</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Risk scores can be exported via FHIR R4 APIs for integration with national health information systems.
          </p>
        </div>
      </div>
    </div>
  );
};
