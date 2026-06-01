import { EmptyState } from '@apx-ui/ds';

function FolderIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
    </svg>
  );
}

/**
 * Quick-review demo of `<EmptyState />` — a polished first-run surface with an icon,
 * guiding copy, and a primary call-to-action so the next step is obvious at a glance.
 */
export default function Overview() {
  return (
    <EmptyState
      icon={<FolderIcon />}
      title="No projects yet"
      description="Create your first project to start organizing files, tasks, and team members in one place."
      primaryAction={{
        label: 'Create project',
        onClick: () => {},
      }}
      secondaryAction={{
        label: 'Browse templates',
        href: '/templates',
        variant: 'ghost',
      }}
    />
  );
}