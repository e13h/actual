import React from 'react';
import { Trans } from 'react-i18next';

import { theme } from '@actual-app/components/theme';
import { View } from '@actual-app/components/view';

import { FinancialText } from '#components/FinancialText';
import { PrivacyFilter } from '#components/PrivacyFilter';
import type { BudgetPlanGroup } from '#components/reports/spreadsheets/budget-plan-spreadsheet';
import { useFormat } from '#hooks/useFormat';

import { budgetPlanColumns, budgetPlanRowStyle } from './budgetPlanTableLayout';
import { formatShare } from './formatShare';

type BudgetPlanGroupRowProps = {
  group: BudgetPlanGroup;
  funds: number;
};

export function BudgetPlanGroupRow({ group, funds }: BudgetPlanGroupRowProps) {
  const format = useFormat();
  const balance = group.available - group.spent;

  return (
    <View
      style={{
        ...budgetPlanRowStyle,
        marginTop: 12,
        fontWeight: 600,
        borderTop: `1px solid ${theme.tableBorder}`,
        backgroundColor: theme.tableRowHeaderBackground,
      }}
    >
      <View style={{ ...budgetPlanColumns.name, paddingLeft: 4 }}>
        {group.name}
      </View>
      <FinancialText style={budgetPlanColumns.amount}>
        <PrivacyFilter>{format(group.budgeted, 'financial')}</PrivacyFilter>
      </FinancialText>
      <FinancialText style={budgetPlanColumns.percent}>
        {formatShare(group.budgeted, funds)}
      </FinancialText>
      <FinancialText style={budgetPlanColumns.amount}>
        <PrivacyFilter>{format(group.spent, 'financial')}</PrivacyFilter>
      </FinancialText>
      <FinancialText
        style={{
          ...budgetPlanColumns.amount,
          color: balance < 0 ? theme.errorText : undefined,
        }}
      >
        <PrivacyFilter>{format(balance, 'financial')}</PrivacyFilter>
      </FinancialText>
      <View style={budgetPlanColumns.bar} />
      <View
        style={{ ...budgetPlanColumns.status, fontSize: 12, fontWeight: 400 }}
      >
        {group.shortfall > 0 && (
          <span style={{ color: theme.warningText }}>
            <Trans>Short</Trans>{' '}
            <FinancialText>
              <PrivacyFilter>
                {format(group.shortfall, 'financial')}
              </PrivacyFilter>
            </FinancialText>
          </span>
        )}
      </View>
    </View>
  );
}
