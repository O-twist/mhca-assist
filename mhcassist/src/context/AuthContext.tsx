import React, { createContext, useContext, useState, useEffect } from 'react';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import { UserProfile } from '../types';

interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
  mockSignIn: (role: UserProfile['role']) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check local storage for mock user first
    const savedMockUser = localStorage.getItem('mhca_mock_user');
    if (savedMockUser) {
      setUser(JSON.parse(savedMockUser));
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
          if (userDoc.exists()) {
            setUser({ uid: firebaseUser.uid, ...userDoc.data() } as UserProfile);
          } else {
            // Fallback for new users without profile doc
            setUser({
              uid: firebaseUser.uid,
              email: firebaseUser.email || '',
              role: 'nurse',
              name: firebaseUser.displayName || 'New User'
            });
          }
        } catch (e) {
          console.error("Auth profile fetch failed", e);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const mockSignIn = async (role: UserProfile['role']) => {
    const mockUser: UserProfile = {
      uid: 'mock-user-id',
      email: `demo-${role}@mhcassist.gov.za`,
      role: role,
      name: `Demo ${role.charAt(0).toUpperCase() + role.slice(1)}`,
      clinicId: 'KZN-CLINIC-DEMO'
    };
    localStorage.setItem('mhca_mock_user', JSON.stringify(mockUser));
    setUser(mockUser);
  };

  const signOut = async () => {
    localStorage.removeItem('mhca_mock_user');
    await auth.signOut();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, mockSignIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
