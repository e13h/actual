import { send } from '@actual-app/core/platform/client/connection';
import type { CategoryGroupEntity } from '@actual-app/core/types/models';

import type { useSpreadsheet } from '#hooks/useSpreadsheet';

import type { BudgetMonthCell } from './budgetMonthCell';

export type BudgetPlanCategory = {
  id: string;
  name: string;
  budgeted: number;
  /** Outflow this month, as a positive number (refunds make it negative). */
  spent: number;
  /** Balance carried in from the previous month. */
  carryIn: number;
  /** What the category can spend this month: carryIn + budgeted. */
  available: number;
  /** Balance left after this month's spending. */
  balance: number;
  /** Goal template target, or null when the category has no template. */
  goal: number | null;
  /**
   * What has to be budgeted this month to meet the goal. Templates target the
   * budgeted amount; a `#goal` (long-goal) targets the balance, so the
   * carried-in balance counts toward it. Without a goal, it is the budgeted
   * amount itself.
   */
  needed: number;
  /** How much more must be budgeted to meet the goal. */
  shortfall: number;
};

export type BudgetPlanGroup = {
  id: string;
  name: string;
  categories: BudgetPlanCategory[];
  budgeted: number;
  spent: number;
  available: number;
  needed: number;
  shortfall: number;
};

export type BudgetPlanData = {
  month: string;
  /**
   * Money available to budget this month: income plus what carried in from
   * last month, less last month's overspending and anything held for next
   * month.
   */
  funds: number;
  income: number;
  budgeted: number;
  toBudget: number;
  needed: number;
  shortfall: number;
  groups: BudgetPlanGroup[];
};

type BuildBudgetPlanParams = {
  month: string;
  groups: CategoryGroupEntity[];
  cells: BudgetMonthCell[];
};

/**
 * Turn one month's envelope budget cells into the per-category numbers the
 * Budget Plan report draws.
 */
export function buildBudgetPlan({
  month,
  groups,
  cells,
}: BuildBudgetPlanParams): BudgetPlanData {
  const values = new Map<string, unknown>();
  for (const cell of cells) {
    values.set(cell.name.slice(cell.name.indexOf('!') + 1), cell.value);
  }
  const num = (name: string) => {
    const value = values.get(name);
    return typeof value === 'number' ? value : 0;
  };

  const planGroups: BudgetPlanGroup[] = [];

  for (const group of groups) {
    if (group.is_income) {
      continue;
    }

    const categories: BudgetPlanCategory[] = [];
    for (const cat of group.categories ?? []) {
      const budgeted = num(`budget-${cat.id}`);
      // `|| 0` turns -0 into 0 so no-spend categories don't show "-0.00".
      const spent = -num(`sum-amount-${cat.id}`) || 0;
      const balance = num(`leftover-${cat.id}`);
      const carryIn = balance - budgeted + spent;
      const goalValue = values.get(`goal-${cat.id}`);
      const goal = typeof goalValue === 'number' ? goalValue : null;
      const isLongGoal = values.get(`long-goal-${cat.id}`) === 1;

      let needed = budgeted;
      if (goal !== null) {
        needed = Math.max(0, isLongGoal ? goal - carryIn : goal);
      }

      // Skip categories with nothing going on, so hidden or unused ones
      // don't clutter the report. Hidden categories that still hold money
      // stay, because leaving them out would break the totals.
      if (
        budgeted === 0 &&
        spent === 0 &&
        balance === 0 &&
        carryIn === 0 &&
        needed === 0
      ) {
        continue;
      }

      categories.push({
        id: cat.id,
        name: cat.name,
        budgeted,
        spent,
        carryIn,
        available: carryIn + budgeted,
        balance,
        goal,
        needed,
        shortfall: Math.max(0, needed - budgeted),
      });
    }

    if (categories.length === 0) {
      continue;
    }

    planGroups.push({
      id: group.id,
      name: group.name,
      categories,
      budgeted: sum(categories, c => c.budgeted),
      spent: sum(categories, c => c.spent),
      available: sum(categories, c => c.available),
      needed: sum(categories, c => c.needed),
      shortfall: sum(categories, c => c.shortfall),
    });
  }

  // `total-budgeted` is stored negated, so subtracting it adds the budget
  // back onto what is left to budget.
  const toBudget = num('to-budget');
  const funds = toBudget - num('total-budgeted');

  return {
    month,
    funds,
    income: num('total-income'),
    budgeted: sum(planGroups, g => g.budgeted),
    toBudget,
    needed: sum(planGroups, g => g.needed),
    shortfall: sum(planGroups, g => g.shortfall),
    groups: planGroups,
  };
}

export function createBudgetPlanSpreadsheet({ month }: { month: string }) {
  return async (
    _spreadsheet: ReturnType<typeof useSpreadsheet>,
    setData: (data: BudgetPlanData) => void,
  ) => {
    const [{ grouped }, cells] = await Promise.all([
      send('get-categories'),
      send('envelope-budget-month', { month }),
    ]);
    setData(buildBudgetPlan({ month, groups: grouped, cells }));
  };
}

function sum<T>(items: T[], pick: (item: T) => number) {
  return items.reduce((total, item) => total + pick(item), 0);
}
