import type {
  CSSProperties,
  HTMLAttributes,
  InputHTMLAttributes,
  ReactNode,
  RefObject,
} from 'react';

import type { ResponsiveValue, Sx } from '@apx-ui/engine';

import type { ButtonColor, ButtonSize, ButtonVariant } from '../Button/Button.types';
import type { ProgressColor, ProgressSize } from '../Progress/Progress.types';

export type FileUploadVariant = 'dashed' | 'solid' | 'outline' | 'minimal';
export type FileUploadSize = 'sm' | 'md' | 'lg';
export type FileUploadColor = ButtonColor;
export type FileUploadOrientation = 'vertical' | 'horizontal';

export type FileUploadStatus =
  | 'pending'
  | 'uploading'
  | 'success'
  | 'error'
  | 'cancelled';

export interface FileWithProgress {
  id: string;
  file: File;
  status: FileUploadStatus;
  progress: number;
  error?: Error;
  result?: unknown;
  previewUrl?: string;
}

export type FileRejectionReason = 'size' | 'type' | 'count' | 'custom';

export interface FileRejection {
  file: File;
  reason: FileRejectionReason;
  message: string;
}

export type FileUploadValidator = (file: File) => string | null;

export interface FileUploadContext {
  onProgress: (progress: number) => void;
  signal: AbortSignal;
}

export type FileUploadFn = (
  file: File,
  ctx: FileUploadContext,
) => Promise<unknown>;

export interface FileUploadTranslations {
  dropzoneLabel: string;
  dropzonePromptIdle: string;
  dropzonePromptDragOver: string;
  dropzonePromptDragReject: string;
  browseButton: string;
  pasteHint: string;
  acceptedTypes: (types: string[]) => string;
  maxSizeHint: (max: string) => string;
  maxFilesHint: (max: number) => string;
  errorTooLarge: (max: string) => string;
  errorTooSmall: (min: string) => string;
  errorWrongType: string;
  errorTooManyFiles: (max: number) => string;
  status: {
    pending: string;
    uploading: string;
    success: string;
    error: string;
    cancelled: string;
  };
  uploadingFile: (name: string) => string;
  uploadComplete: (name: string) => string;
  uploadFailed: (name: string) => string;
  retry: string;
  cancel: string;
  remove: string;
  removeAll: string;
  uploadAll: string;
}

export interface UseDropzoneOptions {
  onDrop?: (files: File[], event: Event) => void;
  onReject?: (rejections: FileRejection[]) => void;
  accept?: string | string[] | undefined;
  multiple?: boolean | undefined;
  maxSize?: number | undefined;
  minSize?: number | undefined;
  maxFiles?: number | undefined;
  currentFileCount?: number | undefined;
  validator?: FileUploadValidator | undefined;
  disabled?: boolean | undefined;
  noClick?: boolean | undefined;
  noKeyboard?: boolean | undefined;
  noDragEventsBubbling?: boolean | undefined;
}

export interface UseDropzoneReturn {
  isDragOver: boolean;
  isDragReject: boolean;
  open: () => void;
  inputRef: RefObject<HTMLInputElement | null>;
  rootProps: HTMLAttributes<HTMLDivElement>;
  inputProps: InputHTMLAttributes<HTMLInputElement>;
}

export interface UseFileUploadOptions {
  files?: FileWithProgress[] | undefined;
  defaultFiles?: FileWithProgress[] | File[] | undefined;
  onFilesChange?: (files: FileWithProgress[]) => void;
  upload?: FileUploadFn | undefined;
  autoUpload?: boolean | undefined;
  parallelUploads?: number | undefined;
  onComplete?: (file: FileWithProgress, result: unknown) => void;
  onError?: (file: FileWithProgress, err: Error) => void;
  showPreviews?: boolean | undefined;
}

export interface UseFileUploadReturn {
  files: FileWithProgress[];
  addFiles: (newFiles: File[]) => void;
  removeFile: (id: string) => void;
  retryFile: (id: string) => void;
  cancelFile: (id: string) => void;
  uploadAll: () => void;
  uploadFile: (id: string) => void;
  clear: () => void;
}

export interface DropzoneRenderProps {
  isDragOver: boolean;
  isDragReject: boolean;
  open: () => void;
}

export interface DropzoneProps extends UseDropzoneOptions {
  children: (props: DropzoneRenderProps) => ReactNode;
  className?: string | undefined;
  style?: CSSProperties | undefined;
  sx?: Sx | undefined;
}

export interface FileUploadProps
  extends Omit<
      HTMLAttributes<HTMLDivElement>,
      'color' | 'defaultValue' | 'onDrop' | 'onError' | 'onSelect'
    >,
    UseDropzoneOptions,
    UseFileUploadOptions {
  variant?: ResponsiveValue<FileUploadVariant> | undefined;
  size?: ResponsiveValue<FileUploadSize> | undefined;
  color?: ResponsiveValue<FileUploadColor> | undefined;
  orientation?: FileUploadOrientation | undefined;
  showPreviews?: boolean | undefined;
  previewMaxDimension?: number | undefined;
  enablePaste?: boolean | undefined;
  disabled?: boolean | undefined;
  invalid?: boolean | undefined;
  label?: ReactNode | undefined;
  hint?: ReactNode | undefined;
  errorMessage?: ReactNode | undefined;
  name?: string | undefined;
  onSelect?: (files: File[]) => void;
  onComplete?: (file: FileWithProgress, result: unknown) => void;
  onError?: (file: FileWithProgress, err: Error) => void;
  className?: string | undefined;
  style?: CSSProperties | undefined;
  sx?: Sx | undefined;
  browseButtonVariant?: ButtonVariant | undefined;
  browseButtonSize?: ButtonSize | undefined;
  browseButtonColor?: ButtonColor | undefined;
  progressSize?: ProgressSize | undefined;
  progressColor?: ProgressColor | undefined;
}