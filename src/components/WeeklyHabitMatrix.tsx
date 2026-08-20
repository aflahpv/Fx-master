import React, { useState } from 'react';
import { WeeklyHabit } from '../types';
import { 
  getWeeklyDoneCount, 
  getWeeklyLeftCount, 
  getWeeklyProgressPercent, 
  triggerCelebration 
} from '../utils/helpers';
import { 
  Check, 
  Trash2, 
  Edit2, 
  Plus, 
  Target, 
  Sparkles,
  Tag
} from 'lucide-react';
import { getTagStyle } from '../utils/tagColors';

interface WeeklyHabitMatrixProps {
  weeklyHabits: WeeklyHabit[];
  onToggleWeek: (habitId: string, week: number) => void;
  onUpdateGoal: (habitId: string, newGoal: number) => void;
  onDeleteHabit: (habitId: string) => void;
  onEditHabit: (habit: WeeklyHabit) => void;
  onAddHabit: () => void;
}

export const WeeklyHabitMatrix: React.FC<WeeklyHabitMatrixProps> = ({
  weeklyHabits,
  onToggleWeek,
  onUpdateGoal,
  onDeleteHabit,
  onEditHabit,
  onAddHabit,
}) => {
  const weeksArray = [1, 2, 3, 4, 5];
  const [editingGoalId, setEditingGoalId] = useState<string | null>(null);
  const [tempGoal, setTempGoal] = useState<number>(4);

  const handleWeekClick = (habit: WeeklyHabit, week: number) => {
    const isCurrentlyChecked = !!habit.weeks[week];
    onToggleWeek(habit.id, week);

    if (!isCurrentlyChecked) {
      const currentDone = getWeeklyDoneCount(habit);
      if (currentDone + 1 === habit.goal) {
        triggerCelebration();
      }
    }
  };

  const startEditGoal = (habit: WeeklyHabit) => {
    setEditingGoalId(habit.id);
    setTempGoal(habit.goal);
  };

  const saveGoal = (habitId: string) => {
    onUpdateGoal(habitId, Math.max(1, tempGoal));
    setEditingGoalId(null);
  };

  // SVG Mini Circular Gauge Helper
  const renderCircularGauge = (percent: number, size: number = 44, strokeWidth: number = 4) => {
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const validPercent = Math.min(Math.max(percent, 0), 100);
    const strokeDashoffset = circumference - (validPercent / 100) * circumference;

    let colorClass = 'text-slate-600';
    if (validPercent >= 100) colorClass = 'text-emerald-500';
    else if (validPercent >= 50) colorClass = 'text-blue-400';
    else if (validPercent > 0) colorClass = 'text-amber-500';

    return (
      <svg width={size} height={size} className="transform -rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-slate-800"
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
          className={`${colorClass} transition-all duration-500`}
          fill="transparent"
        />
      </svg>
    );
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 mb-8 text-slate-100 transition-colors">
      {/* Left side: WEEKLY HABIT MATRIX TABLE */}
      <div className="xl:col-span-8 bg-slate-900 border border-slate-800 rounded-2xl shadow-sm overflow-hidden flex flex-col justify-between">
        <div>
          <div className="bg-slate-900 px-4 sm:px-6 py-4 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <h2 className="text-sm sm:text-base font-semibold text-slate-100 tracking-tight flex items-center gap-2">
                Weekly Trade Checklist Matrix <span className="text-xs font-mono font-normal text-slate-400">(Weeks 1 - 5)</span>
              </h2>
            </div>

            <button
              onClick={onAddHabit}
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-950 hover:bg-slate-800 text-slate-100 border border-slate-800 transition"
            >
              <Plus className="w-3.5 h-3.5 text-slate-300" />
              Add Weekly Habit
            </button>
          </div>

          <div className="overflow-x-auto matrix-table bg-slate-950">
            <table className="w-full text-left border-collapse min-w-[650px]">
              <thead>
                <tr className="bg-slate-800/90 text-slate-300 border-b border-slate-800 text-[10px] uppercase tracking-wider font-semibold">
                  <th className="py-3 px-4 min-w-[220px] sticky left-0 z-20 bg-slate-800 border-r border-slate-700">
                    Weekly Habit & Tag
                  </th>
                  <th className="py-3 px-3 w-[100px] text-center bg-slate-800 border-r border-slate-700">
                    Progress
                  </th>
                  <th className="py-3 px-2 w-[55px] text-center bg-slate-800 border-r border-slate-700">
                    Goal
                  </th>
                  {weeksArray.map((week) => (
                    <th key={week} className="py-3 px-2 w-[50px] text-center font-mono text-slate-300 bg-slate-800 border-r border-slate-700">
                      W{week}
                    </th>
                  ))}
                  <th className="py-3 px-2 w-[55px] text-center font-semibold text-emerald-400 bg-slate-800 border-l border-slate-700">
                    Done
                  </th>
                  <th className="py-3 px-2 w-[55px] text-center font-semibold text-blue-400 bg-slate-800 border-l border-slate-700">
                    Left
                  </th>
                  <th className="py-3 px-2 w-[60px] text-center no-print bg-slate-800">
                    Edit
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-800 text-xs">
                {weeklyHabits.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="py-8 text-center text-slate-500 bg-slate-900">
                      <Tag className="w-5 h-5 mx-auto mb-1 text-slate-600" />
                      No weekly habits added yet. Click "+ Add Weekly Habit" to create one.
                    </td>
                  </tr>
                ) : (
                  weeklyHabits.map((habit, idx) => {
                    const done = getWeeklyDoneCount(habit);
                    const left = getWeeklyLeftCount(habit);
                    const progress = getWeeklyProgressPercent(habit);
                    const isAchieved = done >= habit.goal;
                    const tagStyle = getTagStyle(habit.category);

                    return (
                      <tr
                        key={habit.id}
                        className="transition-colors hover:bg-slate-800/80 bg-slate-900"
                      >
                        <td className="py-2.5 px-4 sticky left-0 z-10 bg-slate-900 border-r border-slate-800">
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex flex-col gap-1 overflow-hidden">
                              <span className="font-medium text-slate-100 truncate text-[13px] hover:text-emerald-400 transition">
                                {habit.name}
                              </span>
                              {habit.category && (
                                <div
                                  className={`inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-md border w-fit ${tagStyle.bg} ${tagStyle.text} ${tagStyle.border}`}
                                >
                                  <span className={`w-1.5 h-1.5 rounded-full ${tagStyle.dot}`} />
                                  <span>{habit.category}</span>
                                </div>
                              )}
                            </div>
                            {isAchieved && (
                              <span className="flex-shrink-0 flex items-center gap-0.5 text-[9px] font-medium bg-emerald-950 text-emerald-300 border border-emerald-900 px-1.5 py-0.5 rounded-full">
                                <Sparkles className="w-2.5 h-2.5 text-emerald-400" /> Met
                              </span>
                            )}
                          </div>
                        </td>

                        <td className="py-2.5 px-2 text-center border-r border-slate-800">
                          <div className="flex flex-col items-center gap-1">
                            <span className={`font-mono text-[11px] font-semibold ${
                              progress >= 100 ? 'text-emerald-400' : progress >= 50 ? 'text-blue-400' : 'text-slate-400'
                            }`}>
                              {progress}%
                            </span>
                            <div className="w-14 bg-slate-800 rounded-full h-1.5 overflow-hidden">
                              <div
                                className={`h-full rounded-full transition-all duration-300 ${
                                  progress >= 100
                                    ? 'bg-emerald-500'
                                    : progress >= 50
                                    ? 'bg-blue-600'
                                    : progress > 0
                                    ? 'bg-amber-500'
                                    : 'bg-slate-700'
                                }`}
                                style={{ width: `${Math.min(100, progress)}%` }}
                              />
                            </div>
                          </div>
                        </td>

                        <td className="py-2.5 px-1 text-center font-mono text-slate-300 font-medium border-r border-slate-800">
                          {editingGoalId === habit.id ? (
                            <input
                              type="number"
                              min="1"
                              max="5"
                              value={tempGoal}
                              onChange={(e) => setTempGoal(Number(e.target.value))}
                              onBlur={() => saveGoal(habit.id)}
                              onKeyDown={(e) => e.key === 'Enter' && saveGoal(habit.id)}
                              autoFocus
                              className="w-10 bg-slate-800 text-emerald-400 font-semibold text-center border border-emerald-400 rounded-md py-0.5 text-xs focus:outline-none"
                            />
                          ) : (
                            <button
                              onClick={() => startEditGoal(habit)}
                              title="Click to edit target weeks"
                              className="hover:text-emerald-400 hover:underline px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-xs"
                            >
                              {habit.goal}
                            </button>
                          )}
                        </td>

                        {/* Weeks Checkboxes */}
                        {weeksArray.map((week) => {
                          const isChecked = !!habit.weeks[week];

                          return (
                            <td
                              key={week}
                              onClick={() => handleWeekClick(habit, week)}
                              className="py-2 px-1 text-center cursor-pointer select-none border-r border-slate-800 hover:bg-emerald-950/30 transition-colors"
                            >
                              <div className="flex items-center justify-center p-0.5">
                                <div
                                  className={`w-5 h-5 rounded-md flex items-center justify-center transition-all duration-150 ${
                                    isChecked
                                      ? 'bg-emerald-600 text-white shadow-xs scale-105 font-bold'
                                      : 'border border-slate-700 bg-slate-800 hover:border-emerald-400 text-transparent'
                                  }`}
                                >
                                  {isChecked && <Check className="w-3.5 h-3.5 stroke-[2.5]" />}
                                </div>
                              </div>
                            </td>
                          );
                        })}

                        <td className="py-2.5 px-2 text-center font-mono font-semibold text-emerald-400 border-l border-slate-800 text-xs">
                          {done}
                        </td>

                        <td className="py-2.5 px-2 text-center font-mono font-medium text-xs">
                          <span className={left === 0 ? 'text-emerald-400 font-semibold' : 'text-slate-500'}>
                            {left}
                          </span>
                        </td>

                        <td className="py-2.5 px-1 text-center no-print">
                          <div className="flex items-center justify-center gap-1">
                            <button
                              onClick={() => onEditHabit(habit)}
                              title="Edit Habit"
                              className="p-1 hover:text-emerald-400 text-slate-500 rounded-lg transition"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => onDeleteHabit(habit.id)}
                              title="Delete Habit"
                              className="p-1 hover:text-rose-400 text-slate-500 rounded-lg transition"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Right side: WEEKLY HABITS CIRCULAR MINI GAUGES */}
      <div className="xl:col-span-4 bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-sm flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between border-b border-slate-800 pb-2.5 mb-3">
            <div className="flex items-center gap-2">
              <Target className="w-4 h-4 text-emerald-400" />
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                Weekly Habits Overview
              </h3>
            </div>
            <span className="text-xs font-medium text-emerald-300 bg-emerald-950 px-2 py-0.5 rounded-full border border-emerald-900">
              {weeklyHabits.length} Goals
            </span>
          </div>

          {/* Grid of mini circular gauges */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 xl:grid-cols-2 gap-3">
            {weeklyHabits.map((habit) => {
              const pct = getWeeklyProgressPercent(habit);
              const done = getWeeklyDoneCount(habit);
              const tagStyle = getTagStyle(habit.category);

              return (
                <div
                  key={habit.id}
                  className="flex items-center gap-3 p-2.5 rounded-xl bg-slate-800/60 border border-slate-700/60 hover:border-emerald-700 transition group"
                >
                  <div className="relative flex-shrink-0 flex items-center justify-center">
                    {renderCircularGauge(pct, 44, 4)}
                    <span className={`absolute text-[10px] font-semibold font-mono ${pct > 0 ? 'text-slate-100' : 'text-slate-500'}`}>
                      {pct}%
                    </span>
                  </div>

                  <div className="flex flex-col min-w-0">
                    <span className="text-xs font-medium text-slate-200 truncate group-hover:text-emerald-400 transition" title={habit.name}>
                      {habit.name}
                    </span>
                    <div className="flex items-center gap-1 mt-0.5">
                      {habit.category && (
                        <span className={`text-[9px] px-1 rounded ${tagStyle.bg} ${tagStyle.text}`}>
                          {habit.category}
                        </span>
                      )}
                      <span className="text-[10px] text-slate-500 font-mono">
                        {done}/{habit.goal}w
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-500">
          <span>Weekly goals refresh monthly</span>
          <span className="font-mono text-emerald-400 font-medium">
            {weeklyHabits.reduce((acc, h) => acc + getWeeklyDoneCount(h), 0)} / {weeklyHabits.reduce((acc, h) => acc + h.goal, 0)} Complete
          </span>
        </div>
      </div>
    </div>
  );
};
