'use client';

import { useCallback, useEffect, useMemo, useRef } from 'react';

import { useControllableState } from '@apx-ui/engine';

import type { FileWithProgress, UseFileUploadOptions, UseFileUploadReturn } from '../FileUpload.types';
import { createPreviewUrl, revokeAllPreviewUrls, revokePreviewUrl } from './makePreviewUrl';
import { useUploadQueue } from './useUploadQueue';

let fileIdCounter = 0;

function nextFileId(): string {
  fileIdCounter += 1;
  return `file-${fileIdCounter}-${Date.now()}`;
}

function toFileWithProgress(file: File, showPreviews: boolean): FileWithProgress {
  const id = nextFileId();
  const previewUrl = showPreviews ? createPreviewUrl(file, id) : undefined;
  return {
    id,
    file,
    status: 'pending',
    progress: 0,
    ...(previewUrl ? { previewUrl } : {}),
  };
}

function normalizeIncoming(files: FileWithProgress[] | File[]): FileWithProgress[] {
  return files.map((item) => {
    if ('id' in item && 'status' in item) return item as FileWithProgress;
    return toFileWithProgress(item as File, true);
  });
}

export function useFileUpload(options: UseFileUploadOptions = {}): UseFileUploadReturn {
  const {
    files: filesProp,
    defaultFiles = [],
    onFilesChange,
    upload,
    autoUpload = true,
    parallelUploads = 3,
    onComplete,
    onError,
    showPreviews = true,
  } = options;

  const [filesState, setFilesState] = useControllableState<FileWithProgress[]>({
    value: filesProp,
    defaultValue: normalizeIncoming(defaultFiles),
    onChange: onFilesChange,
  });

  const files = filesState ?? [];

  const filesRef = useRef(files);
  filesRef.current = files;

  const setFiles = useCallback(
    (next: FileWithProgress[] | ((prev: FileWithProgress[]) => FileWithProgress[])) => {
      const resolved = typeof next === 'function' ? next(filesRef.current) : next;
      filesRef.current = resolved;
      setFilesState(resolved);
    },
    [setFilesState],
  );

  const getFile = useCallback((id: string) => filesRef.current.find((f) => f.id === id), []);

  const patchFile = useCallback(
    (
      id: string,
      patch: Partial<FileWithProgress> | ((prev: FileWithProgress) => FileWithProgress),
    ) => {
      setFiles((prev) =>
        prev.map((entry) => {
          if (entry.id !== id) return entry;
          return typeof patch === 'function' ? patch(entry) : { ...entry, ...patch };
        }),
      );
    },
    [setFiles],
  );

  const queueOptions = {
    parallelUploads,
    getFile,
    onProgress: (id: string, progress: number) => patchFile(id, { progress }),
    onStatus: (
      id: string,
      status: FileWithProgress['status'],
      patch?: Partial<Pick<FileWithProgress, 'error' | 'result' | 'progress'>>,
    ) => patchFile(id, { status, ...patch }),
    ...(upload ? { upload } : {}),
    ...(onComplete ? { onComplete } : {}),
    ...(onError ? { onError } : {}),
  };

  const { enqueue, cancel, drain } = useUploadQueue(queueOptions);

  const addFiles = useCallback(
    (newFiles: File[]) => {
      if (newFiles.length === 0) return;
      const created = newFiles.map((file) => toFileWithProgress(file, showPreviews));

      setFiles((prev) => [...prev, ...created]);

      if (autoUpload && upload) {
        for (const entry of created) enqueue(entry.id);
      }
    },
    [autoUpload, enqueue, setFiles, showPreviews, upload],
  );

  const removeFile = useCallback(
    (id: string) => {
      cancel(id);
      revokePreviewUrl(id);
      setFiles((prev) => prev.filter((entry) => entry.id !== id));
    },
    [cancel, setFiles],
  );

  const retryFile = useCallback(
    (id: string) => {
      patchFile(id, (prev) => {
        const { error: _removed, ...rest } = prev;
        return { ...rest, status: 'pending', progress: 0 };
      });
      enqueue(id);
    },
    [enqueue, patchFile],
  );

  const cancelFile = useCallback(
    (id: string) => {
      cancel(id);
    },
    [cancel],
  );

  const uploadFile = useCallback(
    (id: string) => {
      patchFile(id, { status: 'pending', progress: 0 });
      enqueue(id);
    },
    [enqueue, patchFile],
  );

  const uploadAll = useCallback(() => {
    for (const entry of filesRef.current) {
      if (entry.status === 'pending' || entry.status === 'error') {
        uploadFile(entry.id);
      }
    }
  }, [uploadFile]);

  const clear = useCallback(() => {
    drain();
    for (const entry of filesRef.current) revokePreviewUrl(entry.id);
    setFiles([]);
  }, [drain, setFiles]);

  useEffect(() => () => revokeAllPreviewUrls(), []);

  return useMemo(
    () => ({
      files,
      addFiles,
      removeFile,
      retryFile,
      cancelFile,
      uploadAll,
      uploadFile,
      clear,
    }),
    [
      addFiles,
      cancelFile,
      clear,
      files,
      removeFile,
      retryFile,
      uploadAll,
      uploadFile,
    ],
  );
}