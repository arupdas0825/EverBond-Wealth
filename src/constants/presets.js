/**
 * EverBond Wealth — Financial Presets
 * Exact Excel logic preserved. All ratios sum correctly.
 */

export const PRESETS = {
  Conservative: {
    needs:       0.60,
    emergency:   0.10,
    invest:      0.30,

    equity:      0.40,
    debt:        0.50,
    commodities: 0.08,
    crypto:      0.02,

    equityLarge:    0.70,
    equityMid:      0.25,
    equitySmall:    0.05,

    debtLiquid:     0.40,
    debtShortTMF:   0.40,
    debtTargetMat:  0.20,

    goldPct:    0.85,
    silverPct:  0.15,

    goalChild:     0.30,
    goalRetire:    0.35,
    goalHouse:     0.20,
    goalVacation:  0.15,

    retEquity:       10,
    retDebt:          7,
    retCommodities:   8,
    retCrypto:       15,
  },

  Balanced: {
    needs:       0.55,
    emergency:   0.10,
    invest:      0.35,

    equity:      0.60,
    debt:        0.30,
    commodities: 0.08,
    crypto:      0.02,

    equityLarge:    0.60,
    equityMid:      0.30,
    equitySmall:    0.10,

    debtLiquid:     0.30,
    debtShortTMF:   0.45,
    debtTargetMat:  0.25,

    goldPct:    0.80,
    silverPct:  0.20,

    goalChild:     0.25,
    goalRetire:    0.40,
    goalHouse:     0.20,
    goalVacation:  0.15,

    retEquity:       12,
    retDebt:        7.5,
    retCommodities:   9,
    retCrypto:       25,
  },

  Aggressive: {
    needs:       0.50,
    emergency:   0.10,
    invest:      0.40,

    equity:      0.75,
    debt:        0.15,
    commodities: 0.07,
    crypto:      0.03,

    equityLarge:    0.50,
    equityMid:      0.35,
    equitySmall:    0.15,

    debtLiquid:     0.20,
    debtShortTMF:   0.40,
    debtTargetMat:  0.40,

    goldPct:    0.75,
    silverPct:  0.25,

    goalChild:     0.20,
    goalRetire:    0.50,
    goalHouse:     0.20,
    goalVacation:  0.10,

    retEquity:       15,
    retDebt:          8,
    retCommodities:  10,
    retCrypto:       40,
  },
};

export const CURRENCIES = {
  INR: { symbol: "₹",    locale: "en-IN", code: "INR", name: "Indian Rupee",      flag: "🇮🇳" },
  USD: { symbol: "$",    locale: "en-US", code: "USD", name: "US Dollar",         flag: "🇺🇸" },
  EUR: { symbol: "€",    locale: "de-DE", code: "EUR", name: "Euro",              flag: "🇪🇺" },
  GBP: { symbol: "£",    locale: "en-GB", code: "GBP", name: "British Pound",     flag: "🇬🇧" },
  CHF: { symbol: "Fr",   locale: "de-CH", code: "CHF", name: "Swiss Franc",       flag: "🇨🇭" },
  CAD: { symbol: "C$",   locale: "en-CA", code: "CAD", name: "Canadian Dollar",   flag: "🇨🇦" },
  SGD: { symbol: "S$",   locale: "en-SG", code: "SGD", name: "Singapore Dollar",  flag: "🇸🇬" },
  AED: { symbol: "د.إ", locale: "ar-AE", code: "AED", name: "UAE Dirham",        flag: "🇦🇪" },
};

export const REGIONS = [
  { value: "India",       label: "🇮🇳 India",       currency: "INR" },
  { value: "USA",         label: "🇺🇸 United States", currency: "USD" },
  { value: "UK",          label: "🇬🇧 United Kingdom", currency: "GBP" },
  { value: "Germany",     label: "🇩🇪 Germany",      currency: "EUR" },
  { value: "Switzerland", label: "🇨🇭 Switzerland",  currency: "CHF" },
  { value: "Canada",      label: "🇨🇦 Canada",       currency: "CAD" },
  { value: "Singapore",   label: "🇸🇬 Singapore",    currency: "SGD" },
  { value: "UAE",         label: "🇦🇪 UAE",          currency: "AED" },
];