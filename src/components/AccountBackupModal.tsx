import React, { useState } from 'react';
import { 
  X, 
  User, 
  Key, 
  CheckCircle2, 
  Download, 
  Upload, 
  ShieldCheck, 
  Save
} from 'lucide-react';
import { UserProfile } from '../types';

interface AccountBackupModalProps {
  isOpen: boolean;
  onClose: () => void;
  userProfile: UserProfile;
  onSaveProfile: (profile: UserProfile) => void;
  onExportJSON: () => void;
  onImportJSON: (file: File) => void;
  theme?: string;
  onToggleTheme?: (newTheme: 'light' | 'dark') => void;
}

export const AccountBackupModal: React.FC<AccountBackupModalProps> = ({
  isOpen,
  onClose,
  userProfile,
  onSaveProfile,
  onExportJSON,
  onImportJSON
}) => {
  const [name, setName] = useState(userProfile.name || 'Trader Master');
  const [passcode, setPasscode] = useState(userProfile.passcode || '');
  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSaveDetails = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveProfile({
      ...userProfile,
      name,
      passcode,
      isLoggedIn: true,
      lastBackupAt: new Date().toISOString()
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onImportJSON(e.target.files[0]);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-fade-in text-slate-100">
      <div className="w-full max-w-xl rounded-2xl shadow-2xl border border-slate-700 bg-slate-900 overflow-hidden transition-colors">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-800 bg-slate-800/50 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-blue-600 text-white rounded-xl shadow-xs">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base tracking-tight text-slate-100">
                Account & Back-up & Restore
              </h3>
              <p className="text-xs text-slate-400">
                Manage profile details and JSON data back-up and restore
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          {/* USER ACCOUNT PROFILE */}
          <form onSubmit={handleSaveDetails} className="p-4 rounded-xl border border-slate-700 bg-slate-800/60 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-blue-400">Account Access</span>
                <h4 className="font-semibold text-sm text-slate-100">Trader Profile</h4>
              </div>
              <span className="text-[11px] text-emerald-400 font-medium flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Local Auto-Sync
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Name */}
              <div>
                <label className="block text-xs font-semibold mb-1 text-slate-300">
                  Trader Name
                </label>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full text-xs pl-9 pr-3 py-2 rounded-lg border border-slate-700 bg-slate-900 text-slate-100 focus:border-blue-500 outline-none font-medium"
                    placeholder="Your Name"
                    required
                  />
                </div>
              </div>

              {/* Passcode / PIN */}
              <div>
                <label className="block text-xs font-semibold mb-1 text-slate-300">
                  Account Security PIN (Optional)
                </label>
                <div className="relative">
                  <Key className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type="password"
                    value={passcode}
                    onChange={(e) => setPasscode(e.target.value)}
                    className="w-full text-xs pl-9 pr-3 py-2 rounded-lg border border-slate-700 bg-slate-900 text-slate-100 focus:border-blue-500 outline-none font-medium"
                    placeholder="Set optional 4-digit PIN"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              {savedSuccess ? (
                <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4" /> Account details saved!
                </span>
              ) : (
                <span className="text-[11px] text-slate-400">
                  Data auto-saves daily to local memory.
                </span>
              )}
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-lg transition shadow-xs flex items-center gap-1.5 cursor-pointer"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Save Profile</span>
              </button>
            </div>
          </form>

          {/* DATA EXPORT / RESTORE */}
          <div className="p-4 rounded-xl border border-slate-700 bg-slate-800/60 space-y-3">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">Data Safety</span>
              <h4 className="font-semibold text-sm text-slate-100">Back-up & Restore Data</h4>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3">
              {/* Download JSON Backup */}
              <button
                type="button"
                onClick={onExportJSON}
                className="w-full sm:w-auto flex-1 flex items-center justify-center gap-2 p-2.5 font-semibold text-xs rounded-xl border border-slate-600 bg-slate-800 hover:bg-slate-700 text-slate-100 transition shadow-xs cursor-pointer"
              >
                <Download className="w-4 h-4 text-blue-400" />
                <span>Export JSON File</span>
              </button>

              {/* Restore JSON Backup */}
              <label className="w-full sm:w-auto flex-1 p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-600 rounded-xl text-xs font-semibold cursor-pointer transition flex items-center justify-center gap-2">
                <Upload className="w-4 h-4 text-emerald-400" />
                <span>Upload Back-up</span>
                <input
                  type="file"
                  accept=".json"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 border-t border-slate-800 bg-slate-800/40 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs rounded-xl transition cursor-pointer"
          >
            Close Settings
          </button>
        </div>
      </div>
    </div>
  );
};
