import React, { useState } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  X
} from 'lucide-react';
import { DailyJournal } from '../types';
import { MONTH_NAMES, formatCurrency, getDaysInMonth } from '../utils/helpers';

interface TradingCalendarProps {
  journalEntries?: Record<string, DailyJournal>;
  journals?: Record<string, DailyJournal>;
  selectedDate: string;
  onSelectDate: (dateStr: string) => void;
}

export const TradingCalendar: React.FC<TradingCalendarProps> = ({
  journalEntries,
  journals,
  selectedDate,
  onSelectDate
}) => {
  const entries = journalEntries || journals || {};
  const today = new Date();
  const currentYear = today.getFullYear();
  const currentMonth = today.getMonth();

  const [calYear, setCalYear] = useState<number>(currentYear);
  const [calMonth, setCalMonth] = useState<number>(currentMonth);

  const availableYears = [currentYear - 1, currentYear, currentYear + 1];

  const handlePrevMonth = () => {
    if (calMonth === 0) {
      setCalMonth(11);
      setCalYear(prev => prev - 1);
    } else {
      setCalMonth(prev => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (calMonth === 11) {
      setCalMonth(0);
      setCalYear(prev => prev + 1);
    } else {
      setCalMonth(prev => prev + 1);
    }
  };

  const handleResetToCurrent = () => {
    setCalYear(currentYear);
    setCalMonth(currentMonth);
  };

  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const getDayTradeStats = (dateKey: string) => {
    const entry = entries[dateKey];
    if (!entry || !entry.trades || entry.trades.length === 0) {
      return {
        tradeCount: 0,
        netPnL: 0,
        status: 'none',
        hasTrades: false
      };
    }

    const netPnL = entry.trades.reduce((acc, t) => acc + (Number(t.pnl) || 0), 0);
    let status: 'profit' | 'loss' | 'breakeven' = 'breakeven';

    if (netPnL > 0) status = 'profit';
    else if (netPnL < 0) status = 'loss';

    return {
      tradeCount: entry.trades.length,
      netPnL,
      status,
      hasTrades: true
    };
  };

  const totalDaysInMonth = getDaysInMonth(calYear, calMonth);
  const firstDayIndex = new Date(calYear, calMonth, 1).getDay();

  const formatDateKey = (year: number, month: number, day: number) => {
    const mStr = String(month + 1).padStart(2, '0');
    const dStr = String(day).padStart(2, '0');
    return `${year}-${mStr}-${dStr}`;
  };

  const prevMonthYear = calMonth === 0 ? calYear - 1 : calYear;
  const prevMonthIndex = calMonth === 0 ? 11 : calMonth - 1;
  const daysInPrevMonth = getDaysInMonth(prevMonthYear, prevMonthIndex);

  const prefixDays: { day: number; dateKey: string }[] = [];
  for (let i = firstDayIndex - 1; i >= 0; i--) {
    const d = daysInPrevMonth - i;
    prefixDays.push({
      day: d,
      dateKey: formatDateKey(prevMonthYear, prevMonthIndex, d)
    });
  }

  const currentMonthDays: { day: number; dateKey: string }[] = [];
  for (let d = 1; d <= totalDaysInMonth; d++) {
    currentMonthDays.push({
      day: d,
      dateKey: formatDateKey(calYear, calMonth, d)
    });
  }

  const nextMonthYear = calMonth === 11 ? calYear + 1 : calYear;
  const nextMonthIndex = calMonth === 11 ? 0 : calMonth + 1;
  const totalGridCells = prefixDays.length + currentMonthDays.length;
  const suffixCount = totalGridCells % 7 === 0 ? 0 : 7 - (totalGridCells % 7);

  const suffixDays: { day: number; dateKey: string }[] = [];
  for (let d = 1; d <= suffixCount; d++) {
    suffixDays.push({
      day: d,
      dateKey: formatDateKey(nextMonthYear, nextMonthIndex, d)
    });
  }

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xs p-5 sm:p-7 text-slate-100 transition-colors">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-100 tracking-tight">
            Calendar
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            See at one glance how many days you are making or losing money. Click a day to look at the trades.
          </p>
        </div>

        {/* Year Selector Tabs */}
        <div className="inline-flex items-center rounded-lg border border-slate-700 bg-slate-800 p-0.5 shadow-2xs self-start">
          {availableYears.map(year => (
            <button
              key={year}
              onClick={() => setCalYear(year)}
              className={`px-3 py-1 text-xs font-medium rounded-md transition cursor-pointer ${
                calYear === year
                  ? 'bg-slate-700 text-white font-semibold shadow-2xs'
                  : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              {year}
            </button>
          ))}
        </div>
      </div>

      {/* Month Navigator Header */}
      <div className="flex items-center justify-center gap-3 mb-6">
        <button
          onClick={handlePrevMonth}
          title="Previous Month"
          className="p-1 text-slate-300 hover:text-white hover:bg-slate-800 rounded-full transition cursor-pointer"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        <span className="text-base sm:text-lg font-bold text-slate-100 min-w-[120px] text-center">
          {MONTH_NAMES[calMonth]}
        </span>

        {/* Reset / Clear Month Button */}
        {(calMonth !== currentMonth || calYear !== currentYear) && (
          <button
            onClick={handleResetToCurrent}
            title="Reset to Current Month"
            className="p-1 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-full transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        )}

        <button
          onClick={handleNextMonth}
          title="Next Month"
          className="p-1 text-slate-300 hover:text-white hover:bg-slate-800 rounded-full transition cursor-pointer"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Days of the Week */}
      <div className="grid grid-cols-7 gap-2 sm:gap-3 mb-2 text-center text-xs font-semibold text-slate-300">
        {daysOfWeek.map((dayName) => (
          <div key={dayName} className="py-1">
            {dayName}
          </div>
        ))}
      </div>

      {/* Main Calendar Grid */}
      <div className="grid grid-cols-7 gap-2 sm:gap-3">
        {/* 1. Previous Month Prefix Days */}
        {prefixDays.map(({ day, dateKey }) => {
          const stats = getDayTradeStats(dateKey);
          const isSelected = selectedDate === dateKey;

          return (
            <button
              type="button"
              key={`prev-${dateKey}`}
              onClick={() => {
                onSelectDate(dateKey);
                if (calMonth === 0) {
                  setCalYear(prev => prev - 1);
                  setCalMonth(11);
                } else {
                  setCalMonth(prev => prev - 1);
                }
              }}
              className={`min-h-[70px] sm:min-h-[90px] border border-slate-800 rounded-xl p-1.5 sm:p-2 text-left flex flex-col justify-between transition-all bg-slate-900/40 hover:bg-slate-800/60 opacity-40 cursor-pointer overflow-hidden ${
                isSelected ? 'ring-2 ring-emerald-500 shadow-xs' : ''
              }`}
            >
              <div className="flex items-center justify-between w-full leading-none">
                <span className="text-xs sm:text-sm font-bold font-mono text-slate-500">
                  {day}
                </span>
              </div>
              {stats.hasTrades ? (
                <div className="w-full my-auto pt-1 text-center overflow-hidden">
                  <div className="text-[9px] sm:text-xs font-mono font-extrabold tracking-tight truncate text-slate-400">
                    {formatCurrency(stats.netPnL)}
                  </div>
                  <div className="text-[8px] sm:text-[10px] font-medium leading-none mt-0.5 truncate text-slate-500">
                    {stats.tradeCount} {stats.tradeCount === 1 ? 'trade' : 'trades'}
                  </div>
                </div>
              ) : null}
            </button>
          );
        })}

        {/* 2. Current Month Days */}
        {currentMonthDays.map(({ day, dateKey }) => {
          const stats = getDayTradeStats(dateKey);
          const isSelected = selectedDate === dateKey;

          let cardBg = 'bg-slate-900 border border-slate-800 hover:border-slate-700';
          let dayNumColor = 'text-slate-300';
          let amountColor = 'text-slate-100';
          let tradesLabelColor = 'text-slate-400';

          if (stats.status === 'profit') {
            cardBg = 'bg-emerald-600 text-white border-transparent hover:bg-emerald-500 shadow-xs';
            dayNumColor = 'text-white font-extrabold';
            amountColor = 'text-white';
            tradesLabelColor = 'text-white/90';
          } else if (stats.status === 'loss') {
            cardBg = 'bg-rose-600 text-white border-transparent hover:bg-rose-500 shadow-xs';
            dayNumColor = 'text-white font-extrabold';
            amountColor = 'text-white';
            tradesLabelColor = 'text-white/90';
          } else if (stats.status === 'breakeven') {
            cardBg = 'bg-slate-700 text-white border-transparent hover:bg-slate-600';
            dayNumColor = 'text-white font-extrabold';
            amountColor = 'text-white font-semibold';
            tradesLabelColor = 'text-white/90';
          } else {
            cardBg = 'bg-slate-900/90 border border-slate-800 hover:bg-slate-800/80';
            dayNumColor = 'text-slate-300';
            amountColor = 'text-slate-200';
            tradesLabelColor = 'text-slate-400';
          }

          return (
            <button
              type="button"
              key={dateKey}
              onClick={() => onSelectDate(dateKey)}
              className={`min-h-[70px] sm:min-h-[90px] rounded-xl p-1.5 sm:p-2 text-left flex flex-col justify-between transition-all cursor-pointer relative overflow-hidden ${cardBg} ${
                isSelected ? 'ring-2 ring-emerald-400 ring-offset-2 ring-offset-slate-950 z-10 shadow-md' : ''
              }`}
            >
              {/* Top Row: Day Number */}
              <div className="flex items-center justify-between w-full leading-none">
                <span className={`text-xs sm:text-sm font-bold font-mono ${dayNumColor}`}>
                  {day}
                </span>
              </div>

              {/* Center Content: Only shown when trades exist */}
              {stats.hasTrades ? (
                <div className="w-full my-auto pt-1 text-center overflow-hidden">
                  <div className={`text-[9px] sm:text-xs font-mono font-extrabold tracking-tight truncate ${amountColor}`}>
                    {formatCurrency(stats.netPnL)}
                  </div>
                  <div className={`text-[8px] sm:text-[10px] font-medium leading-none mt-0.5 truncate ${tradesLabelColor}`}>
                    {stats.tradeCount} {stats.tradeCount === 1 ? 'trade' : 'trades'}
                  </div>
                </div>
              ) : null}
            </button>
          );
        })}

        {/* 3. Next Month Trailing Days */}
        {suffixDays.map(({ day, dateKey }) => {
          const stats = getDayTradeStats(dateKey);
          const isSelected = selectedDate === dateKey;

          return (
            <button
              type="button"
              key={`next-${dateKey}`}
              onClick={() => {
                onSelectDate(dateKey);
                if (calMonth === 11) {
                  setCalYear(prev => prev + 1);
                  setCalMonth(0);
                } else {
                  setCalMonth(prev => prev + 1);
                }
              }}
              className={`min-h-[70px] sm:min-h-[90px] border border-slate-800 rounded-xl p-1.5 sm:p-2 text-left flex flex-col justify-between transition-all bg-slate-900/40 hover:bg-slate-800/60 opacity-40 cursor-pointer overflow-hidden ${
                isSelected ? 'ring-2 ring-emerald-500 shadow-xs' : ''
              }`}
            >
              <div className="flex items-center justify-between w-full leading-none">
                <span className="text-xs sm:text-sm font-bold font-mono text-slate-500">
                  {day}
                </span>
              </div>
              {stats.hasTrades ? (
                <div className="w-full my-auto pt-1 text-center overflow-hidden">
                  <div className="text-[9px] sm:text-xs font-mono font-extrabold tracking-tight truncate text-slate-400">
                    {formatCurrency(stats.netPnL)}
                  </div>
                  <div className="text-[8px] sm:text-[10px] font-medium leading-none mt-0.5 truncate text-slate-500">
                    {stats.tradeCount} {stats.tradeCount === 1 ? 'trade' : 'trades'}
                  </div>
                </div>
              ) : null}
            </button>
          );
        })}
      </div>
    </div>
  );
};
