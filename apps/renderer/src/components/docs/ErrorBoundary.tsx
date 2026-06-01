'use client';

import { Component, type ErrorInfo, type ReactNode } from 'react';

interface PreviewBoundaryProps {
  children: ReactNode;
  /** Label of the example being rendered, used in the fallback UI. */
  label?: string;
}

interface PreviewBoundaryState {
  error: Error | null;
}

/**
 * Wraps each example preview so a runtime error inside the DS doesn't take down the renderer
 * chrome. The fallback is intentionally chrome-style (plain Tailwind) rather than DS-style.
 */
export class PreviewBoundary extends Component<PreviewBoundaryProps, PreviewBoundaryState> {
  override state: PreviewBoundaryState = { error: null };

  static getDerivedStateFromError(error: Error): PreviewBoundaryState {
    return { error };
  }

  override componentDidCatch(error: Error, info: ErrorInfo): void {
    if (process.env.NODE_ENV !== 'production') {
      console.error('[renderer] preview crashed', { error, info });
    }
  }

  override render(): ReactNode {
    const { error } = this.state;
    const { children, label } = this.props;
    if (!error) return children;
    return (
      <div
        role="alert"
        className="rounded-md border border-danger bg-danger-subtle p-4 text-sm text-danger"
      >
        <p className="font-semibold">
          {label ? `Example "${label}" failed to render` : 'Preview failed to render'}
        </p>
        <pre className="mt-2 whitespace-pre-wrap text-xs">{error.message}</pre>
      </div>
    );
  }
}