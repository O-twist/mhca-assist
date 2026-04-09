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
import { handleFirestoreError, OperationType } from '../lib/utils';

export function usePatients() {
  const { user } = useAuth();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);

  const isMock = user?.uid === 'mock-user-id';

  useEffect(() => {
    if (!user) {
      setPatients([]);
      setLoading(false);
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
  }, [user, isMock]);

  const addPatient = async (patientData: any) => {
    if (isMock) {
      const newPatient = {
        ...patientData,
        id: `mock-${Date.now()}`,
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

    return await addDoc(collection(db, 'patients'), {
      ...patientData,
      admissionTimestamp: serverTimestamp()
    });
  };

  return { patients, loading, addPatient };
}
