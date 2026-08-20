import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Search, X, Check, TrendingUp } from 'lucide-react';
import { SEARCHABLE_SYMBOLS, SearchableSymbol } from '../data/defaultData';

interface SearchableSymbolInputProps {
  value: string;
  onChange: (symbol: string) => void;
  placeholder?: string;
  className?: string;
}

export const SearchableSymbolInput: React.FC<SearchableSymbolInputProps> = ({
  value,
  onChange,
  placeholder = 'Search (e.g. gold, eurusd)...',
  className = ''
}) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [query, setQuery] = useState<string>(value || '');
  const [highlightIndex, setHighlightIndex] = useState<number>(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Synchronize internal query with external value prop
  useEffect(() => {
    setQuery(value || '');
  }, [value]);

  // Filter symbols based on keyword search
  const filteredSymbols = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) {
      return SEARCHABLE_SYMBOLS.slice(0, 8);
    }

    return SEARCHABLE_SYMBOLS.filter(item => {
      const symMatch = item.symbol.toLowerCase().includes(q);
      const nameMatch = item.name.toLowerCase().includes(q);
      const keywordMatch = item.keywords.some(k => k.toLowerCase().includes(q));
      return symMatch || nameMatch || keywordMatch;
    }).slice(0, 10);
  }, [query]);

  // Handle clicking outside to close
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectSymbol = (symbol: string) => {
    const clean = symbol.toUpperCase().trim();
    onChange(clean);
    setQuery(clean);
    setIsOpen(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen && (e.key === 'ArrowDown' || e.key === 'Enter')) {
      setIsOpen(true);
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightIndex(prev => (prev + 1) % (filteredSymbols.length + 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightIndex(prev => (prev - 1 + filteredSymbols.length + 1) % (filteredSymbols.length + 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredSymbols.length > 0 && highlightIndex < filteredSymbols.length) {
        handleSelectSymbol(filteredSymbols[highlightIndex].symbol);
      } else if (query.trim()) {
        handleSelectSymbol(query);
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  const isExactMatch = filteredSymbols.some(s => s.symbol.toUpperCase() === query.toUpperCase().trim());

  return (
    <div ref={containerRef} className={`relative w-full ${className}`}>
      {/* Input Field */}
      <div className="relative flex items-center">
        <input
          ref={inputRef}
          type="text"
          value={query}
          onFocus={() => setIsOpen(true)}
          onChange={(e) => {
            const val = e.target.value;
            setQuery(val);
            onChange(val.toUpperCase().trim());
            setIsOpen(true);
            setHighlightIndex(0);
          }}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 font-mono font-bold text-xs text-slate-100 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none uppercase placeholder-slate-500 placeholder:normal-case placeholder:font-sans"
        />
        {query ? (
          <button
            type="button"
            onClick={() => {
              setQuery('');
              onChange('');
              inputRef.current?.focus();
            }}
            className="absolute right-2 text-slate-400 hover:text-slate-200 p-0.5 rounded"
            title="Clear symbol"
          >
            <X className="w-3 h-3" />
          </button>
        ) : (
          <Search className="w-3 h-3 text-slate-500 absolute right-2 pointer-events-none" />
        )}
      </div>

      {/* Searchable Autocomplete Dropdown Popover */}
      {isOpen && (
        <div className="absolute z-50 left-0 top-full mt-1 w-72 bg-slate-800 border border-slate-700 rounded-xl shadow-xl overflow-hidden animate-in fade-in-50 zoom-in-95 duration-100">
          <div className="px-2.5 py-1.5 bg-slate-900/80 border-b border-slate-700/80 flex items-center justify-between text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
            <span>Search by symbol or keyword</span>
            <span>{filteredSymbols.length} results</span>
          </div>

          <div className="max-h-60 overflow-y-auto divide-y divide-slate-700/40 p-1">
            {filteredSymbols.map((item, idx) => {
              const isSelected = item.symbol.toUpperCase() === value.toUpperCase();
              const isHighlighted = idx === highlightIndex;

              return (
                <button
                  key={item.symbol}
                  type="button"
                  onClick={() => handleSelectSymbol(item.symbol)}
                  onMouseEnter={() => setHighlightIndex(idx)}
                  className={`w-full text-left px-2.5 py-2 rounded-lg flex items-center justify-between gap-2 transition ${
                    isHighlighted ? 'bg-blue-950/80 text-blue-200' : 'hover:bg-slate-700/50 text-slate-200'
                  }`}
                >
                  <div className="flex flex-col">
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono font-bold text-xs tracking-wide text-slate-100">
                        {item.symbol}
                      </span>
                      {isSelected && (
                        <span className="text-emerald-400">
                          <Check className="w-3 h-3 stroke-[3]" />
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] text-slate-400 font-normal truncate max-w-[170px]">
                      {item.name}
                    </span>
                  </div>

                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-slate-900 border border-slate-700 text-slate-400 font-mono">
                    {item.category}
                  </span>
                </button>
              );
            })}

            {/* Custom Symbol Fallback */}
            {query.trim() && !isExactMatch && (
              <button
                type="button"
                onClick={() => handleSelectSymbol(query)}
                className="w-full text-left px-2.5 py-2 rounded-lg flex items-center justify-between gap-2 text-blue-400 hover:bg-blue-950/40 transition font-mono text-xs"
              >
                <span>Use custom symbol "{query.toUpperCase().trim()}"</span>
                <TrendingUp className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
