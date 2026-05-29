import { cv } from '@apx-ui/engine';

/**
 * Recipe family for `<Rating />`. Five slots: wrapper (label + stars + helper text column),
 * track (the focusable row of stars), the per-star container, the per-star empty/filled layers,
 * and the trailing value text. Each is independently themable via
 * `theme.components.Rating.styleOverrides.<slot>`.
 *
 * Color tokens use the shipped Tailwind preset utilities (`text-warning`, `text-success`,
 * `border-border-default`, …) for consistency with shipped Skeleton / Spinner / EmptyState —
 * the plan's `text-(--sds-color-warning-emphasis)` syntax pre-dates the preset.
 */

const ratingWrapper = cv({
  base: 'inline-flex flex-col gap-1',
  variants: {
    fullWidth: {
      true: 'w-full',
      false: '',
    },
  },
  defaultVariants: { fullWidth: false },
});

const ratingLabel = cv({
  base: 'text-sm font-medium text-fg-default',
  variants: {
    hidden: {
      true: 'sr-only',
      false: '',
    },
    disabled: {
      true: 'opacity-60',
      false: '',
    },
  },
  defaultVariants: { hidden: false, disabled: false },
});

const ratingDescription = cv({
  base: 'text-xs text-fg-muted -mt-0.5',
});

const ratingTrack = cv({
  base: 'inline-flex items-center select-none outline-none rounded-md',
  variants: {
    size: {
      sm: 'gap-0.5',
      md: 'gap-1',
      lg: 'gap-1.5',
    },
    disabled: {
      true: 'opacity-50 cursor-not-allowed',
      false: '',
    },
    readOnly: {
      true: 'cursor-default',
      false:
        'cursor-pointer focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-focus',
    },
  },
  defaultVariants: { size: 'md', disabled: false, readOnly: false },
});

const ratingStar = cv({
  base: 'relative inline-flex items-center justify-center leading-none shrink-0',
  variants: {
    size: {
      sm: 'h-4 w-4 [&_svg]:h-4 [&_svg]:w-4',
      md: 'h-5 w-5 [&_svg]:h-5 [&_svg]:w-5',
      lg: 'h-7 w-7 [&_svg]:h-7 [&_svg]:w-7',
    },
  },
  defaultVariants: { size: 'md' },
});

const ratingStarEmpty = cv({
  base: 'absolute inset-0 inline-flex items-center justify-center text-border-default',
});

const ratingStarFilled = cv({
  base: 'absolute inset-0 inline-flex items-center justify-center',
  variants: {
    color: {
      warning: 'text-warning',
      primary: 'text-primary',
      success: 'text-success',
      danger: 'text-danger',
      neutral: 'text-fg-default',
    },
  },
  defaultVariants: { color: 'warning' },
});

const ratingValueText = cv({
  base: 'text-sm text-fg-muted tabular-nums ms-2',
});

const ratingHelperText = cv({
  base: 'text-xs',
  variants: {
    invalid: {
      true: 'text-danger',
      false: 'text-fg-muted',
    },
  },
  defaultVariants: { invalid: false },
});

export const ratingRecipes = {
  wrapper: ratingWrapper,
  label: ratingLabel,
  description: ratingDescription,
  track: ratingTrack,
  star: ratingStar,
  starEmpty: ratingStarEmpty,
  starFilled: ratingStarFilled,
  valueText: ratingValueText,
  helperText: ratingHelperText,
};
