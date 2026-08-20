import { DailyHabit, WeeklyHabit, AssetCategory, TradeEntry, DailyJournal, ResourceItem } from '../types';

export const DEFAULT_DAILY_HABITS: Omit<DailyHabit, 'days' | 'notes'>[] = [
  { id: 'dh-1', name: 'Check Economic Calendar', category: 'Pre-Market Routine', goal: 15, color: '#38bdf8' },
  { id: 'dh-2', name: 'Higher Timeframe Analysis', category: 'Technical Analysis', goal: 10, color: '#38bdf8' },
  { id: 'dh-3', name: 'Draw On Key Levels', category: 'Technical Analysis', goal: 10, color: '#38bdf8' },
  { id: 'dh-4', name: 'Check Sentiment', category: 'Market Context', goal: 15, color: '#38bdf8' },
  { id: 'dh-5', name: 'No trades in 1st 5 mins', category: 'Risk & Psychology', goal: 15, color: '#f59e0b' },
  { id: 'dh-6', name: 'Review Major markets', category: 'Market Context', goal: 15, color: '#38bdf8' },
  { id: 'dh-7', name: 'Always Enter A Stop', category: 'Risk Management', goal: 15, color: '#ef4444' },
  { id: 'dh-8', name: 'No meddling with trades', category: 'Discipline', goal: 15, color: '#f59e0b' },
  { id: 'dh-9', name: 'Only Take Planned Trades', category: 'Discipline', goal: 15, color: '#10b981' },
  { id: 'dh-10', name: '5 trades per day Max', category: 'Risk Management', goal: 15, color: '#ef4444' },
  { id: 'dh-11', name: 'Stick To Daily Risk Rules', category: 'Risk Management', goal: 15, color: '#ef4444' },
  { id: 'dh-12', name: 'Journal Trades', category: 'Post-Market Routine', goal: 15, color: '#8b5cf6' },
  { id: 'dh-13', name: 'Take a Walk At Lunch', category: 'Health & Reset', goal: 15, color: '#06b6d4' },
  { id: 'dh-14', name: 'Calculate RvR', category: 'Technical & Execution', goal: 15, color: '#38bdf8' },
  { id: 'dh-15', name: 'Mark Up Intraday Charts', category: 'Post-Market Routine', goal: 15, color: '#8b5cf6' },
];

export const DEFAULT_WEEKLY_HABITS: Omit<WeeklyHabit, 'weeks'>[] = [
  { id: 'wh-1', name: 'Review All Trades', category: 'Weekly Review', goal: 3, color: '#38bdf8' },
  { id: 'wh-2', name: 'Analyse Charts', category: 'Preparation', goal: 4, color: '#38bdf8' },
  { id: 'wh-3', name: 'Watch Trading Videos', category: 'Education', goal: 4, color: '#a855f7' },
  { id: 'wh-4', name: 'Write Goals For The Week', category: 'Planning', goal: 2, color: '#10b981' },
  { id: 'wh-5', name: 'Read Trading Book', category: 'Education', goal: 4, color: '#a855f7' },
  { id: 'wh-6', name: 'Review Trading Journal', category: 'Weekly Review', goal: 4, color: '#38bdf8' },
  { id: 'wh-7', name: '30 Minutes Thinking', category: 'Mindset & Clarity', goal: 4, color: '#06b6d4' },
  { id: 'wh-8', name: 'Week Ahead Trade Plan', category: 'Planning', goal: 4, color: '#10b981' },
  { id: 'wh-9', name: 'Email My Trading Buddy', category: 'Accountability', goal: 4, color: '#f59e0b' },
  { id: 'wh-10', name: 'Relax and Unwind', category: 'Mental Health', goal: 4, color: '#ec4899' },
];

// Sample initial populated state matching Page 1 of the PDF
export const SAMPLE_POPULATED_DAYS: { [id: string]: number[] } = {
  'dh-1': [1, 2, 4], // 3 done
  'dh-2': [2], // 1 done
  'dh-3': [1, 2, 3, 5, 8], // 5 done
  'dh-4': [3], // 1 done
  'dh-5': [2, 4, 9], // 3 done
  'dh-6': [1, 2, 3, 4, 5, 8, 9, 10], // 8 done
  'dh-7': [1, 3, 7, 14], // 4 done
  'dh-8': [5], // 1 done
  'dh-9': [1, 2, 3, 4, 15], // 5 done
  'dh-10': [2, 6], // 2 done
  'dh-11': [1, 2, 3, 4, 5, 12], // 6 done
  'dh-12': [1, 4, 7, 18], // 4 done
  'dh-13': [2, 8], // 2 done
  'dh-14': [1, 3, 11], // 3 done
  'dh-15': [4], // 1 done
};

export const SAMPLE_POPULATED_WEEKS: { [id: string]: number[] } = {
  'wh-1': [1],
  'wh-2': [1],
  'wh-3': [],
  'wh-4': [1, 2],
  'wh-5': [1],
  'wh-6': [],
  'wh-7': [1],
  'wh-8': [1],
  'wh-9': [1],
  'wh-10': [1],
};

export const PRODUCTIVITY_DAILY_TEMPLATE = [
  { id: 'prod-1', name: 'Deep Work Block (90m)', category: 'Focus', goal: 20, color: '#38bdf8' },
  { id: 'prod-2', name: 'Plan Top 3 Priorities', category: 'Planning', goal: 22, color: '#10b981' },
  { id: 'prod-3', name: 'Zero Inbox / Triage', category: 'Admin', goal: 20, color: '#f59e0b' },
  { id: 'prod-4', name: 'Read 20+ Pages', category: 'Learning', goal: 20, color: '#a855f7' },
  { id: 'prod-5', name: 'Exercise / 30m Movement', category: 'Health', goal: 20, color: '#ec4899' },
  { id: 'prod-6', name: 'Drink 2.5L Water', category: 'Health', goal: 25, color: '#06b6d4' },
  { id: 'prod-7', name: 'No Social Media Before 11am', category: 'Discipline', goal: 20, color: '#ef4444' },
  { id: 'prod-8', name: 'Evening Shutdown & Journal', category: 'Review', goal: 22, color: '#8b5cf6' },
];

export const PRODUCTIVITY_WEEKLY_TEMPLATE = [
  { id: 'pwh-1', name: 'Weekly Review & Reset', category: 'Planning', goal: 4, color: '#38bdf8' },
  { id: 'pwh-2', name: 'Backup Data & Clean Desktop', category: 'Organization', goal: 4, color: '#f59e0b' },
  { id: 'pwh-3', name: 'Call Family / Friends', category: 'Social', goal: 4, color: '#ec4899' },
  { id: 'pwh-4', name: 'Budget & Expense Tracking', category: 'Finances', goal: 4, color: '#10b981' },
  { id: 'pwh-5', name: 'Meal Prep & Groceries', category: 'Health', goal: 4, color: '#06b6d4' },
];

// Curated Resources from Page 3 of the PDF
export const CURATED_RESOURCES: ResourceItem[] = [
  {
    id: 'res-1',
    category: 'Brokers',
    name: 'Pepperstone',
    pros: 'Tight spreads, trade via CFD or spread bet, multiple platforms to choose from.',
    cons: "Doesn't take US clients.",
    rating: 5
  },
  {
    id: 'res-2',
    category: 'Brokers',
    name: 'Interactive Brokers',
    pros: 'Huge range of markets, great for US and UK clients, options, CFDs and futures.',
    cons: 'Complicated platform, no spread betting.',
    rating: 5
  },
  {
    id: 'res-3',
    category: 'Brokers',
    name: 'IG',
    pros: 'CFD and spread bet, good range of markets, daily options.',
    cons: 'Wide spreads on some markets.',
    rating: 4
  },
  {
    id: 'res-4',
    category: 'Charting Software',
    name: 'TradingView',
    pros: 'Popular web based platform, massive script library, simple to use & great cloud sync.',
    cons: 'No automated trading without additional software.',
    rating: 5
  },
  {
    id: 'res-5',
    category: 'Charting Software',
    name: 'TrendSpider',
    pros: 'Automated technical analysis, backtesting capabilities, raindrop candles.',
    cons: 'More expensive than standard platforms.',
    rating: 4
  },
  {
    id: 'res-6',
    category: 'Charting Software',
    name: 'NinjaTrader',
    pros: 'Free basic version, advanced automation, execute direct from platform.',
    cons: 'Hard to set up for anything other than futures or forex.',
    rating: 4
  },
  {
    id: 'res-7',
    category: 'Trading Journals',
    name: 'TraderVue',
    pros: 'Comprehensive reporting, integrated charts, mentor mode.',
    cons: 'Limited free plan features.',
    rating: 5
  },
  {
    id: 'res-8',
    category: 'Trading Journals',
    name: 'Edgewonk',
    pros: 'Fully featured, deep psychology journaling and proprietary metric tracking.',
    cons: 'Annual plan only.',
    rating: 4
  },
  {
    id: 'res-9',
    category: 'Trading Journals',
    name: 'TradesViz',
    pros: 'Loads of data points, advanced metrics, AI driven trade analytics.',
    cons: 'Can be confusing for beginners.',
    rating: 4
  },
  {
    id: 'res-10',
    category: 'Psychology Books',
    name: 'Bullet Proof Trader - Steve Ward',
    pros: 'Practical mindset drills to improve psychology, author works with hedge funds.',
    cons: 'Some ideas may require high experience levels.',
    rating: 5
  },
  {
    id: 'res-11',
    category: 'Psychology Books',
    name: 'The Daily Trading Coach - Dr. Brett Steenbarger',
    pros: '101 bite-size lessons to follow, very well regarded clinical psychologist author.',
    cons: 'Requires structured daily reading.',
    rating: 5
  },
  {
    id: 'res-12',
    category: 'Psychology Books',
    name: 'Market Mind Games - Denise Shull',
    pros: 'Written by the real-life Wendy from Billions, revolutionary approach to emotions.',
    cons: 'Can be tough to follow initially.',
    rating: 4
  },
  {
    id: 'res-13',
    category: 'Strategy Books',
    name: 'The Playbook - Mike Bellafiore',
    pros: 'Day trading setups as used by a top New York prop firm (SMB Capital).',
    cons: 'Specific to US Stocks and intraday setups.',
    rating: 5
  },
  {
    id: 'res-14',
    category: 'Strategy Books',
    name: 'Reading Price Charts Bar by Bar - Al Brooks',
    pros: 'Masterclass series on pure price action and market structure.',
    cons: 'Dense reading and requires patience.',
    rating: 4
  },
  {
    id: 'res-15',
    category: 'Biographies and Success',
    name: 'Best Loser Wins - Tom Hougaard',
    pros: 'Written by a very active high-stake day trader focusing on emotional edge.',
    cons: 'Heavy psychological emphasis over specific indicators.',
    rating: 5
  },
  {
    id: 'res-16',
    category: 'Biographies and Success',
    name: 'Reminiscences of a Stock Operator - Edwin Lefèvre',
    pros: 'An absolute timeless classic detailing Jesse Livermore’s market principles.',
    cons: 'Written in 1923 so market mechanics differ slightly.',
    rating: 4
  },
  {
    id: 'res-17',
    category: 'Tools & Screeners',
    name: 'FinViz Elite / Free',
    pros: 'Excellent fast screening tool, free plan adequate for most swing traders.',
    cons: 'Basic free charting.',
    rating: 5
  },
  {
    id: 'res-18',
    category: 'Prop Firms',
    name: 'TopStep Trader',
    pros: 'Offers funded accounts, strong educational resources, Topstep TV.',
    cons: 'Strict evaluation rules, no DAX or Forex.',
    rating: 5
  },
  {
    id: 'res-19',
    category: 'Prop Firms',
    name: 'FTMO',
    pros: 'High profit splits, extensive account options, trade many markets, no time limit.',
    cons: 'No native US futures platform.',
    rating: 5
  },
  {
    id: 'res-20',
    category: 'Research & Flow',
    name: 'Market Chameleon',
    pros: 'Very extensive intraday analysis, options sentiment, VWAP and volume profiles.',
    cons: 'Advanced interface, requires options knowledge.',
    rating: 5
  }
];

export interface SearchableSymbol {
  symbol: string;
  name: string;
  keywords: string[];
}

export const SEARCHABLE_SYMBOLS: SearchableSymbol[] = [
  // Forex
  { symbol: 'EURUSD', name: 'Euro / US Dollar', keywords: ['eur', 'usd', 'euro', 'dollar', 'fiber', 'forex', 'fx'] },
  { symbol: 'GBPUSD', name: 'British Pound / US Dollar', keywords: ['gbp', 'usd', 'pound', 'cable', 'sterling', 'forex', 'fx'] },
  { symbol: 'USDJPY', name: 'US Dollar / Japanese Yen', keywords: ['usd', 'jpy', 'yen', 'ninja', 'forex', 'fx'] },
  { symbol: 'AUDUSD', name: 'Australian Dollar / US Dollar', keywords: ['aud', 'usd', 'aussie', 'forex', 'fx'] },
  { symbol: 'USDCAD', name: 'US Dollar / Canadian Dollar', keywords: ['usd', 'cad', 'loonie', 'canada', 'forex', 'fx'] },
  { symbol: 'USDCHF', name: 'US Dollar / Swiss Franc', keywords: ['usd', 'chf', 'swissie', 'franc', 'forex', 'fx'] },
  { symbol: 'NZDUSD', name: 'New Zealand Dollar / US Dollar', keywords: ['nzd', 'usd', 'kiwi', 'forex', 'fx'] },
  { symbol: 'EURGBP', name: 'Euro / British Pound', keywords: ['eur', 'gbp', 'euro', 'pound', 'chunnel', 'forex', 'fx'] },
  { symbol: 'EURJPY', name: 'Euro / Japanese Yen', keywords: ['eur', 'jpy', 'euro', 'yen', 'yuppy', 'forex', 'fx'] },
  { symbol: 'GBPJPY', name: 'British Pound / Japanese Yen', keywords: ['gbp', 'jpy', 'guppy', 'dragon', 'pound', 'yen', 'forex', 'fx'] },
  { symbol: 'AUDJPY', name: 'Australian Dollar / Japanese Yen', keywords: ['aud', 'jpy', 'aussie', 'yen', 'forex', 'fx'] },
  { symbol: 'CADJPY', name: 'Canadian Dollar / Japanese Yen', keywords: ['cad', 'jpy', 'loonie', 'yen', 'forex', 'fx'] },
  { symbol: 'EURAUD', name: 'Euro / Australian Dollar', keywords: ['eur', 'aud', 'forex', 'fx'] },
  { symbol: 'GBPAUD', name: 'British Pound / Australian Dollar', keywords: ['gbp', 'aud', 'forex', 'fx'] },
  // Metals & Commodities
  { symbol: 'XAUUSD', name: 'Gold / US Dollar', keywords: ['gold', 'xau', 'metal', 'bullion', 'precious'] },
  { symbol: 'XAGUSD', name: 'Silver / US Dollar', keywords: ['silver', 'xag', 'metal', 'precious'] },
  { symbol: 'USOIL', name: 'WTI Crude Oil', keywords: ['oil', 'crude', 'wti', 'energy', 'petroleum', 'usoil'] },
  { symbol: 'UKOIL', name: 'Brent Crude Oil', keywords: ['oil', 'brent', 'crude', 'energy'] },
  { symbol: 'XPTUSD', name: 'Platinum / US Dollar', keywords: ['platinum', 'xpt', 'metal'] },
  { symbol: 'COPPER', name: 'Copper Futures', keywords: ['copper', 'metal', 'commodity'] },
  // Indices
  { symbol: 'US30', name: 'Dow Jones Industrial 30', keywords: ['dow', 'us30', 'dji', 'djia', 'wall street', 'index', 'indices'] },
  { symbol: 'NAS100', name: 'Nasdaq 100 (Tech)', keywords: ['nasdaq', 'nas100', 'tech', 'nq', 'qqq', 'ndx', 'index', 'indices'] },
  { symbol: 'US500', name: 'S&P 500 Index', keywords: ['sp500', 'us500', 'spx', 'spy', 'es', 's&p', 'index', 'indices'] },
  { symbol: 'US2000', name: 'Russell 2000 (Small Cap)', keywords: ['russell', 'us2000', 'rty', 'small cap', 'index'] },
  { symbol: 'GER40', name: 'German DAX 40', keywords: ['dax', 'ger40', 'germany', 'frankfurt', 'index'] },
  { symbol: 'UK100', name: 'FTSE 100 (UK)', keywords: ['ftse', 'uk100', 'london', 'index'] },
  { symbol: 'JP225', name: 'Nikkei 225 (Japan)', keywords: ['nikkei', 'jp225', 'tokyo', 'japan', 'index'] },
  // Stocks
  { symbol: 'NVDA', name: 'Nvidia Corp', keywords: ['nvda', 'nvidia', 'ai', 'chips', 'gpu', 'stock'] },
  { symbol: 'TSLA', name: 'Tesla Inc', keywords: ['tsla', 'tesla', 'ev', 'musk', 'stock'] },
  { symbol: 'AAPL', name: 'Apple Inc', keywords: ['aapl', 'apple', 'iphone', 'mac', 'stock'] },
  { symbol: 'MSFT', name: 'Microsoft Corp', keywords: ['msft', 'microsoft', 'windows', 'azure', 'stock'] },
  { symbol: 'AMZN', name: 'Amazon.com Inc', keywords: ['amzn', 'amazon', 'aws', 'stock'] },
  { symbol: 'META', name: 'Meta Platforms Inc', keywords: ['meta', 'facebook', 'instagram', 'stock'] },
  { symbol: 'GOOGL', name: 'Alphabet Inc (Google)', keywords: ['googl', 'google', 'alphabet', 'stock'] },
  { symbol: 'AMD', name: 'Advanced Micro Devices', keywords: ['amd', 'semiconductor', 'chips', 'stock'] },
  { symbol: 'PLTR', name: 'Palantir Technologies', keywords: ['pltr', 'palantir', 'ai', 'data', 'stock'] },
  { symbol: 'COIN', name: 'Coinbase Global', keywords: ['coin', 'coinbase', 'crypto', 'stock'] },
  // Crypto
  { symbol: 'BTCUSD', name: 'Bitcoin / US Dollar', keywords: ['btc', 'btcusd', 'bitcoin', 'crypto', 'satoshi'] },
  { symbol: 'ETHUSD', name: 'Ethereum / US Dollar', keywords: ['eth', 'ethusd', 'ethereum', 'crypto', 'ether'] },
  { symbol: 'SOLUSD', name: 'Solana / US Dollar', keywords: ['sol', 'solusd', 'solana', 'crypto'] },
  { symbol: 'XRPUSD', name: 'Ripple / US Dollar', keywords: ['xrp', 'xrpusd', 'ripple', 'crypto'] },
  { symbol: 'BNBUSD', name: 'BNB / US Dollar', keywords: ['bnb', 'bnbusd', 'binance', 'crypto'] }
];

export const INITIAL_TRADES_SAMPLE: TradeEntry[] = [
  {
    id: 'tr-1',
    date: new Date().toISOString().slice(0, 10),
    time: '08:30',
    assetCategory: 'Metals',
    symbol: 'XAUUSD',
    side: 'BUY',
    lotSize: 1.0,
    entryPrice: 2424.50,
    slAmount: 150.00,
    pnl: 450.00,
    closeStatus: 'TP Hit'
  },
  {
    id: 'tr-2',
    date: new Date().toISOString().slice(0, 10),
    time: '10:15',
    assetCategory: 'Forex',
    symbol: 'EURUSD',
    side: 'BUY',
    lotSize: 2.0,
    entryPrice: 1.0912,
    slAmount: 160.00,
    pnl: 320.00,
    closeStatus: 'TP Hit'
  },
  {
    id: 'tr-3',
    date: new Date().toISOString().slice(0, 10),
    time: '13:45',
    assetCategory: 'Indices',
    symbol: 'NAS100',
    side: 'SELL',
    lotSize: 1.0,
    entryPrice: 19890,
    slAmount: 140.00,
    pnl: -140.00,
    closeStatus: 'SL Hit'
  },
  {
    id: 'tr-4',
    date: new Date().toISOString().slice(0, 10),
    time: '15:20',
    assetCategory: 'Stocks',
    symbol: 'NVDA',
    side: 'BUY',
    lotSize: 25,
    entryPrice: 128.20,
    slAmount: 100.00,
    pnl: 225.00,
    closeStatus: 'TP Hit'
  }
];

export const INITIAL_DAILY_OBSERVATIONS = {
  marketMovement: 'Strong London session expansion across Gold and EUR pairs. US market open had initial chop before tech index trended higher.',
  mistakes: 'Entered NAS100 slightly ahead of 5-minute confirmation candle. Kept SL fixed and stopped immediately.',
  riskReward: 'Realized 3 wins / 1 loss (75% Win Rate). Risk strictly capped at 1.0% per trade.',
  notes: 'Stick to high-probability setups during London and NY overlaps. Maintain healthy evening shutdown routine.'
};

export function getInitialSampleJournals(): { [date: string]: import('../types').DailyJournal } {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const pad = (n: number) => String(n).padStart(2, '0');
  const makeDate = (d: number) => `${year}-${pad(month + 1)}-${pad(d)}`;

  const journals: { [date: string]: import('../types').DailyJournal } = {};

  // Today
  const todayKey = now.toISOString().slice(0, 10);
  journals[todayKey] = {
    id: `journal-${todayKey}`,
    date: todayKey,
    startingBalance: 10000,
    trades: INITIAL_TRADES_SAMPLE,
    observations: INITIAL_DAILY_OBSERVATIONS
  };

  // Sample trades for other days in the current month to show green (profit), red (loss), and breakeven
  const sampleConfigs = [
    {
      dayOffset: 1,
      trades: [
        { symbol: 'XAUUSD', side: 'BUY', lotSize: '1.0', entryPrice: 2430.2, slAmount: '120.00', pnl: 360.00, closeStatus: 'TP Hit' },
        { symbol: 'US30', side: 'BUY', lotSize: '1.0', entryPrice: 40200, slAmount: '150.00', pnl: 280.00, closeStatus: 'TP Hit' }
      ],
      obs: { marketMovement: 'Strong trend day.', mistakes: 'None, followed rules.', riskReward: 'Avg 2.2R', notes: 'Great discipline.' }
    },
    {
      dayOffset: 2,
      trades: [
        { symbol: 'GBPUSD', side: 'SELL', lotSize: '1.5', entryPrice: 1.2840, slAmount: '150.00', pnl: -150.00, closeStatus: 'SL Hit' },
        { symbol: 'BTCUSD', side: 'BUY', lotSize: '0.2', entryPrice: 61200, slAmount: '120.00', pnl: -85.00, closeStatus: 'SL Hit' }
      ],
      obs: { marketMovement: 'Choppy liquidity grab.', mistakes: 'Traded during low volume lunch.', riskReward: '-1.0R', notes: 'Stop trading during lunch lull.' }
    },
    {
      dayOffset: 4,
      trades: [
        { symbol: 'EURUSD', side: 'BUY', lotSize: '2.0', entryPrice: 1.0890, slAmount: '140.00', pnl: 420.00, closeStatus: 'TP Hit' },
        { symbol: 'XAUUSD', side: 'SELL', lotSize: '1.0', entryPrice: 2445.0, slAmount: '150.00', pnl: 310.00, closeStatus: 'TP Hit' },
        { symbol: 'NAS100', side: 'BUY', lotSize: '1.0', entryPrice: 19750, slAmount: '130.00', pnl: -130.00, closeStatus: 'SL Hit' }
      ],
      obs: { marketMovement: 'London breakout follow-through.', mistakes: 'None.', riskReward: '2.4R', notes: 'Clean execution.' }
    },
    {
      dayOffset: 6,
      trades: [
        { symbol: 'USDJPY', side: 'SELL', lotSize: '2.0', entryPrice: 154.20, slAmount: '100.00', pnl: 100.00, closeStatus: 'TP Hit' },
        { symbol: 'AUDUSD', side: 'BUY', lotSize: '2.0', entryPrice: 0.6650, slAmount: '100.00', pnl: -100.00, closeStatus: 'SL Hit' }
      ],
      obs: { marketMovement: 'Range-bound sideways market.', mistakes: 'Over-anticipation.', riskReward: '0.0R', notes: 'Break-even day.' }
    },
    {
      dayOffset: 8,
      trades: [
        { symbol: 'XAUUSD', side: 'BUY', lotSize: '1.0', entryPrice: 2410.0, slAmount: '150.00', pnl: 550.00, closeStatus: 'TP Hit' },
        { symbol: 'NVDA', side: 'BUY', lotSize: '30', entryPrice: 124.50, slAmount: '120.00', pnl: 340.00, closeStatus: 'TP Hit' }
      ],
      obs: { marketMovement: 'CPI volatility expansion.', mistakes: 'None.', riskReward: '3.1R', notes: 'Perfect patient entry.' }
    },
    {
      dayOffset: 9,
      trades: [
        { symbol: 'NAS100', side: 'BUY', lotSize: '1.0', entryPrice: 19620, slAmount: '150.00', pnl: -150.00, closeStatus: 'SL Hit' },
        { symbol: 'US30', side: 'SELL', lotSize: '1.0', entryPrice: 39950, slAmount: '150.00', pnl: -150.00, closeStatus: 'SL Hit' }
      ],
      obs: { marketMovement: 'Reversal news spike.', mistakes: 'Failed to wait for 15m candle close.', riskReward: '-2.0R', notes: 'Respect daily max loss.' }
    },
    {
      dayOffset: 11,
      trades: [
        { symbol: 'EURUSD', side: 'SELL', lotSize: '2.0', entryPrice: 1.0925, slAmount: '130.00', pnl: 290.00, closeStatus: 'TP Hit' },
        { symbol: 'GBPUSD', side: 'SELL', lotSize: '1.5', entryPrice: 1.2890, slAmount: '120.00', pnl: 240.00, closeStatus: 'TP Hit' }
      ],
      obs: { marketMovement: 'Dollar strength continuation.', mistakes: 'None.', riskReward: '2.1R', notes: 'Smooth London session.' }
    }
  ];

  sampleConfigs.forEach(cfg => {
    let day = now.getDate() - cfg.dayOffset;
    if (day <= 0) day += daysInMonth;
    const dateKey = makeDate(day);
    if (dateKey !== todayKey) {
      journals[dateKey] = {
        id: `journal-${dateKey}`,
        date: dateKey,
        startingBalance: 10000,
        trades: cfg.trades.map((t, idx) => ({
          id: `tr-sample-${dateKey}-${idx}`,
          date: dateKey,
          time: '10:00',
          assetCategory: 'Forex' as any,
          symbol: t.symbol,
          side: (t.side as any) || 'BUY',
          lotSize: t.lotSize,
          entryPrice: t.entryPrice,
          slAmount: t.slAmount,
          pnl: t.pnl,
          closeStatus: (t.closeStatus as any) || 'TP Hit'
        })),
        observations: {
          marketMovement: cfg.obs.marketMovement,
          mistakes: cfg.obs.mistakes,
          riskReward: cfg.obs.riskReward,
          notes: cfg.obs.notes
        }
      };
    }
  });

  return journals;
}

