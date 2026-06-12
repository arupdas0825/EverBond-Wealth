/**
 * EverBond Wealth — Financial Presets
 * SOURCE: Investment_Planner.xlsx → Presets sheet (exact values)
 */
export const PRESETS = {
  Conservative: {
    needs: 0.60, emergency: 0.10, invest: 0.30,
    equity: 0.40, debt: 0.50, commodities: 0.08, crypto: 0.02,
    equityLarge: 0.70, equityMid: 0.25, equitySmall: 0.05,
    debtLiquid: 0.40, debtShortTMF: 0.40, debtTargetMat: 0.20,
    goldPct: 0.85, silverPct: 0.15,
    goalChild: 0.3157894736842105, goalRetire: 0.2456140350877193,
    goalHouse: 0.1052631578947368, goalVacation: 0.3333333333333334,
    retEquity: 10, retDebt: 7, retCommodities: 8, retCrypto: 15,
  },
  Balanced: {
    needs: 0.55, emergency: 0.10, invest: 0.35,
    equity: 0.60, debt: 0.30, commodities: 0.08, crypto: 0.02,
    equityLarge: 0.60, equityMid: 0.30, equitySmall: 0.10,
    debtLiquid: 0.30, debtShortTMF: 0.45, debtTargetMat: 0.25,
    goldPct: 0.80, silverPct: 0.20,
    goalChild: 0.3007518796992481, goalRetire: 0.3007518796992481,
    goalHouse: 0.1127819548872180, goalVacation: 0.2857142857142858,
    retEquity: 12, retDebt: 7.5, retCommodities: 9, retCrypto: 25,
  },
  Aggressive: {
    needs: 0.50, emergency: 0.10, invest: 0.40,
    equity: 0.70, debt: 0.20, commodities: 0.08, crypto: 0.02,
    equityLarge: 0.50, equityMid: 0.35, equitySmall: 0.15,
    debtLiquid: 0.20, debtShortTMF: 0.40, debtTargetMat: 0.40,
    goldPct: 0.75, silverPct: 0.25,
    goalChild: 0.2763157894736842, goalRetire: 0.3552631578947368,
    goalHouse: 0.1184210526315789, goalVacation: 0.2500000000000000,
    retEquity: 15, retDebt: 8, retCommodities: 10, retCrypto: 40,
  },
};

export const CURRENCIES = {
  INR: { symbol: '₹',    locale: 'en-IN', code: 'INR', name: 'Indian Rupee',     flag: '🇮🇳' },
  USD: { symbol: '$',    locale: 'en-US', code: 'USD', name: 'US Dollar',        flag: '🇺🇸' },
  EUR: { symbol: '€',    locale: 'de-DE', code: 'EUR', name: 'Euro',             flag: '🇪🇺' },
  GBP: { symbol: '£',    locale: 'en-GB', code: 'GBP', name: 'British Pound',    flag: '🇬🇧' },
  CHF: { symbol: 'Fr',   locale: 'de-CH', code: 'CHF', name: 'Swiss Franc',      flag: '🇨🇭' },
  CAD: { symbol: 'C$',   locale: 'en-CA', code: 'CAD', name: 'Canadian Dollar',  flag: '🇨🇦' },
  SGD: { symbol: 'S$',   locale: 'en-SG', code: 'SGD', name: 'Singapore Dollar', flag: '🇸🇬' },
  AED: { symbol: 'د.إ', locale: 'ar-AE', code: 'AED', name: 'UAE Dirham',       flag: '🇦🇪' },
  JPY: { symbol: '¥',    locale: 'ja-JP', code: 'JPY', name: 'Japanese Yen',     flag: '🇯🇵' },
  AUD: { symbol: 'A$',   locale: 'en-AU', code: 'AUD', name: 'Australian Dollar',flag: '🇦🇺' },
};

export const REGIONS = ['India','Germany','Switzerland','USA','UK','Canada','Singapore','UAE'];