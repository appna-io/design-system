import { describe, expect, it } from 'vitest';

import { formatTimestamp } from '../src/Timeline';

const now = new Date('2026-05-21T10:00:00Z');

describe('formatTimestamp', () => {
  it('returns null text for null/undefined value', () => {
    expect(formatTimestamp({ value: null }).text).toBeNull();
    expect(formatTimestamp({ value: undefined }).text).toBeNull();
  });

  it('passes strings through unchanged with no ISO', () => {
    const out = formatTimestamp({ value: 'Yesterday' });
    expect(out.text).toBe('Yesterday');
    expect(out.isoDateTime).toBeNull();
  });

  it('handles invalid Date by hiding the slot', () => {
    expect(formatTimestamp({ value: new Date('not a date') }).text).toBeNull();
  });

  it('produces ISO datetime for valid Dates', () => {
    const d = new Date('2026-05-12T09:14:00Z');
    const out = formatTimestamp({ value: d, format: 'absolute', locale: 'en-US', now });
    expect(out.isoDateTime).toBe(d.toISOString());
    expect(out.text).toMatch(/May/);
  });

  it('relative format: minutes ago', () => {
    const d = new Date(now.getTime() - 5 * 60_000);
    const out = formatTimestamp({ value: d, format: 'relative', locale: 'en-US', now });
    expect(out.text).toMatch(/5 minutes ago|minutes ago/);
  });

  it('relative format: days ago', () => {
    const d = new Date(now.getTime() - 3 * 86_400_000);
    const out = formatTimestamp({ value: d, format: 'relative', locale: 'en-US', now });
    expect(out.text).toMatch(/3 days ago/);
  });

  it('relative format: future (positive direction)', () => {
    const d = new Date(now.getTime() + 2 * 86_400_000);
    const out = formatTimestamp({ value: d, format: 'relative', locale: 'en-US', now });
    expect(out.text).toMatch(/in 2 days|2 days/);
  });

  it('respects custom function format', () => {
    const d = new Date('2026-05-12T09:14:00Z');
    const out = formatTimestamp({ value: d, format: (v) => `T+${v.toISOString()}`, now });
    expect(out.text).toBe(`T+${d.toISOString()}`);
  });

  it('honors locale for relative output (de-DE)', () => {
    const d = new Date(now.getTime() - 3 * 86_400_000);
    const out = formatTimestamp({ value: d, format: 'relative', locale: 'de-DE', now });
    expect(out.text).toMatch(/vor 3 Tagen/);
  });
});
