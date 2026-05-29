import type {
  ComponentPropsWithoutRef,
  ComponentPropsWithRef,
  ElementType,
  ReactElement,
  Ref,
} from 'react';

/**
 * Polymorphic component types.
 *
 * Lets components be authored once and used as different intrinsic elements via the `as` prop:
 *
 *     <Box as="a" href="/" />
 *     <Box as="button" onClick={…} />
 *
 * Components built with `forwardRef` should pair this with `PolymorphicRef` for the second arg:
 *
 *     export const Box = forwardRef(
 *       <C extends ElementType = 'div'>(
 *         props: PolymorphicProps<C, { extra?: string }>,
 *         ref: PolymorphicRef<C>,
 *       ) => …
 *     );
 */

/** Ref type for a polymorphic component of element `C`. */
export type PolymorphicRef<C extends ElementType> = ComponentPropsWithRef<C>['ref'];

/** Props accepted by a polymorphic component. */
export type PolymorphicProps<C extends ElementType, P = object> = P &
  Omit<ComponentPropsWithoutRef<C>, keyof P | 'as'> & {
    as?: C;
  };

/** Full forwardRef-compatible signature for a polymorphic component with own props `P`. */
export type PolymorphicComponent<DefaultEl extends ElementType, P = object> = <
  C extends ElementType = DefaultEl,
>(
  props: PolymorphicProps<C, P> & { ref?: Ref<Element> },
) => ReactElement | null;
