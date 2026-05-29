'use client';

import {
  useCallback,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type DragEvent,
  type KeyboardEvent,
} from 'react';

import type {
  FileRejection,
  UseDropzoneOptions,
  UseDropzoneReturn,
} from '../FileUpload.types';
import { validateFile } from './validateFile';

function toAcceptList(accept: string | string[] | undefined): string | undefined {
  if (!accept) return undefined;
  return Array.isArray(accept) ? accept.join(',') : accept;
}

function processFiles(
  incoming: FileList | File[],
  options: UseDropzoneOptions,
): { accepted: File[]; rejected: FileRejection[] } {
  const files = Array.from(incoming);
  const accepted: File[] = [];
  const rejected: FileRejection[] = [];
  const maxFiles = options.maxFiles;
  const current = options.currentFileCount ?? 0;

  for (const file of files) {
    if (maxFiles != null && current + accepted.length >= maxFiles) {
      rejected.push({
        file,
        reason: 'count',
        message: `Maximum ${maxFiles} files allowed`,
      });
      continue;
    }

    const result = validateFile(file, {
      accept: options.accept,
      maxSize: options.maxSize,
      minSize: options.minSize,
      validator: options.validator,
    });

    if (!result.ok) {
      rejected.push({
        file,
        reason: result.reason === 'custom' ? 'custom' : result.reason,
        message: result.message,
      });
      continue;
    }

    accepted.push(file);
  }

  return { accepted, rejected };
}

export function useDropzone(options: UseDropzoneOptions = {}): UseDropzoneReturn {
  const {
    onDrop,
    onReject,
    accept,
    multiple = false,
    disabled = false,
    noClick = false,
    noKeyboard = false,
    noDragEventsBubbling = false,
  } = options;

  const inputRef = useRef<HTMLInputElement | null>(null);
  const dragCounterRef = useRef(0);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isDragReject, setIsDragReject] = useState(false);

  const open = useCallback(() => {
    if (disabled) return;
    inputRef.current?.click();
  }, [disabled]);

  const handleAccepted = useCallback(
    (files: File[], event: Event) => {
      if (files.length === 0) return;
      onDrop?.(files, event);
    },
    [onDrop],
  );

  const ingest = useCallback(
    (fileList: FileList | File[], event: Event) => {
      const { accepted, rejected } = processFiles(fileList, options);
      if (rejected.length > 0) onReject?.(rejected);
      handleAccepted(accepted, event);
    },
    [handleAccepted, onReject, options],
  );

  const onInputChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      const list = event.target.files;
      if (list && list.length > 0) ingest(list, event.nativeEvent);
      event.target.value = '';
    },
    [ingest],
  );

  const onDragEnter = useCallback(
    (event: DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      event.stopPropagation();
      if (disabled) return;
      dragCounterRef.current += 1;
      setIsDragOver(true);
      setIsDragReject(false);
    },
    [disabled],
  );

  const onDragLeave = useCallback(
    (event: DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      event.stopPropagation();
      if (disabled) return;
      dragCounterRef.current = Math.max(0, dragCounterRef.current - 1);
      if (dragCounterRef.current === 0) {
        setIsDragOver(false);
        setIsDragReject(false);
      }
    },
    [disabled],
  );

  const onDragOver = useCallback(
    (event: DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      event.stopPropagation();
      if (disabled) return;
      setIsDragOver(true);
    },
    [disabled],
  );

  const onDropHandler = useCallback(
    (event: DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      event.stopPropagation();
      if (disabled) return;
      dragCounterRef.current = 0;
      setIsDragOver(false);
      setIsDragReject(false);

      const items = event.dataTransfer?.files;
      if (!items || items.length === 0) {
        setIsDragReject(true);
        return;
      }

      const { accepted, rejected } = processFiles(items, options);
      if (accepted.length === 0 && rejected.length > 0) {
        setIsDragReject(true);
        onReject?.(rejected);
        return;
      }

      if (rejected.length > 0) onReject?.(rejected);
      handleAccepted(accepted, event.nativeEvent);
    },
    [disabled, handleAccepted, onReject, options],
  );

  const onKeyDown = useCallback(
    (event: KeyboardEvent<HTMLDivElement>) => {
      if (noKeyboard || disabled || noClick) return;
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        open();
      }
    },
    [disabled, noClick, noKeyboard, open],
  );

  const onClick = useCallback(() => {
    if (noClick || disabled) return;
    open();
  }, [disabled, noClick, open]);

  const rootProps = useMemo(
    () => ({
      role: 'button' as const,
      tabIndex: disabled ? -1 : 0,
      'aria-disabled': disabled || undefined,
      onDragEnter,
      onDragLeave,
      onDragOver,
      onDrop: onDropHandler,
      onKeyDown,
      onClick,
      ...(noDragEventsBubbling ? { 'data-no-drag-bubble': true } : {}),
    }),
    [
      disabled,
      noDragEventsBubbling,
      onClick,
      onDragEnter,
      onDragLeave,
      onDragOver,
      onDropHandler,
      onKeyDown,
    ],
  );

  const inputProps = useMemo(
    () => ({
      type: 'file' as const,
      accept: toAcceptList(accept),
      multiple,
      disabled,
      onChange: onInputChange,
      tabIndex: -1,
      'aria-hidden': true as const,
    }),
    [accept, disabled, multiple, onInputChange],
  );

  return {
    isDragOver,
    isDragReject,
    open,
    inputRef,
    rootProps,
    inputProps,
  };
}
