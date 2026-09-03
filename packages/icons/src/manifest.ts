import { ArrowRight } from './icons/ArrowRight';
import { ArrowUpRight } from './icons/ArrowUpRight';
import { Award } from './icons/Award';
import { BadgeCheck } from './icons/BadgeCheck';
import { Check } from './icons/Check';
import { ChevronDown } from './icons/ChevronDown';
import { ChevronRight } from './icons/ChevronRight';
import { Clock } from './icons/Clock';
import { Close } from './icons/Close';
import { Coffee } from './icons/Coffee';
import { ErrorCircle } from './icons/ErrorCircle';
import { ExternalLink } from './icons/ExternalLink';
import { Fingerprint } from './icons/Fingerprint';
import { Flame } from './icons/Flame';
import { Globe } from './icons/Globe';
import { GraduationCap } from './icons/GraduationCap';
import { Heart } from './icons/Heart';
import { Info } from './icons/Info';
import { KeyRound } from './icons/KeyRound';
import { Leaf } from './icons/Leaf';
import { Mail } from './icons/Mail';
import { MapPin } from './icons/MapPin';
import { Menu } from './icons/Menu';
import { Minus } from './icons/Minus';
import { Phone } from './icons/Phone';
import { Plus } from './icons/Plus';
import { Repeat } from './icons/Repeat';
import { Scissors } from './icons/Scissors';
import { Search } from './icons/Search';
import { ShieldCheck } from './icons/ShieldCheck';
import { ShoppingBag } from './icons/ShoppingBag';
import { Smartphone } from './icons/Smartphone';
import { Smile } from './icons/Smile';
import { Star } from './icons/Star';
import { Trash } from './icons/Trash';
import { Truck } from './icons/Truck';
import { Warning } from './icons/Warning';
import { Zap } from './icons/Zap';
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
  /**
   * `true` when the glyph's meaning depends on reading order, so it mirrors under `dir="rtl"`
   * (see `createIcon`'s `directional` option).
   *
   * The bar is **semantic**, not visual. `ArrowRight` and `ChevronRight` mean "next / onward",
   * which is leftward in an RTL page — those mirror. `Search`, `Repeat` and `Scissors` merely
   * happen to have a handedness and mean the same thing either way; mirroring them is churn.
   * `ExternalLink` and `ArrowUpRight` are deliberately excluded too: their arrow points *out of
   * the page*, a fixed convention users recognise, not a position in the reading flow.
   */
  directional?: boolean;
}

export const ICON_MANIFEST: readonly IconManifestEntry[] = [
  {
    name: 'ArrowRight',
    Component: ArrowRight,
    description: 'Right-pointing arrow for forward navigation and inline CTAs.',
    keywords: ['arrow', 'right', 'next', 'forward', 'continue', 'cta'],
    directional: true,
  },
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
    directional: true,
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
    name: 'Coffee',
    Component: Coffee,
    description: 'Coffee cup for cafés, roasteries, and beverage menus.',
    keywords: ['coffee', 'cup', 'mug', 'cafe', 'drink', 'espresso', 'beans'],
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
    name: 'Flame',
    Component: Flame,
    description: 'Flame used for roast levels, heat, and trending content.',
    keywords: ['flame', 'fire', 'roast', 'heat', 'hot', 'trending'],
  },
  {
    name: 'Globe',
    Component: Globe,
    description: 'Globe for worldwide shipping, origins, and language pickers.',
    keywords: ['globe', 'world', 'international', 'shipping', 'origin', 'language'],
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
    name: 'Leaf',
    Component: Leaf,
    description: 'Leaf for organic, sustainable, and single-origin sourcing.',
    keywords: ['leaf', 'organic', 'plant', 'sustainable', 'natural', 'eco'],
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
    name: 'Menu',
    Component: Menu,
    description: 'Three-line hamburger that opens a compact navigation menu.',
    keywords: ['menu', 'hamburger', 'navigation', 'bars', 'drawer', 'more'],
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
    name: 'Repeat',
    Component: Repeat,
    description: 'Looping arrows for subscriptions, renewals, and recurring orders.',
    keywords: ['repeat', 'loop', 'subscription', 'recurring', 'renew', 'sync'],
  },
  {
    name: 'Scissors',
    Component: Scissors,
    description: 'Open shears for barbers, salons, grooming menus, and trim / cut actions.',
    keywords: ['scissors', 'shears', 'barber', 'salon', 'haircut', 'trim', 'cut', 'grooming'],
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
    name: 'ShoppingBag',
    Component: ShoppingBag,
    description: 'Shopping bag for carts, checkout, and commerce entry points.',
    keywords: ['shopping', 'bag', 'cart', 'basket', 'store', 'checkout', 'commerce'],
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
    name: 'Trash',
    Component: Trash,
    description: 'Trash can for destructive removal of an item.',
    keywords: ['trash', 'delete', 'remove', 'bin', 'discard'],
  },
  {
    name: 'Truck',
    Component: Truck,
    description: 'Delivery truck for shipping, dispatch, and fulfilment.',
    keywords: ['truck', 'shipping', 'delivery', 'dispatch', 'freight', 'fulfilment'],
  },
  {
    name: 'Warning',
    Component: Warning,
    description: 'Triangle warning used for cautionary messages.',
    keywords: ['warning', 'caution', 'alert', 'attention'],
  },
  {
    name: 'Zap',
    Component: Zap,
    description: 'Lightning bolt for speed, energy, and instant actions.',
    keywords: ['zap', 'lightning', 'bolt', 'fast', 'speed', 'energy', 'instant'],
  },
] as const;