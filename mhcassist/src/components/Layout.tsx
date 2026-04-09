import React from 'react';
import { useNavigate, Link, Navigate } from 'react-router-dom';
import { LogOut, User, ClipboardList, Users, ShieldCheck, Activity } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Layout = ({ children }: { children: React.ReactNode }) => {
  const { user, loading, signOut } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut();
    navigate('/login');
  };

  if (loading) return <div className="flex h-screen items-center justify-center">Loading...</div>;
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 text-white flex flex-col">
        <div className="p-6 flex items-center gap-2 border-b border-slate-800">
          <Activity className="text-blue-400" />
          <span className="text-xl font-bold tracking-tight">MHCAssist</span>
        </div>
        
        <nav className="flex-1 p-4 space-y-2">
          <Link to="/" className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-800 transition-colors">
            <ClipboardList size={20} />
            <span>Dashboard</span>
          </Link>
          
          {user?.role === 'nurse' && (
            <Link to="/intake" className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-800 transition-colors">
              <Users size={20} />
              <span>Patient Intake</span>
            </Link>
          )}
          
          {user?.role === 'admin' && (
            <Link to="/directory" className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-800 transition-colors">
              <ShieldCheck size={20} />
              <span>Admin Directory</span>
            </Link>
          )}
        </nav>

        <div className="p-4 border-t border-slate-800">
          <div className="flex items-center gap-3 mb-4 px-2">
            <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center">
              <User size={16} />
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-medium truncate">{user?.name || user?.email}</p>
              <p className="text-xs text-slate-400 capitalize">{user?.role}</p>
            </div>
          </div>
          <button 
            onClick={handleLogout}
            className="flex items-center gap-3 w-full p-3 rounded-lg hover:bg-red-900/30 text-red-400 transition-colors"
          >
            <LogOut size={20} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto p-8">
        {children}
      </main>
    </div>
  );
};
