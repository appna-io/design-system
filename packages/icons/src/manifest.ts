import { ArrowUpRight } from './icons/ArrowUpRight';
import { Check } from './icons/Check';
import { ChevronDown } from './icons/ChevronDown';
import { ChevronRight } from './icons/ChevronRight';
import { Close } from './icons/Close';
import { ErrorCircle } from './icons/ErrorCircle';
import { ExternalLink } from './icons/ExternalLink';
import { Info } from './icons/Info';
import { Minus } from './icons/Minus';
import { Plus } from './icons/Plus';
import { Search } from './icons/Search';
import { Warning } from './icons/Warning';
import type { IconComponent } from './types';

/**
 * Stable, ordered list of every icon shipped by this package. The renderer's
 * `/icons` route iterates this manifest to build its searchable preview grid;
 * tests use it to drive snapshot coverage across the full set without having
 * to enumerate icons by hand.
 *
 * Consumers should still import icons by name from the package root — the
 * manifest is metadata, not a runtime registry. Importing it does not change
 * tree-shaking behaviour because it only references components that already
 * have to ship as named exports.
 */
export interface IconManifestEntry {
  /** Component name (also exposed as `Component.iconName`). */
  name: string;
  /** The icon component itself. */
  Component: IconComponent;
  /** Short, human-readable description used for searching and tooltips. */
  description: string;
  /** Search synonyms — keep these lowercase. */
  keywords: readonly string[];
}

export const ICON_MANIFEST: readonly IconManifestEntry[] = [
  {
    name: 'ArrowUpRight',
    Component: ArrowUpRight,
    description: 'Diagonal arrow pointing to the top-right corner.',
    keywords: ['arrow', 'open', 'external', 'navigate', 'link'],
  },
  {
    name: 'Check',
    Component: Check,
    description: 'Confirmation check mark.',
    keywords: ['check', 'tick', 'done', 'success', 'complete'],
  },
  {
    name: 'ChevronDown',
    Component: ChevronDown,
    description: 'Down-pointing chevron, used for expand / collapse affordances.',
    keywords: ['chevron', 'down', 'expand', 'collapse', 'caret', 'arrow'],
  },
  {
    name: 'ChevronRight',
    Component: ChevronRight,
    description: 'Right-pointing chevron, used for navigation affordances.',
    keywords: ['chevron', 'right', 'next', 'forward', 'caret', 'arrow'],
  },
  {
    name: 'Close',
    Component: Close,
    description: 'X mark used for dismissing dialogs, banners, and tags.',
    keywords: ['close', 'x', 'dismiss', 'cancel', 'remove'],
  },
  {
    name: 'ErrorCircle',
    Component: ErrorCircle,
    description: 'Filled-style alert circle indicating a destructive or error state.',
    keywords: ['error', 'alert', 'danger', 'destructive', 'failure'],
  },
  {
    name: 'ExternalLink',
    Component: ExternalLink,
    description: 'Box-with-arrow indicating navigation to an external page.',
    keywords: ['external', 'link', 'open', 'new tab', 'leave'],
  },
  {
    name: 'Info',
    Component: Info,
    description: 'Information indicator for hints and contextual notes.',
    keywords: ['info', 'information', 'help', 'tooltip', 'hint'],
  },
  {
    name: 'Minus',
    Component: Minus,
    description: 'Subtractive symbol, often paired with `Plus` for steppers.',
    keywords: ['minus', 'subtract', 'remove', 'decrement', 'collapse'],
  },
  {
    name: 'Plus',
    Component: Plus,
    description: 'Additive symbol used for creation and expansion controls.',
    keywords: ['plus', 'add', 'new', 'increment', 'create', 'expand'],
  },
  {
    name: 'Search',
    Component: Search,
    description: 'Magnifying glass used in search inputs and command palettes.',
    keywords: ['search', 'find', 'lookup', 'magnify', 'filter'],
  },
  {
    name: 'Warning',
    Component: Warning,
    description: 'Triangle warning used for cautionary messages.',
    keywords: ['warning', 'caution', 'alert', 'attention'],
  },
] as const;