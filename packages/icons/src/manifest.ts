import { ArrowUpRight } from './icons/ArrowUpRight';
import { Award } from './icons/Award';
import { BadgeCheck } from './icons/BadgeCheck';
import { Check } from './icons/Check';
import { ChevronDown } from './icons/ChevronDown';
import { ChevronRight } from './icons/ChevronRight';
import { Clock } from './icons/Clock';
import { Close } from './icons/Close';
import { ErrorCircle } from './icons/ErrorCircle';
import { ExternalLink } from './icons/ExternalLink';
import { Fingerprint } from './icons/Fingerprint';
import { GraduationCap } from './icons/GraduationCap';
import { Heart } from './icons/Heart';
import { Info } from './icons/Info';
import { KeyRound } from './icons/KeyRound';
import { Mail } from './icons/Mail';
import { MapPin } from './icons/MapPin';
import { Minus } from './icons/Minus';
import { Phone } from './icons/Phone';
import { Plus } from './icons/Plus';
import { Search } from './icons/Search';
import { ShieldCheck } from './icons/ShieldCheck';
import { Smartphone } from './icons/Smartphone';
import { Smile } from './icons/Smile';
import { Star } from './icons/Star';
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
    name: 'Award',
    Component: Award,
    description: 'Ribbon award medal for achievements and recognition.',
    keywords: ['award', 'medal', 'achievement', 'prize', 'recognition', 'winner'],
  },
  {
    name: 'BadgeCheck',
    Component: BadgeCheck,
    description: 'Verified badge with a check mark for certifications and trust marks.',
    keywords: ['badge', 'verified', 'certified', 'check', 'trust', 'approval'],
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
    name: 'Clock',
    Component: Clock,
    description: 'Clock face for opening hours, schedules, and durations.',
    keywords: ['clock', 'time', 'hours', 'schedule', 'duration', 'opening'],
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
    name: 'Fingerprint',
    Component: Fingerprint,
    description: 'Fingerprint used for biometric and security features.',
    keywords: ['fingerprint', 'biometric', 'security', 'identity', 'touch id'],
  },
  {
    name: 'GraduationCap',
    Component: GraduationCap,
    description: 'Graduation cap for education, training, and credentials.',
    keywords: ['graduation', 'education', 'school', 'training', 'degree', 'academic'],
  },
  {
    name: 'Heart',
    Component: Heart,
    description: 'Heart used for favorites, care, and wellness themes.',
    keywords: ['heart', 'favorite', 'love', 'like', 'care', 'wellness'],
  },
  {
    name: 'Info',
    Component: Info,
    description: 'Information indicator for hints and contextual notes.',
    keywords: ['info', 'information', 'help', 'tooltip', 'hint'],
  },
  {
    name: 'KeyRound',
    Component: KeyRound,
    description: 'Round-headed key for access, credentials, and unlocking.',
    keywords: ['key', 'access', 'unlock', 'password', 'credential', 'security'],
  },
  {
    name: 'Mail',
    Component: Mail,
    description: 'Envelope for email addresses and contact channels.',
    keywords: ['mail', 'email', 'envelope', 'message', 'contact'],
  },
  {
    name: 'MapPin',
    Component: MapPin,
    description: 'Map pin for addresses, locations, and directions.',
    keywords: ['map', 'pin', 'location', 'address', 'place', 'directions'],
  },
  {
    name: 'Minus',
    Component: Minus,
    description: 'Subtractive symbol, often paired with `Plus` for steppers.',
    keywords: ['minus', 'subtract', 'remove', 'decrement', 'collapse'],
  },
  {
    name: 'Phone',
    Component: Phone,
    description: 'Telephone handset for phone numbers and call-us actions.',
    keywords: ['phone', 'call', 'telephone', 'contact', 'support'],
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
    name: 'ShieldCheck',
    Component: ShieldCheck,
    description: 'Shield with a check mark for safety and protection guarantees.',
    keywords: ['shield', 'security', 'safety', 'protection', 'verified', 'guarantee'],
  },
  {
    name: 'Smartphone',
    Component: Smartphone,
    description: 'Mobile phone for app and mobile-control features.',
    keywords: ['smartphone', 'phone', 'mobile', 'device', 'app'],
  },
  {
    name: 'Smile',
    Component: Smile,
    description: 'Smiling face for satisfaction and friendly service.',
    keywords: ['smile', 'happy', 'face', 'satisfaction', 'friendly', 'emoji'],
  },
  {
    name: 'Star',
    Component: Star,
    description: 'Five-pointed star for ratings and featured content.',
    keywords: ['star', 'rating', 'favorite', 'featured', 'review', 'quality'],
  },
  {
    name: 'Warning',
    Component: Warning,
    description: 'Triangle warning used for cautionary messages.',
    keywords: ['warning', 'caution', 'alert', 'attention'],
  },
] as const;