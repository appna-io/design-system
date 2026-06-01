'use client';

import { Children, createElement, isValidElement, useId, useMemo } from 'react';
import type { ReactElement, ReactNode } from 'react';

import { forwardRef } from '@apx-ui/engine';
import { useThemedClasses } from '@apx-ui/theme';

import { Button } from '../Button/Button';
import { Spinner } from '../Spinner/Spinner';

import { emptyStateRecipes } from './EmptyState.recipe';
import { EmptyStateContext } from './EmptyStateContext';
import { EmptyStateActions } from './EmptyStateActions';
import { EmptyStateDescription } from './EmptyStateDescription';
import { EmptyStateIcon } from './EmptyStateIcon';
import { EmptyStateIllustration } from './EmptyStateIllustration';
import { EmptyStateTitle } from './EmptyStateTitle';
import type {
  EmptyStateActionShortcut,
  EmptyStateAlign,
  EmptyStateProps,
  EmptyStateSize,
  EmptyStateVariant,
} from './EmptyState.types';

/**
 * Tags `EmptyState.*` subparts carry so the root can detect compound-children mode and skip the
 * prop-driven shortcut rendering. Stamped onto each subcomponent below.
 */
const SUBPART_TAG = Symbol.for('sds.empty-state.subpart');

type TaggedComponent = {
  [SUBPART_TAG]?: true;
};

/**
 * Root `<EmptyState />`. Two equivalent rendering modes:
 *
 * 1. **Prop-driven** — pass `icon` / `illustration` / `title` / `description` / `primaryAction` /
 *    `secondaryAction` and the root assembles the canonical layout (icon → title → description →
 *    actions). Covers the 80% case without any subcomponent imports.
 * 2. **Compound** — render `<EmptyState.Icon>` / `.Illustration` / `.Title` / `.Description` /
 *    `.Actions` as children for full control. When **any** compound child is detected, every
 *    prop-driven shortcut is ignored so the two modes never compete.
 *
 * The `variant` axis drives both the icon container tint **and** the root ARIA semantics:
 *
 * - `default` / `success` → `role="region"`, `aria-labelledby` → Title, `aria-describedby` → Description.
 * - `error`               → `role="alert"`. Wrapper is the live region; no aria-busy.
 * - `loading`             → `role="status"` + `aria-busy="true"` + `aria-live="polite"`. The
 *   icon slot auto-injects `<Spinner />` if the consumer hasn't provided their own icon /
 *   illustration / compound icon child.
 *
 * @example
 *   <EmptyState
 *     icon={<MailIcon />}
 *     title="Inbox zero"
 *     description="Nothing to do. Take a break."
 *   />
 *
 *   <EmptyState variant="loading" title="Loading workspace" description="This usually takes a few seconds." />
 *
 *   <EmptyState>
 *     <EmptyState.Illustration><MyIllustration /></EmptyState.Illustration>
 *     <EmptyState.Title>No users yet</EmptyState.Title>
 *     <EmptyState.Description>Invite your team to collaborate.</EmptyState.Description>
 *     <EmptyState.Actions>
 *       <Button onClick={openInvite}>Invite teammates</Button>
 *       <Button variant="ghost">Learn more</Button>
 *     </EmptyState.Actions>
 *   </EmptyState>
 */
export const EmptyStateRoot = forwardRef<HTMLElement, EmptyStateProps>(
  function EmptyState(props, ref) {
    const {
      variant,
      size,
      align,
      bordered,
      padded,
      as = 'section',
      icon,
      illustration,
      title,
      description,
      primaryAction,
      secondaryAction,
      className,
      style,
      sx,
      children,
      'aria-label': ariaLabelProp,
      'aria-labelledby': ariaLabelledByProp,
      'aria-describedby': ariaDescribedByProp,
      ...rest
    } = props;

    const resolvedVariant: EmptyStateVariant = resolveResponsive(variant, 'default');
    const resolvedSize: EmptyStateSize = resolveResponsive(size, 'md');
    const resolvedAlign: EmptyStateAlign = resolveResponsive(align, 'center');

    const { className: rootClass, style: rootStyle } = useThemedClasses({
      recipe: emptyStateRecipes.root,
      componentName: 'EmptyState',
      slot: 'root',
      props: {
        variant,
        size,
        align,
        bordered,
        padded,
        className,
        sx,
        style,
      },
    });

    const hasCompoundChildren = useMemo(() => detectCompoundChildren(children), [children]);

    // Stable IDs so we can wire `aria-labelledby` / `aria-describedby` to the auto-rendered
    // Title / Description slots. Skipped when consumer supplies their own IDs.
    const reactId = useId();
    const titleId = ariaLabelledByProp ?? `sds-empty-${reactId}-title`;
    const descriptionId = ariaDescribedByProp ?? `sds-empty-${reactId}-desc`;

    const showAutoTitle = !hasCompoundChildren && title != null;
    const showAutoDescription = !hasCompoundChildren && description != null;
    const willHaveActions =
      !hasCompoundChildren && (primaryAction != null || secondaryAction != null);

    // ARIA wiring — varies per variant. Only attach the *byId attributes when the
    // auto-rendered slot actually exists.
    const ariaAttrs = computeAriaAttrs({
      variant: resolvedVariant,
      ariaLabelProp,
      ariaLabelledByProp,
      ariaDescribedByProp,
      showAutoTitle,
      showAutoDescription,
      titleId,
      descriptionId,
    });

    const contextValue = useMemo(
      () => ({ size: resolvedSize, variant: resolvedVariant, align: resolvedAlign }),
      [resolvedSize, resolvedVariant, resolvedAlign],
    );

    const content = hasCompoundChildren
      ? children
      : renderShortcuts({
          variant: resolvedVariant,
          icon,
          illustration,
          title,
          titleId: showAutoTitle ? titleId : undefined,
          description,
          descriptionId: showAutoDescription ? descriptionId : undefined,
          primaryAction,
          secondaryAction,
          willHaveActions,
        });

    return (
      <EmptyStateContext.Provider value={contextValue}>
        {createElement(
          as,
          {
            ref,
            className: rootClass,
            style: rootStyle,
            'data-variant': resolvedVariant,
            'data-size': resolvedSize,
            ...ariaAttrs,
            ...rest,
          },
          content,
        )}
      </EmptyStateContext.Provider>
    );
  },
  'EmptyState',
);

/**
 * True when at least one direct child is an EmptyState subpart (tagged with our internal
 * `SUBPART_TAG` symbol). In that case the prop-driven shortcuts are silenced — the consumer
 * is in compound-mode and owns the entire content tree.
 */
function detectCompoundChildren(children: ReactNode): boolean {
  let detected = false;
  Children.forEach(children, (child) => {
    if (detected) return;
    if (!isValidElement(child)) return;
    const type = child.type as TaggedComponent;
    if (type && type[SUBPART_TAG]) {
      detected = true;
    }
  });
  return detected;
}

interface ShortcutRenderArgs {
  variant: EmptyStateVariant;
  icon: ReactNode;
  illustration: ReactNode;
  title: ReactNode;
  titleId: string | undefined;
  description: ReactNode;
  descriptionId: string | undefined;
  primaryAction: EmptyStateActionShortcut | undefined;
  secondaryAction: EmptyStateActionShortcut | undefined;
  willHaveActions: boolean;
}

function renderShortcuts(args: ShortcutRenderArgs): ReactElement | null {
  const {
    variant,
    icon,
    illustration,
    title,
    titleId,
    description,
    descriptionId,
    primaryAction,
    secondaryAction,
    willHaveActions,
  } = args;

  // Visual slot resolution. Illustration beats icon if both are present. Loading variant
  // auto-injects a Spinner when neither is supplied — gives the variant its "loading" feel
  // without forcing every caller to import Spinner just to use `variant="loading"`.
  const hasIllustration = illustration != null;
  const hasIcon = icon != null;
  const shouldAutoSpinner = variant === 'loading' && !hasIllustration && !hasIcon;

  const visualSlot = hasIllustration ? (
    <EmptyStateIllustration>{illustration}</EmptyStateIllustration>
  ) : hasIcon ? (
    <EmptyStateIcon>{icon}</EmptyStateIcon>
  ) : shouldAutoSpinner ? (
    <EmptyStateIcon>
      <Spinner size="md" />
    </EmptyStateIcon>
  ) : null;

  const titleSlot = title != null ? <EmptyStateTitle id={titleId}>{title}</EmptyStateTitle> : null;
  const descriptionSlot =
    description != null ? (
      <EmptyStateDescription id={descriptionId}>{description}</EmptyStateDescription>
    ) : null;
  const actionsSlot = willHaveActions ? (
    <EmptyStateActions>
      {primaryAction ? renderActionButton(primaryAction, 'primary') : null}
      {secondaryAction ? renderActionButton(secondaryAction, 'secondary') : null}
    </EmptyStateActions>
  ) : null;

  return (
    <>
      {visualSlot}
      {titleSlot}
      {descriptionSlot}
      {actionsSlot}
    </>
  );
}

/**
 * Render an action shortcut as a real `<Button>`. When `href` is set we route through Button's
 * `asChild` to render an `<a>` underneath — keeps the visual style but gets native link semantics
 * (right-click, modifier-click, etc.) for free.
 */
function renderActionButton(
  action: EmptyStateActionShortcut,
  position: 'primary' | 'secondary',
): ReactElement {
  const {
    label,
    href,
    target,
    rel,
    variant = position === 'primary' ? 'solid' : 'ghost',
    color = position === 'primary' ? 'primary' : 'neutral',
    onClick,
    ...buttonRest
  } = action;

  if (href != null) {
    // Build an autoRel only when the consumer didn't pass one explicitly — opens to a new tab
    // safely without surprising consumers who set their own `rel`.
    const autoRel = rel ?? (target === '_blank' ? 'noopener noreferrer' : undefined);
    return (
      <Button asChild variant={variant} color={color} {...buttonRest}>
        <a href={href} target={target} rel={autoRel}>
          {label}
        </a>
      </Button>
    );
  }

  return (
    <Button variant={variant} color={color} onClick={onClick} {...buttonRest}>
      {label}
    </Button>
  );
}

interface AriaArgs {
  variant: EmptyStateVariant;
  ariaLabelProp: string | undefined;
  ariaLabelledByProp: string | undefined;
  ariaDescribedByProp: string | undefined;
  showAutoTitle: boolean;
  showAutoDescription: boolean;
  titleId: string;
  descriptionId: string;
}

/**
 * Resolve the ARIA payload for the wrapper. Three rules, in order:
 *
 * 1. **Role** comes from the variant: `alert` / `status` / `region`.
 * 2. **`aria-busy` + `aria-live`** are present **only** under `loading`.
 * 3. **`aria-labelledby` / `aria-describedby`** point to the auto-rendered Title /
 *    Description **only when those slots are actually rendered** — pointing to an
 *    absent ID is an axe violation.
 *
 * Consumer-supplied `aria-label*` / `aria-describedby` always win (defensive fallback
 * already baked into the destructuring).
 */
function computeAriaAttrs(args: AriaArgs): Record<string, string | undefined> {
  const {
    variant,
    ariaLabelProp,
    ariaLabelledByProp,
    ariaDescribedByProp,
    showAutoTitle,
    showAutoDescription,
    titleId,
    descriptionId,
  } = args;

  const out: Record<string, string | undefined> = {};

  // Track whether the wrapper will have an accessible name. `role="region"` requires one — axe
  // (rule: `aria-allowed-role`) rejects a region landmark without a name, and a labelled
  // region in compound mode without any `aria-label*` is a hollow landmark anyway. So we only
  // attach `role="region"` for default / success when a name is actually present.
  const hasAccessibleName =
    ariaLabelProp != null || ariaLabelledByProp != null || showAutoTitle;

  if (variant === 'error') {
    out.role = 'alert';
  } else if (variant === 'loading') {
    out.role = 'status';
    out['aria-busy'] = 'true';
    out['aria-live'] = 'polite';
  } else if (hasAccessibleName) {
    out.role = 'region';
  }

  if (ariaLabelProp) {
    out['aria-label'] = ariaLabelProp;
  } else if (ariaLabelledByProp) {
    out['aria-labelledby'] = ariaLabelledByProp;
  } else if (showAutoTitle) {
    out['aria-labelledby'] = titleId;
  }

  if (ariaDescribedByProp) {
    out['aria-describedby'] = ariaDescribedByProp;
  } else if (showAutoDescription) {
    out['aria-describedby'] = descriptionId;
  }

  return out;
}

/**
 * Collapse a `ResponsiveValue<T>` down to its base breakpoint value. EmptyState context only
 * needs a single discrete value to flow into subparts; per-breakpoint layout still happens via
 * the Tailwind responsive utilities the recipe emits.
 */
function resolveResponsive<T>(value: T | { base?: T } | undefined, fallback: T): T {
  if (value == null) return fallback;
  if (typeof value === 'object' && value !== null && 'base' in value) {
    return (value as { base?: T }).base ?? fallback;
  }
  return value as T;
}

// Stamp each subpart so `detectCompoundChildren` can tell them apart from any other ReactNode.
// Safe to attach via `Object.assign` even on `forwardRef` exotics — React's element comparison
// uses reference identity on `type`, which we leave intact.
(EmptyStateIcon as TaggedComponent)[SUBPART_TAG] = true;
(EmptyStateIllustration as TaggedComponent)[SUBPART_TAG] = true;
(EmptyStateTitle as TaggedComponent)[SUBPART_TAG] = true;
(EmptyStateDescription as TaggedComponent)[SUBPART_TAG] = true;
(EmptyStateActions as TaggedComponent)[SUBPART_TAG] = true;