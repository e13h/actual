import type { CSSProperties } from '@actual-app/components/styles';

/** Column widths shared by the Budget Plan table header and rows. */
export const budgetPlanColumns = {
  name: { flex: '1.4 1 0', minWidth: 140, overflow: 'hidden' },
  amount: { width: 96, textAlign: 'right', flexShrink: 0 },
  percent: { width: 64, textAlign: 'right', flexShrink: 0 },
  bar: { flex: '2 1 0', minWidth: 120, padding: '0 16px' },
  status: { width: 110, flexShrink: 0 },
} satisfies Record<string, CSSProperties>;

export const budgetPlanRowStyle: CSSProperties = {
  flexDirection: 'row',
  alignItems: 'center',
  padding: '6px 0',
};
