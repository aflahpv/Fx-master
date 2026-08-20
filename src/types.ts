export interface DailyHabit {
  id: string;
  name: string;
  category?: string;
  goal: number; // Target number of days
  days: { [day: number]: boolean }; // day 1-31
  notes?: { [day: number]: string };
  color?: string;
}

export interface WeeklyHabit {
  id: string;
  name: string;
  category?: string;
  goal: number; // Target number of weeks (1-5)
  weeks: { [week: number]: boolean }; // week 1-5
  notes?: string;
  color?: string;
}

export interface MonthData {
  year: number;
  month: number; // 0-11
  dailyHabits: DailyHabit[];
  weeklyHabits: WeeklyHabit[];
  dailyNotes?: { [day: number]: string };
}

export type AssetCategory = 'Forex' | 'Indices' | 'Metals' | 'Stocks' | 'Crypto';
export type TradeSide = 'BUY' | 'SELL';
export type TradeCloseStatus = 'TP Hit' | 'SL Hit' | 'Manual Close' | 'Breakeven' | 'Trailing Stop' | 'Open';

export interface TradeEntry {
  id: string;
  date: string; // YYYY-MM-DD
  time?: string; // HH:mm
  assetCategory?: AssetCategory;
  symbol: string;
  side?: TradeSide;
  lotSize: number | string; // Lot size (formerly qty)
  qty?: number | string; // Backward compatibility
  entryPrice: number | string; // Entry price of symbol (formerly market price)
  slAmount: number | string; // SL/ENTRY (Stoploss amount in USD / risked amount per trade)
  tp?: number | string;
  sl?: number | string;
  pnl: number | string; // Positive for profit, negative for loss (in USD)
  closeStatus?: TradeCloseStatus;
  observation?: string;
  riskReward?: string; // e.g. "1:2.5" or "+2.5R"
}

export interface DailyObservations {
  marketMovement: string;
  mistakes: string;
  riskReward: string;
  notes: string;
}

export interface DailyJournal {
  id: string;
  date: string; // YYYY-MM-DD
  startingBalance: number;
  closingBalance?: number;
  trades: TradeEntry[];
  observations: DailyObservations;
}

export interface ResourceItem {
  id: string;
  category: string;
  name: string;
  pros: string;
  cons: string;
  rating: number; // 1 to 5
}

export type HabitTemplate = 'trader' | 'productivity' | 'fitness' | 'developer' | 'blank';

export interface UserProfile {
  email: string;
  name: string;
  passcode?: string;
  isLoggedIn?: boolean;
  lastBackupAt?: string;
}
