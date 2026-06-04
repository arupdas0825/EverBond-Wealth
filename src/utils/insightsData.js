import { PRESETS } from '../constants/presets';
import { calculateFinancialSnapshot, simulateGrowth, calculateGoalTimeline } from './finance';

/**
 * Generates realistic historical net worth and cashflow data based on user configuration.
 * Adds randomized market fluctuations (+/- 1.5%) for a premium, non-linear feel.
 * 
 * Supports dynamic scaling with salary modifications.
 */
export function generateInsightsData(state) {
  const {
    p1Salary = 100000,
    p2Salary = 0,
    stage = 'Single',
    mode = 'Balanced',
    goalTargets = {},
    milestones = [],
    connectionStatus = 'none',
    partnerName = 'Partner',
    partner1 = 'User'
  } = state;

  const isConnected = connectionStatus === 'connected';
  const userSalary = p1Salary || 0;
  const partnerSalary = isConnected ? (p2Salary || 0) : 0;
  const totalSalary = userSalary + partnerSalary;
  
  const preset = PRESETS[mode] || PRESETS.Balanced;
  
  // Calculate allocations
  const userSnapshot = calculateFinancialSnapshot(userSalary, mode);
  const partnerSnapshot = calculateFinancialSnapshot(partnerSalary, mode);
  const combinedSnapshot = calculateFinancialSnapshot(totalSalary, mode);

  const monthlySavings = combinedSnapshot.budget.investments + combinedSnapshot.budget.emergency;
  const monthlyExpenses = combinedSnapshot.budget.needs;

  // 1. Generate Historical Net Worth
  // Let's create a 5-year monthly history (60 data points)
  const historicalNetWorth = [];
  const currentDate = new Date();
  
  // Base net worth scales with salary
  let netWorth = totalSalary * 12; // Start with a base of 1 year of salary
  const baseGrowthRate = (preset.blendedReturn || 10) / 100 / 12;

  // Track the trend (up/down/neutral) based on final segment
  for (let i = 59; i >= 0; i--) {
    const d = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
    const monthStr = d.toLocaleString('default', { month: 'short' }) + ' ' + String(d.getFullYear()).slice(2);
    
    // Growth formula: prior value + monthly savings + investment return + slight random walk noise
    // Seeded noise so it remains consistent for same inputs
    const seed = Math.sin(d.getMonth() + d.getFullYear()) * 0.015; // +/- 1.5% volatility
    const growth = netWorth * (baseGrowthRate + seed);
    
    netWorth = Math.max(netWorth + monthlySavings + growth, totalSalary * 2);
    
    historicalNetWorth.push({
      date: monthStr,
      value: Math.round(netWorth),
      // Random walk trend
      trend: seed > 0.005 ? 'up' : seed < -0.005 ? 'down' : 'neutral'
    });
  }

  // 2. Income vs Expenses history (Last 12 Months)
  const incomeHistory = [];
  const expenseHistory = [];
  
  for (let i = 11; i >= 0; i--) {
    const d = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
    const monthStr = d.toLocaleString('default', { month: 'short' });
    
    // Add minor seasonal deviations (higher income from bonuses, higher expenses in holiday months)
    const isHoliday = d.getMonth() === 11 || d.getMonth() === 10; // Nov, Dec
    const isBonus = d.getMonth() === 2 || d.getMonth() === 3; // March, April
    
    const userInc = userSalary * (isBonus ? 1.25 : 1.0);
    const partnerInc = partnerSalary * (isBonus ? 1.2 : 1.0);
    
    const userExp = monthlyExpenses * 0.9 * (isHoliday ? 1.35 : 1.0);
    const partnerExp = isConnected ? (partnerSnapshot.budget.needs * 0.9 * (isHoliday ? 1.3 : 1.0)) : 0;
    
    incomeHistory.push({
      month: monthStr,
      user: Math.round(userInc),
      partner: Math.round(partnerInc),
      combined: Math.round(userInc + partnerInc)
    });
    
    expenseHistory.push({
      month: monthStr,
      user: Math.round(userExp),
      partner: Math.round(partnerExp),
      combined: Math.round(userExp + partnerExp)
    });
  }

  // 3. Goal Progress
  const activeGoals = [];
  const targetKeys = Object.keys(goalTargets);
  
  const goalNames = {
    child: 'Child Education',
    retirement: 'Retirement Corpus',
    house: 'Dream Home',
    vacation: 'Travel Fund'
  };

  const defaultProgressRates = {
    child: 0.42,
    retirement: 0.28,
    house: 0.18,
    vacation: 0.72
  };

  targetKeys.forEach(k => {
    const target = goalTargets[k] || 0;
    if (target > 0) {
      const pRate = defaultProgressRates[k] || 0.25;
      const current = Math.round(target * pRate);
      const remaining = target - current;
      
      // Calculate estimated completion based on monthly goal splits
      const monthlyContrib = combinedSnapshot.goalSplit[k] || 0;
      const annualReturn = preset.retEquity; // Equity-heavy goal assumptions
      const monthsToTarget = calculateGoalTimeline(monthlyContrib, remaining, annualReturn);
      const years = monthsToTarget === Infinity ? 0 : parseFloat((monthsToTarget / 12).toFixed(1));

      activeGoals.push({
        id: k,
        name: goalNames[k] || k,
        target,
        current,
        remaining,
        percentage: Math.round(pRate * 100),
        estimatedCompletion: years > 0 ? `${years} years` : 'Completed',
        completionDate: years > 0 
          ? new Date(currentDate.getFullYear() + Math.floor(years), currentDate.getMonth() + Math.round((years % 1) * 12)).toLocaleDateString('default', { month: 'short', year: 'numeric' })
          : 'Ready'
      });
    }
  });

  // 4. Future Wealth Forecast (1Y, 5Y, 10Y, 20Y)
  const wealthForecast = [];
  const annualReturnBase = (preset.blendedReturn || 10);
  const annualReturnCons = annualReturnBase - 3;
  const annualReturnOpt = annualReturnBase + 2;

  const forecastYears = [1, 5, 10, 20];
  let currentNW = historicalNetWorth[historicalNetWorth.length - 1]?.value || (totalSalary * 12);

  forecastYears.forEach(y => {
    // Forecast returns dataPoints array: we want the end point for each duration
    const baseSim = simulateGrowth(monthlySavings, y, annualReturnBase);
    const consSim = simulateGrowth(monthlySavings, y, annualReturnCons);
    const optSim = simulateGrowth(monthlySavings, y, annualReturnOpt);

    // Add starting Net Worth compound growth
    const compoundNW = (nw, yrs, rate) => nw * Math.pow(1 + rate / 100, yrs);

    const baseVal = baseSim.fv + compoundNW(currentNW, y, annualReturnBase);
    const consVal = consSim.fv + compoundNW(currentNW, y, annualReturnCons);
    const optVal = optSim.fv + compoundNW(currentNW, y, annualReturnOpt);

    let milestone = null;
    if (y === 1 && stage === 'Single') milestone = 'Unlock Committed Planning';
    else if (y === 5) milestone = 'Dream Home Purchase';
    else if (y === 10) milestone = 'Children High Education';
    else if (y === 20) milestone = 'Financial Freedom Target';

    wealthForecast.push({
      year: `${y} Yr`,
      yearNum: y,
      base: Math.round(baseVal),
      conservative: Math.round(consVal),
      optimistic: Math.round(optVal),
      milestone
    });
  });

  // 5. Savings Rate & Health
  const currentSavingsRate = parseFloat((monthlySavings / totalSalary).toFixed(3));
  const ratePct = Math.round(currentSavingsRate * 100);
  let healthLevel = 'Needs Attention';
  let healthInterpretation = 'Increase your savings allocation or lower non-essentials to build safety reserves.';
  
  if (ratePct >= 35) {
    healthLevel = 'Excellent';
    healthInterpretation = 'Outstanding surplus management. Your wealth compounds aggressively across premium asset classes.';
  } else if (ratePct >= 20) {
    healthLevel = 'Healthy';
    healthInterpretation = 'Solid wealth building block. Ensure allocations stay active and milestones are properly prioritized.';
  }

  // 6. Partner Wealth data if connected
  const partnerWealthData = isConnected ? {
    partnerName,
    partnerSalary,
    partnerPercentage: Math.round((partnerSalary / totalSalary) * 100),
    partnerSavingsRate: Math.round((partnerSnapshot.budget.investments + partnerSnapshot.budget.emergency) / partnerSalary * 100),
    p2NetWorthShare: Math.round(currentNW * 0.45) // Mock partner contributes 45% of historical assets
  } : null;

  return {
    historicalNetWorth,
    incomeHistory,
    expenseHistory,
    goalProgress: activeGoals,
    wealthForecast,
    savingsRate: {
      rate: currentSavingsRate,
      percentage: ratePct,
      level: healthLevel,
      description: healthInterpretation
    },
    partnerWealthData
  };
}
