import confetti from 'canvas-confetti';
import { DailyHabit, WeeklyHabit, MonthData } from '../types';
import { 
  DEFAULT_DAILY_HABITS, 
  DEFAULT_WEEKLY_HABITS, 
  SAMPLE_POPULATED_DAYS, 
  SAMPLE_POPULATED_WEEKS 
} from '../data/defaultData';

export const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

export function formatCurrency(amount: number): string {
  const formatted = Math.abs(amount).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
  if (amount < 0) return `-$${formatted}`;
  if (amount > 0) return `+$${formatted}`;
  return `$${formatted}`;
}

export function getInitialMonthData(year: number, month: number, populateSample = false): MonthData {
  const dailyHabits: DailyHabit[] = DEFAULT_DAILY_HABITS.map(dh => {
    const days: { [day: number]: boolean } = {};
    if (populateSample && SAMPLE_POPULATED_DAYS[dh.id]) {
      SAMPLE_POPULATED_DAYS[dh.id].forEach(d => {
        days[d] = true;
      });
    }
    return {
      ...dh,
      days,
      notes: {}
    };
  });

  const weeklyHabits: WeeklyHabit[] = DEFAULT_WEEKLY_HABITS.map(wh => {
    const weeks: { [week: number]: boolean } = {};
    if (populateSample && SAMPLE_POPULATED_WEEKS[wh.id]) {
      SAMPLE_POPULATED_WEEKS[wh.id].forEach(w => {
        weeks[w] = true;
      });
    }
    return {
      ...wh,
      weeks
    };
  });

  return {
    year,
    month,
    dailyHabits,
    weeklyHabits,
    dailyNotes: {}
  };
}

export function getHabitDoneCount(habit: DailyHabit): number {
  return Object.values(habit.days || {}).filter(Boolean).length;
}

export function getHabitLeftCount(habit: DailyHabit): number {
  const done = getHabitDoneCount(habit);
  return Math.max(0, habit.goal - done);
}

export function getHabitProgressPercent(habit: DailyHabit): number {
  const done = getHabitDoneCount(habit);
  if (!habit.goal || habit.goal <= 0) return 0;
  return Math.round((done / habit.goal) * 100);
}

export function getWeeklyDoneCount(habit: WeeklyHabit): number {
  return Object.values(habit.weeks || {}).filter(Boolean).length;
}

export function getWeeklyLeftCount(habit: WeeklyHabit): number {
  const done = getWeeklyDoneCount(habit);
  return Math.max(0, habit.goal - done);
}

export function getWeeklyProgressPercent(habit: WeeklyHabit): number {
  const done = getWeeklyDoneCount(habit);
  if (!habit.goal || habit.goal <= 0) return 0;
  return Math.round((done / habit.goal) * 100);
}

export function calculateOverallStats(dailyHabits: DailyHabit[], weeklyHabits: WeeklyHabit[]) {
  const totalDailyTarget = dailyHabits.reduce((acc, h) => acc + (h.goal || 0), 0);
  const totalDailyDone = dailyHabits.reduce((acc, h) => acc + getHabitDoneCount(h), 0);

  const totalWeeklyTarget = weeklyHabits.reduce((acc, h) => acc + (h.goal || 0), 0);
  const totalWeeklyDone = weeklyHabits.reduce((acc, h) => acc + getWeeklyDoneCount(h), 0);

  const totalTarget = totalDailyTarget + totalWeeklyTarget;
  const totalDone = totalDailyDone + totalWeeklyDone;

  const overallPercent = totalTarget > 0 ? ((totalDone / totalTarget) * 100) : 0;

  return {
    totalDailyTarget,
    totalDailyDone,
    totalWeeklyTarget,
    totalWeeklyDone,
    totalTarget,
    totalDone,
    overallPercent: Number(overallPercent.toFixed(1))
  };
}

export function triggerCelebration() {
  try {
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#38bdf8', '#10b981', '#f59e0b', '#ec4899', '#6366f1']
    });
  } catch {
    // Ignore if not supported
  }
}

export function exportToCSV(data: MonthData) {
  const monthName = MONTH_NAMES[data.month];
  const daysInMonth = getDaysInMonth(data.year, data.month);

  // Headers for Daily
  const dayCols = Array.from({ length: daysInMonth }, (_, i) => `Day ${i + 1}`).join(',');
  let csv = `DISCIPLINE TRACKER - ${monthName} ${data.year}\n\n`;
  csv += `DAILY HABITS\n`;
  csv += `Habit,Category,Goal,Progress %,Done,Left,${dayCols}\n`;

  data.dailyHabits.forEach(h => {
    const done = getHabitDoneCount(h);
    const left = getHabitLeftCount(h);
    const progress = getHabitProgressPercent(h);
    const dayVals = Array.from({ length: daysInMonth }, (_, i) => (h.days[i + 1] ? '1' : '0')).join(',');
    csv += `"${h.name}","${h.category || ''}",${h.goal},${progress}%,${done},${left},${dayVals}\n`;
  });

  csv += `\nWEEKLY HABITS\n`;
  csv += `Habit,Category,Goal,Progress %,Done,Left,W1,W2,W3,W4,W5\n`;
  data.weeklyHabits.forEach(h => {
    const done = getWeeklyDoneCount(h);
    const left = getWeeklyLeftCount(h);
    const progress = getWeeklyProgressPercent(h);
    const weekVals = [1, 2, 3, 4, 5].map(w => (h.weeks[w] ? '1' : '0')).join(',');
    csv += `"${h.name}","${h.category || ''}",${h.goal},${progress}%,${done},${left},${weekVals}\n`;
  });

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `Discipline_Tracker_${monthName}_${data.year}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
