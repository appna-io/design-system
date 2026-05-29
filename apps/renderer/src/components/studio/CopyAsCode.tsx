'use client';

import { useThemeOverrides } from 'apx-ds';
import { Check, Copy } from 'lucide-react';
import { useState } from 'react';

import { serializeOverridesToTs } from './serialize';

/**
 * Inline snippet panel — shown at the bottom of the Studio drawer. Renders the current
 * override object as a `defineTheme({ … })` source snippet a consumer can paste into their app
 * to lock the look in.
 */
export function CopyAsCode() {
  const { overrides, hasOverrides } = useThemeOverrides();
  const [copied, setCopied] = useState(false);
  const snippet = serializeOverridesToTs(overrides);

  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(snippet);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* ignore — clipboard blocked */
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs text-fg-muted">
          {hasOverrides
            ? 'Paste this into your app to lock in the look you just designed.'
            : 'No overrides applied yet — the snippet is a no-op until you edit something.'}
        </p>
        <button
          type="button"
          onClick={onCopy}
          className="inline-flex items-center gap-1.5 rounded-md border border-border bg-bg-paper px-2.5 py-1 text-xs font-medium text-fg transition hover:bg-bg-subtle disabled:opacity-40"
          aria-label="Copy snippet"
        >
          {copied ? (
            <>
              <Check size={12} aria-hidden /> Copied
            </>
          ) : (
            <>
              <Copy size={12} aria-hidden /> Copy
            </>
          )}
        </button>
      </div>
      <pre className="max-h-64 overflow-auto rounded-md border border-border bg-bg-subtle p-3 font-mono text-[11px] leading-relaxed text-fg">
        {snippet}
      </pre>
    </div>
  );
}
