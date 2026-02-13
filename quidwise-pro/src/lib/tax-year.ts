export function getCurrentTaxYear(): { start: Date; end: Date; label: string } {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth(); // 0-indexed

  // UK tax year runs 6 April to 5 April
  if (month >= 3) {
    // April onwards = current year start
    return {
      start: new Date(year, 3, 6), // April 6
      end: new Date(year + 1, 3, 5), // April 5 next year
      label: `${year}/${(year + 1).toString().slice(-2)}`,
    };
  } else {
    return {
      start: new Date(year - 1, 3, 6),
      end: new Date(year, 3, 5),
      label: `${year - 1}/${year.toString().slice(-2)}`,
    };
  }
}

export function getDaysRemaining(): number {
  const { end } = getCurrentTaxYear();
  const now = new Date();
  const diff = end.getTime() - now.getTime();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

export function getTaxRate(incomeBand: string): number {
  switch (incomeBand) {
    case 'basic':
      return 0.2; // 20%
    case 'higher':
      return 0.4; // 40%
    case 'additional':
      return 0.45; // 45%
    default:
      return 0.2;
  }
}

export function calculateTaxSaving(totalClaimable: number, incomeBand: string): number {
  const rate = getTaxRate(incomeBand);
  // Tax saving = claimable amount × marginal rate + NI saving
  const niRate = incomeBand === 'basic' ? 0.08 : 0.02; // Class 4 NI
  return totalClaimable * (rate + niRate);
}

export function getMileageRate(totalMilesThisYear: number): number {
  // First 10,000 miles at 45p, then 25p
  return totalMilesThisYear > 10000 ? 25 : 45;
}

