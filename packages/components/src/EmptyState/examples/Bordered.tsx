import { EmptyState } from '@apx-ui/ds';

function FolderIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
    </svg>
  );
}

export default function Bordered() {
  return (
    <EmptyState
      bordered
      icon={<FolderIcon />}
      title="No files in this folder"
      description="Drop files here or use the upload button to add them."
      primaryAction={{
        label: 'Upload files',
        onClick: () => alert('Open file picker'),
      }}
    />
  );
}
