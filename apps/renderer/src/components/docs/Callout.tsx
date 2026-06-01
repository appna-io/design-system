import { AlertCircle, AlertTriangle, Info, XCircle } from 'lucide-react';
import type { ReactNode } from 'react';

import { cn } from '../primitives/cn';

type CalloutType = 'info' | 'warning' | 'danger' | 'success';

interface CalloutProps {
  type?: CalloutType;
  title?: string;
  children: ReactNode;
}

const STYLES: Record<CalloutType, { wrap: string; icon: typeof Info }> = {
  info: { wrap: 'border-primary bg-primary-subtle text-primary', icon: Info },
  warning: { wrap: 'border-warning bg-warning-subtle text-warning', icon: AlertTriangle },
  danger: { wrap: 'border-danger bg-danger-subtle text-danger', icon: XCircle },
  success: { wrap: 'border-success bg-success-subtle text-success', icon: AlertCircle },
};

export function Callout({ type = 'info', title, children }: CalloutProps) {
  const { wrap, icon: Icon } = STYLES[type];
  return (
    <aside className={cn('my-6 flex items-start gap-3 rounded-lg border p-4', wrap)}>
      <Icon aria-hidden size={18} className="mt-0.5 shrink-0" />
      <div className="flex-1">
        {title && <p className="mb-1 text-sm font-semibold">{title}</p>}
        <div className="text-sm leading-relaxed">{children}</div>
      </div>
    </aside>
  );
}