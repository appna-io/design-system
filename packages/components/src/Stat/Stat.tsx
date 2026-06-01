'use client';

import { Slot, forwardRef } from '@apx-ui/engine';
import { useThemedClasses } from '@apx-ui/theme';
import { ArrowDown, ArrowUp, Minus } from 'lucide-react';
import { Children, createElement, isValidElement, type ReactElement, type ReactNode } from 'react';

import { Spinner } from '../Spinner/Spinner';
import { StatContext, useStatContext } from './Stat.context';
import { deltaPresentation } from './deltaPresentation';
import { formatValue } from './formatValue';
import {
  statCaptionRecipe,
  statDeltaRecipe,
  statErrorRecipe,
  statExtraRecipe,
  statHeaderRecipe,
  statIconRecipe,
  statLabelRecipe,
  statRecipe,
  statValueRecipe,
} from './Stat.recipe';
import type {
  StatDelta as StatDeltaPayload,
  StatDeltaSubcomponentProps,
  StatProps,
  StatSubcomponentProps,
} from './Stat.types';

/* -------------------------------------------------------------------------- */
/*  Compound subcomponents                                                    */
/* -------------------------------------------------------------------------- */

/**
 * `Stat.Icon` — leading decorative icon. Always `aria-hidden` (the label carries semantics).
 * Picks its sizing from `<Stat>` context so the icon glyph scales with the parent's `size`.
 */
function StatIcon({ children, className, style }: StatSubcomponentProps): ReactElement {
  const { size } = useStatContext();
  const { className: iconClass } = useThemedClasses({
    recipe: statIconRecipe,
    componentName: 'Stat',
    slot: 'icon',
    props: { size, className },
  });
  return (
    <span aria-hidden="true" className={iconClass} style={style} data-stat-icon>
      {children}
    </span>
  );
}
StatIcon.displayName = 'Stat.Icon';

/**
 * `Stat.Label` — the metric's caption. Rendered as a `<span>` by default; consumers wrapping
 * the Stat in a `<dl>` can swap it for `<dt>` via `<Stat.Label as="dt">` once we add the
 * polymorphic `as` prop (post-V1).
 */
function StatLabel({ children, className, style }: StatSubcomponentProps): ReactElement {
  const { size } = useStatContext();
  const { className: labelClass } = useThemedClasses({
    recipe: statLabelRecipe,
    componentName: 'Stat',
    slot: 'label',
    props: { size, className },
  });
  return (
    <span className={labelClass} style={style} data-stat-label>
      {children}
    </span>
  );
}
StatLabel.displayName = 'Stat.Label';

/** `Stat.Value` — the big number. `tabular-nums` keeps digits from wobbling on update. */
function StatValue({ children, className, style }: StatSubcomponentProps): ReactElement {
  const { size } = useStatContext();
  const { className: valueClass } = useThemedClasses({
    recipe: statValueRecipe,
    componentName: 'Stat',
    slot: 'value',
    props: { size, tone: 'neutral', className },
  });
  return (
    <span className={valueClass} style={style} data-stat-value>
      {children}
    </span>
  );
}
StatValue.displayName = 'Stat.Value';

/**
 * `Stat.Delta` — trend chip. Color + arrow are derived from `direction` (and `inverse` for
 * inverted metrics like churn). Consumer can override the visible string via `label` but the
 * arrow + accessible text still come from the direction so screen-reader announcements stay
 * consistent.
 */
/**
 * Shared delta-chip renderer used by both the prop-driven Stat root and the compound
 * `Stat.Delta` subcomponent. Resolves the arrow glyph from `presentation.arrow`, emits the
 * sign+magnitude visually (aria-hidden), and pairs it with an sr-only sentence so screen
 * readers announce "up 12.3%" rather than reading the raw `+12.3%` characters.
 */
function DeltaChip({
  presentation,
  className,
  direction,
  style,
}: {
  presentation: ReturnType<typeof deltaPresentation>;
  className: string;
  direction: StatDeltaPayload['direction'];
  style?: React.CSSProperties;
}): ReactElement {
  const ArrowIcon =
    presentation.arrow === 'up' ? ArrowUp : presentation.arrow === 'down' ? ArrowDown : Minus;
  return (
    <span
      className={className}
      style={style}
      data-stat-delta=""
      data-tone={presentation.tone}
      data-direction={direction}
    >
      <ArrowIcon aria-hidden="true" className="size-3.5 shrink-0" />
      <span aria-hidden="true">{presentation.formatted}</span>
      <span className="sr-only">{presentation.ariaText}</span>
    </span>
  );
}

function StatDelta({
  value,
  direction,
  label,
  suffix,
  inverse,
  className,
  style,
}: StatDeltaSubcomponentProps): ReactElement {
  const { size } = useStatContext();
  const deltaInput: StatDeltaPayload = {
    value,
    direction,
    ...(label !== undefined ? { label } : {}),
    ...(suffix !== undefined ? { suffix } : {}),
    ...(inverse !== undefined ? { inverse } : {}),
  };
  const presentation = deltaPresentation(deltaInput, inverse ?? false);
  const { className: chipClass } = useThemedClasses({
    recipe: statDeltaRecipe,
    componentName: 'Stat',
    slot: 'delta',
    props: { size, tone: presentation.tone, className },
  });

  return (
    <DeltaChip
      presentation={presentation}
      className={chipClass}
      direction={direction}
      {...(style !== undefined ? { style } : {})}
    />
  );
}
StatDelta.displayName = 'Stat.Delta';

function StatCaption({ children, className, style }: StatSubcomponentProps): ReactElement {
  const { size } = useStatContext();
  const { className: captionClass } = useThemedClasses({
    recipe: statCaptionRecipe,
    componentName: 'Stat',
    slot: 'caption',
    props: { size, className },
  });
  return (
    <span className={captionClass} style={style} data-stat-caption>
      {children}
    </span>
  );
}
StatCaption.displayName = 'Stat.Caption';

/** Set of subcomponent functions used to detect compound-mode children. */
const STAT_SUBCOMPONENTS = new Set<unknown>([
  StatIcon,
  StatLabel,
  StatValue,
  StatDelta,
  StatCaption,
]);

/** Walks direct children and returns `true` if any one is a `Stat.*` subcomponent. */
function hasStatSubcomponent(children: ReactNode): boolean {
  let found = false;
  Children.forEach(children, (child) => {
    if (found) return;
    if (isValidElement(child) && STAT_SUBCOMPONENTS.has(child.type as unknown)) {
      found = true;
    }
  });
  return found;
}

/* -------------------------------------------------------------------------- */
/*  Stat root                                                                 */
/* -------------------------------------------------------------------------- */

/**
 * `<Stat />` — the canonical dashboard metric tile.
 *
 * **Two APIs under one component.** The prop-driven form (`label`, `value`, `delta`, …) covers
 * 90% of dashboards in ~one line. When a consumer needs full control (e.g. inserting custom
 * markup between value and delta), they can pass `Stat.Icon` / `Stat.Label` / `Stat.Value` /
 * `Stat.Delta` / `Stat.Caption` as children and Stat auto-detects compound mode, ignoring the
 * shortcut props. The two modes are mutually exclusive at runtime.
 *
 * **Numeric formatting** runs through {@link formatValue}, which routes numbers through
 * `Intl.NumberFormat` according to `format` / `currency` / `fractionDigits` / `locale`. Strings
 * and ReactNodes pass through unchanged so pre-formatted values still render correctly.
 *
 * **Trend deltas** are structured (`{ value, direction, inverse? }`) so Stat owns the color
 * (success / danger / neutral), the arrow glyph, and the screen-reader announcement. Inverse
 * metrics (churn going down is good) flip the tone without breaking the icon/text contract.
 *
 * **Loading + error** are first-class states. `loading` swaps the value for a `<Spinner>` and
 * marks `aria-busy="true"`. `error` swaps the value for an `role="alert"` region. Both keep the
 * label visible so the user always knows what's being measured.
 *
 * @example
 *   <Stat label="Revenue" value={12400} format="currency" currency="USD" />
 *
 *   <Stat
 *     label="Active users"
 *     value={1240}
 *     delta={{ value: 12.3, direction: 'up' }}
 *     caption="vs last week"
 *   />
 *
 *   <Stat label="Churn" value={0.042} format="percent" delta={{ value: 1.1, direction: 'down', inverse: true }} />
 *
 *   <StatGroup direction="row" divider gap={6}>
 *     <Stat label="Revenue" value={12400} format="currency" />
 *     <Stat label="Orders"  value={47} />
 *     <Stat label="Conv."   value={0.214} format="percent" />
 *   </StatGroup>
 */
function StatImpl(props: StatProps, ref: React.ForwardedRef<HTMLElement>): ReactElement {
  const {
    label,
    value,
    caption,
    icon,
    delta,
    format = 'auto',
    currency = 'USD',
    fractionDigits,
    locale,
    variant = 'default',
    size = 'md',
    align = 'start',
    colorize = 'auto',
    loading = false,
    error,
    children,
    as,
    asChild = false,
    className,
    style,
    sx,
    ...rest
  } = props;

  const { className: rootClass, style: rootStyle } = useThemedClasses({
    recipe: statRecipe,
    componentName: 'Stat',
    props: { variant, size, align, className, sx, style },
  });

  const { className: headerClass } = useThemedClasses({
    recipe: statHeaderRecipe,
    componentName: 'Stat',
    slot: 'header',
    props: { size },
  });

  // The value tone bleeds onto the value text only when `colorize="auto"` AND a delta is set
  // AND the delta resolved to a positive/negative tone. `colorize="never"` keeps the value in
  // the default fg color regardless of trend direction.
  const presentedDelta = delta ? deltaPresentation(delta, delta.inverse ?? false) : undefined;
  const valueTone =
    colorize === 'auto' && presentedDelta && presentedDelta.tone !== 'neutral'
      ? presentedDelta.tone
      : 'neutral';

  const { className: valueClass } = useThemedClasses({
    recipe: statValueRecipe,
    componentName: 'Stat',
    slot: 'value',
    props: { size, tone: valueTone },
  });

  const { className: deltaClass } = useThemedClasses({
    recipe: statDeltaRecipe,
    componentName: 'Stat',
    slot: 'delta',
    props: { size, tone: presentedDelta?.tone ?? 'neutral' },
  });

  const { className: iconClass } = useThemedClasses({
    recipe: statIconRecipe,
    componentName: 'Stat',
    slot: 'icon',
    props: { size },
  });

  const { className: labelClass } = useThemedClasses({
    recipe: statLabelRecipe,
    componentName: 'Stat',
    slot: 'label',
    props: { size },
  });

  const { className: captionClass } = useThemedClasses({
    recipe: statCaptionRecipe,
    componentName: 'Stat',
    slot: 'caption',
    props: { size },
  });

  const { className: errorClass } = useThemedClasses({
    recipe: statErrorRecipe,
    componentName: 'Stat',
    slot: 'error',
    props: {},
  });

  const { className: extraClass } = useThemedClasses({
    recipe: statExtraRecipe,
    componentName: 'Stat',
    slot: 'extra',
    props: {},
  });

  // Compound mode: any direct child is one of our Stat.* subcomponents. In that case the
  // prop-driven shortcuts (`label`, `value`, `delta`, `caption`, `icon`) are intentionally
  // ignored — the consumer opted in to manual composition.
  const isCompound = hasStatSubcomponent(children);

  // Synthesise an aria-label for the prop-driven form so the whole tile announces in one go:
  // "Revenue, $12,400, up 12.3%". Compound mode leaves the children to handle their own
  // semantics — we don't second-guess the consumer's chosen layout.
  const formattedValue = !isCompound
    ? formatValue({
        value,
        format,
        currency,
        ...(fractionDigits !== undefined ? { fractionDigits } : {}),
        ...(locale !== undefined ? { locale } : {}),
      })
    : undefined;

  const ariaLabelParts: string[] = [];
  if (!isCompound) {
    if (typeof label === 'string') ariaLabelParts.push(label);
    if (typeof formattedValue === 'string' || typeof formattedValue === 'number') {
      ariaLabelParts.push(String(formattedValue));
    }
    if (presentedDelta) ariaLabelParts.push(presentedDelta.ariaText);
  }
  const ariaLabel = ariaLabelParts.length > 0 ? ariaLabelParts.join(', ') : undefined;

  // Render-time content selection:
  //   loading → Spinner + sr-only "Loading"
  //   error   → role="alert" with message
  //   value   → formatted value (string/number) or ReactNode passthrough
  // The label stays visible in every state so the user always knows what the tile measures.
  const renderValueRegion = (): ReactNode => {
    if (loading) {
      return (
        <span className={valueClass} data-stat-value data-loading="true">
          <Spinner
            size={size === 'lg' ? 'md' : 'sm'}
            label="Loading"
            labelPlacement="hidden"
          />
        </span>
      );
    }
    if (error !== undefined) {
      return (
        <span
          role="alert"
          className={errorClass}
          data-stat-error
        >
          {error}
        </span>
      );
    }
    return (
      <span
        className={valueClass}
        data-stat-value=""
        data-tone={valueTone}
      >
        {formattedValue}
      </span>
    );
  };

  const renderPropBody = (): ReactNode => (
    <>
      {(icon || label) && (
        <div className={headerClass} data-stat-header>
          {icon ? (
            <span aria-hidden="true" className={iconClass} data-stat-icon>
              {icon}
            </span>
          ) : null}
          {label !== undefined && label !== null && label !== false && label !== '' ? (
            <span className={labelClass} data-stat-label="">
              {label}
            </span>
          ) : null}
        </div>
      )}

      {renderValueRegion()}

      {delta && !loading && error === undefined ? (
        <DeltaChip
          presentation={presentedDelta!}
          className={deltaClass}
          direction={delta.direction}
        />
      ) : null}

      {caption ? (
        <span className={captionClass} data-stat-caption>
          {caption}
        </span>
      ) : null}

      {children ? (
        <div className={extraClass} data-stat-extra>
          {children}
        </div>
      ) : null}
    </>
  );

  const renderCompoundBody = (): ReactNode => (
    <>
      {children}
    </>
  );

  const content = (
    <StatContext.Provider value={{ size, colorize }}>
      {isCompound ? renderCompoundBody() : renderPropBody()}
    </StatContext.Provider>
  );

  const rootProps: Record<string, unknown> = {
    ref,
    className: rootClass,
    style: rootStyle ?? undefined,
    'data-stat': '',
    'data-variant': variant,
    'data-size': size,
    'data-align': align,
    ...rest,
  };

  if (loading) {
    rootProps['aria-busy'] = true;
    rootProps.role = (rest as { role?: string }).role ?? 'status';
  } else if (ariaLabel && !isCompound) {
    rootProps['aria-label'] = (rest as { 'aria-label'?: string })['aria-label'] ?? ariaLabel;
  }

  if (asChild) {
    return (
      <Slot {...(rootProps as Record<string, unknown>)}>
        {content as ReactElement}
      </Slot>
    );
  }

  return createElement(as ?? 'div', rootProps, content);
}

/** Forward-ref wrapper. Subcomponents are attached as static properties below. */
const StatBase = forwardRef<HTMLElement, StatProps>(StatImpl, 'Stat');

export const Stat = Object.assign(StatBase, {
  Icon: StatIcon,
  Label: StatLabel,
  Value: StatValue,
  Delta: StatDelta,
  Caption: StatCaption,
});

export type StatComponent = typeof Stat;