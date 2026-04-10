import React, { useState } from 'react';
import { db } from '../lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';
import { ClipboardCheck, User, ShieldCheck } from 'lucide-react';

interface AssessmentFormProps {
  patientId: string;
  onSuccess?: () => void;
}

export const AssessmentForm: React.FC<AssessmentFormProps> = ({ patientId, onSuccess }) => {
  const { user } = useAuth();
  const [assessorName, setAssessorName] = useState(user?.name || '');
  const [assessorRole, setAssessorRole] = useState<'medical_doctor' | 'other_practitioner'>('medical_doctor');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsSubmitting(true);
    try {
      if (patientId.startsWith('mock-')) {
        const mockAssessment = {
          id: `mock-assessment-${Date.now()}`,
          assessorName,
          assessorRole,
          notes,
          signed: true,
          signatureTimestamp: new Date().toISOString(),
        };
        const saved = localStorage.getItem(`mhca_mock_assessments_${patientId}`);
        const assessments = saved ? JSON.parse(saved) : [];
        localStorage.setItem(`mhca_mock_assessments_${patientId}`, JSON.stringify([mockAssessment, ...assessments]));
        
        setNotes('');
        if (onSuccess) onSuccess();
        return;
      }

      const assessmentsRef = collection(db, 'patients', patientId, 'assessments');
      
      await addDoc(assessmentsRef, {
        assessorName,
        assessorRole,
        notes,
        signed: true,
        signatureTimestamp: serverTimestamp(),
      });

      setNotes('');
      if (onSuccess) onSuccess();
    } catch (error: any) {
      console.error('Error adding assessment:', error);
      if (error.code === 'permission-denied') {
        alert('Conflict: A medical doctor assessment may already exist or you lack permissions.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (user?.role !== 'clinician' && user?.role !== 'admin') {
    return null;
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
      <div className="p-6 border-b border-slate-50 bg-slate-50/50">
        <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
          <ClipboardCheck className="text-blue-500" size={20} />
          MHCA-05 Independent Assessment
        </h3>
        <p className="text-xs text-slate-500 mt-1">Record findings for the mandatory 72-hour observation period.</p>
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-500 uppercase">Assessor Name</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input
                type="text"
                required
                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500"
                value={assessorName}
                onChange={(e) => setAssessorName(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-500 uppercase">Assessor Role</label>
            <select
              className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500"
              value={assessorRole}
              onChange={(e) => setAssessorRole(e.target.value as any)}
            >
              <option value="medical_doctor">Medical Doctor</option>
              <option value="other_practitioner">Other Practitioner</option>
            </select>
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-xs font-bold text-slate-500 uppercase">Clinical Notes</label>
          <textarea
            required
            rows={4}
            className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter detailed clinical findings and recommendations..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </div>

        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center gap-2 text-green-600">
            <ShieldCheck size={16} />
            <span className="text-[10px] font-bold uppercase tracking-wider">Digital Signature Active</span>
          </div>
          <button
            type="submit"
            disabled={isSubmitting}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg font-bold text-sm hover:bg-blue-700 transition-all disabled:opacity-50 shadow-lg shadow-blue-600/20"
          >
            {isSubmitting ? 'Saving...' : 'Sign & Submit Assessment'}
          </button>
        </div>
      </form>
    </div>
  );
};
