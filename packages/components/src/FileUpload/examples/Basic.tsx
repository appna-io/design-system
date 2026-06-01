'use client';

import { useState } from 'react';

import { FileUpload, type FileWithProgress } from '../index';

export default function Basic() {
  const [files, setFiles] = useState<FileWithProgress[]>([]);

  return (
    <FileUpload
      label="Attachments"
      hint="Any file type"
      multiple
      onFilesChange={setFiles}
      files={files}
    />
  );
}