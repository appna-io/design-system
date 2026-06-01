/**
 * Locale-aware byte formatter via `Intl.NumberFormat` + a compact unit suffix.
 */
export function formatBytes(bytes: number, locale = 'en-US'): string {
  if (!Number.isFinite(bytes) || bytes < 0) return '0 B';
  if (bytes === 0) return '0 B';

  const units = ['B', 'KB', 'MB', 'GB', 'TB'] as const;
  const exponent = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  const value = bytes / 1024 ** exponent;
  const formatter = new Intl.NumberFormat(locale, {
    maximumFractionDigits: exponent === 0 ? 0 : 1,
  });
  return `${formatter.format(value)} ${units[exponent]}`;
}