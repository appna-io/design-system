import { cv } from '@apx-ui/engine';

const DROPZONE_FOCUS =
  'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring';

const COLOR_DRAG: Record<string, string> = {
  primary: 'border-primary-solid bg-primary-subtle/40',
  secondary: 'border-secondary-solid bg-secondary-subtle/40',
  success: 'border-success-solid bg-success-subtle/40',
  warning: 'border-warning-solid bg-warning-subtle/40',
  danger: 'border-danger-solid bg-danger-subtle/40',
  info: 'border-info-solid bg-info-subtle/40',
  neutral: 'border-neutral-solid bg-neutral-subtle/40',
};

const dragOverCompounds = Object.entries(COLOR_DRAG).map(([color, className]) => ({
  state: 'dragOver' as const,
  color,
  class: className,
}));

export const fileUploadRecipes = {
  root: cv({
    base: 'flex w-full gap-4',
    variants: {
      orientation: {
        vertical: 'flex-col',
        horizontal: 'flex-row items-start',
      },
    },
    defaultVariants: { orientation: 'vertical' },
  }),

  label: cv({
    base: 'mb-1 block font-medium text-fg-default',
    variants: {
      size: { sm: 'text-sm', md: 'text-sm', lg: 'text-base' },
    },
    defaultVariants: { size: 'md' },
  }),

  hint: cv({
    base: 'mt-1 text-fg-muted',
    variants: {
      size: { sm: 'text-xs', md: 'text-xs', lg: 'text-sm' },
    },
    defaultVariants: { size: 'md' },
  }),

  error: cv({
    base: 'mt-1 text-danger',
    variants: {
      size: { sm: 'text-xs', md: 'text-xs', lg: 'text-sm' },
    },
    defaultVariants: { size: 'md' },
  }),

  dropzone: cv({
    base: [
      'flex flex-col items-center justify-center gap-3 rounded-lg cursor-pointer',
      'transition-[background-color,border-color,opacity] duration-fast ease-standard',
      DROPZONE_FOCUS,
    ].join(' '),
    variants: {
      size: {
        sm: 'min-h-24 p-3',
        md: 'min-h-32 p-4',
        lg: 'min-h-40 p-6',
      },
      variant: {
        dashed: 'border-2 border-dashed border-border',
        solid: 'border border-border bg-bg-subtle',
        outline: 'border-2 border-border',
        minimal: 'bg-bg-subtle/40',
      },
      color: {
        primary: '',
        secondary: '',
        success: '',
        warning: '',
        danger: '',
        info: '',
        neutral: '',
      },
      state: {
        idle: '',
        dragOver: '',
        dragReject: 'border-danger-solid bg-danger-subtle/40',
        disabled: 'opacity-50 pointer-events-none cursor-not-allowed',
      },
    },
    compoundVariants: dragOverCompounds,
    defaultVariants: {
      size: 'md',
      variant: 'dashed',
      color: 'primary',
      state: 'idle',
    },
  }),

  prompt: cv({
    base: 'text-center text-fg-default',
    variants: {
      size: { sm: 'text-sm', md: 'text-base', lg: 'text-lg' },
    },
    defaultVariants: { size: 'md' },
  }),

  list: cv({
    base: 'flex flex-col gap-2 w-full',
    variants: {
      orientation: {
        vertical: 'mt-3',
        horizontal: '',
      },
    },
    defaultVariants: { orientation: 'vertical' },
  }),

  row: cv({
    base: 'flex items-center gap-3 rounded-md border border-border p-3',
    variants: {
      size: {
        sm: 'min-h-10',
        md: 'min-h-14',
        lg: 'min-h-[4.5rem]',
      },
    },
    defaultVariants: { size: 'md' },
  }),

  preview: cv({
    base: 'rounded-md object-cover shrink-0 bg-bg-subtle',
    variants: {
      size: { sm: 'size-8', md: 'size-11', lg: 'size-14' },
    },
    defaultVariants: { size: 'md' },
  }),

  name: cv({
    base: 'min-w-0 flex-1 truncate font-medium text-fg-default',
  }),

  meta: cv({
    base: 'text-xs text-fg-muted shrink-0',
  }),

  progress: cv({
    base: 'w-24 shrink-0',
  }),

  statusIcon: cv({
    base: 'shrink-0',
    variants: {
      status: {
        pending: 'text-fg-muted',
        uploading: 'text-primary-solid',
        success: 'text-success-solid',
        error: 'text-danger-solid',
        cancelled: 'text-fg-muted',
      },
    },
    defaultVariants: { status: 'pending' },
  }),

  actions: cv({
    base: 'ms-auto flex items-center gap-1 shrink-0',
  }),

  liveRegion: cv({
    base: 'sr-only',
  }),

  hiddenInput: cv({
    base: 'absolute size-px overflow-hidden whitespace-nowrap border-0 p-0 [-webkit-clip-path:inset(50%)] [clip-path:inset(50%)]',
  }),
};