export type UserRole = 'nurse' | 'clinician' | 'review_board' | 'admin';

export interface UserProfile {
  uid: string;
  email: string;
  role: UserRole;
  name: string;
  clinicId?: string;
}

export interface Patient {
  id: string;
  mhcaId: string;
  name: string;
  idNumber: string;
  dateOfBirth?: string;
  ageGroup: 'adult' | 'child';
  familyPhone: string;
  admissionTimestamp: any; // Firestore Timestamp
  observationDeadline: any; // Firestore Timestamp
  status: 'admitted' | 'observing' | 'awaiting_review' | 'discharged';
  createdBy: string;
  clinicId: string;
}

export interface Assessment {
  id: string;
  patientId: string;
  type: 'medical' | 'non_medical';
  assignedTo: string;
  scheduledTime: any;
  completed: boolean;
  findings?: string;
  recommendation?: string;
}

export interface DischargeRequest {
  id: string;
  patientId: string;
  initiatedBy: string;
  initiatedAt: any;
  approvedBy?: string;
  approvedAt?: any;
  status: 'pending' | 'approved' | 'rejected';
}
