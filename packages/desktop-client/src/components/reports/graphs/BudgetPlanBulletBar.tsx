import React from 'react';
import { Trans } from 'react-i18next';

import { styles } from '@actual-app/components/styles';
import { theme } from '@actual-app/components/theme';
import { Tooltip } from '@actual-app/components/tooltip';
import { View } from '@actual-app/components/view';

import { FinancialText } from '#components/FinancialText';
import { PrivacyFilter } from '#components/PrivacyFilter';
import type { BudgetPlanCategory } from '#components/reports/spreadsheets/budget-plan-spreadsheet';
import { useFormat } from '#hooks/useFormat';

import { fundedColor, overspentColor } from './budgetPlanColors';

type BudgetPlanBulletBarProps = {
  category: BudgetPlanCategory;
  /** Share of the month elapsed (0-1), or null when not the current month. */
  monthProgress: number | null;
};

/**
 * Bullet bar for one category, scaled to its own largest value: the light
 * track is what's available (carried in + budgeted), the solid fill is
 * spending, red is spending past what was available, the solid tick is where
 * the goal would put the available amount, and the dashed line is how far
 * through the month we are.
 */
export function BudgetPlanBulletBar({
  category,
  monthProgress,
}: BudgetPlanBulletBarProps) {
  const format = useFormat();
  const available = Math.max(0, category.available);
  const spent = Math.max(0, category.spent);
  const goalTarget =
    category.goal === null ? null : category.carryIn + category.needed;
  const scale = Math.max(available, spent, goalTarget ?? 0, 1);
  const pct = (value: number) => `${(Math.max(0, value) / scale) * 100}%`;
  const withinAvailable = Math.min(spent, available);
  const overspent = spent - withinAvailable;
  const money = (amount: number) => (
    <FinancialText>
      <PrivacyFilter>{format(amount, 'financial')}</PrivacyFilter>
    </FinancialText>
  );

  return (
    <Tooltip
      placement="top"
      triggerProps={{ delay: 0 }}
      style={{ ...styles.tooltip, padding: '6px 10px' }}
      content={
        <View style={{ gap: 2 }}>
          <strong>{category.name}</strong>
          <span>
            <Trans>Available:</Trans> {money(category.available)}
          </span>
          <span>
            <Trans>Spent:</Trans> {money(category.spent)}
          </span>
          {goalTarget !== null && (
            <span>
              <Trans>Goal puts available at:</Trans> {money(goalTarget)}
            </span>
          )}
          {monthProgress !== null && available > 0 && (
            <span>
              <Trans>On pace to have spent by today:</Trans>{' '}
              {money(Math.round(available * monthProgress))}
            </span>
          )}
        </View>
      }
    >
      <View style={{ position: 'relative', height: 14, width: '100%' }}>
        <View
          style={{
            position: 'absolute',
            left: 0,
            top: 2,
            height: 10,
            width: pct(available),
            borderRadius: 4,
            backgroundColor: fundedColor,
            opacity: 0.3,
          }}
        />
        <View
          style={{
            position: 'absolute',
            left: 0,
            top: 2,
            height: 10,
            width: pct(withinAvailable),
            borderRadius: 4,
            backgroundColor: fundedColor,
          }}
        />
        {overspent > 0 && (
          <View
            style={{
              position: 'absolute',
              left: `calc(${pct(withinAvailable)} + 2px)`,
              top: 2,
              height: 10,
              width: `calc(${pct(overspent)} - 2px)`,
              borderRadius: 4,
              backgroundColor: overspentColor,
            }}
          />
        )}
        {monthProgress !== null && available > 0 && (
          <View
            style={{
              position: 'absolute',
              left: pct(available * monthProgress),
              top: 0,
              height: 14,
              borderLeft: `1px dashed ${theme.pageTextSubdued}`,
            }}
          />
        )}
        {goalTarget !== null && (
          <View
            style={{
              position: 'absolute',
              left: `calc(${pct(goalTarget)} - 1px)`,
              top: 0,
              height: 14,
              borderLeft: `2px solid ${theme.pageText}`,
            }}
          />
        )}
      </View>
    </Tooltip>
  );
}
