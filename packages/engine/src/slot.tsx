/**
 * Slot — a React primitive that merges its props onto its child instead of rendering its own
 * element. Powers the `asChild` pattern used by every DS component for polymorphism.
 *
 * Adapted from Radix UI's well-known Slot pattern (MIT). We re-implement it here rather than
 * depend on `@radix-ui/react-slot` so the engine has zero third-party React deps.
 */
import {
  Children,
  cloneElement,
  isValidElement,
  type CSSProperties,
  type HTMLAttributes,
  type ReactElement,
  type ReactNode,
  type Ref,
} from 'react';
import { cn } from './cn';
import { forwardRef } from './forwardRef';

type AnyProps = Record<string, unknown>;

/**
 * Props accepted by `Slot`. Intentionally NOT tied to any specific element type — the actual
 * rendered element is whatever child you pass. Ref is typed as `HTMLElement` so it accepts refs
 * to any concrete DOM element subclass.
 */
export interface SlotProps extends Omit<HTMLAttributes<HTMLElement>, 'style'> {
  children?: ReactNode;
  style?: CSSProperties | undefined;
}

/** Marker component used to designate the child that receives the Slot's merged props. */
export function Slottable({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
Slottable.displayName = 'Slottable';

function isSlottable(child: ReactNode): child is ReactElement {
  return isValidElement(child) && child.type === Slottable;
}

/**
 * Compose two ref values (functions or ref objects) into one. Both are called/written when the
 * resulting ref is assigned.
 */
function composeRefs<T>(...refs: Array<Ref<T> | undefined>) {
  return (node: T | null) => {
    for (const ref of refs) {
      if (!ref) continue;
      if (typeof ref === 'function') {
        ref(node);
      } else {
        try {
          (ref as { current: T | null }).current = node;
        } catch {
          /* ignore read-only refs */
        }
      }
    }
  };
}

/** Merge Slot-owned props onto the child's existing props. */
function mergeProps(slotProps: AnyProps, childProps: AnyProps): AnyProps {
  const merged: AnyProps = { ...childProps };

  for (const key of Object.keys(slotProps)) {
    const slotValue = slotProps[key];
    const childValue = childProps[key];

    if (key === 'children') {
      // Child's children win — Slot's children come from `<Slottable>` placement, not direct.
      continue;
    }

    if (/^on[A-Z]/.test(key) && typeof slotValue === 'function') {
      // Event handlers: call slot first, then child (so child can call preventDefault).
      if (typeof childValue === 'function') {
        merged[key] = (...args: unknown[]) => {
          (slotValue as (...a: unknown[]) => void)(...args);
          (childValue as (...a: unknown[]) => void)(...args);
        };
      } else {
        merged[key] = slotValue;
      }
      continue;
    }

    if (key === 'style') {
      merged[key] = { ...(slotValue as object), ...(childValue as object) };
      continue;
    }

    if (key === 'className') {
      merged[key] = cn(slotValue as string, childValue as string);
      continue;
    }

    // Default: child's prop wins if defined, else slot's.
    merged[key] = childValue !== undefined ? childValue : slotValue;
  }

  return merged;
}

interface SlotCloneProps extends AnyProps {
  children?: ReactNode;
}

const SlotClone = forwardRef<HTMLElement, SlotCloneProps>(function SlotClone(props, forwardedRef) {
  const { children, ...slotProps } = props;
  if (!isValidElement(children)) {
    return Children.count(children) > 1 ? Children.only(null) : null;
  }
  // React 19 puts ref on props; React 18 has it on `.ref`. Handle both.
  const childAny = children as ReactElement & { ref?: Ref<unknown>; props: AnyProps };
  const childRef = (childAny.props as { ref?: Ref<unknown> }).ref ?? childAny.ref;
  return cloneElement(children as ReactElement<AnyProps>, {
    ...mergeProps(slotProps, childAny.props),
    ref: forwardedRef ? composeRefs(forwardedRef as Ref<unknown>, childRef) : childRef,
  });
});

/**
 * Renders its props onto the single child element, merging className, style, event handlers,
 * and ref. If multiple top-level children are passed, one of them must be marked with
 * `<Slottable>` and the rest are rendered as siblings.
 */
export const Slot = forwardRef<HTMLElement, SlotProps>(function Slot(props, forwardedRef) {
  const { children, ...slotProps } = props;
  const arr = Children.toArray(children);
  const slottable = arr.find(isSlottable);

  if (slottable) {
    // Render the slottable's child as the merged element, keep the others as siblings.
    const newElement = (slottable as ReactElement<{ children?: ReactNode }>).props.children;
    const newChildren = arr.map((child) => {
      if (child === slottable) {
        if (Children.count(newElement) > 1) return Children.only(null);
        return isValidElement(newElement)
          ? (newElement as ReactElement<{ children?: ReactNode }>).props.children
          : null;
      }
      return child;
    });

    return (
      <SlotClone {...slotProps} ref={forwardedRef as Ref<HTMLElement>}>
        {isValidElement(newElement)
          ? cloneElement(
              newElement as ReactElement<{ children?: ReactNode }>,
              undefined,
              newChildren,
            )
          : null}
      </SlotClone>
    );
  }

  return (
    <SlotClone {...slotProps} ref={forwardedRef as Ref<HTMLElement>}>
      {children}
    </SlotClone>
  );
});
