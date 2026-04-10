import React from 'react';
import { User, Shield, Bell, Globe, Database, HelpCircle } from 'lucide-react';

export const Settings = () => {
  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Settings</h1>
        <p className="text-slate-500">Manage your account and system preferences.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="space-y-2">
          <button className="w-full flex items-center gap-3 p-4 bg-blue-50 text-blue-700 rounded-2xl font-bold text-sm">
            <User size={20} />
            Profile Settings
          </button>
          <button className="w-full flex items-center gap-3 p-4 text-slate-600 hover:bg-slate-50 rounded-2xl font-bold text-sm transition-colors">
            <Shield size={20} />
            Security & Privacy
          </button>
          <button className="w-full flex items-center gap-3 p-4 text-slate-600 hover:bg-slate-50 rounded-2xl font-bold text-sm transition-colors">
            <Bell size={20} />
            Notifications
          </button>
          <button className="w-full flex items-center gap-3 p-4 text-slate-600 hover:bg-slate-50 rounded-2xl font-bold text-sm transition-colors">
            <Globe size={20} />
            Clinic Configuration
          </button>
          <button className="w-full flex items-center gap-3 p-4 text-slate-600 hover:bg-slate-50 rounded-2xl font-bold text-sm transition-colors">
            <Database size={20} />
            Data Management
          </button>
          <button className="w-full flex items-center gap-3 p-4 text-slate-600 hover:bg-slate-50 rounded-2xl font-bold text-sm transition-colors">
            <HelpCircle size={20} />
            Support & Help
          </button>
        </div>

        <div className="md:col-span-2 space-y-8">
          <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm space-y-6">
            <h2 className="text-xl font-bold text-slate-900">Personal Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Full Name</label>
                <input type="text" className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500" defaultValue="Dr. Oliver Nzamba" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Email Address</label>
                <input type="email" className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500" defaultValue="nzambaoliver@gmail.com" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Professional ID</label>
                <input type="text" className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500" defaultValue="HPCSA-123456" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Primary Clinic</label>
                <input type="text" className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500" defaultValue="KZN Central Hospital" />
              </div>
            </div>
            <div className="pt-4 flex justify-end">
              <button className="px-6 py-2 bg-blue-600 text-white rounded-xl font-bold text-sm hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20">
                Save Changes
              </button>
            </div>
          </div>

          <div className="bg-red-50 p-8 rounded-3xl border border-red-100 space-y-4">
            <h2 className="text-xl font-bold text-red-900">Danger Zone</h2>
            <p className="text-sm text-red-600 leading-relaxed">
              Once you delete your account, there is no going back. Please be certain.
            </p>
            <button className="px-6 py-2 bg-red-600 text-white rounded-xl font-bold text-sm hover:bg-red-700 transition-all shadow-lg shadow-red-600/20">
              Delete Account
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
