import React, { Fragment } from 'react';
import { Trans } from 'react-i18next';

import { theme } from '@actual-app/components/theme';
import { View } from '@actual-app/components/view';
import * as monthUtils from '@actual-app/core/shared/months';
import * as d from 'date-fns';

import type { BudgetPlanData } from '#components/reports/spreadsheets/budget-plan-spreadsheet';

import { BudgetPlanCategoryRow } from './BudgetPlanCategoryRow';
import { BudgetPlanGroupRow } from './BudgetPlanGroupRow';
import { budgetPlanColumns, budgetPlanRowStyle } from './budgetPlanTableLayout';

type BudgetPlanCategoryTableProps = {
  data: BudgetPlanData;
};

/**
 * Per-category rows answering three questions at once: what share of the
 * month's money each category got, whether that meets its goal, and how
 * spending is tracking against what's available.
 */
export function BudgetPlanCategoryTable({
  data,
}: BudgetPlanCategoryTableProps) {
  const monthProgress = getMonthProgress(data.month);

  return (
    <View style={{ minWidth: 760 }}>
      <View
        style={{
          ...budgetPlanRowStyle,
          fontSize: 12,
          color: theme.pageTextSubdued,
        }}
      >
        <View style={budgetPlanColumns.name}>
          <Trans>Category</Trans>
        </View>
        <View style={budgetPlanColumns.amount}>
          <Trans>Budgeted</Trans>
        </View>
        <View style={budgetPlanColumns.percent}>
          <Trans>Share</Trans>
        </View>
        <View style={budgetPlanColumns.amount}>
          <Trans>Spent</Trans>
        </View>
        <View style={budgetPlanColumns.amount}>
          <Trans>Balance</Trans>
        </View>
        <View style={budgetPlanColumns.bar}>
          <Trans>Spending vs available</Trans>
        </View>
        <View style={budgetPlanColumns.status}>
          <Trans>Goal</Trans>
        </View>
      </View>
      {data.groups.map(group => (
        <Fragment key={group.id}>
          <BudgetPlanGroupRow group={group} funds={data.funds} />
          {group.categories.map(category => (
            <BudgetPlanCategoryRow
              key={category.id}
              category={category}
              funds={data.funds}
              monthProgress={monthProgress}
            />
          ))}
        </Fragment>
      ))}
    </View>
  );
}

function getMonthProgress(month: string) {
  if (month !== monthUtils.currentMonth()) {
    return null;
  }
  const today = d.parseISO(monthUtils.currentDay());
  return d.getDate(today) / d.getDaysInMonth(today);
}
