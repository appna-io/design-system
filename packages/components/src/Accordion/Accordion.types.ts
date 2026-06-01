import type { ButtonHTMLAttributes, CSSProperties, HTMLAttributes, ReactNode } from 'react';
import type { ResponsiveValue, Sx } from '@apx-ui/engine';

/**
 * Stylistic family for `<Accordion />`. Four "chrome" stories matching the rest of the
 * DS: bordered/segmented (`solid`), per-item card (`outline`), tinted (`soft`), and
 * chrome-less (`ghost`). Same vocabulary as Alert / Card / Badge so the consumer's
 * mental model carries from primitive to primitive.
 */
export type AccordionVariant = 'solid' | 'outline' | 'soft' | 'ghost';

export type AccordionSize = 'sm' | 'md' | 'lg';

/**
 * Full 7-color palette. Unlike Alert, Accordion is not a status surface — brand colors
 * (`primary`, `secondary`) are legitimate here for product-themed FAQ / disclosure lists.
 */
export type AccordionColor =
  | 'primary'
  | 'secondary'
  | 'success'
  | 'warning'
  | 'danger'
  | 'info'
  | 'neutral';

/** Logical chevron position. `end` is the convention (FAQ pages, settings panels). */
export type AccordionIconPosition = 'start' | 'end';

/**
 * Shared props common to both single-open and multi-open accordions. The `type`-specific
 * value / defaultValue / onValueChange triples live on the discriminated branches below
 * so consumers get tight inference: `type="multiple"` → `value: string[]`.
 */
export interface AccordionPropsBase {
  /**
   * In single mode (`type="single"`), allow closing the currently-open item by clicking
   * its trigger again. We default this to `true` — modern UX (FAQ pages, settings
   * disclosure groups) expects to close the open section. Radix defaults to `false`;
   * we differ deliberately.
   */
  collapsible?: boolean | undefined;
  /** Disable every item in the accordion. Per-item `disabled` overrides this. */
  disabled?: boolean | undefined;
  /** Stylistic family. @default 'solid' */
  variant?: ResponsiveValue<AccordionVariant> | undefined;
  /** Visual size axis (trigger padding + content padding + font + chevron). @default 'md' */
  size?: ResponsiveValue<AccordionSize> | undefined;
  /** Palette role driving hover tint / inline border / soft backgrounds. @default 'neutral' */
  color?: ResponsiveValue<AccordionColor> | undefined;
  /** Where the chevron sits relative to the label. @default 'end' */
  iconPosition?: AccordionIconPosition | undefined;
  /** Merged via `tailwind-merge`. Last-wins. */
  className?: string | undefined;
  /** Native CSS inline style. Useful for one-off measurements; prefer `sx` for theme tokens. */
  style?: CSSProperties | undefined;
  /** Theme-aware inline style object. */
  sx?: Sx | undefined;
  /** Identifier surfaced for testing / theme overrides; passes through to the wrapper `<div>`. */
  id?: string | undefined;
  children: ReactNode;
}

/**
 * Discriminated union on `type`. The single branch keeps `value` / `defaultValue` /
 * `onValueChange` as `string`; the multiple branch widens them to `string[]`. This is
 * the exact shape Radix UI ships — proven ergonomic at the call site.
 */
export type AccordionProps = AccordionPropsBase &
  (
    | {
        type?: 'single' | undefined;
        value?: string | undefined;
        defaultValue?: string | undefined;
        onValueChange?: ((value: string) => void) | undefined;
      }
    | {
        type: 'multiple';
        value?: string[] | undefined;
        defaultValue?: string[] | undefined;
        onValueChange?: ((value: string[]) => void) | undefined;
      }
  );

export interface AccordionItemProps extends HTMLAttributes<HTMLDivElement> {
  /** Unique key identifying this item — used to compute the open/closed state from `value`. */
  value: string;
  /** Disable just this item (overrides root `disabled={false}`; merges with root `disabled={true}`). */
  disabled?: boolean | undefined;
  /** Theme-aware inline style object. */
  sx?: Sx | undefined;
}

export interface AccordionTriggerProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'> {
  /**
   * Optional decorative icon rendered at the logical start of the trigger row. Always
   * `aria-hidden` — the label text carries the accessible name.
   */
  leftIcon?: ReactNode;
  /** Trigger label content — typically a string, but any inline ReactNode works. */
  children: ReactNode;
  /** Theme-aware inline style object. */
  sx?: Sx | undefined;
}

export interface AccordionContentProps extends HTMLAttributes<HTMLDivElement> {
  /** Theme-aware inline style object. */
  sx?: Sx | undefined;
}

/**
 * Context shape propagated from `<Accordion>` to its descendants. The non-responsive
 * shape carries only the resolved-at-base values that descendants need to compute their
 * own classes (size for chevron + content padding; variant + color for item compound
 * styling; iconPosition for chevron ordering; disabled for inheriting disable state).
 *
 * The set/value pair is exposed so each `<Accordion.Trigger>` can toggle its item's
 * membership without re-implementing the single/multiple bookkeeping.
 */
export interface AccordionRootContextValue {
  type: 'single' | 'multiple';
  value: string | string[];
  setValue: (next: string | string[]) => void;
  collapsible: boolean;
  disabled: boolean;
  variant: AccordionVariant;
  size: AccordionSize;
  color: AccordionColor;
  iconPosition: AccordionIconPosition;
  /** Stable id prefix for `aria-controls` / `aria-labelledby` pairing between triggers and contents. */
  baseId: string;
  /**
   * Each `<Accordion.Trigger>` calls this with its DOM element on mount/update and `null` on
   * unmount. The root keeps a `Map<value, HTMLButtonElement>` and uses it to (a) look up the
   * enabled triggers in document order for keyboard nav and (b) move focus on Arrow/Home/End.
   */
  registerTrigger: (value: string, element: HTMLButtonElement | null) => void;
  /** Returns the values of all currently-enabled triggers, sorted in DOM order. */
  getOrderedEnabledValues: () => string[];
  /** Move focus to the trigger associated with `value`. No-op if the value isn't registered. */
  focusValue: (value: string) => void;
}

/** Per-item context. Every subpart (`<Trigger>`, `<Content>`) reads `value` + `isOpen`. */
export interface AccordionItemContextValue {
  value: string;
  isOpen: boolean;
  disabled: boolean;
  triggerId: string;
  contentId: string;
}