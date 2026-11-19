import React from 'react';
import { useTranslation } from 'react-i18next';

import { styles } from '@actual-app/components/styles';
import { theme } from '@actual-app/components/theme';
import { View } from '@actual-app/components/view';

import { FinancialText } from '#components/FinancialText';
import { PrivacyFilter } from '#components/PrivacyFilter';
import type { BudgetPlanData } from '#components/reports/spreadsheets/budget-plan-spreadsheet';
import { useFormat } from '#hooks/useFormat';

type BudgetPlanSummaryProps = {
  data: BudgetPlanData;
};

/** Headline numbers: money available, what's budgeted, what goals need. */
export function BudgetPlanSummary({ data }: BudgetPlanSummaryProps) {
  const { t } = useTranslation();
  const format = useFormat();
  const gap = data.funds - data.needed;

  const tiles = [
    {
      label: t('Available to budget'),
      value: data.funds,
      note: t('Income {{income}} this month', {
        income: format(data.income, 'financial'),
      }),
    },
    {
      label: t('Budgeted'),
      value: data.budgeted,
      note:
        data.toBudget === 0
          ? t('Every dollar assigned')
          : data.toBudget > 0
            ? t('{{amount}} not yet budgeted', {
                amount: format(data.toBudget, 'financial'),
              })
            : t('{{amount}} overbudgeted', {
                amount: format(-data.toBudget, 'financial'),
              }),
    },
    {
      label: t('Needed for all goals'),
      value: data.needed,
      note: t('{{amount}} of goals not yet funded', {
        amount: format(data.shortfall, 'financial'),
      }),
    },
    {
      label: gap < 0 ? t('Short of goals') : t('Left after goals'),
      value: Math.abs(gap),
      color: gap < 0 ? theme.warningText : theme.noticeText,
      note:
        gap < 0
          ? t('Goals need more than is available')
          : t('Available covers every goal'),
    },
  ];

  return (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 24 }}>
      {tiles.map(tile => (
        <View key={tile.label} style={{ minWidth: 160 }}>
          <View style={{ fontSize: 12, color: theme.pageTextSubdued }}>
            {tile.label}
          </View>
          <FinancialText
            style={{
              ...styles.largeText,
              fontWeight: 500,
              color: tile.color ?? theme.pageText,
            }}
          >
            <PrivacyFilter>{format(tile.value, 'financial')}</PrivacyFilter>
          </FinancialText>
          <View style={{ fontSize: 12, color: theme.pageTextSubdued }}>
            <PrivacyFilter>{tile.note}</PrivacyFilter>
          </View>
        </View>
      ))}
    </View>
  );
}
