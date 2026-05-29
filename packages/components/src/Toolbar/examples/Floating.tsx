import { Button, Toolbar } from '@apx-ui/ds';

export default function Floating() {
  return (
    <div className="rounded-lg border border-border bg-bg-paper p-6">
      <p className="mb-6 text-sm text-fg-muted">
        Selected 3 items. A contextual action bar appears for batch operations — a common
        pattern in admin tables and file managers.
      </p>

      <Toolbar variant="floating" aria-label="Selection actions">
        <Button variant="ghost" aria-label="Edit">
          ✏️
        </Button>
        <Button variant="ghost" aria-label="Duplicate">
          📋
        </Button>
        <Toolbar.Separator />
        <Button variant="ghost" color="danger" aria-label="Delete">
          🗑
        </Button>
        <Toolbar.Spacer />
        <Button variant="solid" color="primary">
          Apply to selection
        </Button>
      </Toolbar>
    </div>
  );
}
