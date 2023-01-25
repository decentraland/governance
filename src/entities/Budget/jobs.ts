import { DclData, TransparencyBudget } from '../../clients/DclData'

export async function getTransparencyBudgets() {
  const budgets: TransparencyBudget[] = await DclData.get().getBudgets()
  console.log('budgets', budgets)
  return budgets
}
