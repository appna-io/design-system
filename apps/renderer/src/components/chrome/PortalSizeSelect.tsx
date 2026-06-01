'use client';

import { Maximize2, Monitor, Smartphone, Tablet } from 'lucide-react';
import { useEffect, useId, useRef, useState, type ChangeEvent, type FocusEvent } from 'react';

import { cn } from '../primitives/cn';
import {
  PORTAL_SIZE_MAX,
  PORTAL_SIZE_MIN,
  usePortalSize,
  type PortalSizePreset,
} from './portal-size-context';

interface PresetDef {
  value: PortalSizePreset;
  label: string;
  icon: typeof Monitor;
  description: string;
}

const PRESETS: readonly PresetDef[] = [
  { value: 'mobile', label: 'Mobile', icon: Smartphone, description: 'Simulate ~390px viewport' },
  { value: 'tablet', label: 'Tablet', icon: Tablet, description: 'Simulate ~820px viewport' },
  { value: 'default', label: 'Default', icon: Monitor, description: 'Fill the available width' },
  { value: 'custom', label: 'Custom', icon: Maximize2, description: 'Type an exact width in px' },
] as const;

/**
 * Segmented switch for the renderer toolbars that pins the content area to a simulated viewport
 * width. "Default" stays unbounded so the docs/preview behave exactly as before; the device
 * presets and the "Custom" option route their width through `PortalSizeProvider` to a
 * `<PortalFrame>` further down the tree.
 *
 * The custom-width input is rendered inline next to the segmented control whenever the
 * `custom` preset is active, so the user never has to dive into a menu to tweak the value.
 */
export function PortalSizeSelect() {
  const { preset, setPreset, customWidth, setCustomWidth } = usePortalSize();

  return (
    <div className="inline-flex items-center gap-2">
      <div
        role="radiogroup"
        aria-label="Preview viewport size"
        className="inline-flex items-center rounded-md border border-border bg-bg-paper p-0.5"
      >
        {PRESETS.map(({ value, label, icon: Icon, description }) => {
          const active = preset === value;
          return (
            <button
              key={value}
              type="button"
              role="radio"
              aria-checked={active}
              aria-label={label}
              title={description}
              onClick={() => setPreset(value)}
              className={cn(
                'inline-flex h-7 w-7 items-center justify-center rounded transition',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
                active ? 'bg-bg text-fg shadow-sm' : 'text-fg-muted hover:text-fg',
              )}
            >
              <Icon size={14} aria-hidden />
            </button>
          );
        })}
      </div>
      {preset === 'custom' ? (
        <CustomWidthInput value={customWidth} onCommit={setCustomWidth} />
      ) : null}
    </div>
  );
}

interface CustomWidthInputProps {
  value: number;
  onCommit: (width: number) => void;
}

/**
 * Tiny number input that commits on blur / Enter. We keep the input value as a string locally so
 * users can clear it while typing without snapping the live preview to the clamped minimum on
 * every keystroke — the commit path is the only place that round-trips through the context's
 * clamp. Pairing it with the px suffix keeps the unit unambiguous in a crowded toolbar.
 */
function CustomWidthInput({ value, onCommit }: CustomWidthInputProps) {
  const inputId = useId();
  const [draft, setDraft] = useState(() => String(value));
  const lastExternal = useRef(value);

  useEffect(() => {
    if (lastExternal.current !== value) {
      setDraft(String(value));
      lastExternal.current = value;
    }
  }, [value]);

  function commit() {
    const parsed = Number.parseInt(draft, 10);
    if (!Number.isFinite(parsed)) {
      setDraft(String(value));
      return;
    }
    onCommit(parsed);
    lastExternal.current = parsed;
    setDraft(String(parsed));
  }

  function handleChange(e: ChangeEvent<HTMLInputElement>) {
    setDraft(e.target.value);
  }

  function handleBlur(_e: FocusEvent<HTMLInputElement>) {
    commit();
  }

  return (
    <label
      htmlFor={inputId}
      className="inline-flex items-center gap-1 rounded-md border border-border bg-bg-paper px-2 py-1 text-xs text-fg-muted"
    >
      <input
        id={inputId}
        type="number"
        inputMode="numeric"
        min={PORTAL_SIZE_MIN}
        max={PORTAL_SIZE_MAX}
        value={draft}
        onChange={handleChange}
        onBlur={handleBlur}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.preventDefault();
            commit();
            (e.target as HTMLInputElement).blur();
          }
        }}
        aria-label="Custom viewport width in pixels"
        className={cn(
          'w-14 bg-transparent text-right text-sm font-medium text-fg outline-none',
          '[appearance:textfield]',
          '[&::-webkit-inner-spin-button]:m-0 [&::-webkit-inner-spin-button]:appearance-none',
          '[&::-webkit-outer-spin-button]:m-0 [&::-webkit-outer-spin-button]:appearance-none',
        )}
      />
      <span aria-hidden>px</span>
    </label>
  );
}