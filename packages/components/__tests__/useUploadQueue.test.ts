import { act, renderHook, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import type { FileWithProgress } from '../src/FileUpload/FileUpload.types';
import { useUploadQueue } from '../src/FileUpload/headless/useUploadQueue';

function entry(id: string): FileWithProgress {
  return {
    id,
    file: new File(['x'], `${id}.txt`, { type: 'text/plain' }),
    status: 'pending',
    progress: 0,
  };
}

describe('useUploadQueue', () => {
  it('respects parallel upload cap', async () => {
    let running = 0;
    let maxRunning = 0;

    const files = new Map<string, FileWithProgress>([
      ['a', entry('a')],
      ['b', entry('b')],
      ['c', entry('c')],
      ['d', entry('d')],
    ]);

    const upload = vi.fn(async () => {
      running += 1;
      maxRunning = Math.max(maxRunning, running);
      await new Promise((resolve) => setTimeout(resolve, 20));
      running -= 1;
    });

    const onStatus = vi.fn();

    const { result } = renderHook(() =>
      useUploadQueue({
        upload,
        parallelUploads: 2,
        getFile: (id) => files.get(id),
        onProgress: vi.fn(),
        onStatus: (id, status) => {
          onStatus(id, status);
          const file = files.get(id);
          if (file) files.set(id, { ...file, status });
        },
      }),
    );

    act(() => {
      result.current.enqueue('a');
      result.current.enqueue('b');
      result.current.enqueue('c');
      result.current.enqueue('d');
    });

    await waitFor(() => expect(upload).toHaveBeenCalledTimes(4));
    expect(maxRunning).toBeLessThanOrEqual(2);
  });
});