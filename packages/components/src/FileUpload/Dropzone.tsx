'use client';

import { forwardRef } from 'react';

import type { DropzoneProps } from './FileUpload.types';
import { useDropzone } from './headless/useDropzone';

/**
 * Headless drag-and-drop receiver. Consumers style the drop area via the render-prop API.
 */
export const Dropzone = forwardRef<HTMLDivElement, DropzoneProps>(function Dropzone(
  { children, className, style, sx, ...options },
  ref,
) {
  const { isDragOver, isDragReject, open, rootProps, inputProps, inputRef } =
    useDropzone(options);

  return (
    <div ref={ref} {...rootProps} className={className} style={style}>
      {children({ isDragOver, isDragReject, open })}
      <input {...inputProps} ref={inputRef} className="sr-only" />
    </div>
  );
});

Dropzone.displayName = 'Dropzone';