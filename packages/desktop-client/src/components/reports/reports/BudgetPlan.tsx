import React, { useMemo, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { useParams } from 'react-router';

import { useResponsive } from '@actual-app/components/hooks/useResponsive';
import { Paragraph } from '@actual-app/components/paragraph';
import { Select } from '@actual-app/components/select';
import { theme } from '@actual-app/components/theme';
import { View } from '@actual-app/components/view';
import * as monthUtils from '@actual-app/core/shared/months';
import type { BudgetPlanWidget } from '@actual-app/core/types/models';
import { useQuery } from '@tanstack/react-query';

import { budgetBoundsQueries } from '#budget/queries';
import { EditablePageHeaderTitle } from '#components/EditablePageHeaderTitle';
import { MobileBackButton } from '#components/mobile/MobileBackButton';
import { MobilePageHeader, Page, PageHeader } from '#components/Page';
import { BudgetPlanCategoryTable } from '#components/reports/graphs/BudgetPlanCategoryTable';
import { BudgetPlanSummary } from '#components/reports/graphs/BudgetPlanSummary';
import { FundingLadderGraph } from '#components/reports/graphs/FundingLadderGraph';
import { LoadingIndicator } from '#components/reports/LoadingIndicator';
import { createBudgetPlanSpreadsheet } from '#components/reports/spreadsheets/budget-plan-spreadsheet';
import { useReport } from '#components/reports/useReport';
import { useDashboardWidget } from '#hooks/useDashboardWidget';
import { useLocale } from '#hooks/useLocale';
import { useNavigate } from '#hooks/useNavigate';
import { useSyncedPref } from '#hooks/useSyncedPref';
import { useUpdateDashboardWidgetMutation } from '#reports/mutations';

export function BudgetPlan() {
  const params = useParams();
  const { data: widget, isLoading } = useDashboardWidget<BudgetPlanWidget>({
    id: params.id,
    type: 'budget-plan-card',
  });

  if (isLoading) {
    return <LoadingIndicator />;
  }

  return <BudgetPlanInner widget={widget} />;
}

type BudgetPlanInnerProps = {
  widget?: BudgetPlanWidget;
};

function BudgetPlanInner({ widget }: BudgetPlanInnerProps) {
  const { t } = useTranslation();
  const locale = useLocale();
  const navigate = useNavigate();
  const { isNarrowWidth } = useResponsive();
  const [budgetType] = useSyncedPref('budgetType');
  const [month, setMonth] = useState(monthUtils.currentMonth());
  const { data: bounds } = useQuery(budgetBoundsQueries.bounds());

  const monthOptions = useMemo(() => {
    const start = bounds?.start ?? month;
    const end = bounds?.end ?? month;
    return monthUtils
      .rangeInclusive(start, end)
      .reverse()
      .map(m => [m, monthUtils.format(m, 'MMMM yyyy', locale)] as const);
  }, [bounds, month, locale]);

  const getData = useMemo(
    () => createBudgetPlanSpreadsheet({ month }),
    [month],
  );
  const data = useReport('budget_plan', getData);

  const updateDashboardWidgetMutation = useUpdateDashboardWidgetMutation();
  const title = widget?.meta?.name || t('Budget Plan');
  const onSaveWidgetName = async (newName: string) => {
    if (!widget) {
      throw new Error('No widget that could be saved.');
    }
    await updateDashboardWidgetMutation.mutateAsync({
      widget: {
        id: widget.id,
        meta: { ...(widget.meta ?? {}), name: newName || t('Budget Plan') },
      },
    });
  };

  const isTracking = budgetType === 'tracking';

  return (
    <Page
      header={
        isNarrowWidth ? (
          <MobilePageHeader
            title={title}
            leftContent={
              <MobileBackButton onPress={() => navigate('/reports')} />
            }
          />
        ) : (
          <PageHeader
            title={
              widget ? (
                <EditablePageHeaderTitle
                  title={title}
                  onSave={onSaveWidgetName}
                />
              ) : (
                title
              )
            }
          />
        )
      }
      padding={0}
    >
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: 8,
          padding: 20,
          paddingTop: 0,
        }}
      >
        <Trans>Month:</Trans>
        <Select
          value={month}
          onChange={setMonth}
          options={monthOptions}
          style={{ width: 160 }}
        />
      </View>

      <View
        style={{
          backgroundColor: theme.tableBackground,
          padding: 20,
          flex: '1 0 auto',
          overflow: 'auto',
          gap: 28,
        }}
      >
        {isTracking ? (
          <Paragraph>
            <Trans>
              The Budget Plan report works with envelope budgeting. Tracking
              budgets have no money to assign or goals to fund.
            </Trans>
          </Paragraph>
        ) : !data ? (
          <LoadingIndicator />
        ) : (
          <>
            <BudgetPlanSummary data={data} />
            <View>
              <View style={{ fontWeight: 600, marginBottom: 4 }}>
                <Trans>How far this month's money goes</Trans>
              </View>
              <FundingLadderGraph data={data} />
            </View>
            <View>
              <View style={{ fontWeight: 600, marginBottom: 4 }}>
                <Trans>Categories</Trans>
              </View>
              <View
                style={{
                  fontSize: 12,
                  color: theme.pageTextSubdued,
                  marginBottom: 8,
                }}
              >
                <Trans>
                  Share is budgeted ÷ money available. Bars show spending
                  against what each category has available (carried over plus
                  budgeted). The solid tick marks the goal; the dashed line
                  marks how far through the month you are.
                </Trans>
              </View>
              <BudgetPlanCategoryTable data={data} />
            </View>
          </>
        )}
      </View>
    </Page>
  );
}
