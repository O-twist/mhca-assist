import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { auth } from '../lib/firebase';

export function useRole() {
  const { user } = useAuth();
  const [role, setRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRole = async () => {
      if (!auth.currentUser) {
        // Fallback to local user role for demo mode
        setRole(user?.role || null);
        setLoading(false);
        return;
      }

      try {
        const idTokenResult = await auth.currentUser.getIdTokenResult(true);
        setRole((idTokenResult.claims.role as string) || null);
      } catch (error) {
        console.error('Error fetching custom claims:', error);
        setRole(user?.role || null);
      } finally {
        setLoading(false);
      }
    };

    fetchRole();
  }, [user]);

  return { role, loading };
}
