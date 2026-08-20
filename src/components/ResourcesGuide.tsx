import React, { useState } from 'react';
import { CURATED_RESOURCES } from '../data/defaultData';
import { ResourceItem } from '../types';
import { 
  BookOpen, 
  Star, 
  Check, 
  X, 
  Search, 
  Tag, 
  Info,
  ShieldCheck
} from 'lucide-react';

export const ResourcesGuide: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  const categories = ['All', ...Array.from(new Set(CURATED_RESOURCES.map(r => r.category)))];

  const filteredResources = CURATED_RESOURCES.filter(item => {
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.pros.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.cons.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-6 text-slate-100">
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm relative overflow-hidden transition-colors">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-950 text-blue-300 border border-blue-900">
                Trader & Discipline Directory
              </span>
            </div>
            <h2 className="text-xl font-bold tracking-tight text-slate-100">
              Curated Tools, Software & Psychology Resources
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl">
              Proven tools, journaling platforms, strategy literature, and prop firm resources as recommended in the discipline mastermind guide.
            </p>
          </div>

          {/* Search bar */}
          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search brokers, books, tools..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-9.5 pr-4 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500 transition"
            />
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pt-4 mt-4 border-t border-slate-800 pb-1">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition ${
                selectedCategory === cat
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 border border-slate-700'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Directory Table / Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredResources.map((item) => (
          <div
            key={item.id}
            className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl p-5 shadow-sm flex flex-col justify-between transition group"
          >
            <div>
              <div className="flex items-start justify-between gap-3 mb-2.5">
                <div>
                  <span className="text-[10px] uppercase font-semibold tracking-wider text-blue-300 bg-blue-950 border border-blue-900 px-2 py-0.5 rounded-full">
                    {item.category}
                  </span>
                  <h3 className="text-base font-semibold text-slate-100 mt-1.5 group-hover:text-blue-400 transition">
                    {item.name}
                  </h3>
                </div>

                {/* Rating Stars */}
                <div className="flex items-center gap-0.5 bg-slate-800 px-2 py-1 rounded-lg border border-slate-700 flex-shrink-0">
                  {Array.from({ length: 5 }, (_, i) => (
                    <Star
                      key={i}
                      className={`w-3.5 h-3.5 ${
                        i < item.rating
                          ? 'fill-amber-400 text-amber-400'
                          : 'fill-slate-700 text-slate-700'
                      }`}
                    />
                  ))}
                </div>
              </div>

              {/* Pros & Cons */}
              <div className="space-y-2 my-3 text-xs">
                <div className="flex items-start gap-2 bg-emerald-950/40 border border-emerald-900/60 p-2.5 rounded-xl">
                  <Check className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-emerald-300">Pros: </span>
                    <span className="text-slate-300">{item.pros}</span>
                  </div>
                </div>

                <div className="flex items-start gap-2 bg-rose-950/40 border border-rose-900/60 p-2.5 rounded-xl">
                  <X className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-rose-300">Cons: </span>
                    <span className="text-slate-300">{item.cons}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredResources.length === 0 && (
        <div className="text-center py-12 bg-slate-900 border border-slate-800 rounded-2xl shadow-sm">
          <p className="text-slate-400 text-sm">No resources found matching "{searchQuery}".</p>
        </div>
      )}

      {/* Disclaimer */}
      <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-xl text-[11px] text-slate-400 flex items-start gap-3">
        <Info className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
        <div>
          <span className="font-semibold text-slate-300">Disclaimer: </span>
          The information provided is based on research and trading discipline best practices. Always conduct your own due diligence before making trading, capital allocation, or platform decisions.
        </div>
      </div>
    </div>
  );
};
