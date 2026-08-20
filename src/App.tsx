import React, { useState, useEffect } from 'react';
import TrialPage from './components/TrialPage';
import { watchSubscriptionStatus } from './firebase';
import { isTrialExpired, getSavedPaymentEmail, emailToDocId } from './utils/trial';
import { DailyHabit, WeeklyHabit, MonthData, HabitTemplate, UserProfile } from './types';
import { 
  getInitialMonthData, 
  calculateOverallStats, 
  exportToCSV, 
  triggerCelebration,
  getDaysInMonth 
} from './utils/helpers';
import { 
  DEFAULT_DAILY_HABITS, 
  DEFAULT_WEEKLY_HABITS, 
  PRODUCTIVITY_DAILY_TEMPLATE, 
  PRODUCTIVITY_WEEKLY_TEMPLATE 
} from './data/defaultData';
import { Header } from './components/Header';
import { GaugesSummary } from './components/GaugesSummary';
import { DailyHabitMatrix } from './components/DailyHabitMatrix';
import { WeeklyHabitMatrix } from './components/WeeklyHabitMatrix';
import { AddEditHabitModal } from './components/AddEditHabitModal';
import { DayNoteModal } from './components/DayNoteModal';
import { HabitStatsAnalytics } from './components/HabitStatsAnalytics';
import { TradingJournal } from './components/TradingJournal';
import { ResourcesGuide } from './components/ResourcesGuide';
import { AccountBackupModal } from './components/AccountBackupModal';
import { SplashScreen } from './components/SplashScreen';

export default function App() {
  const currentDate = new Date();
  const [year, setYear] = useState<number>(currentDate.getFullYear());
  const [month, setMonth] = useState<number>(currentDate.getMonth());
  const [activeTab, setActiveTab] = useState<'matrix' | 'journal' | 'analytics' | 'resources'>('matrix');
  const [journalDate, setJournalDate] = useState<string>(() => new Date().toISOString().slice(0, 10));

  // Opening Splash / Screensaver State
  const [showSplash, setShowSplash] = useState<boolean>(true);

  // 3-Day Free Trial / Paywall State
  const [subscriptionActive, setSubscriptionActive] = useState<boolean>(false);
  const [checkingSubscription, setCheckingSubscription] = useState<boolean>(true);
  const [showTrial, setShowTrial] = useState<boolean>(false);

  useEffect(() => {
    const email = getSavedPaymentEmail();
    if (!email) {
      setCheckingSubscription(false);
      setShowTrial(isTrialExpired() ? true : false);
      return;
    }
    const docId = emailToDocId(email);
    const unsubscribe = watchSubscriptionStatus(docId, (status) => {
      setSubscriptionActive(status.active);
      setCheckingSubscription(false);
      if (!status.active && isTrialExpired()) {
        setShowTrial(true);
      } else {
        setShowTrial(false);
      }
    });
    return () => unsubscribe();
  }, []);

  const handleTrialContinue = () => {
    setShowTrial(false);
  };

  // Theme Mode strictly locked to dark mode per user request
  const [theme] = useState<'dark'>('dark');

  // User Profile details
  const [userProfile, setUserProfile] = useState<UserProfile>(() => {
    try {
      const saved = localStorage.getItem('fx_mastermind_user_profile');
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return {
      email: 'aflah.pv@gmail.com',
      name: 'Trader Master',
      passcode: '',
      isLoggedIn: true
    };
  });

  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);

  // Sync dark theme class permanently on HTML element
  useEffect(() => {
    localStorage.setItem('app_theme', 'dark');
    document.documentElement.classList.add('dark');
    document.body.className = 'bg-slate-950 text-slate-100 font-sans min-h-screen';
  }, []);

  // Save profile to localStorage
  const handleSaveProfile = (newProfile: UserProfile) => {
    setUserProfile(newProfile);
    localStorage.setItem('fx_mastermind_user_profile', JSON.stringify(newProfile));
  };

  // Load Month Data from localStorage or initialize with sample
  const storageKey = `discipline_tracker_${year}_${month}`;

  const [monthData, setMonthData] = useState<MonthData>(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {
      // ignore
    }
    return getInitialMonthData(year, month, false);
  });

  // Highlight specific habit row when clicked from gauge
  const [highlightedHabitId, setHighlightedHabitId] = useState<string | null>(null);

  // Modals state
  const [isAddEditOpen, setIsAddEditOpen] = useState(false);
  const [editingHabit, setEditingHabit] = useState<DailyHabit | WeeklyHabit | null>(null);
  const [modalHabitType, setModalHabitType] = useState<'daily' | 'weekly'>('daily');

  // Day Note Modal
  const [dayNoteModal, setDayNoteModal] = useState<{ isOpen: boolean; day: number | null }>({
    isOpen: false,
    day: null
  });

  // Save to localStorage whenever monthData changes
  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(monthData));
    } catch {
      // ignore
    }
  }, [monthData, storageKey]);

  // Handle Month/Year Change
  const handleMonthChange = (newYear: number, newMonth: number) => {
    setYear(newYear);
    setMonth(newMonth);
    const newKey = `discipline_tracker_${newYear}_${newMonth}`;
    try {
      const saved = localStorage.getItem(newKey);
      if (saved) {
        setMonthData(JSON.parse(saved));
        return;
      }
    } catch {
      // ignore
    }
    setMonthData(getInitialMonthData(newYear, newMonth, false));
  };

  // Toggle Daily Checkbox
  const handleToggleDaily = (habitId: string, day: number) => {
    setMonthData(prev => {
      const updated = prev.dailyHabits.map(h => {
        if (h.id === habitId) {
          const days = { ...h.days, [day]: !h.days[day] };
          return { ...h, days };
        }
        return h;
      });
      return { ...prev, dailyHabits: updated };
    });
  };

  // Toggle Weekly Checkbox
  const handleToggleWeekly = (habitId: string, week: number) => {
    setMonthData(prev => {
      const updated = prev.weeklyHabits.map(h => {
        if (h.id === habitId) {
          const weeks = { ...h.weeks, [week]: !h.weeks[week] };
          return { ...h, weeks };
        }
        return h;
      });
      return { ...prev, weeklyHabits: updated };
    });
  };

  // Update Daily Goal
  const handleUpdateDailyGoal = (habitId: string, newGoal: number) => {
    setMonthData(prev => ({
      ...prev,
      dailyHabits: prev.dailyHabits.map(h => h.id === habitId ? { ...h, goal: newGoal } : h)
    }));
  };

  // Update Weekly Goal
  const handleUpdateWeeklyGoal = (habitId: string, newGoal: number) => {
    setMonthData(prev => ({
      ...prev,
      weeklyHabits: prev.weeklyHabits.map(h => h.id === habitId ? { ...h, goal: newGoal } : h)
    }));
  };

  // Delete Habits
  const handleDeleteDaily = (habitId: string) => {
    if (window.confirm('Are you sure you want to delete this habit?')) {
      setMonthData(prev => ({
        ...prev,
        dailyHabits: prev.dailyHabits.filter(h => h.id !== habitId)
      }));
    }
  };

  const handleDeleteWeekly = (habitId: string) => {
    if (window.confirm('Are you sure you want to delete this weekly habit?')) {
      setMonthData(prev => ({
        ...prev,
        weeklyHabits: prev.weeklyHabits.filter(h => h.id !== habitId)
      }));
    }
  };

  // Save Add/Edit Daily Habit
  const handleSaveDaily = (habitData: Omit<DailyHabit, 'days'>) => {
    setMonthData(prev => {
      const exists = prev.dailyHabits.some(h => h.id === habitData.id);
      if (exists) {
        return {
          ...prev,
          dailyHabits: prev.dailyHabits.map(h => h.id === habitData.id ? { ...h, ...habitData } : h)
        };
      } else {
        const newHabit: DailyHabit = {
          ...habitData,
          days: {}
        };
        return {
          ...prev,
          dailyHabits: [...prev.dailyHabits, newHabit]
        };
      }
    });
  };

  // Save Add/Edit Weekly Habit
  const handleSaveWeekly = (habitData: Omit<WeeklyHabit, 'weeks'>) => {
    setMonthData(prev => {
      const exists = prev.weeklyHabits.some(h => h.id === habitData.id);
      if (exists) {
        return {
          ...prev,
          weeklyHabits: prev.weeklyHabits.map(h => h.id === habitData.id ? { ...h, ...habitData } : h)
        };
      } else {
        const newHabit: WeeklyHabit = {
          ...habitData,
          weeks: {}
        };
        return {
          ...prev,
          weeklyHabits: [...prev.weeklyHabits, newHabit]
        };
      }
    });
  };

  // Quick Check All for Today
  const handleCheckAllToday = (day: number) => {
    setMonthData(prev => {
      const allChecked = prev.dailyHabits.every(h => !!h.days[day]);
      const targetState = !allChecked;

      const updated = prev.dailyHabits.map(h => ({
        ...h,
        days: { ...h.days, [day]: targetState }
      }));

      if (targetState) {
        triggerCelebration();
      }

      return { ...prev, dailyHabits: updated };
    });
  };

  // Save Day Note
  const handleSaveDayNote = (day: number, note: string) => {
    setMonthData(prev => ({
      ...prev,
      dailyNotes: {
        ...(prev.dailyNotes || {}),
        [day]: note
      }
    }));
  };

  const handleDeleteDayNote = (day: number) => {
    setMonthData(prev => {
      const updatedNotes = { ...(prev.dailyNotes || {}) };
      delete updatedNotes[day];
      return { ...prev, dailyNotes: updatedNotes };
    });
  };

  // Load PDF Sample Data
  const handleLoadSample = () => {
    setMonthData(getInitialMonthData(year, month, false));
    triggerCelebration();
  };

  // Reset Month
  const handleResetMonth = () => {
    if (window.confirm('Reset all checkmarks for this month? (Habit names and goals will be kept)')) {
      setMonthData(prev => ({
        ...prev,
        dailyHabits: prev.dailyHabits.map(h => ({ ...h, days: {} })),
        weeklyHabits: prev.weeklyHabits.map(h => ({ ...h, weeks: {} })),
        dailyNotes: {}
      }));
    }
  };

  // Apply Presets
  const handleApplyTemplate = (template: HabitTemplate) => {
    if (template === 'trader') {
      setMonthData(getInitialMonthData(year, month, false));
    } else if (template === 'productivity') {
      const daily: DailyHabit[] = PRODUCTIVITY_DAILY_TEMPLATE.map(d => ({ ...d, days: {} }));
      const weekly: WeeklyHabit[] = PRODUCTIVITY_WEEKLY_TEMPLATE.map(w => ({ ...w, weeks: {} }));
      setMonthData({
        year,
        month,
        dailyHabits: daily,
        weeklyHabits: weekly,
        dailyNotes: {}
      });
    } else if (template === 'blank') {
      setMonthData({
        year,
        month,
        dailyHabits: [],
        weeklyHabits: [],
        dailyNotes: {}
      });
    }
  };

  // Select Habit from Gauge
  const handleSelectHabit = (habitId: string) => {
    setActiveTab('matrix');
    setHighlightedHabitId(habitId);
    setTimeout(() => {
      const el = document.getElementById(`habit-row-${habitId}`);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 100);
    setTimeout(() => {
      setHighlightedHabitId(null);
    }, 3000);
  };

  // Export complete JSON backup
  const handleExportJSONBackup = () => {
    const backupObj = {
      version: '2.0',
      exportedAt: new Date().toISOString(),
      userProfile,
      monthData,
      journals: (() => {
        try {
          const raw = localStorage.getItem('fx_mastermind_journals_v2');
          return raw ? JSON.parse(raw) : null;
        } catch {
          return null;
        }
      })()
    };

    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(backupObj, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `Trading_Mastermind_Backup_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    document.body.removeChild(downloadAnchor);
  };

  // Import complete JSON backup
  const handleImportJSONBackup = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const parsed = JSON.parse(content);
        if (parsed.monthData) {
          setMonthData(parsed.monthData);
        }
        if (parsed.userProfile) {
          setUserProfile(parsed.userProfile);
          localStorage.setItem('fx_mastermind_user_profile', JSON.stringify(parsed.userProfile));
        }
        if (parsed.journals) {
          localStorage.setItem('fx_mastermind_journals_v2', JSON.stringify(parsed.journals));
        }
        alert('Data backup successfully restored!');
        window.location.reload();
      } catch (err) {
        alert('Invalid backup file format.');
      }
    };
    reader.readAsText(file);
  };

  const stats = calculateOverallStats(monthData.dailyHabits, monthData.weeklyHabits);

  return (
    <div className="min-h-screen flex flex-col font-sans selection:bg-blue-600 selection:text-white bg-slate-950 text-slate-100 transition-colors duration-200">
      {/* Opening Screensaver Splash Screen */}
      {showSplash && (
        <SplashScreen 
          onFinish={() => setShowSplash(false)} 
          theme={theme} 
        />
      )}

        {/* 3-Day Free Trial Paywall */}
        {!showSplash && showTrial && (
          <TrialPage onContinue={handleTrialContinue} mandatory={isTrialExpired() && !subscriptionActive} />
        )}

      {/* Top Masthead & Controls */}
      <Header
        year={year}
        month={month}
        onMonthChange={handleMonthChange}
        onAddHabitClick={() => {
          setEditingHabit(null);
          setModalHabitType('daily');
          setIsAddEditOpen(true);
        }}
        onExportCSV={() => exportToCSV(monthData)}
        onPrint={() => window.print()}
        onResetMonth={handleResetMonth}
        onLoadSample={handleLoadSample}
        onApplyTemplate={handleApplyTemplate}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        overallPercent={stats.overallPercent}
        totalDone={stats.totalDone}
        totalTarget={stats.totalTarget}
        theme={theme}
        onToggleTheme={() => {}}
        onOpenAccountModal={() => setIsAccountModalOpen(true)}
        onOpenSplash={() => setShowSplash(true)}
        userEmail={userProfile.email}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-[1600px] w-full mx-auto px-3 sm:px-6 py-6">
        {/* VIEW 1: CHECKLIST (Primary Launch Page for Fast Checking) */}
        {activeTab === 'matrix' && (
          <>
            {/* Daily Habit Matrix Table */}
            <DailyHabitMatrix
              dailyHabits={monthData.dailyHabits}
              year={year}
              month={month}
              onToggleDay={handleToggleDaily}
              onUpdateGoal={handleUpdateDailyGoal}
              onDeleteHabit={handleDeleteDaily}
              onEditHabit={(habit) => {
                setEditingHabit(habit);
                setModalHabitType('daily');
                setIsAddEditOpen(true);
              }}
              onAddHabit={() => {
                setEditingHabit(null);
                setModalHabitType('daily');
                setIsAddEditOpen(true);
              }}
              onCheckAllToday={handleCheckAllToday}
              onOpenDayNote={(day) => setDayNoteModal({ isOpen: true, day })}
              dailyNotes={monthData.dailyNotes}
              highlightedHabitId={highlightedHabitId}
            />

            {/* Weekly Habit Matrix Table & Gauges */}
            <WeeklyHabitMatrix
              weeklyHabits={monthData.weeklyHabits}
              onToggleWeek={handleToggleWeekly}
              onUpdateGoal={handleUpdateWeeklyGoal}
              onDeleteHabit={handleDeleteWeekly}
              onEditHabit={(habit) => {
                setEditingHabit(habit);
                setModalHabitType('weekly');
                setIsAddEditOpen(true);
              }}
              onAddHabit={() => {
                setEditingHabit(null);
                setModalHabitType('weekly');
                setIsAddEditOpen(true);
              }}
            />
          </>
        )}

        {/* VIEW 2: TRADING JOURNAL (Second Page) */}
        {activeTab === 'journal' && (
          <TradingJournal
            currentDateStr={journalDate}
            onDateChange={(newDate) => setJournalDate(newDate)}
          />
        )}

        {/* VIEW 3: PROGRESS & ANALYTICS (Third Page) */}
        {activeTab === 'analytics' && (
          <div className="space-y-6">
            {/* Progress Gauges Summary */}
            <GaugesSummary
              dailyHabits={monthData.dailyHabits}
              overallPercent={stats.overallPercent}
              totalDailyDone={stats.totalDailyDone}
              totalDailyTarget={stats.totalDailyTarget}
              onSelectHabit={handleSelectHabit}
            />

            {/* In-depth Analytics & Streaks */}
            <HabitStatsAnalytics
              dailyHabits={monthData.dailyHabits}
              weeklyHabits={monthData.weeklyHabits}
              year={year}
              month={month}
              dailyNotes={monthData.dailyNotes}
            />
          </div>
        )}

        {/* VIEW 4: RESOURCES & DIRECTORY GUIDE */}
        {activeTab === 'resources' && (
          <ResourcesGuide />
        )}
      </main>

      {/* Modals */}
      <AddEditHabitModal
        isOpen={isAddEditOpen}
        onClose={() => setIsAddEditOpen(false)}
        onSaveDaily={handleSaveDaily}
        onSaveWeekly={handleSaveWeekly}
        editingHabit={editingHabit}
        habitType={modalHabitType}
        existingCategories={Array.from(new Set([
          ...monthData.dailyHabits.map(h => h.category?.trim()).filter(Boolean) as string[],
          ...monthData.weeklyHabits.map(h => h.category?.trim()).filter(Boolean) as string[]
        ]))}
      />

      <DayNoteModal
        isOpen={dayNoteModal.isOpen}
        day={dayNoteModal.day}
        month={month}
        year={year}
        initialNote={dayNoteModal.day ? monthData.dailyNotes?.[dayNoteModal.day] : ''}
        onClose={() => setDayNoteModal({ isOpen: false, day: null })}
        onSaveNote={handleSaveDayNote}
        onDeleteNote={handleDeleteDayNote}
      />

      {/* Account & Backup Settings Modal */}
      <AccountBackupModal
        isOpen={isAccountModalOpen}
        onClose={() => setIsAccountModalOpen(false)}
        theme={theme}
        onToggleTheme={() => {}}
        userProfile={userProfile}
        onSaveProfile={handleSaveProfile}
        onExportJSON={handleExportJSONBackup}
        onImportJSON={handleImportJSONBackup}
      />

      {/* Footer Branding matching FxMaster copyright */}
      <footer className="bg-slate-900 border-t border-slate-800 py-4 px-6 text-center text-xs text-slate-400 no-print mt-auto transition-colors">
        <div className="max-w-[1600px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-100">FxMaster</span>
            <span className="text-slate-700">•</span>
            <span>Trading Discipline & Execution Trade Checklist</span>
          </div>
          <div className="text-[11px] text-slate-400 font-medium">
            © pv__aflah
          </div>
        </div>
      </footer>
    </div>
  );
}
