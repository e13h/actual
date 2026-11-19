import React from 'react';
import { Trans } from 'react-i18next';

import { View } from '@actual-app/components/view';

import { FinancialText } from '#components/FinancialText';
import { PrivacyFilter } from '#components/PrivacyFilter';
import { useFormat } from '#hooks/useFormat';

import type { FundingLadderSegment } from './FundingLadderGraph';

type FundingLadderTooltipProps = {
  segment: FundingLadderSegment;
};

export function FundingLadderTooltip({ segment }: FundingLadderTooltipProps) {
  const format = useFormat();
  const money = (amount: number) => (
    <FinancialText>
      <PrivacyFilter>{format(amount, 'financial')}</PrivacyFilter>
    </FinancialText>
  );
  const { group } = segment;

  if (!group) {
    return (
      <View>
        <strong>
          <Trans>Not budgeted yet</Trans>
        </strong>
        <span>{money(segment.amount)}</span>
      </View>
    );
  }

  return (
    <View style={{ gap: 2 }}>
      <strong>{group.name}</strong>
      <span>
        <Trans>Budgeted:</Trans> {money(group.budgeted)}
      </span>
      <span>
        <Trans>Goals need:</Trans> {money(group.needed)}
      </span>
      {group.shortfall > 0 && (
        <span>
          <Trans>Still to fund:</Trans> {money(group.shortfall)}
        </span>
      )}
    </View>
  );
}
