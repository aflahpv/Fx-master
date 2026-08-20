import React, { useState, useRef, useEffect } from 'react';
import { 
  Calendar, 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  Download, 
  Printer, 
  RotateCcw, 
  CheckCircle2, 
  Flame, 
  Sparkles,
  Layers,
  BookOpen,
  TrendingUp,
  BookMarked,
  MoreVertical,
  Sun,
  Moon,
  User,
  Mail,
  ShieldCheck,
  Database
} from 'lucide-react';
import { MONTH_NAMES } from '../utils/helpers';

interface HeaderProps {
  year: number;
  month: number;
  onMonthChange: (year: number, month: number) => void;
  onAddHabitClick: () => void;
  onExportCSV: () => void;
  onPrint: () => void;
  onResetMonth: () => void;
  onLoadSample: () => void;
  onApplyTemplate: (template: 'trader' | 'productivity' | 'blank') => void;
  activeTab: 'matrix' | 'journal' | 'analytics' | 'resources';
  setActiveTab: (tab: 'matrix' | 'journal' | 'analytics' | 'resources') => void;
  overallPercent: number;
  totalDone: number;
  totalTarget: number;
  theme: 'light' | 'dark';
  onToggleTheme: (newTheme: 'light' | 'dark') => void;
  onOpenAccountModal: () => void;
  onOpenSplash?: () => void;
  userEmail?: string;
}

export const Header: React.FC<HeaderProps> = ({
  year,
  month,
  onMonthChange,
  onAddHabitClick,
  onExportCSV,
  onPrint,
  onResetMonth,
  onLoadSample,
  onApplyTemplate,
  activeTab,
  setActiveTab,
  overallPercent,
  totalDone,
  totalTarget,
  theme,
  onToggleTheme,
  onOpenAccountModal,
  onOpenSplash,
  userEmail = 'aflah.pv@gmail.com'
}) => {
  const currentDate = new Date();
  const isCurrentMonth = currentDate.getFullYear() === year && currentDate.getMonth() === month;
  const currentDay = currentDate.getDate();

  // 3-dots dropdown menu state
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handlePrevMonth = () => {
    if (month === 0) {
      onMonthChange(year - 1, 11);
    } else {
      onMonthChange(year, month - 1);
    }
  };

  const handleNextMonth = () => {
    if (month === 11) {
      onMonthChange(year + 1, 0);
    } else {
      onMonthChange(year, month + 1);
    }
  };

  const handleGoToday = () => {
    onMonthChange(currentDate.getFullYear(), currentDate.getMonth());
  };

  // Auto-backup toggle state
  const [autoBackupEnabled, setAutoBackupEnabled] = useState<boolean>(() => {
    return localStorage.getItem('fx_auto_backup_enabled') !== 'false';
  });

  const toggleAutoBackup = () => {
    const next = !autoBackupEnabled;
    setAutoBackupEnabled(next);
    localStorage.setItem('fx_auto_backup_enabled', String(next));
  };

  return (
    <header className="bg-slate-900 border-b border-slate-800 sticky top-0 z-30 transition-colors shadow-md">
      {/* Top Navigation & App Toolbar - Compact lower height */}
      <div className="bg-slate-950 px-4 sm:px-6 py-1.5 border-b border-slate-800">
        <div className="max-w-[1600px] mx-auto flex items-center justify-between gap-2">
          
          {/* Logo & Tab Switcher */}
          <div className="flex items-center gap-3 overflow-x-auto py-0.5">
            {/* Small Text App Name (No image icon) */}
            <button
              onClick={onOpenSplash}
              title="View FxMaster Starting Page"
              className="px-2 py-1 rounded-lg bg-slate-900 border border-slate-800 hover:border-amber-500/40 text-left shrink-0 hover:opacity-90 transition flex items-center gap-1.5"
            >
              <div className="text-xs sm:text-sm font-black tracking-wider text-white">
                Fx<span className="text-amber-400">Master</span>
              </div>
            </button>

            {/* Quick Tab Switcher */}
            <div className="flex items-center gap-1 bg-slate-900 p-0.5 rounded-xl border border-slate-800 overflow-x-auto">
              <button
                onClick={() => setActiveTab('matrix')}
                className={`px-3 py-1 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all ${
                  activeTab === 'matrix'
                    ? 'bg-slate-800 text-white font-semibold border border-slate-700'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                <span>Trade Checklist</span>
              </button>
              <button
                onClick={() => setActiveTab('journal')}
                className={`px-3 py-1 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all ${
                  activeTab === 'journal'
                    ? 'bg-slate-800 text-white font-semibold border border-slate-700'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <BookMarked className="w-3.5 h-3.5 text-amber-500" />
                <span>Trading Journal</span>
              </button>
              <button
                onClick={() => setActiveTab('analytics')}
                className={`px-3 py-1 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all ${
                  activeTab === 'analytics'
                    ? 'bg-slate-800 text-white font-semibold border border-slate-700'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                <span>Progress & Analytics</span>
              </button>
              <button
                onClick={() => setActiveTab('resources')}
                className={`px-3 py-1 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all ${
                  activeTab === 'resources'
                    ? 'bg-slate-800 text-white font-semibold border border-slate-700'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <BookOpen className="w-3.5 h-3.5 text-indigo-400" />
                <span>Guide & Directory</span>
              </button>
            </div>
          </div>

          {/* 3-DOTS MENU BUTTON & DROPDOWN */}
          <div className="relative flex-shrink-0" ref={menuRef}>
            <button
              type="button"
              onClick={() => setIsMenuOpen(prev => !prev)}
              title="More Options & Settings"
              className={`p-1.5 rounded-lg transition border shadow-xs flex items-center justify-center ${
                isMenuOpen
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
              }`}
            >
              <MoreVertical className="w-4 h-4" />
            </button>

            {/* Dropdown Menu */}
            {isMenuOpen && (
              <div className="absolute right-0 mt-2 w-60 bg-slate-900 border border-slate-800 rounded-2xl shadow-xl py-2 z-50 animate-fade-in text-slate-100">
                {/* Menu Header */}
                <div className="px-3.5 py-2 border-b border-slate-800 flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    App Settings
                  </span>
                  <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded-full border border-emerald-900">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    Auto-Saved
                  </span>
                </div>

                {/* Account Details */}
                <button
                  type="button"
                  onClick={() => {
                    onOpenAccountModal();
                    setIsMenuOpen(false);
                  }}
                  className="w-full text-left px-3.5 py-2.5 text-xs hover:bg-slate-800/80 flex items-center justify-between transition cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-blue-400" />
                    <div>
                      <div className="font-semibold text-slate-200">Account Details</div>
                      <div className="text-[10px] text-slate-400">
                        Profile & Security Settings
                      </div>
                    </div>
                  </div>
                  <span className="text-[10px] bg-blue-950 text-blue-400 font-medium px-2 py-0.5 rounded-md border border-blue-900">
                    Manage
                  </span>
                </button>

                {/* Back-up & Restore */}
                <button
                  type="button"
                  onClick={() => {
                    onOpenAccountModal();
                    setIsMenuOpen(false);
                  }}
                  className="w-full text-left px-3.5 py-2.5 text-xs hover:bg-slate-800/80 flex items-center justify-between transition cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <Database className="w-4 h-4 text-emerald-400" />
                    <div>
                      <div className="font-semibold text-slate-200">Back-up & Restore</div>
                      <div className="text-[10px] text-slate-400">
                        JSON Export & Restore
                      </div>
                    </div>
                  </div>
                </button>

                <div className="my-1 border-t border-gray-100 dark:border-slate-800" />

                {/* 5. Auto-Backup Small Toggle Switch at Bottom */}
                <div className="px-3.5 py-2.5 flex items-center justify-between bg-gray-50/70 dark:bg-slate-800/50 rounded-xl mx-2 my-1">
                  <div className="flex items-center gap-2">
                    <Database className="w-4 h-4 text-blue-500" />
                    <div>
                      <div className="text-xs font-semibold text-gray-800 dark:text-slate-200">
                        Auto-Backup
                      </div>
                      <div className="text-[10px] text-gray-400 dark:text-slate-500">
                        {autoBackupEnabled ? 'Enabled (Syncing)' : 'Disabled'}
                      </div>
                    </div>
                  </div>

                  {/* Interactive Toggle Switch */}
                  <button
                    type="button"
                    onClick={toggleAutoBackup}
                    className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      autoBackupEnabled ? 'bg-emerald-500' : 'bg-gray-300 dark:bg-slate-700'
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                        autoBackupEnabled ? 'translate-x-4' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Control Bar: ONLY rendered on the Checklist page (matrix tab) */}
      {activeTab === 'matrix' && (
        <div className="max-w-[1600px] mx-auto px-4 sm:px-8 py-2.5 flex flex-wrap items-center justify-between gap-3 bg-slate-900 border-t border-slate-800/80">
          {/* Month Selector */}
          <div className="flex items-center gap-2">
            <div className="flex items-center bg-slate-800 border border-slate-700 rounded-xl p-0.5">
              <button
                onClick={handlePrevMonth}
                title="Previous Month"
                className="p-1.5 hover:bg-slate-700 text-slate-400 rounded-lg transition cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              
              <div className="px-3 py-1 flex items-center gap-2 text-xs font-semibold text-slate-200 min-w-[140px] justify-center">
                <Calendar className="w-3.5 h-3.5 text-blue-400" />
                {MONTH_NAMES[month]} {year}
              </div>

              <button
                onClick={handleNextMonth}
                title="Next Month"
                className="p-1.5 hover:bg-slate-700 text-slate-400 rounded-lg transition cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {!isCurrentMonth && (
              <button
                onClick={handleGoToday}
                className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 px-2.5 py-1.5 rounded-xl font-medium transition cursor-pointer"
              >
                Current Month
              </button>
            )}

            {isCurrentMonth && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium bg-slate-950 text-slate-200 border border-slate-800 rounded-xl shadow-2xs">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                Today: Day {currentDay}
              </span>
            )}
          </div>

          {/* Global Progress Glance */}
          <div className="hidden lg:flex items-center gap-3 bg-slate-950 px-3.5 py-1.5 rounded-xl border border-slate-800">
            <div className="text-right">
              <div className="text-[10px] uppercase font-semibold tracking-wider text-slate-400">Total Completion</div>
              <div className="text-xs font-mono font-semibold text-slate-100">
                {totalDone} / {totalTarget} tasks
              </div>
            </div>
            <div className="w-24 bg-slate-800 rounded-full h-2 overflow-hidden">
              <div 
                className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, overallPercent)}%` }}
              />
            </div>
            <span className="text-xs font-mono font-semibold text-slate-200">
              {overallPercent}%
            </span>
          </div>

          {/* Actions buttons */}
          <div className="flex items-center flex-wrap gap-2">
            <button
              onClick={onLoadSample}
              title="Load sample checkmarks from PDF"
              className="flex items-center gap-1 text-xs bg-slate-950 hover:bg-slate-900 text-slate-200 px-2.5 py-1.5 rounded-xl font-medium transition border border-slate-800 shadow-2xs cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">Sample Demo</span>
            </button>

            <button
              onClick={onAddHabitClick}
              className="flex items-center gap-1.5 text-xs bg-slate-950 hover:bg-slate-900 text-slate-100 font-semibold px-3.5 py-1.5 rounded-xl transition border border-slate-800 shadow-2xs cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 text-slate-300" />
              <span>Add Habit</span>
            </button>

            <button
              onClick={onExportCSV}
              title="Export monthly checklist to CSV"
              className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition border border-slate-700 shadow-xs cursor-pointer"
            >
              <Download className="w-4 h-4" />
            </button>

            <button
              onClick={onPrint}
              title="Print or Save as PDF"
              className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition border border-slate-700 shadow-xs cursor-pointer"
            >
              <Printer className="w-4 h-4" />
            </button>

            <button
              onClick={onResetMonth}
              title="Clear all checkmarks for this month"
              className="p-1.5 bg-slate-800 hover:bg-rose-950 text-slate-400 hover:text-rose-400 rounded-xl transition border border-slate-700 shadow-xs cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
