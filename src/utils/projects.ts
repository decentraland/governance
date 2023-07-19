export function getHighBudgetVpThreshold(budget: number) {
  return 1200000 + budget * 40
}
