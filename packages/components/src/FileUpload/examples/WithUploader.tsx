'use client';

import { FileUpload } from '../index';

export default function WithUploader() {
  return (
    <FileUpload
      label="Upload documents"
      accept={['image/png', 'image/jpeg', '.pdf']}
      multiple
      upload={async (file, { onProgress, signal }) => {
        const total = file.size || 1;
        for (let loaded = 0; loaded < total; loaded += total / 4) {
          if (signal.aborted) throw new DOMException('Aborted', 'AbortError');
          onProgress(Math.min(1, loaded / total));
          await new Promise((r) => setTimeout(r, 120));
        }
        onProgress(1);
      }}
    />
  );
}
