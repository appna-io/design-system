'use client';

import { usePlatform, useVariant } from 'apx-ds';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../primitives/Select';

const OPTIONS = [
  { value: 'default', label: 'Default' },
  { value: 'tetsu', label: 'Tetsu' },
  { value: 'origami', label: 'Origami' },
  { value: 'katana', label: 'Katana' },
] as const;

export function VariantSelect() {
  const { variant, setVariant } = useVariant();
  const { platform } = usePlatform();
  const isAdaptive = variant === 'default';

  return (
    <div className="flex items-center gap-2">
      <span className="text-xs font-medium text-fg-muted">Variant</span>
      <Select value={variant} onValueChange={setVariant}>
        <SelectTrigger className="min-w-[140px]" aria-label="Theme variant">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {OPTIONS.map((opt) => (
            <SelectItem key={opt.value} value={opt.value}>
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {isAdaptive ? (
        <span
          className="rounded-full border border-border bg-bg-subtle px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-fg-muted"
          title={
            platform === 'apple'
              ? 'Adaptive: Safari → Cupertino overlay active'
              : 'Adaptive: non-Safari → apx-base look'
          }
        >
          {platform === 'apple' ? '↳ apple' : '↳ other'}
        </span>
      ) : null}
    </div>
  );
}
