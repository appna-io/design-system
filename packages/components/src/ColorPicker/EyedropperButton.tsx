'use client';

import { useThemedClasses } from '@apx-ui/theme';
import { useCallback, useEffect, useState } from 'react';

import { parseColor, rgbaToHsva } from './_shared/color';
import { useColorPickerContext } from './ColorPicker.context';
import { colorPickerRecipes } from './ColorPicker.recipe';

interface EyeDropperApi {
  open(): Promise<{ sRGBHex: string }>;
}
interface EyeDropperCtor {
  new (): EyeDropperApi;
}

declare global {
  interface Window {
    EyeDropper?: EyeDropperCtor;
  }
}

/**
 * Render an eyedropper button — but only when the browser actually ships the `EyeDropper`
 * API. As of 2026 it's still Chromium-only, so we hide the button entirely in other browsers
 * (rather than disable it) so AT users in Firefox / Safari don't hear a control they can't use.
 *
 * The "support" check runs in a `useEffect` so SSR + the first client render agree on the
 * disabled-tree state (avoids hydration mismatch when the server has no `window`). Once the
 * effect commits we either reveal or stay hidden.
 */
export function EyedropperButton() {
  const ctx = useColorPickerContext('EyedropperButton');
  const { commitHsva, hsva, t, disabled, readOnly } = ctx;
  const [supported, setSupported] = useState(false);

  useEffect(() => {
    setSupported(typeof window !== 'undefined' && typeof window.EyeDropper === 'function');
  }, []);

  const { className: btnCls } = useThemedClasses({
    recipe: colorPickerRecipes.eyedropperBtn,
    componentName: 'ColorPicker',
    slot: 'eyedropperBtn',
    props: {},
  });

  const open = useCallback(async () => {
    if (disabled || readOnly) return;
    const Ctor = typeof window !== 'undefined' ? window.EyeDropper : undefined;
    if (!Ctor) return;
    try {
      const dropper = new Ctor();
      const result = await dropper.open();
      const rgba = parseColor(result.sRGBHex);
      const next = rgbaToHsva(rgba);
      if (next.s === 0) next.h = hsva.h;
      commitHsva(next, 'eyedropper');
    } catch {
      // User aborted the eyedropper — silent. The browser handles its own UX.
    }
  }, [disabled, readOnly, commitHsva, hsva.h]);

  if (!supported) return null;

  return (
    <button
      type="button"
      className={btnCls}
      disabled={disabled || readOnly}
      aria-label={t.eyedropper}
      title={t.eyedropper}
      onClick={open}
    >
      <EyedropperIcon />
    </button>
  );
}

function EyedropperIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M9 4.5 11.5 7 6 12.5 2.5 13l.5-3.5L9 4.5Z" />
      <path d="M10 3.5 12.5 6l1.25-1.25a1.768 1.768 0 0 0-2.5-2.5L10 3.5Z" />
    </svg>
  );
}
