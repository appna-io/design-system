import { useState } from 'react';
import { Button, Div, Typography, confirm } from '@apx-ui/ds';
import type { ConfirmVariant } from '@apx-ui/ds';

/**
 * Overview — one button per variant. Each fires `confirm.display(...)` against the global
 * `<ConfirmProvider>` host mounted in the app shell, then awaits the user's choice. We render
 * the most recent outcome below the row so consumers can see the resolved boolean.
 */

interface VariantDef {
  variant: ConfirmVariant;
  title: string;
  description: string;
  confirmText: string;
}

const VARIANTS: VariantDef[] = [
  {
    variant: 'default',
    title: 'Apply preset?',
    description: 'This will overwrite your current layout.',
    confirmText: 'Apply',
  },
  {
    variant: 'info',
    title: 'Switch workspace?',
    description: 'Your current draft will stay where it is.',
    confirmText: 'Switch',
  },
  {
    variant: 'success',
    title: 'Publish changes?',
    description: 'Your team will see the update right away.',
    confirmText: 'Publish',
  },
  {
    variant: 'warning',
    title: 'Reset all filters?',
    description: 'Your current selection will be cleared.',
    confirmText: 'Reset',
  },
  {
    variant: 'error',
    title: 'Delete project?',
    description: 'This action is permanent and cannot be undone.',
    confirmText: 'Yes, delete',
  },
];

export default function Overview() {
  const [lastResult, setLastResult] = useState<{ variant: ConfirmVariant; ok: boolean } | null>(
    null,
  );

  return (
    <Div display="flex" flexDirection="column" gap="3">
      <Typography variant="body" color="fg.muted">
        Click any button to open a confirm dialog via{' '}
        <code>confirm.display(&#123; variant, ... &#125;)</code>. The returned promise resolves
        with <code>true</code> when the user clicks confirm, or <code>false</code> when they
        cancel, press <kbd>Esc</kbd>, or click the backdrop.
      </Typography>

      <Div display="flex" flexWrap="wrap" gap="2">
        {VARIANTS.map((v) => (
          <Button
            key={v.variant}
            variant="outline"
            onClick={async () => {
              const ok = await confirm.display({
                variant: v.variant,
                title: v.title,
                description: v.description,
                confirmText: v.confirmText,
              });
              setLastResult({ variant: v.variant, ok });
            }}
          >
            {v.variant.charAt(0).toUpperCase() + v.variant.slice(1)}
          </Button>
        ))}
      </Div>

      {lastResult ? (
        <Typography variant="caption" color="fg.muted">
          Last result: <strong>{lastResult.variant}</strong> →{' '}
          <code>{String(lastResult.ok)}</code>
        </Typography>
      ) : null}
    </Div>
  );
}