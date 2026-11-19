import React from 'react';
import { Trans, useTranslation } from 'react-i18next';

import { styles } from '@actual-app/components/styles';
import { theme } from '@actual-app/components/theme';
import { Tooltip } from '@actual-app/components/tooltip';
import { View } from '@actual-app/components/view';

import { FinancialText } from '#components/FinancialText';
import { PrivacyFilter } from '#components/PrivacyFilter';
import type {
  BudgetPlanData,
  BudgetPlanGroup,
} from '#components/reports/spreadsheets/budget-plan-spreadsheet';
import { useFormat } from '#hooks/useFormat';

import { fundedColor, unfundedFill } from './budgetPlanColors';
import { FundingLadderLegend } from './FundingLadderLegend';
import { FundingLadderTooltip } from './FundingLadderTooltip';

type FundingLadderGraphProps = {
  data: BudgetPlanData;
  compact?: boolean;
  showTooltip?: boolean;
};

export type FundingLadderSegment = {
  key: string;
  group: BudgetPlanGroup | null;
  amount: number;
  kind: 'funded' | 'unfunded' | 'unbudgeted';
};

/**
 * One horizontal bar showing how far this month's money stretches through
 * the category groups, in budget order. Solid segments are budgeted, hatched
 * segments are goal amounts still unfunded, and a marker shows the money
 * available.
 */
export function FundingLadderGraph({
  data,
  compact = false,
  showTooltip = true,
}: FundingLadderGraphProps) {
  const { t } = useTranslation();
  const format = useFormat();

  const segments: FundingLadderSegment[] = [
    ...data.groups
      .filter(group => group.budgeted > 0)
      .map(group => ({
        key: `funded-${group.id}`,
        group,
        amount: group.budgeted,
        kind: 'funded' as const,
      })),
    ...(data.toBudget > 0
      ? [
          {
            key: 'unbudgeted',
            group: null,
            amount: data.toBudget,
            kind: 'unbudgeted' as const,
          },
        ]
      : []),
    ...data.groups
      .filter(group => group.shortfall > 0)
      .map(group => ({
        key: `unfunded-${group.id}`,
        group,
        amount: group.shortfall,
        kind: 'unfunded' as const,
      })),
  ];

  const total = segments.reduce((sum, s) => sum + s.amount, 0);
  const scale = Math.max(total, data.funds, 1);
  const fundsPosition = Math.max(0, Math.min(1, data.funds / scale));
  const barHeight = compact ? 22 : 36;
  const money = (amount: number) => (
    <FinancialText>
      <PrivacyFilter>{format(amount, 'financial')}</PrivacyFilter>
    </FinancialText>
  );

  let fundedIndex = 0;

  return (
    <View style={{ width: '100%' }}>
      <View
        style={{
          position: 'relative',
          paddingTop: compact ? 16 : 20,
          paddingBottom: compact ? 4 : 22,
        }}
      >
        <View
          role="img"
          aria-label={t(
            'Budgeted {{budgeted}} of {{funds}} available; goals need {{shortfall}} more',
            {
              budgeted: format(data.budgeted, 'financial'),
              funds: format(data.funds, 'financial'),
              shortfall: format(data.shortfall, 'financial'),
            },
          )}
          style={{ flexDirection: 'row', height: barHeight, gap: 2 }}
        >
          {segments.map(segment => {
            const width = `${(segment.amount / scale) * 100}%`;
            const isWide = segment.amount / scale > (compact ? 0.12 : 0.07);
            const opacity =
              segment.kind === 'funded' ? (fundedIndex++ % 2 ? 0.7 : 1) : 1;
            const bar = (
              <View
                style={{
                  height: barHeight,
                  borderRadius: 4,
                  background:
                    segment.kind === 'funded'
                      ? fundedColor
                      : segment.kind === 'unfunded'
                        ? unfundedFill
                        : 'transparent',
                  border:
                    segment.kind === 'funded'
                      ? 'none'
                      : `1px ${segment.kind === 'unbudgeted' ? 'dashed' : 'solid'} ${theme.reportsGray}`,
                  opacity,
                }}
              />
            );

            return (
              <View
                key={segment.key}
                style={{ width, minWidth: 2, position: 'relative' }}
              >
                {showTooltip ? (
                  <Tooltip
                    placement="bottom"
                    content={<FundingLadderTooltip segment={segment} />}
                    style={{ ...styles.tooltip, padding: '6px 10px' }}
                    triggerProps={{ delay: 0 }}
                  >
                    {bar}
                  </Tooltip>
                ) : (
                  bar
                )}
                {!compact && isWide && (
                  <View
                    style={{
                      position: 'absolute',
                      top: barHeight + 4,
                      left: 0,
                      right: 0,
                      fontSize: 11,
                      color: theme.pageTextSubdued,
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    {segment.group?.name ?? t('Not budgeted')}
                  </View>
                )}
              </View>
            );
          })}
        </View>

        <View
          style={{
            position: 'absolute',
            top: 0,
            bottom: compact ? 0 : 18,
            left: `${fundsPosition * 100}%`,
            borderLeft: `2px solid ${theme.pageText}`,
            pointerEvents: 'none',
          }}
        />
        <View
          style={{
            position: 'absolute',
            top: 0,
            fontSize: 11,
            color: theme.pageText,
            whiteSpace: 'nowrap',
            ...(fundsPosition > 0.5
              ? { right: `${(1 - fundsPosition) * 100}%`, paddingRight: 6 }
              : { left: `${fundsPosition * 100}%`, paddingLeft: 6 }),
          }}
        >
          <span>
            <Trans>Available</Trans> {money(data.funds)}
          </span>
        </View>
      </View>

      {!compact && <FundingLadderLegend />}
    </View>
  );
}
