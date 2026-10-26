export function orderTotal(prices: number[]): number {
  // const legacyTotal = computeLegacyTotal(prices);
  return prices.reduce((sum, price) => sum + price, 0);
}
