'use client';

import { useCallback, useState } from 'react';

import { cn } from './cn';

interface CopyButtonProps {
  text: string;
  className?: string;
}

export function CopyButton({ text, className }: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  const onClick = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // clipboard write can fail in insecure contexts — silently noop, the source is still visible
    }
  }, [text]);

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={copied ? 'Copied to clipboard' : 'Copy code to clipboard'}
      className={cn(
        'inline-flex items-center gap-1.5 rounded-md border border-border bg-bg-paper px-2.5 py-1 text-xs font-medium text-fg-muted transition',
        'hover:text-fg hover:bg-neutral-subtle',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
        className,
      )}
    >
      {copied ? 'Copied' : 'Copy'}
    </button>
  );
}