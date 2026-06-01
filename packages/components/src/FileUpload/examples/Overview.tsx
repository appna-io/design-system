'use client';

import { useMemo, useState } from 'react';

import { FileUpload, type FileWithProgress } from '@apx-ui/ds';

function makeMockFile(name: string, size: number, type: string): File {
  return new File(['x'.repeat(Math.min(size, 64))], name, { type, lastModified: Date.now() });
}

/**
 * Quick-review demo of `<FileUpload />` — a dropzone with a realistic list of already-uploaded
 * files so the selection UI and file-row chrome are visible at a glance.
 */
export default function Overview() {
  const initialFiles = useMemo<FileWithProgress[]>(
    () => [
      {
        id: 'overview-1',
        file: makeMockFile('Q4-financial-report.pdf', 2_457_600, 'application/pdf'),
        status: 'success',
        progress: 1,
      },
      {
        id: 'overview-2',
        file: makeMockFile('team-offsite-photo.jpg', 892_160, 'image/jpeg'),
        status: 'success',
        progress: 1,
      },
      {
        id: 'overview-3',
        file: makeMockFile('contract-draft-v3.docx', 524_288, 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'),
        status: 'success',
        progress: 1,
      },
    ],
    [],
  );

  const [files, setFiles] = useState(initialFiles);

  return (
    <FileUpload
      label="Project attachments"
      hint="PDF, images, or Word documents up to 10 MB"
      accept={['.pdf', 'image/*', '.docx']}
      multiple
      autoUpload={false}
      files={files}
      onFilesChange={setFiles}
    />
  );
}