import React, { useState, useEffect } from 'react';
import { DailyHabit, WeeklyHabit } from '../types';
import { X, CheckCircle2, Target, Tag, Sparkles } from 'lucide-react';
import { PRESET_TAGS, getTagStyle } from '../utils/tagColors';

interface AddEditHabitModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveDaily: (habit: Omit<DailyHabit, 'days'>) => void;
  onSaveWeekly: (habit: Omit<WeeklyHabit, 'weeks'>) => void;
  editingHabit: DailyHabit | WeeklyHabit | null;
  habitType: 'daily' | 'weekly';
  existingCategories?: string[];
}

export const AddEditHabitModal: React.FC<AddEditHabitModalProps> = ({
  isOpen,
  onClose,
  onSaveDaily,
  onSaveWeekly,
  editingHabit,
  habitType: initialHabitType,
  existingCategories = [],
}) => {
  const [type, setType] = useState<'daily' | 'weekly'>(initialHabitType);
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Work');
  const [goal, setGoal] = useState<number>(15);

  useEffect(() => {
    if (editingHabit) {
      setName(editingHabit.name);
      setCategory(editingHabit.category || 'General');
      setGoal(editingHabit.goal || (initialHabitType === 'daily' ? 15 : 4));
      setType(initialHabitType);
    } else {
      setName('');
      setCategory('Work');
      setGoal(type === 'daily' ? 15 : 4);
    }
  }, [editingHabit, isOpen, initialHabitType, type]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const id = editingHabit ? editingHabit.id : `${type === 'daily' ? 'dh' : 'wh'}-${Date.now()}`;
    const cleanCategory = category.trim() || 'General';

    if (type === 'daily') {
      onSaveDaily({
        id,
        name: name.trim(),
        category: cleanCategory,
        goal: Math.max(1, Math.min(31, goal)),
      });
    } else {
      onSaveWeekly({
        id,
        name: name.trim(),
        category: cleanCategory,
        goal: Math.max(1, Math.min(5, goal)),
      });
    }
    onClose();
  };

  const allSuggestedTags = Array.from(new Set([...PRESET_TAGS, ...existingCategories])).filter(Boolean);
  const currentTagStyle = getTagStyle(category);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-150 text-slate-100">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-md rounded-2xl shadow-xl overflow-hidden p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-100 p-1 rounded-lg hover:bg-slate-800 transition cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2.5 mb-5">
          <div className="p-2 rounded-xl bg-blue-950 text-blue-400 border border-blue-800">
            <Target className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-100">
              {editingHabit ? 'Edit Habit' : 'Add New Habit'}
            </h3>
            <p className="text-xs text-slate-400">
              Configure task name, category tag, and target goal
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Type Selector */}
          {!editingHabit && (
            <div>
              <label className="block text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                Habit Frequency
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setType('daily');
                    setGoal(15);
                  }}
                  className={`py-2 px-3 rounded-xl text-xs font-medium transition flex items-center justify-center gap-2 border cursor-pointer ${
                    type === 'daily'
                      ? 'bg-blue-950 border-blue-600 text-blue-300 font-semibold shadow-xs'
                      : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <span className="w-2 h-2 rounded-full bg-blue-500" />
                  Daily (1-31 Days)
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setType('weekly');
                    setGoal(4);
                  }}
                  className={`py-2 px-3 rounded-xl text-xs font-medium transition flex items-center justify-center gap-2 border cursor-pointer ${
                    type === 'weekly'
                      ? 'bg-emerald-950 border-emerald-600 text-emerald-300 font-semibold shadow-xs'
                      : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  Weekly (1-5 Weeks)
                </button>
              </div>
            </div>
          )}

          {/* Habit Name */}
          <div>
            <label className="block text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
              Habit / Task Name <span className="text-blue-400">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g., Follow Trading Plan, Deep Work 90m, Workout..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500 transition"
            />
          </div>

          {/* Category / Tag Selection */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Tag className="w-3 h-3 text-blue-400" />
                Category / Tag Label
              </label>
              {category.trim() && (
                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-medium border ${currentTagStyle.bg} ${currentTagStyle.text} ${currentTagStyle.border}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${currentTagStyle.dot}`} />
                  {category}
                </span>
              )}
            </div>

            <input
              type="text"
              placeholder="Enter tag label (e.g., Work, Personal, Urgent)..."
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500 transition"
            />

            {/* Quick Tag Pills */}
            <div className="mt-2">
              <span className="text-[10px] text-slate-500 block mb-1">Quick Select Tags:</span>
              <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto pr-1">
                {allSuggestedTags.map((tag) => {
                  const isSelected = category.toLowerCase() === tag.toLowerCase();
                  const style = getTagStyle(tag);
                  return (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => setCategory(tag)}
                      className={`text-[10px] px-2 py-1 rounded-md border transition flex items-center gap-1 cursor-pointer ${
                        isSelected
                          ? `${style.bg} ${style.text} ${style.border} font-semibold ring-1 ring-blue-500`
                          : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-slate-200 hover:bg-slate-700'
                      }`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`} />
                      {tag}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Target Goal */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                Monthly Target Goal
              </label>
              <span className="text-xs font-mono font-semibold text-blue-400">
                {goal} {type === 'daily' ? 'Days' : 'Weeks'}
              </span>
            </div>
            <input
              type="number"
              min="1"
              max={type === 'daily' ? 31 : 5}
              value={goal}
              onChange={(e) => setGoal(Number(e.target.value))}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-slate-100 focus:outline-none focus:border-blue-500 font-mono transition"
            />
            <p className="text-[11px] text-slate-500 mt-1">
              {type === 'daily' ? 'Target number of days this month (1-31)' : 'Target number of weeks this month (1-5)'}
            </p>
          </div>

          {/* Submit Button */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-slate-200 transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white transition shadow-xs flex items-center gap-1.5 cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              {editingHabit ? 'Save Changes' : 'Create Habit'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
