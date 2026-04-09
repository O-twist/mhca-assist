import React, { useEffect, useState } from 'react';
import { db, auth } from '../lib/firebase';
import { collection, query, onSnapshot, orderBy, where } from 'firebase/firestore';
import { Patient, UserProfile } from '../types';
import { ObservationTimer } from '../components/ObservationTimer';
import { User, Clock, AlertCircle, CheckCircle2, FileUp, Search, Plus, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import { usePatients } from '../hooks/usePatients';
import { cn } from '../lib/utils';

export const Dashboard = () => {
  const { patients, loading } = usePatients();
  const [searchTerm, setSearchTerm] = useState('');

  const filteredPatients = patients.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.mhcaId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <div className="flex h-64 items-center justify-center">Loading registry...</div>;

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Patient Registry</h1>
          <p className="text-slate-500">Active MHCA observations and assessments.</p>
        </div>
        
        <Link 
          to="/intake"
          className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20"
        >
          <Plus size={20} />
          New Intake
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
              <Users size={24} />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-500 uppercase tracking-wider">Total Patients</p>
              <p className="text-2xl font-black text-slate-900">{patients.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-orange-50 text-orange-600 rounded-xl flex items-center justify-center">
              <Clock size={24} />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-500 uppercase tracking-wider">Under Observation</p>
              <p className="text-2xl font-black text-slate-900">
                {patients.filter(p => p.status === 'admitted' || p.status === 'observing').length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-green-50 text-green-600 rounded-xl flex items-center justify-center">
              <CheckCircle2 size={24} />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-500 uppercase tracking-wider">Awaiting Review</p>
              <p className="text-2xl font-black text-slate-900">
                {patients.filter(p => p.status === 'awaiting_review').length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Search and List */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 bg-slate-50/50">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
              placeholder="Search by name or MHCA ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-500 text-xs font-bold uppercase tracking-wider">
                <th className="px-6 py-4">Patient Info</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">72h Observation Timer</th>
                <th className="px-6 py-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredPatients.map((patient) => (
                <tr key={patient.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-400">
                        <User size={20} />
                      </div>
                      <div>
                        <p className="font-bold text-slate-900">{patient.name}</p>
                        <p className="text-xs font-mono text-slate-500">{patient.mhcaId}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={cn(
                      "px-3 py-1 rounded-full text-xs font-bold uppercase tracking-tighter",
                      patient.status === 'admitted' ? "bg-blue-100 text-blue-700" :
                      patient.status === 'observing' ? "bg-orange-100 text-orange-700" :
                      patient.status === 'awaiting_review' ? "bg-purple-100 text-purple-700" :
                      "bg-slate-100 text-slate-700"
                    )}>
                      {patient.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {patient.observationDeadline && (
                      <ObservationTimer deadline={patient.observationDeadline.toDate()} className="text-sm" />
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all">
                        <FileUp size={18} />
                      </button>
                      <button className="p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-all">
                        <AlertCircle size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredPatients.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-slate-500">
                    No patients found matching your search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
