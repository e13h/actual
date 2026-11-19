import React from 'react';
import { Trans } from 'react-i18next';

import { theme } from '@actual-app/components/theme';
import { View } from '@actual-app/components/view';

import { FinancialText } from '#components/FinancialText';
import { PrivacyFilter } from '#components/PrivacyFilter';
import type { BudgetPlanCategory } from '#components/reports/spreadsheets/budget-plan-spreadsheet';
import { useFormat } from '#hooks/useFormat';

import { BudgetPlanBulletBar } from './BudgetPlanBulletBar';
import { budgetPlanColumns, budgetPlanRowStyle } from './budgetPlanTableLayout';
import { formatShare } from './formatShare';

type BudgetPlanCategoryRowProps = {
  category: BudgetPlanCategory;
  funds: number;
  monthProgress: number | null;
};

export function BudgetPlanCategoryRow({
  category,
  funds,
  monthProgress,
}: BudgetPlanCategoryRowProps) {
  const format = useFormat();
  const isOverspent = category.balance < 0;

  return (
    <View
      style={{
        ...budgetPlanRowStyle,
        borderTop: `1px solid ${theme.tableBorder}`,
      }}
    >
      <View style={{ ...budgetPlanColumns.name, paddingLeft: 16 }}>
        {category.name}
      </View>
      <FinancialText style={budgetPlanColumns.amount}>
        <PrivacyFilter>{format(category.budgeted, 'financial')}</PrivacyFilter>
      </FinancialText>
      <FinancialText
        style={{ ...budgetPlanColumns.percent, color: theme.pageTextSubdued }}
      >
        {formatShare(category.budgeted, funds)}
      </FinancialText>
      <FinancialText style={budgetPlanColumns.amount}>
        <PrivacyFilter>{format(category.spent, 'financial')}</PrivacyFilter>
      </FinancialText>
      <FinancialText
        style={{
          ...budgetPlanColumns.amount,
          color: isOverspent ? theme.errorText : undefined,
        }}
      >
        <PrivacyFilter>{format(category.balance, 'financial')}</PrivacyFilter>
      </FinancialText>
      <View style={budgetPlanColumns.bar}>
        <BudgetPlanBulletBar
          category={category}
          monthProgress={monthProgress}
        />
      </View>
      <View style={{ ...budgetPlanColumns.status, fontSize: 12 }}>
        {category.goal === null ? (
          <span style={{ color: theme.pageTextSubdued }}>
            <Trans>No goal</Trans>
          </span>
        ) : category.shortfall > 0 ? (
          <span style={{ color: theme.warningText }}>
            <Trans>Short</Trans>{' '}
            <FinancialText>
              <PrivacyFilter>
                {format(category.shortfall, 'financial')}
              </PrivacyFilter>
            </FinancialText>
          </span>
        ) : (
          <span style={{ color: theme.noticeText }}>
            <Trans>Goal funded</Trans>
          </span>
        )}
      </View>
    </View>
  );
}
