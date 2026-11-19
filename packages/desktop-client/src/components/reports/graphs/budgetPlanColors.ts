import { theme } from '@actual-app/components/theme';

/** Money that is budgeted. One hue; segments alternate opacity. */
export const fundedColor = theme.reportsBlue;

/** Goal amounts that aren't budgeted yet: a neutral hatch, not a hue. */
export const unfundedFill = `repeating-linear-gradient(135deg, ${theme.reportsGray} 0 2px, transparent 2px 6px)`;

/** Spending beyond what a category had available. */
export const overspentColor = theme.reportsRed;
