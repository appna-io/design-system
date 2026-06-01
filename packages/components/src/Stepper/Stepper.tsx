'use client';

import { forwardRef } from '@apx-ui/engine';
import { useThemedClasses } from '@apx-ui/theme';
import {
  Children,
  Fragment,
  cloneElement,
  isValidElement,
  useMemo,
  type ReactElement,
  type ReactNode,
} from 'react';

import { StepperContext } from './StepperContext';
import { StepperStep, type StepperStepInternalProps } from './StepperStep';
import { renderIndicatorContent, renderStep } from './StepperStepRender';
import { stepperRecipes } from './Stepper.recipe';
import { isStepClickable, resolveConnectorStatus, resolveStepStatus } from './stepStatus';
import type {
  StepData,
  StepperContextValue,
  StepperOrientation,
  StepperProps,
  StepperSize,
  StepperVariant,
} from './Stepper.types';

const DEFAULT_ARIA_LABEL = 'Progress';

/**
 * Root `<Stepper>`. Two shapes share one DOM output:
 *
 *  1. **Array API** (`steps={…}`): the root walks the data, renders one `<Stepper.Step>`-shaped
 *     `<li>` per row, and weaves connector `<li>`s between them. Best for dynamic / fully
 *     data-driven wizards where every step is uniform.
 *  2. **Compound API** (`<Stepper.Step>` children): the root walks JSX children, registers each
 *     step's index through context, and the subpart renders itself. Best for wizards where one
 *     step needs custom inline content (e.g. an error message under the active step).
 *
 * Both paths land on the same `<ol role="list">` shape, so screen readers see one consistent
 * progression regardless of which API the consumer picked.
 *
 * The root **does not own routing or state** — `active` is always controlled by the consumer.
 * That matches the plan's "no internal next/prev/submit buttons" decision: Stepper is a
 * presentational primitive; the wizard buttons live in the consumer's flow.
 */
export const StepperRoot = forwardRef<HTMLOListElement, StepperProps>(function Stepper(props, ref) {
  const {
    active = 0,
    steps,
    variant = 'numbered',
    size,
    orientation,
    // Default to `center`: in horizontal mode the label sits centered under its indicator, which
    // is the modern norm (Linear / Vercel / Stripe). Vertical mode is force-aligned `start`
    // via a compound variant in the item recipe regardless of this prop, so the default is safe
    // across orientations. Consumers who want the old left-aligned look pass `align="start"`.
    align = 'center',
    showLabels = true,
    showDescriptions = true,
    clickable = false,
    linear = false,
    onStepClick,
    completedIcon,
    errorIcon,
    loadingIcon,
    connector,
    className,
    style,
    sx,
    'aria-label': ariaLabel = DEFAULT_ARIA_LABEL,
    children,
    ...rest
  } = props;

  const resolvedSize = resolveSize(size);
  const resolvedOrientation = resolveOrientation(orientation);
  const totalSteps = countSteps(steps, children);

  const { className: rootCls, style: rootStyle } = useThemedClasses({
    recipe: stepperRecipes.root,
    componentName: 'Stepper',
    slot: 'root',
    props: { orientation: resolvedOrientation, size: resolvedSize, className, sx, style },
  });

  const ctxValue = useMemo<StepperContextValue>(
    () => ({
      activeIndex: active,
      totalSteps,
      variant,
      size: resolvedSize,
      orientation: resolvedOrientation,
      align,
      showLabels,
      showDescriptions,
      clickable,
      linear,
      onStepClick,
      completedIcon,
      errorIcon,
      loadingIcon,
      connector,
    }),
    [
      active,
      totalSteps,
      variant,
      resolvedSize,
      resolvedOrientation,
      align,
      showLabels,
      showDescriptions,
      clickable,
      linear,
      onStepClick,
      completedIcon,
      errorIcon,
      loadingIcon,
      connector,
    ],
  );

  // Decide which rendering path to take. The array API wins if `steps` is provided — that's the
  // documented contract. Consumers who pass *both* `steps` and compound children probably made a
  // mistake; we silently prefer `steps` (and warn in dev) to keep behavior predictable.
  const usingArrayApi = steps !== undefined;
  if (process.env.NODE_ENV !== 'production' && usingArrayApi && Children.count(children) > 0) {
    console.warn(
      '[apx-dstepper> received both `steps` and children. The `steps` prop takes precedence; the children are ignored. Pick one API.',
    );
  }

  const content = usingArrayApi
    ? renderArrayApi(steps ?? [], {
        activeIndex: active,
        variant,
        size: resolvedSize,
        orientation: resolvedOrientation,
        align,
        showLabels,
        showDescriptions,
        clickable,
        linear,
        onStepClick,
        completedIcon,
        errorIcon,
        loadingIcon,
        connector,
      })
    : renderCompoundApi(children, {
        activeIndex: active,
        variant,
        size: resolvedSize,
        orientation: resolvedOrientation,
        connector,
      });

  return (
    <StepperContext.Provider value={ctxValue}>
      <ol
        ref={ref}
        aria-label={ariaLabel}
        data-orientation={resolvedOrientation}
        data-variant={variant}
        className={rootCls}
        style={rootStyle ?? undefined}
        {...rest}
      >
        {content}
      </ol>
    </StepperContext.Provider>
  );
}, 'Stepper');

interface ArrayRenderArgs {
  activeIndex: number;
  variant: StepperVariant;
  size: StepperSize;
  orientation: StepperOrientation;
  align: 'start' | 'center' | 'end';
  showLabels: boolean;
  showDescriptions: boolean;
  clickable: boolean | 'completed';
  linear: boolean;
  onStepClick: StepperProps['onStepClick'];
  completedIcon: ReactNode;
  errorIcon: ReactNode;
  loadingIcon: ReactNode;
  connector: ReactNode;
}

function renderArrayApi(steps: StepData[], args: ArrayRenderArgs): ReactNode {
  const nodes: ReactNode[] = [];
  const lastIndex = steps.length - 1;

  steps.forEach((step, index) => {
    const status = resolveStepStatus({
      index,
      activeIndex: args.activeIndex,
      explicit: step.status,
    });

    // `interactive` decides whether to wrap in a `<button>` shell at all. `clickable` decides
    // whether that button can fire. The split lets linear / completed-only modes show a full
    // row of focusable buttons while still rejecting clicks on the wrong steps (via `disabled`).
    const interactive = args.clickable !== false;
    nodes.push(
      <Fragment key={`step-${step.id}`}>
        {renderStep({
          key: step.id,
          id: step.id,
          index,
        label: step.label,
        description: step.description,
        icon: step.icon,
        disabled: step.disabled ?? false,
        content: step.content,
        status,
        variant: args.variant,
        size: args.size,
        orientation: args.orientation,
        align: args.align,
        showLabels: args.showLabels,
        showDescriptions: args.showDescriptions,
        interactive,
        clickable: isStepClickable({
          index,
          activeIndex: args.activeIndex,
          status,
          clickable: args.clickable,
          linear: args.linear,
          disabled: step.disabled ?? false,
        }),
          onStepClick: args.onStepClick,
          completedIcon: args.completedIcon,
          errorIcon: args.errorIcon,
          loadingIcon: args.loadingIcon,
          totalSteps: steps.length,
        })}
      </Fragment>,
    );

    if (index < lastIndex) {
      const connectorStatus = resolveConnectorStatus(status);
      nodes.push(
        <Fragment key={`connector-${step.id}`}>
          {renderConnector({
            key: `${step.id}-connector`,
            orientation: args.orientation,
            size: args.size,
            status: connectorStatus,
            override: args.connector,
          })}
        </Fragment>,
      );
    }
  });

  return nodes;
}

interface CompoundRenderArgs {
  activeIndex: number;
  variant: StepperVariant;
  size: StepperSize;
  orientation: StepperOrientation;
  connector: ReactNode;
}

function renderCompoundApi(children: ReactNode, args: CompoundRenderArgs): ReactNode {
  const arr = Children.toArray(children).filter(isValidElement) as ReactElement<StepperStepInternalProps>[];
  const lastIndex = arr.length - 1;
  const nodes: ReactNode[] = [];

  arr.forEach((child, index) => {
    // Inject the assigned index via cloneElement so `<Stepper.Step>` can resolve its own status
    // + clickability locally without a round-trip registry. The child's existing key is kept
    // when present; we wrap in a Fragment when the child is a primitive (which `isValidElement`
    // already filtered out, but TS doesn't narrow that far).
    const indexed = cloneElement(child, { __stepperIndex: index } as Partial<StepperStepInternalProps>);
    nodes.push(<Fragment key={child.key ?? `step-${index}`}>{indexed}</Fragment>);

    if (index < lastIndex) {
      // Connector status is derived from this step's status — the line "fills in" *as* the user
      // crosses it. Resolving here (rather than inside the subpart) keeps the connector layout
      // outside the subpart's `<li>`, which preserves the simple `<ol><li/><li/><li/></ol>` shape.
      const childProps = (child.props ?? {}) as StepperStepInternalProps;
      const childStatus = resolveStepStatus({
        index,
        activeIndex: args.activeIndex,
        explicit: childProps.status,
      });
      const connectorStatus = resolveConnectorStatus(childStatus);
      nodes.push(
        renderConnector({
          key: `connector-${index}`,
          orientation: args.orientation,
          size: args.size,
          status: connectorStatus,
          override: args.connector,
        }),
      );
    }
  });

  return nodes;
}

interface ConnectorRenderArgs {
  key: string;
  orientation: StepperOrientation;
  size: StepperSize;
  status: 'pending' | 'active' | 'complete' | 'error';
  override: ReactNode;
}

function renderConnector(args: ConnectorRenderArgs): ReactNode {
  if (args.override !== undefined) {
    return (
      <li
        key={args.key}
        role="presentation"
        aria-hidden="true"
        data-stepper-connector=""
        data-status={args.status}
      >
        {args.override}
      </li>
    );
  }

  return <ConnectorLi key={args.key} args={args} />;
}

function ConnectorLi({ args }: { args: ConnectorRenderArgs }) {
  const { className } = useThemedClasses({
    recipe: stepperRecipes.connector,
    componentName: 'Stepper',
    slot: 'connector',
    props: { orientation: args.orientation, size: args.size, status: args.status },
  });
  return (
    <li
      role="presentation"
      aria-hidden="true"
      data-stepper-connector=""
      data-status={args.status}
      className={className}
    />
  );
}

function countSteps(steps: StepData[] | undefined, children: ReactNode): number {
  if (steps) return steps.length;
  let count = 0;
  Children.forEach(children, (child) => {
    if (isValidElement(child)) count++;
  });
  return count;
}

function resolveOrientation(value: StepperProps['orientation']): StepperOrientation {
  if (value === undefined) return 'horizontal';
  if (typeof value === 'string') return value;
  if (typeof value === 'object') {
    const obj = value as Partial<Record<string, StepperOrientation>>;
    return obj.base ?? obj.sm ?? obj.md ?? obj.lg ?? 'horizontal';
  }
  return 'horizontal';
}

function resolveSize(value: StepperProps['size']): StepperSize {
  if (value === undefined) return 'md';
  if (typeof value === 'string') return value;
  if (typeof value === 'object') {
    const obj = value as Partial<Record<string, StepperSize>>;
    return obj.base ?? obj.sm ?? obj.md ?? obj.lg ?? 'md';
  }
  return 'md';
}

// Re-export `StepperStep` from the root file so consumers can import it as a peer without
// pulling the subpart-file path. Avoids an extra import line for tooling that prefers single-file
// imports.
export { StepperStep };
export { renderIndicatorContent };