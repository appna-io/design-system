import { useRef, type CSSProperties, type ReactNode, type RefObject } from 'react';
import { useFocusTrap, type UseFocusTrapOptions } from './useFocusTrap';

export interface FocusTrapProps extends UseFocusTrapOptions {
  children: ReactNode;
  /**
   * Optional className applied to the wrapper `<div>`. Most overlay components style their own
   * wrapper instead and use `useFocusTrap` directly with their own ref — but `<FocusTrap>` is the
   * one-line option for tests, examples, and overlays that don't need a custom container.
   */
  className?: string | undefined;
  style?: CSSProperties | undefined;
}

const wrapperStyleDefault: CSSProperties = {
  // Outline removed because the wrapper is non-interactive — its tabIndex is only there to
  // accept focus when there are no focusable descendants.
  outline: 'none',
};

/**
 * Component shorthand for `useFocusTrap`. Renders a `<div tabIndex={-1}>` wrapper so the trap has
 * a focusable fallback for empty overlays. For most overlay components you'll want to attach
 * `useFocusTrap` to your existing root element instead — this component is here for tests and
 * for one-off cases.
 */
export function FocusTrap({
  children,
  active,
  initialFocus,
  finalFocus,
  returnFocusOnDeactivate,
  className,
  style,
}: FocusTrapProps): ReactNode {
  const ref = useRef<HTMLDivElement>(null);
  useFocusTrap(ref as RefObject<HTMLElement | null>, {
    active,
    initialFocus,
    finalFocus,
    returnFocusOnDeactivate,
  });

  return (
    <div
      ref={ref}
      tabIndex={-1}
      className={className}
      style={{ ...wrapperStyleDefault, ...style }}
    >
      {children}
    </div>
  );
}