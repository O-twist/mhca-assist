import React from 'react';
import { Bell, Clock, AlertCircle, CheckCircle2, MessageSquare } from 'lucide-react';

export const Notifications = () => {
  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Notifications</h1>
          <p className="text-slate-500">Stay updated on patient status and system alerts.</p>
        </div>
        <button className="text-sm font-bold text-blue-600 hover:text-blue-700">Mark all as read</button>
      </div>

      <div className="space-y-4">
        {[
          {
            icon: <Clock className="text-amber-500" />,
            title: 'Observation Deadline Approaching',
            desc: 'Patient Thabo Mbeki has 12 hours remaining in the observation window.',
            time: '10 mins ago',
            unread: true
          },
          {
            icon: <AlertCircle className="text-red-500" />,
            title: 'Discharge Request Rejected',
            desc: 'The Review Board has requested more information for Zanele Sithole.',
            time: '2 hours ago',
            unread: true
          },
          {
            icon: <CheckCircle2 className="text-green-500" />,
            title: 'Assessment Signed',
            desc: 'Dr. Smith has signed the MHCA-05 for David Gumede.',
            time: '5 hours ago',
            unread: false
          },
          {
            icon: <MessageSquare className="text-blue-500" />,
            title: 'System Update',
            desc: 'MHCAssist v1.2 is now live with improved reporting features.',
            time: '1 day ago',
            unread: false
          }
        ].map((note, i) => (
          <div 
            key={i} 
            className={`p-6 rounded-2xl border transition-all cursor-pointer flex gap-4 ${
              note.unread ? 'bg-white border-blue-100 shadow-md shadow-blue-600/5' : 'bg-slate-50/50 border-slate-100'
            }`}
          >
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
              note.unread ? 'bg-blue-50' : 'bg-slate-100'
            }`}>
              {note.icon}
            </div>
            <div className="flex-1 space-y-1">
              <div className="flex items-center justify-between">
                <h3 className={`font-bold ${note.unread ? 'text-slate-900' : 'text-slate-600'}`}>{note.title}</h3>
                <span className="text-xs text-slate-400">{note.time}</span>
              </div>
              <p className="text-sm text-slate-500 leading-relaxed">{note.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
