import { PRESETS, CURRENCIES } from '../constants/presets';

/**
 * EverBond Wealth — Centralized Financial Calculation Engine
 * Powering all dashboard metrics, charts, and projections.
 */

export function calculateFinancialSnapshot(totalSalary, mode) {
  const p = PRESETS[mode];
  
  // 1. Core Budget Split
  const needs = totalSalary * p.needs;
  const emergency = totalSalary * p.emergency;
  const investments = totalSalary * p.invest;

  // 2. Investment Asset Allocation
  const equity = investments * p.equity;
  const debt = investments * p.debt;
  const commodities = investments * p.commodities;
  const crypto = investments * p.crypto;

  // 3. Granular Breakdowns
  const equityBreakdown = {
    largeCap: equity * p.equityLarge,
    midCap: equity * p.equityMid,
    smallCap: equity * p.equitySmall
  };

  const debtBreakdown = {
    liquid: debt * p.debtLiquid,
    shortTMF: debt * p.debtShortTMF,
    targetMat: debt * p.debtTargetMat
  };

  const commoditiesBreakdown = {
    gold: commodities * p.goldPct,
    silver: commodities * p.silverPct
  };

  // 4. Default Goal Funding (from monthly investments)
  const goalSplit = {
    child: investments * p.goalChild,
    retirement: investments * p.goalRetire,
    house: investments * p.goalHouse,
    vacation: investments * p.goalVacation
  };

  // 5. Blended Return Estimation
  const blendedReturn = (
    (p.equity / 1) * p.retEquity +
    (p.debt / 1) * p.retDebt +
    (p.commodities / 1) * p.retCommodities +
    (p.crypto / 1) * p.retCrypto
  ) / (p.equity + p.debt + p.commodities + p.crypto);

  return {
    totalSalary,
    mode,
    budget: { needs, emergency, investments },
    investmentSplit: { equity, debt, commodities, crypto },
    equityBreakdown,
    debtBreakdown,
    commoditiesBreakdown,
    goalSplit,
    blendedReturn,
    presets: p
  };
}

/**
 * Calculates a comprehensive financial health score (0-100)
 */
export function calculateHealthScore(snapshot) {
  const { totalSalary, budget, investmentSplit } = snapshot;
  let score = 0;
  
  // A. Savings Rate (30 points)
  const savingsRate = budget.investments / totalSalary;
  if (savingsRate >= 0.40) score += 30;
  else if (savingsRate >= 0.30) score += 25;
  else if (savingsRate >= 0.20) score += 15;
  else score += 5;

  // B. Emergency Readiness (20 points)
  const emergencyRate = budget.emergency / totalSalary;
  if (emergencyRate >= 0.10) score += 20;
  else if (emergencyRate >= 0.05) score += 10;
  else score += 2;

  // C. Asset Diversification (20 points)
  const hasEquity = investmentSplit.equity > 0;
  const hasDebt = investmentSplit.debt > 0;
  const hasCommodities = investmentSplit.commodities > 0;
  if (hasEquity && hasDebt && hasCommodities) score += 20;
  else if (hasEquity && hasDebt) score += 12;
  else score += 5;

  // D. Risk Management (20 points)
  const cryptoExposure = investmentSplit.crypto / budget.investments;
  if (cryptoExposure <= 0.05) score += 20; // Healthy limit
  else if (cryptoExposure <= 0.10) score += 10;
  else score -= 10; // Penalty for overexposure

  // E. Consistency Bonus (10 points)
  score += 10; 

  return {
    value: Math.min(Math.max(score, 0), 100),
    label: getScoreLabel(score),
    tips: getOptimizationTips(score, savingsRate, cryptoExposure)
  };
}

function getScoreLabel(score) {
  if (score >= 90) return "Excellent";
  if (score >= 75) return "Strong";
  if (score >= 60) return "Healthy";
  if (score >= 40) return "Average";
  return "Poor";
}

function getOptimizationTips(score, savingsRate, cryptoExposure) {
  const tips = [];
  if (savingsRate < 0.25) tips.push("Try to increase shared savings rate to at least 25%.");
  if (cryptoExposure > 0.05) tips.push("Consider reducing high-risk crypto exposure for better stability.");
  if (score < 75) tips.push("Strengthen your shared emergency reserve to reach 'Strong' status.");
  return tips;
}

/**
 * Standard SIP Compounding Formula
 */
export function simulateGrowth(monthlyAmount, years, annualReturnPct, inflationAdjusted = false) {
  const inflationRate = inflationAdjusted ? 0.06 : 0; // 6% avg inflation
  const realReturn = (1 + annualReturnPct / 100) / (1 + inflationRate) - 1;
  const r = realReturn / 12;
  const n = years * 12;
  
  const fv = r > 0 ? monthlyAmount * ((Math.pow(1 + r, n) - 1) / r) * (1 + r) : monthlyAmount * n;
  
  const dataPoints = [];
  for (let y = 0; y <= years; y++) {
    const m = y * 12;
    const val = r > 0 && m > 0 ? monthlyAmount * ((Math.pow(1 + r, m) - 1) / r) * (1 + r) : monthlyAmount * m;
    dataPoints.push({ 
      year: y, 
      corpus: Math.round(val), 
      invested: Math.round(monthlyAmount * m) 
    });
  }
  return { fv: Math.round(fv), dataPoints };
}

/**
 * Time to Reach Target Calculator
 */
export function calculateGoalTimeline(monthlyContrib, targetAmount, annualReturnPct) {
  if (monthlyContrib <= 0 || targetAmount <= 0) return Infinity;
  const r = annualReturnPct / 100 / 12;
  if (r <= 0) return Math.ceil(targetAmount / monthlyContrib);
  const n = Math.log(1 + (targetAmount * r) / (monthlyContrib * (1 + r))) / Math.log(1 + r);
  return Math.ceil(n);
}

// Formatting Utilities (Universal display, constant logic)
export function formatCurrency(amount, currencyCode) {
  const curr = CURRENCIES[currencyCode] || CURRENCIES.INR;
  try {
    return new Intl.NumberFormat(curr.locale, { 
      style: "currency", 
      currency: curr.code, 
      maximumFractionDigits: 0 
    }).format(amount);
  } catch {
    return `${curr.symbol}${Math.round(amount).toLocaleString()}`;
  }
}

export function formatCompact(amount, currencyCode) {
  const curr = CURRENCIES[currencyCode] || CURRENCIES.INR;
  const abs = Math.abs(amount);
  if (abs >= 10000000) return `${curr.symbol}${(amount / 10000000).toFixed(2)}Cr`;
  if (abs >= 100000) return `${curr.symbol}${(amount / 100000).toFixed(2)}L`;
  if (abs >= 1000) return `${curr.symbol}${(amount / 1000).toFixed(1)}K`;
  return formatCurrency(amount, currencyCode);
}
