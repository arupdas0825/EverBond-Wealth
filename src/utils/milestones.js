/**
 * EverBond Wealth — Milestone Planner Calculation Engine
 * Pure logic module with zero dependencies.
 */

export function parseMilestoneDate(ddmmyyyy) {
  if (!ddmmyyyy || typeof ddmmyyyy !== 'string') return new Date();
  const [d, m, y] = ddmmyyyy.split('-').map(Number);
  // Note: month is 0-indexed in JS Date
  return new Date(y, m - 1, d);
}

export function monthsRemaining(ddmmyyyy) {
  const today = new Date();
  const target = parseMilestoneDate(ddmmyyyy);
  
  // Calculate difference in months
  const n = (target.getFullYear() - today.getFullYear()) * 12
          + (target.getMonth() - today.getMonth());
          
  // Floor at 1 month minimum as per specification
  return Math.max(1, n);
}

export function requiredMonthlySaving(targetCost, monthlySaved, ddmmyyyy) {
  const remaining = Math.max(0, targetCost - monthlySaved);
  const n = monthsRemaining(ddmmyyyy);
  return remaining / n;
}

export function progressPercent(monthlySaved, targetCost) {
  if (targetCost <= 0) return 0;
  return Math.min(100, (monthlySaved / targetCost) * 100);
}

export function formatCountdown(ddmmyyyy) {
  const n = monthsRemaining(ddmmyyyy);
  if (n < 12) return `${n}m`;
  const y = Math.floor(n / 12);
  const m = n % 12;
  return m > 0 ? `${y}y ${m}m` : `${y}y`;
}

export function totalMilestoneContribution(milestones) {
  if (!milestones || !Array.isArray(milestones)) return 0;
  return milestones.reduce((sum, m) =>
    sum + requiredMonthlySaving(m.targetCost, m.monthlySaved, m.targetDate), 0);
}
