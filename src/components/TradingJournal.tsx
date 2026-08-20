import React, { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { 
  Plus, 
  Trash2, 
  Copy, 
  ChevronLeft, 
  ChevronRight, 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  Award, 
  AlertCircle, 
  CheckCircle2, 
  FileText, 
  Download, 
  Sparkles,
  Search,
  Check,
  Save,
  Scale,
  Calendar as CalendarIcon,
  RotateCcw,
  X
} from 'lucide-react';
import { 
  TradeEntry, 
  DailyJournal, 
  DailyObservations 
} from '../types';
import { 
  INITIAL_TRADES_SAMPLE, 
  INITIAL_DAILY_OBSERVATIONS,
  getInitialSampleJournals
} from '../data/defaultData';
import { SearchableSymbolInput } from './SearchableSymbolInput';
import { TradingCalendar } from './TradingCalendar';

interface TradingJournalProps {
  currentDateStr: string;
  onDateChange?: (newDateStr: string) => void;
}

// Calculate Risk : Reward per trade
export function calculateTradeRR(pnl: number | string, slAmount: number | string): {
  ratioText: string;
  rMultiple: number | null;
  badgeText: string;
  isPositive: boolean;
  isNeutral: boolean;
  isLoss: boolean;
} {
  const numSl = typeof slAmount === 'number' ? slAmount : parseFloat(String(slAmount));
  const numPnl = typeof pnl === 'number' ? pnl : parseFloat(String(pnl));

  if (!numSl || isNaN(numSl) || numSl <= 0 || isNaN(numPnl)) {
    return {
      ratioText: '—',
      rMultiple: null,
      badgeText: 'Enter Risk ($)',
      isPositive: false,
      isNeutral: true,
      isLoss: false
    };
  }

  const r = numPnl / numSl;
  if (Math.abs(r) < 0.001) {
    return {
      ratioText: '1 : 0.00',
      rMultiple: 0,
      badgeText: '0.00R (BE)',
      isPositive: false,
      isNeutral: true,
      isLoss: false
    };
  }

  if (r > 0) {
    return {
      ratioText: `1 : ${r.toFixed(2)}`,
      rMultiple: r,
      badgeText: `+${r.toFixed(2)}R (Win)`,
      isPositive: true,
      isNeutral: false,
      isLoss: false
    };
  }

  // Negative numeric value indicates negative risk:reward and loss trade
  return {
    ratioText: `1 : -${Math.abs(r).toFixed(2)}`,
    rMultiple: r,
    badgeText: `-${Math.abs(r).toFixed(2)}R (Loss)`,
    isPositive: false,
    isNeutral: false,
    isLoss: true
  };
}

const STORAGE_KEY = 'fx_mastermind_journals_v2';
const BALANCE_STORAGE_KEY = 'fx_mastermind_starting_balance_v2';

export const TradingJournal: React.FC<TradingJournalProps> = ({
  currentDateStr,
  onDateChange
}) => {
  // Selected date
  const [selectedDate, setSelectedDate] = useState<string>(() => {
    return currentDateStr || new Date().toISOString().slice(0, 10);
  });

  // Starting balance
  const [startingBalance, setStartingBalance] = useState<number>(() => {
    const saved = localStorage.getItem(BALANCE_STORAGE_KEY);
    return saved ? parseFloat(saved) : 10000;
  });

  // All journal records: { [dateStr]: DailyJournal }
  const [journals, setJournals] = useState<{ [date: string]: DailyJournal }>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && Object.keys(parsed).length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.error('Failed to load journals', e);
    }
    // Initialize with comprehensive multi-day sample showing green (profit), red (loss), and breakeven
    return getInitialSampleJournals();
  });

  // Toggle calendar view
  const [showCalendar, setShowCalendar] = useState<boolean>(true);

  // Popup modal for showing calendar day result
  const [popupJournalDate, setPopupJournalDate] = useState<string | null>(null);

  // Search filter query for table rows
  const [searchFilter, setSearchFilter] = useState<string>('');

  // Local daily observations state for instant responsiveness and debounced auto-saving
  const [localObs, setLocalObs] = useState<DailyObservations>(() => {
    const today = currentDateStr || new Date().toISOString().slice(0, 10);
    return journals[today]?.observations || {
      marketMovement: '',
      mistakes: '',
      riskReward: '',
      notes: ''
    };
  });

  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving'>('saved');
  const [lastSavedTime, setLastSavedTime] = useState<string>('');
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const pendingObsRef = useRef<DailyObservations>(localObs);
  const prevSelectedDateRef = useRef<string>(selectedDate);
  const selectedDateRef = useRef<string>(selectedDate);
  selectedDateRef.current = selectedDate;

  // Sync prop changes
  useEffect(() => {
    if (currentDateStr && currentDateStr !== selectedDate) {
      setSelectedDate(currentDateStr);
    }
  }, [currentDateStr]);

  // Persist journals to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(journals));
    } catch (e) {
      console.error('Failed to save journals', e);
    }
  }, [journals]);

  // Persist starting balance
  useEffect(() => {
    localStorage.setItem(BALANCE_STORAGE_KEY, startingBalance.toString());
  }, [startingBalance]);

  // Flush daily observations immediately
  const flushDailyObservations = useCallback(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = null;
    }
    const targetDate = selectedDateRef.current;
    const currentPending = pendingObsRef.current;

    setJournals(prev => {
      const existing = prev[targetDate] || {
        id: `journal-${targetDate}`,
        date: targetDate,
        startingBalance: startingBalance,
        trades: [],
        observations: {
          marketMovement: '',
          mistakes: '',
          riskReward: '',
          notes: ''
        }
      };

      return {
        ...prev,
        [targetDate]: {
          ...existing,
          observations: { ...currentPending }
        }
      };
    });

    const now = new Date();
    setLastSavedTime(
      now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    );
    setSaveStatus('saved');
  }, [startingBalance]);

  // Sync local observations state when selectedDate changes
  useEffect(() => {
    if (prevSelectedDateRef.current !== selectedDate) {
      // Flush previous date if there was a debounce timer running
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
        debounceTimerRef.current = null;
        const prevDate = prevSelectedDateRef.current;
        const obsToSave = pendingObsRef.current;
        setJournals(prev => {
          const existing = prev[prevDate] || {
            id: `journal-${prevDate}`,
            date: prevDate,
            startingBalance: startingBalance,
            trades: [],
            observations: { marketMovement: '', mistakes: '', riskReward: '', notes: '' }
          };
          return {
            ...prev,
            [prevDate]: {
              ...existing,
              observations: obsToSave
            }
          };
        });
      }

      // Load newly selected date's observations
      const newObs = journals[selectedDate]?.observations || {
        marketMovement: '',
        mistakes: '',
        riskReward: '',
        notes: ''
      };
      setLocalObs(newObs);
      pendingObsRef.current = newObs;
      prevSelectedDateRef.current = selectedDate;
      setSaveStatus('saved');
    }
  }, [selectedDate, startingBalance, journals]);

  // Clean up and flush on unmount to prevent data loss
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
        const targetDate = selectedDateRef.current;
        const currentPending = pendingObsRef.current;
        try {
          const raw = localStorage.getItem(STORAGE_KEY);
          const parsed = (raw ? JSON.parse(raw) : {}) || {};
          if (parsed && typeof parsed === 'object') {
            if (parsed[targetDate]) {
              parsed[targetDate].observations = currentPending;
            } else {
              parsed[targetDate] = {
                id: `journal-${targetDate}`,
                date: targetDate,
                startingBalance: 10000,
                trades: [],
                observations: currentPending
              };
            }
            localStorage.setItem(STORAGE_KEY, JSON.stringify(parsed));
          }
        } catch (e) {
          console.error('Failed to flush observations on unmount', e);
        }
      }
    };
  }, []);

  // Handle observation typing with 450ms debounce
  const handleObservationChange = (field: keyof DailyObservations, value: string) => {
    setLocalObs(prev => {
      const updated = { ...prev, [field]: value };
      pendingObsRef.current = updated;
      return updated;
    });
    setSaveStatus('saving');

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      flushDailyObservations();
    }, 450);
  };

  // Current day's active journal
  const currentJournal: DailyJournal = useMemo(() => {
    if (journals[selectedDate]) {
      return journals[selectedDate];
    }
    return {
      id: `journal-${selectedDate}`,
      date: selectedDate,
      startingBalance: startingBalance,
      trades: [],
      observations: {
        marketMovement: '',
        mistakes: '',
        riskReward: '',
        notes: ''
      }
    };
  }, [journals, selectedDate, startingBalance]);

  // Handle date change
  const handleDateSelect = (newDate: string) => {
    setSelectedDate(newDate);
    if (onDateChange) onDateChange(newDate);
    setPopupJournalDate(newDate);
  };

  const handlePrevDay = () => {
    const d = new Date(selectedDate + 'T00:00:00');
    d.setDate(d.getDate() - 1);
    handleDateSelect(d.toISOString().slice(0, 10));
  };

  const handleNextDay = () => {
    const d = new Date(selectedDate + 'T00:00:00');
    d.setDate(d.getDate() + 1);
    handleDateSelect(d.toISOString().slice(0, 10));
  };

  const handleToday = () => {
    handleDateSelect(new Date().toISOString().slice(0, 10));
  };

  // Update current journal helper
  const updateCurrentJournal = (updater: (prev: DailyJournal) => DailyJournal) => {
    setJournals(prev => {
      const existing = prev[selectedDate] || {
        id: `journal-${selectedDate}`,
        date: selectedDate,
        startingBalance: startingBalance,
        trades: [],
        observations: {
          marketMovement: '',
          mistakes: '',
          riskReward: '',
          notes: ''
        }
      };
      const updated = updater(existing);
      return {
        ...prev,
        [selectedDate]: updated
      };
    });
  };

  // Add new trade with preset symbol
  const handleAddTrade = (defaultSymbol = 'EURUSD') => {
    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    
    const newTrade: TradeEntry = {
      id: `tr-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      date: selectedDate,
      time: timeStr,
      symbol: defaultSymbol,
      lotSize: '1.0',
      entryPrice: '',
      slAmount: '100.00',
      pnl: 0,
      closeStatus: 'Open'
    };

    updateCurrentJournal(prev => ({
      ...prev,
      trades: [newTrade, ...prev.trades]
    }));
  };

  // Update specific trade field
  const handleUpdateTrade = (id: string, field: keyof TradeEntry, value: any) => {
    updateCurrentJournal(prev => ({
      ...prev,
      trades: prev.trades.map(t => {
        if (t.id !== id) return t;

        const updated = { ...t, [field]: value };

        // Auto-clean symbol
        if (field === 'symbol' && typeof value === 'string') {
          updated.symbol = value.toUpperCase().trim();
        }

        // Auto determine status if PnL changed
        if (field === 'pnl') {
          const strVal = String(value).trim();
          const num = parseFloat(strVal);
          if (strVal === '-' || strVal === '+' || strVal === '') {
            updated.closeStatus = 'Open';
          } else if (!isNaN(num)) {
            if (num > 0) updated.closeStatus = 'TP Hit';
            else if (num < 0) updated.closeStatus = 'SL Hit';
            else updated.closeStatus = 'Breakeven';
          }
        }

        return updated;
      })
    }));
  };

  // Delete trade
  const handleDeleteTrade = (id: string) => {
    updateCurrentJournal(prev => ({
      ...prev,
      trades: prev.trades.filter(t => t.id !== id)
    }));
  };

  // Duplicate trade
  const handleDuplicateTrade = (trade: TradeEntry) => {
    const duplicated: TradeEntry = {
      ...trade,
      id: `tr-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`
    };
    updateCurrentJournal(prev => ({
      ...prev,
      trades: [duplicated, ...prev.trades]
    }));
  };

  // Filtered trades by search input
  const filteredTrades = useMemo(() => {
    const q = searchFilter.trim().toLowerCase();
    if (!q) return currentJournal.trades;
    return currentJournal.trades.filter(t => {
      const symMatch = t.symbol.toLowerCase().includes(q);
      const entryMatch = String(t.entryPrice || '').toLowerCase().includes(q);
      return symMatch || entryMatch;
    });
  }, [currentJournal.trades, searchFilter]);

  // Metrics calculation including Risk / Reward progress
  const metrics = useMemo(() => {
    const trades = currentJournal.trades;
    let totalProfit = 0;
    let totalLoss = 0;
    let winCount = 0;
    let lossCount = 0;
    let beCount = 0;
    let openCount = 0;
    let totalRiskedUSD = 0;
    let totalRRealized = 0;
    let winRMultiples: number[] = [];
    let allRMultiples: number[] = [];

    trades.forEach(t => {
      const pnl = Number(t.pnl) || 0;
      const sl = parseFloat(String(t.slAmount || 0));

      if (sl > 0) {
        totalRiskedUSD += sl;
        const r = pnl / sl;
        totalRRealized += r;
        allRMultiples.push(r);
        if (pnl > 0) {
          winRMultiples.push(r);
        }
      }

      if (pnl === 0 && (!t.closeStatus || t.closeStatus === 'Open')) {
        openCount++;
      } else if (pnl > 0) {
        totalProfit += pnl;
        winCount++;
      } else if (pnl < 0) {
        totalLoss += Math.abs(pnl);
        lossCount++;
      } else {
        beCount++;
      }
    });

    const netPnL = totalProfit - totalLoss;
    const closedCount = winCount + lossCount + beCount;
    const winRate = closedCount > 0 ? Math.round((winCount / closedCount) * 100) : 0;
    const profitFactor = totalLoss > 0 ? (totalProfit / totalLoss).toFixed(2) : totalProfit > 0 ? '∞' : '0.00';
    const closingBalance = startingBalance + netPnL;
    const returnOnAccount = startingBalance > 0 ? ((netPnL / startingBalance) * 100).toFixed(2) : '0.00';

    // Average Win R:R
    const avgWinRR = winRMultiples.length > 0 
      ? (winRMultiples.reduce((a, b) => a + b, 0) / winRMultiples.length)
      : 0;

    // Average Overall R:R
    const avgOverallRR = allRMultiples.length > 0
      ? (allRMultiples.reduce((a, b) => a + b, 0) / allRMultiples.length)
      : 0;

    // Best R:R win
    const maxWinRR = winRMultiples.length > 0 ? Math.max(...winRMultiples) : 0;

    // Benchmark comparison: Target 1:2.0 RR (100% when avgWinRR reaches 2.0)
    const rrTargetBenchmark = 2.0;
    const rrProgressPercent = avgWinRR > 0 ? Math.min(100, Math.round((avgWinRR / rrTargetBenchmark) * 100)) : 0;

    return {
      totalProfit,
      totalLoss,
      netPnL,
      winCount,
      lossCount,
      beCount,
      openCount,
      closedCount,
      winRate,
      profitFactor,
      closingBalance,
      returnOnAccount,
      totalRiskedUSD,
      totalRRealized,
      avgWinRR,
      avgOverallRR,
      maxWinRR,
      rrProgressPercent
    };
  }, [currentJournal.trades, startingBalance]);

  // Formatted date string for header
  const formattedDateTitle = useMemo(() => {
    const d = new Date(selectedDate + 'T00:00:00');
    return d.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }, [selectedDate]);

  // Popup Day Result Memos
  const popupJournal = useMemo(() => {
    if (!popupJournalDate) return null;
    return journals[popupJournalDate] || {
      id: `journal-${popupJournalDate}`,
      date: popupJournalDate,
      startingBalance: startingBalance,
      trades: [],
      observations: {
        marketMovement: '',
        mistakes: '',
        riskReward: '',
        notes: ''
      }
    };
  }, [popupJournalDate, journals, startingBalance]);

  const popupStats = useMemo(() => {
    if (!popupJournal) return null;
    const trades = popupJournal.trades || [];
    let netPnL = 0;
    let winCount = 0;
    let lossCount = 0;
    let beCount = 0;
    let openCount = 0;
    let totalProfit = 0;
    let totalLoss = 0;

    trades.forEach(t => {
      const p = parseFloat(String(t.pnl)) || 0;
      netPnL += p;
      if (p > 0) totalProfit += p;
      else if (p < 0) totalLoss += Math.abs(p);

      if (t.closeStatus === 'TP Hit') winCount++;
      else if (t.closeStatus === 'SL Hit') lossCount++;
      else if (t.closeStatus === 'Breakeven') beCount++;
      else if (t.closeStatus === 'Open') {
        openCount++;
        if (p > 0) winCount++;
        else if (p < 0) lossCount++;
        else beCount++;
      } else {
        if (p > 0) winCount++;
        else if (p < 0) lossCount++;
        else beCount++;
      }
    });

    const closedCount = winCount + lossCount + beCount;
    const winRate = closedCount > 0 ? (winCount / closedCount) * 100 : 0;
    const profitFactor = totalLoss > 0 ? (totalProfit / totalLoss) : totalProfit > 0 ? 99.9 : 0;

    return {
      netPnL,
      winCount,
      lossCount,
      beCount,
      openCount,
      closedCount,
      winRate: winRate.toFixed(1),
      profitFactor: profitFactor.toFixed(2),
      endingBalance: (popupJournal.startingBalance || startingBalance) + netPnL,
      tradeCount: trades.length
    };
  }, [popupJournal, startingBalance]);

  const formattedPopupDateTitle = useMemo(() => {
    if (!popupJournalDate) return '';
    const d = new Date(popupJournalDate + 'T00:00:00');
    return d.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }, [popupJournalDate]);

  // Export CSV
  const handleExportJournal = () => {
    const headers = ['Date', 'Time', 'Symbol', 'Lot Size', 'Entry Price', 'Risk per Trade ($)', 'PnL ($)', 'Risk : Reward'];
    const rows = currentJournal.trades.map(t => {
      const rr = calculateTradeRR(t.pnl, t.slAmount);
      return [
        t.date,
        t.time || '',
        t.symbol,
        t.lotSize || t.qty || '1.0',
        t.entryPrice || '',
        t.slAmount || '',
        t.pnl,
        rr.ratioText
      ];
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Trading_Journal_${selectedDate}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* 0. TRADING CALENDAR (Green = Profit, Red = Loss, No color = No trade / Break-even) */}
      {showCalendar && (
        <TradingCalendar
          journalEntries={journals}
          journals={journals}
          selectedDate={selectedDate}
          onSelectDate={handleDateSelect}
        />
      )}

      {/* 1. TOP HEADER & METADATA BAR FOR SELECTED DAY */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-6 shadow-xs text-slate-100 transition-colors">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          {/* Date and Day Title */}
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider bg-blue-950 text-blue-300 border border-blue-900 rounded-md">
                Trading Journal
              </span>
              <span className="text-xs text-slate-400 font-mono">
                {currentJournal.trades.length} {currentJournal.trades.length === 1 ? 'Trade' : 'Trades'} Logged
              </span>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-xl sm:text-2xl font-bold text-slate-100 tracking-tight">
                {formattedDateTitle}
              </h2>
            </div>
          </div>

          {/* Date Picker & Navigation Controls */}
          <div className="flex items-center gap-2 flex-wrap w-full lg:w-auto justify-start lg:justify-end">
            <div className="flex items-center bg-slate-800 border border-slate-700 rounded-xl p-1 shadow-2xs">
              <button
                onClick={handlePrevDay}
                title="Previous Day"
                className="p-1.5 hover:bg-slate-700 text-slate-300 rounded-lg transition"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => e.target.value && handleDateSelect(e.target.value)}
                className="bg-transparent text-xs font-semibold text-slate-200 px-2 py-1 outline-none border-none cursor-pointer color-scheme-dark"
              />
              <button
                onClick={handleNextDay}
                title="Next Day"
                className="p-1.5 hover:bg-slate-700 text-slate-300 rounded-lg transition"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <button
              onClick={() => setShowCalendar(prev => !prev)}
              className={`px-3 py-2 text-xs font-medium rounded-xl transition flex items-center gap-1.5 ${
                showCalendar 
                  ? 'bg-slate-950 text-slate-100 border border-slate-800 font-semibold shadow-2xs' 
                  : 'bg-slate-950 hover:bg-slate-900 text-slate-200 border border-slate-800 shadow-2xs'
              }`}
              title="Toggle Trading Calendar"
            >
              <CalendarIcon className="w-3.5 h-3.5 text-slate-300" />
              {showCalendar ? 'Hide Calendar' : 'Show Calendar'}
            </button>

            <button
              onClick={handleToday}
              className="px-3 py-2 text-xs font-medium bg-slate-950 hover:bg-slate-900 text-slate-200 border border-slate-800 rounded-xl transition shadow-2xs cursor-pointer"
            >
              Today
            </button>

            <button
              onClick={() => {
                if (window.confirm('Reset & load rich demo month trades into the Trading Calendar?')) {
                  const sample = getInitialSampleJournals();
                  setJournals(sample);
                }
              }}
              className="px-3 py-2 text-xs font-medium bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 text-gray-700 dark:text-slate-200 rounded-xl transition flex items-center gap-1"
              title="Load sample monthly trades to preview calendar"
            >
              <RotateCcw className="w-3 h-3 text-gray-500 dark:text-slate-400" />
              Sample Data
            </button>

            <button
              onClick={handleExportJournal}
              className="px-3 py-2 text-xs font-medium bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 text-gray-700 dark:text-slate-200 rounded-xl transition flex items-center gap-1.5"
              title="Export trades as CSV"
            >
              <Download className="w-3.5 h-3.5 text-gray-500 dark:text-slate-400" />
              Export
            </button>
          </div>
        </div>

        {/* Account Balance & Daily Performance Summary Cards (including Risk : Reward Progress) */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4 mt-6 pt-6 border-t border-gray-100 dark:border-slate-800">
          {/* Starting Account Balance */}
          <div className="bg-gray-50/80 dark:bg-slate-800/80 border border-gray-200/80 dark:border-slate-700/80 rounded-xl p-3.5">
            <div className="text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider mb-1 flex items-center justify-between">
              <span>Starting A/C</span>
              <DollarSign className="w-3.5 h-3.5 text-gray-400 dark:text-slate-500" />
            </div>
            <div className="flex items-center gap-1">
              <span className="text-gray-400 dark:text-slate-500 font-mono text-sm">$</span>
              <input
                type="number"
                value={startingBalance}
                onChange={(e) => setStartingBalance(parseFloat(e.target.value) || 0)}
                className="w-full bg-transparent font-mono font-bold text-lg text-slate-100 focus:bg-slate-900 focus:ring-1 focus:ring-blue-500 rounded px-1 -ml-1 outline-none"
                placeholder="10000"
              />
            </div>
          </div>

          {/* Closing Account Balance */}
          <div className="bg-gray-50/80 dark:bg-slate-800/80 border border-gray-200/80 dark:border-slate-700/80 rounded-xl p-3.5">
            <div className="text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider mb-1 flex items-center justify-between">
              <span>Closing A/C</span>
              <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded font-bold ${
                Number(metrics.returnOnAccount) >= 0 ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300' : 'bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300'
              }`}>
                {Number(metrics.returnOnAccount) >= 0 ? '+' : ''}{metrics.returnOnAccount}%
              </span>
            </div>
            <div className="font-mono font-bold text-lg text-gray-900 dark:text-slate-100">
              ${metrics.closingBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
          </div>

          {/* Day Net PnL */}
          <div className={`border rounded-xl p-3.5 ${
            metrics.netPnL > 0 
              ? 'bg-emerald-50/70 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-900' 
              : metrics.netPnL < 0 
              ? 'bg-rose-50/70 dark:bg-rose-950/40 border-rose-200 dark:border-rose-900' 
              : 'bg-gray-50 dark:bg-slate-800 border-gray-200 dark:border-slate-700'
          }`}>
            <div className="text-xs font-semibold uppercase tracking-wider mb-1 text-gray-600 dark:text-slate-400 flex items-center justify-between">
              <span>Net Day PnL</span>
              <span className="text-[10px] font-mono text-gray-400 dark:text-slate-500">USD</span>
            </div>
            <div className="flex items-center gap-2">
              {metrics.netPnL > 0 ? (
                <TrendingUp className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
              ) : metrics.netPnL < 0 ? (
                <TrendingDown className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0" />
              ) : (
                <DollarSign className="w-5 h-5 text-gray-400 shrink-0" />
              )}
              <span className={`font-mono font-bold text-lg ${
                metrics.netPnL > 0 ? 'text-emerald-700 dark:text-emerald-300' : metrics.netPnL < 0 ? 'text-rose-700 dark:text-rose-300' : 'text-gray-700 dark:text-slate-300'
              }`}>
                {metrics.netPnL >= 0 ? '+' : '-'}${Math.abs(metrics.netPnL).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
          </div>

          {/* Win Rate */}
          <div className="bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 rounded-xl p-3.5">
            <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
              Day Win Rate
            </div>
            <div className="flex items-baseline justify-between">
              <span className="font-mono font-bold text-lg text-gray-900 dark:text-slate-100">
                {metrics.winRate}%
              </span>
              <span className="text-xs text-gray-500 dark:text-slate-400 font-mono">
                <span className="text-emerald-600 dark:text-emerald-400 font-bold">{metrics.winCount}W</span> - <span className="text-rose-600 dark:text-rose-400 font-bold">{metrics.lossCount}L</span>
              </span>
            </div>
          </div>

          {/* Risk : Reward in Progress (Requested) */}
          <div className="bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-200/90 dark:border-indigo-900/60 rounded-xl p-3.5 col-span-2 sm:col-span-1">
            <div className="text-xs font-semibold text-indigo-900 dark:text-indigo-200 uppercase tracking-wider mb-1 flex items-center justify-between">
              <span className="flex items-center gap-1">
                <Scale className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                Avg Risk : Reward
              </span>
              <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded font-bold ${
                metrics.totalRRealized >= 0 ? 'bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200' : 'bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300'
              }`}>
                {metrics.totalRRealized >= 0 ? '+' : ''}{metrics.totalRRealized.toFixed(2)}R Total
              </span>
            </div>
            <div className="flex items-baseline justify-between">
              <span className="font-mono font-bold text-lg text-indigo-950 dark:text-indigo-100">
                {metrics.avgWinRR > 0 ? `1 : ${metrics.avgWinRR.toFixed(2)}` : '1 : 0.00'}
              </span>
              <span className="text-[11px] font-medium text-indigo-700 dark:text-indigo-300 font-mono">
                Max: {metrics.maxWinRR > 0 ? `1:${metrics.maxWinRR.toFixed(1)}` : '—'}
              </span>
            </div>
            {/* Realization Progress bar */}
            <div className="mt-2 w-full bg-indigo-200/60 dark:bg-indigo-900/60 rounded-full h-1.5 overflow-hidden">
              <div 
                className="bg-indigo-600 dark:bg-indigo-400 h-1.5 rounded-full transition-all duration-500"
                style={{ width: `${metrics.rrProgressPercent}%` }}
                title={`R:R Goal realization: ${metrics.rrProgressPercent}%`}
              />
            </div>
          </div>
        </div>
      </div>

      {/* 2. TRADES TABLE SECTION */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xs overflow-hidden transition-colors">
        {/* Table Controls Bar */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 bg-slate-800/50">
          {/* Quick Search Trades Filter */}
          <div className="flex items-center gap-2 flex-1 max-w-xs sm:max-w-sm">
            <div className="relative w-full">
              <input
                type="text"
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                placeholder="Filter trades by symbol, price..."
                className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-8 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 outline-none focus:border-blue-500"
              />
              <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
            </div>
            {searchFilter && (
              <button
                onClick={() => setSearchFilter('')}
                className="text-xs text-slate-400 hover:text-slate-200 px-2 py-1 bg-slate-700 rounded-lg shrink-0"
              >
                Clear
              </button>
            )}
          </div>

          {/* Quick Add Trade Buttons */}
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center bg-slate-950 border border-slate-800 rounded-xl p-0.5 shadow-2xs">
              <button
                onClick={() => handleAddTrade('EURUSD')}
                className="px-3 py-1.5 text-xs font-semibold text-slate-100 hover:bg-slate-900 rounded-lg transition flex items-center gap-1.5 cursor-pointer"
                title="Add new trade row"
              >
                <Plus className="w-3.5 h-3.5 text-slate-300" />
                + Add Trade
              </button>
              <button
                onClick={() => handleAddTrade('XAUUSD')}
                className="px-2.5 py-1.5 text-xs font-mono font-medium text-slate-300 hover:bg-slate-900 rounded-lg transition cursor-pointer"
                title="Add Gold trade"
              >
                + XAUUSD
              </button>
              <button
                onClick={() => handleAddTrade('EURUSD')}
                className="px-2.5 py-1.5 text-xs font-mono font-medium text-slate-300 hover:bg-slate-900 rounded-lg transition cursor-pointer"
                title="Add EURUSD trade"
              >
                + EURUSD
              </button>
              <button
                onClick={() => handleAddTrade('US30')}
                className="px-2.5 py-1.5 text-xs font-mono font-medium text-slate-300 hover:bg-slate-900 rounded-lg transition cursor-pointer"
                title="Add US30 trade"
              >
                + US30
              </button>
              <button
                onClick={() => handleAddTrade('NAS100')}
                className="px-2.5 py-1.5 text-xs font-mono font-medium text-slate-300 hover:bg-slate-900 rounded-lg transition cursor-pointer"
                title="Add NAS100 trade"
              >
                + NAS100
              </button>
            </div>
          </div>
        </div>

        {/* Trade Matrix Table */}
        <div className="overflow-x-auto min-h-[220px]">
          {filteredTrades.length === 0 ? (
            <div className="py-16 text-center px-4 bg-slate-900">
              <div className="w-12 h-12 rounded-2xl bg-blue-950 text-blue-400 flex items-center justify-center mx-auto mb-3">
                <FileText className="w-6 h-6" />
              </div>
              <h3 className="text-base font-semibold text-slate-200 mb-1">
                {searchFilter ? `No trades matching "${searchFilter}"` : 'No trades logged for this date'}
              </h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto mb-4">
                Click "+ Add Trade" above to select symbols, enter lot size, entry price, SL/ENTRY risk amount in USD, and view auto-calculated Risk : Reward.
              </p>
              <div className="flex items-center justify-center gap-2">
                <button
                  onClick={() => handleAddTrade('EURUSD')}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold transition flex items-center gap-1.5 shadow-xs cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  Add First Trade
                </button>
              </div>
            </div>
          ) : (
            <table className="w-full text-left text-xs border-collapse bg-slate-900">
              <thead>
                <tr className="bg-slate-800 border-b border-slate-700 text-slate-200 font-bold uppercase tracking-wider text-[11px]">
                  <th className="py-3 px-3 w-10 text-center">#</th>
                  <th className="py-3 px-3 min-w-[180px]">Symbol</th>
                  <th className="py-3 px-3 w-24">Lot Size</th>
                  <th className="py-3 px-3 w-28">Entry Price</th>
                  <th className="py-3 px-3 w-36 min-w-[140px]">Risk per Trade ($)</th>
                  <th className="py-3 px-3 w-56 min-w-[210px]">PnL in USD (Profit / Loss)</th>
                  <th className="py-3 px-4 w-44 min-w-[160px] text-center">Risk : Reward</th>
                  <th className="py-3 px-2 w-16 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {filteredTrades.map((trade, idx) => {
                  const pnlNum = Number(trade.pnl) || 0;
                  const isProfit = pnlNum > 0;
                  const isLoss = pnlNum < 0;
                  const rr = calculateTradeRR(trade.pnl, trade.slAmount);

                  return (
                    <tr 
                      key={trade.id} 
                      className={`hover:bg-blue-50/30 dark:hover:bg-blue-950/20 transition-colors ${
                        isProfit ? 'bg-emerald-50/15 dark:bg-emerald-950/10' : isLoss ? 'bg-rose-50/15 dark:bg-rose-950/10' : ''
                      }`}
                    >
                      {/* # Number / Time */}
                      <td className="py-3 px-3 text-center font-mono font-medium text-gray-400 dark:text-slate-500">
                        {idx + 1}
                      </td>

                      {/* Symbol - Searchable by Keyword (EURUSD, XAUUSD, US30, etc.) */}
                      <td className="py-3 px-3">
                        <SearchableSymbolInput
                          value={trade.symbol}
                          onChange={(newSymbol) => handleUpdateTrade(trade.id, 'symbol', newSymbol)}
                          placeholder="Search symbol (e.g. gold, eurusd)..."
                        />
                      </td>

                      {/* Lot Size */}
                      <td className="py-3 px-3">
                        <input
                          type="text"
                          value={trade.lotSize ?? trade.qty ?? ''}
                          onChange={(e) => handleUpdateTrade(trade.id, 'lotSize', e.target.value)}
                          className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 font-mono text-xs text-slate-100 focus:border-blue-500 focus:bg-blue-950/30 outline-none transition"
                          placeholder="1.0"
                        />
                      </td>

                      {/* Entry Price of Symbol */}
                      <td className="py-3 px-3">
                        <input
                          type="text"
                          value={trade.entryPrice ?? ''}
                          onChange={(e) => handleUpdateTrade(trade.id, 'entryPrice', e.target.value)}
                          className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 font-mono text-xs text-slate-100 focus:border-blue-500 focus:bg-blue-950/30 outline-none transition"
                          placeholder="e.g. 1.0895"
                        />
                      </td>

                      {/* Risk per Trade ($) - Risked Amount in USD per Trade */}
                      <td className="py-3 px-3">
                        <div className="relative">
                          <input
                            type="number"
                            step="any"
                            min="0"
                            value={trade.slAmount ?? ''}
                            onChange={(e) => handleUpdateTrade(trade.id, 'slAmount', e.target.value)}
                            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 font-mono font-medium text-xs text-slate-100 focus:border-blue-500 focus:bg-blue-950/30 outline-none transition"
                            placeholder="100.00"
                            title="Risk per Trade ($) - Risked amount in USD per trade"
                          />
                        </div>
                      </td>

                      {/* PnL ($) - Long spacious input for typing USD with negative & positive numerics */}
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-1.5 w-full">
                          <div className="relative flex-1">
                            <span className={`absolute left-2.5 top-1/2 -translate-y-1/2 text-xs font-mono font-bold select-none pointer-events-none ${
                              isProfit ? 'text-emerald-700 dark:text-emerald-400' : isLoss ? 'text-rose-700 dark:text-rose-400' : 'text-gray-400 dark:text-slate-500'
                            }`}>
                              $
                            </span>
                            <input
                              type="text"
                              inputMode="decimal"
                              value={trade.pnl === 0 ? '0' : trade.pnl ?? ''}
                              onChange={(e) => {
                                const raw = e.target.value;
                                // Allow negative sign, plus sign, digits, decimal points
                                if (/^[-+]?[0-9]*\.?[0-9]*$/.test(raw)) {
                                  handleUpdateTrade(trade.id, 'pnl', raw);
                                }
                              }}
                              onBlur={(e) => {
                                const val = e.target.value.trim();
                                if (val === '' || val === '-' || val === '+') {
                                  handleUpdateTrade(trade.id, 'pnl', 0);
                                } else {
                                  const parsed = parseFloat(val);
                                  if (!isNaN(parsed)) {
                                    handleUpdateTrade(trade.id, 'pnl', parsed);
                                  }
                                }
                              }}
                              className={`w-full font-mono font-bold text-xs pl-6 pr-2.5 py-2 rounded-lg border outline-none transition ${
                                isProfit 
                                  ? 'bg-emerald-950/60 text-emerald-200 border-emerald-800 focus:ring-2 focus:ring-emerald-400 shadow-2xs' 
                                  : isLoss 
                                  ? 'bg-rose-950/60 text-rose-200 border-rose-800 focus:ring-2 focus:ring-rose-400 shadow-2xs' 
                                  : 'bg-slate-800 text-slate-200 border-slate-700 focus:border-blue-500'
                              }`}
                              placeholder="0.00 (e.g. -150.00)"
                              title="Type USD PnL amount. Type negative number (e.g. -150) for Loss trades."
                            />
                          </div>

                          {/* Quick +/- sign toggle button */}
                          <button
                            type="button"
                            onClick={() => {
                              const current = parseFloat(String(trade.pnl)) || 0;
                              if (current !== 0) {
                                handleUpdateTrade(trade.id, 'pnl', -current);
                              } else {
                                handleUpdateTrade(trade.id, 'pnl', '-');
                              }
                            }}
                            title="Toggle positive/negative sign (Profit/Loss)"
                            className={`px-2 py-1.5 rounded-lg text-xs font-mono font-bold border transition shrink-0 ${
                              isLoss
                                ? 'bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300 border-rose-300 dark:border-rose-800 hover:bg-rose-200 dark:hover:bg-rose-900'
                                : isProfit
                                ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800 hover:bg-emerald-200 dark:hover:bg-emerald-900'
                                : 'bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-slate-300 border-gray-200 dark:border-slate-700 hover:bg-gray-200 dark:hover:bg-slate-700'
                            }`}
                          >
                            ±
                          </button>
                        </div>

                        {/* Trade Outcome Status Banner */}
                        <div className="mt-1 flex items-center justify-between text-[10px] font-mono px-0.5">
                          {isLoss ? (
                            <span className="text-rose-600 dark:text-rose-400 font-semibold flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-rose-500 inline-block"></span>
                              Loss Trade (SL Hit)
                            </span>
                          ) : isProfit ? (
                            <span className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block"></span>
                              Profit Trade (TP Hit)
                            </span>
                          ) : (
                            <span className="text-gray-400 dark:text-slate-500">
                              Break-even / Open
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Risk : Reward per trade (Calculated Column at the end of table) */}
                      <td className="py-3 px-4 text-center">
                        <div className="flex flex-col items-center justify-center gap-1">
                          {rr.rMultiple !== null ? (
                            <>
                              <span className={`font-mono font-bold text-xs px-2.5 py-1 rounded-md border shadow-2xs ${
                                rr.isPositive
                                  ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-950 dark:text-emerald-200 border-emerald-300 dark:border-emerald-800'
                                  : rr.isLoss
                                  ? 'bg-rose-100 dark:bg-rose-950 text-rose-950 dark:text-rose-200 border-rose-300 dark:border-rose-800 font-extrabold'
                                  : 'bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-slate-300 border-gray-200 dark:border-slate-700'
                              }`}>
                                {rr.ratioText}
                              </span>
                              <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded border ${
                                rr.isPositive 
                                  ? 'text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 border-emerald-200 dark:border-emerald-800' 
                                  : rr.isLoss 
                                  ? 'text-rose-800 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/60 border-rose-200 dark:border-rose-800' 
                                  : 'text-gray-500 dark:text-slate-400 bg-gray-50 dark:bg-slate-800 border-gray-200 dark:border-slate-700'
                              }`}>
                                {rr.badgeText}
                              </span>
                            </>
                          ) : (
                            <span className="text-[11px] font-mono text-gray-400 dark:text-slate-500 italic" title="Type SL/ENTRY to calculate R:R">
                              Enter SL/ENTRY
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="py-2.5 px-2 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => handleDuplicateTrade(trade)}
                            title="Duplicate trade row"
                            className="p-1 text-gray-400 dark:text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 rounded hover:bg-blue-50 dark:hover:bg-slate-800 transition"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteTrade(trade.id)}
                            title="Delete trade"
                            className="p-1 text-gray-400 dark:text-slate-500 hover:text-rose-600 dark:hover:text-rose-400 rounded hover:bg-rose-50 dark:hover:bg-slate-800 transition"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* Footer Quick Action */}
        <div className="p-3 bg-gray-50/80 dark:bg-slate-800/80 border-t border-gray-200 dark:border-slate-800 flex items-center justify-between text-xs text-gray-500 dark:text-slate-400">
          <div className="flex items-center gap-3 flex-wrap">
            <span>Logged: <strong className="text-gray-900 dark:text-slate-100 font-mono">{filteredTrades.length}</strong> trades</span>
            <span>•</span>
            <span>Net PnL: <strong className={`font-mono ${metrics.netPnL >= 0 ? 'text-emerald-700 dark:text-emerald-400' : 'text-rose-700 dark:text-rose-400'}`}>
              {metrics.netPnL >= 0 ? '+' : '-'}${Math.abs(metrics.netPnL).toFixed(2)}
            </strong></span>
            <span>•</span>
            <span>Avg Win R:R: <strong className="font-mono text-indigo-700 dark:text-indigo-400">
              {metrics.avgWinRR > 0 ? `1 : ${metrics.avgWinRR.toFixed(2)}` : '—'}
            </strong></span>
          </div>

          <button
            onClick={() => handleAddTrade('EURUSD')}
            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold text-xs transition flex items-center gap-1 shadow-2xs"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Row
          </button>
        </div>
      </div>

      {/* 3. POST-TRADE REFLECTIONS & DAILY OBSERVATIONS SECTION */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xs space-y-6 transition-colors">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3 flex-wrap gap-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-amber-950 text-amber-300 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-slate-100 text-base">Daily Reflection & Performance Observations</h3>
              <p className="text-xs text-slate-400">Structured review following session close</p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Auto-save Status Indicator */}
            {saveStatus === 'saving' ? (
              <span className="flex items-center gap-1.5 text-[11px] font-medium text-amber-800 dark:text-amber-300 bg-amber-50 dark:bg-amber-950 px-2.5 py-1 rounded-lg border border-amber-200 dark:border-amber-800 shadow-2xs">
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping inline-block" />
                Auto-saving...
              </span>
            ) : (
              <span className="flex items-center gap-1.5 text-[11px] font-medium text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-1 rounded-lg border border-emerald-200/90 dark:border-emerald-800 shadow-2xs">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span>{lastSavedTime ? `Auto-saved at ${lastSavedTime}` : 'All changes auto-saved'}</span>
              </span>
            )}

            {/* Quick manual flush button */}
            <button
              type="button"
              onClick={flushDailyObservations}
              className="text-xs font-semibold px-2.5 py-1 bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 text-gray-700 dark:text-slate-200 rounded-lg transition flex items-center gap-1"
              title="Save observations immediately"
            >
              <Save className="w-3 h-3 text-gray-500 dark:text-slate-400" />
              Save Now
            </button>

            <span className="text-xs font-mono px-2.5 py-1 bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-slate-200 rounded-lg hidden sm:inline-block">
              {currentJournal.trades.length} Executions Logged
            </span>
          </div>
        </div>

        {/* Day PnL & Risk Reward Summary Breakdown */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          <div className="p-3 bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/60 rounded-xl">
            <span className="text-[11px] font-semibold text-emerald-800 dark:text-emerald-300 uppercase tracking-wider block">Total Profit</span>
            <span className="text-base sm:text-lg font-mono font-bold text-emerald-700 dark:text-emerald-400">
              +${metrics.totalProfit.toFixed(2)}
            </span>
          </div>

          <div className="p-3 bg-rose-50/60 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/60 rounded-xl">
            <span className="text-[11px] font-semibold text-rose-800 dark:text-rose-300 uppercase tracking-wider block">Total Loss</span>
            <span className="text-base sm:text-lg font-mono font-bold text-rose-700 dark:text-rose-400">
              -${metrics.totalLoss.toFixed(2)}
            </span>
          </div>

          <div className="p-3 bg-blue-50/60 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/60 rounded-xl">
            <span className="text-[11px] font-semibold text-blue-800 dark:text-blue-300 uppercase tracking-wider block">Profit Factor</span>
            <span className="text-base sm:text-lg font-mono font-bold text-blue-700 dark:text-blue-400">
              {metrics.profitFactor}
            </span>
          </div>

          <div className="p-3 bg-purple-50/60 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-900/60 rounded-xl">
            <span className="text-[11px] font-semibold text-purple-800 dark:text-purple-300 uppercase tracking-wider block">Win Ratio</span>
            <span className="text-base sm:text-lg font-mono font-bold text-purple-700 dark:text-purple-400">
              {metrics.winRate}% ({metrics.winCount}W/{metrics.lossCount}L)
            </span>
          </div>

          <div className="p-3 bg-indigo-50/80 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-900/60 rounded-xl col-span-2 sm:col-span-1">
            <span className="text-[11px] font-semibold text-indigo-900 dark:text-indigo-200 uppercase tracking-wider block flex items-center justify-between">
              <span>Risk : Reward</span>
              <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-mono">1:2 Target</span>
            </span>
            <div className="flex items-baseline justify-between mt-0.5">
              <span className="text-base sm:text-lg font-mono font-bold text-indigo-800 dark:text-indigo-300">
                {metrics.avgWinRR > 0 ? `1 : ${metrics.avgWinRR.toFixed(2)}` : '1 : 0.00'}
              </span>
              <span className="text-xs font-mono font-semibold text-indigo-700 dark:text-indigo-400">
                {metrics.totalRRealized >= 0 ? '+' : ''}{metrics.totalRRealized.toFixed(2)}R
              </span>
            </div>
          </div>
        </div>

        {/* 4 Core Observation Areas with Debounced Auto-Save */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          {/* Market Movement */}
          <div className="p-4 bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 rounded-xl space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                <TrendingUp className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                Market Movement & Structure
              </label>
              {saveStatus === 'saving' && (
                <span className="text-[10px] text-amber-600 dark:text-amber-400 font-mono">typing...</span>
              )}
            </div>
            <textarea
              rows={3}
              value={localObs.marketMovement || ''}
              onChange={(e) => handleObservationChange('marketMovement', e.target.value)}
              onBlur={flushDailyObservations}
              placeholder="e.g. Strong London session expansion across Gold and EURUSD. US market open had initial chop before tech index trended higher..."
              className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-xs text-slate-100 placeholder-slate-500 focus:border-blue-500 outline-none leading-relaxed transition"
            />
          </div>

          {/* Mistakes & Rule Adherence */}
          <div className="p-4 bg-rose-950/20 border border-rose-900/50 rounded-xl space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-rose-200 uppercase tracking-wider flex items-center gap-1.5">
                <AlertCircle className="w-3.5 h-3.5 text-rose-400" />
                Mistakes & Discipline Checks
              </label>
              {saveStatus === 'saving' && (
                <span className="text-[10px] text-amber-400 font-mono">typing...</span>
              )}
            </div>
            <textarea
              rows={3}
              value={localObs.mistakes || ''}
              onChange={(e) => handleObservationChange('mistakes', e.target.value)}
              onBlur={flushDailyObservations}
              placeholder="e.g. Entered NAS100 slightly ahead of confirmation candle. Kept SL fixed and did not move it. Good discipline..."
              className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-xs text-slate-100 placeholder-slate-500 focus:border-rose-500 outline-none leading-relaxed transition"
            />
          </div>

          {/* Risk / Reward Management */}
          <div className="p-4 bg-emerald-950/20 border border-emerald-900/50 rounded-xl space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-emerald-200 uppercase tracking-wider flex items-center gap-1.5">
                <Award className="w-3.5 h-3.5 text-emerald-400" />
                Risk / Reward & Execution Quality
              </label>
              {saveStatus === 'saving' && (
                <span className="text-[10px] text-amber-400 font-mono">typing...</span>
              )}
            </div>
            <textarea
              rows={3}
              value={localObs.riskReward || ''}
              onChange={(e) => handleObservationChange('riskReward', e.target.value)}
              onBlur={flushDailyObservations}
              placeholder="e.g. Respected 1% max risk per trade. Average win 1:2.3 R/R. Exited trades according to predetermined levels..."
              className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-xs text-slate-100 placeholder-slate-500 focus:border-emerald-500 outline-none leading-relaxed transition"
            />
          </div>

          {/* Daily Notes & Key Takeaways */}
          <div className="p-4 bg-amber-950/20 border border-amber-900/50 rounded-xl space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-amber-200 uppercase tracking-wider flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-amber-400" />
                Daily Notes & Key Takeaways
              </label>
              {saveStatus === 'saving' && (
                <span className="text-[10px] text-amber-400 font-mono">typing...</span>
              )}
            </div>
            <textarea
              rows={3}
              value={localObs.notes || ''}
              onChange={(e) => handleObservationChange('notes', e.target.value)}
              onBlur={flushDailyObservations}
              placeholder="e.g. Focus on high-probability setups during London and NY session overlaps. Maintain consistent daily checklist routine..."
              className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-xs text-slate-100 placeholder-slate-500 focus:border-amber-500 outline-none leading-relaxed transition"
            />
          </div>
        </div>
      </div>

      {/* Calendar Day Result Popup Modal */}
      {popupJournalDate && popupJournal && popupStats && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md transition-opacity duration-300">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-200">
            
            {/* Header */}
            <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-900/50">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-950 text-blue-400 flex items-center justify-center border border-blue-900/60 shadow-inner">
                  <CalendarIcon className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-100 text-sm sm:text-base leading-snug">
                    {formattedPopupDateTitle}
                  </h3>
                  <p className="text-xs text-slate-400">Trading Session Summary</p>
                </div>
              </div>
              <button
                onClick={() => setPopupJournalDate(null)}
                className="p-1.5 hover:bg-slate-800 text-slate-400 hover:text-slate-100 rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content Body */}
            <div className="p-6 overflow-y-auto space-y-6">
              
              {/* Day Key Metrics Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                
                {/* Net PnL Card */}
                <div className={`p-3.5 rounded-2xl border ${
                  popupStats.netPnL > 0 
                    ? 'bg-emerald-950/30 border-emerald-900/50' 
                    : popupStats.netPnL < 0 
                    ? 'bg-rose-950/30 border-rose-900/50' 
                    : 'bg-slate-800/40 border-slate-700/50'
                }`}>
                  <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">Net Profit / Loss</span>
                  <span className={`text-base sm:text-lg font-mono font-black mt-1 block ${
                    popupStats.netPnL > 0 
                      ? 'text-emerald-400' 
                      : popupStats.netPnL < 0 
                      ? 'text-rose-400' 
                      : 'text-slate-300'
                  }`}>
                    {popupStats.netPnL > 0 ? '+' : ''}${popupStats.netPnL.toFixed(2)}
                  </span>
                </div>

                {/* Executions / Trades logged */}
                <div className="p-3.5 rounded-2xl border bg-slate-800/40 border-slate-700/50">
                  <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">Logged Trades</span>
                  <span className="text-base sm:text-lg font-mono font-bold text-slate-100 mt-1 block">
                    {popupStats.tradeCount} {popupStats.tradeCount === 1 ? 'Trade' : 'Trades'}
                  </span>
                </div>

                {/* Win rate */}
                <div className="p-3.5 rounded-2xl border bg-slate-800/40 border-slate-700/50">
                  <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">Win Ratio</span>
                  <span className="text-base sm:text-lg font-mono font-bold text-purple-400 mt-1 block">
                    {popupStats.winRate}%
                  </span>
                </div>

                {/* Ending Balance */}
                <div className="p-3.5 rounded-2xl border bg-slate-800/40 border-slate-700/50">
                  <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">Ending Balance</span>
                  <span className="text-base sm:text-lg font-mono font-bold text-blue-400 mt-1 block">
                    ${popupStats.endingBalance.toFixed(2)}
                  </span>
                </div>

              </div>

              {/* Day Trades List Table */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                  <Scale className="w-3.5 h-3.5 text-blue-400" />
                  Day Trades & Executions ({popupStats.tradeCount})
                </h4>
                
                {popupJournal.trades && popupJournal.trades.length > 0 ? (
                  <div className="overflow-hidden border border-slate-800 rounded-xl bg-slate-950/40">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="bg-slate-900 border-b border-slate-800 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                            <th className="py-2.5 px-3">Symbol</th>
                            <th className="py-2.5 px-3 text-center">Lot Size</th>
                            <th className="py-2.5 px-3 text-right">PnL ($)</th>
                            <th className="py-2.5 px-3 text-center">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800 text-xs">
                          {popupJournal.trades.map((trade) => {
                            const pVal = parseFloat(String(trade.pnl)) || 0;
                            return (
                              <tr key={trade.id} className="hover:bg-slate-800/30 text-slate-300">
                                <td className="py-2 px-3 font-semibold font-mono text-slate-100">
                                  {trade.symbol}
                                </td>
                                <td className="py-2 px-3 text-center font-mono">
                                  {trade.lotSize || '1.0'}
                                </td>
                                <td className={`py-2 px-3 text-right font-mono font-bold ${
                                  pVal > 0 ? 'text-emerald-400' : pVal < 0 ? 'text-rose-400' : 'text-slate-400'
                                }`}>
                                  {pVal > 0 ? '+' : ''}{pVal.toFixed(2)}
                                </td>
                                <td className="py-2 px-3 text-center">
                                  <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md ${
                                    trade.closeStatus === 'TP Hit'
                                      ? 'bg-emerald-950 text-emerald-400 border border-emerald-900/50'
                                      : trade.closeStatus === 'SL Hit'
                                      ? 'bg-rose-950 text-rose-400 border border-rose-900/50'
                                      : trade.closeStatus === 'Breakeven'
                                      ? 'bg-slate-800 text-slate-300 border border-slate-700/50'
                                      : 'bg-blue-950 text-blue-400 border border-blue-900/50'
                                  }`}>
                                    {trade.closeStatus}
                                  </span>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ) : (
                  <div className="p-6 text-center border border-dashed border-slate-800 rounded-xl bg-slate-950/20">
                    <p className="text-xs text-slate-500 font-medium">No trades logged on this date.</p>
                  </div>
                )}
              </div>

              {/* Day Observations / Notes */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-amber-400" />
                  Day Reflections & Key Observations
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  
                  {/* Market Structure & Notes */}
                  <div className="p-3.5 rounded-xl border border-slate-800 bg-slate-950/20 space-y-1">
                    <span className="text-[10px] font-bold uppercase text-blue-400 tracking-wider block">Market Movement</span>
                    <p className="text-xs text-slate-300 leading-relaxed min-h-[36px]">
                      {popupJournal.observations?.marketMovement || <span className="text-slate-500 italic">No notes captured</span>}
                    </p>
                  </div>

                  {/* Discipline / Mistakes Checks */}
                  <div className="p-3.5 rounded-xl border border-slate-800 bg-slate-950/20 space-y-1">
                    <span className="text-[10px] font-bold uppercase text-rose-400 tracking-wider block">Discipline Checks</span>
                    <p className="text-xs text-slate-300 leading-relaxed min-h-[36px]">
                      {popupJournal.observations?.mistakes || <span className="text-slate-500 italic">No mistakes or discipline checks logged</span>}
                    </p>
                  </div>

                  {/* Risk/Reward */}
                  <div className="p-3.5 rounded-xl border border-slate-800 bg-slate-950/20 space-y-1">
                    <span className="text-[10px] font-bold uppercase text-emerald-400 tracking-wider block">Risk Management</span>
                    <p className="text-xs text-slate-300 leading-relaxed min-h-[36px]">
                      {popupJournal.observations?.riskReward || <span className="text-slate-500 italic">No risk evaluations recorded</span>}
                    </p>
                  </div>

                  {/* General Notes */}
                  <div className="p-3.5 rounded-xl border border-slate-800 bg-slate-950/20 space-y-1">
                    <span className="text-[10px] font-bold uppercase text-amber-400 tracking-wider block">Key Takeaways</span>
                    <p className="text-xs text-slate-300 leading-relaxed min-h-[36px]">
                      {popupJournal.observations?.notes || <span className="text-slate-500 italic">No core takeaways recorded</span>}
                    </p>
                  </div>

                </div>
              </div>

            </div>

            {/* Footer buttons */}
            <div className="p-4 border-t border-slate-800 bg-slate-900/50 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setPopupJournalDate(null)}
                className="px-4 py-2 text-xs font-bold text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-xl transition cursor-pointer"
              >
                Close Summary
              </button>
              <button
                type="button"
                onClick={() => {
                  setPopupJournalDate(null);
                }}
                className="px-4.5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 rounded-xl shadow-md transition cursor-pointer"
              >
                Edit & Log More Trades
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};
