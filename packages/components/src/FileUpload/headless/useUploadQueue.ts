'use client';

import { useCallback, useEffect, useRef } from 'react';

import type { FileUploadFn, FileWithProgress } from '../FileUpload.types';

export interface UseUploadQueueOptions {
  upload?: FileUploadFn | undefined;
  parallelUploads?: number | undefined;
  onProgress: (id: string, progress: number) => void;
  onStatus: (
    id: string,
    status: FileWithProgress['status'],
    patch?: Partial<Pick<FileWithProgress, 'error' | 'result' | 'progress'>>,
  ) => void;
  onComplete?: (file: FileWithProgress, result: unknown) => void;
  onError?: (file: FileWithProgress, err: Error) => void;
  getFile: (id: string) => FileWithProgress | undefined;
}

export interface UseUploadQueueReturn {
  enqueue: (id: string) => void;
  cancel: (id: string) => void;
  drain: () => void;
}

/**
 * Parallel upload scheduler — caps in-flight uploads and re-queues on retry.
 */
export function useUploadQueue(options: UseUploadQueueOptions): UseUploadQueueReturn {
  const {
    upload,
    parallelUploads = 3,
    onProgress,
    onStatus,
    onComplete,
    onError,
    getFile,
  } = options;

  const pendingRef = useRef<string[]>([]);
  const runningRef = useRef<Map<string, AbortController>>(new Map());
  const uploadRef = useRef(upload);
  uploadRef.current = upload;

  const pump = useCallback(() => {
    const fn = uploadRef.current;
    if (!fn) return;

    while (runningRef.current.size < parallelUploads && pendingRef.current.length > 0) {
      const id = pendingRef.current.shift();
      if (!id) break;

      const entry = getFile(id);
      if (!entry || entry.status === 'cancelled') continue;

      const controller = new AbortController();
      runningRef.current.set(id, controller);
      onStatus(id, 'uploading', { progress: 0 });

      fn(entry.file, {
        signal: controller.signal,
        onProgress: (progress) => onProgress(id, progress),
      })
        .then((result) => {
          if (controller.signal.aborted) return;
          onStatus(id, 'success', { progress: 1, result });
          const latest = getFile(id);
          if (latest) onComplete?.(latest, result);
        })
        .catch((err: unknown) => {
          if (controller.signal.aborted) {
            onStatus(id, 'cancelled');
            return;
          }
          const error = err instanceof Error ? err : new Error(String(err));
          onStatus(id, 'error', { error });
          const latest = getFile(id);
          if (latest) onError?.(latest, error);
        })
        .finally(() => {
          runningRef.current.delete(id);
          pump();
        });
    }
  }, [getFile, onComplete, onError, onProgress, onStatus, parallelUploads]);

  const enqueue = useCallback(
    (id: string) => {
      if (!uploadRef.current) return;
      if (pendingRef.current.includes(id)) return;
      if (runningRef.current.has(id)) return;
      pendingRef.current.push(id);
      pump();
    },
    [pump],
  );

  const cancel = useCallback(
    (id: string) => {
      pendingRef.current = pendingRef.current.filter((queued) => queued !== id);
      const controller = runningRef.current.get(id);
      if (controller) {
        controller.abort();
        runningRef.current.delete(id);
      }
      onStatus(id, 'cancelled');
    },
    [onStatus],
  );

  const drain = useCallback(() => {
    for (const controller of runningRef.current.values()) {
      controller.abort();
    }
    runningRef.current.clear();
    pendingRef.current = [];
  }, []);

  useEffect(() => () => drain(), [drain]);

  return { enqueue, cancel, drain };
}
