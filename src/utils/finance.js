import { PRESETS, CURRENCIES } from '../constants/presets';

/**
 * EverBond Wealth — Financial Calculation Engine
 * Mirrors Investment_Planner.xlsx → Dashboard sheet exactly.
 *
 * All formulas:
 *   Needs      = salary × needs%
 *   Emergency  = salary × emergency%
 *   Invest     = salary × invest%
 *   Equity     = Invest × equity%
 *   Debt       = Invest × debt%
 *   Commodities= Invest × commodities%
 *   Crypto     = Invest × crypto%
 *   LargeCap   = Equity × equityLarge%
 *   ...etc (exact chain)
 */
export function calculateFinancialSnapshot(totalSalary, mode) {
  const p = PRESETS[mode];

  // 1. Budget split
  const needs       = totalSalary * p.needs;
  const emergency   = totalSalary * p.emergency;
  let   investments = totalSalary * p.invest;

  // 2. Investment asset split
  const equity      = investments * p.equity;
  const debt        = investments * p.debt;
  const commodities = investments * p.commodities;
  const crypto      = investments * p.crypto;

  // 3. Equity breakdown
  const equityBreakdown = {
    largeCap: equity * p.equityLarge,
    midCap:   equity * p.equityMid,
    smallCap: equity * p.equitySmall,
  };

  // 4. Debt breakdown
  const debtBreakdown = {
    liquid:    debt * p.debtLiquid,
    shortTMF:  debt * p.debtShortTMF,
    targetMat: debt * p.debtTargetMat,
  };

  // 5. Commodities breakdown
  const commoditiesBreakdown = {
    gold:   commodities * p.goldPct,
    silver: commodities * p.silverPct,
  };

  // 6. Goal split — exact Excel fractions
  const goalSplit = {
    child:      investments * p.goalChild,
    retirement: investments * p.goalRetire,
    house:      investments * p.goalHouse,
    vacation:   investments * p.goalVacation,
  };

  // 7. Blended return (weighted average)
  const blendedReturn =
    p.equity * p.retEquity +
    p.debt   * p.retDebt   +
    p.commodities * p.retCommodities +
    p.crypto * p.retCrypto;

  return {
    totalSalary, mode,
    budget: { needs, emergency, investments },
    investmentSplit: { equity, debt, commodities, crypto },
    equityBreakdown, debtBreakdown, commoditiesBreakdown,
    goalSplit, blendedReturn, presets: p,
  };
}

/** Financial health score 0–100 */
export function calculateHealthScore(snapshot) {
  const { totalSalary, budget, investmentSplit } = snapshot;
  let score = 0;

  const savingsRate    = budget.investments / totalSalary;
  const emergencyRate  = budget.emergency   / totalSalary;
  const cryptoExposure = investmentSplit.crypto / budget.investments;

  // Savings (30 pts)
  if (savingsRate >= 0.40) score += 30;
  else if (savingsRate >= 0.30) score += 22;
  else if (savingsRate >= 0.20) score += 14;
  else score += 5;

  // Emergency (20 pts)
  if (emergencyRate >= 0.10) score += 20;
  else if (emergencyRate >= 0.06) score += 12;
  else score += 4;

  // Diversification (20 pts)
  const diversified =
    investmentSplit.equity > 0 &&
    investmentSplit.debt   > 0 &&
    investmentSplit.commodities > 0;
  score += diversified ? 20 : (investmentSplit.equity > 0 ? 10 : 4);

  // Crypto risk (20 pts)
  if (cryptoExposure <= 0.02)      score += 20;
  else if (cryptoExposure <= 0.05) score += 12;
  else if (cryptoExposure <= 0.10) score += 6;
  else score -= 5;

  // Consistency bonus (10 pts)
  score += 10;

  const value = Math.min(Math.max(score, 0), 100);
  const label =
    value >= 90 ? 'Excellent' :
    value >= 75 ? 'Strong'    :
    value >= 60 ? 'Healthy'   :
    value >= 40 ? 'Average'   : 'Needs Work';

  const tips = [];
  if (savingsRate < 0.25)   tips.push('Increase savings rate to at least 25% of combined income.');
  if (cryptoExposure > 0.05) tips.push('Reduce crypto exposure below 5% for better stability.');
  if (emergencyRate < 0.10) tips.push('Build emergency reserve to 10% of monthly income.');
  if (!tips.length) tips.push('Your shared financial plan is well-structured. Keep it up!');

  return { value, label, tips };
}

/**
 * SIP Future Value — exact formula used in Excel
 * FV = PMT × [((1 + r)^n − 1) / r] × (1 + r)
 */
export function simulateGrowth(monthlyAmount, years, annualReturnPct, inflationAdjusted = false) {
  const inflation   = inflationAdjusted ? 0.06 : 0;
  const realReturn  = (1 + annualReturnPct / 100) / (1 + inflation) - 1;
  const r           = realReturn / 12;
  const n           = years * 12;

  const fv = r > 0
    ? monthlyAmount * ((Math.pow(1 + r, n) - 1) / r) * (1 + r)
    : monthlyAmount * n;

  const dataPoints = [];
  for (let y = 0; y <= years; y++) {
    const m   = y * 12;
    const val = r > 0 && m > 0
      ? monthlyAmount * ((Math.pow(1 + r, m) - 1) / r) * (1 + r)
      : monthlyAmount * m;
    dataPoints.push({ year: y, corpus: Math.round(val), invested: Math.round(monthlyAmount * m) });
  }
  return { fv: Math.round(fv), dataPoints };
}

/** Time (months) to reach a target with SIP */
export function calculateGoalTimeline(monthlyContrib, targetAmount, annualReturnPct) {
  if (monthlyContrib <= 0 || targetAmount <= 0) return Infinity;
  const r = annualReturnPct / 100 / 12;
  if (r <= 0) return Math.ceil(targetAmount / monthlyContrib);
  const n = Math.log(1 + (targetAmount * r) / (monthlyContrib * (1 + r))) / Math.log(1 + r);
  return Math.ceil(n);
}

export function formatCurrency(amount, currencyCode) {
  const curr = CURRENCIES[currencyCode] || CURRENCIES.INR;
  try {
    return new Intl.NumberFormat(curr.locale, {
      style: 'currency', currency: curr.code, maximumFractionDigits: 0,
    }).format(amount);
  } catch {
    return `${curr.symbol}${Math.round(amount).toLocaleString()}`;
  }
}

export function formatCompact(amount, currencyCode) {
  const curr = CURRENCIES[currencyCode] || CURRENCIES.INR;
  const abs  = Math.abs(amount);
  if (abs >= 10_000_000) return `${curr.symbol}${(amount / 10_000_000).toFixed(2)}Cr`;
  if (abs >= 100_000)    return `${curr.symbol}${(amount / 100_000).toFixed(2)}L`;
  if (abs >= 1_000)      return `${curr.symbol}${(amount / 1_000).toFixed(1)}K`;
  return formatCurrency(amount, currencyCode);
}

export function formatDate(dateInput) {
  if (!dateInput) return '';
  const date = new Date(dateInput);
  if (isNaN(date.getTime())) return '';
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}-${month}-${year}`;
}