import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { db } from '../lib/firebase';
import { doc, onSnapshot, collection, query, orderBy } from 'firebase/firestore';
import { Patient } from '../types';
import { AssessmentForm } from '../components/AssessmentForm';
import { ObservationTimer } from '../components/ObservationTimer';
import { User, Calendar, Fingerprint, Phone, ShieldCheck, Clock, ClipboardCheck, ArrowLeft, RefreshCw, CheckCircle2, LogOut, X } from 'lucide-react';
import { cn, handleFirestoreError, OperationType } from '../lib/utils';
import { usePatients } from '../hooks/usePatients';
import { useAuth } from '../context/AuthContext';
import { useRole } from '../hooks/useRole';

export const PatientDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { role, loading: roleLoading } = useRole();
  const [patient, setPatient] = useState<Patient | null>(null);
  const [assessments, setAssessments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDischargeModal, setShowDischargeModal] = useState(false);
  const [dischargeReason, setDischargeReason] = useState('');
  const [isDischarging, setIsDischarging] = useState(false);
  const { updatePatientStatus, dischargePatient } = usePatients();

  const isMock = user?.uid.startsWith('mock-');

  useEffect(() => {
    const isMockId = id?.startsWith('mock-');

    if (!id || !user || (roleLoading && !isMock && !isMockId)) {
      setLoading(false);
      return;
    }

    if (isMockId) {
      // Handle mock patient detail
      const savedPatients = localStorage.getItem('mhca_mock_patients');
      if (savedPatients) {
        const mockPatients = JSON.parse(savedPatients);
        const found = mockPatients.find((p: any) => p.id === id);
        if (found) {
          setPatient({
            ...found,
            admissionTimestamp: { toDate: () => new Date(found.admissionTimestamp) },
            observationDeadline: { toDate: () => new Date(found.observationDeadline) }
          });
        }
      }

      // Handle mock assessments
      const savedAssessments = localStorage.getItem(`mhca_mock_assessments_${id}`);
      if (savedAssessments) {
        setAssessments(JSON.parse(savedAssessments).map((a: any) => ({
          ...a,
          signatureTimestamp: { toDate: () => new Date(a.signatureTimestamp) }
        })));
      }
      
      setLoading(false);
      return;
    }

    const unsubscribePatient = onSnapshot(doc(db, 'patients', id), (doc) => {
      if (doc.exists()) {
        setPatient({ id: doc.id, ...doc.data() } as Patient);
      }
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, `patients/${id}`);
    });

    const q = query(collection(db, 'patients', id, 'assessments'), orderBy('signatureTimestamp', 'desc'));
    const unsubscribeAssessments = onSnapshot(q, (snapshot) => {
      setAssessments(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, `patients/${id}/assessments`);
    });

    return () => {
      unsubscribePatient();
      unsubscribeAssessments();
    };
  }, [id, user, isMock, role, roleLoading]);

  const handleStatusChange = async (newStatus: string) => {
    if (!id) return;
    try {
      await updatePatientStatus(id, newStatus);
    } catch (error) {
      // Error handled in hook
    }
  };

  const handleDischarge = async () => {
    if (!id || !dischargeReason.trim()) return;
    setIsDischarging(true);
    try {
      await dischargePatient(id, dischargeReason);
      setShowDischargeModal(false);
      setDischargeReason('');
    } catch (error) {
      // Error handled in hook
    } finally {
      setIsDischarging(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="animate-spin text-blue-500" size={32} />
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-500">Patient not found.</p>
        <button onClick={() => navigate('/')} className="text-blue-600 font-bold mt-4">Return to Dashboard</button>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <button 
        onClick={() => navigate('/')}
        className="flex items-center gap-2 text-slate-500 hover:text-slate-900 transition-colors font-medium"
      >
        <ArrowLeft size={18} />
        Back to Registry
      </button>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-400">
            <User size={32} />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-slate-900">{patient.name}</h1>
            <p className="text-slate-500 font-mono text-sm">{patient.mhcaId}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <select 
            className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-blue-500"
            value={patient.status}
            onChange={(e) => handleStatusChange(e.target.value)}
          >
            <option value="draft">Draft</option>
            <option value="admitted">Admitted</option>
            <option value="observing">Observing</option>
            <option value="awaiting_review">Awaiting Review</option>
            <option value="discharged">Discharged</option>
          </select>
          
          <div className="px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-bold shadow-lg shadow-blue-600/20">
            {patient.status.toUpperCase()}
          </div>

          {patient.status !== 'discharged' && (
            <button
              onClick={() => setShowDischargeModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-xl text-sm font-bold hover:bg-red-100 transition-colors"
            >
              <LogOut size={16} />
              Discharge
            </button>
          )}
        </div>
      </div>

      {showDischargeModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-xl font-bold text-slate-900">
                {role === 'review_board' ? 'Initiate Discharge Request' : 'Discharge Patient'}
              </h3>
              <button onClick={() => setShowDischargeModal(false)} className="text-slate-400 hover:text-slate-600">
                <X size={24} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Reason for Discharge</label>
                <textarea
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm outline-none focus:ring-2 focus:ring-blue-500 min-h-[120px]"
                  placeholder="Provide detailed clinical or administrative reason..."
                  value={dischargeReason}
                  onChange={(e) => setDischargeReason(e.target.value)}
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setShowDischargeModal(false)}
                  className="flex-1 px-6 py-3 bg-slate-100 text-slate-600 rounded-2xl font-bold text-sm hover:bg-slate-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDischarge}
                  disabled={isDischarging || !dischargeReason.trim()}
                  className="flex-1 px-6 py-3 bg-red-600 text-white rounded-2xl font-bold text-sm hover:bg-red-700 transition-colors disabled:opacity-50 shadow-lg shadow-red-600/20"
                >
                  {isDischarging ? 'Processing...' : (role === 'review_board' ? 'Submit Request' : 'Confirm Discharge')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-8">
          {/* Patient Info Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-1">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                <Fingerprint size={14} />
                ID / Passport Number
              </p>
              <p className="text-slate-900 font-medium">{patient.idNumber}</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                <Phone size={14} />
                Family Contact
              </p>
              <p className="text-slate-900 font-medium">{patient.familyPhone}</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                <Calendar size={14} />
                Admission Date
              </p>
              <p className="text-slate-900 font-medium">
                {patient.admissionTimestamp?.toDate?.().toLocaleString() || new Date(patient.admissionTimestamp as any).toLocaleString()}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                <ShieldCheck size={14} />
                POPIA Consent
              </p>
              <div className="flex items-center gap-2 text-green-600 font-bold text-sm">
                <CheckCircle2 size={16} />
                Given (v1.0)
              </div>
            </div>
          </div>

          {/* Assessments Section */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <ClipboardCheck className="text-blue-500" size={24} />
                MHCA-05 Assessments
              </h2>
            </div>

            <AssessmentForm patientId={patient.id} />

            <div className="space-y-4">
              {assessments.map((assessment) => (
                <div key={assessment.id} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center text-slate-500">
                        <User size={16} />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-900">{assessment.assessorName}</p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{assessment.assessorRole.replace('_', ' ')}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Signed At</p>
                      <p className="text-xs text-slate-600">
                        {assessment.signatureTimestamp?.toDate?.().toLocaleString() || 'Pending'}
                      </p>
                    </div>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-xl text-sm text-slate-700 leading-relaxed italic">
                    "{assessment.notes}"
                  </div>
                </div>
              ))}
              {assessments.length === 0 && (
                <div className="text-center py-8 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                  <p className="text-sm text-slate-500 italic">No assessments recorded yet.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-8">
          {/* Timer Card */}
          <div className="bg-slate-900 text-white p-8 rounded-2xl shadow-xl shadow-slate-900/20 space-y-6">
            <div className="flex items-center gap-3 text-blue-400">
              <Clock size={20} />
              <span className="text-xs font-bold uppercase tracking-widest">Observation Window</span>
            </div>
            
            {patient.observationDeadline && (
              <ObservationTimer 
                deadline={patient.observationDeadline?.toDate?.() || new Date(patient.observationDeadline as any)} 
                className="text-4xl font-black tracking-tighter" 
              />
            )}

            <div className="pt-4 border-t border-slate-800">
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-2">Deadline</p>
              <p className="text-sm font-medium">
                {patient.observationDeadline?.toDate?.().toLocaleString() || new Date(patient.observationDeadline as any).toLocaleString()}
              </p>
            </div>
          </div>

          {/* Compliance Checklist */}
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
            <h3 className="font-bold text-slate-900 text-sm uppercase tracking-wider">Compliance Checklist</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-sm">
                <CheckCircle2 size={18} className="text-green-500" />
                <span className="text-slate-600">MHCA-04 Intake Form</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <CheckCircle2 size={18} className={cn(assessments.length > 0 ? "text-green-500" : "text-slate-200")} />
                <span className="text-slate-600">First Assessment</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <CheckCircle2 size={18} className={cn(assessments.length > 1 ? "text-green-500" : "text-slate-200")} />
                <span className="text-slate-600">Second Assessment</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <CheckCircle2 size={18} className={cn(patient.status === 'awaiting_review' || patient.status === 'discharged' ? "text-green-500" : "text-slate-200")} />
                <span className="text-slate-600">Review Board Notified</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
