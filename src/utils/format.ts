/**
 * Deterministic price formatter to prevent React hydration mismatch errors.
 * Always formats thousands with dot separator (Turkish/European standard).
 */
export function formatPrice(price: number): string {
  if (price === undefined || price === null) return '0';
  return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}
