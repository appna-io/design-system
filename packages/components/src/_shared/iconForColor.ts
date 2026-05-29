import type { LucideIcon } from 'lucide-react';
import {
  AlertOctagon,
  AlertTriangle,
  CheckCircle2,
  Info,
  MessageCircle,
} from 'lucide-react';

/**
 * Status color → leading-icon mapping for feedback surfaces. Extracted in Phase 15 (Alert) as the
 * first consumer; future Toast / Banner / Inline-error reuse it without re-mapping.
 *
 * Why a map instead of an if/switch per consumer? Because every status surface answers the same
 * question — "what icon represents `success`?" — and the answer needs to stay consistent across
 * the DS. Centralizing it also means a theme override (`theme.components.Alert.icons`) can swap
 * the whole set in one place.
 *
 * The five colors mirror Alert's constrained color set (`info` / `success` / `warning` / `danger`
 * / `neutral`) — the brand colors (`primary`, `secondary`) are intentionally **not** in this map
 * because they don't carry a status meaning.
 */
export type StatusColor = 'info' | 'success' | 'warning' | 'danger' | 'neutral';

export const iconForColor: Record<StatusColor, LucideIcon> = {
  info: Info,
  success: CheckCircle2,
  warning: AlertTriangle,
  danger: AlertOctagon,
  neutral: MessageCircle,
};
