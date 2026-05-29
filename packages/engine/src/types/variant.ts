import type { ResponsiveValue } from './responsive';

/**
 * Map of values for a single variant axis to class strings.
 *
 * @example
 *   { sm: 'h-8 px-3', md: 'h-10 px-4', lg: 'h-12 px-6' }
 *   { true: 'w-full' }
 */
export type VariantValues = Record<string, string>;

/**
 * The shape of a variant config consumed by `cv`. All fields are optional except shape itself.
 */
export interface VariantConfig {
  /** Always-applied base classes. */
  base?: string;
  /** Map of variant axes (size, color, …) to value→class maps. */
  variants?: Record<string, VariantValues>;
  /**
   * Class strings applied only when every listed condition matches the resolved variant value
   * (or default).
   */
  compoundVariants?: CompoundVariant[];
  /** Default value per variant axis when the consumer doesn't pass one. */
  defaultVariants?: Record<string, string | boolean | undefined>;
}

/**
 * A compound variant entry. The non-`class`/`className` keys are conditions; if every condition
 * matches the resolved props, the `class` (or `className`) string is applied.
 */
export type CompoundVariant = Record<string, unknown> & {
  class?: string;
  className?: string;
};

/**
 * Helper that converts the variant config's value-keys into the prop type each axis accepts.
 * Boolean-keyed axes (`{ true: '…', false?: '…' }`) become `boolean`. Other axes become
 * string-literal unions. Every axis is also wrapped in `ResponsiveValue` so callers can pass
 * `{ base: 'sm', md: 'lg' }`.
 *
 * Accepts either the raw `VariantConfig` _or_ the `VariantFn` returned by `cv()`, so authors
 * can write `VariantProps<typeof buttonRecipe>` directly without re-typing the config.
 */
export type VariantProps<C extends VariantConfig | VariantFn<VariantConfig>> =
  C extends VariantFn<infer Inner>
    ? VariantPropsFromConfig<Inner>
    : C extends VariantConfig
      ? VariantPropsFromConfig<C>
      : never;

type VariantPropsFromConfig<C extends VariantConfig> = C extends { variants: infer V }
  ? {
      [K in keyof V]?: ResponsiveValue<VariantOptionsToProp<V[K]>> | undefined;
    } & { className?: string | undefined; class?: string | undefined }
  : { className?: string | undefined; class?: string | undefined };

type VariantOptionsToProp<V> =
  V extends Record<string, string>
    ? keyof V extends 'true' | 'false'
      ? boolean
      : keyof V extends string
        ? keyof V
        : never
    : never;

/** A function returned by `cv` that turns variant props into a class string. */
export type VariantFn<C extends VariantConfig> = (props?: VariantProps<C>) => string;
