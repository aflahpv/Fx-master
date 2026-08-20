export interface TagStyle {
  bg: string;
  text: string;
  border: string;
  dot: string;
}

export const PRESET_TAGS = [
  'Work',
  'Personal',
  'Urgent',
  'Health',
  'Focus',
  'Finance',
  'Discipline',
  'Learning',
  'Planning',
  'Risk Management',
  'Routine'
];

const TAG_STYLE_MAP: { [key: string]: TagStyle } = {
  work: { bg: 'bg-blue-50 dark:bg-blue-950/80', text: 'text-blue-700 dark:text-blue-300', border: 'border-blue-200 dark:border-blue-900', dot: 'bg-blue-600 dark:bg-blue-400' },
  personal: { bg: 'bg-purple-50 dark:bg-purple-950/80', text: 'text-purple-700 dark:text-purple-300', border: 'border-purple-200 dark:border-purple-900', dot: 'bg-purple-600 dark:bg-purple-400' },
  urgent: { bg: 'bg-rose-50 dark:bg-rose-950/80', text: 'text-rose-700 dark:text-rose-300', border: 'border-rose-200 dark:border-rose-900', dot: 'bg-rose-600 dark:bg-rose-400' },
  health: { bg: 'bg-emerald-50 dark:bg-emerald-950/80', text: 'text-emerald-700 dark:text-emerald-300', border: 'border-emerald-200 dark:border-emerald-900', dot: 'bg-emerald-600 dark:bg-emerald-400' },
  fitness: { bg: 'bg-emerald-50 dark:bg-emerald-950/80', text: 'text-emerald-700 dark:text-emerald-300', border: 'border-emerald-200 dark:border-emerald-900', dot: 'bg-emerald-600 dark:bg-emerald-400' },
  focus: { bg: 'bg-cyan-50 dark:bg-cyan-950/80', text: 'text-cyan-700 dark:text-cyan-300', border: 'border-cyan-200 dark:border-cyan-900', dot: 'bg-cyan-600 dark:bg-cyan-400' },
  finance: { bg: 'bg-amber-50 dark:bg-amber-950/80', text: 'text-amber-700 dark:text-amber-300', border: 'border-amber-200 dark:border-amber-900', dot: 'bg-amber-600 dark:bg-amber-400' },
  finances: { bg: 'bg-amber-50 dark:bg-amber-950/80', text: 'text-amber-700 dark:text-amber-300', border: 'border-amber-200 dark:border-amber-900', dot: 'bg-amber-600 dark:bg-amber-400' },
  discipline: { bg: 'bg-teal-50 dark:bg-teal-950/80', text: 'text-teal-700 dark:text-teal-300', border: 'border-teal-200 dark:border-teal-900', dot: 'bg-teal-600 dark:bg-teal-400' },
  learning: { bg: 'bg-indigo-50 dark:bg-indigo-950/80', text: 'text-indigo-700 dark:text-indigo-300', border: 'border-indigo-200 dark:border-indigo-900', dot: 'bg-indigo-600 dark:bg-indigo-400' },
  education: { bg: 'bg-indigo-50 dark:bg-indigo-950/80', text: 'text-indigo-700 dark:text-indigo-300', border: 'border-indigo-200 dark:border-indigo-900', dot: 'bg-indigo-600 dark:bg-indigo-400' },
  planning: { bg: 'bg-sky-50 dark:bg-sky-950/80', text: 'text-sky-700 dark:text-sky-300', border: 'border-sky-200 dark:border-sky-900', dot: 'bg-sky-600 dark:bg-sky-400' },
  routine: { bg: 'bg-slate-100 dark:bg-slate-800', text: 'text-slate-700 dark:text-slate-300', border: 'border-slate-300 dark:border-slate-700', dot: 'bg-slate-500 dark:bg-slate-400' },
  'risk management': { bg: 'bg-red-50 dark:bg-red-950/80', text: 'text-red-700 dark:text-red-300', border: 'border-red-200 dark:border-red-900', dot: 'bg-red-600 dark:bg-red-400' },
  'risk & psychology': { bg: 'bg-rose-50 dark:bg-rose-950/80', text: 'text-rose-700 dark:text-rose-300', border: 'border-rose-200 dark:border-rose-900', dot: 'bg-rose-600 dark:bg-rose-400' },
  'pre-market routine': { bg: 'bg-blue-50 dark:bg-blue-950/80', text: 'text-blue-700 dark:text-blue-300', border: 'border-blue-200 dark:border-blue-900', dot: 'bg-blue-600 dark:bg-blue-400' },
  'technical analysis': { bg: 'bg-sky-50 dark:bg-sky-950/80', text: 'text-sky-700 dark:text-sky-300', border: 'border-sky-200 dark:border-sky-900', dot: 'bg-sky-600 dark:bg-sky-400' },
  'post-market routine': { bg: 'bg-violet-50 dark:bg-violet-950/80', text: 'text-violet-700 dark:text-violet-300', border: 'border-violet-200 dark:border-violet-900', dot: 'bg-violet-600 dark:bg-violet-400' },
  'market context': { bg: 'bg-amber-50 dark:bg-amber-950/80', text: 'text-amber-700 dark:text-amber-300', border: 'border-amber-200 dark:border-amber-900', dot: 'bg-amber-600 dark:bg-amber-400' },
  'weekly review': { bg: 'bg-indigo-50 dark:bg-indigo-950/80', text: 'text-indigo-700 dark:text-indigo-300', border: 'border-indigo-200 dark:border-indigo-900', dot: 'bg-indigo-600 dark:bg-indigo-400' },
  'mental health': { bg: 'bg-pink-50 dark:bg-pink-950/80', text: 'text-pink-700 dark:text-pink-300', border: 'border-pink-200 dark:border-pink-900', dot: 'bg-pink-600 dark:bg-pink-400' },
  accountability: { bg: 'bg-amber-50 dark:bg-amber-950/80', text: 'text-amber-700 dark:text-amber-300', border: 'border-amber-200 dark:border-amber-900', dot: 'bg-amber-600 dark:bg-amber-400' },
  admin: { bg: 'bg-gray-100 dark:bg-slate-800', text: 'text-gray-700 dark:text-slate-300', border: 'border-gray-300 dark:border-slate-700', dot: 'bg-gray-500 dark:bg-slate-400' },
};

const PALETTE: TagStyle[] = [
  { bg: 'bg-blue-50 dark:bg-blue-950/80', text: 'text-blue-700 dark:text-blue-300', border: 'border-blue-200 dark:border-blue-900', dot: 'bg-blue-600 dark:bg-blue-400' },
  { bg: 'bg-emerald-50 dark:bg-emerald-950/80', text: 'text-emerald-700 dark:text-emerald-300', border: 'border-emerald-200 dark:border-emerald-900', dot: 'bg-emerald-600 dark:bg-emerald-400' },
  { bg: 'bg-purple-50 dark:bg-purple-950/80', text: 'text-purple-700 dark:text-purple-300', border: 'border-purple-200 dark:border-purple-900', dot: 'bg-purple-600 dark:bg-purple-400' },
  { bg: 'bg-amber-50 dark:bg-amber-950/80', text: 'text-amber-700 dark:text-amber-300', border: 'border-amber-200 dark:border-amber-900', dot: 'bg-amber-600 dark:bg-amber-400' },
  { bg: 'bg-rose-50 dark:bg-rose-950/80', text: 'text-rose-700 dark:text-rose-300', border: 'border-rose-200 dark:border-rose-900', dot: 'bg-rose-600 dark:bg-rose-400' },
  { bg: 'bg-cyan-50 dark:bg-cyan-950/80', text: 'text-cyan-700 dark:text-cyan-300', border: 'border-cyan-200 dark:border-cyan-900', dot: 'bg-cyan-600 dark:bg-cyan-400' },
  { bg: 'bg-teal-50 dark:bg-teal-950/80', text: 'text-teal-700 dark:text-teal-300', border: 'border-teal-200 dark:border-teal-900', dot: 'bg-teal-600 dark:bg-teal-400' },
  { bg: 'bg-indigo-50 dark:bg-indigo-950/80', text: 'text-indigo-700 dark:text-indigo-300', border: 'border-indigo-200 dark:border-indigo-900', dot: 'bg-indigo-600 dark:bg-indigo-400' },
];

export function getTagStyle(tag?: string): TagStyle {
  if (!tag) {
    return { bg: 'bg-gray-50', text: 'text-gray-600', border: 'border-gray-200', dot: 'bg-gray-400' };
  }
  const key = tag.trim().toLowerCase();
  if (TAG_STYLE_MAP[key]) {
    return TAG_STYLE_MAP[key];
  }

  // Hash the string to pick a stable color from PALETTE
  let hash = 0;
  for (let i = 0; i < key.length; i++) {
    hash = key.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % PALETTE.length;
  return PALETTE[index];
}
