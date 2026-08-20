import React from 'react';
import { DailyHabit } from '../types';
import { getHabitProgressPercent, getHabitDoneCount } from '../utils/helpers';
import { TrendingUp, Target, Award } from 'lucide-react';

interface GaugesSummaryProps {
  dailyHabits: DailyHabit[];
  overallPercent: number;
  totalDailyDone: number;
  totalDailyTarget: number;
  onSelectHabit?: (habitId: string) => void;
}

export const GaugesSummary: React.FC<GaugesSummaryProps> = ({
  dailyHabits,
  overallPercent,
  totalDailyDone,
  totalDailyTarget,
  onSelectHabit
}) => {
  // SVG Circular Gauge Helper
  const renderCircularGauge = (
    percent: number,
    size: number = 72,
    strokeWidth: number = 6,
    colorClass: string = 'text-blue-400',
    bgColorClass: string = 'text-slate-800'
  ) => {
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const validPercent = Math.min(Math.max(percent, 0), 100);
    const strokeDashoffset = circumference - (validPercent / 100) * circumference;

    return (
      <svg width={size} height={size} className="transform -rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className={bgColorClass}
          fill="transparent"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className={`${colorClass} transition-all duration-700 ease-out`}
          fill="transparent"
        />
      </svg>
    );
  };

  const getGaugeColor = (pct: number) => {
    if (pct >= 80) return 'text-emerald-500';
    if (pct >= 50) return 'text-blue-400';
    if (pct >= 25) return 'text-sky-400';
    if (pct > 0) return 'text-amber-500';
    return 'text-slate-600';
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 my-4 text-slate-100 transition-colors">
      {/* OVERALL HABIT PROGRESS CARD (Left Box) */}
      <div className="lg:col-span-3 bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between shadow-xs relative overflow-hidden group">
        <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-3">
          <div className="flex items-center gap-2">
            <Award className="w-4 h-4 text-blue-400" />
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-300">
              Overall Progress
            </h3>
          </div>
          <span className="text-[10px] font-medium text-slate-400 bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
            Monthly
          </span>
        </div>

        <div className="flex items-center justify-center gap-5 my-2">
          {/* Main Large Donut */}
          <div className="relative flex items-center justify-center">
            {renderCircularGauge(overallPercent, 104, 8, 'text-blue-400', 'text-slate-800')}
            <div className="absolute flex flex-col items-center justify-center text-center">
              <span className="text-2xl font-light font-mono text-slate-100 tracking-tight">
                {overallPercent.toFixed(1)}%
              </span>
              <span className="text-[9px] uppercase font-semibold text-slate-500 tracking-wider">
                Execution
              </span>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <div className="bg-slate-800/80 p-2.5 rounded-xl border border-slate-700/60">
              <div className="text-[10px] uppercase font-semibold text-slate-500">Total Done</div>
              <div className="text-sm font-semibold font-mono text-emerald-400">
                {totalDailyDone} <span className="text-xs font-normal text-slate-500">checks</span>
              </div>
            </div>
            <div className="bg-slate-800/80 p-2.5 rounded-xl border border-slate-700/60">
              <div className="text-[10px] uppercase font-semibold text-slate-500">Target</div>
              <div className="text-sm font-semibold font-mono text-blue-400">
                {totalDailyTarget} <span className="text-xs font-normal text-slate-500">goals</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-2 pt-2 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <span className="flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5 text-blue-400" />
            Consistency Rate
          </span>
          <span className="font-mono font-medium text-slate-300">
            {totalDailyDone} / {totalDailyTarget}
          </span>
        </div>
      </div>

      {/* DAILY HABITS CIRCULAR MINI-GAUGES (Right Box) */}
      <div className="lg:col-span-9 bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xs flex flex-col justify-between">
        <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-3">
          <div className="flex items-center gap-2">
            <Target className="w-4 h-4 text-blue-400" />
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-300">
              Daily Habits Individual Progress
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-blue-300 bg-blue-950 px-2.5 py-0.5 rounded-full border border-blue-900">
              {dailyHabits.length} Habits Tracked
            </span>
          </div>
        </div>

        {/* Mini Gauge Badges */}
        <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-5 lg:grid-cols-8 xl:grid-cols-8 gap-2.5 overflow-x-auto pb-1">
          {dailyHabits.map((habit) => {
            const pct = getHabitProgressPercent(habit);
            const done = getHabitDoneCount(habit);
            const color = getGaugeColor(pct);

            return (
              <button
                key={habit.id}
                onClick={() => onSelectHabit?.(habit.id)}
                title={`${habit.name}: ${done}/${habit.goal} days completed (${pct}%)`}
                className="flex flex-col items-center justify-between p-2 rounded-xl bg-slate-800/60 border border-slate-700/60 hover:border-blue-600 hover:bg-blue-950/40 transition group cursor-pointer text-center min-w-[84px]"
              >
                {/* Mini Circle */}
                <div className="relative my-0.5 flex items-center justify-center">
                  {renderCircularGauge(pct, 44, 4, color, 'text-slate-800')}
                  <span className={`absolute text-[11px] font-semibold font-mono ${pct > 0 ? 'text-slate-100' : 'text-slate-500'}`}>
                    {pct}%
                  </span>
                </div>

                <div className="w-full text-center mt-1">
                  <span className="block text-[11px] font-medium text-slate-200 truncate max-w-[80px] mx-auto group-hover:text-blue-400 transition" title={habit.name}>
                    {habit.name}
                  </span>
                  <span className="block text-[10px] text-slate-500 font-mono">
                    {done}/{habit.goal}d
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        <div className="mt-3 pt-2 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-500">
          <span>Click any gauge to focus Matrix row</span>
          <span className="font-mono text-blue-400 font-medium">
            Daily Habits Execution
          </span>
        </div>
      </div>
    </div>
  );
};
