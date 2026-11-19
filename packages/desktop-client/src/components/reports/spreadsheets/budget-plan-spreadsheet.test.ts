import type { CategoryGroupEntity } from '@actual-app/core/types/models';
import { describe, expect, it } from 'vitest';

import { buildBudgetPlan } from './budget-plan-spreadsheet';
import type { BudgetMonthCell } from './budgetMonthCell';

const groups = [
  {
    id: 'income',
    name: 'Income',
    is_income: true,
    categories: [{ id: 'pay', name: 'Paycheck', group: 'income' }],
  },
  {
    id: 'bills',
    name: 'Bills',
    categories: [
      { id: 'rent', name: 'Rent', group: 'bills' },
      { id: 'unused', name: 'Unused', group: 'bills' },
    ],
  },
  {
    id: 'saving',
    name: 'Saving',
    categories: [
      { id: 'travel', name: 'Travel', group: 'saving' },
      { id: 'house', name: 'House', group: 'saving' },
      { id: 'fun', name: 'Fun', group: 'saving' },
    ],
  },
] as CategoryGroupEntity[];

function cells(values: Record<string, number | null>): BudgetMonthCell[] {
  return Object.entries(values).map(([name, value]) => ({
    name: `budget202612!${name}`,
    value,
  })) as BudgetMonthCell[];
}

describe('buildBudgetPlan', () => {
  const plan = buildBudgetPlan({
    month: '2026-12',
    groups,
    cells: cells({
      'to-budget': 500,
      'total-budgeted': -4500,
      'total-income': 0,
      // Rent: fully funded template, half spent, nothing carried in.
      'budget-rent': 3000,
      'sum-amount-rent': -1500,
      'leftover-rent': 1500,
      'goal-rent': 3000,
      'long-goal-rent': 0,
      // Travel: template wants 1000, nothing budgeted, 200 carried in.
      'budget-travel': 0,
      'sum-amount-travel': 0,
      'leftover-travel': 200,
      'goal-travel': 1000,
      'long-goal-travel': 0,
      // House: #goal of 10000 toward the balance, 8000 carried in.
      'budget-house': 1000,
      'sum-amount-house': 0,
      'leftover-house': 9000,
      'goal-house': 10000,
      'long-goal-house': 1,
      // Fun: no template, overspent.
      'budget-fun': 500,
      'sum-amount-fun': -700,
      'leftover-fun': -200,
      'goal-fun': null,
      // Unused: nothing at all.
      'budget-unused': 0,
      'sum-amount-unused': 0,
      'leftover-unused': 0,
      'goal-unused': null,
    }),
  });
  const category = (id: string) =>
    plan.groups.flatMap(g => g.categories).find(c => c.id === id);

  it('measures funds as budgeted plus what is left to budget', () => {
    expect(plan.funds).toBe(5000);
    expect(plan.budgeted).toBe(4500);
  });

  it('skips income groups and empty categories', () => {
    expect(plan.groups.map(g => g.id)).toEqual(['bills', 'saving']);
    expect(category('unused')).toBeUndefined();
  });

  it('works out carry-in and available money', () => {
    expect(category('rent')).toMatchObject({
      carryIn: 0,
      available: 3000,
      spent: 1500,
    });
    expect(category('travel')).toMatchObject({ carryIn: 200, available: 200 });
  });

  it('counts the carried-in balance toward a long-term goal only', () => {
    expect(category('travel')).toMatchObject({ needed: 1000, shortfall: 1000 });
    expect(category('house')).toMatchObject({ needed: 2000, shortfall: 1000 });
  });

  it('treats a category without a goal as needing its budget', () => {
    expect(category('fun')).toMatchObject({
      goal: null,
      needed: 500,
      shortfall: 0,
    });
  });

  it('totals needed and shortfall across groups', () => {
    expect(plan.needed).toBe(3000 + 1000 + 2000 + 500);
    expect(plan.shortfall).toBe(2000);
    expect(plan.groups[1]).toMatchObject({ budgeted: 1500, shortfall: 2000 });
  });
});
