import React from 'react';
import { Trans } from 'react-i18next';

import { theme } from '@actual-app/components/theme';
import { View } from '@actual-app/components/view';

import { fundedColor, unfundedFill } from './budgetPlanColors';

const swatch = {
  width: 14,
  height: 10,
  borderRadius: 2,
  marginRight: 6,
};

export function FundingLadderLegend() {
  return (
    <View
      style={{
        flexDirection: 'row',
        gap: 16,
        fontSize: 12,
        color: theme.pageTextSubdued,
        marginTop: 4,
      }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <View style={{ ...swatch, background: fundedColor }} />
        <Trans>Budgeted</Trans>
      </View>
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <View
          style={{
            ...swatch,
            background: unfundedFill,
            border: `1px solid ${theme.reportsGray}`,
          }}
        />
        <Trans>Goal not yet funded</Trans>
      </View>
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <View
          style={{
            width: 0,
            height: 12,
            borderLeft: `2px solid ${theme.pageText}`,
            marginRight: 6,
          }}
        />
        <Trans>Money available</Trans>
      </View>
    </View>
  );
}
