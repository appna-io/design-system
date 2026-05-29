import { formatBytes } from './formatBytes';
import { matchAccept } from './matchAccept';

export type ValidateFileFailureReason = 'type' | 'size' | 'custom';

export type ValidateFileResult =
  | { ok: true }
  | { ok: false; reason: ValidateFileFailureReason; message: string };

export interface ValidateFileOptions {
  accept?: string | string[] | undefined;
  maxSize?: number | undefined;
  minSize?: number | undefined;
  validator?: ((file: File) => string | null) | undefined;
  locale?: string | undefined;
  messages?: {
    errorWrongType?: string | undefined;
    errorTooLarge?: ((max: string) => string) | undefined;
    errorTooSmall?: ((min: string) => string) | undefined;
  };
}

export function validateFile(file: File, opts: ValidateFileOptions): ValidateFileResult {
  const locale = opts.locale ?? 'en-US';
  const wrongType = opts.messages?.errorWrongType ?? 'File type is not allowed';
  const tooLarge =
    opts.messages?.errorTooLarge ?? ((max) => `File must be smaller than ${max}`);
  const tooSmall =
    opts.messages?.errorTooSmall ?? ((min) => `File must be at least ${min}`);

  if (opts.accept && !matchAccept(file, opts.accept)) {
    return { ok: false, reason: 'type', message: wrongType };
  }

  if (opts.maxSize != null && file.size > opts.maxSize) {
    return {
      ok: false,
      reason: 'size',
      message: tooLarge(formatBytes(opts.maxSize, locale)),
    };
  }

  if (opts.minSize != null && file.size < opts.minSize) {
    return {
      ok: false,
      reason: 'size',
      message: tooSmall(formatBytes(opts.minSize, locale)),
    };
  }

  if (opts.validator) {
    const custom = opts.validator(file);
    if (custom) return { ok: false, reason: 'custom', message: custom };
  }

  return { ok: true };
}
