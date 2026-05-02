/**
 * EverBond Wealth — Professional Financial Presets
 * Based on the original Excel Planning Engine logic.
 */

export const PRESETS = {
  Conservative: {
    // Top-level Budget Split
    needs: 0.60,
    emergency: 0.10,
    invest: 0.30,

    // Investment Split (of the 30% above)
    equity: 0.40,
    debt: 0.50,
    commodities: 0.08,
    crypto: 0.02,

    // Equity Internal Split
    equityLarge: 0.70,
    equityMid: 0.25,
    equitySmall: 0.05,

    // Debt Internal Split
    debtLiquid: 0.40,
    debtShortTMF: 0.40,
    debtTargetMat: 0.20,

    // Commodities Internal Split
    goldPct: 0.85,
    silverPct: 0.15,

    // Goal Internal Allocation (for default life goals)
    goalChild: 0.30,
    goalRetire: 0.35,
    goalHouse: 0.20,
    goalVacation: 0.15,

    // Expected Returns (%)
    retEquity: 10,
    retDebt: 7,
    retCommodities: 8,
    retCrypto: 15,
  },
  Balanced: {
    needs: 0.55,
    emergency: 0.10,
    invest: 0.35,

    equity: 0.60,
    debt: 0.30,
    commodities: 0.08,
    crypto: 0.02,

    equityLarge: 0.60,
    equityMid: 0.30,
    equitySmall: 0.10,

    debtLiquid: 0.30,
    debtShortTMF: 0.45,
    debtTargetMat: 0.25,

    goldPct: 0.80,
    silverPct: 0.20,

    goalChild: 0.25,
    goalRetire: 0.40,
    goalHouse: 0.20,
    goalVacation: 0.15,

    retEquity: 12,
    retDebt: 7.5,
    retCommodities: 9,
    retCrypto: 25,
  },
  Aggressive: {
    needs: 0.50,
    emergency: 0.10,
    invest: 0.40,

    equity: 0.75,
    debt: 0.15,
    commodities: 0.07,
    crypto: 0.03,

    equityLarge: 0.50,
    equityMid: 0.35,
    equitySmall: 0.15,

    debtLiquid: 0.20,
    debtShortTMF: 0.40,
    debtTargetMat: 0.40,

    goldPct: 0.75,
    silverPct: 0.25,

    goalChild: 0.20,
    goalRetire: 0.50,
    goalHouse: 0.20,
    goalVacation: 0.10,

    retEquity: 15,
    retDebt: 8,
    retCommodities: 10,
    retCrypto: 40,
  },
};

export const CURRENCIES = {
  INR: { symbol: "₹", locale: "en-IN", code: "INR", name: "Indian Rupee", flag: "🇮🇳" },
  USD: { symbol: "$", locale: "en-US", code: "USD", name: "US Dollar", flag: "🇺🇸" },
  EUR: { symbol: "€", locale: "de-DE", code: "EUR", name: "Euro", flag: "🇪🇺" },
  GBP: { symbol: "£", locale: "en-GB", code: "GBP", name: "British Pound", flag: "🇬🇧" },
  CHF: { symbol: "Fr", locale: "de-CH", code: "CHF", name: "Swiss Franc", flag: "🇨🇭" },
  CAD: { symbol: "C$", locale: "en-CA", code: "CAD", name: "Canadian Dollar", flag: "🇨🇦" },
  SGD: { symbol: "S$", locale: "en-SG", code: "SGD", name: "Singapore Dollar", flag: "🇸🇬" },
  AED: { symbol: "د.إ", locale: "ar-AE", code: "AED", name: "UAE Dirham", flag: "🇦🇪" },
};
