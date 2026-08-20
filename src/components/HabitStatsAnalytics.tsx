import React, { useState, useMemo } from 'react';
import { DailyHabit, WeeklyHabit } from '../types';
import { 
  getHabitDoneCount, 
  getHabitProgressPercent, 
  getDaysInMonth, 
  MONTH_NAMES 
} from '../utils/helpers';
import { getTagStyle } from '../utils/tagColors';
import { 
  Flame, 
  Award, 
  TrendingUp, 
  AlertCircle, 
  BarChart3, 
  Filter, 
  Layers,
  CalendarCheck
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
  Cell
} from 'recharts';

interface HabitStatsAnalyticsProps {
  dailyHabits: DailyHabit[];
  weeklyHabits: WeeklyHabit[];
  year: number;
  month: number;
  dailyNotes?: { [day: number]: string };
}

export const HabitStatsAnalytics: React.FC<HabitStatsAnalyticsProps> = ({
  dailyHabits,
  weeklyHabits,
  year,
  month,
  dailyNotes = {},
}) => {
  const daysInMonth = getDaysInMonth(year, month);
  const daysArray = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const [selectedChartCategory, setSelectedChartCategory] = useState<string | 'all'>('all');
  const [chartViewTab, setChartViewTab] = useState<'daily' | 'weekly' | 'categories' | 'velocity'>('daily');

  // Filtered habits based on category selection for the charts
  const activeDailyHabits = useMemo(() => {
    if (selectedChartCategory === 'all') return dailyHabits;
    return dailyHabits.filter(h => (h.category?.trim() || 'General').toLowerCase() === selectedChartCategory.toLowerCase());
  }, [dailyHabits, selectedChartCategory]);

  const activeWeeklyHabits = useMemo(() => {
    if (selectedChartCategory === 'all') return weeklyHabits;
    return weeklyHabits.filter(h => (h.category?.trim() || 'General').toLowerCase() === selectedChartCategory.toLowerCase());
  }, [weeklyHabits, selectedChartCategory]);

  // Distinct categories from all habits
  const allCategories = useMemo(() => {
    const cats = new Set<string>();
    dailyHabits.forEach(h => cats.add(h.category?.trim() || 'General'));
    weeklyHabits.forEach(h => cats.add(h.category?.trim() || 'General'));
    return Array.from(cats);
  }, [dailyHabits, weeklyHabits]);

  // 1. Daily Chart Data (Days 1..31 completion %)
  const dailyChartData = useMemo(() => {
    const totalHabits = activeDailyHabits.length;
    let cumulativeDone = 0;

    return daysArray.map((day, index) => {
      const date = new Date(year, month, day);
      const dayName = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][date.getDay()];
      const completedToday = activeDailyHabits.reduce((acc, h) => acc + (h.days[day] ? 1 : 0), 0);
      const completionPercent = totalHabits > 0 ? Math.round((completedToday / totalHabits) * 100) : 0;
      cumulativeDone += completedToday;

      // 7-day rolling average
      const startIdx = Math.max(0, index - 6);
      let rollingSum = 0;
      let rollingCount = 0;
      for (let i = startIdx; i <= index; i++) {
        const d = i + 1;
        const count = activeDailyHabits.reduce((acc, h) => acc + (h.days[d] ? 1 : 0), 0);
        rollingSum += totalHabits > 0 ? (count / totalHabits) * 100 : 0;
        rollingCount++;
      }
      const rollingAvg = rollingCount > 0 ? Math.round(rollingSum / rollingCount) : 0;

      // Target velocity benchmark line
      const targetVelocity = totalHabits > 0 ? Math.round((day / daysInMonth) * (totalHabits * 15)) : 0;

      return {
        day: `D${day}`,
        dayNum: day,
        dayName,
        completed: completedToday,
        total: totalHabits,
        percent: completionPercent,
        rollingAvg,
        cumulativeDone,
        targetVelocity,
        note: dailyNotes[day] || ''
      };
    });
  }, [daysArray, activeDailyHabits, year, month, daysInMonth, dailyNotes]);

  // 2. Weekly Chart Data (Weeks 1..5)
  const weeklyChartData = useMemo(() => {
    const weeks = [1, 2, 3, 4, 5];
    return weeks.map(w => {
      const totalWeekly = activeWeeklyHabits.length;
      const completedThisWeek = activeWeeklyHabits.reduce((acc, h) => acc + (h.weeks[w] ? 1 : 0), 0);
      const percent = totalWeekly > 0 ? Math.round((completedThisWeek / totalWeekly) * 100) : 0;

      // Daily habits checked in this week (days in this week approx)
      const weekStartDay = (w - 1) * 7 + 1;
      const weekEndDay = Math.min(daysInMonth, w * 7);
      let dailyChecksInWeek = 0;
      let totalPossibleDailyInWeek = 0;

      for (let d = weekStartDay; d <= weekEndDay; d++) {
        dailyChecksInWeek += dailyHabits.reduce((acc, h) => acc + (h.days[d] ? 1 : 0), 0);
        totalPossibleDailyInWeek += dailyHabits.length;
      }

      const dailyWeekPercent = totalPossibleDailyInWeek > 0 ? Math.round((dailyChecksInWeek / totalPossibleDailyInWeek) * 100) : 0;

      return {
        week: `Week ${w}`,
        weekNum: w,
        weeklyDone: completedThisWeek,
        weeklyTotal: totalWeekly,
        weeklyPercent: percent,
        dailyWeekPercent,
        totalChecksInWeek: dailyChecksInWeek
      };
    });
  }, [activeWeeklyHabits, dailyHabits, daysInMonth]);

  // 3. Category Breakdown Data
  const categoryBreakdownData = useMemo(() => {
    return allCategories.map(category => {
      const catDaily = dailyHabits.filter(h => (h.category?.trim() || 'General').toLowerCase() === category.toLowerCase());
      const catWeekly = weeklyHabits.filter(h => (h.category?.trim() || 'General').toLowerCase() === category.toLowerCase());

      let doneCount = 0;
      let goalCount = 0;

      catDaily.forEach(h => {
        doneCount += getHabitDoneCount(h);
        goalCount += h.goal;
      });

      catWeekly.forEach(h => {
        const weeklyDone = [1, 2, 3, 4, 5].reduce((acc, w) => acc + (h.weeks[w] ? 1 : 0), 0);
        doneCount += weeklyDone;
        goalCount += h.target;
      });

      const percent = goalCount > 0 ? Math.round((doneCount / goalCount) * 100) : 0;
      const tagStyle = getTagStyle(category);

      return {
        category,
        doneCount,
        goalCount,
        percent,
        dailyCount: catDaily.length,
        weeklyCount: catWeekly.length,
        tagStyle
      };
    }).sort((a, b) => b.percent - a.percent);
  }, [allCategories, dailyHabits, weeklyHabits]);

  // Overall calculations for summary KPI cards
  const totalDailyTarget = useMemo(() => dailyHabits.reduce((acc, h) => acc + h.goal, 0), [dailyHabits]);
  const totalDailyDone = useMemo(() => dailyHabits.reduce((acc, h) => acc + getHabitDoneCount(h), 0), [dailyHabits]);
  const overallDailyPercent = totalDailyTarget > 0 ? Math.round((totalDailyDone / totalDailyTarget) * 100) : 0;

  const totalWeeklyTarget = useMemo(() => weeklyHabits.reduce((acc, h) => acc + h.target, 0), [weeklyHabits]);
  const totalWeeklyDone = useMemo(() => weeklyHabits.reduce((acc, h) => {
    const done = [1, 2, 3, 4, 5].reduce((wAcc, w) => wAcc + (h.weeks[w] ? 1 : 0), 0);
    return acc + done;
  }, 0), [weeklyHabits]);
  const overallWeeklyPercent = totalWeeklyTarget > 0 ? Math.round((totalWeeklyDone / totalWeeklyTarget) * 100) : 0;

  // Streak calculation
  const { currentStreak, maxStreak } = useMemo(() => {
    let curr = 0;
    let maxS = 0;

    for (let d = 1; d <= daysInMonth; d++) {
      const anyDone = dailyHabits.some(h => h.days[d]);
      if (anyDone) {
        curr++;
        if (curr > maxS) maxS = curr;
      } else {
        curr = 0;
      }
    }
    return { currentStreak: curr, maxStreak: maxS };
  }, [dailyHabits, daysInMonth]);

  // Overall Discipline Score (0..100)
  const disciplineScore = useMemo(() => {
    const dailyWeight = overallDailyPercent * 0.6;
    const weeklyWeight = overallWeeklyPercent * 0.3;
    const streakBonus = Math.min(10, currentStreak * 0.5);
    return Math.round(dailyWeight + weeklyWeight + streakBonus);
  }, [overallDailyPercent, overallWeeklyPercent, currentStreak]);

  // Top performing & needing focus habits
  const topHabits = useMemo(() => {
    return [...dailyHabits]
      .sort((a, b) => getHabitProgressPercent(b) - getHabitProgressPercent(a))
      .slice(0, 4);
  }, [dailyHabits]);

  const bottomHabits = useMemo(() => {
    return [...dailyHabits]
      .sort((a, b) => getHabitProgressPercent(a) - getHabitProgressPercent(b))
      .slice(0, 4);
  }, [dailyHabits]);

  // Heatmap day of week calculation
  const dayOfWeekCounts: { [key: string]: { total: number; count: number } } = {
    Sun: { total: 0, count: 0 },
    Mon: { total: 0, count: 0 },
    Tue: { total: 0, count: 0 },
    Wed: { total: 0, count: 0 },
    Thu: { total: 0, count: 0 },
    Fri: { total: 0, count: 0 },
    Sat: { total: 0, count: 0 }
  };

  const dayOfWeekMap = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  daysArray.forEach(d => {
    const date = new Date(year, month, d);
    const dayName = dayOfWeekMap[date.getDay()];
    const checksOnThisDay = dailyHabits.reduce((acc, h) => acc + (h.days[d] ? 1 : 0), 0);
    if (dayOfWeekCounts[dayName]) {
      dayOfWeekCounts[dayName].total += checksOnThisDay;
      dayOfWeekCounts[dayName].count += 1;
    }
  });

  return (
    <div className="space-y-6 pb-8 text-slate-100">
      {/* Top Level Summary Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Overall Daily Completion % */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-sm flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-blue-950/80 text-blue-400 border border-blue-800/50">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[10px] uppercase font-semibold tracking-wider text-slate-400">Daily Target Pace</div>
              <div className="text-2xl font-light font-mono text-slate-100 flex items-baseline gap-1">
                {overallDailyPercent}% <span className="text-xs font-normal text-slate-400">({totalDailyDone}/{totalDailyTarget})</span>
              </div>
            </div>
          </div>
          <div className="w-10 h-10 rounded-full border-2 border-blue-500 flex items-center justify-center text-[10px] font-mono font-bold text-blue-400 bg-blue-950/50">
            {overallDailyPercent}%
          </div>
        </div>

        {/* Metric 2: Current & Longest Streak */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-sm flex items-center gap-3.5">
          <div className="p-3 rounded-xl bg-amber-950/80 text-amber-400 border border-amber-800/50">
            <Flame className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[10px] uppercase font-semibold tracking-wider text-slate-400">Active Streak</div>
            <div className="text-2xl font-light font-mono text-slate-100 flex items-baseline gap-1">
              {currentStreak} <span className="text-xs font-medium text-amber-400">days (Best: {maxStreak}d)</span>
            </div>
          </div>
        </div>

        {/* Metric 3: Weekly Habits Goal % */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-sm flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-emerald-950/80 text-emerald-400 border border-emerald-800/50">
              <CalendarCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[10px] uppercase font-semibold tracking-wider text-slate-400">Weekly Habits Pace</div>
              <div className="text-2xl font-light font-mono text-slate-100 flex items-baseline gap-1">
                {overallWeeklyPercent}% <span className="text-xs font-normal text-slate-400">({totalWeeklyDone}/{totalWeeklyTarget}w)</span>
              </div>
            </div>
          </div>
          <div className="w-10 h-10 rounded-full border-2 border-emerald-500 flex items-center justify-center text-[10px] font-mono font-bold text-emerald-400 bg-emerald-950/50">
            {overallWeeklyPercent}%
          </div>
        </div>

        {/* Metric 4: Discipline Index Score */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-sm flex items-center gap-3.5">
          <div className="p-3 rounded-xl bg-indigo-950/80 text-indigo-400 border border-indigo-800/50">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[10px] uppercase font-semibold tracking-wider text-slate-400">Discipline Index</div>
            <div className="text-2xl font-light font-mono text-indigo-400 flex items-baseline gap-1">
              {disciplineScore} <span className="text-xs font-normal text-slate-400">/ 100 max</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Interactive Progress Charts Container */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm">
        {/* Chart Header Controls */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-800 pb-4 mb-5">
          <div>
            <div className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-blue-400" />
              <h3 className="text-base font-semibold text-slate-100">
                Visual Progress & Productivity Trends
              </h3>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Tracking completion trajectory, daily consistency, and category productivity in {MONTH_NAMES[month]} {year}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Category Filter for Charts */}
            <div className="flex items-center gap-1 bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1 text-xs text-slate-300">
              <Filter className="w-3 h-3 text-slate-400" />
              <span className="text-[11px] font-medium text-slate-400">Tag:</span>
              <select
                value={selectedChartCategory}
                onChange={(e) => setSelectedChartCategory(e.target.value)}
                className="bg-slate-950 text-xs font-medium text-slate-200 focus:outline-none cursor-pointer"
              >
                <option value="all">All Tags ({dailyHabits.length + weeklyHabits.length})</option>
                {allCategories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            {/* Chart Sub-Tab Switcher */}
            <div className="flex items-center bg-slate-950 p-1 rounded-xl gap-1 border border-slate-800">
              <button
                onClick={() => setChartViewTab('daily')}
                className={`px-3 py-1 text-xs font-medium rounded-lg transition ${
                  chartViewTab === 'daily'
                    ? 'bg-slate-800 text-blue-400 font-semibold border border-slate-700'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Daily Trajectory
              </button>
              <button
                onClick={() => setChartViewTab('weekly')}
                className={`px-3 py-1 text-xs font-medium rounded-lg transition ${
                  chartViewTab === 'weekly'
                    ? 'bg-slate-800 text-emerald-400 font-semibold border border-slate-700'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Weekly Comparison
              </button>
              <button
                onClick={() => setChartViewTab('categories')}
                className={`px-3 py-1 text-xs font-medium rounded-lg transition ${
                  chartViewTab === 'categories'
                    ? 'bg-slate-800 text-purple-400 font-semibold border border-slate-700'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Tag Breakdown
              </button>
              <button
                onClick={() => setChartViewTab('velocity')}
                className={`px-3 py-1 text-xs font-medium rounded-lg transition ${
                  chartViewTab === 'velocity'
                    ? 'bg-slate-800 text-indigo-400 font-semibold border border-slate-700'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Cumulative Velocity
              </button>
            </div>
          </div>
        </div>

        {/* CHART 1: DAILY COMPLETION PERCENTAGE AREA CHART */}
        {chartViewTab === 'daily' && (
          <div>
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={dailyChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="dailyColor" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.35}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                  <XAxis 
                    dataKey="day" 
                    tickLine={false} 
                    axisLine={{ stroke: '#334155' }}
                    tick={{ fontSize: 11, fill: '#94a3b8' }}
                  />
                  <YAxis 
                    domain={[0, 100]} 
                    tickLine={false} 
                    axisLine={{ stroke: '#334155' }}
                    tick={{ fontSize: 11, fill: '#94a3b8' }}
                    unit="%"
                  />
                  <Tooltip 
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div className="bg-slate-950 p-3 border border-slate-800 rounded-xl shadow-xl text-xs text-slate-200">
                            <div className="font-semibold text-slate-100 mb-1 flex items-center justify-between gap-4">
                              <span>Day {data.dayNum} ({data.dayName})</span>
                              <span className="font-mono text-blue-400">{data.percent}%</span>
                            </div>
                            <div className="text-slate-400">
                              Completed: <span className="font-semibold text-slate-200">{data.completed}</span> / {data.total} habits
                            </div>
                            <div className="text-slate-400">
                              7-Day Average: <span className="font-semibold text-indigo-400">{data.rollingAvg}%</span>
                            </div>
                            {data.note && (
                              <div className="mt-2 pt-1 border-t border-slate-800 text-amber-400 italic">
                                "{data.note}"
                              </div>
                            )}
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <ReferenceLine y={80} stroke="#10b981" strokeDasharray="3 3" label={{ value: '80% Target', fill: '#10b981', fontSize: 10, position: 'insideTopRight' }} />
                  <Area 
                    type="monotone" 
                    dataKey="percent" 
                    name="Daily Completion %" 
                    stroke="#3b82f6" 
                    strokeWidth={2} 
                    fillOpacity={1} 
                    fill="url(#dailyColor)" 
                  />
                  <Line 
                    type="monotone" 
                    dataKey="rollingAvg" 
                    name="7-Day Moving Avg" 
                    stroke="#818cf8" 
                    strokeWidth={2} 
                    strokeDasharray="4 4"
                    dot={false}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            <div className="mt-4 flex flex-wrap items-center justify-between gap-4 text-xs text-slate-400 pt-3 border-t border-slate-800">
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-0.5 bg-blue-500" /> Daily Completion Rate (%)
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-0.5 bg-indigo-400 border-b border-dashed" /> 7-Day Moving Average
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-0.5 bg-emerald-500" /> 80% Excellence Threshold
                </span>
              </div>
              <span className="text-[11px] font-mono text-slate-500">
                Data: {activeDailyHabits.length} habits tracked across {daysInMonth} days
              </span>
            </div>
          </div>
        )}

        {/* CHART 2: WEEKLY COMPARISON BAR CHART */}
        {chartViewTab === 'weekly' && (
          <div>
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weeklyChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                  <XAxis 
                    dataKey="week" 
                    tickLine={false} 
                    axisLine={{ stroke: '#334155' }}
                    tick={{ fontSize: 11, fill: '#94a3b8' }}
                  />
                  <YAxis 
                    domain={[0, 100]} 
                    tickLine={false} 
                    axisLine={{ stroke: '#334155' }}
                    tick={{ fontSize: 11, fill: '#94a3b8' }}
                    unit="%"
                  />
                  <Tooltip 
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div className="bg-slate-950 p-3 border border-slate-800 rounded-xl shadow-xl text-xs text-slate-200">
                            <div className="font-semibold text-slate-100 mb-1.5">{data.week}</div>
                            <div className="text-slate-400">
                              Weekly Habits Met: <strong className="text-emerald-400">{data.weeklyDone}</strong> / {data.weeklyTotal} ({data.weeklyPercent}%)
                            </div>
                            <div className="text-slate-400">
                              Daily Tasks in Week: <strong className="text-blue-400">{data.totalChecksInWeek}</strong> ({data.dailyWeekPercent}%)
                            </div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: 11, paddingTop: 8 }} />
                  <Bar dataKey="weeklyPercent" name="Weekly Habits %" fill="#10b981" radius={[6, 6, 0, 0]} barSize={28} />
                  <Bar dataKey="dailyWeekPercent" name="Daily Execution %" fill="#3b82f6" radius={[6, 6, 0, 0]} barSize={28} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
              <span>Compares week-over-week performance across all 5 calendar weeks</span>
              <span className="font-mono text-emerald-400 font-medium">
                Best Week: Week {weeklyChartData.reduce((prev, curr) => curr.weeklyPercent > prev.weeklyPercent ? curr : prev, weeklyChartData[0]).weekNum}
              </span>
            </div>
          </div>
        )}

        {/* CHART 3: CATEGORY / TAG BREAKDOWN BAR CHART */}
        {chartViewTab === 'categories' && (
          <div>
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart 
                  data={categoryBreakdownData} 
                  layout="vertical"
                  margin={{ top: 10, right: 20, left: 40, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" horizontal={false} />
                  <XAxis 
                    type="number" 
                    domain={[0, 100]} 
                    tickLine={false} 
                    axisLine={{ stroke: '#334155' }}
                    tick={{ fontSize: 11, fill: '#94a3b8' }}
                    unit="%"
                  />
                  <YAxis 
                    type="category" 
                    dataKey="category" 
                    tickLine={false} 
                    axisLine={{ stroke: '#334155' }}
                    tick={{ fontSize: 11, fill: '#cbd5e1' }}
                    width={110}
                  />
                  <Tooltip 
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div className="bg-slate-950 p-3 border border-slate-800 rounded-xl shadow-xl text-xs text-slate-200">
                            <div className="font-semibold text-slate-100 mb-1">{data.category}</div>
                            <div className="text-slate-400">Completion: <strong className="text-purple-400 font-mono">{data.percent}%</strong></div>
                            <div className="text-slate-400">Tasks in Tag: {data.dailyCount} daily + {data.weeklyCount} weekly</div>
                            <div className="text-slate-400">Checks Done: {data.doneCount} / {data.goalCount}</div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Bar dataKey="percent" name="Completion %" radius={[0, 6, 6, 0]}>
                    {categoryBreakdownData.map((entry, index) => {
                      const colors = ['#3b82f6', '#10b981', '#a855f7', '#f59e0b', '#ec4899', '#06b6d4', '#ef4444', '#818cf8'];
                      return <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />;
                    })}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-800 text-xs text-slate-400 flex items-center justify-between">
              <span>Shows completion rate for each category tag</span>
              <span className="font-mono text-purple-400 font-medium">{categoryBreakdownData.length} active tags</span>
            </div>
          </div>
        )}

        {/* CHART 4: CUMULATIVE VELOCITY LINE CHART */}
        {chartViewTab === 'velocity' && (
          <div>
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={dailyChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                  <XAxis 
                    dataKey="day" 
                    tickLine={false} 
                    axisLine={{ stroke: '#334155' }}
                    tick={{ fontSize: 11, fill: '#94a3b8' }}
                  />
                  <YAxis 
                    tickLine={false} 
                    axisLine={{ stroke: '#334155' }}
                    tick={{ fontSize: 11, fill: '#94a3b8' }}
                  />
                  <Tooltip 
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div className="bg-slate-950 p-3 border border-slate-800 rounded-xl shadow-xl text-xs text-slate-200">
                            <div className="font-semibold text-slate-100 mb-1">Day {data.dayNum} Cumulative</div>
                            <div className="text-slate-400">Total Checks Logged: <strong className="text-blue-400 font-mono">{data.cumulativeDone}</strong></div>
                            <div className="text-slate-400">Expected Pace: <strong className="text-slate-500 font-mono">{data.targetVelocity}</strong></div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: 11, paddingTop: 8 }} />
                  <Line type="monotone" dataKey="cumulativeDone" name="Actual Cumulative Checks" stroke="#3b82f6" strokeWidth={2.5} dot={{ r: 2 }} />
                  <Line type="monotone" dataKey="targetVelocity" name="Ideal Target Pace" stroke="#64748b" strokeWidth={2} strokeDasharray="4 4" dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-800 text-xs text-slate-400 flex items-center justify-between">
              <span>Cumulative monthly task executions vs ideal pace curve</span>
              <span className="font-mono text-blue-400 font-semibold">{dailyChartData[dailyChartData.length - 1]?.cumulativeDone || 0} checks logged this month</span>
            </div>
          </div>
        )}
      </div>

      {/* Category / Tag Performance Grid */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm">
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-purple-400" />
            <h3 className="text-sm font-semibold text-slate-100 uppercase tracking-wider">
              Category & Tag Productivity Overview
            </h3>
          </div>
          <span className="text-xs text-slate-400 font-mono">
            {categoryBreakdownData.length} categories
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {categoryBreakdownData.map((cat) => (
            <div
              key={cat.category}
              className="p-3.5 rounded-xl border border-slate-800 bg-slate-950/70 hover:bg-slate-950 hover:border-slate-700 transition-all shadow-sm flex flex-col justify-between"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-1.5">
                  <span className={`w-2 h-2 rounded-full ${cat.tagStyle.dot}`} />
                  <span className="font-medium text-xs text-slate-200">{cat.category}</span>
                </div>
                <span className={`text-xs font-mono font-semibold ${cat.percent >= 80 ? 'text-emerald-400' : cat.percent >= 50 ? 'text-blue-400' : 'text-slate-400'}`}>
                  {cat.percent}%
                </span>
              </div>

              <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden my-1.5">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    cat.percent >= 80 ? 'bg-emerald-500' : cat.percent >= 50 ? 'bg-blue-500' : 'bg-amber-500'
                  }`}
                  style={{ width: `${Math.min(100, cat.percent)}%` }}
                />
              </div>

              <div className="flex items-center justify-between text-[10px] text-slate-400 mt-1 font-mono">
                <span>{cat.dailyCount} daily, {cat.weeklyCount} weekly</span>
                <span>{cat.doneCount} / {cat.goalCount} done</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Grid: Top Consistency Habits vs Needing Focus */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Performing Habits */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-4 pb-2 border-b border-slate-800">
            <TrendingUp className="w-4 h-4 text-emerald-400" />
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-300">
              Highest Consistency Habits
            </h3>
          </div>

          <div className="space-y-3">
            {topHabits.map((habit, idx) => {
              const pct = getHabitProgressPercent(habit);
              const done = getHabitDoneCount(habit);
              const tagStyle = getTagStyle(habit.category);

              return (
                <div key={habit.id} className="bg-slate-950/80 p-3 rounded-xl border border-slate-800">
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-emerald-950 text-emerald-300 text-xs font-mono font-semibold flex items-center justify-center border border-emerald-800">
                        {idx + 1}
                      </span>
                      <span className="text-sm font-medium text-slate-100">{habit.name}</span>
                      {habit.category && (
                        <span className={`text-[9px] px-1.5 py-0.5 rounded border ${tagStyle.bg} ${tagStyle.text} ${tagStyle.border}`}>
                          {habit.category}
                        </span>
                      )}
                    </div>
                    <span className="text-xs font-mono font-semibold text-emerald-400">{pct}%</span>
                  </div>

                  <div className="flex items-center gap-3 text-xs text-slate-400">
                    <div className="flex-1 bg-slate-800 rounded-full h-1.5 overflow-hidden">
                      <div
                        className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                        style={{ width: `${Math.min(100, pct)}%` }}
                      />
                    </div>
                    <span className="font-mono text-[11px] text-slate-400">{done} / {habit.goal} days</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Habits Needing Focus */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-4 pb-2 border-b border-slate-800">
            <AlertCircle className="w-4 h-4 text-amber-400" />
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-300">
              Habits Needing Focus (Low Execution)
            </h3>
          </div>

          <div className="space-y-3">
            {bottomHabits.map((habit) => {
              const pct = getHabitProgressPercent(habit);
              const done = getHabitDoneCount(habit);
              const tagStyle = getTagStyle(habit.category);

              return (
                <div key={habit.id} className="bg-slate-950/80 p-3 rounded-xl border border-slate-800">
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-slate-100">{habit.name}</span>
                      {habit.category && (
                        <span className={`text-[9px] px-1.5 py-0.5 rounded border ${tagStyle.bg} ${tagStyle.text} ${tagStyle.border}`}>
                          {habit.category}
                        </span>
                      )}
                    </div>
                    <span className="text-xs font-mono font-semibold text-amber-400">{pct}%</span>
                  </div>

                  <div className="flex items-center gap-3 text-xs text-slate-400">
                    <div className="flex-1 bg-slate-800 rounded-full h-1.5 overflow-hidden">
                      <div
                        className="bg-amber-500 h-full rounded-full transition-all duration-500"
                        style={{ width: `${Math.min(100, pct)}%` }}
                      />
                    </div>
                    <span className="font-mono text-[11px] text-slate-400">{done} / {habit.goal} days (Remaining: {Math.max(0, habit.goal - done)})</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Day of Week Consistency Heatmap */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm">
        <div className="flex items-center gap-2 mb-4 pb-2 border-b border-slate-800">
          <BarChart3 className="w-4 h-4 text-blue-400" />
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-300">
            Day-of-Week Performance Distribution ({MONTH_NAMES[month]} {year})
          </h3>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
          {Object.entries(dayOfWeekCounts).map(([dayName, stat]) => {
            const avgPerDay = stat.count > 0 ? (stat.total / stat.count).toFixed(1) : '0';
            const intensity = Number(avgPerDay) / (dailyHabits.length || 1);

            return (
              <div
                key={dayName}
                className="bg-slate-950/80 p-3 rounded-xl border border-slate-800 flex flex-col items-center justify-between text-center"
              >
                <span className="text-xs font-semibold text-slate-400 uppercase">{dayName}</span>
                
                <div className="my-3 flex flex-col items-center">
                  <div className="text-lg font-light font-mono text-slate-100">
                    {stat.total}
                  </div>
                  <span className="text-[10px] text-slate-400">total checks</span>
                </div>

                <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                  <div
                    className="bg-blue-500 h-full rounded-full"
                    style={{ width: `${Math.min(100, intensity * 100)}%` }}
                  />
                </div>

                <span className="text-[10px] font-mono text-slate-400 mt-1.5">
                  Avg: {avgPerDay}/day
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
