import React, { useState } from 'react';
import { DailyHabit } from '../types';
import { 
  getHabitDoneCount, 
  getHabitLeftCount, 
  getHabitProgressPercent, 
  getDaysInMonth, 
  triggerCelebration 
} from '../utils/helpers';
import { 
  Check, 
  Trash2, 
  Edit2, 
  Plus, 
  CheckSquare, 
  Sparkles,
  Tag,
  Target
} from 'lucide-react';
import { getTagStyle } from '../utils/tagColors';

interface DailyHabitMatrixProps {
  dailyHabits: DailyHabit[];
  year: number;
  month: number;
  onToggleDay: (habitId: string, day: number) => void;
  onUpdateGoal: (habitId: string, newGoal: number) => void;
  onDeleteHabit: (habitId: string) => void;
  onEditHabit: (habit: DailyHabit) => void;
  onAddHabit: () => void;
  onCheckAllToday: (day: number) => void;
  onOpenDayNote: (day: number) => void;
  dailyNotes?: { [day: number]: string };
  highlightedHabitId?: string | null;
}

export const DailyHabitMatrix: React.FC<DailyHabitMatrixProps> = ({
  dailyHabits,
  year,
  month,
  onToggleDay,
  onUpdateGoal,
  onDeleteHabit,
  onEditHabit,
  onAddHabit,
  onCheckAllToday,
  onOpenDayNote,
  dailyNotes = {},
  highlightedHabitId,
}) => {
  const daysInMonth = getDaysInMonth(year, month);
  const daysArray = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  const currentDate = new Date();
  const isCurrentMonth = currentDate.getFullYear() === year && currentDate.getMonth() === month;
  const currentDay = currentDate.getDate();

  const [editingGoalId, setEditingGoalId] = useState<string | null>(null);
  const [tempGoal, setTempGoal] = useState<number>(15);

  const handleCellClick = (habit: DailyHabit, day: number) => {
    const isCurrentlyChecked = !!habit.days[day];
    onToggleDay(habit.id, day);

    // If checking reaches or exceeds target goal, celebrate!
    if (!isCurrentlyChecked) {
      const currentDone = getHabitDoneCount(habit);
      if (currentDone + 1 === habit.goal) {
        triggerCelebration();
      }
    }
  };

  const startEditGoal = (habit: DailyHabit) => {
    setEditingGoalId(habit.id);
    setTempGoal(habit.goal);
  };

  const saveGoal = (habitId: string) => {
    onUpdateGoal(habitId, Math.max(1, tempGoal));
    setEditingGoalId(null);
  };

  const getDayOfWeek = (day: number) => {
    const d = new Date(year, month, day);
    return ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'][d.getDay()];
  };

  const getDailyHabitCount = (day: number) => {
    return dailyHabits.reduce((acc, h) => acc + (h.days[day] ? 1 : 0), 0);
  };

  const todayDoneCount = isCurrentMonth ? dailyHabits.filter(h => !!h.days[currentDay]).length : 0;
  const todayPercent = dailyHabits.length > 0 ? Math.round((todayDoneCount / dailyHabits.length) * 100) : 0;

  const handleJumpToToday = () => {
    const el = document.getElementById(`day-header-${currentDay}`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-sm overflow-hidden mb-8 text-slate-100 transition-colors">
      {/* Header Bar */}
      <div className="bg-slate-900 px-4 sm:px-6 py-4 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
          <h2 className="text-sm sm:text-base font-semibold text-slate-100 tracking-tight flex items-center gap-2">
            Daily Trade Checklist Matrix <span className="text-xs font-mono font-normal text-slate-400">({daysInMonth} Days)</span>
          </h2>

          {isCurrentMonth && (
            <div className="hidden sm:flex items-center gap-2 bg-slate-950 border border-slate-800 px-2.5 py-1 rounded-xl text-xs text-slate-200 shadow-sm">
              <span className="font-semibold text-slate-400">Today:</span>
              <span className="font-mono font-bold text-emerald-400">{todayDoneCount}/{dailyHabits.length}</span>
              <span className="text-[10px] text-slate-500">({todayPercent}%)</span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {isCurrentMonth && (
            <>
              <button
                onClick={handleJumpToToday}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium bg-slate-950 hover:bg-slate-800 text-slate-200 border border-slate-800 transition"
                title="Scroll table directly to today's column"
              >
                <Target className="w-3.5 h-3.5 text-slate-400" />
                Jump to Today
              </button>

              <button
                onClick={() => onCheckAllToday(currentDay)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium bg-slate-950 hover:bg-slate-800 text-slate-100 border border-slate-800 transition"
                title="Check all habits for today"
              >
                <CheckSquare className="w-3.5 h-3.5 text-emerald-400" />
                Check All for Today (Day {currentDay})
              </button>
            </>
          )}

          <button
            onClick={onAddHabit}
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-950 hover:bg-slate-800 text-slate-100 border border-slate-800 transition"
          >
            <Plus className="w-3.5 h-3.5 text-slate-300" />
            Add Daily Habit
          </button>
        </div>
      </div>

      {/* Main Responsive Table */}
      <div className="overflow-x-auto matrix-table bg-slate-950">
        <table className="w-full text-left border-collapse min-w-[1100px]">
          <thead>
            <tr className="bg-slate-800/90 text-slate-300 border-b border-slate-800 text-[10px] uppercase tracking-wider font-semibold">
              {/* Daily Habit Name Column */}
              <th className="py-3 px-4 min-w-[240px] max-w-[280px] sticky left-0 z-20 bg-slate-800 border-r border-slate-700">
                Daily Habit & Tag
              </th>

              {/* Progress Column */}
              <th className="py-3 px-3 w-[110px] text-center bg-slate-800 border-r border-slate-700">
                Progress
              </th>

              {/* Goal Column */}
              <th className="py-3 px-2 w-[55px] text-center bg-slate-800 border-r border-slate-700">
                Goal
              </th>

              {/* Days 1 to 31 */}
              {daysArray.map((day) => {
                const isToday = isCurrentMonth && day === currentDay;
                const dayOfWeek = getDayOfWeek(day);
                const isWeekend = dayOfWeek === 'Sa' || dayOfWeek === 'Su';
                const hasNote = !!dailyNotes[day];

                return (
                  <th
                    key={day}
                    id={`day-header-${day}`}
                    onClick={() => onOpenDayNote(day)}
                    title={`Day ${day} (${dayOfWeek})${hasNote ? ` - Note: ${dailyNotes[day]}` : ' - Click to add note'}`}
                    className={`py-2 px-1 text-center font-mono transition-all cursor-pointer select-none group relative border-r border-slate-800 ${
                      isToday
                        ? 'bg-blue-950 text-blue-300 font-bold border-x border-blue-800'
                        : isWeekend
                        ? 'bg-slate-800/60 text-slate-400'
                        : 'bg-slate-900 text-slate-400 hover:bg-slate-800'
                    }`}
                  >
                    <div className="flex flex-col items-center">
                      <span className="text-[9px] font-normal text-slate-500">
                        {dayOfWeek}
                      </span>
                      <span className={`text-[11px] leading-tight ${isToday ? 'text-blue-300 font-bold' : ''}`}>
                        {day}
                      </span>
                      {hasNote && (
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-0.5" />
                      )}
                    </div>
                  </th>
                );
              })}

              {/* Done Column */}
              <th className="py-3 px-2 w-[55px] text-center font-semibold text-emerald-400 bg-slate-800 border-l border-slate-700">
                Done
              </th>

              {/* Left Column */}
              <th className="py-3 px-2 w-[55px] text-center font-semibold text-blue-400 bg-slate-800 border-l border-slate-700">
                Left
              </th>

              {/* Actions Column */}
              <th className="py-3 px-3 w-[70px] text-center no-print bg-slate-800">
                Edit
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-800 text-xs">
            {dailyHabits.length === 0 ? (
              <tr>
                <td colSpan={daysInMonth + 5} className="py-8 text-center text-slate-500 bg-slate-900">
                  <Tag className="w-6 h-6 mx-auto mb-2 text-slate-600" />
                  No habits added yet. Click "+ Add Daily Habit" to create one.
                </td>
              </tr>
            ) : (
              dailyHabits.map((habit, idx) => {
                const done = getHabitDoneCount(habit);
                const left = getHabitLeftCount(habit);
                const progress = getHabitProgressPercent(habit);
                const isAchieved = done >= habit.goal;
                const isHighlighted = highlightedHabitId === habit.id;
                const tagStyle = getTagStyle(habit.category);

                return (
                  <tr
                    key={habit.id}
                    id={`habit-row-${habit.id}`}
                    className={`transition-colors hover:bg-slate-800/80 bg-slate-900 ${
                      isHighlighted ? 'ring-2 ring-blue-500 bg-blue-950/30' : ''
                    }`}
                  >
                    {/* Habit Name + Category Tag */}
                    <td className="py-2.5 px-4 sticky left-0 z-10 bg-slate-900 border-r border-slate-800">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex flex-col gap-1 overflow-hidden">
                          <span className="font-medium text-gray-900 dark:text-slate-100 truncate text-[13px] hover:text-blue-600 dark:hover:text-blue-400 transition" title={habit.name}>
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

                    {/* Progress Column (% and mini bar) */}
                    <td className="py-2.5 px-2 text-center border-r border-slate-800">
                      <div className="flex flex-col items-center gap-1">
                        <span className={`font-mono text-[11px] font-semibold ${
                          progress >= 100 ? 'text-emerald-400' : progress >= 50 ? 'text-blue-400' : 'text-slate-400'
                        }`}>
                          {progress}%
                        </span>
                        <div className="w-16 bg-slate-800 rounded-full h-1.5 overflow-hidden">
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

                    {/* Goal Column */}
                    <td className="py-2.5 px-1 text-center font-mono text-slate-300 font-medium border-r border-slate-800">
                      {editingGoalId === habit.id ? (
                        <input
                          type="number"
                          min="1"
                          max="31"
                          value={tempGoal}
                          onChange={(e) => setTempGoal(Number(e.target.value))}
                          onBlur={() => saveGoal(habit.id)}
                          onKeyDown={(e) => e.key === 'Enter' && saveGoal(habit.id)}
                          autoFocus
                          className="w-12 bg-slate-800 text-blue-400 font-semibold text-center border border-blue-400 rounded-md py-0.5 text-xs focus:outline-none"
                        />
                      ) : (
                        <button
                          onClick={() => startEditGoal(habit)}
                          title="Click to edit target goal"
                          className="hover:text-blue-400 hover:underline px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-xs"
                        >
                          {habit.goal}
                        </button>
                      )}
                    </td>

                    {/* Day Checkbox Matrix Cells */}
                    {daysArray.map((day) => {
                      const isChecked = !!habit.days[day];
                      const isToday = isCurrentMonth && day === currentDay;
                      const dayOfWeek = getDayOfWeek(day);
                      const isWeekend = dayOfWeek === 'Sa' || dayOfWeek === 'Su';

                      return (
                        <td
                          key={day}
                          onClick={() => handleCellClick(habit, day)}
                          className={`py-1.5 px-0.5 text-center cursor-pointer select-none border-r border-slate-800 transition-colors ${
                            isToday
                              ? 'bg-blue-950/40 border-x border-blue-800'
                              : isWeekend
                              ? 'bg-slate-800/30'
                              : ''
                          } hover:bg-blue-900/30`}
                        >
                          <div className="flex items-center justify-center p-0.5">
                            <div
                              className={`w-5 h-5 rounded-md flex items-center justify-center transition-all duration-150 ${
                                isChecked
                                  ? 'bg-blue-600 text-white shadow-xs scale-105 font-bold'
                                  : 'border border-slate-700 bg-slate-800 hover:border-blue-400 text-transparent'
                              }`}
                            >
                              {isChecked && <Check className="w-3.5 h-3.5 stroke-[2.5]" />}
                            </div>
                          </div>
                        </td>
                      );
                    })}

                    {/* DONE */}
                    <td className="py-2.5 px-2 text-center font-mono font-semibold text-emerald-400 border-l border-slate-800 text-xs">
                      {done}
                    </td>

                    {/* LEFT */}
                    <td className="py-2.5 px-2 text-center font-mono font-medium text-xs">
                      <span className={left === 0 ? 'text-emerald-600 dark:text-emerald-400 font-semibold' : 'text-gray-400 dark:text-slate-500'}>
                        {left}
                      </span>
                    </td>

                    {/* ACTIONS */}
                    <td className="py-2.5 px-2 text-center no-print">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => onEditHabit(habit)}
                          title="Edit Habit Title / Tag / Goal"
                          className="p-1 hover:text-blue-600 text-gray-400 rounded-lg transition"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onDeleteHabit(habit.id)}
                          title="Delete Habit"
                          className="p-1 hover:text-rose-600 text-gray-400 rounded-lg transition"
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

          {/* Daily Totals Summary Footer Row */}
          <tfoot>
            <tr className="bg-gradient-to-r from-blue-950/90 via-slate-900 to-blue-950/90 border-t-2 border-blue-500/40 text-blue-100 font-medium font-mono text-[11px] shadow-md">
              <td className="py-3 px-4 sticky left-0 z-20 bg-blue-950 border-r border-blue-800/60 shadow-md">
                <div className="flex items-center justify-between">
                  <span className="text-blue-300 uppercase tracking-wider text-xs font-bold flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
                    Daily Score
                  </span>
                  <span className="text-[10px] text-blue-300/80 font-semibold bg-blue-900/80 px-2 py-0.5 rounded-full border border-blue-700/50">Total Checked</span>
                </div>
              </td>
              <td className="text-center text-blue-300 text-[10px] border-r border-slate-800 bg-blue-950/60">
                {dailyHabits.length} habits
              </td>
              <td className="text-center text-blue-400 border-r border-slate-800 bg-blue-950/60">
                -
              </td>

              {/* Total Completed per Day */}
              {daysArray.map((day) => {
                const count = getDailyHabitCount(day);
                const isToday = isCurrentMonth && day === currentDay;
                const pct = dailyHabits.length > 0 ? Math.round((count / dailyHabits.length) * 100) : 0;

                return (
                  <td
                    key={day}
                    className={`py-2 px-1 text-center border-r border-slate-800/80 transition-colors ${
                      isToday ? 'bg-blue-900/90 text-blue-100 font-bold border-x-2 border-blue-400/80 shadow-inner' : 'bg-slate-900/80 hover:bg-blue-900/40'
                    }`}
                  >
                    <div className="flex flex-col items-center">
                      <span className={`font-mono ${count > 0 ? 'text-blue-200 font-bold text-xs' : 'text-slate-600'}`}>
                        {count}
                      </span>
                      {count > 0 && (
                        <span className="text-[9px] text-cyan-300 font-bold tracking-tight">
                          {pct}%
                        </span>
                      )}
                    </div>
                  </td>
                );
              })}

              <td className="text-center font-semibold text-emerald-400 border-l border-slate-800 bg-blue-950/70">
                {dailyHabits.reduce((acc, h) => acc + getHabitDoneCount(h), 0)}
              </td>
              <td className="text-center font-semibold text-blue-300 bg-blue-950/70">
                {dailyHabits.reduce((acc, h) => acc + getHabitLeftCount(h), 0)}
              </td>
              <td className="no-print bg-blue-950/70"></td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
};
