/** A share of the month's funds as a percentage, e.g. "19.3%". */
export function formatShare(amount: number, funds: number) {
  if (funds <= 0) {
    return '–';
  }
  return `${((amount / funds) * 100).toFixed(1)}%`;
}
