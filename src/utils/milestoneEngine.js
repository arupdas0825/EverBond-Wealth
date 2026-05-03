/**
 * Milestone Calculation Engine
 * 
 * Handles all logic for milestone savings, timelines, and progress tracking.
 * Strictly decoupled from core investment formulas.
 */

export const calculateMilestoneDetails = (milestone) => {
  const targetCost = Number(milestone.targetCost) || 0;
  const currentSavings = Number(milestone.currentSavings) || 0; // Future ready: support initial savings
  const monthlyContribution = Number(milestone.monthlyContribution) || 0;
  const targetDate = new Date(milestone.targetDate);
  const today = new Date();

  const remainingAmount = Math.max(0, targetCost - currentSavings);
  
  // Calculate months remaining until target date
  const monthsRemaining = (targetDate.getFullYear() - today.getFullYear()) * 12 + (targetDate.getMonth() - today.getMonth());
  
  // Progress percentage based on cost
  const progressPercent = targetCost > 0 ? (currentSavings / targetCost) * 100 : 0;

  // Monthly needed calculation
  const monthlyNeeded = monthsRemaining > 0 ? remainingAmount / monthsRemaining : remainingAmount;

  // Timeline readiness: How many months it will ACTUALLY take at current rate
  const monthsAtCurrentRate = monthlyContribution > 0 ? Math.ceil(remainingAmount / monthlyContribution) : Infinity;
  
  const estimatedCompletionDate = new Date();
  if (monthsAtCurrentRate !== Infinity) {
    estimatedCompletionDate.setMonth(today.getMonth() + monthsAtCurrentRate);
  }

  // Delay estimation
  const delayMonths = monthsAtCurrentRate !== Infinity ? Math.max(0, monthsAtCurrentRate - monthsRemaining) : 0;

  return {
    remainingAmount,
    monthsRemaining,
    progressPercent,
    monthlyNeeded,
    monthsAtCurrentRate,
    estimatedCompletionDate,
    delayMonths,
    isAtRisk: delayMonths > 0,
    isReady: remainingAmount <= 0
  };
};
