import React, { useState, useEffect } from 'react';
import { X, Calendar, MessageSquare, Trash2, CheckCircle2 } from 'lucide-react';
import { MONTH_NAMES } from '../utils/helpers';

interface DayNoteModalProps {
  isOpen: boolean;
  day: number | null;
  month: number;
  year: number;
  initialNote?: string;
  onClose: () => void;
  onSaveNote: (day: number, note: string) => void;
  onDeleteNote: (day: number) => void;
}

export const DayNoteModal: React.FC<DayNoteModalProps> = ({
  isOpen,
  day,
  month,
  year,
  initialNote = '',
  onClose,
  onSaveNote,
  onDeleteNote
}) => {
  const [note, setNote] = useState('');

  useEffect(() => {
    setNote(initialNote || '');
  }, [initialNote, isOpen]);

  if (!isOpen || day === null) return null;

  const handleSave = () => {
    onSaveNote(day, note.trim());
    onClose();
  };

  const handleDelete = () => {
    onDeleteNote(day);
    onClose();
  };

  const getDayOfWeek = (d: number) => {
    const date = new Date(year, month, d);
    return ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][date.getDay()];
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-150 text-slate-100">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-md rounded-2xl shadow-xl overflow-hidden p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-100 p-1 rounded-lg hover:bg-slate-800 transition cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-xl bg-blue-950 text-blue-400 border border-blue-800">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-100">
              Daily Reflection & Note
            </h3>
            <p className="text-xs text-slate-400">
              {getDayOfWeek(day)}, {MONTH_NAMES[month]} {day}, {year}
            </p>
          </div>
        </div>

        <div className="space-y-3">
          <label className="block text-[10px] font-semibold uppercase tracking-wider text-slate-400">
            Trading & Discipline Log
          </label>
          <textarea
            rows={4}
            placeholder="e.g. Followed plan, stayed patient on opening 15m. Risk rules respected 100%..."
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500 transition"
          />
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-slate-800 mt-5">
          {initialNote ? (
            <button
              onClick={handleDelete}
              className="text-xs text-rose-400 hover:text-rose-300 flex items-center gap-1 hover:underline cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Remove note
            </button>
          ) : <div />}

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 text-xs font-medium text-slate-400 hover:text-slate-200 transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white transition shadow-xs flex items-center gap-1.5 cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              Save Note
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
