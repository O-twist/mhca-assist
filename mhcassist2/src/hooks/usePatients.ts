import { useState, useEffect } from 'react';
import { 
  collection, 
  query, 
  onSnapshot, 
  orderBy, 
  addDoc, 
  serverTimestamp, 
  Timestamp,
  doc,
  updateDoc
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Patient } from '../types';
import { useAuth } from '../context/AuthContext';
import { useRole } from './useRole';
import { handleFirestoreError, OperationType } from '../lib/utils';

export function usePatients() {
  const { user } = useAuth();
  const { role, loading: roleLoading } = useRole();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);

  const isMock = user?.uid.startsWith('mock-');

  useEffect(() => {
    if (!user || (roleLoading && !isMock)) {
      if (!user) {
        setPatients([]);
        setLoading(false);
      }
      return;
    }

    if (isMock) {
      // Load from LocalStorage for Demo Mode
      const saved = localStorage.getItem('mhca_mock_patients');
      if (saved) {
        setPatients(JSON.parse(saved).map((p: any) => ({
          ...p,
          admissionTimestamp: { toDate: () => new Date(p.admissionTimestamp) },
          observationDeadline: { toDate: () => new Date(p.observationDeadline) }
        })));
      }
      setLoading(false);
      return;
    }

    // Real Firestore Listener
    const q = query(collection(db, 'patients'), orderBy('admissionTimestamp', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const patientData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Patient[];
      setPatients(patientData);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'patients');
    });

    return () => unsubscribe();
  }, [user, isMock, role, roleLoading]);

  const addPatient = async (patientData: any) => {
    if (isMock) {
      const newPatient = {
        ...patientData,
        id: `mock-${Date.now()}`,
        status: 'draft',
        admissionTimestamp: new Date().toISOString(),
        observationDeadline: patientData.observationDeadline.toDate().toISOString()
      };
      const updated = [newPatient, ...patients.map(p => ({
        ...p,
        admissionTimestamp: p.admissionTimestamp.toDate().toISOString(),
        observationDeadline: p.observationDeadline.toDate().toISOString()
      }))];
      localStorage.setItem('mhca_mock_patients', JSON.stringify(updated));
      setPatients([
        {
          ...newPatient,
          admissionTimestamp: { toDate: () => new Date(newPatient.admissionTimestamp) },
          observationDeadline: { toDate: () => new Date(newPatient.observationDeadline) }
        },
        ...patients
      ]);
      return { id: newPatient.id };
    }

    try {
      return await addDoc(collection(db, 'patients'), {
        ...patientData,
        status: 'draft',
        admissionTimestamp: serverTimestamp()
      });
    } catch (error: any) {
      if (error.code === 'permission-denied') {
        alert("Permission Denied: You do not have the required role (Nurse or Admin) to register patients, or your session has expired.");
      }
      throw error;
    }
  };

  const updatePatientStatus = async (patientId: string, newStatus: string) => {
    if (isMock) {
      const updated = patients.map(p => p.id === patientId ? { ...p, status: newStatus } : p);
      setPatients(updated as any);
      return;
    }

    try {
      const patientRef = doc(db, 'patients', patientId);
      await updateDoc(patientRef, { status: newStatus });
    } catch (error: any) {
      if (error.code === 'permission-denied') {
        alert("Conflict: This record has been submitted or approved. Your changes cannot be saved.");
      }
      throw error;
    }
  };

  const dischargePatient = async (patientId: string, reason: string) => {
    if (isMock) {
      const updated = patients.map(p => p.id === patientId ? { ...p, status: 'discharged' } : p);
      setPatients(updated as any);
      return;
    }

    try {
      const patientRef = doc(db, 'patients', patientId);
      if (role === 'review_board') {
        await addDoc(collection(db, 'dischargeRequests'), {
          patientId,
          initiatedBy: user?.uid,
          initiatedAt: serverTimestamp(),
          reason,
          status: 'pending'
        });
        await updateDoc(patientRef, { status: 'awaiting_review' });
      } else {
        await updateDoc(patientRef, { 
          status: 'discharged',
          dischargeReason: reason,
          dischargedAt: serverTimestamp()
        });
      }
    } catch (error: any) {
      handleFirestoreError(error, OperationType.UPDATE, `patients/${patientId}`);
      throw error;
    }
  };

  return { patients, loading, addPatient, updatePatientStatus, dischargePatient };
}
