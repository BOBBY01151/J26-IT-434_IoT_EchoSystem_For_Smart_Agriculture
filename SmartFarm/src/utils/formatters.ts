// Shared formatting helpers for display values

/** Format a litre value to one decimal place */
export function formatLitres(value: number): string {
  return `${value.toFixed(1)} L`;
}

/** Format a percentage to one decimal place */
export function formatPercent(value: number): string {
  return `${value.toFixed(1)}%`;
}

/** Format a temperature value */
export function formatTemp(value: number, unit: 'C' | 'F' = 'C'): string {
  if (unit === 'F') {
    return `${((value * 9) / 5 + 32).toFixed(1)} °F`;
  }
  return `${value.toFixed(1)} °C`;
}

/** Truncate a long string with an ellipsis */
export function truncate(str: string, maxLen: number): string {
  if (str.length <= maxLen) return str;
  return str.slice(0, maxLen - 1) + '…';
}

/** Generate a unique enough ID for local state items */
export function generateId(prefix = 'item'): string {
  return `${prefix}-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
}
