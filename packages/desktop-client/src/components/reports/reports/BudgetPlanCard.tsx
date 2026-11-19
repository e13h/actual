import React, { useMemo, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';

import { useResponsive } from '@actual-app/components/hooks/useResponsive';
import { styles } from '@actual-app/components/styles';
import { theme } from '@actual-app/components/theme';
import { View } from '@actual-app/components/view';
import * as monthUtils from '@actual-app/core/shared/months';
import type { BudgetPlanWidget } from '@actual-app/core/types/models';

import { FinancialText } from '#components/FinancialText';
import { PrivacyFilter } from '#components/PrivacyFilter';
import { FundingLadderGraph } from '#components/reports/graphs/FundingLadderGraph';
import { LoadingIndicator } from '#components/reports/LoadingIndicator';
import { ReportCard } from '#components/reports/ReportCard';
import { ReportCardName } from '#components/reports/ReportCardName';
import { createBudgetPlanSpreadsheet } from '#components/reports/spreadsheets/budget-plan-spreadsheet';
import { useReport } from '#components/reports/useReport';
import { useFormat } from '#hooks/useFormat';
import { useLocale } from '#hooks/useLocale';

type BudgetPlanCardProps = {
  widgetId: string;
  isEditing?: boolean;
  meta?: BudgetPlanWidget['meta'];
  onMetaChange: (newMeta: BudgetPlanWidget['meta']) => void;
};

export function BudgetPlanCard({
  widgetId,
  isEditing,
  meta = {},
  onMetaChange,
}: BudgetPlanCardProps) {
  const { t } = useTranslation();
  const locale = useLocale();
  const format = useFormat();
  const { isNarrowWidth } = useResponsive();
  const [nameMenuOpen, setNameMenuOpen] = useState(false);

  const month = monthUtils.currentMonth();
  const getData = useMemo(
    () => createBudgetPlanSpreadsheet({ month }),
    [month],
  );
  const data = useReport('budget_plan', getData);
  const gap = data ? data.funds - data.needed : 0;

  return (
    <ReportCard
      widgetId={widgetId}
      isEditing={isEditing}
      disableClick={nameMenuOpen}
      to={`/reports/budget-plan/${widgetId}`}
      onRename={() => setNameMenuOpen(true)}
    >
      <View style={{ flex: 1, padding: 20 }}>
        <View style={{ flexDirection: 'row' }}>
          <View style={{ flex: 1 }}>
            <ReportCardName
              name={meta?.name || t('Budget Plan')}
              isEditing={nameMenuOpen}
              onChange={newName => {
                onMetaChange({ ...meta, name: newName });
                setNameMenuOpen(false);
              }}
              onClose={() => setNameMenuOpen(false)}
            />
            <View style={{ fontSize: 12, color: theme.pageTextSubdued }}>
              {monthUtils.format(month, 'MMMM yyyy', locale)}
            </View>
          </View>
          {data && (
            <View style={{ textAlign: 'right' }}>
              <FinancialText
                style={{
                  ...styles.mediumText,
                  fontWeight: 500,
                  color: gap < 0 ? theme.warningText : theme.noticeText,
                }}
              >
                <PrivacyFilter>
                  {format(Math.abs(gap), 'financial')}
                </PrivacyFilter>
              </FinancialText>
              <View style={{ fontSize: 12, color: theme.pageTextSubdued }}>
                {gap < 0 ? (
                  <Trans>short of goals</Trans>
                ) : (
                  <Trans>left after goals</Trans>
                )}
              </View>
            </View>
          )}
        </View>
        <View style={{ flex: 1, justifyContent: 'center' }}>
          {data ? (
            <FundingLadderGraph
              data={data}
              compact
              showTooltip={!isEditing && !isNarrowWidth}
            />
          ) : (
            <LoadingIndicator />
          )}
        </View>
      </View>
    </ReportCard>
  );
}
